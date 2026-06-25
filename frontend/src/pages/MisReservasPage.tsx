import { useEffect, useState } from 'react'
import { getMisReservas, getSlotsDisponibles, createMiReserva } from '../api/clienteAuth'
import { getEmpleadosDisponibles, type Empleado } from '../api/empleados'
import { getServices, type Service } from '../api/services'
import { useAuth } from '../context/AuthContext'
import type { Reservation } from '../api/reservations'

const ESTADO_STYLES: Record<string, string> = {
  pendiente:  'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-green-100 text-green-800',
  cancelada:  'bg-red-100 text-red-800',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

type Step = 'form' | 'empleado' | 'slots' | 'confirm'

export default function MisReservasPage() {
  const { cliente, logout } = useAuth()

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])

  // Booking flow
  const [showBooking, setShowBooking] = useState(false)
  const [step, setStep] = useState<Step>('form')

  const [servicioId, setServicioId] = useState(0)
  const [fecha, setFecha] = useState('')

  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loadingEmpleados, setLoadingEmpleados] = useState(false)
  const [empleadoId, setEmpleadoId] = useState(0)

  const [slots, setSlots] = useState<{ hora: string; disponible: boolean }[]>([])
  const [duracion, setDuracion] = useState(0)
  const [slotSeleccionado, setSlotSeleccionado] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [observaciones, setObservaciones] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  function openBooking() {
    setStep('form')
    setServicioId(0)
    setFecha('')
    setEmpleados([])
    setEmpleadoId(0)
    setSlots([])
    setSlotSeleccionado('')
    setObservaciones('')
    setMensaje(null)
    setError(null)
    setShowBooking(true)
  }

  async function handleBuscarEmpleados() {
    if (!servicioId || !fecha) return
    setLoadingEmpleados(true)
    setMensaje(null)
    try {
      const lista = await getEmpleadosDisponibles(fecha)
      setEmpleados(lista)
      if (lista.length === 0) setMensaje('No hay empleados disponibles para esa fecha')
      setStep('empleado')
    } catch {
      setMensaje('Error al cargar los empleados disponibles')
    } finally {
      setLoadingEmpleados(false)
    }
  }

  async function handleSeleccionarEmpleado(id: number) {
    setEmpleadoId(id)
    setLoadingSlots(true)
    setMensaje(null)
    try {
      const res = await getSlotsDisponibles(servicioId, fecha, id)
      setSlots(res.slots)
      setDuracion(res.duracion)
      if (res.mensaje) setMensaje(res.mensaje)
      setStep('slots')
    } catch {
      setMensaje('Error al cargar los horarios')
    } finally {
      setLoadingSlots(false)
    }
  }

  function selectSlot(hora: string) {
    setSlotSeleccionado(hora)
    setStep('confirm')
  }

  async function handleConfirmar() {
    setError(null)
    setSubmitting(true)
    try {
      await createMiReserva({
        servicio_id: servicioId,
        empleado_id: empleadoId,
        fecha,
        hora_inicio: slotSeleccionado,
        observaciones: observaciones || undefined,
      })
      setShowBooking(false)
      await loadPage(1)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      setError(msg || 'Error al crear la reserva')
      setStep('slots')
    } finally {
      setSubmitting(false)
    }
  }

  const servicioSeleccionado = services.find((s) => s.id === servicioId)
  const empleadoSeleccionado = empleados.find((e) => e.id === empleadoId)

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
            <button onClick={openBooking}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
              + Nueva reserva
            </button>
            <button onClick={logout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg">
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
              <button onClick={openBooking}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">
                Reservar ahora
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Servicio</th>
                  <th className="px-6 py-3 text-left font-medium">Empleado</th>
                  <th className="px-6 py-3 text-left font-medium">Fecha</th>
                  <th className="px-6 py-3 text-left font-medium">Horario</th>
                  <th className="px-6 py-3 text-left font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{r.servicio_nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{(r as any).empleado_nombre ?? '—'}</td>
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
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">Anterior</button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => loadPage(pagination.page + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </main>

      {/* Booking panel */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Nueva reserva</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {step === 'form'     && 'Elige el servicio y la fecha'}
                  {step === 'empleado' && 'Selecciona un empleado'}
                  {step === 'slots'    && 'Selecciona un horario'}
                  {step === 'confirm'  && 'Confirma tu reserva'}
                </p>
              </div>
              <button onClick={() => setShowBooking(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5">

              {/* STEP 1: Servicio + fecha */}
              {step === 'form' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                    <select
                      value={servicioId || ''}
                      onChange={(e) => setServicioId(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona un servicio</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} — {s.duracion_minutos} min · ${Number(s.precio).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input type="date" value={fecha}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setFecha(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleBuscarEmpleados}
                    disabled={!servicioId || !fecha || loadingEmpleados}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {loadingEmpleados ? 'Buscando empleados…' : 'Ver empleados disponibles →'}
                  </button>
                  {mensaje && <p className="text-sm text-gray-500 text-center">{mensaje}</p>}
                </div>
              )}

              {/* STEP 2: Elegir empleado */}
              {step === 'empleado' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setStep('form')} className="text-sm text-blue-600 hover:underline">← Cambiar</button>
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">{servicioSeleccionado?.nombre}</span> · {formatDate(fecha)}
                    </span>
                  </div>

                  {loadingSlots ? (
                    <div className="py-8 text-center text-sm text-gray-400">Cargando…</div>
                  ) : empleados.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">{mensaje ?? 'Sin empleados disponibles'}</div>
                  ) : (
                    <div className="space-y-2">
                      {empleados.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => handleSeleccionarEmpleado(e.id)}
                          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                        >
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm shrink-0">
                            {e.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{e.nombre}</p>
                            <p className="text-xs text-gray-400">{e.correo}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Slots */}
              {step === 'slots' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => setStep('empleado')} className="text-sm text-blue-600 hover:underline">← Cambiar</button>
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">{servicioSeleccionado?.nombre}</span>
                      {' · '}{empleadoSeleccionado?.nombre}
                      {' · '}{formatDate(fecha)}
                    </span>
                  </div>

                  {loadingSlots ? (
                    <div className="py-8 text-center text-sm text-gray-400">Cargando horarios…</div>
                  ) : slots.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                      {mensaje ?? 'El empleado no trabaja ese día'}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Duración: {duracion} min</span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Disponible
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Ocupado
                        </span>
                      </div>
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
                      )}
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.hora}
                            disabled={!slot.disponible}
                            onClick={() => slot.disponible && selectSlot(slot.hora)}
                            className={`py-3 rounded-lg border-2 text-sm font-semibold transition-colors ${
                              slot.disponible
                                ? 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-500 hover:bg-blue-100 cursor-pointer'
                                : 'border-red-100 bg-red-50 text-red-400 cursor-not-allowed'
                            }`}
                          >
                            {slot.hora}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 4: Confirmar */}
              {step === 'confirm' && (
                <div className="space-y-5">
                  <button onClick={() => setStep('slots')} className="text-sm text-blue-600 hover:underline">← Volver</button>

                  <div className="bg-blue-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Servicio</span>
                      <span className="font-medium text-gray-900">{servicioSeleccionado?.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Empleado</span>
                      <span className="font-medium text-gray-900">{empleadoSeleccionado?.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha</span>
                      <span className="font-medium text-gray-900">{formatDate(fecha)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Horario</span>
                      <span className="font-medium text-gray-900">{slotSeleccionado} ({duracion} min)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Precio</span>
                      <span className="font-medium text-gray-900">${Number(servicioSeleccionado?.precio ?? 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea rows={2} value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Alguna nota adicional…"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
                  )}

                  <button onClick={handleConfirmar} disabled={submitting}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors">
                    {submitting ? 'Confirmando…' : 'Confirmar reserva'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
