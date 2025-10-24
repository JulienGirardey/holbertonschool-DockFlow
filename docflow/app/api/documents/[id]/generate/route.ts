import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSessionOrNull } from "@/lib/serverAuth";
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ensure session is validated (support NextAuth + token cookie fallback)
    const session = await getServerSessionOrNull(req);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const documentId = id;

    // ensure document exists and belongs to authenticated user
    const doc = await prisma.userDocuments.findUnique({
      where: { id: documentId },
      select: { userId: true, title: true, rawContent: true }
    });
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (doc.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    // Strong instruction: detect REQUEST language and PREPEND a LANGUAGE tag.
    // Model MUST start response with: LANGUAGE: en  OR LANGUAGE: fr
    const systemPrompt = `You are an expert writing assistant.
Look ONLY at the text in the field named "REQUEST" to determine the language.
If "REQUEST" is English, you MUST produce the entire response in English.
If "REQUEST" is French, you MUST produce the entire response in French.
You MUST begin the response with a single-line language tag exactly like this: "LANGUAGE: en" or "LANGUAGE: fr", followed by a blank line and then the generated content.
Ignore the language of TITLE or CURRENT CONTENT when choosing the response language. Do not include any other languages.`;

    const userPrompt = `TITLE: ${doc.title || 'Untitled'}
CURRENT CONTENT: ${doc.rawContent || 'No content'}
REQUEST: ${prompt}

IMPORTANT: Use the language of the text in the "REQUEST" field for the whole response (ignore TITLE/CURRENT CONTENT language).
Begin with the LANGUAGE tag as described in the system instructions. Generate informative content adapted to the subject. Be precise and technical if necessary.`;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    // replace both count queries with a single one
    const counts = await prisma.aiRequest.groupBy({
      by: ['userId'],
      where: {
        userId: doc.userId,
        createdAt: { gte: oneHourAgo }
      },
      _count: { id: true }
    });

    const recentRequests = await prisma.aiRequest.findMany({
      where: {
        userId: doc.userId,
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

            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      });

      generatedContent = completion.choices[0]?.message?.content || generateFallback(prompt, doc);
      aiResponse = "Groq Llama-3.1-8B";

    } catch (error) {
      // fallback
      aiResponse = "Smart fallback";
    }

    // enforce language tag parsing: expect first non-empty line "LANGUAGE: en" or "LANGUAGE: fr"
    if (generatedContent) {
      const lines = generatedContent.split(/\r?\n/);
      const firstNonEmpty = lines.find(l => l.trim().length > 0) || '';
      const m = firstNonEmpty.match(/^LANGUAGE:\s*(en|fr)\b/i);
      if (m) {
        // remove the tag line and the next blank line if present
        let startIdx = lines.indexOf(firstNonEmpty);
        // drop the tag line
        lines.splice(startIdx, 1);
        // drop a following empty line
        if (lines[startIdx] !== undefined && lines[startIdx].trim() === '') lines.splice(startIdx, 1);
        generatedContent = lines.join('\n').trim();
      } else {
        // if model didn't prepend tag, leave content but you may fallback or log
        // (optionally) we could default to English: keep as-is
      }
    }

    // save AI request
    await prisma.aiRequest.create({
      data: {
        userId: doc.userId,
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
    console.error("Generate document failed:", error);
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
    // pass req so the token-cookie fallback can run
    const session = await getServerSessionOrNull(req);
    if (!session || !((session.user as any)?.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const documentId = id;

    const document = await prisma.userDocuments.findUnique({ where: { id: documentId }, select: { userId: true } });
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (document.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const generatedDocuments = await prisma.generatedDocument.findMany({
      where: { userDocumentId: documentId },
      select: {
        id: true,
        userDocumentId: true,
        generatedContent: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(generatedDocuments);
  } catch (error) {
    console.error('Display documents error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
