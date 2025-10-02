import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: { userId: string; email: string }): string {
  // genere the JWT token
  let token = jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  return token;
}

export function getUserIdFromToken(req: NextRequest): string | null {
  try {
    // recovery the header
    const authHeader = req.headers.get('authorization');

    // check the format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    // delete the Bearer of the token
    const token = authHeader.substring(7);

    // check and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // TODO: Retourner le userId
    return decoded.userId;

  } catch (error) {
    console.error('Token validation failed:', error);
    return null;
  }
}
