'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type EmailFormProps = {
  currentEmail: string
  csrfToken: string
}

export default function EmailForm({ currentEmail, csrfToken }: EmailFormProps) {
  const [email, setEmail] = useState(currentEmail)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const res = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // O backend compara este header com o token guardado na sessao.
        // Sem esse segredo, um POST vindo de outro site e tratado como CSRF.
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setResult({ ok: true, message: `E-mail atualizado para: ${data.newEmail}` })
      router.refresh()
    } else {
      setResult({ ok: false, message: data.error })
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>✉️</span> Alterar E-mail
      </h2>
      <form onSubmit={handleUpdate} className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar'}
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
