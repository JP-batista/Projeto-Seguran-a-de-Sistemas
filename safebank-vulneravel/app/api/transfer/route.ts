import { NextRequest, NextResponse } from 'next/server'
import { sessions, users } from '@/lib/store'

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value
  if (!sessionId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const userId = sessions.get(sessionId)
  if (!userId) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
  }

  const sender = users.find(u => u.id === userId)
  if (!sender) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

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
    return NextResponse.json({ error: 'Dados de transferência inválidos' }, { status: 400 })
  }

  if (sender.balance < amount) {
    return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
  }

  const recipient = users.find(u => u.username === to)
  if (!recipient) {
    return NextResponse.json({ error: 'Destinatário não encontrado' }, { status: 404 })
  }

  if (sender.id === recipient.id) {
    return NextResponse.json({ error: 'Não pode transferir para si mesmo' }, { status: 400 })
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
