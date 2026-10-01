import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CreateThemeSchema = z.object({
  name: z.string().min(2, "Theme name must be at least 2 characters"),
  description: z.string().optional(),
  color: z.string().optional(),
});

// GET /api/themes - List workspace themes with feedback counts
export async function GET() {
  try {
    const { user, errorResponse } = await requireAuthUser();
    if (errorResponse) return errorResponse;

    const themes = await prisma.theme.findMany({
      where: { workspaceId: user!.workspaceId },
      include: {
        _count: {
          select: { feedbackThemes: true },
        },
      },
      orderBy: {
        feedbackThemes: {
          _count: "desc",
        },
      },
    });

    const formatted = themes.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      color: t.color || "#6366F1",
      feedbackCount: t._count.feedbackThemes,
      createdAt: t.createdAt,
    }));

    return NextResponse.json({ data: formatted });
  } catch (error: any) {
    console.error("GET /api/themes error:", error);
    return NextResponse.json({ error: "Failed to fetch themes" }, { status: 500 });
  }
}

// POST /api/themes - Create new theme (ADMIN & ANALYST only)
export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuthUser(["ADMIN", "ANALYST"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const parsed = CreateThemeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid theme data" },
        { status: 400 }
      );
    }

    const { name, description, color } = parsed.data;

    const theme = await prisma.theme.create({
      data: {
        name,
        description: description || null,
        color: color || "#6366F1",
        workspaceId: user!.workspaceId,
      },
    });

    return NextResponse.json({ message: "Theme created successfully", data: theme }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/themes error:", error);
    return NextResponse.json({ error: "Failed to create theme" }, { status: 500 });
  }
}
