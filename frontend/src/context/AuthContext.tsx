import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '../api/auth'

export interface ClienteUser {
  tipo: 'cliente'
  cliente_id: number
  nombre: string
  email: string
}

interface AuthContextType {
  user: User | null
  cliente: ClienteUser | null
  token: string | null
  login: (user: User, token: string) => void
  loginCliente: (cliente: ClienteUser, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function getStoredCliente(): ClienteUser | null {
  try {
    const raw = localStorage.getItem('cliente')
    return raw ? (JSON.parse(raw) as ClienteUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [cliente, setCliente] = useState<ClienteUser | null>(getStoredCliente)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  function login(user: User, token: string) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.removeItem('cliente')
    setUser(user)
    setCliente(null)
    setToken(token)
  }

  function loginCliente(cliente: ClienteUser, token: string) {
    localStorage.setItem('token', token)
    localStorage.setItem('cliente', JSON.stringify(cliente))
    localStorage.removeItem('user')
    setCliente(cliente)
    setUser(null)
    setToken(token)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('cliente')
    setUser(null)
    setCliente(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, cliente, token, login, loginCliente, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
