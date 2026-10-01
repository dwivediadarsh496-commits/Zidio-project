import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { classifyFeedback } from "@/lib/ai";
import { generateEmbedding } from "@/lib/search";

export const dynamic = "force-dynamic";

const ImportRequestSchema = z.object({
  type: z.enum(["csv", "simulated"]),
  // For CSV upload:
  rows: z
    .array(
      z.object({
        content: z.string().optional(),
        channel: z.string().optional(),
        customer_label: z.string().optional(),
        customerLabel: z.string().optional(),
        created_at: z.string().optional(),
        createdAt: z.string().optional(),
        source_ref: z.string().optional(),
        sourceRef: z.string().optional(),
      })
    )
    .optional(),
  // For simulated channel:
  simulatedChannel: z
    .enum(["Support Ticket", "App Store Review", "NPS Survey", "Sales Call", "Community Post"])
    .optional(),
});

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuthUser(["ADMIN", "ANALYST"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const parsed = ImportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid import request" },
        { status: 400 }
      );
    }

    const { type, rows, simulatedChannel } = parsed.data;

    // Fetch workspace themes for classification
    const workspaceThemes = await prisma.theme.findMany({
      where: { workspaceId: user!.workspaceId },
    });
    const themeNames = workspaceThemes.map((t) => t.name);

    if (type === "csv") {
      if (!rows || rows.length === 0) {
        return NextResponse.json({ error: "CSV file contains no rows" }, { status: 400 });
      }

      let imported = 0;
      let failed = 0;

      for (const row of rows) {
        const content = row.content?.trim();
        const channel = (row.channel || "CSV Import").trim();
        const customerLabel = (row.customerLabel || row.customer_label || "").trim() || null;
        const sourceRef = (row.sourceRef || row.source_ref || `CSV-${Date.now()}-${imported + 1}`).trim();
        const rawDate = row.createdAt || row.created_at;
        const createdAt = rawDate && !isNaN(Date.parse(rawDate)) ? new Date(rawDate) : new Date();

        if (!content || content.length < 3) {
          failed++;
          continue;
        }

        try {
          const classification = await classifyFeedback(content, themeNames);
          const feedback = await prisma.feedback.create({
            data: {
              content,
              channel,
              customerLabel,
              sourceRef,
              sentiment: classification.sentiment,
              sentimentScore: classification.sentimentScore,
              featureArea: classification.featureArea,
              rationale: classification.rationale,
              status: "NEW",
              createdAt,
              workspaceId: user!.workspaceId,
            },
          });

          for (const themeName of classification.themes) {
            const matched = workspaceThemes.find(
              (t) => t.name.toLowerCase() === themeName.toLowerCase()
            );
            if (matched) {
              await prisma.feedbackTheme.create({
                data: {
                  feedbackId: feedback.id,
                  themeId: matched.id,
                  confidence: 0.9,
                },
              });
            }
          }

          const vector = generateEmbedding(content);
          await prisma.embedding.create({
            data: {
              feedbackId: feedback.id,
              vector: JSON.stringify(vector),
            },
          });

          imported++;
        } catch (err) {
          console.error("Row import error:", err);
          failed++;
        }
      }

      return NextResponse.json({
        message: `CSV import completed: ${imported} imported, ${failed} failed`,
        imported,
        failed,
        total: rows.length,
      });
    }

    if (type === "simulated") {
      const channel = simulatedChannel || "Support Ticket";

      const simulatedPresets: Record<
        string,
        Array<{ content: string; customerLabel: string; sentiment: "POS" | "NEU" | "NEG" }>
      > = {
        "Support Ticket": [
          { content: "User unable to reset 2FA authentication token after upgrading to new iPhone.", customerLabel: "Datadog", sentiment: "NEG" },
          { content: "Urgent: Billing webhook sent 400 Bad Request error on monthly renewal trigger.", customerLabel: "Shopify", sentiment: "NEG" },
          { content: "Inquiry on SAML Okta integration single logout URL configuration.", customerLabel: "Brex", sentiment: "NEU" },
          { content: "Customer support resolved our DNS custom domain issue within 10 minutes. Fantastic service!", customerLabel: "Linear", sentiment: "POS" },
          { content: "Dashboard page times out when exporting 50,000 feedback records as compressed archive.", customerLabel: "Vercel", sentiment: "NEG" },
        ],
        "App Store Review": [
          { content: "Love the new minimalist interface and fast search. Essential app for our weekly product meetings.", customerLabel: "Figma", sentiment: "POS" },
          { content: "Latest update crashes immediately upon launching on iPadOS 17.5. Please push hotfix.", customerLabel: "Dropbox", sentiment: "NEG" },
          { content: "Great utility overall, but Dark Mode support would make it much easier to use in dim light.", customerLabel: "Notion", sentiment: "NEU" },
          { content: "Push notification badges don't clear even after reviewing new incoming customer items.", customerLabel: "Retool", sentiment: "NEG" },
          { content: "Cleanest feedback analytics tool on the market. Our team checks it first thing every morning.", customerLabel: "Ramp", sentiment: "POS" },
        ],
        "NPS Survey": [
          { content: "10/10 — Project LOOP transformed how our executive team understands customer friction points.", customerLabel: "Stripe", sentiment: "POS" },
          { content: "7/10 — Solid platform for analyzing trends, but CSV export needs custom column mapping options.", customerLabel: "HubSpot", sentiment: "NEU" },
          { content: "3/10 — The search occasionally freezes when our account experiences high incoming traffic bursts.", customerLabel: "Snowflake", sentiment: "NEG" },
          { content: "9/10 — Grounded AI question answering saves our product analysts countless hours of manual tagging.", customerLabel: "Zapier", sentiment: "POS" },
          { content: "4/10 — Pricing tier jumps from Pro to Enterprise are too steep for mid-market startups.", customerLabel: "Loom", sentiment: "NEG" },
        ],
        "Sales Call": [
          { content: "Prospect loved the VoC report executive summary demo. Asked about custom branding and PDF export.", customerLabel: "Acme Enterprise", sentiment: "POS" },
          { content: "Security questionnaire blocker: Customer requires SOC 2 Type II audit report before contracting.", customerLabel: "Fintech Global", sentiment: "NEU" },
          { content: "Prospect mentioned their previous vendor had terrible sentiment accuracy and praised our Claude integration.", customerLabel: "CloudScale Inc", sentiment: "POS" },
        ],
        "Community Post": [
          { content: "How do other teams configure automated Slack notifications for high-priority negative feedback?", customerLabel: "DevCommunity", sentiment: "NEU" },
          { content: "Sharing our custom Zapier webhook recipe to sync feedback status changes with Linear issues!", customerLabel: "Community Contributor", sentiment: "POS" },
          { content: "Encountered a CORS header issue when calling the feedback API from a Next.js server component.", customerLabel: "OpenSource Dev", sentiment: "NEG" },
        ],
      };

      const presetItems = simulatedPresets[channel] || simulatedPresets["Support Ticket"];
      let imported = 0;

      for (const item of presetItems) {
        const classification = await classifyFeedback(item.content, themeNames);
        const feedback = await prisma.feedback.create({
          data: {
            content: item.content,
            channel,
            customerLabel: item.customerLabel,
            sourceRef: `SIM-${Date.now().toString().slice(-4)}-${imported + 1}`,
            sentiment: classification.sentiment,
            sentimentScore: classification.sentimentScore,
            featureArea: classification.featureArea,
            rationale: classification.rationale,
            status: "NEW",
            createdAt: new Date(),
            workspaceId: user!.workspaceId,
          },
        });

        for (const themeName of classification.themes) {
          const matched = workspaceThemes.find(
            (t) => t.name.toLowerCase() === themeName.toLowerCase()
          );
          if (matched) {
            await prisma.feedbackTheme.create({
              data: {
                feedbackId: feedback.id,
                themeId: matched.id,
                confidence: 0.95,
              },
            });
          }
        }

        const vector = generateEmbedding(item.content);
        await prisma.embedding.create({
          data: {
            feedbackId: feedback.id,
            vector: JSON.stringify(vector),
          },
        });

        imported++;
      }

      return NextResponse.json({
        message: `Successfully ingested ${imported} simulated items from ${channel}`,
        imported,
        channel,
      });
    }

    return NextResponse.json({ error: "Unsupported import type" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/feedback/import error:", error);
    return NextResponse.json({ error: "Failed to process import" }, { status: 500 });
  }
}
