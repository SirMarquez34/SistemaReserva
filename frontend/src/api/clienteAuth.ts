import api from './axios'
import type { ClienteUser } from '../context/AuthContext'

export interface RegisterClientePayload {
  nombre: string
  telefono: string
  email: string
  contrasena: string
}

export interface LoginClientePayload {
  email: string
  contrasena: string
}

export interface ClienteAuthResponse {
  cliente: ClienteUser
  token: string
}

export async function registerClienteRequest(payload: RegisterClientePayload): Promise<ClienteAuthResponse> {
  const { data } = await api.post('/auth/registro-cliente', payload)
  return data.data
}

export async function loginClienteRequest(payload: LoginClientePayload): Promise<ClienteAuthResponse> {
  const { data } = await api.post('/auth/login-cliente', payload)
  return data.data
}

export async function getMisReservas(page = 1, limit = 10) {
  const { data } = await api.get(`/reservas/mis-reservas?page=${page}&limit=${limit}`)
  return data
}

export async function createMiReserva(payload: {
  servicio_id: number
  fecha: string
  hora_inicio: string
  observaciones?: string
}) {
  const { data } = await api.post('/reservas/mis-reservas', payload)
  return data.data
}
