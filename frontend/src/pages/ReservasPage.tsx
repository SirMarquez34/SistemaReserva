import { useEffect, useState, type FormEvent } from 'react'
import {
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
  marcarAsistencia,
  type Reservation,
  type ReservationPayload,
} from '../api/reservations'
import { getClients, type Client } from '../api/clients'
import { getServices, type Service } from '../api/services'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'

const ESTADOS = ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio'] as const

const ESTADO_STYLES: Record<string, string> = {
  pendiente:  'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-green-100 text-green-800',
  cancelada:  'bg-red-100 text-red-800',
  completada: 'bg-blue-100 text-blue-800',
  no_asistio: 'bg-gray-100 text-gray-600',
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente:  'Pendiente',
  confirmada: 'Confirmada',
  cancelada:  'Cancelada',
  completada: 'Completada',
  no_asistio: 'No asistió',
}

const EMPTY_FORM: ReservationPayload = {
  cliente_id: 0,
  servicio_id: 0,
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  estado: 'pendiente',
  observaciones: '',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ReservasPage() {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'admin'

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Reservation | null>(null)
  const [form, setForm] = useState<ReservationPayload>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState<Reservation | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [attendanceRow, setAttendanceRow] = useState<number | null>(null)

  async function loadPage(page: number) {
    setLoading(true)
    setError(null)
    try {
      const res = await getReservations(page, 10)
      setReservations(res.data)
      setPagination(res.pagination)
    } catch {
      setError('No se pudieron cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  async function loadSelects() {
    const [c, s] = await Promise.all([getClients(1, 100), getServices(1, 100)])
    setClients(c.data)
    setServices(s.data.filter((s) => s.activo))
  }

  useEffect(() => {
    loadPage(1)
    loadSelects()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowForm(true)
  }

  function openEdit(r: Reservation) {
    setEditing(r)
    setForm({
      cliente_id: r.cliente_id,
      servicio_id: r.servicio_id,
      fecha: r.fecha.slice(0, 10),
      hora_inicio: r.hora_inicio.slice(0, 5),
      hora_fin: r.hora_fin.slice(0, 5),
      estado: r.estado,
      observaciones: r.observaciones ?? '',
    })
    setFormError(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!form.cliente_id) { setFormError('Selecciona un cliente'); return }
    if (!form.servicio_id) { setFormError('Selecciona un servicio'); return }
    if (form.hora_fin <= form.hora_inicio) {
      setFormError('La hora de fin debe ser posterior a la hora de inicio')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        observaciones: form.observaciones || undefined,
      }
      if (editing) {
        const updated = await updateReservation(editing.id, payload)
        setReservations((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)))
        await loadPage(pagination.page)
      } else {
        await createReservation(payload)
        await loadPage(1)
      }
      closeForm()
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      setFormError(msg || 'Error al guardar la reserva')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAsistencia(id: number, asistio: boolean) {
    try {
      const updated = await marcarAsistencia(id, asistio)
      setReservations((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, estado: updated.estado } : r))
      )
    } finally {
      setAttendanceRow(null)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await deleteReservation(confirmDelete.id)
      setConfirmDelete(null)
      await loadPage(pagination.page)
    } catch {
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reservas</h2>
          <p className="text-sm text-gray-500 mt-1">{pagination.total} reservas registradas</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Nueva reserva
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {error && <div className="px-6 py-4 text-sm text-red-600 bg-red-50">{error}</div>}

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Cargando…</div>
        ) : reservations.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No hay reservas registradas
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Cliente</th>
                <th className="px-6 py-3 text-left font-medium">Servicio</th>
                <th className="px-6 py-3 text-left font-medium">Fecha</th>
                <th className="px-6 py-3 text-left font-medium">Horario</th>
                <th className="px-6 py-3 text-left font-medium">Estado</th>
                <th className="px-6 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.cliente_nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{r.servicio_nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(r.fecha)}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {r.hora_inicio.slice(0, 5)} – {r.hora_fin.slice(0, 5)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ESTADO_STYLES[r.estado] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ESTADO_LABEL[r.estado] ?? r.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {r.estado === 'confirmada' && (
                        attendanceRow === r.id ? (
                          <>
                            <button
                              onClick={() => handleAsistencia(r.id, true)}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                            >
                              Asistio
                            </button>
                            <button
                              onClick={() => handleAsistencia(r.id, false)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                            >
                              No asistio
                            </button>
                            <button
                              onClick={() => setAttendanceRow(null)}
                              className="text-gray-400 hover:text-gray-600 text-xs font-medium"
                            >
                              x
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setAttendanceRow(r.id)}
                            className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                          >
                            Registrar
                          </button>
                        )
                      )}
                      <button
                        onClick={() => openEdit(r)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Editar
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setConfirmDelete(r)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Página {pagination.page} de {pagination.totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => loadPage(pagination.page - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadPage(pagination.page + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <Modal title={editing ? 'Editar reserva' : 'Nueva reserva'} onClose={closeForm}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select
                required
                value={form.cliente_id || ''}
                onChange={(e) => setForm((f) => ({ ...f, cliente_id: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

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
              <input
                type="date"
                required
                value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                <input
                  type="time"
                  required
                  value={form.hora_inicio}
                  onChange={(e) => setForm((f) => ({ ...f, hora_inicio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                <input
                  type="time"
                  required
                  value={form.hora_fin}
                  onChange={(e) => setForm((f) => ({ ...f, hora_fin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={form.estado}
                onChange={(e) =>
                  setForm((f) => ({ ...f, estado: e.target.value as ReservationPayload['estado'] }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>{ESTADO_LABEL[e] ?? e}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                rows={2}
                value={form.observaciones}
                onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Notas adicionales…"
              />
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {submitting ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear reserva'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <Modal title="Eliminar reserva" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar la reserva de{' '}
            <span className="font-semibold text-gray-900">{confirmDelete.cliente_nombre}</span> para{' '}
            <span className="font-semibold text-gray-900">{confirmDelete.servicio_nombre}</span> el{' '}
            {formatDate(confirmDelete.fecha)}?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
