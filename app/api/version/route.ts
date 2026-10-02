import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const cwd = process.cwd();
  let rootFiles: string[] = [];
  let prismaFiles: string[] = [];
  let publicFiles: string[] = [];
  let tmpFiles: string[] = [];

  try {
    rootFiles = fs.readdirSync(/*turbopackIgnore: true*/ cwd);
  } catch (e: any) {
    rootFiles = [e.message];
  }

  try {
    prismaFiles = fs.readdirSync(path.join(cwd, "prisma"));
  } catch (e: any) {
    prismaFiles = [e.message];
  }

  try {
    publicFiles = fs.readdirSync(path.join(cwd, "public"));
  } catch (e: any) {
    publicFiles = [e.message];
  }

  try {
    tmpFiles = fs.readdirSync("/tmp");
  } catch (e: any) {
    tmpFiles = [e.message];
  }

  return NextResponse.json({
    version: "1.0.4-diagnostic",
    cwd,
    databaseUrl: process.env.DATABASE_URL,
    rootFiles,
    prismaFiles,
    publicFiles,
    tmpFiles,
  });
}
