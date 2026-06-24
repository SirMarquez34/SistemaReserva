import { useEffect, useState, type FormEvent } from 'react'
import {
  getEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  type Empleado,
  type EmpleadoCreatePayload,
} from '../api/empleados'
import Modal from '../components/Modal'

interface CreateForm {
  nombre: string
  correo: string
  contrasena: string
}

interface EditForm {
  nombre: string
  correo: string
  contrasena: string
}

const EMPTY_CREATE: CreateForm = { nombre: '', correo: '', contrasena: '' }
const EMPTY_EDIT: EditForm = { nombre: '', correo: '', contrasena: '' }

function extractError(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    (err as { response?: { data?: { message?: string } } }).response?.data?.message
  ) {
    return (err as { response: { data: { message: string } } }).response.data.message
  }
  return 'Error al procesar la solicitud'
}

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [editing, setEditing] = useState<Empleado | null>(null)
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState<Empleado | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function loadPage(page: number) {
    setLoading(true)
    setError(null)
    try {
      const res = await getEmpleados(page, 10)
      setEmpleados(res.data)
      setPagination(res.pagination)
    } catch {
      setError('No se pudieron cargar los empleados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPage(1) }, [])

  function openCreate() {
    setCreateForm(EMPTY_CREATE)
    setCreateError(null)
    setShowCreate(true)
  }

  function openEdit(e: Empleado) {
    setEditing(e)
    setEditForm({ nombre: e.nombre, correo: e.correo, contrasena: '' })
    setEditError(null)
  }

  async function handleCreate(ev: FormEvent) {
    ev.preventDefault()
    setCreateError(null)
    setCreating(true)
    try {
      const payload: EmpleadoCreatePayload = {
        nombre: createForm.nombre,
        correo: createForm.correo,
        contrasena: createForm.contrasena,
      }
      await createEmpleado(payload)
      setShowCreate(false)
      await loadPage(1)
    } catch (err) {
      setCreateError(extractError(err))
    } finally {
      setCreating(false)
    }
  }

  async function handleEdit(ev: FormEvent) {
    ev.preventDefault()
    if (!editing) return
    setEditError(null)
    setSaving(true)
    try {
      const payload: { nombre: string; correo: string; contrasena?: string } = {
        nombre: editForm.nombre,
        correo: editForm.correo,
      }
      if (editForm.contrasena) payload.contrasena = editForm.contrasena
      const updated = await updateEmpleado(editing.id, payload)
      setEmpleados((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      setEditing(null)
    } catch (err) {
      setEditError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await deleteEmpleado(confirmDelete.id)
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
          <h2 className="text-2xl font-bold text-gray-900">Empleados</h2>
          <p className="text-sm text-gray-500 mt-1">{pagination.total} empleados registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Nuevo empleado
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {error && (
          <div className="px-6 py-4 text-sm text-red-600 bg-red-50">{error}</div>
        )}

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Cargando…</div>
        ) : empleados.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No hay empleados registrados
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Nombre</th>
                <th className="px-6 py-3 text-left font-medium">Correo</th>
                <th className="px-6 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {empleados.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{e.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{e.correo}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEdit(e)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(e)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Eliminar
                    </button>
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

      {/* Create modal */}
      {showCreate && (
        <Modal title="Nuevo empleado" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={createForm.nombre}
                onChange={(e) => setCreateForm((f) => ({ ...f, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
              <input
                type="email"
                required
                value={createForm.correo}
                onChange={(e) => setCreateForm((f) => ({ ...f, correo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña inicial</label>
              <input
                type="password"
                required
                minLength={6}
                value={createForm.contrasena}
                onChange={(e) => setCreateForm((f) => ({ ...f, contrasena: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {createError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {createError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {creating ? 'Creando…' : 'Crear empleado'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal title="Editar empleado" onClose={() => setEditing(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={editForm.nombre}
                onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
              <input
                type="email"
                required
                value={editForm.correo}
                onChange={(e) => setEditForm((f) => ({ ...f, correo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña{' '}
                <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>
              </label>
              <input
                type="password"
                minLength={6}
                value={editForm.contrasena}
                onChange={(e) => setEditForm((f) => ({ ...f, contrasena: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {editError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <Modal title="Eliminar empleado" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar a{' '}
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
