export interface User {
  id: string
  username: string
  password: string
  email: string
  balance: number
}

// Usando globalThis para persistir estado entre hot-reloads no dev
declare global {
  var __csrfUsers: User[] | undefined
  var __csrfSessions: Map<string, string> | undefined
}

export const users: User[] = (globalThis.__csrfUsers ??= [
  { id: '1', username: 'alice', password: 'alice123', email: 'alice@safebank.local', balance: 10000 },
  { id: '2', username: 'bob', password: 'bob123', email: 'bob@safebank.local', balance: 500 },
])

// sessionId → userId
export const sessions: Map<string, string> = (globalThis.__csrfSessions ??= new Map())
