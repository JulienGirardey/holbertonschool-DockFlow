'use client'

export default function DashboardLoading() {
  return (
    <div className="dashboard-container">
      {/* Sidebar Skeleton */}
      <div className="dashboard-sidebar">
        {/* Header skeleton */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  height: '45px',
                  background: 'var(--gray-200)',
                  borderRadius: 'var(--radius-xl)',
                  animation: `pulse 1.5s infinite ${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Documents skeleton */}
        <div className="sidebar-documents">
          <div style={{
            height: '20px',
            background: 'var(--gray-200)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-md)',
            animation: 'pulse 1.5s infinite'
          }} />
          
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                height: '80px',
                background: 'var(--gray-100)',
                borderRadius: 'var(--radius-xl)',
                marginBottom: 'var(--space-md)',
                padding: 'var(--space-lg)',
                border: '1px solid var(--gray-200)',
                animation: `pulse 1.5s infinite ${i * 0.1}s`
              }}
            >
              <div style={{
                height: '18px',
                background: 'var(--gray-200)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-sm)'
              }} />
              <div style={{
                height: '14px',
                background: 'var(--gray-200)',
                borderRadius: 'var(--radius-sm)',
                width: '70%'
              }} />
            </div>
          ))}
        </div>

        {/* Footer skeleton */}
        <div className="sidebar-footer">
          <div style={{
            height: '60px',
            background: 'var(--gray-100)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-md)',
            animation: 'pulse 1.5s infinite 0.3s'
          }} />
          
          <div style={{
            height: '40px',
            background: 'var(--gray-200)',
            borderRadius: 'var(--radius-lg)',
            animation: 'pulse 1.5s infinite 0.5s'
          }} />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="dashboard-main">
        {/* Header skeleton */}
        <div style={{
          height: '80px',
          background: 'var(--gray-100)',
          borderRadius: 'var(--radius-2xl)',
          marginBottom: 'var(--space-xl)',
          border: '2px solid var(--gray-200)',
          animation: 'pulse 1.5s infinite 0.2s'
        }} />

        {/* Content skeleton */}
        <div style={{
          background: 'linear-gradient(135deg, white, var(--gray-50))',
          borderRadius: 'var(--radius-2xl)',
          border: '2px solid var(--primary-200)',
          padding: 'var(--space-2xl)',
          minHeight: '500px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Skeleton lines */}
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              style={{
                height: '20px',
                background: 'var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-lg)',
                width: i % 2 === 0 ? '85%' : '95%',
                animation: `pulse 1.5s infinite ${i * 0.1}s`
              }}
            />
          ))}

          {/* Loading overlay avec animation */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'var(--gray-600)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid var(--gray-200)',
              borderTop: '4px solid var(--primary-600)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto var(--space-md)'
            }} />
            
            <p style={{ fontSize: 'var(--text-lg)', fontWeight: '500' }}>
              📄 Chargement du dashboard...
            </p>
          </div>

          {/* Shimmer effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            animation: 'shimmer 2s infinite'
          }} />
        </div>
      </div>

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}