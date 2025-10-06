'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Document {
  id: string
  title: string
  createdAt: string
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
  const[saveError, setSaveError] = useState('')

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{
        width: '250px',
        backgroundColor: '#e5e7eb',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
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
          profile
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
          create doc
        </button>

        <div style={{ marginTop: '1rem' }}>
          {loading ? (
            <p>Chargement...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>Erreur: {error}</p>
          ) : (
            documents.map(doc => (
              <button
                key={doc.id}
                onClick={() => {
                  setActiveSection('documents')
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#93c5fd',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {doc.title || 'doc'}
              </button>
            ))
          )}
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
            <p>Formulaire de création de document</p>
          </div>
        )}

        {activeSection === 'documents' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              📋 My Documents ({documents.length})
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
              <div>
                <p>Liste des documents détaillée</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}