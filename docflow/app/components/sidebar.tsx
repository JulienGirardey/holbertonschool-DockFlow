import React from 'react'
import { useRouter } from 'next/navigation'

interface Document {
    id: string
    title: string
    createdAt: string
    content?: string
}

interface User {
    firstName: string
    lastName: string
    email: string
}

interface SidebarProps {
    documents: Document[]
    sidebarLoading: boolean
    sidebarError: string
    activeSection: string
    handleSectionChange: (section: 'profile' | 'create' | 'documents') => void
    handleDocumentSelect: (doc: Document) => void
    userLoading: boolean
    userInfo: User | null
    onLogout: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
    documents,
    sidebarLoading,
    sidebarError,
    activeSection,
    handleSectionChange,
    handleDocumentSelect,
    userLoading,
    userInfo,
    onLogout
}) => {
    return (
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

                <button onClick={onLogout} className="logout-btn">
                    🚪 Déconnexion
                </button>
            </div>
        </div>
    )
}

export default Sidebar