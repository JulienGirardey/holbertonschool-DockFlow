'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogIn } from 'lucide-react'

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
    <div className="login-container">
      <div className="max-w-md w-full space-y-8">
        <div className='text-center'>
          <h2 className='text-3xl font-bold text-gray-900'>Sign in</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Make your own doc simply for free
          </p>
        </div>

        <div className='bg-white p-8 rounded-lg shadow-md'>
          <div className='flex justify-center mb-6'>
            <div className='bg-blue-100 p-3 rounded-full'>
              <LogIn className='h-6 w-6 text-blue-600' />
            </div>
          </div>

          <h3 className='text-center text-lg font-medium text-gray-900 mb-6'>
            Sign in with email
          </h3>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* FORMULAIRE */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Champ Email */}
            <div>
              <input
                {...register('email')}
                className="login-input"
                type="email"
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Champ Password */}
            <div>
              <input
                {...register('password')}
                className="login-input" 
                type="password"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Lien "Forgot password ?" */}
            <div className="text-right">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Forgot password ?
              </a>
            </div>

            {/* Bouton Submit */}
            <button 
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Get Started'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}