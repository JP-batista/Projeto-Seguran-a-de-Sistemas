'use client'

export default function LogoutButton() {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
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
