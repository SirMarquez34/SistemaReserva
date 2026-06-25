import api from './axios'

export interface Horario {
  id: number
  dia_semana: string
  hora_inicio: string
  hora_fin: string
  disponible: boolean
  usuario_id: number | null
  empleado_nombre?: string
}

export interface HorarioPayload {
  dia_semana: string
  hora_inicio: string
  hora_fin: string
  disponible: boolean
  usuario_id: number
}

export interface PaginatedHorarios {
  data: Horario[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export async function getHorarios(page = 1, limit = 50, empleado_id?: number): Promise<PaginatedHorarios> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (empleado_id) params.set('empleado_id', String(empleado_id))
  const { data } = await api.get(`/horarios?${params}`)
  return data
}

export async function createHorario(payload: HorarioPayload): Promise<Horario> {
  const { data } = await api.post('/horarios', payload)
  return data.data
}

export async function updateHorario(id: number, payload: Partial<HorarioPayload>): Promise<Horario> {
  const { data } = await api.put(`/horarios/${id}`, payload)
  return data.data
}

export async function deleteHorario(id: number): Promise<void> {
  await api.delete(`/horarios/${id}`)
}
