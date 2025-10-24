import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '../../../generated/prisma'
import { getServerSessionOrNull } from "@/lib/serverAuth";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSessionOrNull();
		if (!session || !(session.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const { id } = await params;
		const requestId = id;

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
				userDocument: { select: { id: true, title: true } },
				user: { select: { id: true, firstName: true, lastName: true, email: true } }
			}
		});

		if (!aiRequest) return NextResponse.json({ error: "AI request not found" }, { status: 404 });

		if (aiRequest.userId !== (session.user as any).id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

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
		const session = await getServerSessionOrNull();
		if (!session || !(session.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const { id } = await params;
		const requestId = id;

		const existing = await prisma.aiRequest.findUnique({ where: { id: requestId }, select: { userId: true } });
		if (!existing) return NextResponse.json({ error: "AI request not found" }, { status: 404 });
		if (existing.userId !== (session.user as any).id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		await prisma.aiRequest.delete({ where: { id: requestId } });

		return NextResponse.json({ message: "AI request deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error('Delete AI request failed:', error);
		return NextResponse.json(
			{ error: "AI request not found or delete failed" },
			{ status: 404 }
		);
	}
}
