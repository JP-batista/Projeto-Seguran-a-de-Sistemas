import { randomBytes, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { csrfTokens, sessions, users } from './store'
import type { User } from './store'

export const CSRF_HEADER = 'x-csrf-token'

type ValidCsrfRequest = {
  ok: true
  sessionId: string
  user: User
}

type InvalidCsrfRequest = {
  ok: false
  response: NextResponse
}

export type CsrfValidationResult = ValidCsrfRequest | InvalidCsrfRequest

export function createCsrfTokenForSession(sessionId: string) {
  const token = randomBytes(32).toString('base64url')
  csrfTokens.set(sessionId, token)
  return token
}

export function getCsrfTokenForSession(sessionId: string) {
  return csrfTokens.get(sessionId) ?? createCsrfTokenForSession(sessionId)
}

export function deleteCsrfTokenForSession(sessionId: string) {
  csrfTokens.delete(sessionId)
}

export function validateRequestOrigin(request: NextRequest) {
  const expectedOrigin = new URL(request.url).origin
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Origin e Referer provam a origem da navegacao. Se um site atacante em
  // outra origem tentar enviar um POST, estes cabecalhos nao vao bater com a
  // origem real do SafeBank e a acao e recusada antes de ler o corpo.
  if (origin) {
    return origin === expectedOrigin
  }

  if (referer) {
    try {
      return new URL(referer).origin === expectedOrigin
    } catch {
      return false
    }
  }

  // Falha fechada: em rotas sensiveis, sem Origin/Referer nao ha prova de
  // origem confiavel.
  return false
}

export function validateCsrfRequest(request: NextRequest): CsrfValidationResult {
  const sessionId = request.cookies.get('session_id')?.value
  if (!sessionId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Nao autenticado' }, { status: 401 }),
    }
  }

  const userId = sessions.get(sessionId)
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Sessao invalida' }, { status: 401 }),
    }
  }

  const user = users.find(u => u.id === userId)
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 }),
    }
  }

  if (!validateRequestOrigin(request)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Origem da requisicao recusada' }, { status: 403 }),
    }
  }

  const expectedToken = csrfTokens.get(sessionId)
  const receivedToken = request.headers.get(CSRF_HEADER)

  // A identidade da acao e comprovada por dois fatores ligados a mesma sessao:
  // 1. cookie httpOnly session_id autentica o usuario no backend;
  // 2. header X-CSRF-Token deve conter o token secreto guardado no Map acima.
  // Um formulario forjado envia cookies automaticamente, mas nao conhece esse
  // token renderizado apenas na pagina legitima do usuario autenticado.
  if (!expectedToken || !receivedToken || !safeTokenEquals(receivedToken, expectedToken)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Token CSRF invalido' }, { status: 403 }),
    }
  }

  return { ok: true, sessionId, user }
}

function safeTokenEquals(receivedToken: string, expectedToken: string) {
  const received = Buffer.from(receivedToken)
  const expected = Buffer.from(expectedToken)

  if (received.length !== expected.length) {
    return false
  }

  return timingSafeEqual(received, expected)
}
