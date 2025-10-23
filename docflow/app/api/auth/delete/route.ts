import { verify } from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export type AuthUser = { id: string; email?: string } | null

async function getUserFromRequest(req: Request): Promise<AuthUser> {
  const cookieHeader = req.headers.get('cookie') || ''
  const authHeader = req.headers.get('authorization') || ''

  // try common cookie names, including "token"
  const namesToTry = ['token', 'session', 'jwt', 'next-auth.session-token']
  let token: string | null = null
  for (const name of namesToTry) {
    const m = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]+)`))
    if (m) { token = decodeURIComponent(m[1]); break }
  }

  // fallback to Authorization: Bearer ...
  if (!token && authHeader.startsWith('Bearer ')) token = authHeader.replace('Bearer ', '')

  if (!token) return null
  if (!process.env.JWT_SECRET) {
    console.warn('[auth] JWT_SECRET missing')
    return null
  }

  try {
    const payload = verify(token, process.env.JWT_SECRET) as any
    // support multiple token payload shapes
    const id = payload.userId ?? payload.sub ?? payload.id
    if (!id) return null
    return { id: String(id), email: payload.email }
  } catch (err) {
    console.warn('[auth] token verify failed', err)
    return null
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // collect user document ids
    const userDocs = await prisma.userDocuments.findMany({
      where: { userId: user.id },
      select: { id: true }
    })
    const docIds = userDocs.map(d => d.id)

    // perform atomic deletion of related data then the user
    await prisma.$transaction(async (tx) => {
      if (docIds.length > 0) {
        await tx.generatedDocument.deleteMany({ where: { userDocumentId: { in: docIds } } })
      }
      await tx.aiRequest.deleteMany({ where: { userId: user.id } })
      await tx.userDocuments.deleteMany({ where: { userId: user.id } })
      await tx.settings.deleteMany({ where: { userId: user.id } })
      await tx.user.delete({ where: { id: user.id } })
    })

    const res = NextResponse.json({ ok: true })
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    // clear common cookie names
    res.headers.set('Set-Cookie', `token=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict${secure}, session=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict${secure}`)
    return res
  } catch (err) {
    console.error('delete account error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}