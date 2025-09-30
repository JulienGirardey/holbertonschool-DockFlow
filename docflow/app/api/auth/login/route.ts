import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from '../../../generated/prisma'

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

    //check id the password is correct
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    //return user info
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            {status: 500 }
        );
  }
}
