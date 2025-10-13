'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '../components/ThemeToggle'
import LoadingScreen from '../components/LoadingScreen'
import CreateDocumentForm from '../components/CreateDocumentForm'
import EditDocumentForm from '../components/EditDocumentForm'

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



	const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
	const [documentContent, setDocumentContent] = useState('')
	const [loadingContent, setLoadingContent] = useState(false)
	const [contentError, setContentError] = useState('')

	const [editingDocument, setEditingDocument] = useState(false)

	const [saveDocLoading, setSaveDocLoading] = useState(false)
	const [saveDocError, setSaveDocError] = useState('')
	const [isDirty, setIsDirty] = useState(false)
	const [lastSavedContent, setLastSavedContent] = useState('')
	const [lastSavedTitle, setLastSavedTitle] = useState('')
	const [autoSaving, setAutoSaving] = useState(false)

	const [aiPrompt, setAiPrompt] = useState('')
	const [showAiGenerator, setShowAiGenerator] = useState(false)
	const [aiGenerating, setAiGenerating] = useState(false)
	const [aiError, setAiError] = useState('')

	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)
	const [deleteError, setDeleteError] = useState('')
	const [isEditing, setIsEditing] = useState(false)

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

		if (activeSection === 'documents') {
			fetchDocuments()
		}
	}, [activeSection])

	// ✅ Chargement document spécifique
	useEffect(() => {
		if (selectedDocument) {
			fetchDocumentContent(selectedDocument.id)
			setActiveSection('document')
		}
	}, [selectedDocument])

	// ✅ Références pour l'auto-save et la gestion du focus
	const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)


	// ✅ Nettoyage du timer lors du démontage
	useEffect(() => {
		return () => {
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current)
			}
		}
	}, [])



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
			// Silently fail - user info will be handled by loading state
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
		setSaveDocError('')
		setIsDirty(false)
		setAutoSaving(false)
		setShowAiGenerator(false)
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

			} else {
				const errorData = await response.json()
				setDeleteError(errorData.error || 'Erreur lors de la suppression')
			}
		} catch (error) {
			setDeleteError('Erreur lors de la suppression du document')
		} finally {
			setIsDeleting(false)
		}
	}

	const startEditDocument = () => {
		if (selectedDocument && documentContent) {
			setEditingDocument(true)
			setSaveDocError('')
			setIsDirty(false)
			setAutoSaving(false)
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

	// ✅ Fonction simplifiée pour changer de section
	const handleSectionChange = (section: 'profile' | 'create' | 'documents' | 'document') => {
		setActiveSection(section)
		
		if (section === 'documents') {
			setSelectedDocument(null)
			setIsEditing(false)
		}
	}

	// ✅ Fonction simplifiée pour sélectionner un document
	const handleDocumentSelect = (doc: Document) => {
		setSelectedDocument(doc)
	}

	// ✅ Fonction simplifiée pour retourner aux documents
	const backToDocuments = () => {
		setSelectedDocument(null)
		setDocumentContent('')
		setContentError('')
		setEditingDocument(false)
		setShowAiGenerator(false)
		setActiveSection('documents')
	}

	// ✅ Composant MainContent SANS key qui force le re-mount
	const MainContent = () => {
		return (
			<div style={{
				width: '100%',
				height: '100%'
			}}>

				{/* ✅ Document View */}
				{activeSection === 'document' && selectedDocument && (
					<div>
						{editingDocument ? (
							<EditDocumentForm
								document={selectedDocument}
								documentContent={documentContent}
								onSave={async (title, content, isAutoSave = false) => {
									// Utilise la même logique que saveAndExitEdit
									try {
										const response = await fetch(`/api/documents/${selectedDocument.id}`, {
											method: 'PUT',
											headers: {
												'Content-Type': 'application/json',
											},
											body: JSON.stringify({
												title: title,
												content: content
											})
										})

										if (response.ok) {
											const updatedDoc = await response.json()
											setSelectedDocument(updatedDoc)
											
											if (!isAutoSave) {
												// Force refetch pour sync avec la liste
												await fetchDocuments()
												setEditingDocument(false)
											}
										} else {
											throw new Error('Erreur de sauvegarde')
										}
									} catch (error) {
										console.error('Erreur lors de la sauvegarde:', error)
										throw error
									}
								}}
								onCancel={() => {
									cancelEditDocument()
								}}
								onShowAI={(show) => setShowAiGenerator(show)}
								showAI={showAiGenerator}
								saveLoading={saveDocLoading}
								saveError={saveDocError}
								autoSaving={autoSaving}
								isDirty={isDirty}
							/>
						) : (
							<>
								{/* Header avec bouton retour */}
								<div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
									<h2 className="section-title" style={{ margin: 0 }}>
										📄 {selectedDocument.title}
									</h2>

									<div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
										<button
											onClick={startEditDocument}
											className="auth-button-primary"
										>
											✏️ Modifier
										</button>
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
					<CreateDocumentForm 
						onDocumentCreated={(newDocument) => setDocuments(prev => [newDocument, ...prev])}
						onSectionChange={handleSectionChange}
					/>
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
				<button
					onClick={backToDocuments}
					className="back-button auth-button-outline"
					style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
				>
					← Retour
				</button>
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

