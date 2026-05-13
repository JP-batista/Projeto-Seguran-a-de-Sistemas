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

  // VULNERABILIDADE: cookie com SameSite=None; Secure
  // Chrome rejeita SameSite=None sem Secure mesmo no localhost.
  // Com Secure: Chrome aceita o cookie em http://localhost pois trata localhost
  // como origem segura — e o envia em requisições cross-origin (localhost:4000 → localhost:3000).
  return new Response(JSON.stringify({ ok: true, username: user.username }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly; SameSite=None; Secure`,
    },
  })
}
