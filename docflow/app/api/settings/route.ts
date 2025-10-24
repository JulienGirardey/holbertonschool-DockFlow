import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '../../generated/prisma'
import { getServerSessionOrNull } from "@/lib/serverAuth";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(req: NextRequest) {
  try {
    // ensure we pass req so cookie fallback works
    const session = await getServerSessionOrNull(req);
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    // default to authenticated user id when query param is absent
    const userId = queryUserId ?? (session.user as any).id;

    // if query provided, enforce ownership
    if (queryUserId && queryUserId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await prisma.settings.findUnique({
      where: { userId: userId }
    });

    if (!settings) {
      return NextResponse.json({ userId, language: "en", colorMode: "light" });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get settings failed:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSessionOrNull(req);
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    // allow missing userId in body and default to authenticated user
    const userId = body.userId ?? (session.user as any).id;
    const { language, colorMode } = body;

    // require at least one field to update
    if (!language && !colorMode) {
      return NextResponse.json({ error: "At least one field (language or colorMode) is required" }, { status: 400 });
    }

    if (userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await prisma.settings.upsert({
      where: { userId },
      update: {
        ...(language && { language })
      },
      create: {
        userId,
        language: language ?? "en"
      },
      select: { id: true, userId: true, language: true }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Update settings failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
