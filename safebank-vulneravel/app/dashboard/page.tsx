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

        {/* Card do ataque CSRF */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5">
          <h3 className="font-bold text-amber-800 flex items-center gap-2">
            <span>⚡</span> Demonstração do Ataque CSRF
          </h3>
          <p className="text-sm text-amber-700 mt-2">
            Você está logado como <strong>{user.username}</strong>. Clique abaixo para simular
            o que acontece quando você acessa uma página maliciosa enquanto está autenticado.
          </p>
          <p className="text-xs text-amber-600 mt-2">
            A página do atacante vai disparar uma transferência silenciosa sem sua permissão.
          </p>
          <a
            href="/attacker"
            className="mt-3 inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
          >
            🎭 Abrir Página do Atacante →
          </a>
        </div>

        {/* Explicação da vulnerabilidade */}
        <div className="bg-gray-800 text-gray-100 rounded-xl p-5 text-xs font-mono">
          <p className="text-yellow-400 font-bold mb-2">// Por que este endpoint é vulnerável?</p>
          <p className="text-gray-400">// POST /api/transfer</p>
          <p className="mt-1">
            <span className="text-red-400">❌ Sem token CSRF</span> — qualquer origem pode acionar
          </p>
          <p className="mt-1">
            <span className="text-red-400">❌ Cookie sem SameSite=Strict</span> — enviado automaticamente
          </p>
          <p className="mt-1">
            <span className="text-red-400">❌ Aceita form-urlencoded</span> — formulários HTML podem forjar
          </p>
          <p className="mt-3 text-green-400">// Para corrigir:</p>
          <p className="text-gray-300">✅ Gerar e validar token CSRF único por sessão</p>
          <p className="text-gray-300">✅ Definir cookie com SameSite=Strict</p>
          <p className="text-gray-300">✅ Validar header Origin/Referer nas ações sensíveis</p>
        </div>
      </main>
    </div>
  )
}
