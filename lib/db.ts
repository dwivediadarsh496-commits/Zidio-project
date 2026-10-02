import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If using an external database provider (PostgreSQL, Supabase, Neon, etc.)
  if (envUrl && !envUrl.startsWith("file:")) {
    return envUrl;
  }

  // On Vercel Serverless environment:
  // Root filesystem is read-only, but /tmp is writable.
  // Copy the pre-seeded SQLite database to /tmp so queries and writes work seamlessly.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = "/tmp/dev.db";

    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.resolve("./prisma/dev.db"),
        path.resolve("./dev.db"),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
          try {
            fs.copyFileSync(/*turbopackIgnore: true*/ candidate, tmpDbPath);
            break;
          } catch (e) {
            console.warn(`Failed to copy database from ${candidate} to /tmp:`, e);
          }
        }
      }
    }

    if (fs.existsSync(/*turbopackIgnore: true*/ tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  // Local development resolution:
  const localCandidates = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), "dev.db"),
  ];

  for (const loc of localCandidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ loc)) {
      return `file:${loc}`;
    }
  }

  return envUrl || `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
}

function getPrismaClient(): PrismaClient {
  if (!global.prisma) {
    const dbUrl = resolveDatabaseUrl();
    global.prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return global.prisma;
}

/**
 * Lazy-initialized Prisma proxy ensuring instant, robust execution across both local and Vercel serverless
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
