import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '../../../../generated/prisma'
import { getUserIdFromToken } from "@/lib/auth";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
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

		// recovery ID's document from the params
		const { id } = await params;
		const documentId = id;

		// recovery prompt's body
		const { prompt } = await req.json();

		// verify the prompt presence
		if (!prompt) {
			return NextResponse.json(
				{ error: "Prompt is required" },
				{ status: 400 }
			);
		}

		// verify if the document exist
		const document = await prisma.userDocuments.findFirst({
			where: {
				id: documentId,
				userId: userId
			}
		});

		if (!document) {
			return NextResponse.json(
				{ error: "Document not found" },
				{ status: 404 }
			);
		}

		// Create AI request
		await prisma.aiRequest.create({
			data: {
				userId: document.userId,
				userDocumentId: documentId,
				prompt,
				response: "AI generation completed"
			}
		});

		// simulate the AI generation
		const generatedContent = `# ${document.title}

		## Objective
		${document.objective}

		## Content
		${document.rawContent}

		*This content has been structured by AI.*`;

		// save the generated document
		const generatedDocument = await prisma.generatedDocument.create({
			data: {
				userDocumentId: documentId,
				generatedContent
			},
			select: {
				id: true,
				userDocumentId: true,
				generatedContent: true,
				createdAt: true
			}
		});

		// return the generated document
		return NextResponse.json(generatedDocument, { status: 201 });

	} catch (error) {
		console.error('Generate document error:', error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
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

		// recovery the ID's document
		const { id } = await params;
		const documentId = id;

		// check if the document exist
		const document = await prisma.userDocuments.findFirst({
			where: {
				id: documentId,
				userId: userId
			}
		});

		if (!document) {
			return NextResponse.json(
				{ error: "Document not found" },
				{ status: 404 }
			);
		}
		
		// recovery all documents generated for this document
		const generatedDocuments = await prisma.generatedDocument.findMany({
			where: { userDocumentId: documentId },
			select: {
				id: true,
				userDocumentId: true,
				generatedContent: true,
				createdAt: true,
				updatedAt: true,
				userDocument: true
			},
			orderBy: { updatedAt: 'desc' }
		});

		// return the list
		return NextResponse.json(generatedDocuments);

	} catch (error) {
		console.error('Display all documents failed:', error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
