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
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        //create user
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        });

        await prisma.settings.create({
            data: {
                userId: user.id,
                language: 'en',
                colorMode: 'light'
            }
        });

        //return response
        return NextResponse.json(
            {
                message: "User created successfully",
                userId: user.id
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            {status: 500 }
        );
    }
}
