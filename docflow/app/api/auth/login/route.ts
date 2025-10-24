import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from '../../../generated/prisma'
import { generateToken } from '../../../../lib/auth';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function POST(req: NextRequest) {
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

    return res;
    
  } catch (error) {
    console.error('Login error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            {status: 500 }
        );
  }
}
