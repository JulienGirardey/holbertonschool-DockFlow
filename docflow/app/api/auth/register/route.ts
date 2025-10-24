import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // recovery body data
    const { firstName, lastName, email, password } = await req.json();

    //check all champ
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // user existe ?
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    //hash password
    const hashedPassword = await hash(password, 10);

    //create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // sign JWT (payload shape must match getUserFromRequest expectations)
    if (!process.env.JWT_SECRET) {
      console.warn("JWT_SECRET not set");
    }
    const token = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "dev-secret",
      {
        subject: user.id,
        expiresIn: "7d",
      }
    );

    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const cookie = `token=${encodeURIComponent(token)}; Path=/; HttpOnly; Max-Age=${
      7 * 24 * 60 * 60
    }; SameSite=Strict${secure}`;

    const res = NextResponse.json(
      { ok: true, user: { id: user.id, email: user.email } },
      { status: 201 }
    );
    res.headers.set("Set-Cookie", cookie);
    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
