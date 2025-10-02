import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '../../../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(
	req: NextRequest,
	{ params }: { params: { userId: string } }
) {
	try {
		// recovery userId from the parameters query
		const userId = (await params).userId;

		// validation
		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		// recovery user's settings
		const settings = await prisma.settings.findUnique({
			where: { userId: userId },
			select: {
				id: true,
				userId: true,
				language: true,
				colorMode: true
			}
		});

		// if no settings, return default values
		if (!settings) {
			return NextResponse.json({
				userId: userId,
				language: "en",
				colorMode: "light"
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

export async function PUT(
	req: NextRequest,
	{ params }: { params: { userId: string } }
) {
	try {
		// recovery body's data
		const userId = (await params).userId;
		const { colorMode, language } = await req.json();

		// validation
		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		// validation of obligated field
		if (!language || !colorMode) {
			return NextResponse.json(
				{ error: "At least one field (language or colorMode) is required" },
				{ status: 400 }
			);
		}

		// upsert settings (create or update)
		const settings = await prisma.settings.upsert({
			where: { userId: userId },
			update: {
				language,
				colorMode
			},
			create: {
				userId,
				language,
				colorMode
			},
			select: {
				id: true,
				language: true,
				colorMode: true
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
