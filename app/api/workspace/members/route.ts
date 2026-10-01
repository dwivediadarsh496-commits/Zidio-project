import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";

const CreateMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
});

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuthUser(["ADMIN"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const parsed = CreateMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid member data" },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newMember = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role,
        workspaceId: user!.workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Team member added successfully",
        data: newMember,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/workspace/members error:", error);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}
