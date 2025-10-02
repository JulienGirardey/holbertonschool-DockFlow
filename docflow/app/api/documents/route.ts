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
		//recovery userId by parameters query
		const userId = getUserIdFromToken(req);
		//check if userId is present
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		//Search all documents of this user
		const documents = await prisma.userDocuments.findMany({
			where: { userId },
			select: {
				id: true,
				title: true,
				objective: true,
				rawContent: true,
				createdAt: true,
				updatedAt: true
			},
			orderBy: { updatedAt: 'desc' }
		});

		//return list
		return NextResponse.json(documents);

	} catch (error) {
		console.error('Get documents error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            {status: 500 }
        );
	}
}

export async function POST(req: NextRequest) {
	try {
		// recovery the userId of JWT token
		const userId = getUserIdFromToken(req);
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// recovery the data of body
		const { title, objective, rawContent } = await req.json();

		// validation
		if (!title || !objective || !rawContent) {
			return NextResponse.json(
				{ error: "All fields are required (userId, title, objective, rawContent)" },
				{ status: 400 }
			);
		}

		// create document
		const document = await prisma.userDocuments.create({
			data: {
				userId,
				title,
				objective,
				rawContent
			},
			select: {
				id: true,
				userId: true,
				title: true,
				objective: true,
				rawContent: true,
				createdAt: true,
				updatedAt: true
			}
		});

		// return the new document
		return NextResponse.json(document, { status: 201 });

	} catch (error) {
		console.error('Create document error:', error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
