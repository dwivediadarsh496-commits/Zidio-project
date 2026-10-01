import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/reports - List saved VoC reports
export async function GET() {
  try {
    const { user, errorResponse } = await requireAuthUser();
    if (errorResponse) return errorResponse;

    const reports = await prisma.report.findMany({
      where: { workspaceId: user!.workspaceId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        periodStart: true,
        periodEnd: true,
        generatedBy: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: reports });
  } catch (error: any) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
