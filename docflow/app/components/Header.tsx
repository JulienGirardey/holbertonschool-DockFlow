import ThemeToggle from './ThemeToggle'
import { useTranslation } from 'react-i18next'

interface HeaderProps {
  onBack: () => void
}

export default function Header({ onBack }: HeaderProps) {
	const { i18n, t } = useTranslation()
  return (
    <div className="dashboard-theme-toggle">
      <button
        onClick={onBack}
        className="back-button auth-button-outline"
        style={{ padding: 'var(--space-sm)', minWidth: 'auto' }}
      >
        ← {t('Retour')}
      </button>
      <ThemeToggle />
    </div>
  )
}