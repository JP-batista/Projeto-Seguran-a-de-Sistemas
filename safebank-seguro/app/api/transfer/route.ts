import { NextRequest, NextResponse } from 'next/server'
import { users } from '@/lib/store'
import { validateCsrfRequest } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  const csrf = validateCsrfRequest(request)
  if (!csrf.ok) {
    return csrf.response
  }

  const sender = csrf.user
  let to: string, amount: number
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = await request.json()
    to = body.to
    amount = Number(body.amount)
  } else {
    const formData = await request.formData()
    to = formData.get('to') as string
    amount = Number(formData.get('amount'))
  }

  if (!to || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Dados de transferencia invalidos' }, { status: 400 })
  }

  if (sender.balance < amount) {
    return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
  }

  const recipient = users.find(u => u.username === to)
  if (!recipient) {
    return NextResponse.json({ error: 'Destinatario nao encontrado' }, { status: 404 })
  }

  if (sender.id === recipient.id) {
    return NextResponse.json({ error: 'Nao pode transferir para si mesmo' }, { status: 400 })
  }

  sender.balance -= amount
  recipient.balance += amount

  return NextResponse.json({
    ok: true,
    message: `Transferido R$ ${amount.toLocaleString('pt-BR')} para ${to}`,
    newBalance: sender.balance,
    from: sender.username,
  })
}
