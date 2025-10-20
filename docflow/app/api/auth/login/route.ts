import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from '../../../generated/prisma'
import { generateToken } from '../../../../lib/auth';
import { serialize } from 'cookie'

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

	const cookie = serialize('token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 7 * 24 * 60 * 60,
	})

    return NextResponse.json({
			ok: true,
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
    },
		{
			headers: {
				'Set-Cookie': cookie,
			},
		}
	);
    
  } catch (error) {
    console.error('Login error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            {status: 500 }
        );
  }
}
