import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { classifyFeedback } from "@/lib/ai";
import { generateEmbedding } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuthUser(["ADMIN", "ANALYST"]);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    const feedback = await prisma.feedback.findFirst({
      where: {
        id,
        workspaceId: user!.workspaceId,
      },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    // Available themes in workspace
    const workspaceThemes = await prisma.theme.findMany({
      where: { workspaceId: user!.workspaceId },
    });
    const themeNames = workspaceThemes.map((t) => t.name);

    // Run AI classification
    const classification = await classifyFeedback(feedback.content, themeNames);

    // Update feedback record
    await prisma.feedback.update({
      where: { id: feedback.id },
      data: {
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
        featureArea: classification.featureArea,
        rationale: classification.rationale,
      },
    });

    // Remove existing themes and link newly classified ones
    await prisma.feedbackTheme.deleteMany({
      where: { feedbackId: feedback.id },
    });

    for (const themeName of classification.themes) {
      const matched = workspaceThemes.find(
        (t) => t.name.toLowerCase() === themeName.toLowerCase()
      );
      if (matched) {
        await prisma.feedbackTheme.create({
          data: {
            feedbackId: feedback.id,
            themeId: matched.id,
            confidence: 0.95,
          },
        });
      }
    }

    // Refresh embedding
    const vector = generateEmbedding(feedback.content);
    await prisma.embedding.upsert({
      where: { feedbackId: feedback.id },
      create: {
        feedbackId: feedback.id,
        vector: JSON.stringify(vector),
      },
      update: {
        vector: JSON.stringify(vector),
      },
    });

    const updated = await prisma.feedback.findUnique({
      where: { id: feedback.id },
      include: {
        themes: {
          include: { theme: true },
        },
      },
    });

    return NextResponse.json({
      message: "Feedback re-classified successfully",
      data: updated,
      classification,
    });
  } catch (error: any) {
    console.error("POST /api/feedback/:id/reclassify error:", error);
    return NextResponse.json({ error: "Failed to re-classify feedback" }, { status: 500 });
  }
}
