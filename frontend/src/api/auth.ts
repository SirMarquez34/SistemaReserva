import api from './axios'

export interface LoginPayload {
  correo: string
  contrasena: string
}

export interface User {
  pk_usuario: number
  nombre: string
  correo: string
  rol: 'admin' | 'empleado'
}

export interface LoginResponse {
  user: User
  token: string
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post('/auth/login', payload)
  return data.data
}
