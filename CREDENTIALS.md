# Project LOOP — Saved Passwords & Credentials

All default seed accounts, passwords, and environment configuration keys for Project LOOP.

---

## 1. Demo User Accounts & Passwords

| Role | Name | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Elena Rostova | `admin@loop-demo.com` | `admin1234` | Full workspace control (manage team, settings, add/edit/delete feedback, reclassify, generate reports) |
| **ANALYST** | Marcus Vance | `analyst@loop-demo.com` | `analyst1234` | Data management (manual feedback, CSV upload, simulated channels, status updates, generate reports) |
| **VIEWER** | Sophia Chen | `viewer@loop-demo.com` | `viewer1234` | Read-only access (view dashboard, inbox, trends, Ask LOOP Q&A, view reports; mutations return HTTP 403) |

---

## 2. Quick 1-Click Access in Web UI

On the **Login Page** (`http://localhost:3000/login`):
- Click **Admin** ➔ auto-fills `admin@loop-demo.com` and `admin1234`
- Click **Analyst** ➔ auto-fills `analyst@loop-demo.com` and `analyst1234`
- Click **Viewer** ➔ auto-fills `viewer@loop-demo.com` and `viewer1234`

---

## 3. Environment & Security Secrets

| Variable | Stored Value | Location | Notes |
| :--- | :--- | :--- | :--- |
| **`NEXTAUTH_SECRET`** | `loop-super-secret-jwt-key-2026-production-grade` | `.env` | JWT session signing secret |
| **`NEXTAUTH_URL`** | `http://localhost:3000` | `.env` | Base app callback URL |
| **`DATABASE_URL`** | `file:./dev.db` | `.env` | Local SQLite database file |
| **`ANTHROPIC_API_KEY`** | `""` (Optional) | `.env` | Claude Sonnet API key (fallback smart NLP is active if left empty) |

---

## 4. Default Seed Organization

- **Workspace Name**: `Acme Cloud AI`
- **Initial Dataset**: 125+ Customer Feedback items across 5 channels
- **Core Themes**:
  1. Onboarding & Activation (`#6366F1`)
  2. Billing & Checkout (`#EF4444`)
  3. Performance & Speed (`#F59E0B`)
  4. Feature Requests (`#10B981`)
  5. UI & Mobile Experience (`#8B5CF6`)
  6. Integrations & API (`#06B6D4`)
  7. Customer Support & Docs (`#EC4899`)
