import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { generateEmbedding, rankFeedbackBySimilarity } from "@/lib/search";
import { askLoopGrounded } from "@/lib/ai";

export const dynamic = "force-dynamic";

const AskSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters"),
});

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuthUser();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const parsed = AskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid question" },
        { status: 400 }
      );
    }

    const { question } = parsed.data;

    // 1. Generate Question Embedding
    const queryVector = generateEmbedding(question);

    // 2. Fetch all embeddings scoped to the user's workspace
    const workspaceEmbeddings = await prisma.embedding.findMany({
      where: {
        feedback: {
          workspaceId: user!.workspaceId,
        },
      },
      include: {
        feedback: {
          select: {
            id: true,
            content: true,
            channel: true,
            customerLabel: true,
            sentiment: true,
            featureArea: true,
            createdAt: true,
            status: true,
          },
        },
      },
    });

    if (workspaceEmbeddings.length === 0) {
      return NextResponse.json({
        question,
        answer: "I couldn't find enough feedback data to answer this question. Please import or add customer feedback first.",
        evidence: [],
      });
    }

    // 3. Perform Semantic Vector Search via Cosine Similarity
    const ranked = rankFeedbackBySimilarity(queryVector, workspaceEmbeddings, 6);

    // Filter by relevance threshold
    const relevantFeedback = ranked.map((r) => ({
      ...r.feedback,
      similarityScore: Number(r.score.toFixed(3)),
    }));

    // 4. Grounded AI Answer Generation via Claude / AI Engine
    const { answer } = await askLoopGrounded(question, relevantFeedback);

    return NextResponse.json({
      question,
      answer,
      evidence: relevantFeedback,
    });
  } catch (error: any) {
    console.error("POST /api/insights/ask error:", error);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
