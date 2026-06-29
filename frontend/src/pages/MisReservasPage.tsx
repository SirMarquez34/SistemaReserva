import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdArrowBack, MdCheckCircle,
  MdCalendarToday, MdAccessTime, MdDesignServices, MdChevronRight, MdSchedule,
} from 'react-icons/md'
import { getMisReservas, getSlotsDisponibles, createMiReserva } from '../api/clienteAuth'
import DatePicker from '../components/DatePicker'
import { getEmpleadosDisponibles, type Empleado } from '../api/empleados'
import { getServices, type Service } from '../api/services'
import { useAuth } from '../context/AuthContext'
import type { Reservation } from '../api/reservations'

const ESTADO_BADGE: Record<string, React.CSSProperties> = {
  pendiente:  { background: 'rgba(234,179,8,0.12)',  color: '#fbbf24', border: '1px solid rgba(234,179,8,0.3)' },
  confirmada: { background: 'rgba(80,180,110,0.14)', color: '#6bd393', border: '1px solid rgba(80,180,110,0.4)' },
  cancelada:  { background: 'rgba(239,68,68,0.1)',   color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
  completada: { background: 'rgba(59,130,246,0.1)',  color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' },
  no_asistio: { background: 'rgba(107,114,128,0.1)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.3)' },
}
const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente', confirmada: 'Confirmada', cancelada: 'Cancelada',
  completada: 'Completada', no_asistio: 'No asistió',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
function getDayNum(iso: string) { return new Date(iso).getDate() }
function getMonthName(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()
}

type BookingStep = 'date' | 'empleado' | 'slots' | 'confirm'
const STEPS: BookingStep[] = ['date', 'empleado', 'slots', 'confirm']
const STEP_LABELS: Record<BookingStep, string> = {
  date: 'Selecciona una fecha', empleado: 'Elige tu especialista',
  slots: 'Selecciona el horario', confirm: 'Confirma tu cita',
}

const SpartaLogoSvg = () => (
  <svg width="30" height="30" viewBox="0 0 64 64" fill="#d4a53c">
    <path d="M16 12c10-8 28-8 36 0-6-3-12-3-17-1 5 1 9 4 11 8-6-5-18-6-26-2-2-2-3-4-4-5z" />
    <path d="M20 16c-7 6-9 18-4 28 3 6 8 9 14 10v-7c-5-2-8-7-8-13 0-3 1-6 3-8h19c3 0 4-3 2-5-4-5-16-8-26-5z" />
    <path d="M30 26h6v24c-2 1-4 1-6 0z" />
    <path d="M33 41l13 13M46 41L33 54" stroke="#d4a53c" strokeWidth="2.4" strokeLinecap="round" fill="none" />
  </svg>
)

const slideVariants = {
  enter: { opacity: 0, x: 24 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 },
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px',
  background: '#0e0c08', border: '1px solid #2a2419',
  color: '#f3efe7', fontFamily: 'Mulish', fontSize: 14,
  transition: 'border-color .2s', outline: 'none',
}

export default function MisReservasPage() {
  const { cliente, logout, user } = useAuth()

  const [services, setServices]               = useState<Service[]>([])
  const [reservations, setReservations]       = useState<Reservation[]>([])
  const [loadingReservas, setLoadingReservas] = useState(true)

  const [showBooking, setShowBooking]           = useState(false)
  const [selectedService, setSelectedService]   = useState<Service | null>(null)
  const [step, setStep]                         = useState<BookingStep>('date')
  const [fecha, setFecha]                       = useState('')
  const [empleados, setEmpleados]               = useState<Empleado[]>([])
  const [loadingEmpleados, setLoadingEmpleados] = useState(false)
  const [empleadoId, setEmpleadoId]             = useState(0)
  const [slots, setSlots]                       = useState<{ hora: string; disponible: boolean }[]>([])
  const [duracion, setDuracion]                 = useState(0)
  const [slotSeleccionado, setSlotSeleccionado] = useState('')
  const [loadingSlots, setLoadingSlots]         = useState(false)
  const [observaciones, setObservaciones]       = useState('')
  const [submitting, setSubmitting]             = useState(false)
  const [mensaje, setMensaje]                   = useState<string | null>(null)
  const [error, setError]                       = useState<string | null>(null)

  useEffect(() => {
    getServices(1, 100).then(r => setServices(r.data.filter((s: Service) => s.activo)))
    loadReservas()
  }, [])

  async function loadReservas() {
    setLoadingReservas(true)
    try { const res = await getMisReservas(1, 50); setReservations(res.data) }
    finally { setLoadingReservas(false) }
  }

  function openBooking(service: Service) {
    setSelectedService(service)
    setStep('date'); setFecha(''); setEmpleados([]); setEmpleadoId(0)
    setSlots([]); setSlotSeleccionado(''); setObservaciones('')
    setMensaje(null); setError(null)
    setShowBooking(true)
  }

  async function handleBuscarEmpleados() {
    if (!fecha) return
    setLoadingEmpleados(true); setMensaje(null)
    try {
      const lista = await getEmpleadosDisponibles(fecha)
      setEmpleados(lista)
      if (lista.length === 0) setMensaje('No hay especialistas disponibles para esa fecha')
      setStep('empleado')
    } catch { setMensaje('Error al cargar los especialistas') }
    finally { setLoadingEmpleados(false) }
  }

  async function handleSeleccionarEmpleado(id: number) {
    setEmpleadoId(id); setLoadingSlots(true); setMensaje(null)
    try {
      const res = await getSlotsDisponibles(selectedService!.id, fecha, id)
      setSlots(res.slots); setDuracion(res.duracion)
      if (res.mensaje) setMensaje(res.mensaje)
      setStep('slots')
    } catch { setMensaje('Error al cargar los horarios') }
    finally { setLoadingSlots(false) }
  }

  function selectSlot(hora: string) { setSlotSeleccionado(hora); setStep('confirm') }

  async function handleConfirmar() {
    setError(null); setSubmitting(true)
    try {
      await createMiReserva({ servicio_id: selectedService!.id, empleado_id: empleadoId, fecha, hora_inicio: slotSeleccionado, observaciones: observaciones || undefined })
      setShowBooking(false)
      await loadReservas()
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message
      setError(msg || 'Error al crear la reserva')
      setStep('slots')
    } finally { setSubmitting(false) }
  }

  const empleadoSeleccionado = empleados.find(e => e.id === empleadoId)
  const stepIndex = STEPS.indexOf(step)

  return (
    <div style={{ background: '#0b0907', color: '#f3efe7', minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <header style={{
        background: 'rgba(14,11,7,.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212,165,60,.1)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SpartaLogoSvg />
            <div>
              <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 13, letterSpacing: '.22em', color: '#e9d9a8', margin: 0 }}>SPARTA</p>
              <p style={{ fontFamily: 'Mulish', fontWeight: 600, fontSize: 8, letterSpacing: '.44em', color: '#8c8475', margin: 0 }}>BARBERSHOP</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#f3efe7', fontFamily: 'Mulish', fontWeight: 600, fontSize: 14, margin: 0 }}>{cliente?.nombre}</p>
              <p style={{ color: '#857e71', fontSize: 11, margin: 0 }}>{cliente?.email}</p>
            </div>
            <div style={{ width: 40, height: 40, background: 'rgba(212,165,60,.1)', border: '1px solid rgba(212,165,60,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 20, color: '#d4a53c' }}>
                {cliente?.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
            <button onClick={logout}
              style={{ background: 'none', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.1em', cursor: 'pointer', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
              onMouseLeave={e => (e.currentTarget.style.color = '#857e71')}>
              SALIR
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '52px 32px 80px', display: 'flex', flexDirection: 'column', gap: 60 }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.4em', color: '#d4a53c', marginBottom: 12 }}>MI PANEL</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 50, color: '#f5f1e8', margin: 0, lineHeight: 1 }}>
                Mis Turnos
              </h1>
              <p style={{ color: '#857e71', fontSize: 14, marginTop: 8 }}>Gestiona y agenda tus citas</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {user?.rol === 'admin' && (
                <Link to="/dashboard"
                  style={{ padding: '12px 20px', border: '1px solid #2a2419', color: '#857e71', fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.12em', textDecoration: 'none', transition: 'all .2s' }}
                  onMouseEnter={e => { (e.target as HTMLAnchorElement).style.borderColor = 'rgba(212,165,60,.3)'; (e.target as HTMLAnchorElement).style.color = '#d4a53c' }}
                  onMouseLeave={e => { (e.target as HTMLAnchorElement).style.borderColor = '#2a2419'; (e.target as HTMLAnchorElement).style.color = '#857e71' }}>
                  PANEL ADMIN
                </Link>
              )}
              <button onClick={() => services.length > 0 && openBooking(services[0])}
                style={{ padding: '12px 24px', background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 11, letterSpacing: '.12em', cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e6bb55')}
                onMouseLeave={e => (e.currentTarget.style.background = '#d4a53c')}>
                + RESERVAR NUEVO TURNO
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Servicios ── */}
        <section>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 30, color: '#f5f1e8', margin: '0 0 6px' }}>Nuestros servicios</h2>
            <p style={{ color: '#857e71', fontSize: 13 }}>Elige un servicio y agenda tu cita al instante</p>
          </motion.div>

          {services.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[1, 2, 3].map(i => <div key={i} style={{ height: 200, background: '#15110c', border: '1px solid #2a2419' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {services.map((service, idx) => (
                <motion.div key={service.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 * idx }}
                  style={{ background: '#15110c', border: '1px solid #2a2419', transition: 'border-color .25s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,165,60,.3)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2419')}
                >
                  {/* Service header strip */}
                  <div style={{ borderBottom: '1px solid #2a2419', padding: '20px 20px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 19, color: '#f3efe7', margin: '0 0 4px' }}>{service.nombre}</h3>
                      <p style={{ color: '#857e71', fontSize: 12, lineHeight: 1.5 }}>{service.duracion_minutos} min · ${Number(service.precio).toFixed(2)}</p>
                    </div>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 20, color: '#d4a53c', flexShrink: 0 }}>
                      ${Number(service.precio).toFixed(2)}
                    </span>
                  </div>
                  {/* Description + button */}
                  <div style={{ padding: '16px 20px 20px' }}>
                    <p style={{ color: '#857e71', fontSize: 12, lineHeight: 1.6, marginBottom: 16, minHeight: 38 }}>
                      {service.descripcion}
                    </p>
                    <button onClick={() => openBooking(service)}
                      style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(212,165,60,.4)', color: '#d4a53c', fontFamily: 'Mulish', fontWeight: 800, fontSize: 11, letterSpacing: '.14em', cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#d4a53c'; e.currentTarget.style.color = '#161009' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d4a53c' }}>
                      RESERVAR <MdChevronRight style={{ fontSize: 16 }} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── Mis reservas ── */}
        <section>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 30, color: '#f5f1e8', margin: '0 0 6px' }}>Mis reservas</h2>
              <p style={{ color: '#857e71', fontSize: 13 }}>{reservations.length} reservas registradas</p>
            </div>
          </motion.div>

          {loadingReservas ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2].map(i => <div key={i} style={{ height: 84, background: '#15110c', border: '1px solid #2a2419' }} />)}
            </div>
          ) : reservations.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: '#15110c', border: '1px solid #2a2419', padding: '64px', textAlign: 'center' }}>
              <p style={{ color: '#857e71', fontSize: 14, marginBottom: 6 }}>Aún no tienes reservas.</p>
              <p style={{ color: '#4a4334', fontSize: 12 }}>¡Elige un servicio arriba y agenda tu primera cita!</p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reservations.map((r, idx) => (
                <motion.div key={r.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.04 * idx }}
                  style={{ background: '#15110c', borderLeft: '3px solid #d4a53c', border: '1px solid #2a2419', borderLeftWidth: 3, borderLeftColor: '#d4a53c', display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden' }}>

                  {/* Date column */}
                  <div style={{ width: 72, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px 0', borderRight: '1px solid #2a2419' }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 28, color: '#d4a53c', margin: 0, lineHeight: 1 }}>{getDayNum(r.fecha)}</p>
                    <p style={{ fontFamily: 'Mulish', fontWeight: 700, fontSize: 10, letterSpacing: '.12em', color: '#857e71', margin: '3px 0 0' }}>{getMonthName(r.fecha)}</p>
                  </div>

                  {/* Main info */}
                  <div style={{ flex: 1, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h4 style={{ fontFamily: 'Mulish', fontWeight: 700, fontSize: 15, color: '#f3efe7', margin: 0 }}>{r.servicio_nombre}</h4>
                        <span style={{ ...(ESTADO_BADGE[r.estado] ?? ESTADO_BADGE.no_asistio), fontFamily: 'Mulish', fontWeight: 700, fontSize: 10, letterSpacing: '.06em', padding: '2px 8px' }}>
                          {ESTADO_LABEL[r.estado] ?? r.estado}
                        </span>
                      </div>
                      <p style={{ color: '#857e71', fontSize: 12, margin: 0 }}>
                        {(r as any).empleado_nombre ?? 'Especialista'} · {r.hora_inicio.slice(0, 5)} hs
                      </p>
                    </div>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 20, color: '#d4a53c', flexShrink: 0 }}>
                      ${Number((r as any).precio ?? 0).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Modal de reserva ── */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(6px)', padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setShowBooking(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }} transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ background: '#14110c', border: '1px solid rgba(212,165,60,.14)', width: '100%', maxWidth: 460, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              {/* Gold accent top */}
              <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #d4a53c, transparent)' }} />

              {/* Modal header */}
              <div style={{ padding: '22px 28px', borderBottom: '1px solid #2a2419', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 22, color: '#f5f1e8', margin: '0 0 2px' }}>
                      {selectedService?.nombre}
                    </h3>
                    <p style={{ color: '#857e71', fontSize: 12, margin: 0 }}>{STEP_LABELS[step]}</p>
                  </div>
                  <button onClick={() => setShowBooking(false)}
                    style={{ background: 'none', border: 'none', color: '#857e71', fontSize: 24, cursor: 'pointer', lineHeight: 1, marginTop: -2 }}>×</button>
                </div>
                {/* Progress */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {STEPS.map((s, i) => (
                    <div key={s} style={{ flex: 1, height: 3, background: i <= stepIndex ? '#d4a53c' : '#2a2419', transition: 'background .3s' }} />
                  ))}
                </div>
              </div>

              <div style={{ overflowY: 'auto', flex: 1, padding: '22px 28px' }}>
                <AnimatePresence mode="wait">

                  {/* ── PASO 1: Fecha ── */}
                  {step === 'date' && (
                    <motion.div key="date" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div style={{ background: 'rgba(212,165,60,.06)', border: '1px solid rgba(212,165,60,.14)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 38, height: 38, background: 'rgba(212,165,60,.1)', border: '1px solid rgba(212,165,60,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <MdDesignServices style={{ color: '#d4a53c', fontSize: 18 }} />
                        </div>
                        <div>
                          <p style={{ color: '#f3efe7', fontWeight: 600, fontSize: 14, margin: '0 0 2px', fontFamily: 'Mulish' }}>{selectedService?.nombre}</p>
                          <p style={{ color: '#857e71', fontSize: 12, margin: 0 }}>{selectedService?.duracion_minutos} min · ${Number(selectedService?.precio ?? 0).toFixed(2)}</p>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.12em', color: '#857e71', marginBottom: 10, textTransform: 'uppercase' }}>
                          Fecha de la cita
                        </label>
                        <DatePicker
                          value={fecha}
                          onChange={setFecha}
                          minDate={new Date().toISOString().slice(0, 10)}
                        />
                      </div>

                      {mensaje && <p style={{ background: '#15110c', border: '1px solid #2a2419', padding: '12px 16px', color: '#857e71', fontSize: 13 }}>{mensaje}</p>}

                      <button onClick={handleBuscarEmpleados} disabled={!fecha || loadingEmpleados}
                        style={{ padding: '14px', background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', cursor: 'pointer', opacity: (!fecha || loadingEmpleados) ? 0.4 : 1, transition: 'all .2s' }}>
                        {loadingEmpleados ? 'Buscando especialistas…' : 'VER ESPECIALISTAS DISPONIBLES →'}
                      </button>
                    </motion.div>
                  )}

                  {/* ── PASO 2: Especialista ── */}
                  {step === 'empleado' && (
                    <motion.div key="empleado" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <button onClick={() => setStep('date')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                        <MdArrowBack /> Cambiar fecha
                      </button>
                      <p style={{ fontSize: 12, color: '#857e71' }}>
                        <span style={{ color: '#f3efe7', fontWeight: 600 }}>{formatDate(fecha)}</span> — Especialistas disponibles
                      </p>

                      {loadingEmpleados ? (
                        <div style={{ padding: '48px 0', textAlign: 'center', color: '#857e71', fontSize: 14 }}>Buscando especialistas…</div>
                      ) : empleados.length === 0 ? (
                        <div style={{ padding: '48px 0', textAlign: 'center' }}>
                          <p style={{ color: '#857e71', fontSize: 14, marginBottom: 12 }}>{mensaje ?? 'Sin especialistas disponibles'}</p>
                          <button onClick={() => setStep('date')} style={{ background: 'none', border: 'none', color: '#d4a53c', fontSize: 12, cursor: 'pointer' }}>Cambiar fecha</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {empleados.map(e => (
                            <button key={e.id} onClick={() => handleSeleccionarEmpleado(e.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'transparent', border: '1px solid #2a2419', cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}
                              onMouseEnter={ev => { ev.currentTarget.style.borderColor = 'rgba(212,165,60,.4)'; ev.currentTarget.style.background = 'rgba(212,165,60,.04)' }}
                              onMouseLeave={ev => { ev.currentTarget.style.borderColor = '#2a2419'; ev.currentTarget.style.background = 'transparent' }}>
                              <div style={{ width: 40, height: 40, background: 'rgba(212,165,60,.1)', border: '1px solid rgba(212,165,60,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 20, color: '#d4a53c' }}>{e.nombre.charAt(0).toUpperCase()}</span>
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ color: '#f3efe7', fontWeight: 600, fontSize: 14, margin: 0, fontFamily: 'Mulish' }}>{e.nombre}</p>
                                <p style={{ color: '#857e71', fontSize: 12, margin: 0 }}>{e.correo}</p>
                              </div>
                              <MdChevronRight style={{ color: '#4a4334', fontSize: 20, flexShrink: 0 }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ── PASO 3: Horarios ── */}
                  {step === 'slots' && (
                    <motion.div key="slots" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <button onClick={() => setStep('empleado')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                        <MdArrowBack /> Cambiar especialista
                      </button>
                      <p style={{ fontSize: 12, color: '#857e71' }}>
                        <span style={{ color: '#f3efe7', fontWeight: 600 }}>{empleadoSeleccionado?.nombre}</span> · {formatDate(fecha)}
                      </p>

                      {loadingSlots ? (
                        <div style={{ padding: '48px 0', textAlign: 'center', color: '#857e71', fontSize: 14 }}>Cargando horarios…</div>
                      ) : slots.length === 0 ? (
                        <div style={{ padding: '48px 0', textAlign: 'center', color: '#857e71', fontSize: 14 }}>
                          {mensaje ?? 'El especialista no trabaja ese día'}
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 12 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#857e71' }}>
                              <MdAccessTime /> {duracion} min c/turno
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6bd393' }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6bd393', display: 'inline-block' }} /> Disponible
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171' }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171', display: 'inline-block' }} /> Ocupado
                            </span>
                          </div>

                          {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>{error}</div>}

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            {slots.map(slot => (
                              <button key={slot.hora} disabled={!slot.disponible} onClick={() => slot.disponible && selectSlot(slot.hora)}
                                style={{
                                  padding: '12px 8px',
                                  background: slot.disponible ? 'rgba(80,180,110,0.1)' : 'rgba(239,68,68,0.08)',
                                  border: slot.disponible ? '1px solid rgba(80,180,110,0.4)' : '1px solid rgba(239,68,68,0.2)',
                                  color: slot.disponible ? '#6bd393' : 'rgba(248,113,113,.4)',
                                  fontFamily: 'Mulish', fontWeight: 700, fontSize: 13,
                                  cursor: slot.disponible ? 'pointer' : 'not-allowed', transition: 'all .15s',
                                }}
                                onMouseEnter={e => { if (slot.disponible) { e.currentTarget.style.background = 'rgba(80,180,110,0.2)'; e.currentTarget.style.borderColor = 'rgba(80,180,110,.7)' } }}
                                onMouseLeave={e => { if (slot.disponible) { e.currentTarget.style.background = 'rgba(80,180,110,0.1)'; e.currentTarget.style.borderColor = 'rgba(80,180,110,.4)' } }}>
                                {slot.hora}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* ── PASO 4: Confirmar ── */}
                  {step === 'confirm' && (
                    <motion.div key="confirm" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <button onClick={() => setStep('slots')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                        <MdArrowBack /> Cambiar horario
                      </button>

                      <div style={{ background: 'rgba(212,165,60,.05)', border: '1px solid rgba(212,165,60,.18)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <p style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.3em', color: '#d4a53c', margin: 0 }}>RESUMEN DE TU CITA</p>
                        {[
                          { label: 'Servicio',     value: selectedService?.nombre ?? '—',                        Icon: MdDesignServices },
                          { label: 'Especialista', value: empleadoSeleccionado?.nombre ?? '—',                   Icon: MdCheckCircle },
                          { label: 'Fecha',        value: formatDate(fecha),                                     Icon: MdCalendarToday },
                          { label: 'Horario',      value: `${slotSeleccionado} · ${duracion} min`,               Icon: MdAccessTime },
                          { label: 'Precio',       value: `$${Number(selectedService?.precio ?? 0).toFixed(2)}`, Icon: MdSchedule },
                        ].map(({ label, value, Icon }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#857e71' }}>
                              <Icon style={{ color: '#d4a53c', fontSize: 15, flexShrink: 0 }} />
                              {label}
                            </div>
                            <span style={{ color: '#f3efe7', fontWeight: 600, fontFamily: 'Mulish', textAlign: 'right', maxWidth: 200 }}>{value}</span>
                          </div>
                        ))}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.12em', color: '#857e71', marginBottom: 10, textTransform: 'uppercase' }}>
                          Observaciones <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
                        </label>
                        <textarea rows={2} value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Alguna nota adicional…"
                          style={{ ...inputStyle, height: 'auto', padding: '12px 16px', resize: 'none' }}
                          onFocus={e => (e.target.style.borderColor = '#d4a53c')}
                          onBlur={e => (e.target.style.borderColor = '#2a2419')} />
                      </div>

                      {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>{error}</div>}

                      <button onClick={handleConfirmar} disabled={submitting}
                        style={{ padding: '15px', background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', cursor: 'pointer', opacity: submitting ? 0.6 : 1, transition: 'all .2s' }}
                        onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#e6bb55' }}
                        onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#d4a53c' }}>
                        {submitting ? 'Confirmando…' : 'CONFIRMAR RESERVA'}
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
