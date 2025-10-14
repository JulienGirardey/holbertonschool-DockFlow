import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  onBack: () => void
}

export default function Header({ onBack }: HeaderProps) {
  return (
    <div className="dashboard-theme-toggle">
      <button
        onClick={onBack}
        className="back-button auth-button-outline"
        style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
      >
        ← Retour
      </button>
      <ThemeToggle />
    </div>
  )
}