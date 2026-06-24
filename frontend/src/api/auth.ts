import api from './axios'
import type { ClienteUser } from '../context/AuthContext'

export interface User {
  pk_usuario: number
  nombre: string
  correo: string
  rol: 'admin' | 'empleado'
}

export type LoginUnificadoResponse =
  | { tipo: 'admin' | 'empleado'; user: User; token: string }
  | { tipo: 'cliente'; cliente: ClienteUser; token: string }

export async function loginRequest(correo: string, contrasena: string): Promise<LoginUnificadoResponse> {
  const { data } = await api.post('/auth/login', { correo, contrasena })
  return data.data
}
