'use client'

export default function LogoutButton({ csrfToken }: { csrfToken: string }) {
  async function handleLogout() {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        // Logout tambem muda estado de autenticacao, entao exige o mesmo
        // token CSRF associado a sessao atual.
        'X-CSRF-Token': csrfToken,
      },
    })

    if (res.ok) {
      window.location.href = '/login'
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
    >
      Sair
    </button>
  )
}
