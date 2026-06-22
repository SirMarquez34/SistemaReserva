import api from './axios'

export interface Horario {
  id: number
  dia_semana: string
  hora_inicio: string
  hora_fin: string
  disponible: boolean
}

export interface HorarioPayload {
  dia_semana: string
  hora_inicio: string
  hora_fin: string
  disponible: boolean
}

export interface PaginatedHorarios {
  data: Horario[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export async function getHorarios(page = 1, limit = 10): Promise<PaginatedHorarios> {
  const { data } = await api.get(`/horarios?page=${page}&limit=${limit}`)
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
