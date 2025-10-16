'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      localStorage.setItem('token', result.token)

      router.push('/dashboard')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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

        {/* ✅ Card centrée avec le nouveau style */}
        <div className="register-card">
          {/* Header */}
          <div>
			<h2 className="login-title">Créez votre compte DocFlow&nbsp;!</h2>
			<p className="login-subtitle">
			  Créez votre compte pour commencer à créer des documents incroyables avec l’IA
			</p>
          </div>

          {/* Icon */}
          <div className="login-icon-container">
            <div className="login-icon-bg">
              <UserPlus />
            </div>
          </div>

		  <h3 className="login-form-title">
			Créez votre compte gratuit
		  </h3>

          {/* Message d'erreur */}
          {error && (
            <div className="login-error">
              <strong>Oops!</strong> {error}
            </div>
          )}

          {/* FORMULAIRE */}
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            {/* Nom et Prénom sur la même ligne */}
            <div className="name-row">
              <div className="name-field">
                <input
                  {...register('firstName')}
				  className="login-input"
				  type="text"
				  placeholder="👤 Prénom"
				/>
                {errors.firstName && (
                  <p className="field-error">⚠️ {errors.firstName.message}</p>
                )}
              </div>
              
              <div className="name-field">
                <input
                  {...register('lastName')}
				  className="login-input"
				  type="text"
				  placeholder="👥 Nom de famille"
				/>
                {errors.lastName && (
                  <p className="field-error">⚠️ {errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Champ Email */}
            <div>
              <input
                {...register('email')}
				className="login-input"
				type="email"
				placeholder="📧 Votre adresse e-mail"
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
				placeholder="🔒 Créez un mot de passe"
			  />
              {errors.password && (
                <p className="field-error">⚠️ {errors.password.message}</p>
              )}
            </div>

            {/* Champ Confirm Password */}
            <div>
              <input
                {...register('confirmPassword')}
				className="login-input" 
				type="password"
				placeholder="🔐 Confirmez votre mot de passe"
			  />
              {errors.confirmPassword && (
                <p className="field-error">⚠️ {errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Bouton Submit */}
            <button 
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
			  {isLoading ? '🔄 Création du compte...' : 'Créer mon compte !'}
            </button>
          </form>

          {/* Lien vers login */}
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
			  Vous avez déjà un compte ?{' '}
			  <button
				onClick={() => router.push('/login')}
				style={{
				  background: 'none',
				  border: 'none',
				  color: 'var(--primary-600)',
				  fontWeight: '600',
				  cursor: 'pointer',
				  textDecoration: 'underline'
				}}
			  >
				Connectez-vous ici !
			  </button>
			</p>
          </div>
        </div>
      </div>
    </div>
  )
}