import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '../../../generated/prisma'
import { TokenPayload } from '@/lib/auth'
import jwt from 'jsonwebtoken'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export function verifyToken(token: string) {
	if (!process.env.JWT_SECRET) {
		throw new Error('Missing JWT_SECRET')
	}
	return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload
}

export async function GET(req: NextRequest) {
  try {
    // Get userId from JWT token
    const cookie = req.headers.get('cookie') || ''
	const match = cookie.match(/(^|;\s*)token=([^;]+)/)
	const token = match ? decodeURIComponent(match[2]) : null
	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	let payload
	try {
		payload = verifyToken(token)
	} catch (e) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const userId = (payload as any).userId
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

    // Fetch user information from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      )
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('Error fetching user info:', error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}