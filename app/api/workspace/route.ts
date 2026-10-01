import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const UpdateWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters"),
});

// GET /api/workspace - Get workspace details and members
export async function GET() {
  try {
    const { user, errorResponse } = await requireAuthUser();
    if (errorResponse) return errorResponse;

    const workspace = await prisma.workspace.findUnique({
      where: { id: user!.workspaceId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            feedback: true,
            themes: true,
            reports: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json({ data: workspace });
  } catch (error: any) {
    console.error("GET /api/workspace error:", error);
    return NextResponse.json({ error: "Failed to fetch workspace" }, { status: 500 });
  }
}

// PATCH /api/workspace - Rename workspace (ADMIN only)
export async function PATCH(req: Request) {
  try {
    const { user, errorResponse } = await requireAuthUser(["ADMIN"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const parsed = UpdateWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid workspace name" },
        { status: 400 }
      );
    }

    const updated = await prisma.workspace.update({
      where: { id: user!.workspaceId },
      data: { name: parsed.data.name },
    });

    return NextResponse.json({
      message: "Workspace updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/workspace error:", error);
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
  }
}
