import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getCsrfTokenForSession } from '@/lib/csrf'
import TransferForm from './transfer-form'
import EmailForm from './email-form'
import LogoutButton from './logout-button'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { sessionId, user } = session

  // O Server Component le o token que esta guardado no backend para esta
  // sessao e entrega como prop aos componentes client-side. Assim o token
  // participa das requisicoes legitimas sem precisar ficar em cookie legivel.
  const csrfToken = getCsrfTokenForSession(sessionId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏦</span>
          <span className="font-bold text-lg">SafeBank</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>Ola, <strong>{user.username}</strong></span>
          <LogoutButton csrfToken={csrfToken} />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-6 space-y-5">
        {/* Saldo */}
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 font-medium">Saldo disponivel</p>
          <p className="text-4xl font-bold text-green-600 mt-1">
            R$ {user.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-400 mt-2">E-mail: {user.email}</p>
        </div>

        {/* Formulario de transferencia */}
        <TransferForm csrfToken={csrfToken} />

        {/* Formulario de alteracao de e-mail */}
        <EmailForm currentEmail={user.email} csrfToken={csrfToken} />

      </main>
    </div>
  )
}
