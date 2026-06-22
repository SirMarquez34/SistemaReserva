import api from './axios'

export interface Service {
  id: number
  nombre: string
  descripcion: string
  duracion_minutos: number
  precio: number
  activo: boolean
  created_at: string
}

export interface ServicePayload {
  nombre: string
  descripcion: string
  duracion_minutos: number
  precio: number
  activo: boolean
}

export interface PaginatedServices {
  data: Service[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export async function getServices(page = 1, limit = 10): Promise<PaginatedServices> {
  const { data } = await api.get(`/servicios?page=${page}&limit=${limit}`)
  return data
}

export async function createService(payload: ServicePayload): Promise<Service> {
  const { data } = await api.post('/servicios', payload)
  return data.data
}

export async function updateService(id: number, payload: Partial<ServicePayload>): Promise<Service> {
  const { data } = await api.put(`/servicios/${id}`, payload)
  return data.data
}

export async function deleteService(id: number): Promise<void> {
  await api.delete(`/servicios/${id}`)
}
