import { NextResponse } from 'next/server'
import { serialize } from 'cookie'

export async function POST() {
	const cookie = serialize('token', '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 0,
	})
	
	return NextResponse.json(
		{ ok: true, message: 'Logged out' },
		{ headers: { 'Set-Cookie': cookie } }
	)
}
