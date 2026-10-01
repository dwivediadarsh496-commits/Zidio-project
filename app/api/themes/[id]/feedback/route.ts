import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuthUser();
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "20", 10)));

    const feedbackThemes = await prisma.feedbackTheme.findMany({
      where: {
        themeId: id,
        theme: {
          workspaceId: user!.workspaceId,
        },
      },
      include: {
        feedback: {
          include: {
            themes: {
              include: { theme: true },
            },
          },
        },
      },
      orderBy: {
        feedback: {
          createdAt: "desc",
        },
      },
      take: limit,
    });

    const items = feedbackThemes.map((ft) => ({
      ...ft.feedback,
      themeConfidence: ft.confidence,
    }));

    return NextResponse.json({ data: items });
  } catch (error: any) {
    console.error("GET /api/themes/:id/feedback error:", error);
    return NextResponse.json({ error: "Failed to fetch theme feedback" }, { status: 500 });
  }
}
