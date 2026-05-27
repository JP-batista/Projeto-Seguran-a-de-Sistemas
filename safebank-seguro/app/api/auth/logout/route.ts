import { NextRequest, NextResponse } from 'next/server'
import { sessions } from '@/lib/store'
import { deleteCsrfTokenForSession, validateCsrfRequest } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  const csrf = validateCsrfRequest(request)
  if (!csrf.ok) {
    return csrf.response
  }

  sessions.delete(csrf.sessionId)
  deleteCsrfTokenForSession(csrf.sessionId)

  const response = NextResponse.json({ ok: true })
  response.cookies.set('session_id', '', {
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  })
  return response
}
