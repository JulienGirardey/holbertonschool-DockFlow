'use client'

interface LoadingScreenProps {
  message?: string
  showLogo?: boolean
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingScreen({ 
  message = "Chargement...", 
  showLogo = true,
  fullScreen = true,
  size = 'md'
}: LoadingScreenProps) {
  
  const sizes = {
    sm: { spinner: '30px', logo: '40px', text: 'var(--text-sm)' },
    md: { spinner: '40px', logo: '60px', text: 'var(--text-base)' },
    lg: { spinner: '60px', logo: '80px', text: 'var(--text-lg)' }
  }

  const currentSize = sizes[size]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: fullScreen ? '100vh' : '200px',
      background: fullScreen 
        ? 'linear-gradient(135deg, var(--gray-50), var(--summer-sand), var(--gray-100))' 
        : 'transparent',
      color: 'var(--gray-600)',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        {/* Logo conditionnel */}
        {showLogo && (
          <div style={{
            width: currentSize.logo,
            height: currentSize.logo,
            background: 'linear-gradient(135deg, var(--primary-500), var(--summer-coral))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-md)',
            animation: 'pulse 2s infinite',
            boxShadow: 'var(--shadow-md)',
            fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.5rem' : '2rem'
          }}>
            📄
          </div>
        )}

        {/* Spinner */}
        <div style={{
          width: currentSize.spinner,
          height: currentSize.spinner,
          border: `${size === 'sm' ? '3px' : '4px'} solid var(--gray-200)`,
          borderTop: `${size === 'sm' ? '3px' : '4px'} solid var(--primary-600)`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: `0 auto ${showLogo ? 'var(--space-md)' : 'var(--space-lg)'}`
        }} />

        {/* Message */}
        <p style={{
          fontSize: currentSize.text,
          color: 'var(--gray-600)',
          margin: 0,
          fontWeight: size === 'lg' ? '500' : '400'
        }}>
          {message}
        </p>

        {/* Barre de progression pour fullScreen */}
        {fullScreen && (
          <div style={{
            width: '200px',
            height: '3px',
            background: 'var(--gray-200)',
            borderRadius: '2px',
            margin: 'var(--space-lg) auto 0',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--primary-500), var(--summer-coral))',
              borderRadius: '2px',
              animation: 'loading-bar 1.5s ease-in-out infinite'
            }} />
          </div>
        )}
      </div>

      {/* Styles d'animation */}
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

// Export des tailles pour utilisation externe
export const LoadingSizes = {
  SMALL: 'sm' as const,
  MEDIUM: 'md' as const,
  LARGE: 'lg' as const
}