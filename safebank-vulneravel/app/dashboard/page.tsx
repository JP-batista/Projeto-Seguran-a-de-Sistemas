import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import TransferForm from './transfer-form'
import EmailForm from './email-form'
import LogoutButton from './logout-button'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏦</span>
          <span className="font-bold text-lg">SafeBank</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>Olá, <strong>{user.username}</strong></span>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-6 space-y-5">
        {/* Saldo */}
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 font-medium">Saldo disponível</p>
          <p className="text-4xl font-bold text-green-600 mt-1">
            R$ {user.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-400 mt-2">E-mail: {user.email}</p>
        </div>

        {/* Formulário de transferência */}
        <TransferForm />

        {/* Formulário de alteração de e-mail */}
        <EmailForm currentEmail={user.email} />

      </main>
    </div>
  )
}
