import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/reports/:id
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuthUser();
    if (errorResponse) return errorResponse;

    const { id } = await params;

    const report = await prisma.report.findFirst({
      where: {
        id,
        workspaceId: user!.workspaceId,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    let parsedContent = {};
    try {
      parsedContent = JSON.parse(report.contentJson);
    } catch {
      parsedContent = {};
    }

    return NextResponse.json({
      data: {
        ...report,
        content: parsedContent,
      },
    });
  } catch (error: any) {
    console.error("GET /api/reports/:id error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

// DELETE /api/reports/:id (ADMIN only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuthUser(["ADMIN"]);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    const report = await prisma.report.findFirst({
      where: {
        id,
        workspaceId: user!.workspaceId,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    await prisma.report.delete({ where: { id } });

    return NextResponse.json({ message: "Report deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/reports/:id error:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
