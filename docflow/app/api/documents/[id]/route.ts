import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSessionOrNull } from "@/lib/serverAuth";
import { z } from "zod";

const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  objective: z.string().min(1).optional(),
  rawContent: z.string().min(1).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: "At least one field is required to update" });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSessionOrNull(req);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.userDocuments.findUnique({
      where: { id },
      select: { id: true, userId: true, title: true, rawContent: true, objective: true }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(document);
  } catch (err) {
    console.error("[documents/:id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSessionOrNull(req);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const documentId = id;
    const body = await req.json();
    const parse = updateDocumentSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: parse.error.issues.map(e => e.message).join(", ") }, { status: 400 });
    }
    const { title, objective, rawContent } = parse.data;

    const existing = await prisma.userDocuments.findUnique({ where: { id: documentId }, select: { userId: true } });
    if (!existing) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (existing.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Update document failed:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSessionOrNull(req);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const documentId = id;

    const existing = await prisma.userDocuments.findUnique({ where: { id: documentId }, select: { userId: true } });
    if (!existing) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (existing.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.userDocuments.delete({ where: { id: documentId } });

    return NextResponse.json({ message: "Document deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error('Delete document failed:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}