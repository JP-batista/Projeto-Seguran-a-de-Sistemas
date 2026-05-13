import { redirect } from 'next/navigation'

// O ataque CSRF agora é demonstrado a partir de uma origem externa (localhost:4000).
// Esta rota não é mais usada — redireciona para o dashboard.
export default function AttackerRedirect() {
  redirect('/dashboard')
}
