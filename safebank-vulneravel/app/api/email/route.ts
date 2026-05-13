import { NextRequest, NextResponse } from 'next/server'
import { sessions, users } from '@/lib/store'

// ============================================================
// ENDPOINT VULNERÁVEL — Demonstração Educacional de CSRF
// VULNERABILIDADES INTENCIONAIS:
//   1. Nenhum token CSRF é verificado
//   2. Alteração de e-mail sem reautenticação
//   3. Aceita qualquer origem
// EM PRODUÇÃO: verificar token CSRF + confirmar senha atual
// ============================================================
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value
  if (!sessionId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const userId = sessions.get(sessionId)
  if (!userId) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
  }

  const user = users.find(u => u.id === userId)
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const contentType = request.headers.get('content-type') ?? ''
  let email: string

  if (contentType.includes('application/json')) {
    const body = await request.json()
    email = body.email
  } else {
    const formData = await request.formData()
    email = formData.get('email') as string
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
  }

  const oldEmail = user.email
  user.email = email

  return NextResponse.json({ ok: true, oldEmail, newEmail: user.email })
}
