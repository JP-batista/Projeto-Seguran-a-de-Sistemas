export interface User {
  id: string
  username: string
  password: string
  email: string
  balance: number
}

// Usando globalThis para persistir estado entre hot-reloads no dev
declare global {
  var __bankUsers: User[] | undefined
  var __bankSessions: Map<string, string> | undefined
}

export const users: User[] = (globalThis.__bankUsers ??= [
  { id: '1', username: 'alice', password: 'alice123', email: 'alice@safebank.local', balance: 10000 },
  { id: '2', username: 'bob', password: 'bob123', email: 'bob@safebank.local', balance: 500 },
])

export const sessions: Map<string, string> = (globalThis.__bankSessions ??= new Map())
