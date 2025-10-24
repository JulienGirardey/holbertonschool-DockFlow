import { getServerSession } from "next-auth/next";
import { authOptions, getUserIdFromToken } from "./auth";
import { prisma } from "./prisma";
import type { NextRequest } from "next/server";

/**
 * Try to return a NextAuth session. If none, and req is provided, try to decode
 * your custom 'token' cookie and return a minimal session-like object.
 *
 * Usage in API handlers: const session = await getServerSessionOrNull(req);
 */
export async function getServerSessionOrNull(req?: NextRequest) {
  // 1) try NextAuth session first
  const session = await getServerSession(authOptions);
  if (session) {
    // hydrate id if missing
    const userAny = session.user as any;
    if ((!userAny?.id || userAny.id === undefined) && userAny?.email) {
      const user = await prisma.user.findUnique({ where: { email: userAny.email }, select: { id: true } });
      if (user) userAny.id = user.id;
    }
    return session;
  }

  // 2) fallback: if request provided, try to get userId from your JWT cookie `token`
  if (!req) return null;

  const userIdFromToken = getUserIdFromToken(req);
  if (!userIdFromToken) return null;

  // 3) build a minimal session object from DB
  const user = await prisma.user.findUnique({
    where: { id: userIdFromToken },
    select: { id: true, email: true, firstName: true, lastName: true }
  });
  if (!user) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    }
  } as any;
}