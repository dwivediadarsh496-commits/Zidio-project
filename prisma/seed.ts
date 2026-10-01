import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateEmbedding } from "../lib/search";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Project LOOP database seed...");

  // 1. Clean existing records
  await prisma.feedbackTheme.deleteMany();
  await prisma.embedding.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.report.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  // 2. Create Demo Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Cloud AI",
    },
  });
  console.log(`✓ Created workspace: ${workspace.name} (${workspace.id})`);

  // 3. Create Seed Users
  const passwordHash = await bcrypt.hash("admin1234", 10);
  const analystHash = await bcrypt.hash("analyst1234", 10);
  const viewerHash = await bcrypt.hash("viewer1234", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Elena Rostova (Admin)",
      email: "admin@loop-demo.com",
      passwordHash,
      role: "ADMIN",
      workspaceId: workspace.id,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Marcus Vance (Analyst)",
      email: "analyst@loop-demo.com",
      passwordHash: analystHash,
      role: "ANALYST",
      workspaceId: workspace.id,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Sophia Chen (Viewer)",
      email: "viewer@loop-demo.com",
      passwordHash: viewerHash,
      role: "VIEWER",
      workspaceId: workspace.id,
    },
  });

  console.log("✓ Created demo users (Admin, Analyst, Viewer)");

  // 4. Create Themes
  const themeDefs = [
    { name: "Onboarding & Activation", color: "#6366F1", description: "First-run setup, team invitation flow, and product tours" },
    { name: "Billing & Checkout", color: "#EF4444", description: "Invoices, credit card charges, upgrades, and refund inquiries" },
    { name: "Performance & Speed", color: "#F59E0B", description: "Query latency, dashboard rendering, lag, and data load speed" },
    { name: "Feature Requests", color: "#10B981", description: "Customer suggestions, CSV export, dark mode, and custom webhooks" },
    { name: "UI & Mobile Experience", color: "#8B5CF6", description: "Mobile responsive layout, tablet touch targets, and typography" },
    { name: "Integrations & API", color: "#06B6D4", description: "Slack, Jira, GitHub, SSO/SAML, and developer REST APIs" },
    { name: "Customer Support & Docs", color: "#EC4899", description: "Help desk responsiveness, clarity of API documentation, and tutorials" },
  ];

  const createdThemes: Record<string, any> = {};
  for (const td of themeDefs) {
    const t = await prisma.theme.create({
      data: {
        name: td.name,
        color: td.color,
        description: td.description,
        workspaceId: workspace.id,
      },
    });
    createdThemes[td.name] = t;
  }
  console.log(`✓ Created ${Object.keys(createdThemes).length} core feedback themes`);

  // 5. Generate 125 realistic feedback items
  const channels = ["Support Ticket", "App Store Review", "NPS Survey", "Sales Call", "Community Post"];
  const companies = [
    "Shopify", "Retool", "Vercel", "Figma", "Stripe", "Linear", "Notion", "Dropbox", 
    "Datadog", "Snowflake", "Brex", "Ramp", "HubSpot", "Zapier", "Loom", "Intercom"
  ];

  const rawFeedbackSeed: Array<{
    content: string;
    channel: string;
    sentiment: "POS" | "NEU" | "NEG";
    score: number;
    theme: string;
    featureArea: string;
    rationale: string;
    status: "NEW" | "REVIEWED" | "ACTIONED";
    daysAgo: number;
  }> = [
    // Onboarding & Activation
    {
      content: "The initial workspace setup was super intuitive! Our engineering team was invited and up and running in under 5 minutes.",
      channel: "NPS Survey",
      sentiment: "POS",
      score: 0.88,
      theme: "Onboarding & Activation",
      featureArea: "Workspace Setup",
      rationale: "Seamless onboarding workflow with rapid time to value.",
      status: "REVIEWED",
      daysAgo: 2,
    },
    {
      content: "Inviting team members with role-based permissions failed repeatedly with an unclear generic error message.",
      channel: "Support Ticket",
      sentiment: "NEG",
      score: -0.78,
      theme: "Onboarding & Activation",
      featureArea: "User Invitations",
      rationale: "Friction and errors when inviting collaborators.",
      status: "NEW",
      daysAgo: 3,
    },
    {
      content: "The guided walkthrough modal keeps popping up every single time I reload the browser window. Very annoying.",
      channel: "App Store Review",
      sentiment: "NEG",
      score: -0.62,
      theme: "Onboarding & Activation",
      featureArea: "Product Tour",
      rationale: "Tour modal dismiss state is not being remembered across page sessions.",
      status: "ACTIONED",
      daysAgo: 5,
    },
    {
      content: "Clean signup process. Would love an option to authenticate directly via GitHub Enterprise or Okta SSO during sign up.",
      channel: "Sales Call",
      sentiment: "NEU",
      score: 0.15,
      theme: "Onboarding & Activation",
      featureArea: "SSO Registration",
      rationale: "Neutral feedback requesting enterprise SSO onboarding.",
      status: "REVIEWED",
      daysAgo: 7,
    },
    {
      content: "Onboarding documentation is clear, but video tutorials for non-technical teammates would be a huge plus.",
      channel: "Community Post",
      sentiment: "NEU",
      score: 0.25,
      theme: "Onboarding & Activation",
      featureArea: "Onboarding Guides",
      rationale: "Constructive suggestion for interactive video walkthroughs.",
      status: "NEW",
      daysAgo: 10,
    },

    // Billing & Checkout
    {
      content: "We were charged twice on our corporate Visa card this billing cycle. Need an immediate refund and corrected invoice.",
      channel: "Support Ticket",
      sentiment: "NEG",
      score: -0.92,
      theme: "Billing & Checkout",
      featureArea: "Credit Card Invoicing",
      rationale: "Severe billing error: double charge requiring instant refund.",
      status: "NEW",
      daysAgo: 1,
    },
    {
      content: "Upgrading from the Growth tier to Enterprise was instant and the self-service receipt generation works flawlessly.",
      channel: "NPS Survey",
      sentiment: "POS",
      score: 0.85,
      theme: "Billing & Checkout",
      featureArea: "Tier Upgrade & Receipts",
      rationale: "Customer thrilled with friction-free upgrade process.",
      status: "ACTIONED",
      daysAgo: 4,
    },
    {
      content: "The billing portal does not accept international European VAT ID numbers properly at checkout.",
      channel: "Support Ticket",
      sentiment: "NEG",
      score: -0.71,
      theme: "Billing & Checkout",
      featureArea: "VAT / Tax Compliance",
      rationale: "Checkout form validation fails on valid European VAT registrations.",
      status: "REVIEWED",
      daysAgo: 6,
    },
    {
      content: "Could you provide annual billing discounts? Our procurement department requires annual invoicing rather than monthly.",
      channel: "Sales Call",
      sentiment: "NEU",
      score: 0.05,
      theme: "Billing & Checkout",
      featureArea: "Annual Invoicing",
      rationale: "Enterprise sales request for annual billing contract options.",
      status: "REVIEWED",
      daysAgo: 12,
    },
    {
      content: "Cancellation flow was easy and transparent without deceptive dark patterns. Thank you for respecting users.",
      channel: "App Store Review",
      sentiment: "POS",
      score: 0.74,
      theme: "Billing & Checkout",
      featureArea: "Subscription Management",
      rationale: "User praised ethical and transparent cancellation flow.",
      status: "REVIEWED",
      daysAgo: 18,
    },

    // Performance & Speed
    {
      content: "The analytics dashboard takes 14 seconds to load when filtering across 30 days of data. Unacceptably slow.",
      channel: "Support Ticket",
      sentiment: "NEG",
      score: -0.85,
      theme: "Performance & Speed",
      featureArea: "Dashboard Analytics Query",
      rationale: "Severe query latency on large date ranges impacting workflow.",
      status: "NEW",
      daysAgo: 1,
    },
    {
      content: "Whatever update you pushed yesterday made search lightning fast! The results filter in real-time as I type.",
      channel: "Community Post",
      sentiment: "POS",
      score: 0.91,
      theme: "Performance & Speed",
      featureArea: "Instant Search",
      rationale: "Customer noticed dramatic performance improvement in feedback search.",
      status: "ACTIONED",
      daysAgo: 2,
    },
    {
      content: "Browser tab freezes when scrolling quickly down the feedback inbox table with 100+ items displayed.",
      channel: "App Store Review",
      sentiment: "NEG",
      score: -0.68,
      theme: "Performance & Speed",
      featureArea: "Table Virtualization",
      rationale: "DOM rendering bottleneck during rapid scrolling.",
      status: "REVIEWED",
      daysAgo: 8,
    },
    {
      content: "API endpoint latency spikes to 2500ms during peak morning hours. Is there rate limiting or caching in place?",
      channel: "Support Ticket",
      sentiment: "NEG",
      score: -0.72,
      theme: "Performance & Speed",
      featureArea: "REST API Latency",
      rationale: "Peak hour latency degradation causing downstream webhook timeouts.",
      status: "NEW",
      daysAgo: 14,
    },
    {
      content: "Page transition speeds are snappy and the optimistic updates make the app feel native.",
      channel: "NPS Survey",
      sentiment: "POS",
      score: 0.81,
      theme: "Performance & Speed",
      featureArea: "Navigation Speed",
      rationale: "Praise for instant client-side route transitions and optimistic UI.",
      status: "REVIEWED",
      daysAgo: 21,
    },

    // Feature Requests
    {
      content: "We urgently need CSV export for filtered feedback tables with custom column selection for our monthly executive review.",
      channel: "Support Ticket",
      sentiment: "NEU",
      score: 0.1,
      theme: "Feature Requests",
      featureArea: "CSV Export",
      rationale: "Feature request for configurable CSV export of filtered data.",
      status: "REVIEWED",
      daysAgo: 2,
    },
    {
      content: "Please add a native Slack bot that posts new negative feedback alerts immediately into an incident channel.",
      channel: "Community Post",
      sentiment: "POS",
      score: 0.45,
      theme: "Feature Requests",
      featureArea: "Slack Alert Bot",
      rationale: "High-value integration request to route high-severity feedback directly to Slack.",
      status: "NEW",
      daysAgo: 4,
    },
    {
      content: "Would love a Dark Mode toggle! The current bright white theme strains eyes during late-night triage sessions.",
      channel: "App Store Review",
      sentiment: "NEU",
      score: 0.2,
      theme: "Feature Requests",
      featureArea: "Dark Mode Theme",
      rationale: "UI ergonomics request for system/dark mode color theme.",
      status: "ACTIONED",
      daysAgo: 9,
    },
    {
      content: "Can we get custom webhook triggers when feedback reaches 'ACTIONED' status to notify our Jira board?",
      channel: "Sales Call",
      sentiment: "POS",
      score: 0.35,
      theme: "Feature Requests",
      featureArea: "Webhook Automation",
      rationale: "Workflow automation request to sync status changes with external issue trackers.",
      status: "REVIEWED",
      daysAgo: 15,
    },
    {
      content: "Add multi-language sentiment classification for German, French, and Japanese customer tickets.",
      channel: "Community Post",
      sentiment: "NEU",
      score: 0.15,
      theme: "Feature Requests",
      featureArea: "Multilingual NLP",
      rationale: "Request for multi-language sentiment classification support.",
      status: "NEW",
      daysAgo: 24,
    },

    // UI & Mobile Experience
    {
      content: "The mobile web layout is cramped on iPhone 15 Pro. Filter dropdowns overflow outside the visible viewport.",
      channel: "App Store Review",
      sentiment: "NEG",
      score: -0.65,
      theme: "UI & Mobile Experience",
      featureArea: "Mobile Viewport Filters",
      rationale: "CSS overflow bug preventing mobile users from selecting filter options.",
      status: "NEW",
      daysAgo: 3,
    },
    {
      content: "The typography and spacing on the modern dashboard are gorgeous. Cleanest enterprise UI we have used this year.",
      channel: "NPS Survey",
      sentiment: "POS",
      score: 0.94,
      theme: "UI & Mobile Experience",
      featureArea: "Design System & Typography",
      rationale: "Strong appreciation for aesthetic clarity and modern SaaS layout.",
      status: "ACTIONED",
      daysAgo: 5,
    },
    {
      content: "Action buttons inside table rows are very small and hard to tap accurately on an iPad tablet.",
      channel: "Support Ticket",
      sentiment: "NEG",
      score: -0.55,
      theme: "UI & Mobile Experience",
      featureArea: "Touch Targets",
      rationale: "Touch target sizing does not adhere to accessible mobile guidelines.",
      status: "REVIEWED",
      daysAgo: 11,
    },
    {
      content: "Contrast ratio on the secondary gray text could be higher. It is difficult to read under direct office sunlight.",
      channel: "Community Post",
      sentiment: "NEU",
      score: -0.15,
      theme: "UI & Mobile Experience",
      featureArea: "Accessibility & Contrast",
      rationale: "Accessibility contrast suggestion for WCAG AA compliance.",
      status: "REVIEWED",
      daysAgo: 17,
    },

    // Integrations & API
    {
      content: "The REST API documentation is concise and the OpenAPI spec imported straight into our Postman workspace with zero errors.",
      channel: "Community Post",
      sentiment: "POS",
      score: 0.89,
      theme: "Integrations & API",
      featureArea: "API Documentation",
      rationale: "Developer satisfaction with clean OpenAPI documentation.",
      status: "ACTIONED",
      daysAgo: 4,
    },
    {
      content: "Jira two-way synchronization failed to sync status changes back to LOOP after our engineers closed the ticket.",
      channel: "Support Ticket",
      sentiment: "NEG",
      score: -0.73,
      theme: "Integrations & API",
      featureArea: "Jira 2-Way Sync",
      rationale: "Webhook listener drop causing out-of-sync state between Jira and LOOP.",
      status: "NEW",
      daysAgo: 6,
    },
    {
      content: "Okta SAML Single Sign-On setup was smooth and took our IT security team less than 15 minutes to configure.",
      channel: "Sales Call",
      sentiment: "POS",
      score: 0.87,
      theme: "Integrations & API",
      featureArea: "Okta SSO",
      rationale: "Enterprise praise for standard SAML 2.0 implementation.",
      status: "REVIEWED",
      daysAgo: 13,
    },
    {
      content: "Does the Zapier integration support custom field mappings for source references and customer tags?",
      channel: "Community Post",
      sentiment: "NEU",
      score: 0.1,
      theme: "Integrations & API",
      featureArea: "Zapier Custom Fields",
      rationale: "Question regarding extended metadata fields in Zapier app.",
      status: "REVIEWED",
      daysAgo: 20,
    },

    // Customer Support & Docs
    {
      content: "Support agent David responded within 4 minutes on live chat and resolved our CSV import encoding issue immediately.",
      channel: "Support Ticket",
      sentiment: "POS",
      score: 0.96,
      theme: "Customer Support & Docs",
      featureArea: "Live Chat Support",
      rationale: "Exemplary first-response resolution time from customer support.",
      status: "ACTIONED",
      daysAgo: 1,
    },
    {
      content: "Submitted a high-priority ticket 48 hours ago regarding webhook failures and have yet to receive a response.",
      channel: "Support Ticket",
      sentiment: "NEG",
      score: -0.88,
      theme: "Customer Support & Docs",
      featureArea: "Support SLA",
      rationale: "SLA breach on high priority support ticket.",
      status: "NEW",
      daysAgo: 2,
    },
    {
      content: "The API code examples in Python and TypeScript are very helpful, but a Go SDK example would be appreciated.",
      channel: "Community Post",
      sentiment: "NEU",
      score: 0.3,
      theme: "Customer Support & Docs",
      featureArea: "Developer Code Samples",
      rationale: "Constructive feedback requesting Go language SDK snippets.",
      status: "REVIEWED",
      daysAgo: 16,
    },
  ];

  // Expand systematically to 125 items by generating realistic permutations across the categories
  const allFeedbackData: typeof rawFeedbackSeed = [...rawFeedbackSeed];

  const syntheticTemplates = [
    { text: "Encountered a strange error when uploading our weekly CSV file. Half of the rows were skipped without a log.", theme: "Onboarding & Activation", area: "CSV Importer", s: "NEG", score: -0.71 },
    { text: "The automated AI theme clustering grouped our customer complaints with incredible accuracy. Saved us 10 hours this week!", theme: "Feature Requests", area: "AI Theme Clustering", s: "POS", score: 0.92 },
    { text: "Credit card auto-renewal sent 3 separate emails with conflicting dates. Please fix email notification triggers.", theme: "Billing & Checkout", area: "Renewal Notifications", s: "NEG", score: -0.63 },
    { text: "Search latency on the feedback inbox is under 50ms even with thousands of entries. Truly impressive engineering.", theme: "Performance & Speed", area: "Search Index", s: "POS", score: 0.88 },
    { text: "Mobile navigation bar covers the bottom pagination buttons on Safari iOS. Requires horizontal scroll.", theme: "UI & Mobile Experience", area: "Mobile Navigation", s: "NEG", score: -0.58 },
    { text: "Connecting our Zendesk support queue was remarkably simple. Feedback ingested within seconds.", theme: "Integrations & API", area: "Zendesk Connector", s: "POS", score: 0.85 },
    { text: "The knowledge base search article on webhook signatures is outdated and references deprecated headers.", theme: "Customer Support & Docs", area: "Documentation Accuracy", s: "NEG", score: -0.52 },
    { text: "Can we get granular permissions so analysts can tag feedback but cannot delete customer records?", theme: "Onboarding & Activation", area: "Granular RBAC", s: "NEU", score: 0.15 },
    { text: "Invoice PDF download button returns a 500 server error at the end of the month.", theme: "Billing & Checkout", area: "Invoice PDF Generator", s: "NEG", score: -0.81 },
    { text: "The sentiment breakdown charts look gorgeous in our leadership slide deck. Clear, executive-grade visuals.", theme: "UI & Mobile Experience", area: "Chart Visualizations", s: "POS", score: 0.93 },
    { text: "Ask LOOP answered our exact query about checkout drop-off and cited the 4 customer quotes directly!", theme: "Feature Requests", area: "Ask LOOP Q&A", s: "POS", score: 0.95 },
    { text: "Query timeout occurs when attempting to generate a 90-day Voice-of-Customer report.", theme: "Performance & Speed", area: "VoC Report Engine", s: "NEG", score: -0.75 },
    { text: "Webhook payload is missing the customer_email attribute in the v1 feedback event schema.", theme: "Integrations & API", area: "Webhook Schema", s: "NEU", score: -0.1 },
    { text: "Support team was patient and walked us through setting up multi-workspace organization hierarchy.", theme: "Customer Support & Docs", area: "Enterprise Onboarding Help", s: "POS", score: 0.91 },
    { text: "We need an easy way to merge duplicate feedback items submitted by the same enterprise account.", theme: "Feature Requests", area: "Duplicate Deduplication", s: "NEU", score: 0.2 },
    { text: "The new bulk status update action saves our triage team at least 30 minutes every morning.", theme: "Performance & Speed", area: "Bulk Triage Actions", s: "POS", score: 0.86 },
    { text: "Stripe payment webhook failed and marked our active account as past due unexpectedly.", theme: "Billing & Checkout", area: "Payment Status Sync", s: "NEG", score: -0.87 },
    { text: "Keyboard shortcuts (j/k navigation and s to change status) make the feedback inbox lightning fast.", theme: "UI & Mobile Experience", area: "Keyboard Shortcuts", s: "POS", score: 0.89 },
    { text: "Password reset email took 45 minutes to arrive in our Outlook corporate inbox.", theme: "Onboarding & Activation", area: "Auth Email Dispatch", s: "NEG", score: -0.66 },
  ];

  let cycle = 0;
  while (allFeedbackData.length < 125) {
    const tmpl = syntheticTemplates[cycle % syntheticTemplates.length];
    const channel = channels[(cycle * 3) % channels.length];
    const daysAgo = (cycle * 2) % 29 + 1; // spread 1 to 30 days ago
    allFeedbackData.push({
      content: `${tmpl.text} (Ref #${cycle + 101})`,
      channel,
      sentiment: tmpl.s as any,
      score: tmpl.score,
      theme: tmpl.theme,
      featureArea: tmpl.area,
      rationale: `Automated seed entry analyzing ${tmpl.area}.`,
      status: cycle % 3 === 0 ? "NEW" : cycle % 3 === 1 ? "REVIEWED" : "ACTIONED",
      daysAgo,
    });
    cycle++;
  }

  console.log(`✓ Prepared ${allFeedbackData.length} feedback items. Ingesting into database...`);

  // Ingest feedback items with dates, themes, and pre-computed embeddings
  let count = 0;
  for (const item of allFeedbackData) {
    const createdAt = new Date(Date.now() - item.daysAgo * 24 * 60 * 60 * 1000);
    const company = companies[count % companies.length];
    const sourceRef = `${item.channel.slice(0, 3).toUpperCase()}-${1000 + count}`;

    const fb = await prisma.feedback.create({
      data: {
        content: item.content,
        channel: item.channel,
        customerLabel: company,
        sourceRef,
        sentiment: item.sentiment,
        sentimentScore: item.score,
        featureArea: item.featureArea,
        rationale: item.rationale,
        status: item.status,
        createdAt,
        workspaceId: workspace.id,
      },
    });

    // Link theme
    const matchedTheme = createdThemes[item.theme] || Object.values(createdThemes)[0];
    if (matchedTheme) {
      await prisma.feedbackTheme.create({
        data: {
          feedbackId: fb.id,
          themeId: matchedTheme.id,
          confidence: 0.88 + (count % 10) * 0.01,
        },
      });
    }

    // Generate normalized embedding vector and save to Embedding table
    const embeddingVec = generateEmbedding(item.content);
    await prisma.embedding.create({
      data: {
        feedbackId: fb.id,
        vector: JSON.stringify(embeddingVec),
      },
    });

    count++;
  }

  console.log(`✓ Successfully created and indexed ${count} feedback items with embeddings!`);

  // 6. Create Initial Voice-of-Customer Demo Report
  const sampleReportContent = {
    executiveSummary: `During this 30-day review cycle, Acme Cloud AI processed 125 multi-channel customer feedback entries across Support Tickets, App Store Reviews, NPS Surveys, Sales Calls, and Community Posts. Overall customer sentiment reflects 52% positive satisfaction, 18% neutral constructive input, and 30% operational friction points.

Key findings emphasize strong enthusiasm for rapid query performance and clean modern dashboard ergonomics, while immediate engineering intervention is recommended for onboarding invitation failures and edge-case billing VAT reconciliation.`,
    topCustomerThemes: [
      {
        name: "Performance & Speed",
        count: 32,
        trend: "Increasing",
        summary: "Sub-50ms search and snappy navigation are widely praised across enterprise clients.",
      },
      {
        name: "Onboarding & Activation",
        count: 27,
        trend: "Decreasing",
        summary: "Invitation modal errors and product tour persistence require bug fixes.",
      },
      {
        name: "Billing & Checkout",
        count: 24,
        trend: "Increasing",
        summary: "Duplicate invoice charges and European VAT number validation errors reported.",
      },
      {
        name: "Feature Requests",
        count: 22,
        trend: "Stable",
        summary: "Strong demand for native Slack alerting bots and custom CSV column export.",
      },
    ],
    sentimentAnalysis: {
      positivePercent: 52,
      neutralPercent: 18,
      negativePercent: 30,
      sentimentShift: "+4.8% positive vs prior 30-day cycle",
    },
    importantCustomerQuotes: [
      {
        quote: "The analytics dashboard takes 14 seconds to load when filtering across 30 days. Unacceptably slow.",
        channel: "Support Ticket",
        customerLabel: "Shopify",
        sentiment: "NEG",
      },
      {
        quote: "Whatever update you pushed yesterday made search lightning fast! The results filter in real-time as I type.",
        channel: "Community Post",
        customerLabel: "Figma",
        sentiment: "POS",
      },
      {
        quote: "Upgrading from the Growth tier to Enterprise was instant and self-service receipt generation works flawlessly.",
        channel: "NPS Survey",
        customerLabel: "Stripe",
        sentiment: "POS",
      },
    ],
    keyCustomerProblems: [
      "Intermittent duplicate charges and invoice generation failures during month-end billing cycles.",
      "Generic error dialog when inviting team members without admin-level permissions.",
      "Mobile filter dropdown elements overflowing horizontal viewports on iOS devices.",
    ],
    recommendedActions: [
      {
        priority: "HIGH",
        action: "Audit and patch payment gateway webhook idempotency to eliminate duplicate billing transactions.",
        owner: "FinTech Eng Team",
        expectedImpact: "Eliminates ~85% of critical billing support escalations.",
      },
      {
        priority: "HIGH",
        action: "Refactor workspace invitation endpoint to provide explicit field-level error messages.",
        owner: "Identity & Auth Team",
        expectedImpact: "Reduces first-week onboarding drop-off by an estimated 18%.",
      },
      {
        priority: "MEDIUM",
        action: "Ship Dark Mode theme toggle and mobile viewport CSS layout fixes.",
        owner: "Design Systems & Frontend",
        expectedImpact: "Boosts mobile NPS satisfaction scores by +12 points.",
      },
    ],
  };

  await prisma.report.create({
    data: {
      title: "Executive Voice-of-Customer Intelligence — Q3 Comprehensive",
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      contentJson: JSON.stringify(sampleReportContent),
      createdAt: new Date(),
      workspaceId: workspace.id,
      generatedBy: "Elena Rostova (Admin)",
    },
  });

  console.log("✓ Created initial Voice-of-Customer executive report");
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
