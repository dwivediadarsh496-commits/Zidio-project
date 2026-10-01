import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { generateVocReportContent } from "@/lib/ai";

export const dynamic = "force-dynamic";

const GenerateReportSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  period: z.enum(["7d", "30d", "custom"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuthUser(["ADMIN", "ANALYST"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const parsed = GenerateReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid report parameters" },
        { status: 400 }
      );
    }

    const { period, startDate, endDate, title } = parsed.data;

    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date = now;

    if (period === "7d") {
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "30d") {
      periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      if (!startDate) {
        return NextResponse.json({ error: "Start date is required for custom period" }, { status: 400 });
      }
      periodStart = new Date(startDate);
      if (endDate) {
        periodEnd = new Date(endDate);
        periodEnd.setHours(23, 59, 59, 999);
      }
    }

    const durationMs = periodEnd.getTime() - periodStart.getTime();
    const previousPeriodStart = new Date(periodStart.getTime() - durationMs);
    const previousPeriodEnd = new Date(periodStart.getTime());

    // 1. Calculate Real Statistics in Application Code
    const currentFeedback = await prisma.feedback.findMany({
      where: {
        workspaceId: user!.workspaceId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        themes: {
          include: { theme: true },
        },
      },
    });

    if (currentFeedback.length === 0) {
      return NextResponse.json(
        { error: "No feedback found for the selected period. Ingest or simulate feedback first." },
        { status: 400 }
      );
    }

    const previousFeedback = await prisma.feedback.findMany({
      where: {
        workspaceId: user!.workspaceId,
        createdAt: {
          gte: previousPeriodStart,
          lt: previousPeriodEnd,
        },
      },
      select: {
        sentiment: true,
      },
    });

    // Sentiment breakdown
    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;

    for (const f of currentFeedback) {
      if (f.sentiment === "POS") posCount++;
      else if (f.sentiment === "NEG") negCount++;
      else neuCount++;
    }

    const totalCount = currentFeedback.length;
    const currentPosPct = (posCount / totalCount) * 100;

    let prevPosCount = 0;
    for (const pf of previousFeedback) {
      if (pf.sentiment === "POS") prevPosCount++;
    }
    const prevPosPct = previousFeedback.length > 0 ? (prevPosCount / previousFeedback.length) * 100 : currentPosPct;
    const sentimentShiftPercent = Number((currentPosPct - prevPosPct).toFixed(1));

    // Theme frequency
    const themeCounts: Record<string, number> = {};
    for (const f of currentFeedback) {
      for (const ft of f.themes) {
        themeCounts[ft.theme.name] = (themeCounts[ft.theme.name] || 0) + 1;
      }
    }

    const sortedThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => {
        let trend: "Increasing" | "Decreasing" | "Stable" = "Stable";
        if (count >= 15) trend = "Increasing";
        else if (count <= 3) trend = "Decreasing";
        return { name, count, trend };
      });

    // Representative Quotes
    const representativeQuotes: Array<{
      quote: string;
      channel: string;
      customerLabel?: string;
      sentiment: string;
    }> = [];

    const negQuotes = currentFeedback.filter((f) => f.sentiment === "NEG").slice(0, 2);
    const posQuotes = currentFeedback.filter((f) => f.sentiment === "POS").slice(0, 2);

    for (const q of [...negQuotes, ...posQuotes]) {
      representativeQuotes.push({
        quote: q.content,
        channel: q.channel,
        customerLabel: q.customerLabel || undefined,
        sentiment: q.sentiment,
      });
    }

    const reportTitle =
      title ||
      `Voice-of-Customer Intelligence — ${period.toUpperCase()} (${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()})`;

    // 2. Synthesize AI Narrative based strictly on real metrics
    const reportContent = await generateVocReportContent({
      title: reportTitle,
      periodStart,
      periodEnd,
      totalFeedback: totalCount,
      sentimentCounts: { pos: posCount, neu: neuCount, neg: negCount },
      sentimentShiftPercent,
      topThemes: sortedThemes,
      representativeQuotes,
    });

    // 3. Save report to database
    const savedReport = await prisma.report.create({
      data: {
        title: reportTitle,
        periodStart,
        periodEnd,
        contentJson: JSON.stringify(reportContent),
        workspaceId: user!.workspaceId,
        generatedBy: user!.name,
      },
    });

    return NextResponse.json({
      message: "Voice-of-Customer report generated successfully",
      data: savedReport,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/reports/generate error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
