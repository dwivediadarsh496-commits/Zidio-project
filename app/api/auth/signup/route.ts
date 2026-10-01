import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/db";

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters").optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { name, email, password, workspaceName } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create workspace and user in a transaction
    const finalWorkspaceName = workspaceName?.trim() || `${name.split(" ")[0]}'s Workspace`;

    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: finalWorkspaceName,
        },
      });

      // Default system themes for the new workspace
      const defaultThemes = [
        { name: "Onboarding & Activation", color: "#6366F1", description: "First-run experience and account activation" },
        { name: "Billing & Checkout", color: "#EF4444", description: "Pricing, checkout, invoices and renewals" },
        { name: "Performance & Speed", color: "#F59E0B", description: "App speed, query latency and reliability" },
        { name: "Feature Requests", color: "#10B981", description: "New capabilities, integrations and exports" },
        { name: "UI & Mobile Experience", color: "#8B5CF6", description: "Responsive layouts, mobile app and design" },
        { name: "Customer Support & Docs", color: "#EC4899", description: "Support responsiveness and documentation" },
      ];

      for (const t of defaultThemes) {
        await tx.theme.create({
          data: {
            name: t.name,
            color: t.color,
            description: t.description,
            workspaceId: workspace.id,
          },
        });
      }

      // New signup user is ADMIN of their workspace
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: "ADMIN",
          workspaceId: workspace.id,
        },
      });

      return { user, workspace };
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          workspaceId: result.workspace.id,
          workspaceName: result.workspace.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
