import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { workspace: true },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          workspaceId: user.workspaceId,
          workspaceName: user.workspace.name,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.workspaceId = (user as any).workspaceId;
        token.workspaceName = (user as any).workspaceName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).workspaceId = token.workspaceId;
        (session.user as any).workspaceName = token.workspaceName;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "loop-secret-2026",
};

/**
 * Retrieve the current authenticated user session on the server.
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user as
    | {
        id: string;
        name: string;
        email: string;
        role: "ADMIN" | "ANALYST" | "VIEWER";
        workspaceId: string;
        workspaceName: string;
      }
    | undefined;
}

/**
 * Enforce authentication and RBAC for Next.js Route Handlers.
 * Returns either the authorized user or a standard HTTP 401/403 NextResponse.
 */
export async function requireAuthUser(allowedRoles?: Array<"ADMIN" | "ANALYST" | "VIEWER">) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized. Please sign in to continue." },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          error: "Forbidden. You do not have permission to perform this action.",
          requiredRoles: allowedRoles,
          currentRole: user.role,
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}
