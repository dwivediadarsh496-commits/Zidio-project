import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const UpdateRoleSchema = z.object({
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
});

// PATCH /api/workspace/members/:id - Update member role (ADMIN only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuthUser(["ADMIN"]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    // Verify member belongs to this workspace
    const member = await prisma.user.findFirst({
      where: {
        id,
        workspaceId: user!.workspaceId,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent demoting the last admin
    if (member.role === "ADMIN" && parsed.data.role !== "ADMIN") {
      const adminCount = await prisma.user.count({
        where: {
          workspaceId: user!.workspaceId,
          role: "ADMIN",
        },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Workspace must have at least one Administrator." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ message: "Member role updated successfully", data: updated });
  } catch (error: any) {
    console.error("PATCH /api/workspace/members/:id error:", error);
    return NextResponse.json({ error: "Failed to update member role" }, { status: 500 });
  }
}

// DELETE /api/workspace/members/:id - Remove member (ADMIN only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuthUser(["ADMIN"]);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    if (id === user!.id) {
      return NextResponse.json(
        { error: "You cannot remove your own active account from the workspace." },
        { status: 400 }
      );
    }

    const member = await prisma.user.findFirst({
      where: {
        id,
        workspaceId: user!.workspaceId,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "Member removed from workspace successfully" });
  } catch (error: any) {
    console.error("DELETE /api/workspace/members/:id error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
