'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '../components/sidebar'
import MainContent from '../components/MainContent'
import Header from '../components/Header'
import { useTranslation } from 'react-i18next'
import '../../lib/i18n'

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

export default function Dashboard() {
	const [documents, setDocuments] = useState<Document[]>([])
	const [sidebarLoading, setSidebarLoading] = useState(true)
	const [sidebarError, setSidebarError] = useState('')
	const [activeSection, setActiveSection] = useState<'profile' | 'create' | 'documents' | 'document'>('documents')

	// Separate states for each section
	const [profileLoading, setProfileLoading] = useState(false)
	const [profileError, setProfileError] = useState('')
	const [documentsLoading, setDocumentsLoading] = useState(false)
	const [documentsError, setDocumentsError] = useState('')

	const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
	const [userInfo, setUserInfo] = useState<User | null>(null)
	const [userLoading, setUserLoading] = useState(true)

	const router = useRouter()
	const pathname = usePathname()
	const { t, i18n } = useTranslation()

	const [editingSettings, setEditingSettings] = useState(false)
	const [editLanguage, setEditLanguage] = useState('')
	const [saveLoading, setSaveLoading] = useState(false)
	const [saveError, setSaveError] = useState('')

	const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
	const [documentContent, setDocumentContent] = useState('')
	const [loadingContent, setLoadingContent] = useState(false)
	const [contentError, setContentError] = useState('')

	const [editingDocument, setEditingDocument] = useState(false)

	const [showAiGenerator, setShowAiGenerator] = useState(false)

	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	const [deleteError, setDeleteError] = useState('')

	useEffect(() => {
		const fetchLang = async () => {
			try {
				const token = localStorage.getItem('token')
				if (!token) return
				const response = await fetch('/api/settings', {
					headers: { 'Authorization': `Bearer ${token}` }
				})
				if (response.ok) {
					const data = await response.json()
					if (data.language && i18n.language !== data.language) {
						i18n.changeLanguage(data.language)
					}
				}
			} catch (e) {
				// ignore
			}
		}
		fetchLang()
	}, [i18n])

	// Initial loading - sidebar only
	useEffect(() => {
		const token = localStorage.getItem('token')

		if (!token && pathname !== '/login') {
			router.push('/login')
			return
		}

		// Load sidebar data in parallel
		Promise.all([
			fetchDocumentsForSidebar(),
			fetchUserInfo()
		]).finally(() => {
			setSidebarLoading(false)
		})
	}, [router, pathname])

	// Conditional loading depending on active section
	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token && pathname !== '/login') {
			router.push('/login')
			return
		}

		if (activeSection === 'documents') {
			fetchDocuments()
		}
	}, [activeSection, router, pathname])

	// Load specific document
	useEffect(() => {
		if (selectedDocument) {
			fetchDocumentContent(selectedDocument.id)
			setActiveSection('document')
		}
	}, [selectedDocument])

	// References for auto-save and focus management
	const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current)
			}
		}
	}, [])

	// Function to load only documents for the sidebar (lightweight)
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

	// Function to load all documents (documents section)
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

	// Fetch user settings
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

	// Fetch user info
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

	// Save user settings
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
					language: editLanguage
				}),
			})

			i18n.changeLanguage(editLanguage)

			if (!response.ok) {
				if (response.status === 401) {
					localStorage.removeItem('token')
					router.push('/login')
					return
				}
				throw new Error('Failed to save settings')
			}

			setUserSettings({
				language: editLanguage
			})

			setEditingSettings(false)
		} catch (err) {
			setSaveError(err instanceof Error ? err.message : 'Error saving settings')
		} finally {
			setSaveLoading(false)
		}
	}

	// Handle cancel edit settings
	const cancelEdit = () => {
		setEditingSettings(false)
		setEditLanguage(userSettings?.language || '')
		setSaveError('')
	}

	const startEdit = () => {
		setEditingSettings(true)
		setEditLanguage(userSettings?.language || '')
	}

	// Fetch document content
	const fetchDocumentContent = async (documentId: string) => {
		try {
			setLoadingContent(true)
			setContentError('')

			const token = localStorage.getItem('token')
			if (!token && pathname !== '/login') {
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
			setDocumentContent(document.rawContent || 'No content available')

		} catch (err) {
			setContentError(err instanceof Error ? err.message : 'Error fetching document')
		} finally {
			setLoadingContent(false)
		}
	}

	const cancelEditDocument = () => {
		setEditingDocument(false)
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
				setDeleteError(errorData.error || 'Error while deleting')
			}
		} catch (error) {
			setDeleteError('Error while deleting the document')
		} finally {
			setIsDeleting(false)
		}
	}

	const startEditDocument = () => {
		if (selectedDocument && documentContent) {
			setEditingDocument(true)
		}
	}

	// Function to change section
	const handleSectionChange = (section: 'profile' | 'create' | 'documents' | 'document') => {
		setActiveSection(section)

		if (section === 'profile') {
			setProfileLoading(true);
			setProfileError('');
			fetchUserSettings().finally(() => setProfileLoading(false));
		}

		if (section === 'documents') {
			setSelectedDocument(null)
		}
	}

	// Function to select a document
	const handleDocumentSelect = (doc: Document) => {
		if (editingDocument) {
			setEditingDocument(false)
			setTimeout(() => {
				setSelectedDocument(doc)
			}, 0)
		} else {
			setSelectedDocument(doc)
		}
	}

	// Function to go back to documents
	const backToDocuments = () => {
		setSelectedDocument(null)
		setDocumentContent('')
		setContentError('')
		setEditingDocument(false)
		setShowAiGenerator(false)
		setActiveSection('documents')
	}

	// MainContent component without key that forces re-mount
	return (
		<div className="dashboard-container" style={{ display: 'flex' }}>
			<Sidebar
				documents={documents}
				sidebarLoading={sidebarLoading}
				sidebarError={sidebarError}
				activeSection={activeSection}
				handleSectionChange={handleSectionChange}
				handleDocumentSelect={handleDocumentSelect}
				userLoading={userLoading}
				userInfo={userInfo}
				onLogout={() => {
					localStorage.removeItem('token')
					router.push('/login')
				}}
			/>

			{/* Theme Toggle */}
			<div className="dashboard-main">
				<Header onBack={backToDocuments} />
				<MainContent
					activeSection={activeSection}
					selectedDocument={selectedDocument}
					documentContent={documentContent}
					loadingContent={loadingContent}
					contentError={contentError}
					editingDocument={editingDocument}
					showAiGenerator={showAiGenerator}
					userSettings={userSettings}
					userInfo={userInfo}
					profileLoading={profileLoading}
					profileError={profileError}
					editingSettings={editingSettings}
					editLanguage={editLanguage}
					saveLoading={saveLoading}
					saveError={saveError}
					documents={documents}
					documentsLoading={documentsLoading}
					documentsError={documentsError}
					setSelectedDocument={setSelectedDocument}
					setDocumentContent={setDocumentContent}
					fetchDocumentsForSidebar={fetchDocumentsForSidebar}
					fetchDocuments={fetchDocuments}
					router={router}
					onCancelEditDocument={cancelEditDocument}
					onShowAI={setShowAiGenerator}
					onStartEditDocument={startEditDocument}
					onStartEditSettings={startEdit}
					onCancelEditSettings={cancelEdit}
					onSaveUserSettings={saveUserSettings}
					onEditLanguageChange={setEditLanguage}
					onSectionChange={handleSectionChange}
					onDocumentSelect={handleDocumentSelect}
					onDeleteClick={handleDeleteClick}
				/>
			</div>

			{/* Modal Delete */}
			{deleteConfirm && (
				<div className="modal-overlay">
					<div className="delete-modal">
						<div className="delete-icon">⚠️</div>
						<h3 className="delete-title">
							{t('Supprimer ce document ?')}
						</h3>
						<p className="delete-description">
							{t('Cette action est irréversible. Le document')} <strong>"{documents.find(d => d.id === deleteConfirm)?.title}"</strong> {t('Sera définitivement supprimé.')}
						</p>

						<div className="delete-actions">
							<button
								onClick={handleCancelDelete}
								disabled={isDeleting}
								className="auth-button-outline"
								style={{ opacity: isDeleting ? 0.5 : 1 }}
							>
								{t('Cancel')}
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
										{t('Suppression...')}
									</>
								) : (
									<>{t('Supprimer')}</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
