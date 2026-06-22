import api from './axios'

export interface Client {
  id: number
  nombre: string
  telefono: string
  email: string
  created_at: string
}

export interface ClientPayload {
  nombre: string
  telefono: string
  email: string
}

export interface PaginatedClients {
  data: Client[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export async function getClients(page = 1, limit = 10): Promise<PaginatedClients> {
  const { data } = await api.get(`/clientes?page=${page}&limit=${limit}`)
  return data
}

export async function createClient(payload: ClientPayload): Promise<Client> {
  const { data } = await api.post('/clientes', payload)
  return data.data
}

export async function updateClient(id: number, payload: Partial<ClientPayload>): Promise<Client> {
  const { data } = await api.put(`/clientes/${id}`, payload)
  return data.data
}

export async function deleteClient(id: number): Promise<void> {
  await api.delete(`/clientes/${id}`)
}
