'use client'

import { useEffect, useState } from 'react'

interface Document {
  id: string
  title: string
  createdAt: string
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState<'profile' | 'create' | 'documents'>('documents')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No token found')
        return
      }

      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
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
            <p>Informations du profil utilisateur</p>
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