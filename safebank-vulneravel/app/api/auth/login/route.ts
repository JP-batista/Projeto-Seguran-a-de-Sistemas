import { NextRequest, NextResponse } from 'next/server'
import { users, sessions } from '@/lib/store'

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  const user = users.find(u => u.username === username && u.password === password)
  if (!user) {
    return NextResponse.json({ error: 'Usuário ou senha inválidos' }, { status: 401 })
  }

  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
  sessions.set(sessionId, user.id)

  const response = NextResponse.json({ ok: true, username: user.username })

  response.cookies.set('session_id', sessionId, {
    httpOnly: true,
    path: '/',
  })

  return response
}
