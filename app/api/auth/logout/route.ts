import { NextRequest, NextResponse } from 'next/server'
import { sessions } from '@/lib/store'

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value
  if (sessionId) {
    sessions.delete(sessionId)
  }

  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.delete('session_id')
  return response
}
