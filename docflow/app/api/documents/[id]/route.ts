import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '../../../generated/prisma'

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
        // recovery ID's document
        const { id } = await params;
        const documentId = id;

        // search the document by ID with his relations
        const document = await prisma.userDocuments.findUnique({
            where: { id: documentId },
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

        // check if the document exists
        if (!document) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        // return the document
        return NextResponse.json(document);

    } catch (error) {
        console.error('Display document failed:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // recovery the ID of data's to update
        const { id } = await params;
        const documentId = id;
        const { title, objective, rawContent } = await req.json();

        // validation, minimum 1 field must be provided
        if (!title && !objective && !rawContent) {
            return NextResponse.json(
                { error: "At least one field is required to update" },
                { status: 400 }
            );
        }

        // update the document
        const updatedDocument = await prisma.userDocuments.update({
            where: { id: documentId },
            data: {
                ...(title && { title }),
                ...(objective && { objective }),
                ...(rawContent && { rawContent })
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

        // return the updated document
        return NextResponse.json(updatedDocument);

    } catch (error) {
        console.error('Update document failed:', error);
        return NextResponse.json(
            { error: "Document not found or update failed" },
            { status: 404 }
        );
    }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
  ) {
      try {
            // recovery document's ID
            const { id } = await params;
            const documentId = id;

            // delete the document
            await prisma.userDocuments.delete({
                where: { id: documentId }
            });

            // return deleted confirmation
            return NextResponse.json(
                { message: "Document deleted successfully" },
                { status: 200 }
            );

          } catch (error) {
            console.error('Delete document failed:', error);
            return NextResponse.json(
                { error: "Document not found or delete failed" },
                { status: 404 }
            );
          }
}