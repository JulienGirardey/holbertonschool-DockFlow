'use client'
import CreateDocumentForm from './CreateDocumentForm'
import EditDocumentForm from './EditDocumentForm'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface Document {
	id: string
	title: string
	createdAt: string
	content?: string
}

interface UserSettings {
	language: string
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
		userSettings,
		userInfo,
		onStartEditSettings,
		onCancelEditSettings,
		onSaveUserSettings,
		onEditLanguageChange,
		onSectionChange,
	} = props

	const [saveLoading, setSaveLoading] = useState(false)
	const [saveError, setSaveError] = useState('')
	const [showAi, setShowAi] = useState(false)
	const { i18n, t } = useTranslation()
	const routerNav = useRouter()
	const [showDeleteAccount, setShowDeleteAccount] = useState(false)
	const [deletingAccount, setDeletingAccount] = useState(false)
	const [deleteAccountError, setDeleteAccountError] = useState('')

	async function handleConfirmDeleteAccount() {
		setDeletingAccount(true)
		setDeleteAccountError('')

		try {
			const headers: Record<string, string> = {}
			try {
				const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null
				if (jwt) headers['Authorization'] = `Bearer ${jwt}`
			} catch (e) {
				console.warn('[delete] cannot read localStorage jwt', e)
			}

			const res = await fetch('/api/auth/delete', {
				method: 'DELETE',
				credentials: 'include',
				headers
			})

			console.log('[delete] response status', res.status)
			const text = await res.text()
			console.log('[delete] response body', text)

			if (!res.ok) {
				let json: any = null
				try { json = JSON.parse(text) } catch { }
				setDeleteAccountError(json?.error || `HTTP ${res.status}`)
				setDeletingAccount(false)
				return
			}

			// redirection after deletions
			routerNav.push('/')
		} catch (err) {
			console.error('[delete] fetch error', err)
			setDeleteAccountError(err instanceof Error ? err.message : 'Erreur réseau')
			setDeletingAccount(false)
		}
	}

	const handleSave = async (title: string, content: string) => {
		setSaveLoading(true)
		setSaveError('')
		try {
			if (!selectedDocument) {
				router.push('/login')
				return
			}

			const response = await fetch(`/api/documents/${selectedDocument.id}`, {
				method: 'PUT',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title,
					rawContent: content
				})
			})

			if (!response.ok) {
				if (response.status === 401) {
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
										✏️ {t('Modifier')}
									</button>
								</div>
							</div>
							<p style={{
								color: 'var(--gray-600)',
								fontSize: 'var(--text-sm)',
								marginBottom: 'var(--space-lg)'
							}}>
								📅 {t('Créé le')} {new Date(selectedDocument.createdAt).toLocaleDateString(i18n.language, {
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
										🔄 {t('chargement du profil')}...
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
						<h2 className="section-title">{t('Mon profil')}</h2>
					</div>
					<div className="profile-content">
						{profileLoading ? (
							<SectionLoading message={t('chargment du profil')} />
						) : profileError ? (
							<div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
								<p style={{ color: '#ef4444' }}>❌ {profileError}</p>
								<button
									onClick={() => routerNav.refresh()}
									className="auth-button-primary"
									style={{ marginTop: 'var(--space-md)' }}
								>
									🔄 {t('Réessayer')}
								</button>
							</div>
						) : (userSettings && userInfo) ? (
							<div>
								<div className="profile-section">
									<h3 className="profile-section-title">
										🙋‍♂️ {t('Info personnelle')}
									</h3>
									<p><strong>{t('Prénom')}:</strong> {userInfo.firstName}</p>
									<p><strong>{t('Nom')}:</strong> {userInfo.lastName}</p>
									<p><strong>{t('email')}:</strong> {userInfo.email}</p>
								</div>
								<div className="profile-section">
									<h3 className="profile-section-title">
										⚙️ {t("Paramètres de l'application")}
									</h3>
									{editingSettings ? (
										<div className="settings-form">
											<div className="form-group">
												<label className="form-label">
													{t('Langue')}:
												</label>
												<select
													value={editLanguage}
													onChange={e => onEditLanguageChange(e.target.value)}
													className="form-select"
												>
													<option value="en">🇺🇸 English</option>
													<option value="fr">🇫🇷 Français</option>
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
													{saveLoading ? t('🔄 Sauvegarde...') : `💾 ${t('Sauvegarder')}`}
												</button>
												<button
													onClick={onCancelEditSettings}
													disabled={saveLoading}
													className="auth-button-outline"
												>
													❌ {t('Retour')}
												</button>
											</div>
										</div>
									) : (
										<>
											<div>
												<p><strong>{t('Langue')}:</strong> {userSettings.language === 'fr' ? '🇫🇷 Français' : userSettings.language === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}</p>
												<div className='edit-button'>
													<button
														onClick={onStartEditSettings}
														className="auth-button-primary"
														style={{ marginTop: 'var(--space-lg)' }}
													>
														{t('Modifier les paramètres')}
													</button>
													<section className='settings-section'>
														<div>
															<button
																type='button'
																className='doc-action-btn doc-delete-btn delete-user'
																onClick={() => setShowDeleteAccount(true)}
															>
																{t('Supprimer mon compte')}
															</button>
														</div>
													</section>
												</div>
											</div>
										</>
									)}

									{/* confirm modal */}
									{showDeleteAccount && (
										<div className="modal-overlay">
											<div className="delete-modal">
												<div className="delete-icon">⚠️</div>
												<h3 className="delete-title">{t('Supprimer votre compte ?')}</h3>
												<p className="delete-description">
													{t("Cette action est irréversible. Tous vos documents seront supprimés.")}
												</p>

												{deleteAccountError && <div className="field-error">{deleteAccountError}</div>}

												<div className="delete-actions">
													<button
														onClick={() => { setShowDeleteAccount(false); setDeleteAccountError('') }}
														disabled={deletingAccount}
														className="annul-dlt-user annul-dlt-user-primary"
													>
														{t('Annuler')}
													</button>

													<button
														onClick={handleConfirmDeleteAccount}
														disabled={deletingAccount}
														className="doc-action-btn doc-delete-btn confirm-dlt-user"
													>
														{deletingAccount ? t('Suppression...') : t('Supprimer')}
													</button>
												</div>
											</div>
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
						<h2 className="section-title">{t('Mes documents')} ({documents.length})</h2>
					</div>
					{documentsLoading ? (
						<SectionLoading message={t('chargement des documents')} />
					) : documentsError ? (
						<div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
							<p style={{ color: '#ef4444' }}>❌ {documentsError}</p>
							<button
								onClick={() => routerNav.refresh()}
								className="auth-button-primary"
								style={{ marginTop: 'var(--space-md)' }}
							>
								🔄 {t('Réessayer')}
							</button>
						</div>
					) : documents.length === 0 ? (
						<div className="empty-state">
							<div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>📄</div>
							<p className="empty-state-text">{t('Pas de document trouvé')}</p>
							<button
								onClick={() => props.onSectionChange('create')}
								className="cta-button"
							>
								{t('créé votre première documentation')}
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
											📅 {t('Créé le')} {new Date(doc.createdAt).toLocaleDateString(i18n.language, {
												year: 'numeric',
												month: 'long',
												day: 'numeric',
												hour: '2-digit',
												minute: '2-digit'
											})}
										</p>
									</div>
									<div className="document-actions">
										<button
											onClick={() => onDocumentSelect(doc)}
											className="doc-action-btn doc-open-btn"
										>
											📖 {t('Ouvrir')}
										</button>
										<button
											onClick={() => onDeleteClick(doc.id)}
											className="doc-action-btn doc-delete-btn"
											title={t('Supprimer')}
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