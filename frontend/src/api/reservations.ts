import api from './axios'

export interface Reservation {
  pk_reserva: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: 'pendiente' | 'confirmada' | 'cancelada'
  notas: string | null
  nombre_cliente: string
  nombre_servicio: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getReservations(page = 1, limit = 10): Promise<PaginatedResponse<Reservation>> {
  const { data } = await api.get(`/reservas?page=${page}&limit=${limit}`)
  return data
}
