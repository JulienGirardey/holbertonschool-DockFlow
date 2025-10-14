'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface CreateDocumentFormProps {
  onDocumentCreated: (document: any) => void
  onSectionChange: (section: 'profile' | 'create' | 'documents' | 'document') => void
}

export default function CreateDocumentForm({ onDocumentCreated, onSectionChange }: CreateDocumentFormProps) {
  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocContent, setNewDocContent] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const router = useRouter()

  const handleCreateDocument = useCallback(async () => {
    try {
      setCreateLoading(true)
      setCreateError('')

      const token = localStorage.getItem('token')
      const requestData = {
        title: newDocTitle.trim(),
        objective: newDocTitle.trim(),
        rawContent: newDocContent.trim()
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error(errorData.error || 'Failed to create document')
      }

      const newDocument = await response.json()
      onDocumentCreated(newDocument)
      setNewDocTitle('')
      setNewDocContent('')
      onSectionChange('documents')

    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error creating document')
    } finally {
      setCreateLoading(false)
    }
  }, [newDocTitle, newDocContent, router, onDocumentCreated, onSectionChange])

  return (
    <div className="create-section">
      <div>
        <h2 style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-md)'
        }}>
          Créer un nouveau document
        </h2>

        <p style={{
          color: 'var(--gray-600)',
          fontSize: 'var(--text-base)',
          marginBottom: 'var(--space-xl)'
        }}>
          Notre IA va transformer votre idée en document professionnel
        </p>
      </div>

      {createError && (
        <div className="error-message" style={{
          background: 'var(--red-50)',
          border: '1px solid var(--red-200)',
          color: 'var(--red-800)',
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-lg)'
        }}>
          <strong>Erreur:</strong> {createError}
        </div>
      )}

      <form className="create-form" onSubmit={(e) => { e.preventDefault(); handleCreateDocument(); }}>
        <div>
          <input
            type="text"
            placeholder="Titre de votre document..."
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            className="create-input"
          />
        </div>

        <div>
          <textarea
            placeholder="Contenu de votre document... 
            Conseil: Décrivez votre idée, notre IA l'améliorera pour vous !"
            value={newDocContent}
            onChange={(e) => setNewDocContent(e.target.value)}
            className="create-textarea"
            rows={12}
          />
        </div>

        <button
          type="submit"
          disabled={createLoading || !newDocTitle.trim() || !newDocContent.trim()}
          className="cta-button"
          style={{
            width: 'auto',
            alignSelf: 'flex-start',
            opacity: (createLoading || !newDocTitle.trim() || !newDocContent.trim()) ? 0.5 : 1
          }}
        >
          {createLoading ? '🔄 Création en cours...' : 'Créer le document'}
        </button>
      </form>
    </div>
  )
}