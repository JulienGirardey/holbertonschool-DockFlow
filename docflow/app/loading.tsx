'use client'

import { useEffect, useState } from 'react'

export default function Loading() {
	const [show, setShow] = useState(true)

	useEffect(() => {
		const timer = setTimeout(() => setShow(false), 2000)
		return () => clearTimeout(timer)
	}, [])

	if (!show) return null

	return (
		<div style={{
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			minHeight: '100vh',
			background: 'linear-gradient(135deg, var(--gray-50), var(--summer-sand), var(--gray-100))',
			color: 'var(--gray-600)',
			fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
		}}>
			<div style={{ textAlign: 'center' }}>
				{/* animated logo */}
				<div style={{
					width: '80px',
					height: '80px',
					background: 'linear-gradient(135deg, var(--primary-500), var(--summer-coral))',
					borderRadius: '50%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					margin: '0 auto var(--space-xl)',
					animation: 'pulse 2s infinite',
					boxShadow: 'var(--shadow-lg)',
					fontSize: '2rem'
				}}>
					📄
				</div>

				{/* Spinner */}
				<div style={{
					width: '60px',
					height: '60px',
					border: '4px solid var(--gray-200)',
					borderTop: '4px solid var(--primary-600)',
					borderRadius: '50%',
					animation: 'spin 1s linear infinite',
					margin: '0 auto var(--space-lg)'
				}}></div>

				{/* Text */}
				<h2 style={{
					fontSize: 'var(--text-2xl)',
					fontWeight: 'bold',
					color: 'var(--gray-900)',
					marginBottom: 'var(--space-sm)',
					background: 'linear-gradient(135deg, var(--primary-600), var(--summer-coral))',
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					backgroundClip: 'text'
				}}>
					🚀 DocFlow
				</h2>

				<p style={{
					fontSize: 'var(--text-base)',
					color: 'var(--gray-600)',
					marginBottom: 'var(--space-lg)'
				}}>
					Chargement de votre espace de travail...
				</p>

				{/* progress bar */}
				<div style={{
					width: '200px',
					height: '4px',
					background: 'var(--gray-200)',
					borderRadius: '2px',
					margin: '0 auto',
					overflow: 'hidden'
				}}>
					<div style={{
						width: '100%',
						height: '100%',
						background: 'linear-gradient(135deg, var(--primary-500), var(--summer-coral))',
						borderRadius: '2px',
						animation: 'loading-bar 1.5s ease-in-out infinite'
					}}></div>
				</div>
			</div>

			<style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
		</div>
	)
}