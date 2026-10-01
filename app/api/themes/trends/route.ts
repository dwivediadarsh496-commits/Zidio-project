import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/themes/trends - AI Feature 2: Theme Clustering & Trend Detection
export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuthUser();
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "14", 10);

    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

    // Get all themes for this workspace
    const themes = await prisma.theme.findMany({
      where: { workspaceId: user!.workspaceId },
      include: {
        feedbackThemes: {
          include: {
            feedback: {
              select: {
                id: true,
                createdAt: true,
                sentiment: true,
                sentimentScore: true,
              },
            },
          },
        },
      },
    });

    const trendData = themes.map((theme) => {
      let currentPeriodCount = 0;
      let previousPeriodCount = 0;
      let totalNegative = 0;
      let totalPositive = 0;

      const dateMap: Record<string, number> = {};

      // Initialize past days in dateMap
      for (let i = days; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().split("T")[0];
        dateMap[key] = 0;
      }

      for (const ft of theme.feedbackThemes) {
        const created = ft.feedback.createdAt;

        if (ft.feedback.sentiment === "NEG") totalNegative++;
        if (ft.feedback.sentiment === "POS") totalPositive++;

        if (created >= currentPeriodStart && created <= now) {
          currentPeriodCount++;
          const dateKey = created.toISOString().split("T")[0];
          if (dateMap[dateKey] !== undefined) {
            dateMap[dateKey]++;
          }
        } else if (created >= previousPeriodStart && created < currentPeriodStart) {
          previousPeriodCount++;
        }
      }

      let percentageChange = 0;
      if (previousPeriodCount > 0) {
        percentageChange = Math.round(
          ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100
        );
      } else if (currentPeriodCount > 0) {
        percentageChange = 100;
      }

      let trend: "Increasing" | "Decreasing" | "Stable" = "Stable";
      if (percentageChange >= 15) trend = "Increasing";
      else if (percentageChange <= -15) trend = "Decreasing";

      const dailyTimeline = Object.entries(dateMap).map(([date, count]) => ({
        date,
        count,
      }));

      return {
        id: theme.id,
        name: theme.name,
        color: theme.color || "#6366F1",
        description: theme.description,
        totalCount: theme.feedbackThemes.length,
        currentPeriodCount,
        previousPeriodCount,
        percentageChange,
        trend,
        sentimentBreakdown: {
          positive: totalPositive,
          negative: totalNegative,
          neutral: theme.feedbackThemes.length - totalPositive - totalNegative,
        },
        dailyTimeline,
      };
    });

    // Sort by current period volume descending
    trendData.sort((a, b) => b.currentPeriodCount - a.currentPeriodCount);

    return NextResponse.json({
      periodDays: days,
      currentPeriodStart,
      previousPeriodStart,
      themes: trendData,
    });
  } catch (error: any) {
    console.error("GET /api/themes/trends error:", error);
    return NextResponse.json({ error: "Failed to calculate theme trends" }, { status: 500 });
  }
}
