'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TransferForm({ csrfToken }: { csrfToken: string }) {
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const res = await fetch('/api/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // O token chegou como prop do Server Component autenticado. Ele prova
        // que esta acao nasceu da tela legitima do SafeBank, pois um site
        // atacante nao consegue ler esse valor para montar o header.
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ to, amount: Number(amount) }),
    })

    const data = await res.json()
    setLoading(false)
    setResult({ ok: res.ok, message: res.ok ? data.message : data.error })

    if (res.ok) {
      setTo('')
      setAmount('')
      router.refresh() // recarrega dados do servidor
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>💸</span> Transferir Dinheiro
      </h2>
      <form onSubmit={handleTransfer} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Destinatario</label>
            <input
              type="text"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="nome de usuario"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              min="1"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Transferindo...' : 'Transferir'}
        </button>
      </form>

      {result && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result.ok ? 'OK' : 'Erro'} {result.message}
        </div>
      )}
    </div>
  )
}
