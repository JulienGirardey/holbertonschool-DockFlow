import jwt from "jsonwebtoken";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "change-me";

export interface TokenPayload {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}` };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as any).id = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) (session.user as any).id = (token as any).id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || JWT_SECRET,
};

export function generateToken(payload: { userId: string; email?: string }): string {
  return jwt.sign(payload as any, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string) {
  if (!JWT_SECRET) throw new Error("Missing JWT secret");
  return jwt.verify(token, JWT_SECRET) as Record<string, any>;
}

import type { NextRequest } from "next/server";
export function getUserIdFromToken(req: NextRequest | { headers?: any } | string) {
  try {
    const getHeader = (name: string) =>
      typeof (req as any).headers?.get === "function"
        ? (req as any).headers.get(name)
        : (req as any).headers && (req as any).headers[name?.toLowerCase()];

    if (typeof req === "string") {
      // direct token string
      const payload = verifyToken(req);
      return (payload as any).userId ?? null;
    }

    const authHeader = getHeader("authorization") || getHeader("Authorization");
    if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const payload = verifyToken(token);
      return (payload as any).userId ?? null;
    }

    const cookieHeader = getHeader("cookie") || getHeader("Cookie") || (req as any).cookie;
    if (cookieHeader && typeof cookieHeader === "string") {
      const m = cookieHeader.match(/(^|;\s*)token=([^;]+)/);
      if (m) {
        try {
          const token = decodeURIComponent(m[2]);
          const payload = verifyToken(token);
          return (payload as any).userId ?? null;
        } catch (e) {
          return null;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}
