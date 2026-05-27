import { NextRequest, NextResponse } from 'next/server'
import { users, sessions } from '@/lib/store'
import { createCsrfTokenForSession, validateRequestOrigin } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  if (!validateRequestOrigin(request)) {
    return NextResponse.json({ error: 'Origem da requisicao recusada' }, { status: 403 })
  }

  const { username, password } = await request.json()

  const user = users.find(u => u.username === username && u.password === password)
  if (!user) {
    return NextResponse.json({ error: 'Usuario ou senha invalidos' }, { status: 401 })
  }

  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
  sessions.set(sessionId, user.id)

  // Ao criar uma sessao autenticada, geramos um token CSRF unico para ela.
  // O token fica no backend, indexado pelo session_id, e sera entregue ao
  // frontend apenas quando o dashboard autenticado for renderizado.
  createCsrfTokenForSession(sessionId)

  const response = NextResponse.json({ ok: true, username: user.username })

  response.cookies.set('session_id', sessionId, {
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}
