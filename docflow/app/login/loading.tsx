'use client'

export default function AuthLoading() {
  return (
    <div className="login-container">
      <div className="login-card" style={{ textAlign: 'center' }}>
        {/* Logo skeleton */}
        <div className="login-icon-container">
          <div className="login-icon-bg" style={{
            animation: 'loading-pulse 1.5s infinite'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--gray-200)',
              borderRadius: '50%'
            }} />
          </div>
        </div>

        {/* Titre skeleton */}
        <div style={{
          height: '36px',
          background: 'var(--gray-200)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-sm)',
          animation: 'loading-pulse 1.5s infinite 0.2s'
        }} />

        {/* Sous-titre skeleton */}
        <div style={{
          height: '20px',
          background: 'var(--gray-200)',
          borderRadius: 'var(--radius-md)',
          width: '70%',
          margin: '0 auto var(--space-2xl)',
          animation: 'loading-pulse 1.5s infinite 0.4s'
        }} />

        {/* Form skeleton */}
        <div style={{ textAlign: 'left' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ marginBottom: 'var(--space-md)' }}>
              <div style={{
                height: '48px',
                background: 'var(--gray-100)',
                border: '2px solid var(--gray-200)',
                borderRadius: 'var(--radius-lg)',
                animation: `loading-pulse 1.5s infinite ${0.1 * i}s`
              }} />
            </div>
          ))}

          {/* Button skeleton */}
          <div style={{
            height: '48px',
            background: 'var(--gray-200)',
            borderRadius: 'var(--radius-lg)',
            marginTop: 'var(--space-lg)',
            animation: 'loading-pulse 1.5s infinite 0.6s'
          }} />
        </div>

        {/* Spinner central */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '40px',
          height: '40px',
          border: '3px solid var(--gray-200)',
          borderTop: '3px solid var(--primary-600)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />

        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 'var(--radius-2xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 'var(--space-md)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--gray-200)',
            borderTop: '3px solid var(--primary-600)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          
          <p style={{
            color: 'var(--gray-600)',
            fontSize: 'var(--text-sm)',
            margin: 0
          }}>
            🔐 Chargement...
          </p>
        </div>
      </div>
    </div>
  )
}