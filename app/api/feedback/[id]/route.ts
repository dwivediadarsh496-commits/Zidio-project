import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";

const UpdateFeedbackSchema = z.object({
  status: z.enum(["NEW", "REVIEWED", "ACTIONED"]).optional(),
  customerLabel: z.string().optional(),
  featureArea: z.string().optional(),
  sentiment: z.enum(["POS", "NEU", "NEG"]).optional(),
});

// GET /api/feedback/:id
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuthUser();
    if (errorResponse) return errorResponse;

    const { id } = await params;

    const feedback = await prisma.feedback.findFirst({
      where: {
        id,
        workspaceId: user!.workspaceId,
      },
      include: {
        themes: {
          include: { theme: true },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    return NextResponse.json({ data: feedback });
  } catch (error: any) {
    console.error("GET /api/feedback/:id error:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

// PATCH /api/feedback/:id - Update status or properties (ADMIN and ANALYST only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuthUser(["ADMIN", "ANALYST"]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const existing = await prisma.feedback.findFirst({
      where: {
        id,
        workspaceId: user!.workspaceId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: parsed.data,
      include: {
        themes: {
          include: { theme: true },
        },
      },
    });

    return NextResponse.json({
      message: "Feedback updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/feedback/:id error:", error);
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}

// DELETE /api/feedback/:id - Delete feedback (ADMIN only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuthUser(["ADMIN"]);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    const existing = await prisma.feedback.findFirst({
      where: {
        id,
        workspaceId: user!.workspaceId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Feedback deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/feedback/:id error:", error);
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
  }
}
