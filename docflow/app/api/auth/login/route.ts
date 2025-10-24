import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import bcrypt from "bcryptjs";
import { PrismaClient } from '../../../generated/prisma'
import { generateToken } from '../../../../lib/auth';
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function POST(req: NextRequest) {
  // rate limit by IP for login attempts: 5 requests / 60s
  const rl = await rateLimit(req, "auth_login", 5, 60);
  if (rl) return rl;

  try {
    //recovery email and password of the body
    const { email, password } = await req.json();

    //check if the fields are present
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email ans password are required" },
        { status: 400 }
      );
    }

    //find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    //check if the user exist
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    //compared the password
    const isValidPassword = await bcrypt.compare(password, user.password);

    //check if the password is correct
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    const res = NextResponse.json({
        ok: true,
        message: "Login successful",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
      }
    );

    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true, // <-- rend le cookie inaccessible via document.cookie
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30 // 30 jours
    });

    // after successful authentication and before returning the response,
    // set a client-readable CSRF cookie (double-submit token).
    const csrf = generateCsrfToken();
    // build the NextResponse you already return on success (example shown)
    // adapt to your existing response object: setCsrfCookie expects a NextResponse
    setCsrfCookie(res, csrf);
    // ensure you also set auth cookie/token as you did before on res
    return res;
    
  } catch (error) {
    console.error('Login error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            {status: 500 }
        );
  }
}
