import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSessionOrNull } from "@/lib/serverAuth";
import { z } from "zod";

const createDocumentSchema = z.object({
  userId: z.string().optional(),
  title: z.string().min(1),
  objective: z.string().min(1),
  rawContent: z.string().min(1)
});

export async function GET(req: NextRequest) {
  try {
    // pass req to allow token-cookie fallback
    const session = await getServerSessionOrNull(req);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    // use query userId if provided, otherwise use authenticated user id
    const queryUserId = searchParams.get('userId');
    const userId = queryUserId ?? (session.user as any).id;

    // if query provided, still enforce ownership
    if (queryUserId && queryUserId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Search all documents of this user
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

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSessionOrNull(req);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
    }

    // default userId to authenticated user if not provided
    const { userId: bodyUserId, title, objective, rawContent } = parsed.data;
    const userId = bodyUserId ?? (session.user as any).id;

    // enforce ownership
    if (userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const created = await prisma.userDocuments.create({
      data: { userId, title, objective, rawContent },
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

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Create document failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
