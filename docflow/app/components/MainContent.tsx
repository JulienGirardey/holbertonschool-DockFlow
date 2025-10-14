import CreateDocumentForm from './CreateDocumentForm'
import EditDocumentForm from './EditDocumentForm'
import { useState } from 'react'

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

interface MainContentProps {
  activeSection: string
  selectedDocument: Document | null
  documentContent: string
  loadingContent: boolean
  contentError: string
  editingDocument: boolean
  showAiGenerator: boolean
  userSettings: UserSettings | null
  userInfo: User | null
  profileLoading: boolean
  profileError: string
  editingSettings: boolean
  editLanguage: string
  editColorMode: string
  documents: Document[]
  documentsLoading: boolean
  documentsError: string
  saveLoading: boolean
  saveError: string
  onCancelEditDocument: () => void
  onShowAI: (show: boolean) => void
  onStartEditDocument: () => void
  onStartEditSettings: () => void
  onCancelEditSettings: () => void
  onSaveUserSettings: () => void
  onEditLanguageChange: (lang: string) => void
  onEditColorModeChange: (mode: string) => void
  onSectionChange: (section: 'profile' | 'create' | 'documents' | 'document') => void
  onDocumentSelect: (doc: Document) => void
  onDeleteClick: (id: string) => void
  setSelectedDocument: (doc: Document) => void
  setDocumentContent: (content: string) => void
  fetchDocumentsForSidebar: () => Promise<void>
  fetchDocuments: () => Promise<void>
  router: any
}

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

export default function MainContent(props: MainContentProps) {
  const {
    activeSection,
    selectedDocument,
    documentContent,
    loadingContent,
    contentError,
    editingDocument,
    showAiGenerator,
    documents,
    documentsLoading,
    documentsError,
    onCancelEditDocument,
    onShowAI,
    onStartEditDocument,
    onDocumentSelect,
    onDeleteClick,
    setSelectedDocument,
    setDocumentContent,
    fetchDocumentsForSidebar,
    fetchDocuments,
    router,
    profileLoading,
    profileError,
    editingSettings,
    editLanguage,
    editColorMode,
    userSettings,
    userInfo,
    onStartEditSettings,
    onCancelEditSettings,
    onSaveUserSettings,
    onEditLanguageChange,
    onEditColorModeChange,
    onSectionChange,
  } = props

  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showAi, setShowAi] = useState(false)

  const handleSave = async (title: string, content: string) => {
    setSaveLoading(true)
    setSaveError('')
    try {
      const token = localStorage.getItem('token')
      if (!token || !selectedDocument) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          rawContent: content
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Erreur de sauvegarde')
      }

      const updatedDoc = await response.json()
      setSelectedDocument(updatedDoc)
      setDocumentContent(content)
      setShowAi(false)

      await fetchDocumentsForSidebar()
      await fetchDocuments()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Document View */}
      {activeSection === 'document' && selectedDocument && (
        <div>
          {editingDocument ? (
            <EditDocumentForm
              document={selectedDocument}
              documentContent={documentContent}
              onSave={handleSave}
              onCancel={onCancelEditDocument}
              onShowAI={setShowAi}
              showAI={showAi}
              saveLoading={saveLoading}
              saveError={saveError}
            />
          ) : (
            <>
              <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <h2 className="section-title" style={{ margin: 0 }}>
                  {selectedDocument.title}
                </h2>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                  <button
                    onClick={onStartEditDocument}
                    className="auth-button-primary"
                  >
                    ✏️ Modifier
                  </button>
                </div>
              </div>
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
              <div className="document-content-area">
                {loadingContent ? (
                  <p style={{ textAlign: 'center', color: 'var(--gray-600)', padding: 'var(--space-2xl)' }}>
                    🔄 Chargement du contenu...
                  </p>
                ) : contentError ? (
                  <p style={{ color: '#ef4444', textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    ❌ {contentError}
                  </p>
                ) : (
                  <div className="content-display" style={{ minHeight: '400px' }}>
                    {documentContent}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Profile Section */}
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
                  onClick={onStartEditSettings}
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
                          onChange={e => onEditLanguageChange(e.target.value)}
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
                          onChange={e => onEditColorModeChange(e.target.value)}
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
                          onClick={onSaveUserSettings}
                          disabled={saveLoading}
                          className="cta-button"
                          style={{ width: 'auto' }}
                        >
                          {saveLoading ? '🔄 Sauvegarde...' : '💾 Sauvegarder'}
                        </button>
                        <button
                          onClick={onCancelEditSettings}
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
                        onClick={onStartEditSettings}
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

      {/* Create Section */}
      {activeSection === 'create' && (
        <CreateDocumentForm
          onDocumentCreated={doc => props.onSectionChange('documents')}
          onSectionChange={props.onSectionChange}
        />
      )}

      {/* Documents Section */}
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
                onClick={() => props.onSectionChange('documents')}
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
                onClick={() => props.onSectionChange('create')}
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
                    onClick={() => onDocumentSelect(doc)}
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
                      onClick={() => onDocumentSelect(doc)}
                      className="doc-action-btn doc-open-btn"
                    >
                      📖 Ouvrir
                    </button>
                    <button
                      onClick={() => onDeleteClick(doc.id)}
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