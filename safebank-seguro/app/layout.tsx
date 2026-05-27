import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SafeBank Seguro - Banco Online',
  description: 'SafeBank Seguro - sua conta bancaria com protecao contra CSRF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
