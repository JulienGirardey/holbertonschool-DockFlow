import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '../../generated/prisma'
import { getUserIdFromToken } from "@/lib/auth";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(req: NextRequest) {
	try {
		// recovery userId from the parameters query
		const userId = getUserIdFromToken(req);
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// recovery user's settings
		const settings = await prisma.settings.findUnique({
			where: { userId: userId },
			select: {
				id: true,
				userId: true,
				language: true
			}
		});

		// if no settings, return default values
		if (!settings) {
			return NextResponse.json({
				userId: userId,
				language: "en"
			});
		}

		return NextResponse.json(settings);

	} catch (error) {
		console.error('Get settings failed:', error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PUT(req: NextRequest) {
	try {
		// recovery body's data
		const userId = getUserIdFromToken(req);

		// validation
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { language } = await req.json();

		// validation of obligated field
		if (!language) {
			return NextResponse.json(
				{ error: "At least one field (language) is required" },
				{ status: 400 }
			);
		}

		// upsert settings (create or update)
		const settings = await prisma.settings.upsert({
			where: { userId: userId },
			update: {
				language
			},
			create: {
				userId,
				language
			},
			select: {
				id: true,
				language: true
			}
		});

		return NextResponse.json(settings);

	} catch (error) {
		console.error("PUT settings failed:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
