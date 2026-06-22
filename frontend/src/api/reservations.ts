import api from './axios'

export interface Reservation {
  id: number
  cliente_id: number
  servicio_id: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: 'pendiente' | 'confirmada' | 'cancelada'
  observaciones: string | null
  created_at: string
  cliente_nombre: string
  servicio_nombre: string
}

export interface ReservationPayload {
  cliente_id: number
  servicio_id: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: 'pendiente' | 'confirmada' | 'cancelada'
  observaciones?: string
}

export interface PaginatedReservations {
  data: Reservation[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export async function getReservations(page = 1, limit = 10): Promise<PaginatedReservations> {
  const { data } = await api.get(`/reservas?page=${page}&limit=${limit}`)
  return data
}

export async function createReservation(payload: ReservationPayload): Promise<Reservation> {
  const { data } = await api.post('/reservas', payload)
  return data.data
}

export async function updateReservation(id: number, payload: Partial<ReservationPayload>): Promise<Reservation> {
  const { data } = await api.put(`/reservas/${id}`, payload)
  return data.data
}

export async function deleteReservation(id: number): Promise<void> {
  await api.delete(`/reservas/${id}`)
}
