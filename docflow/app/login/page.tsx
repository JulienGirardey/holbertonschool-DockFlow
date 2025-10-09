'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogIn } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type loginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]= useState('')
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<loginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: loginFormData) => {
    setIsLoading(true)
    setError('')

    try {
      console.log('Login data:', data)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Login failed')
      }

      localStorage.setItem('token', result.token)

      router.push('/dashboard')

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
          ← Back
        </button>

        <div className="login-card">
          {/* Header */}
          <div>
            <h2 className="login-title">Welcome Back!</h2>
            <p className="login-subtitle">
              Sign in to create amazing documents with AI
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
            Sign in with your email
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
                placeholder="📧 Your email address"
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
                placeholder="🔒 Your password"
              />
              {errors.password && (
                <p className="field-error">⚠️ {errors.password.message}</p>
              )}
            </div>

            {/* Lien "Forgot password ?" */}
            <div className="forgot-link">
              <a href="#">Forgot your password?</a>
            </div>

            {/* Bouton Submit */}
            <button 
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? '🔄 Signing in...' : 'Login!'}
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
              Don&apos;t have an account yet?{' '}
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
                Create one for free!
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}