import api from './axios'

async function fetchTotal(endpoint: string): Promise<number> {
  const { data } = await api.get(`${endpoint}?page=1&limit=1`)
  return data.pagination?.total ?? 0
}

export async function getStats() {
  const [reservas, clientes, servicios, horarios] = await Promise.all([
    fetchTotal('/reservas'),
    fetchTotal('/clientes'),
    fetchTotal('/servicios'),
    fetchTotal('/horarios'),
  ])
  return { reservas, clientes, servicios, horarios }
}
