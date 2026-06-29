import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  getHorarios, createHorario, updateHorario, deleteHorario,
  type Horario, type HorarioPayload,
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
  return (err as any)?.response?.data?.message || 'Error al procesar la solicitud'
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 52, padding: '0 18px',
  background: '#0e0c08', border: '1px solid #2a2419',
  color: '#f3efe7', fontFamily: 'Mulish', fontSize: 14,
  transition: 'border-color .2s', outline: 'none',
}
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none' }

function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={inputStyle}
    onFocus={e => (e.target.style.borderColor = '#d4a53c')}
    onBlur={e => (e.target.style.borderColor = '#2a2419')} />
}
function DarkSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={selectStyle}
    onFocus={e => (e.target.style.borderColor = '#d4a53c')}
    onBlur={e => (e.target.style.borderColor = '#2a2419')} />
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.12em', color: '#857e71', marginBottom: 10, textTransform: 'uppercase' }}>{children}</label>
}

export default function HorariosPage() {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'admin'

  const [empleados, setEmpleados]               = useState<Empleado[]>([])
  const [selectedEmpleado, setSelectedEmpleado] = useState<number | null>(null)
  const [horarios, setHorarios]                 = useState<Horario[]>([])
  const [loadingHorarios, setLoadingHorarios]   = useState(false)
  const [error, setError]                       = useState<string | null>(null)

  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<Horario | null>(null)
  const [form, setForm]             = useState<HorarioPayload>(emptyForm(0))
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState<Horario | null>(null)
  const [deleting, setDeleting]           = useState(false)

  useEffect(() => {
    if (!isAdmin && user?.pk_usuario) {
      setSelectedEmpleado(user.pk_usuario)
      return
    }
    getEmpleados(1, 100).then(res => {
      setEmpleados(res.data)
      if (res.data.length > 0) setSelectedEmpleado(res.data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedEmpleado) return
    setLoadingHorarios(true); setError(null)
    getHorarios(1, 50, selectedEmpleado)
      .then(res => setHorarios(res.data))
      .catch(() => setError('No se pudieron cargar los horarios'))
      .finally(() => setLoadingHorarios(false))
  }, [selectedEmpleado])

  function openCreate() {
    if (!selectedEmpleado) return
    setEditing(null); setForm(emptyForm(selectedEmpleado)); setFormError(null); setShowForm(true)
  }
  function openEdit(h: Horario) {
    setEditing(h)
    setForm({ dia_semana: h.dia_semana, hora_inicio: h.hora_inicio.slice(0, 5), hora_fin: h.hora_fin.slice(0, 5), disponible: h.disponible, usuario_id: h.usuario_id ?? selectedEmpleado ?? 0 })
    setFormError(null); setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditing(null) }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setFormError(null)
    if (form.hora_fin <= form.hora_inicio) { setFormError('La hora de fin debe ser posterior a la hora de inicio'); return }
    setSubmitting(true)
    try {
      if (editing) { const u = await updateHorario(editing.id, form); setHorarios(p => p.map(h => h.id === u.id ? u : h)) }
      else { const c = await createHorario(form); setHorarios(p => [...p, c]) }
      closeForm()
    } catch (err) { setFormError(extractError(err)) }
    finally { setSubmitting(false) }
  }

  async function handleDelete() {
    if (!confirmDelete) return; setDeleting(true)
    try { await deleteHorario(confirmDelete.id); setHorarios(p => p.filter(h => h.id !== confirmDelete.id)); setConfirmDelete(null) }
    catch { setConfirmDelete(null) }
    finally { setDeleting(false) }
  }

  const empleadoActual = empleados.find(e => e.id === selectedEmpleado)

  return (
    <div style={{ padding: '48px 48px 60px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.4em', color: '#d4a53c', marginBottom: 10 }}>PANEL ADMIN</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 48, color: '#f5f1e8', margin: 0 }}>Horarios</h2>
          <p style={{ color: '#857e71', fontSize: 14, marginTop: 6 }}>
            {horarios.length} turno{horarios.length !== 1 ? 's' : ''} configurado{horarios.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && selectedEmpleado && (
          <button onClick={openCreate}
            style={{ background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', padding: '14px 24px', cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e6bb55')}
            onMouseLeave={e => (e.currentTarget.style.background = '#d4a53c')}
          >
            + NUEVO TURNO
          </button>
        )}
      </div>

      {/* Selector de empleado — solo admin */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#15110c', border: '1px solid rgba(255,255,255,0.05)', padding: '22px 28px' }}>
          <p style={{ fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.18em', color: '#857e71', marginBottom: 14, textTransform: 'uppercase' }}>Empleado</p>
          {empleados.length === 0 ? (
            <p style={{ color: '#4a4334', fontSize: 14 }}>No hay empleados registrados</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {empleados.map(e => (
                <button key={e.id} onClick={() => setSelectedEmpleado(e.id)}
                  style={{
                    padding: '8px 18px',
                    background: selectedEmpleado === e.id ? 'rgba(212,165,60,0.1)' : 'transparent',
                    border: selectedEmpleado === e.id ? '1px solid rgba(212,165,60,0.4)' : '1px solid #2a2419',
                    color: selectedEmpleado === e.id ? '#d4a53c' : '#857e71',
                    fontFamily: 'Mulish', fontWeight: 600, fontSize: 13,
                    cursor: 'pointer', transition: 'all .2s',
                  }}
                  onMouseEnter={e2 => { if (selectedEmpleado !== e.id) { e2.currentTarget.style.borderColor = 'rgba(212,165,60,0.2)'; e2.currentTarget.style.color = '#f3efe7' } }}
                  onMouseLeave={e2 => { if (selectedEmpleado !== e.id) { e2.currentTarget.style.borderColor = '#2a2419'; e2.currentTarget.style.color = '#857e71' } }}
                >
                  {e.nombre}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tabla de horarios */}
      {selectedEmpleado && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#15110c', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {error && <div style={{ padding: '14px 24px', fontSize: 14, color: '#f87171', background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>{error}</div>}
          {loadingHorarios ? (
            <div style={{ padding: '64px', textAlign: 'center', color: '#857e71', fontSize: 14 }}>Cargando…</div>
          ) : horarios.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', color: '#857e71', fontSize: 14 }}>
              {(isAdmin ? empleadoActual?.nombre : user?.nombre) ?? 'El empleado'} no tiene turnos configurados
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1a1510' }}>
                    {['DÍA', 'HORA INICIO', 'HORA FIN', 'ESTADO', ...(isAdmin ? ['ACCIONES'] : [])].map((h, i) => (
                      <th key={h} style={{ padding: '14px 24px', textAlign: i === 4 ? 'right' : 'left', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.15em', color: '#857e71' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horarios.map(h => (
                    <tr key={h.id} style={{ borderBottom: '1px solid #1a1510' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,165,60,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px 24px', color: '#f3efe7', fontWeight: 600 }}>{DIA_LABEL[h.dia_semana] ?? h.dia_semana}</td>
                      <td style={{ padding: '16px 24px', color: '#a7a092' }}>{h.hora_inicio.slice(0, 5)}</td>
                      <td style={{ padding: '16px 24px', color: '#a7a092' }}>{h.hora_fin.slice(0, 5)}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          background: h.disponible ? 'rgba(80,180,110,0.14)' : 'rgba(107,114,128,0.1)',
                          color: h.disponible ? '#6bd393' : '#9ca3af',
                          border: h.disponible ? '1px solid rgba(80,180,110,0.4)' : '1px solid rgba(107,114,128,0.3)',
                          fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.04em', padding: '3px 10px',
                        }}>
                          {h.disponible ? 'Disponible' : 'No disponible'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button onClick={() => openEdit(h)}
                            style={{ color: '#d4a53c', background: 'none', border: 'none', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginRight: 16 }}>
                            Editar
                          </button>
                          <button onClick={() => setConfirmDelete(h)}
                            style={{ color: '#f87171', background: 'none', border: 'none', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                            Eliminar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {showForm && (
        <Modal title={editing ? 'Editar turno' : 'Nuevo turno'} onClose={closeForm}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <FieldLabel>Día de la semana</FieldLabel>
              <DarkSelect value={form.dia_semana} onChange={e => setForm(f => ({ ...f, dia_semana: e.target.value }))}>
                {DIAS.map(d => <option key={d} value={d}>{DIA_LABEL[d]}</option>)}
              </DarkSelect>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><FieldLabel>Hora inicio</FieldLabel><DarkInput type="time" required value={form.hora_inicio} onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))} /></div>
              <div><FieldLabel>Hora fin</FieldLabel><DarkInput type="time" required value={form.hora_fin} onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))} /></div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.disponible} onChange={e => setForm(f => ({ ...f, disponible: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#d4a53c' }} />
              <span style={{ color: '#a7a092', fontSize: 14, fontFamily: 'Mulish' }}>Disponible para reservas</span>
            </label>
            {formError && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 14 }}>{formError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
              <button type="button" onClick={closeForm} style={{ padding: '14px 28px', background: 'transparent', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={submitting}
                style={{ padding: '14px 28px', background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Guardando…' : editing ? 'GUARDAR CAMBIOS' : 'CREAR TURNO'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Eliminar turno" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: '#a7a092', fontSize: 14, marginBottom: 24 }}>
            ¿Eliminar el turno del <span style={{ color: '#f3efe7', fontWeight: 600 }}>{DIA_LABEL[confirmDelete.dia_semana] ?? confirmDelete.dia_semana}</span>{' '}
            de {confirmDelete.hora_inicio.slice(0, 5)} a {confirmDelete.hora_fin.slice(0, 5)}?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ padding: '14px 28px', background: 'transparent', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleDelete} disabled={deleting}
              style={{ padding: '14px 28px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontFamily: 'Mulish', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: deleting ? 0.6 : 1 }}>
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
