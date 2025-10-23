import jwt from 'jsonwebtoken'
import type { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: { userId: string; email: string }): string {
  // genere the JWT token
  const token = jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  return token;
}

export function verifyToken(token: string) {
  if (!process.env.JWT_SECRET) throw new Error('Missing JWT_SECRET')
  return jwt.verify(token, process.env.JWT_SECRET) as Record<string, any>
}

// Remplace / ajoute la fonction getUserIdFromToken pour supporter Authorization + cookie
export function getUserIdFromToken(req: NextRequest | { headers?: any }) {
  try {
    // 1) Header Authorization: "Bearer <token>"
    const getHeader = (name: string) =>
      typeof req.headers?.get === 'function'
        ? req.headers.get(name)
        : (req.headers && (req.headers as any)[name?.toLowerCase()])

    const authHeader = getHeader('authorization') || getHeader('Authorization')
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const payload = verifyToken(token)
      return (payload as any).userId ?? null
    }

    // 2) Cookie header: look for token=...
    const cookieHeader = getHeader('cookie') || getHeader('Cookie') || (req as any).cookie
    if (cookieHeader && typeof cookieHeader === 'string') {
      const m = cookieHeader.match(/(^|;\s*)token=([^;]+)/)
      if (m) {
        try {
          const token = decodeURIComponent(m[2])
          const payload = verifyToken(token)
          return (payload as any).userId ?? null
        } catch (e) {
          return null
        }
      }
    }

    return null
  } catch (e) {
    return null
  }
}
