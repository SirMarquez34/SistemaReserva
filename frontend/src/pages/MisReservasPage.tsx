import { useEffect, useState, type FormEvent } from 'react'
import { getMisReservas, createMiReserva } from '../api/clienteAuth'
import { getServices, type Service } from '../api/services'
import { useAuth } from '../context/AuthContext'
import type { Reservation } from '../api/reservations'
import Modal from '../components/Modal'

const ESTADO_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function MisReservasPage() {
  const { cliente, logout } = useAuth()

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(true)

  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ servicio_id: 0, fecha: '', hora_inicio: '', observaciones: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function loadPage(page: number) {
    setLoading(true)
    try {
      const res = await getMisReservas(page, 10)
      setReservations(res.data)
      setPagination(res.pagination)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPage(1)
    getServices(1, 100).then((r) => setServices(r.data.filter((s: Service) => s.activo)))
  }, [])

  function openForm() {
    setForm({ servicio_id: 0, fecha: '', hora_inicio: '', observaciones: '' })
    setFormError(null)
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.servicio_id) { setFormError('Selecciona un servicio'); return }

    setSubmitting(true)
    try {
      await createMiReserva({
        servicio_id: form.servicio_id,
        fecha: form.fecha,
        hora_inicio: form.hora_inicio,
        observaciones: form.observaciones || undefined,
      })
      setShowForm(false)
      await loadPage(1)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      setFormError(msg || 'Error al crear la reserva')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Sistema de Reservas</h1>
            <p className="text-sm text-gray-500">Hola, {cliente?.nombre}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openForm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              + Nueva reserva
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mis reservas</h2>
          <p className="text-sm text-gray-500 mt-1">{pagination.total} reservas en total</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">Cargando…</div>
          ) : reservations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400 text-sm mb-4">Aún no tienes reservas</p>
              <button
                onClick={openForm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
              >
                Reservar ahora
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Servicio</th>
                  <th className="px-6 py-3 text-left font-medium">Fecha</th>
                  <th className="px-6 py-3 text-left font-medium">Horario</th>
                  <th className="px-6 py-3 text-left font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{r.servicio_nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(r.fecha)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {r.hora_inicio.slice(0, 5)} – {r.hora_fin.slice(0, 5)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ESTADO_STYLES[r.estado] ?? 'bg-gray-100 text-gray-700'}`}>
                        {r.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Página {pagination.page} de {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => loadPage(pagination.page - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                Anterior
              </button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => loadPage(pagination.page + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <Modal title="Nueva reserva" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
              <select
                required
                value={form.servicio_id || ''}
                onChange={(e) => setForm((f) => ({ ...f, servicio_id: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un servicio</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.duracion_minutos} min — ${Number(s.precio).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" required value={form.fecha}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora de inicio</label>
              <input type="time" required value={form.hora_inicio}
                onChange={(e) => setForm((f) => ({ ...f, hora_inicio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea rows={2} value={form.observaciones}
                onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Alguna nota adicional…"
              />
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                Cancelar
              </button>
              <button type="submit" disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors">
                {submitting ? 'Reservando…' : 'Confirmar reserva'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
