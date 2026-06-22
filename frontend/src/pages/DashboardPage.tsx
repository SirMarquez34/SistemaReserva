import { useEffect, useState } from 'react'
import { getStats } from '../api/stats'
import { getReservations, type Reservation } from '../api/reservations'

interface Stats {
  reservas: number
  clientes: number
  servicios: number
  horarios: number
}

const ESTADO_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, r] = await Promise.all([
          getStats(),
          getReservations(1, 5),
        ])
        setStats(s)
        setReservations(r.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <p className="text-gray-400 text-sm">Cargando…</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Resumen general del sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Reservas" value={stats?.reservas ?? 0} icon="📅" />
        <StatCard label="Clientes" value={stats?.clientes ?? 0} icon="👥" />
        <StatCard label="Servicios" value={stats?.servicios ?? 0} icon="✂️" />
        <StatCard label="Horarios" value={stats?.horarios ?? 0} icon="🕐" />
      </div>

      {/* Recent reservations */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Reservas recientes</h3>
        </div>

        {reservations.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            No hay reservas registradas aún
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Cliente</th>
                <th className="px-6 py-3 text-left font-medium">Servicio</th>
                <th className="px-6 py-3 text-left font-medium">Fecha</th>
                <th className="px-6 py-3 text-left font-medium">Hora</th>
                <th className="px-6 py-3 text-left font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservations.map((r) => (
                <tr key={r.pk_reserva} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.cliente_nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{r.servicio_nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(r.fecha)}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {r.hora_inicio.slice(0, 5)} – {r.hora_fin.slice(0, 5)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        ESTADO_STYLES[r.estado] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
