import { useEffect, useState, type FormEvent } from 'react'
import {
  getHorarios,
  createHorario,
  updateHorario,
  deleteHorario,
  type Horario,
  type HorarioPayload,
} from '../api/horarios'
import { getEmpleados, type Empleado } from '../api/empleados'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
const DIA_LABEL: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', 'miércoles': 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sábado: 'Sábado', domingo: 'Domingo',
}

function emptyForm(empleadoId: number): HorarioPayload {
  return { dia_semana: 'lunes', hora_inicio: '09:00', hora_fin: '18:00', disponible: true, usuario_id: empleadoId }
}

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message
    if (msg) return msg
  }
  return 'Error al procesar la solicitud'
}

export default function HorariosPage() {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'admin'

  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [selectedEmpleado, setSelectedEmpleado] = useState<number | null>(null)

  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Horario | null>(null)
  const [form, setForm] = useState<HorarioPayload>(emptyForm(0))
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState<Horario | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getEmpleados(1, 100).then((res) => {
      setEmpleados(res.data)
      if (res.data.length > 0) setSelectedEmpleado(res.data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedEmpleado) return
    setLoadingHorarios(true)
    setError(null)
    getHorarios(1, 50, selectedEmpleado)
      .then((res) => setHorarios(res.data))
      .catch(() => setError('No se pudieron cargar los horarios'))
      .finally(() => setLoadingHorarios(false))
  }, [selectedEmpleado])

  function openCreate() {
    if (!selectedEmpleado) return
    setEditing(null)
    setForm(emptyForm(selectedEmpleado))
    setFormError(null)
    setShowForm(true)
  }

  function openEdit(h: Horario) {
    setEditing(h)
    setForm({
      dia_semana:  h.dia_semana,
      hora_inicio: h.hora_inicio.slice(0, 5),
      hora_fin:    h.hora_fin.slice(0, 5),
      disponible:  h.disponible,
      usuario_id:  h.usuario_id ?? selectedEmpleado ?? 0,
    })
    setFormError(null)
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null) }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (form.hora_fin <= form.hora_inicio) {
      setFormError('La hora de fin debe ser posterior a la hora de inicio')
      return
    }
    setSubmitting(true)
    try {
      if (editing) {
        const updated = await updateHorario(editing.id, form)
        setHorarios((prev) => prev.map((h) => (h.id === updated.id ? updated : h)))
      } else {
        const created = await createHorario(form)
        setHorarios((prev) => [...prev, created])
      }
      closeForm()
    } catch (err) {
      setFormError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await deleteHorario(confirmDelete.id)
      setHorarios((prev) => prev.filter((h) => h.id !== confirmDelete.id))
      setConfirmDelete(null)
    } catch {
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const empleadoActual = empleados.find((e) => e.id === selectedEmpleado)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Horarios por empleado</h2>
          <p className="text-sm text-gray-500 mt-1">
            {horarios.length} turno{horarios.length !== 1 ? 's' : ''} configurado{horarios.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && selectedEmpleado && (
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + Nuevo turno
          </button>
        )}
      </div>

      {/* Employee selector */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Empleado</label>
        {empleados.length === 0 ? (
          <p className="text-sm text-gray-400">No hay empleados registrados</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {empleados.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelectedEmpleado(e.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  selectedEmpleado === e.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                }`}
              >
                {e.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Horarios table */}
      {selectedEmpleado && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {error && <div className="px-6 py-4 text-sm text-red-600 bg-red-50">{error}</div>}

          {loadingHorarios ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">Cargando…</div>
          ) : horarios.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">
              {empleadoActual?.nombre} no tiene turnos configurados
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Día</th>
                  <th className="px-6 py-3 text-left font-medium">Hora inicio</th>
                  <th className="px-6 py-3 text-left font-medium">Hora fin</th>
                  <th className="px-6 py-3 text-left font-medium">Estado</th>
                  {isAdmin && <th className="px-6 py-3 text-right font-medium">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {horarios.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 capitalize">
                      {DIA_LABEL[h.dia_semana] ?? h.dia_semana}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{h.hora_inicio.slice(0, 5)}</td>
                    <td className="px-6 py-4 text-gray-600">{h.hora_fin.slice(0, 5)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        h.disponible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {h.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => openEdit(h)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          Editar
                        </button>
                        <button onClick={() => setConfirmDelete(h)} className="text-red-500 hover:text-red-700 text-xs font-medium">
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
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <Modal title={editing ? 'Editar turno' : 'Nuevo turno'} onClose={closeForm}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Día de la semana</label>
              <select
                value={form.dia_semana}
                onChange={(e) => setForm((f) => ({ ...f, dia_semana: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DIAS.map((d) => <option key={d} value={d}>{DIA_LABEL[d]}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                <input
                  type="time" required value={form.hora_inicio}
                  onChange={(e) => setForm((f) => ({ ...f, hora_inicio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                <input
                  type="time" required value={form.hora_fin}
                  onChange={(e) => setForm((f) => ({ ...f, hora_fin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="disponible" type="checkbox" checked={form.disponible}
                onChange={(e) => setForm((f) => ({ ...f, disponible: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="disponible" className="text-sm font-medium text-gray-700">
                Disponible para reservas
              </label>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{formError}</div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeForm} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                Cancelar
              </button>
              <button
                type="submit" disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {submitting ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear turno'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <Modal title="Eliminar turno" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-gray-600 mb-6">
            ¿Eliminar el turno del{' '}
            <span className="font-semibold text-gray-900 capitalize">
              {DIA_LABEL[confirmDelete.dia_semana] ?? confirmDelete.dia_semana}
            </span>{' '}
            de {confirmDelete.hora_inicio.slice(0, 5)} a {confirmDelete.hora_fin.slice(0, 5)}?
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Cancelar
            </button>
            <button
              onClick={handleDelete} disabled={deleting}
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
