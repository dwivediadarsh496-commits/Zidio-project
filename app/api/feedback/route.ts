import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { classifyFeedback } from "@/lib/ai";
import { generateEmbedding } from "@/lib/search";

const FeedbackCreateSchema = z.object({
  content: z.string().min(3, "Feedback content must be at least 3 characters"),
  channel: z.string().min(2, "Channel is required"),
  customerLabel: z.string().optional(),
  sourceRef: z.string().optional(),
  createdAt: z.string().optional(),
});

// GET /api/feedback - Search, filters, and server-side pagination
export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuthUser();
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const channel = searchParams.get("channel")?.trim() || "";
    const sentiment = searchParams.get("sentiment")?.trim() || "";
    const themeId = searchParams.get("themeId")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get("pageSize") || "15", 10)));

    const where: any = {
      workspaceId: user!.workspaceId,
    };

    if (search) {
      where.OR = [
        { content: { contains: search } },
        { customerLabel: { contains: search } },
        { sourceRef: { contains: search } },
        { featureArea: { contains: search } },
      ];
    }

    if (channel && channel !== "ALL") {
      where.channel = channel;
    }

    if (sentiment && sentiment !== "ALL") {
      where.sentiment = sentiment;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (themeId && themeId !== "ALL") {
      where.themes = {
        some: {
          themeId: themeId,
        },
      };
    }

    const [total, feedback] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        include: {
          themes: {
            include: {
              theme: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      data: feedback,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

// POST /api/feedback - Manual entry + Auto AI Classification
export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuthUser(["ADMIN", "ANALYST"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const parsed = FeedbackCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid feedback data" },
        { status: 400 }
      );
    }

    const { content, channel, customerLabel, sourceRef, createdAt } = parsed.data;

    // Fetch existing workspace themes for AI context
    const workspaceThemes = await prisma.theme.findMany({
      where: { workspaceId: user!.workspaceId },
    });
    const themeNames = workspaceThemes.map((t) => t.name);

    // AI Classification
    const classification = await classifyFeedback(content, themeNames);

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        content,
        channel,
        customerLabel: customerLabel || null,
        sourceRef: sourceRef || null,
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
        featureArea: classification.featureArea,
        rationale: classification.rationale,
        status: "NEW",
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        workspaceId: user!.workspaceId,
      },
    });

    // Link themes
    for (const themeName of classification.themes) {
      const matched = workspaceThemes.find(
        (t) => t.name.toLowerCase() === themeName.toLowerCase()
      );
      if (matched) {
        await prisma.feedbackTheme.create({
          data: {
            feedbackId: feedback.id,
            themeId: matched.id,
            confidence: 0.92,
          },
        });
      }
    }

    // Generate & store embedding
    const vector = generateEmbedding(content);
    await prisma.embedding.create({
      data: {
        feedbackId: feedback.id,
        vector: JSON.stringify(vector),
      },
    });

    const fullFeedback = await prisma.feedback.findUnique({
      where: { id: feedback.id },
      include: {
        themes: {
          include: { theme: true },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Feedback ingested and classified successfully",
        data: fullFeedback,
        classification,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 });
  }
}
