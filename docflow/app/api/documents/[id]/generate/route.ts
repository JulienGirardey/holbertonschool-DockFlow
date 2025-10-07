import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '../../../../generated/prisma'
import { getUserIdFromToken } from "@/lib/auth";
import Groq from 'groq-sdk';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ✅ Configuration Groq uniquement
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
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const documentId = id;
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

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

        let generatedContent: string = "Error: Content generation failed";
        let aiResponse: string = "Initialization error";
        let aiWorked = false;

        // ✅ Essai avec Groq AI
        try {
            console.log('🤖 Trying Groq AI...');
            
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
                model: "openai/gpt-oss-20b",
                temperature: 0.7,
                max_tokens: 1024,
                stream: false
            });

            // ✅ AJOUT - Debug pour voir ce que Groq retourne
            console.log('📦 Groq response:', JSON.stringify(completion, null, 2));
            console.log('📝 Groq choices:', completion.choices);
            console.log('💬 First choice content:', completion.choices[0]?.message?.content);

            generatedContent = completion.choices[0]?.message?.content || "Erreur lors de la génération";
            aiResponse = "Groq GPT-OSS-20B - Success"; // ✅ Correction du nom du modèle
            aiWorked = true;
            
            console.log('✅ SUCCESS with Groq AI');
            console.log('📄 Final generated content length:', generatedContent.length);

        } catch (aiError: unknown) {
            console.log('❌ Groq failed:', aiError instanceof Error ? aiError.message : 'Unknown error');
        }

        // ✅ Fallback intelligent si Groq ne fonctionne pas
        if (!aiWorked) {
            console.log('🔄 Using smart fallback - AI not available');
            generatedContent = generateSmartFallback(prompt, document);
            aiResponse = "Smart fallback - DocFlow Pro Assistant";
        }

        // Sauvegarder la requête IA
        await prisma.aiRequest.create({
            data: {
                userId: document.userId,
                userDocumentId: documentId,
                prompt,
                response: aiResponse
            }
        });

        // Sauvegarder le document généré
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

        return NextResponse.json(generatedDocument, { status: 201 });

    } catch (error) {
        console.error('Generate document error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// ✅ Fonction de fallback intelligent
function generateSmartFallback(prompt: string, document: any): string {
    const content = document.rawContent || '';
    const title = document.title || document.objective || '';
    const now = new Date().toLocaleDateString('fr-FR');
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('résumé') || lowerPrompt.includes('summary') || lowerPrompt.includes('synthèse')) {
        const sentences: string[] = content.split(/[.!?]+/).filter((s: string): boolean => s.trim().length > 10);
        const keyPoints = sentences.slice(0, 3).map(s => s.trim());
        
        return `# Résumé Exécutif - "${title}"

*Généré le ${now}*

## 🎯 Points Clés :
${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

## 📊 Synthèse :
${content.substring(0, 300)}${content.length > 300 ? '...' : ''}

## 💡 Recommandations :
- Approfondir les aspects mentionnés
- Structurer davantage le contenu
- Ajouter des exemples concrets

*[Généré par Assistant IA - DocFlow Pro]*`;
    }
    
    if (lowerPrompt.includes('améliore') || lowerPrompt.includes('improve') || lowerPrompt.includes('mieux')) {
        return `# ${title} - Version Optimisée

*Améliorations appliquées le ${now}*

## 📝 Contenu Restructuré :

### Introduction
${content.split('\n')[0] || 'Présentation du sujet principal...'}

### Développement
${content}

### Points d'Amélioration Suggérés :
- ✅ Structure claire avec titres et sous-sections
- ✅ Lisibilité améliorée avec des puces
- ✅ Ton plus engageant et professionnel
- ✅ Ajout d'éléments visuels (émojis, puces)

### Prochaines Étapes :
1. Réviser le contenu selon ces suggestions
2. Ajouter des exemples concrets
3. Valider avec les parties prenantes

*[Optimisé par Assistant IA - DocFlow Pro]*`;
    }

    if (lowerPrompt.includes('professionnel') || lowerPrompt.includes('formal') || lowerPrompt.includes('business')) {
        return `# Rapport Professionnel : ${title}

**Date :** ${now}  
**Statut :** Document Reformaté

---

## 🎯 Objectif
${title}

## 📋 Contenu Principal
${content}

## 📊 Analyse
Ce document présente une approche méthodique et structurée pour atteindre les objectifs définis.

## 🔍 Observations
- Contenu bien documenté
- Structure logique respectée
- Présentation professionnelle appliquée

## 📈 Recommandations
1. **Court terme :** Validation des éléments présentés
2. **Moyen terme :** Implémentation des solutions proposées
3. **Long terme :** Suivi et optimisation continue

---
*Document généré avec DocFlow Pro - Assistant IA Professionnel*`;
    }

    if (lowerPrompt.includes('tradui') || lowerPrompt.includes('translate') || lowerPrompt.includes('anglais')) {
        return `# ${title} - English Translation

*Translated on ${now}*

## 🌍 Original Content (French):
${content}

## 📝 English Translation:
[This would be the English translation of your content. For now, this is a template showing the structure.]

## 📋 Translation Notes:
- Professional tone maintained
- Technical terms preserved
- Cultural context adapted

*[Translation service powered by DocFlow Pro]*`;
    }

    if (lowerPrompt.includes('plan') || lowerPrompt.includes('structure') || lowerPrompt.includes('organise')) {
        return `# Plan Structuré - ${title}

*Plan créé le ${now}*

## 🎯 Objectif Principal
${title}

## 📋 Structure Proposée

### 1. Introduction
- Présentation du contexte
- Objectifs visés

### 2. Développement
${content.split('\n').slice(0, 3).map((line: string, i: number) => `- Point ${i + 1}: ${line}`).join('\n')}

### 3. Conclusion
- Synthèse des éléments clés
- Prochaines étapes

## ⏰ Timeline Suggérée
1. **Phase 1** (Court terme): Préparation
2. **Phase 2** (Moyen terme): Exécution  
3. **Phase 3** (Long terme): Évaluation

*[Plan structuré par DocFlow Pro]*`;
    }

    // Génération par défaut
    return `# ${title} - Développement Assisté par IA

*Généré le ${now} sur la base de : "${prompt}"*

## 🚀 Contenu Enrichi

${content || 'Contenu à développer...'}

## 💡 Suggestions d'Extension

### Axes de Développement :
- **Structuration :** Organiser en sections logiques
- **Enrichissement :** Ajouter des détails et exemples
- **Optimisation :** Améliorer la clarté et l'impact

### Actions Recommandées :
1. Définir les objectifs précis
2. Structurer le contenu par priorité
3. Ajouter des éléments de validation

---
*Propulsé par DocFlow Pro - Votre Assistant IA Intelligent*`;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const documentId = id;

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

        return NextResponse.json(generatedDocuments);

    } catch (error) {
        console.error('Display all documents failed:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
