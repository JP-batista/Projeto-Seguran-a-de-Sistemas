import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfRequest } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  const csrf = validateCsrfRequest(request)
  if (!csrf.ok) {
    return csrf.response
  }

  const user = csrf.user
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
    return NextResponse.json({ error: 'E-mail invalido' }, { status: 400 })
  }

  const oldEmail = user.email
  user.email = email

  return NextResponse.json({ ok: true, oldEmail, newEmail: user.email })
}
