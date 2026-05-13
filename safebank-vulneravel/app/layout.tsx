import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SafeBank — Demo CSRF',
  description: 'Aplicação propositalmente vulnerável a CSRF para fins educacionais',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.className}>
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
