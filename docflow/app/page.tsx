'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './components/ThemeToggle';
import '../lib/i18n'

export default function HomePage() {
	const [activeSection, setActiveSection] = useState<'what' | 'why' | 'how'>('what');
	const router = useRouter();

	const handleSignIn = () => {
		router.push('/login');
	};

	const handleRegister = () => {
		router.push('/register');
	};

	return (
		<div className="animate-fadeInUp">
			<div className="page-container">
				{/* Header Navigation */}
				<header className="header-container" style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '1rem 2rem',
					borderRadius: '2rem',
					margin: '1rem'
				}}>
					{/* Logo */}
					<div className="logo">
						DocFlow
					</div>

					{/* Navigation */}
					<nav style={{ display: 'flex', gap: '1rem' }}>
						<button
							onClick={() => setActiveSection('what')}
							className={`nav-button main ${activeSection === 'what' ? 'active' : ''}`}
						>
							Qu'est-ce ?
						</button>

						<button
							onClick={() => setActiveSection('why')}
							className={`nav-button main ${activeSection === 'why' ? 'active' : ''}`}
						>
							Pourquoi ?
						</button>

						<button
							onClick={() => setActiveSection('how')}
							className={`nav-button main ${activeSection === 'how' ? 'active' : ''}`}
						>
							Comment ?
						</button>
					</nav>

					{/* Auth Buttons */}
					<div style={{ display: 'flex', gap: '1em', alignItems: 'center' }}>
						<ThemeToggle />

						<button
							onClick={handleSignIn}
							className="auth-button-outline"
						>
							Se connecter
						</button>

					</div>
				</header>

				{/* Main Content */}
				<main className="main-container">

					{/* What is it Section */}
					{activeSection === 'what' && (
						<div style={{
							textAlign: 'center',
							maxWidth: '800px',
							width: '100%'
						}}>
							<h1 className="section-title">
								Qu'est-ce
							</h1>

							<div className="section-description">
								<p style={{ marginBottom: '1.5rem' }}>
									<strong>DocFlow</strong> est un éditeur de documents intelligent qui combine
									la puissance de l'IA avec une interface intuitive pour créer,
									éditer et organiser vos documents professionnels.
								</p>
								<p>
									Transformez vos idées en documents structurés et professionnels
									grâce à notre assistant IA intégré.
								</p>
							</div>

							<button
								onClick={handleRegister}
								className="cta-button"
							>
								Commencer gratuitement
							</button>
						</div>
					)}

					{/* Why use it Section */}
					{activeSection === 'why' && (
						<div style={{
							textAlign: 'center',
							maxWidth: '800px',
							width: '100%'
						}}>
							<h1 className="section-title">
								Pourquoi ?
							</h1>

							<div style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
								gap: '2rem',
								marginBottom: '3rem'
							}}>
								<div className="summer-card-1">
									<div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
									<h3 style={{
										fontSize: '1.5rem',
										fontWeight: 'bold',
										color: 'var(--primary-700)',
										marginBottom: '1rem'
									}}>
										Propulsé par l'IA
									</h3>
									<p style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>
										Assistant IA pour améliorer, résumer, traduire et restructurer
										vos documents automatiquement.
									</p>
								</div>

								<div className="summer-card-2">
									<div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💾</div>
									<h3 style={{
										fontSize: '1.5rem',
										fontWeight: 'bold',
										color: 'var(--success-600)',
										marginBottom: '1rem'
									}}>
										Modifier vos documents
									</h3>
									<p style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>
										Vous pouvez éditer vos documents à tout moment&nbsp;!
									</p>
								</div>

								<div className="summer-card-3">
									<div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
									<h3 style={{
										fontSize: '1.5rem',
										fontWeight: 'bold',
										color: 'var(--gray-700)',
										marginBottom: '1rem'
									}}>
										Interface rapide
									</h3>
									<p style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>
										Interface moderne et intuitive pour une productivité maximale.
										Créez des documents en quelques clics seulement.
									</p>
								</div>
							</div>

							<button
								onClick={handleRegister}
								className="cta-button"
							>
								Découvrir DocFlow
							</button>
						</div>
					)}

					{/* How to use Section */}
					{activeSection === 'how' && (
						<div style={{
							textAlign: 'center',
							maxWidth: '800px',
							width: '100%'
						}}>
							<h1 className="section-title">
								Comment ?
							</h1>

							<div style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '2rem',
								marginBottom: '3rem'
							}}>
								<div className="step-container">
									<div className="step-number step-1">
										1
									</div>
									<div className="step-content">
										<h3 className="step-title">
											Créez votre compte
										</h3>
										<p className="step-description">
											Inscrivez-vous gratuitement en quelques secondes et accédez à votre espace de travail personnel.
										</p>
									</div>
								</div>

								<div className="step-container">
									<div className="step-number step-2">
										2
									</div>
									<div className="step-content">
										<h3 className="step-title">
											Créez vos documents
										</h3>
										<p className="step-description">
											Utilisez notre éditeur intuitif pour créer et structurer vos documents professionnels.
										</p>
									</div>
								</div>

								<div className="step-container">
									<div className="step-number step-3">
										3
									</div>
									<div className="step-content">
										<h3 className="step-title">
											Utilisez les fonctionnalités IA
										</h3>
										<p className="step-description">
											Laissez notre IA améliorer, résumer ou traduire vos documents automatiquement.
										</p>
									</div>
								</div>
							</div>

							<button
								onClick={handleRegister}
								className="cta-button"
							>
								Commencer maintenant
							</button>
						</div>
					)}
				</main>

				{/* Footer */}
				<footer className="footer">
					<p style={{ fontStyle: 'italic' }}>
						DocFlow - Créez des documents intelligents avec l'IA
					</p>
				</footer>
			</div>
		</div>
	);
}
