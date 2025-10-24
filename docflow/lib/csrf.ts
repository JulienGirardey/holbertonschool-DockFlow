import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export function generateCsrfToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function setCsrfCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: "csrf",
    value: token,
    httpOnly: false, // must be readable by client JS for double-submit
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

/**
 * Verify CSRF + Origin/Referer for mutating requests.
 * - Checks Origin/Referer matches NEXTAUTH_URL (or localhost)
 * - Compares cookie 'csrf' with header 'x-csrf-token' (double-submit)
 */
export function verifyCsrfAndOrigin(req: NextRequest): boolean {
  const method = (req.method || "GET").toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return true;

  const originHeader = req.headers.get("origin") || req.headers.get("referer");
  if (!originHeader) return false;

  const allowedOrigin = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  try {
    const url = new URL(originHeader);
    if (url.origin !== allowedOrigin) return false;
  } catch {
    return false;
  }

  const headerToken = req.headers.get("x-csrf-token");
  const cookie = req.cookies.get("csrf")?.value;
  if (!cookie || !headerToken) return false;
  return cookie === headerToken;
}