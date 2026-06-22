import { useEffect, useState, type FormEvent } from 'react'
import {
  getServices,
  createService,
  updateService,
  deleteService,
  type Service,
  type ServicePayload,
} from '../api/services'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'

const EMPTY_FORM: ServicePayload = {
  nombre: '',
  descripcion: '',
  duracion_minutos: 30,
  precio: 0,
  activo: true,
}

export default function ServiciosPage() {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'admin'

  const [services, setServices] = useState<Service[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServicePayload>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function loadPage(page: number) {
    setLoading(true)
    setError(null)
    try {
      const res = await getServices(page, 10)
      setServices(res.data)
      setPagination(res.pagination)
    } catch {
      setError('No se pudieron cargar los servicios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPage(1) }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowForm(true)
  }

  function openEdit(s: Service) {
    setEditing(s)
    setForm({
      nombre: s.nombre,
      descripcion: s.descripcion,
      duracion_minutos: s.duracion_minutos,
      precio: s.precio,
      activo: s.activo,
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
    setSubmitting(true)
    try {
      if (editing) {
        const updated = await updateService(editing.id, form)
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      } else {
        await createService(form)
        await loadPage(1)
      }
      closeForm()
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      setFormError(msg || 'Error al guardar el servicio')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await deleteService(confirmDelete.id)
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
          <h2 className="text-2xl font-bold text-gray-900">Servicios</h2>
          <p className="text-sm text-gray-500 mt-1">{pagination.total} servicios registrados</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + Nuevo servicio
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {error && <div className="px-6 py-4 text-sm text-red-600 bg-red-50">{error}</div>}

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Cargando…</div>
        ) : services.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No hay servicios registrados
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Nombre</th>
                <th className="px-6 py-3 text-left font-medium">Descripción</th>
                <th className="px-6 py-3 text-left font-medium">Duración</th>
                <th className="px-6 py-3 text-left font-medium">Precio</th>
                <th className="px-6 py-3 text-left font-medium">Estado</th>
                {isAdmin && <th className="px-6 py-3 text-right font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{s.nombre}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{s.descripcion}</td>
                  <td className="px-6 py-4 text-gray-600">{s.duracion_minutos} min</td>
                  <td className="px-6 py-4 text-gray-600">
                    ${Number(s.precio).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(s)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Página {pagination.page} de {pagination.totalPages}
          </span>
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
        <Modal title={editing ? 'Editar servicio' : 'Nuevo servicio'} onClose={closeForm}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. Corte de cabello"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                required
                rows={3}
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Descripción del servicio"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (min)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.duracion_minutos}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duracion_minutos: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={0.01}
                  value={form.precio}
                  onChange={(e) => setForm((f) => ({ ...f, precio: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="activo"
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                Servicio activo
              </label>
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
                {submitting ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear servicio'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <Modal title="Eliminar servicio" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar{' '}
            <span className="font-semibold text-gray-900">{confirmDelete.nombre}</span>? Esta acción
            no se puede deshacer.
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
