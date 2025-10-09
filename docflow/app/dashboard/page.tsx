'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '../components/ThemeToggle'
import LoadingScreen from '../components/LoadingScreen'

interface Document {
  id: string
  title: string
  createdAt: string
  content?: string
}

interface UserSettings {
  language: string
  colorMode: string
}

interface User {
  firstName: string
  lastName: string
  email: string
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [sidebarLoading, setSidebarLoading] = useState(true)
  const [sidebarError, setSidebarError] = useState('')
  const [activeSection, setActiveSection] = useState<'profile' | 'create' | 'documents' | 'document'>('documents')

  // ✅ States séparés pour chaque section
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [documentsError, setDocumentsError] = useState('')

  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [userInfo, setUserInfo] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  const router = useRouter()

  const [editingSettings, setEditingSettings] = useState(false)
  const [editLanguage, setEditLanguage] = useState('')
  const [editColorMode, setEditColorMode] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocContent, setNewDocContent] = useState('')

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [documentContent, setDocumentContent] = useState('')
  const [loadingContent, setLoadingContent] = useState(false)
  const [contentError, setContentError] = useState('')

  const [editingDocument, setEditingDocument] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [saveDocLoading, setSaveDocLoading] = useState(false)
  const [saveDocError, setSaveDocError] = useState('')
  const [autoSaving, setAutoSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedContent, setLastSavedContent] = useState('')
  const [lastSavedTitle, setLastSavedTitle] = useState('')

  const [aiPrompt, setAiPrompt] = useState('')
  const [showAiGenerator, setShowAiGenerator] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState('')

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // ✅ Nouveau state pour contrôler l'animation de la section main uniquement
  const [mainContentKey, setMainContentKey] = useState(0)

  // ✅ Chargement initial - sidebar uniquement
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    // Charger données sidebar en parallèle
    Promise.all([
      fetchDocumentsForSidebar(),
      fetchUserInfo()
    ]).finally(() => {
      setSidebarLoading(false)
    })
  }, [])

  // ✅ Chargement conditionnel selon la section active
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Charger les données selon la section active
    switch (activeSection) {
      case 'profile':
        if (!userSettings) {
          setProfileLoading(true)
          fetchUserSettings().finally(() => setProfileLoading(false))
        }
        break
      
      case 'documents':
        if (documents.length === 0 && !documentsLoading) {
          setDocumentsLoading(true)
          fetchDocuments().finally(() => setDocumentsLoading(false))
        }
        break
      
      case 'create':
        // Pas de chargement nécessaire pour create
        break
    }
  }, [activeSection])

  // ✅ Chargement document spécifique
  useEffect(() => {
    if (selectedDocument) {
      fetchDocumentContent(selectedDocument.id)
      setActiveSection('document')
    }
  }, [selectedDocument])

  // ✅ Auto-save effect
  useEffect(() => {
    if (editingDocument && selectedDocument) {
      const hasChanges = editedTitle !== lastSavedTitle || editedContent !== lastSavedContent
      setIsDirty(hasChanges)

      if (hasChanges &&
        editedTitle.trim() &&
        editedContent.trim() &&
        Math.abs(editedContent.length - lastSavedContent.length) > 5) {

        const autoSaveTimer = setTimeout(() => {
          if (editedTitle.trim() !== lastSavedTitle.trim() ||
            editedContent.trim() !== lastSavedContent.trim()) {
            saveDocumentChanges(editedTitle, editedContent, true)
          }
        }, 2000)

        return () => clearTimeout(autoSaveTimer)
      }
    }
  }, [editedTitle, editedContent, editingDocument, lastSavedTitle, lastSavedContent])

  // ✅ Fonction pour charger seulement les documents pour la sidebar (légère)
  const fetchDocumentsForSidebar = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/documents?lite=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch documents')
      }

      const docs = await response.json()
      setDocuments(docs)
    } catch (err) {
      setSidebarError(err instanceof Error ? err.message : 'Error fetching documents')
    }
  }

  // ✅ Fonction pour charger tous les documents (section documents)
  const fetchDocuments = async () => {
    try {
      setDocumentsError('')
      const token = localStorage.getItem('token')
      const response = await fetch('/api/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch documents')
      }

      const docs = await response.json()
      setDocuments(docs)
    } catch (err) {
      setDocumentsError(err instanceof Error ? err.message : 'Error fetching documents')
    }
  }

  // fetch users settings
  const fetchUserSettings = async () => {
    try {
      setProfileError('')
      const token = localStorage.getItem('token')
      const response = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch settings')
      }
      
      const settings = await response.json()
      setUserSettings(settings)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Error fetching settings')
    }
  }

  // fetch user info
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch user info')
      }

      const userInfoData = await response.json()
      setUserInfo(userInfoData)
    } catch (err) {
      console.error('Error fetching user info:', err)
    } finally {
      setUserLoading(false)
    }
  }

  // save user settings
  const saveUserSettings = async () => {
    try {
      setSaveLoading(true)
      setSaveError('')
      const token = localStorage.getItem('token')

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language: editLanguage,
          colorMode: editColorMode
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Failed to save settings')
      }

      setUserSettings({
        language: editLanguage,
        colorMode: editColorMode
      })

      setEditingSettings(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error saving settings')
    } finally {
      setSaveLoading(false)
    }
  }

  // handle button action
  const cancelEdit = () => {
    setEditingSettings(false)
    setEditLanguage(userSettings?.language || '')
    setEditColorMode(userSettings?.colorMode || '')
    setSaveError('')
  }

  const startEdit = () => {
    setEditingSettings(true)
    setEditLanguage(userSettings?.language || '')
    setEditColorMode(userSettings?.colorMode || '')
  }

  // create document
  const handleCreateDocument = async () => {
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
      setDocuments(prev => [newDocument, ...prev])
      setNewDocTitle('')
      setNewDocContent('')
      handleSectionChange('documents')

    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error creating document')
    } finally {
      setCreateLoading(false)
    }
  }

  // fetch document content
  const fetchDocumentContent = async (documentId: string) => {
    try {
      setLoadingContent(true)
      setContentError('')

      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch document content')
      }

      const document = await response.json()
      setDocumentContent(document.rawContent || 'Aucun contenu disponible')

    } catch (err) {
      setContentError(err instanceof Error ? err.message : 'Error fetching document')
    } finally {
      setLoadingContent(false)
    }
  }

  const cancelEditDocument = () => {
    setEditingDocument(false)
    setEditedTitle('')
    setEditedContent('')
    setSaveDocError('')
  }

  const saveAndExitEdit = async () => {
    await saveDocumentChanges(editedTitle, editedContent)
    setEditingDocument(false)
  }

  const saveDocumentChanges = async (title: string, content: string, showAutoSave = false) => {
    try {
      if (showAutoSave) {
        setAutoSaving(true)
      } else {
        setSaveDocLoading(true)
      }
      setSaveDocError('')

      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/documents/${selectedDocument?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          rawContent: content.trim(),
          objective: title.trim()
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        if (!showAutoSave) {
          throw new Error('Failed to save document')
        }
        return
      }

      const updatedDoc = await response.json()

      setDocuments(prev => prev.map(doc =>
        doc.id === selectedDocument?.id ? { ...doc, title: updatedDoc.title } : doc
      ))

      if (selectedDocument) {
        setSelectedDocument({ ...selectedDocument, title: updatedDoc.title })
      }

      setDocumentContent(updatedDoc.rawContent || content)

      if (showAutoSave) {
        setLastSavedContent(content)
        setLastSavedTitle(title)
        setIsDirty(false)
      }

    } catch (err) {
      if (!showAutoSave) {
        setSaveDocError(err instanceof Error ? err.message : 'Error saving document')
      }
    } finally {
      if (showAutoSave) {
        setTimeout(() => setAutoSaving(false), 500)
      } else {
        setSaveDocLoading(false)
      }
    }
  }

  const handleDeleteClick = (documentId: string) => {
    setDeleteConfirm(documentId)
  }

  const handleCancelDelete = () => {
    setDeleteConfirm(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/documents/${deleteConfirm}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== deleteConfirm))

        if (selectedDocument?.id === deleteConfirm) {
          setSelectedDocument(null)
          setDocumentContent('')
        }

        setDeleteConfirm(null)
        console.log('Document supprimé avec succès')

      } else {
        const errorData = await response.json()
        setDeleteError(errorData.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setDeleteError('Erreur lors de la suppression du document')
    } finally {
      setIsDeleting(false)
    }
  }

  const startEditDocument = () => {
    if (selectedDocument) {
      setEditingDocument(true)
      setEditedTitle(selectedDocument.title)
      setEditedContent(documentContent)
      setSaveDocError('')

      setLastSavedTitle(selectedDocument.title)
      setLastSavedContent(documentContent)
      setIsDirty(false)
    }
  }

  // ✅ Fonction AI corrigée
  const generateWithAI = async () => {
    try {
      setAiGenerating(true)
      setAiError('')

      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          content: editedContent
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      setEditedContent(data.generatedContent)
      setAiPrompt('')
      setShowAiGenerator(false)

    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Error generating content')
    } finally {
      setAiGenerating(false)
    }
  }

  // ✅ Composant Loading pour les différentes sections
  const SectionLoading = ({ message = "Chargement..." }: { message?: string }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '300px',
      color: 'var(--gray-600)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--gray-200)',
          borderTop: '4px solid var(--primary-600)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto var(--space-md)'
        }}></div>
        🔄 {message}
      </div>
    </div>
  )

  // ✅ Fonction modifiée pour changer de section avec animation isolée
  const handleSectionChange = (section: 'profile' | 'create' | 'documents' | 'document') => {
    if (activeSection === 'document' && section !== 'document') {
      setSelectedDocument(null)
      setDocumentContent('')
      setContentError('')
      setEditingDocument(false)
      setShowAiGenerator(false)
    }
    
    setActiveSection(section)
    setMainContentKey(prev => prev + 1)
  }

  // ✅ Fonction modifiée pour sélectionner un document avec animation isolée
  const handleDocumentSelect = (doc: Document) => {
    setSelectedDocument(doc)
    setMainContentKey(prev => prev + 1)
  }

  // ✅ Fonction modifiée pour retourner aux documents avec animation isolée
  const backToDocuments = () => {
    setSelectedDocument(null)
    setDocumentContent('')
    setContentError('')
    setEditingDocument(false)
    setShowAiGenerator(false)
    setActiveSection('documents')
    setMainContentKey(prev => prev + 1)
  }

  // ✅ Composant MainContent avec transition CSS simple
  const MainContent = () => {
    return (
      <div key={mainContentKey} style={{ 
        width: '100%', 
        height: '100%',
        animation: 'fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        
        {/* ✅ Document View */}
        {activeSection === 'document' && selectedDocument && (
          <div>
            {/* Header avec bouton retour */}
            <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <button
                onClick={backToDocuments}
                className="back-button auth-button-outline"
                style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
              >
                ← Retour
              </button>
              
              {editingDocument ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="modal-title-input"
                  placeholder="Titre du document"
                  style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}
                />
              ) : (
                <h2 className="section-title" style={{ margin: 0 }}>
                  📄 {selectedDocument.title}
                </h2>
              )}

              <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                {editingDocument && (
                  <div className="save-indicator">
                    {autoSaving ? (
                      <span className="saving">💾 Sauvegarde...</span>
                    ) : isDirty ? (
                      <span className="dirty">● Non sauvegardé</span>
                    ) : (
                      <span className="saved">✅ Sauvegardé</span>
                    )}
                  </div>
                )}

                {editingDocument ? (
                  <>
                    <button
                      onClick={() => setShowAiGenerator(!showAiGenerator)}
                      className="auth-button-outline"
                      style={{
                        background: showAiGenerator
                          ? 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                          : 'var(--gray-100)',
                        color: showAiGenerator ? 'white' : 'var(--gray-700)'
                      }}
                    >
                      {showAiGenerator ? '🤖 Fermer IA' : '🤖 Assistant IA'}
                    </button>

                    <button
                      onClick={saveAndExitEdit}
                      disabled={saveDocLoading}
                      className="cta-button"
                      style={{ width: 'auto' }}
                    >
                      {saveDocLoading ? '🔄 Sauvegarde...' : '💾 Sauvegarder'}
                    </button>

                    <button
                      onClick={cancelEditDocument}
                      className="auth-button-outline"
                    >
                      ❌ Annuler
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startEditDocument}
                    className="auth-button-primary"
                  >
                    ✏️ Modifier
                  </button>
                )}
              </div>
            </div>

            {/* Date */}
            <p style={{
              color: 'var(--gray-600)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-lg)'
            }}>
              📅 Créé le {new Date(selectedDocument.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>

            {/* Erreur */}
            {saveDocError && (
              <div className="error-message">
                ❌ {saveDocError}
              </div>
            )}

            {/* Panel IA */}
            {editingDocument && showAiGenerator && (
              <div className="ai-panel" style={{ marginBottom: 'var(--space-lg)' }}>
                <h4 className="ai-title">
                  🤖 Assistant IA DocFlow
                </h4>

                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="🎯 Que voulez-vous faire avec l'IA ?

Exemples :
• Améliore ce texte pour le rendre plus professionnel
• Fais un résumé en 3 points clés  
• Traduis ce texte en anglais
• Rend le ton plus dynamique et engageant
• Ajoute des exemples concrets
• Réécris avec un style plus formel"
                  rows={4}
                  className="ai-textarea"
                />

                {aiError && (
                  <div className="error-message">
                    ❌ {aiError}
                  </div>
                )}

                <div className="ai-actions">
                  <button
                    onClick={generateWithAI}
                    disabled={aiGenerating || !aiPrompt.trim()}
                    className="cta-button"
                    style={{
                      width: 'auto',
                      opacity: (!aiPrompt.trim()) ? 0.5 : 1
                    }}
                  >
                    {aiGenerating ? '🔄 Génération...' : '✨ Générer avec IA'}
                  </button>

                  <button
                    onClick={() => {
                      setShowAiGenerator(false)
                      setAiPrompt('')
                      setAiError('')
                    }}
                    className="auth-button-outline"
                  >
                    ❌ Fermer
                  </button>
                </div>

                <div className="ai-help-text">
                  💡 L'IA remplacera votre contenu actuel. Sauvegardez d'abord si nécessaire !
                </div>
              </div>
            )}

            {/* Contenu du document */}
            <div className="document-content-area">
              {loadingContent ? (
                <p style={{ textAlign: 'center', color: 'var(--gray-600)', padding: 'var(--space-2xl)' }}>
                  🔄 Chargement du contenu...
                </p>
              ) : contentError ? (
                <p style={{ color: '#ef4444', textAlign: 'center', padding: 'var(--space-2xl)' }}>
                  ❌ {contentError}
                </p>
              ) : editingDocument ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="content-textarea"
                  placeholder="✍️ Commencez à écrire votre contenu..."
                  style={{ minHeight: '400px' }}
                />
              ) : (
                <div className="content-display" style={{ minHeight: '400px' }}>
                  {documentContent}
                </div>
              )}
            </div>

            {/* Aide édition */}
            {editingDocument && (
              <div className="edit-help">
                💡 <strong>Mode édition:</strong> Vos modifications sont sauvegardées automatiquement toutes les 2 secondes.
                Cliquez sur "Sauvegarder" pour forcer la sauvegarde et quitter le mode édition.
              </div>
            )}
          </div>
        )}

        {/* ✅ Profile Section avec loading isolé */}
        {activeSection === 'profile' && (
          <div>
            <div className="section-header">
              <h2 className="section-title">👤 Mon Profil</h2>
            </div>

            <div className="profile-content">
              {profileLoading ? (
                <SectionLoading message="Chargement du profil..." />
              ) : profileError ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                  <p style={{ color: '#ef4444' }}>❌ {profileError}</p>
                  <button 
                    onClick={() => {
                      setProfileLoading(true)
                      fetchUserSettings().finally(() => setProfileLoading(false))
                    }}
                    className="auth-button-primary"
                    style={{ marginTop: 'var(--space-md)' }}
                  >
                    🔄 Réessayer
                  </button>
                </div>
              ) : (userSettings && userInfo) ? (
                <div>
                  <div className="profile-section">
                    <h3 className="profile-section-title">
                      🙋‍♂️ Informations personnelles
                    </h3>
                    <p><strong>Prénom:</strong> {userInfo.firstName}</p>
                    <p><strong>Nom:</strong> {userInfo.lastName}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                  </div>

                  <div className="profile-section">
                    <h3 className="profile-section-title">
                      ⚙️ Paramètres de l'application
                    </h3>

                    {editingSettings ? (
                      <div className="settings-form">
                        <div className="form-group">
                          <label className="form-label">
                            🌐 Langue:
                          </label>
                          <select
                            value={editLanguage}
                            onChange={(e) => setEditLanguage(e.target.value)}
                            className="form-select"
                          >
                            <option value="en">🇺🇸 English</option>
                            <option value="fr">🇫🇷 Français</option>
                            <option value="es">🇪🇸 Español</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            🎨 Mode couleur:
                          </label>
                          <select
                            value={editColorMode}
                            onChange={(e) => setEditColorMode(e.target.value)}
                            className="form-select"
                          >
                            <option value="light">☀️ Clair</option>
                            <option value="dark">🌙 Sombre</option>
                          </select>
                        </div>

                        {saveError && (
                          <div className="error-message">
                            ❌ {saveError}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                          <button
                            onClick={saveUserSettings}
                            disabled={saveLoading}
                            className="cta-button"
                            style={{ width: 'auto' }}
                          >
                            {saveLoading ? '🔄 Sauvegarde...' : '💾 Sauvegarder'}
                          </button>

                          <button
                            onClick={cancelEdit}
                            disabled={saveLoading}
                            className="auth-button-outline"
                          >
                            ❌ Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p><strong>Langue:</strong> {userSettings.language === 'fr' ? '🇫🇷 Français' : userSettings.language === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}</p>
                        <p><strong>Mode:</strong> {userSettings.colorMode === 'light' ? '☀️ Clair' : '🌙 Sombre'}</p>

                        <button
                          onClick={startEdit}
                          className="auth-button-primary"
                          style={{ marginTop: 'var(--space-lg)' }}
                        >
                          ✏️ Modifier les paramètres
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <SectionLoading message="Initialisation du profil..." />
              )}
            </div>
          </div>
        )}

        {/* ✅ Create Section */}
        {activeSection === 'create' && (
          <div>
            <div className="section-header">
              <h2 className="section-title">📝 Créer un nouveau document</h2>
            </div>

            <div className="create-content">
              {createError && (
                <div className="error-message">❌ {createError}</div>
              )}

              <form className="create-form" onSubmit={(e) => { e.preventDefault(); handleCreateDocument(); }}>
                <div>
                  <input
                    type="text"
                    placeholder="🎯 Titre de votre document..."
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="create-input"
                  />
                </div>

                <div>
                  <textarea
                    placeholder="📝 Contenu de votre document... 

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
                  {createLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Création en cours...
                    </span>
                  ) : '🚀 Générer le document'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ✅ Documents Section avec loading isolé */}
        {activeSection === 'documents' && (
          <div>
            <div className="section-header">
              <h2 className="section-title">Mes Documents ({documents.length})</h2>
            </div>

            {documentsLoading ? (
              <SectionLoading message="Chargement des documents..." />
            ) : documentsError ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                <p style={{ color: '#ef4444' }}>❌ {documentsError}</p>
                <button 
                  onClick={() => {
                    setDocumentsLoading(true)
                    fetchDocuments().finally(() => setDocumentsLoading(false))
                  }}
                  className="auth-button-primary"
                  style={{ marginTop: 'var(--space-md)' }}
                >
                  🔄 Réessayer
                </button>
              </div>
            ) : documents.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>📄</div>
                <p className="empty-state-text">Vous n'avez pas encore de documents</p>
                <button
                  onClick={() => handleSectionChange('create')}
                  className="cta-button"
                >
                  ✨ Créer votre premier document
                </button>
              </div>
            ) : (
              <div className="documents-grid">
                {documents.map(doc => (
                  <div key={doc.id} className="document-card">
                    <div
                      onClick={() => handleDocumentSelect(doc)}
                      style={{ cursor: 'pointer', flex: 1 }}
                    >
                      <h3 className="document-title">
                        {doc.title}
                      </h3>
                      <p className="document-date">
                        📅 Créé le {new Date(doc.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="document-preview-text">
                        Cliquer pour lire et modifier
                      </p>
                    </div>

                    <div className="document-actions">
                      <button
                        onClick={() => handleDocumentSelect(doc)}
                        className="doc-action-btn doc-open-btn"
                      >
                        📖 Ouvrir
                      </button>

                      <button
                        onClick={() => handleDeleteClick(doc.id)}
                        className="doc-action-btn doc-delete-btn"
                        title="Supprimer le document"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* ✅ Theme Toggle */}
      <div className="dashboard-theme-toggle">
        <ThemeToggle />
      </div>

      {/* ✅ Sidebar - statique, pas d'animation */}
      <div className="dashboard-sidebar">
        {/* Navigation header */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <button
              onClick={() => handleSectionChange('profile')}
              className={`sidebar-nav-button ${activeSection === 'profile' ? 'active' : ''}`}
            >
              👤 Profile
            </button>

            <button
              onClick={() => handleSectionChange('create')}
              className={`sidebar-nav-button ${activeSection === 'create' ? 'active' : ''}`}
            >
              📝 Create Doc
            </button>

            <button
              onClick={() => handleSectionChange('documents')}
              className={`sidebar-nav-button ${activeSection === 'documents' ? 'active' : ''}`}
            >
              📋 Documents
            </button>
          </div>
        </div>

        {/* Documents scrollables */}
        <div className="sidebar-documents">
          <h3 className="documents-title">
            📚 Mes Documents ({documents.length})
          </h3>

          {sidebarLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid var(--gray-200)',
                borderTop: '2px solid var(--primary-600)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto var(--space-sm)'
              }}></div>
              <p style={{ color: 'var(--gray-600)', fontSize: 'var(--text-sm)' }}>
                🔄 Chargement...
              </p>
            </div>
          ) : sidebarError ? (
            <p style={{ color: '#ef4444', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-lg)' }}>
              ❌ {sidebarError}
            </p>
          ) : documents.length === 0 ? (
            <p style={{
              color: 'var(--gray-600)',
              fontSize: 'var(--text-sm)',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: 'var(--space-lg)'
            }}>
              📄 Aucun document
            </p>
          ) : (
            documents.slice(0, 5).map(doc => (
              <div key={doc.id} className="document-card-sidebar">
                <div
                  onClick={() => handleDocumentSelect(doc)}
                  style={{ cursor: 'pointer', flex: 1 }}
                >
                  <h3 className="document-title-sidebar">
                    {doc.title.length > 30 ? doc.title.substring(0, 30) + '...' : doc.title}
                  </h3>
                  <p className="document-date-sidebar">
                    📅 {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))
          )}

          {documents.length > 5 && (
            <div style={{
              textAlign: 'center',
              marginTop: 'var(--space-md)',
              color: 'var(--gray-600)',
              fontSize: 'var(--text-sm)'
            }}>
              + {documents.length - 5} autres documents
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          {userLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid var(--gray-200)',
                borderTop: '2px solid var(--primary-600)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
          ) : userInfo ? (
            <div className="user-info-card">
              <p className="user-name">
                {userInfo.firstName} {userInfo.lastName}
              </p>
              <p className="user-email">
                {userInfo.email}
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-md)', color: 'var(--gray-600)' }}>
              ❌ Erreur utilisateur
            </div>
          )}

          <button onClick={() => {
            localStorage.removeItem('token')
            router.push('/login')
          }} className="logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* ✅ Main content avec animation isolée */}
      <div className="dashboard-main">
        <MainContent />
      </div>

      {/* ✅ Modal Delete */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-icon">⚠️</div>
            <h3 className="delete-title">
              Supprimer ce document ?
            </h3>
            <p className="delete-description">
              Cette action est irréversible. Le document <strong>"{documents.find(d => d.id === deleteConfirm)?.title}"</strong> sera définitivement supprimé.
            </p>

            <div className="delete-actions">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="auth-button-outline"
                style={{ opacity: isDeleting ? 0.5 : 1 }}
              >
                ❌ Annuler
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="doc-action-btn doc-delete-btn"
                style={{
                  opacity: isDeleting ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)'
                }}
              >
                {isDeleting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Suppression...
                  </>
                ) : (
                  <>🗑️ Supprimer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

