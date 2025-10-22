'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogIn } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import React from 'react'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type loginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]= useState('')
  const router = useRouter()
  
  // Note: react-hook-form gère automatiquement les références
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<loginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: loginFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      console.log('login status', response.status, 'ok?', response.ok)
      const text = await response.text()
      console.log('login raw response', text)
      // try parse JSON if possible
      let result = {}
      try { result = JSON.parse(text) } catch (e) { /* not JSON */ }

      if (!response.ok) {
        throw new Error((result as any).error || 'Login failed')
      }

      // debug: vérifier que le cookie a bien été posé (server doit renvoyer Set-Cookie)
      // ensuite naviguer
      router.replace('/dashboard')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occured')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fadeInUp">
      <div className="login-container">
        {/* ✅ Theme Toggle - Position fixe en haut à droite */}
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 100
        }}>
          <ThemeToggle />
        </div>

        {/* ✅ Bouton retour */}
        <button
          onClick={() => router.push('/')}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            background: 'transparent',
            border: '2px solid var(--gray-300)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-sm) var(--space-md)',
            color: 'var(--gray-700)',
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            zIndex: 100
          }}
          className="back-button"
        >
          ← Retour
        </button>

        <div className="login-card">
          {/* Header */}
          <div>
            <h2 className="login-title">Bon Retour!</h2>
            <p className="login-subtitle">
              Enregistrez-vous pour créer d'incroyables documents
            </p>
          </div>

          {/* Icon */}
          {/* ✅ Version avec contrôle manuel complet */}
          <div className="login-icon-container">  {/* ou .small, .large, .xl */}
            <div className="login-icon-bg">
              <LogIn className='login-icon' />  {/* ✅ CHANGÉ: Supprime les classes h-6 w-6 */}
            </div>
          </div>

          <h3 className="login-form-title">
            Enregistrez-vous avec votre email
          </h3>

          {/* Message d'erreur */}
          {error && (
            <div className="login-error">
              <strong>Oops!</strong> {error}
            </div>
          )}

          {/* FORMULAIRE */}
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            {/* Champ Email */}
            <div>
              <input
                {...register('email')}
                className="login-input"
                type="email"
                placeholder="📧 Votre addresse email"
                autoComplete="username"
              />
              {errors.email && (
                <p className="field-error">⚠️ {errors.email.message}</p>
              )}
            </div>

            {/* Champ Password */}
            <div>
              <input
                {...register('password')}
                className="login-input" 
                type="password"
                placeholder="🔒 Votre mot de passe"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="field-error">⚠️ {errors.password.message}</p>
              )}
            </div>

            {/* Lien "Forgot password ?" */}
            {/* <div className="forgot-link">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="link-button"
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-600)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Mot de passe oublié ?
              </button>
            </div> */}

            {/* Bouton Submit */}
            <button 
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? '🔄 Connexion...' : 'Se connecter!'}
            </button>
          </form>

          {/* Lien vers register */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: 'var(--space-lg)',
            padding: 'var(--space-md)',
            borderTop: '1px solid var(--gray-200)'
          }}>
            <p style={{ 
              color: 'var(--gray-600)', 
              fontSize: 'var(--text-sm)' 
            }}>
              Vous n'avez pas encore de compte ?{' '}
              <button
                onClick={() => router.push('/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-600)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Créé en un gratuitement !
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}