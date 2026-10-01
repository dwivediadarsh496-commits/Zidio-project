import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuthUser();
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel")?.trim() || "";
    const sentiment = searchParams.get("sentiment")?.trim() || "";
    const themeId = searchParams.get("themeId")?.trim() || "";
    const days = parseInt(searchParams.get("days") || "30", 10);

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const where: any = {
      workspaceId: user!.workspaceId,
      createdAt: {
        gte: startDate,
      },
    };

    if (channel && channel !== "ALL") {
      where.channel = channel;
    }

    if (sentiment && sentiment !== "ALL") {
      where.sentiment = sentiment;
    }

    if (themeId && themeId !== "ALL") {
      where.themes = {
        some: { themeId },
      };
    }

    const feedbackItems = await prisma.feedback.findMany({
      where,
      include: {
        themes: {
          include: { theme: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const totalFeedback = feedbackItems.length;

    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    let newThisWeek = 0;
    let totalScore = 0;

    // Timeline map
    const volumeTimelineMap: Record<string, { date: string; total: number; pos: number; neu: number; neg: number }> = {};

    // Initialize all days
    for (let i = days; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split("T")[0];
      volumeTimelineMap[dateKey] = { date: dateKey, total: 0, pos: 0, neu: 0, neg: 0 };
    }

    // Themes map
    const themeCounts: Record<string, { name: string; color: string; count: number }> = {};

    for (const item of feedbackItems) {
      if (item.sentiment === "POS") posCount++;
      else if (item.sentiment === "NEG") negCount++;
      else neuCount++;

      totalScore += item.sentimentScore;

      if (item.createdAt >= sevenDaysAgo && item.status === "NEW") {
        newThisWeek++;
      }

      const dateKey = item.createdAt.toISOString().split("T")[0];
      if (volumeTimelineMap[dateKey]) {
        volumeTimelineMap[dateKey].total++;
        if (item.sentiment === "POS") volumeTimelineMap[dateKey].pos++;
        else if (item.sentiment === "NEG") volumeTimelineMap[dateKey].neg++;
        else volumeTimelineMap[dateKey].neu++;
      }

      for (const ft of item.themes) {
        if (!themeCounts[ft.theme.name]) {
          themeCounts[ft.theme.name] = {
            name: ft.theme.name,
            color: ft.theme.color || "#6366F1",
            count: 0,
          };
        }
        themeCounts[ft.theme.name].count++;
      }
    }

    const negPercent = totalFeedback > 0 ? Math.round((negCount / totalFeedback) * 100) : 0;
    const posPercent = totalFeedback > 0 ? Math.round((posCount / totalFeedback) * 100) : 0;
    const neuPercent = totalFeedback > 0 ? Math.round((neuCount / totalFeedback) * 100) : 0;
    const avgSentimentScore = totalFeedback > 0 ? Number((totalScore / totalFeedback).toFixed(2)) : 0;

    const volumeTimeline = Object.values(volumeTimelineMap);
    const topThemes = Object.values(themeCounts).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      kpis: {
        totalFeedback,
        negativePercent: negPercent,
        positivePercent: posPercent,
        neutralPercent: neuPercent,
        newThisWeek,
        avgSentimentScore,
      },
      charts: {
        volumeTimeline,
        sentimentBreakdown: [
          { name: "Positive", value: posCount, color: "#10B981" },
          { name: "Neutral", value: neuCount, color: "#64748B" },
          { name: "Negative", value: negCount, color: "#EF4444" },
        ],
        topThemes,
      },
    });
  } catch (error: any) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
