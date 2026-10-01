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

    const theme = await prisma.theme.findFirst({
      where: {
        id,
        workspaceId: user!.workspaceId,
      },
      include: {
        _count: {
          select: { feedbackThemes: true },
        },
      },
    });

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: theme.id,
        name: theme.name,
        color: theme.color,
        description: theme.description,
        totalFeedback: theme._count.feedbackThemes,
      },
    });
  } catch (error: any) {
    console.error("GET /api/themes/:id error:", error);
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 });
  }
}
