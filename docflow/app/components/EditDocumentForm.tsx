'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface Document {
  id: string
  title: string
  createdAt: string
  content?: string
}

interface EditDocumentFormProps {
  document: Document
  documentContent: string
  onSave: (title: string, content: string) => Promise<void>
  onCancel: () => void
  onShowAI: (show: boolean) => void
  showAI: boolean
  saveLoading: boolean
  saveError: string
}

export default function EditDocumentForm({
  document,
  documentContent,
  onSave,
  onCancel,
  onShowAI,
  showAI,
  saveLoading,
  saveError
}: EditDocumentFormProps) {
  const [editedTitle, setEditedTitle] = useState(document.title)
  const [editedContent, setEditedContent] = useState(documentContent)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState('')

  useEffect(() => {
    setEditedTitle(document.title)
    setEditedContent(documentContent)
  }, [document.id])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value)
  }, [])

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value)
  }, [])

  const handleSaveAndExit = async () => {
    await onSave(editedTitle, editedContent)
  }

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Please enter a prompt')
      return
    }
    setAiGenerating(true)
    setAiError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/documents/${document.id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          currentContent: editedContent
        })
      })
      if (!response.ok) {
        throw new Error('AI generation failed')
      }
      const data = await response.json()
      const generatedContent = data.generatedContent || data.content || data.text || ''
      if (!generatedContent) throw new Error('No content generated')
      setEditedContent(prev => prev + '\n\n' + generatedContent)
      setAiPrompt('')
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI error')
    } finally {
      setAiGenerating(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <input
          ref={titleInputRef}
          type="text"
          value={editedTitle}
          onChange={handleTitleChange}
          className="modal-title-input"
          placeholder="Titre du document"
        />

        <div className="modal-actions">
          <button
            onClick={() => onShowAI(!showAI)}
            className="auth-button-outline"
            style={{
              background: showAI
                ? 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                : 'var(--gray-100)',
              color: showAI ? 'white' : 'var(--gray-700)'
            }}
          >
            {showAI ? '🤖 Fermer IA' : '🤖 Assistant IA'}
          </button>
          <button
            onClick={handleSaveAndExit}
            disabled={saveLoading}
            className="cta-button"
            style={{ width: 'auto' }}
          >
            {saveLoading ? '🔄 Sauvegarde...' : '💾 Sauvegarder'}
          </button>
          <button
            onClick={onCancel}
            className="auth-button-outline"
          >
            ❌ Annuler
          </button>
        </div>
      </div>

      <div className='date-AI'>
        <div className="date-save-status">
          <p style={{
                color: 'var(--gray-600)',
                fontSize: 'var(--text-sm)',
                marginBottom: 'var(--space-lg)'
              }}>
                📅 Créé le {new Date(document.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
        </div>

        {/* Zone IA */}
        {showAI && (
          <div className="aiGenerator">
            <label className="aiPromptLabel" htmlFor="ai-prompt">
              AI Prompt
            </label>
            <textarea
              id="ai-prompt"
              className="aiPromptTextarea"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="Describe what you want the AI to generate..."
              disabled={aiGenerating}
              rows={3}
            />
            <button
              onClick={handleGenerateAI}
              disabled={aiGenerating}
              className="cta-button mx-auto generate-IA"
            >
              {aiGenerating ? 'Generating...' : 'Generate'}
            </button>
            {aiError && <div className="error-message">{aiError}</div>}
          </div>
        )}
      </div>

      {saveError && (
        <div className="error-message">
          ❌ {saveError}
        </div>
      )}

      <div className="document-content-area">
        <textarea
          ref={contentTextareaRef}
          value={editedContent}
          onChange={handleContentChange}
          className="content-textarea"
          placeholder="✍️ Commencez à écrire votre contenu..."
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  )
}