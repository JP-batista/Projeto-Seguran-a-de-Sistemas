import { cookies } from 'next/headers'
import { sessions, users } from './store'
import type { User } from './store'

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session_id')?.value
  if (!sessionId) return null

  const userId = sessions.get(sessionId)
  if (!userId) return null

  return users.find(u => u.id === userId) ?? null
}
