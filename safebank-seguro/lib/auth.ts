import { cookies } from 'next/headers'
import { sessions, users } from './store'
import type { User } from './store'

export async function getSession(): Promise<{ sessionId: string; user: User } | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session_id')?.value
  if (!sessionId) return null

  const userId = sessions.get(sessionId)
  if (!userId) return null

  const user = users.find(u => u.id === userId) ?? null
  if (!user) return null

  return { sessionId, user }
}

export async function getSessionUser(): Promise<User | null> {
  return (await getSession())?.user ?? null
}
