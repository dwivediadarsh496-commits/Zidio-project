# Project LOOP — AI Customer-Feedback Intelligence Platform

> **Tagline**: *LOOP — Close the loop on customer feedback.*  
> **Version**: 1.0 Corporate-Grade Web Application  
> **Evaluation Track**: Web Development (50 Marks)

---

## 1. Product Overview

**Project LOOP** is a multi-tenant, AI-powered customer-feedback intelligence platform that centralizes, classifies, analyzes, and understands customer feedback from disparate channels (Support Tickets, App Store Reviews, NPS Surveys, Sales Calls, Community Posts) in one system.

Instead of teams manually sorting through spreadsheets and inboxes, LOOP automatically:
1. **Ingests** raw feedback via manual entry, bulk CSV uploads, or simulated channel queues.
2. **Auto-Classifies** items with sentiment analysis, polarity scores (-1.0 to +1.0), theme tags, feature area identification, and AI rationale using Claude Sonnet.
3. **Clusters Themes & Detects Trends** by comparing current period volumes against prior cycles (Increasing, Decreasing, Stable).
4. **Enables Grounded Q&A ("Ask LOOP")** over vectorized customer feedback with cosine-similarity semantic retrieval and citation badges.
5. **Synthesizes Voice-of-Customer (VoC) Executive Reports** grounded in real calculated statistics and exportable to PDF.

---

## 2. Demo Credentials

The database comes pre-seeded with **125+ verified feedback items**, **7 core intelligence themes**, and **3 separate demo accounts** representing each RBAC tier:

| Role | Email Address | Password | Permissions Summary |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@loop-demo.com` | `admin1234` | Full workspace control: Manage members, change roles, rename workspace, add/delete feedback, re-classify, generate reports. |
| **ANALYST** | `analyst@loop-demo.com` | `analyst1234` | Data operations: Ingest feedback, upload bulk CSV, simulate channels, update status, trigger re-classification, generate reports. |
| **VIEWER** | `viewer@loop-demo.com` | `viewer1234` | **Read-Only**: Browse inbox, view dashboard charts, inspect trends, ask questions in Ask LOOP, read reports. Cannot mutate data (`HTTP 403 Forbidden` enforced on server). |

> *All three accounts are pre-configured with 1-click quick-fill buttons directly on the `/login` page.*

---

## 3. Technology Stack

- **Framework**: Next.js 14+ (App Router, Server Components & Route Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark-mode executive SaaS aesthetics & glassmorphism
- **Database & ORM**: Prisma ORM with SQLite for zero-friction instant local execution (PostgreSQL & pgvector compatible)
- **Authentication**: NextAuth.js (Auth.js) with bcrypt password hashing and persistent JWT sessions
- **AI Engine**: Anthropic Claude API (Sonnet) with fallback smart NLP engine for reliable offline/demo operation
- **Vector Search**: 64-dimensional semantic embedding engine with cosine similarity ranking
- **Charts & Visualizations**: Recharts (Feedback Volume AreaChart, Sentiment Breakdown Donut, Top Themes BarChart)
- **Validation**: Zod schema validation on all API payloads
- **CSV Processing**: PapaParse with live row preview and error counter

---

## 4. System & Multi-Tenant Architecture

```
                       USER (Browser)
                            │
                            ▼
                   ┌─────────────────┐
                   │     Next.js     │
                   │    Frontend     │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Route Handler  │
                   │    (Next API)   │
                   └────────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
     Auth / RBAC          Prisma           Claude API
   (Server-Enforced)        │              (Server-Side)
                            ▼                 │
                         Database             ▼
                    (workspaceId scoped)   AI Engine
                            │                 │
                            ▼                 ▼
                      Embedding Store ◄───────┘
```

- **Data Isolation**: Every tenant-owned model (`Feedback`, `Theme`, `Report`, `User`) is strictly scoped by `workspaceId`. Cross-tenant queries are blocked at the ORM layer.
- **Server-Side Security**: The Claude API key and database connection remain strictly server-side. Forbidden client requests return `HTTP 403 Forbidden`.

---

## 5. Core Features

### 5.1 Feedback Ingestion (3 Channels)
1. **Manual Entry**: Modal with content, channel, customer/account label, source ref, and automatic AI classification upon creation.
2. **Bulk CSV Upload**: Drag-and-drop file ingestion, PapaParse live parsing, column validation, imported vs failed count reporting.
3. **Simulated Channels**: Quick-action buttons to simulate real-time ingestion from **Support Tickets**, **App Reviews**, and **NPS Surveys**.

### 5.2 Feedback Inbox
- Full-text search across content, customer names, feature areas, and source refs.
- Multi-dimensional filters: Channel, Sentiment (POS/NEU/NEG), Theme, and Status (NEW/REVIEWED/ACTIONED).
- Server-side pagination with selectable page sizes (10, 15, 25, 50).
- Inline workflow status changer: `NEW` ➔ `REVIEWED` ➔ `ACTIONED`.
- Feedback detail modal featuring sentiment gauges, theme confidence, AI rationale, and manual **Re-classify** action.

### 5.3 Analytics Dashboard
- High-level KPI cards: Total Feedback, Negative Friction %, New This Week, and Sentiment Index.
- Interactive **Feedback Volume Over Time** timeline chart.
- **Sentiment Breakdown** donut visualization with percentage distribution.
- **Top Customer Themes** frequency bar chart.
- Responds dynamically to channel, sentiment, and 7D / 14D / 30D time filters.

### 5.4 Theme Clustering & Trend Trajectory
- Automatically groups feedback into domain themes.
- Period comparison: compares volume in current window vs prior cycle (e.g., 43 vs 18).
- Trend classification: **Increasing**, **Decreasing**, or **Stable**.
- Theme drill-down: clicking any theme displays all constituent feedback items.

### 5.5 Ask LOOP (Grounded Intelligence)
- Natural language question answering over customer feedback.
- Generates query embedding and runs cosine similarity search over stored vectors.
- Sends retrieved context to Claude Sonnet to synthesize an answer grounded strictly in verified feedback.
- Returns answer with supporting feedback citation cards displaying matching scores and customer tags.
- Fallback guard: Displays *"I couldn't find enough feedback data to answer this question"* if no relevant evidence is found.

### 5.6 Voice-of-Customer (VoC) Reports
- Generates comprehensive intelligence reports for **Last 7 Days**, **Last 30 Days**, or **Custom Periods**.
- **Architecture**: Calculates real statistics in application code first (sentiment ratios, cycle shifts, top themes, quotes) before Claude synthesizes the executive briefing narrative.
- Sections: Executive Summary, Top Themes, Sentiment Analysis, Important Customer Quotes, Key Customer Problems, and Recommended Action Plan.
- Saved in database library for future access and printable/exportable to PDF via styled print layouts.

### 5.7 Workspace & RBAC Settings
- Organization profile: Workspace renaming, Tenant ID copy, and ingestion counters.
- Team member management: Invite new users with assigned roles (ADMIN, ANALYST, VIEWER).
- Role reassignment and member removal.

---

## 6. API Reference

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new organization & Admin account | Public |
| `GET` | `/api/feedback` | Search, filter, and paginate feedback | All Roles |
| `POST` | `/api/feedback` | Ingest manual feedback & auto-classify | ADMIN, ANALYST |
| `GET` | `/api/feedback/:id` | Fetch feedback item details | All Roles |
| `PATCH` | `/api/feedback/:id` | Update feedback status or attributes | ADMIN, ANALYST |
| `DELETE` | `/api/feedback/:id` | Permanently delete feedback item | ADMIN |
| `POST` | `/api/feedback/:id/reclassify` | Trigger AI re-classification | ADMIN, ANALYST |
| `POST` | `/api/feedback/import` | Ingest bulk CSV or simulated channel items | ADMIN, ANALYST |
| `GET` | `/api/themes` | List workspace themes with feedback counts | All Roles |
| `GET` | `/api/themes/:id/feedback` | Theme drill-down feedback items | All Roles |
| `GET` | `/api/themes/trends` | Calculate theme trajectory vs prior period | All Roles |
| `POST` | `/api/insights/ask` | Grounded semantic search Q&A | All Roles |
| `GET` | `/api/reports` | List saved Voice-of-Customer reports | All Roles |
| `POST` | `/api/reports/generate` | Generate new VoC report from calculated stats | ADMIN, ANALYST |
| `GET` | `/api/reports/:id` | Fetch single VoC report document | All Roles |
| `DELETE` | `/api/reports/:id` | Delete saved VoC report | ADMIN |
| `GET` | `/api/workspace` | Workspace info, members list & stats | All Roles |
| `PATCH` | `/api/workspace` | Update workspace organization name | ADMIN |
| `POST` | `/api/workspace/members` | Invite new team member with assigned role | ADMIN |
| `PATCH` | `/api/workspace/members/:id` | Update member role | ADMIN |
| `DELETE` | `/api/workspace/members/:id` | Remove member from workspace | ADMIN |

---

## 7. Getting Started Locally

### 1. Clone / Navigate to Directory
```bash
cd loop
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Database & Run Seed
```bash
npx prisma db push
npm run seed
```
*(Populates 125+ feedback entries, embeddings, 7 themes, and 3 demo accounts)*

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Environment Variables

Create `.env` in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="loop-super-secret-jwt-key-2026-production-grade"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Real Claude API calls (Sonnet 4.6).
# If omitted, LOOP's embedded NLP intelligence engine handles classification and Q&A offline.
ANTHROPIC_API_KEY=""
```

---

## 9. Verification & Testing Checklist

- [x] **Authentication**: Sign up, Login, Logout, and JWT session persistence verified.
- [x] **Multi-Tenancy**: Data isolated by `workspaceId` on every database query.
- [x] **RBAC Enforcement**: Admin has full rights; Analyst manages data; Viewer is read-only (returns `403` on mutations).
- [x] **Feedback Ingestion**: Manual submission, CSV bulk upload, and simulated channels operational.
- [x] **Feedback Inbox**: Real-time search, multi-filter combinations, inline status changes, and server pagination tested.
- [x] **Analytics Dashboard**: Responsive KPI cards, Volume Over Time, Sentiment Breakdown, and Top Themes rendered.
- [x] **AI Auto-Classification**: Sentiment, polarity score, theme assignment, feature area, and rationale generated.
- [x] **Theme Trends**: Comparison vs prior period (+/- %) and theme drill-down working.
- [x] **Ask LOOP**: Semantic vector search with cosine similarity and grounded evidence citations working.
- [x] **VoC Reports**: Statistical calculation in code + narrative generation + PDF/print export tested.
- [x] **Production Build**: Verified with `npm run build` (0 TypeScript / lint errors).
