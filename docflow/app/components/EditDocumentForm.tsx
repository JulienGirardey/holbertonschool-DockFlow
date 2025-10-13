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
  onSave: (title: string, content: string, isAutoSave?: boolean) => Promise<void>
  onCancel: () => void
  onShowAI: (show: boolean) => void
  showAI: boolean
  saveLoading: boolean
  saveError: string
  autoSaving: boolean
  isDirty: boolean
}

export default function EditDocumentForm({
  document,
  documentContent,
  onSave,
  onCancel,
  onShowAI,
  showAI,
  saveLoading,
  saveError,
  autoSaving,
  isDirty
}: EditDocumentFormProps) {
  const [editedTitle, setEditedTitle] = useState(document.title)
  const [editedContent, setEditedContent] = useState(documentContent)
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Mettre à jour les states si le document change
  useEffect(() => {
    setEditedTitle(document.title)
    setEditedContent(documentContent)
  }, [document.id, document.title, documentContent])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setEditedTitle(newTitle)

    // Auto-save après 2 secondes d'inactivité
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    autoSaveTimerRef.current = setTimeout(() => {
      if (newTitle.trim() && editedContent.trim()) {
        onSave(newTitle, editedContent, true)
      }
    }, 2000)
  }, [editedContent, onSave])

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setEditedContent(newContent)

    // Auto-save après 2 secondes d'inactivité
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    autoSaveTimerRef.current = setTimeout(() => {
      if (editedTitle.trim() && newContent.trim()) {
        onSave(editedTitle, newContent, true)
      }
    }, 2000)
  }, [editedTitle, onSave])

  const handleSaveAndExit = async () => {
    await onSave(editedTitle, editedContent)
  }

  // Nettoyage du timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  return (
    <div>
      {/* Header avec bouton retour */}
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <input
          ref={titleInputRef}
          type="text"
          value={editedTitle}
          onChange={handleTitleChange}
          className="modal-title-input"
          placeholder="Titre du document"
          style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}
        />

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
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

      <div className='date-save-status'>
        {/* Date */}
        <p style={{
          color: 'var(--gray-600)',
          fontSize: 'var(--text-sm)'
        }}>
          📅 Créé le {new Date(document.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>

        <div className="save-indicator">
          {autoSaving ? (
            <span className="saving">🔄 Sauvegarde...</span>
          ) : isDirty ? (
            <span className="dirty">● Non sauvegardé</span>
          ) : (
            <span className="saved">✅ Sauvegardé</span>
          )}
        </div>
      </div>

      {/* Erreur */}
      {saveError && (
        <div className="error-message">
          ❌ {saveError}
        </div>
      )}

      {/* Contenu du document */}
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

      {/* Aide édition */}
      <div className="edit-help">
        💡 <strong>Mode édition:</strong> Vos modifications sont sauvegardées automatiquement toutes les 2 secondes.
        Cliquez sur "Sauvegarder" pour forcer la sauvegarde et quitter le mode édition.
      </div>
    </div>
  )
}