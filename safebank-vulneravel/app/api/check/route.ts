import { NextResponse } from 'next/server'
import { users } from '@/lib/store'

// Endpoint público de verificação — usado pelo site do atacante para mostrar
// o antes/depois dos saldos. Não requer autenticação (é apenas leitura pública).
// Em produção, expor saldos assim seria outra vulnerabilidade — aqui é só para demo.
export async function GET() {
  const alice = users.find(u => u.username === 'alice')
  const bob = users.find(u => u.username === 'bob')

  const response = NextResponse.json({
    alice: { balance: alice?.balance ?? 0, email: alice?.email },
    bob: { balance: bob?.balance ?? 0, email: bob?.email },
  })

  // Permite leitura cross-origin do localhost:4000 (site do atacante no demo)
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4000')

  return response
}
