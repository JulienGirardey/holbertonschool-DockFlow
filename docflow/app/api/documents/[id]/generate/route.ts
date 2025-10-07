import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '../../../../generated/prisma'
import { getUserIdFromToken } from "@/lib/auth";
import Groq from 'groq-sdk';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const document = await prisma.userDocuments.findFirst({
      where: { id, userId }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    // replace both count queries with a single one
    const counts = await prisma.aiRequest.groupBy({
      by: ['userId'],
      where: {
        userId: document.userId,
        createdAt: { gte: oneHourAgo }
      },
      _count: { id: true }
    });

    const recentRequests = await prisma.aiRequest.findMany({
      where: {
        userId: document.userId,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      },
      select: { createdAt: true }
    });

    const dailyCount = recentRequests.length;
    const hourlyCount = recentRequests.filter(req =>
      req.createdAt >= oneHourAgo
    ).length

    // check limits
    if (dailyCount >= 50) {
      return NextResponse.json({ error: "Daily limit reached" }, { status: 429 });
    }
    if (hourlyCount >= 10) {
      return NextResponse.json({ error: "Hourly limit reached" }, { status: 429 });
    }

    let generatedContent: string = '';
    let aiResponse: string = '';

    // try groq AI first
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Tu es un assistant d'écriture expert. Génère du contenu détaillé, pertinent et bien structuré selon la demande de l'utilisateur."
          },
          {
            role: "user",
            content: `TITRE: ${document.title || document.objective || 'Sans titre'}
                      CONTENU ACTUEL: ${document.rawContent || 'Aucun contenu'}
                      DEMANDE: ${prompt}

                      Génère du contenu informatif et adapté au sujet. Sois précis et technique si nécessaire.`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      });

      generatedContent = completion.choices[0]?.message?.content || generateFallback(prompt, document);
      aiResponse = "Groq Llama-3.1-8B";

    } catch (error) {
      // fallback
      aiResponse = "Smart fallback";
    }

    // save AI request
    await prisma.aiRequest.create({
      data: {
        userId: document.userId,
        userDocumentId: id,
        prompt,
        response: aiResponse
      }
    });

    // create generated document
    const generatedDocument = await prisma.generatedDocument.create({
      data: {
        userDocumentId: id,
        generatedContent
      },
      select: {
        id: true,
        userDocumentId: true,
        generatedContent: true,
        createdAt: true
      }
    });

    return NextResponse.json(generatedDocument, { status: 201 });

  } catch (error) {
    console.error('Generate document error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// smart content fallback
function generateFallback(prompt: string, document: any): string {
  const content = document.rawContent || '';
  const title = document.title || document.objective || '';
  const now = new Date().toLocaleDateString('fr-FR');
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('résumé') || lowerPrompt.includes('summary')) {
    interface DocumentData {
      rawContent: string;
      title?: string;
      objective?: string;
      userId: string;
    }

    interface GenerationResponse {
      id: string;
      userDocumentId: string;
      generatedContent: string;
      createdAt: Date;
    }

    return `# Résumé - ${title}

    *Généré le ${now}*

    ## Points Clés
    ${content.split(/[.!?]+/).slice(0, 3).map((point: string, i: number) => `${i + 1}. ${point.trim()}`).join('\n')}

    ## Synthèse
    ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}

    *[DocFlow Pro Assistant]*`;
  }

  if (lowerPrompt.includes('améliore') || lowerPrompt.includes('improve')) {
    return `# ${title} - Version Optimisée

*${now}*

## Contenu Amélioré
${content}

## Améliorations Appliquées
- Structure claire avec sections
- Lisibilité optimisée
- Ton professionnel

*[DocFlow Pro Assistant]*`;
  }

  // default generation
  return `# ${title}

*Généré le ${now}*

## Contenu
${content || 'Contenu à développer selon votre demande...'}

## Développement
Basé sur "${prompt}", voici une structure pour approfondir le sujet.

*[DocFlow Pro Assistant]*`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.userDocuments.findFirst({
      where: { id, userId }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const generatedDocuments = await prisma.generatedDocument.findMany({
      where: { userDocumentId: id },
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

    return NextResponse.json(generatedDocuments);

  } catch (error) {
    console.error('Display documents error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
