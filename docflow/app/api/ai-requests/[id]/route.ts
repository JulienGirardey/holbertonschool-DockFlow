import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '../../../generated/prisma'

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// recovery the request AI ID
		const { id } = await params;
		const requestId = id;

		// search AI request by ID with his relation
		const aiRequest = await prisma.aiRequest.findUnique({
			where: { id: requestId },
			select: {
				id: true,
				userId: true,
				userDocumentId: true,
				prompt: true,
				response: true,
				createdAt: true,
				updatedAt: true,
				userDocument: {
					select: {
						id: true,
						title: true,
						objective: true
					}
				},
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true
					}
				}
			}
		});

		// check if the request exists
		if (!aiRequest) {
			return NextResponse.json(
				{ error: "AI request not found" },
				{ status: 404 }
			);
		}

		// return the AI request
		return NextResponse.json(aiRequest);

	} catch (error) {
		console.error('Display AI request failed:', error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// recovery the AI request
		const { id } = await params;
		const requestId = id;

		// delete the AI request
		await prisma.aiRequest.delete({
			where: { id: requestId }
		});

		// return the delete confirmation
		return NextResponse.json(
			{ message: "The AI request has been deleted successfully" },
			{ status: 200 }
		);

	} catch (error) {
		console.error('Delete AI request failed:', error);
		return NextResponse.json(
			{ error: "AI request not found or delete failed" },
			{ status: 404 }
		);
	}
}
