import api from './axios'

export interface Empleado {
  id: number
  nombre: string
  correo: string
}

export interface EmpleadoCreatePayload {
  nombre: string
  correo: string
  contrasena: string
}

export interface EmpleadoUpdatePayload {
  nombre?: string
  correo?: string
  contrasena?: string
}

export interface PaginatedEmpleados {
  data: Empleado[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export async function getEmpleados(page = 1, limit = 10): Promise<PaginatedEmpleados> {
  const { data } = await api.get(`/empleados?page=${page}&limit=${limit}`)
  return data
}

export async function createEmpleado(payload: EmpleadoCreatePayload): Promise<Empleado> {
  const { data } = await api.post('/empleados', payload)
  return data.data
}

export async function updateEmpleado(id: number, payload: EmpleadoUpdatePayload): Promise<Empleado> {
  const { data } = await api.put(`/empleados/${id}`, payload)
  return data.data
}

export async function deleteEmpleado(id: number): Promise<void> {
  await api.delete(`/empleados/${id}`)
}
