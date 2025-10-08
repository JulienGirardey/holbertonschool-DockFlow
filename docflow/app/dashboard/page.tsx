'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState<'profile' | 'create' | 'documents'>('documents')

  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [profilLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [userInfo, setUserInfo] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(false)
  const [userError, setUserError] = useState('')

  const router = useRouter()

  const [editingSettings, setEditingSettings] = useState(false)
  const [editLanguage, setEditLanguage] = useState('')
  const [editColorMode, setEditColorMode] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocContent, setNewDocContent] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

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

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchDocuments()
  }, [])

  useEffect(() => {
    if (activeSection === 'profile') {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      setProfileLoading(true)
      fetchUserSettings()
      fetchUserInfo()
    }
  }, [activeSection])

  useEffect(() => {
    if (selectedDocument) {
      fetchDocumentContent(selectedDocument.id)
    }
  }, [selectedDocument])

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch('/api/documents', {
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
        throw new Error('Failed to fetch documents')
      }

      const docs = await response.json()
      setDocuments(docs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching documents')
    } finally {
      setLoading(false)
    }
  }

  const generateWithAI = async () => {
    try {
      setAiGenerating(true)
      setAiError('')

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/documents/${selectedDocument?.id}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: aiPrompt })
      })

      if (!response.ok) {
        throw new Error('Failed to generate with AI')
      }

      const generatedDoc = await response.json()

      setEditedContent(generatedDoc.generatedContent || generatedDoc.content || generatedDoc.rawContent)
      setShowAiGenerator(false)
      setAiPrompt('')

      setIsDirty(true)

    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI generation failed')
    } finally {
      setAiGenerating(false)
    }
  }

  const fetchUserSettings = async () => {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch('/api/settings', {
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
        throw new Error('Failed to fetch settings')
      }
      const settings = await response.json()
      setUserSettings(settings)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Error fetching settings')
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchUserInfo = async () => {
    try {
      setUserLoading(true)
      const token = localStorage.getItem('token')

      const response = await fetch('/api/auth/me', {
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
        throw new Error('Failed to fetch settings')
      }

      const userInfoData = await response.json()
      setUserInfo(userInfoData)
    } catch (err) {
      setUserError(err instanceof Error ? err.message : 'Error fetching user info')
    } finally {
      setUserLoading(false)
    }
  }

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

      console.log('Request data:', requestData)

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
        console.log('API Error:', errorData)

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
      setActiveSection('documents')

    } catch (err) {
      console.error('Creation error:', err)
      setCreateError(err instanceof Error ? err.message : 'Error creating document')
    } finally {
      setCreateLoading(false)
    }
  }

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


  const closeDocumentView = () => {
    setSelectedDocument(null)
    setDocumentContent('')
    setContentError('')
  }

  // Delete this function as it's duplicated


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

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const saveDocumentChanges = async (title: string, content: string, showAutoSave = false) => {
    try {
      // Auto-save - no loading
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
        // auto-save, skiped error
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
        setError(errorData.error || 'Erreur lors de la suppress')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError('Erreur lors de la suppression du document')
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

  useEffect(() => {
    if (editingDocument && selectedDocument) {
      const hasChanges = editedTitle !== lastSavedTitle || editedContent !== lastSavedContent
      setIsDirty(hasChanges)

      if (hasChanges &&
        editedTitle.trim() &&
        editedContent.trim() &&
        Math.abs(editedContent.length - lastSavedTitle.length) > 5) {

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{
        width: '250px',
        backgroundColor: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0
      }}>

        {/* Navigation header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #d1d5db'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveSection('profile')}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: activeSection === 'profile' ? '#3b82f6' : '#93c5fd',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              👤 Profile
            </button>

            <button
              onClick={() => setActiveSection('create')}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: activeSection === 'create' ? '#3b82f6' : '#93c5fd',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📝 Create Doc
            </button>
          </div>
        </div>

        {/* scrollable document zone */}
        <div style={{
          flex: 1,
          padding: '1rem',
          overflow: 'auto',
          minHeight: 0
        }}>
          <h3 style={{
            color: '#374151',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Mes Documents
          </h3>

          {loading ? (
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Chargement...</p>
          ) : error ? (
            <p style={{ color: 'red', fontSize: '0.875rem' }}>Erreur: {error}</p>
          ) : documents.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.875rem', fontStyle: 'italic' }}>
              Aucun document
            </p>
          ) : (
            documents.map(doc => (
              <div
                key={doc.id}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                  e.currentTarget.style.borderColor = '#3b82f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                  e.currentTarget.style.borderColor = '#e5e7eb'
                }}
              >
                {/* ✅ CONTENU CLIQUABLE POUR OUVRIR */}
                <div 
                  onClick={() => setSelectedDocument(doc)}
                  style={{ cursor: 'pointer', flex: 1 }}
                >
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    color: '#111827'
                  }}>
                    {doc.title}
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    Créé le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <p style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: '500' }}>
                    Cliquez pour lire →
                  </p>
                </div>

                {/* ✅ BOUTONS SÉPARÉS */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={() => setSelectedDocument(doc)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    📄 Ouvrir
                  </button>
                  
                  <button
                    onClick={() => handleDeleteClick(doc.id)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      minWidth: '40px'
                    }}
                    title="Supprimer le document"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Fixe footer */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #d1d5db',
          backgroundColor: '#e5e7eb'
        }}>
          {/* Infos user */}
          {userInfo && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '0.5rem'
            }}>
              <p style={{
                color: '#374151',
                fontSize: '0.875rem',
                margin: 0,
                fontWeight: '500'
              }}>
                👋 {userInfo.firstName} {userInfo.lastName}
              </p>
              <p style={{
                color: '#6b7280',
                fontSize: '0.75rem',
                margin: 0
              }}>
                {userInfo.email}
              </p>
            </div>
          )}

          {/* disconnect button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444'
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '2rem' }}>
        {activeSection === 'profile' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              👤 Profile
            </h2>

            {(profilLoading || userLoading) ? (
              <p>Chargement du profil...</p>
            ) : (profileError || userError) ? (
              <div>
                {profileError && <p style={{ color: 'red' }}>Erreur settings: {profileError}</p>}
                {userError && <p style={{ color: 'red' }}>Erreur user: {userError}</p>}
              </div>
            ) : (userSettings && userInfo) ? (
              <div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>👤 Informations personnelles</h3>
                <p>First Name: {userInfo.firstName}</p>
                <p>Last Name: {userInfo.lastName}</p>
                <p>Email: {userInfo.email}</p>

                <h3 style={{ fontWeight: 'bold', margin: '2rem 0 1rem 0' }}>⚙️ Paramètres</h3>

                {editingSettings ? (
                  <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Language:
                      </label>
                      <select
                        value={editLanguage}
                        onChange={(e) => setEditLanguage(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem'
                        }}
                      >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Color Mode:
                      </label>
                      <select
                        value={editColorMode}
                        onChange={(e) => setEditColorMode(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem'
                        }}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    {saveError && (
                      <p style={{ color: 'red', marginBottom: '1rem' }}>
                        Erreur: {saveError}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={saveUserSettings}
                        disabled={saveLoading}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        {saveLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>

                      <button
                        onClick={cancelEdit}
                        disabled={saveLoading}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>Language: {userSettings.language}</p>
                    <p>Color Mode: {userSettings.colorMode}</p>

                    <button
                      onClick={startEdit}
                      style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      Modifier les paramètres
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p>Aucune donnée disponible</p>
            )}
          </div>
        )}

        {activeSection === 'create' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              📝 Create New Document
            </h2>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="put your task"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    backgroundColor: '#f9fafb',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <textarea
                  placeholder="text area where past your text"
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  rows={10}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    backgroundColor: '#f9fafb',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {createError && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  borderRadius: '0.375rem'
                }}>
                  {createError}
                </div>
              )}

              <button
                onClick={handleCreateDocument}
                disabled={createLoading || !newDocTitle.trim() || !newDocContent.trim()}
                className="login-button"
                style={{
                  width: 'auto',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  opacity: (createLoading || !newDocTitle.trim() || !newDocContent.trim()) ? 0.5 : 1
                }}
              >
                {createLoading ? 'Creating document...' : 'Generate doc'}
              </button>
            </div>
          </div>
        )}

        {activeSection === 'documents' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              📋 Mes Documents {documents.length}
            </h2>

            {documents.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem'
              }}>
                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1rem' }}>
                  Vous n'avez pas encore de documents
                </p>
                <button
                  onClick={() => setActiveSection('create')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Créer votre premier document
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    style={{
                      backgroundColor: 'white',
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                      e.currentTarget.style.borderColor = '#3b82f6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                    }}
                  >
                    {/* ✅ CONTENU CLIQUABLE POUR OUVRIR */}
                    <div 
                      onClick={() => setSelectedDocument(doc)}
                      style={{ cursor: 'pointer', flex: 1 }}
                    >
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        color: '#111827'
                      }}>
                        {doc.title}
                      </h3>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem'
                      }}>
                        Créé le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <p style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: '500' }}>
                        Cliquez pour lire →
                      </p>
                    </div>

                    {/* ✅ BOUTONS SÉPARÉS */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <button
                        onClick={() => setSelectedDocument(doc)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        📄 Ouvrir
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(doc.id)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          minWidth: '40px'
                        }}
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

        {selectedDocument && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              maxWidth: '900px',
              width: '95%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}>
              {/* Header with title and button */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem'
              }}>
                {editingDocument ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#111827',
                      border: '2px solid #3b82f6',
                      borderRadius: '0.25rem',
                      padding: '0.5rem',
                      backgroundColor: '#eff6ff',
                      flex: 1,
                      marginRight: '1rem'
                    }}
                    placeholder="Titre du document"
                  />
                ) : (
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                    {selectedDocument.title}
                  </h2>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {/* auto-save indicator */}
                  {editingDocument && (
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {autoSaving ? (
                        <span style={{ color: '#10b981' }}>💾 Sauvegarde...</span>
                      ) : isDirty ? (
                        <span style={{ color: '#ef4444' }}>● Non sauvegardé</span>
                      ) : (
                        <span style={{ color: '#10b981' }}>✓ Sauvegardé</span>
                      )}
                    </div>
                  )}

                  {editingDocument ? (
                    <>
                      <button
                        onClick={() => setShowAiGenerator(!showAiGenerator)}
                        style={{
                          backgroundColor: showAiGenerator ? '#8b5cf6' : '#a855f7',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {showAiGenerator ? 'Fermer IA' : 'IA'}
                      </button>

                      <button
                        onClick={saveAndExitEdit}
                        disabled={saveDocLoading}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {saveDocLoading ? 'Sauvegarde...' : '💾 Sauvegarder'}
                      </button>
                      <button
                        onClick={cancelEditDocument}
                        style={{
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={startEditDocument}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}
                    >
                      ✏️ Modifier
                    </button>
                  )}

                  <button
                    onClick={closeDocumentView}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    ✕ Fermer
                  </button>
                </div>
              </div>

              {/* creation date */}
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Créé le {new Date(selectedDocument.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>

              {/* error message */}
              {saveDocError && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  borderRadius: '0.375rem'
                }}>
                  {saveDocError}
                </div>
              )}

              {/* doc content */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                minHeight: '400px'
              }}>
                {loadingContent ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    Chargement du contenu...
                  </p>
                ) : contentError ? (
                  <p style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>
                    Erreur: {contentError}
                  </p>
                ) : editingDocument ? (
                  // edition mode
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '400px',
                      padding: '1.5rem',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      color: '#374151',
                      backgroundColor: 'white',
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Commencez à écrire votre contenu..."
                  />
                ) : (
                  // Reading mode
                  <div style={{
                    padding: '1.5rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6',
                    fontSize: '1rem',
                    color: '#374151'
                  }}>
                    {documentContent}
                  </div>
                )}
              </div>

              {/* Panel IA */}
              {editingDocument && showAiGenerator && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  border: '2px solid #8b5cf6',
                  borderRadius: '0.5rem'
                }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: '#7c3aed',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    🤖 Assistant IA
                  </h4>

                  <div style={{ marginBottom: '1rem' }}>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Décrivez ce que vous voulez que l'IA fasse... 
                      Exemples :
                      • Améliore ce texte
                      • Fais un résumé en 3 points
                      • Traduis en anglais
                      • Rend le ton plus professionnel
                      • Ajoute des exemples"
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #c7d2fe',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'white',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {aiError && (
                    <div style={{
                      marginBottom: '1rem',
                      padding: '0.75rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fca5a5',
                      color: '#dc2626',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}>
                      ❌ {aiError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={generateWithAI}
                      disabled={aiGenerating || !aiPrompt.trim()}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: aiGenerating ? '#9ca3af' : '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: aiGenerating ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
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
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Annuler
                    </button>
                  </div>

                  <div style={{
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    💡 L'IA remplacera votre contenu actuel. Sauvegardez d'abord si nécessaire !
                  </div>
                </div>
              )}

              {/* edition help */}
              {editingDocument && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  color: '#1e40af'
                }}>
                  💡 <strong>Aide :</strong> Vos modifications sont sauvegardées automatiquement toutes les 2 secondes.
                  Utilisez "Sauvegarder" pour forcer la sauvegarde et quitter le mode édition.
                </div>
              )}
            </div>
          </div>
        )}
        {/* DELETE MODAL */}
        {deleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
              width: '90%'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  ⚠️
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Supprimer ce document ?
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  Cette action est irréversible. Le document "{documents.find(d => d.id === deleteConfirm)?.title}" sera définitivement supprimé.
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center'
              }}>
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    opacity: isDeleting ? 0.5 : 1
                  }}
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    opacity: isDeleting ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
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
                    <>
                      🗑️ Supprimer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}