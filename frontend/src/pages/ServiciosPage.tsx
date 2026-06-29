import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { getServices, createService, updateService, deleteService, type Service, type ServicePayload } from '../api/services'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'

const EMPTY: ServicePayload = { nombre: '', descripcion: '', duracion_minutos: 30, precio: 0, activo: true }

const inputStyle: React.CSSProperties = {
  width: '100%', height: 52, padding: '0 18px',
  background: '#0e0c08', border: '1px solid #2a2419',
  color: '#f3efe7', fontFamily: 'Mulish', fontSize: 14,
  transition: 'border-color .2s', outline: 'none',
}
const textareaStyle: React.CSSProperties = {
  width: '100%', padding: '14px 18px',
  background: '#0e0c08', border: '1px solid #2a2419',
  color: '#f3efe7', fontFamily: 'Mulish', fontSize: 14,
  transition: 'border-color .2s', outline: 'none', resize: 'none',
}

function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props}
    style={inputStyle}
    onFocus={e => (e.target.style.borderColor = '#d4a53c')}
    onBlur={e => (e.target.style.borderColor = '#2a2419')} />
}
function DarkTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props}
    style={textareaStyle}
    onFocus={e => (e.target.style.borderColor = '#d4a53c')}
    onBlur={e => (e.target.style.borderColor = '#2a2419')} />
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.12em', color: '#857e71', marginBottom: 10, textTransform: 'uppercase' }}>{children}</label>
}

const ESTADO_BADGE: Record<string, React.CSSProperties> = {
  activo:   { background: 'rgba(80,180,110,0.14)', border: '1px solid rgba(80,180,110,0.4)', color: '#6bd393' },
  inactivo: { background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.3)', color: '#9ca3af' },
}

export default function ServiciosPage() {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'admin'

  const [services, setServices]     = useState<Service[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<Service | null>(null)
  const [form, setForm]             = useState<ServicePayload>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState<Service | null>(null)
  const [deleting, setDeleting]           = useState(false)

  async function loadPage(page: number) {
    setLoading(true); setError(null)
    try { const r = await getServices(page, 10); setServices(r.data); setPagination(r.pagination) }
    catch { setError('No se pudieron cargar los servicios') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadPage(1) }, [])

  function openCreate() { setEditing(null); setForm(EMPTY); setFormError(null); setShowForm(true) }
  function openEdit(s: Service) {
    setEditing(s)
    setForm({ nombre: s.nombre, descripcion: s.descripcion, duracion_minutos: s.duracion_minutos, precio: s.precio, activo: s.activo })
    setFormError(null); setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditing(null) }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setFormError(null); setSubmitting(true)
    try {
      if (editing) { const u = await updateService(editing.id, form); setServices(p => p.map(s => s.id === u.id ? u : s)) }
      else { await createService(form); await loadPage(1) }
      closeForm()
    } catch (err: unknown) {
      setFormError((err as any)?.response?.data?.message || 'Error al guardar el servicio')
    } finally { setSubmitting(false) }
  }

  async function handleDelete() {
    if (!confirmDelete) return; setDeleting(true)
    try { await deleteService(confirmDelete.id); setConfirmDelete(null); await loadPage(pagination.page) }
    catch { setConfirmDelete(null) }
    finally { setDeleting(false) }
  }

  return (
    <div style={{ padding: '48px 48px 60px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.4em', color: '#d4a53c', marginBottom: 10 }}>PANEL ADMIN</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 48, color: '#f5f1e8', margin: 0 }}>Servicios</h2>
          <p style={{ color: '#857e71', fontSize: 14, marginTop: 6 }}>{pagination.total} servicios registrados</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            style={{ background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', padding: '14px 24px', cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8 }}
            onMouseEnter={e => ((e.target as HTMLButtonElement).closest('button')!.style.background = '#e6bb55')}
            onMouseLeave={e => ((e.target as HTMLButtonElement).closest('button')!.style.background = '#d4a53c')}
          >
            + NUEVO SERVICIO
          </button>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#15110c', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        {error && <div style={{ padding: '14px 24px', fontSize: 14, color: '#f87171', background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>{error}</div>}
        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center', color: '#857e71', fontSize: 14 }}>Cargando…</div>
        ) : services.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center', color: '#857e71', fontSize: 14 }}>No hay servicios registrados</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1a1510' }}>
                  {['NOMBRE', 'DESCRIPCIÓN', 'DURACIÓN', 'PRECIO', 'ESTADO', ...(isAdmin ? ['ACCIONES'] : [])].map((h, i) => (
                    <th key={h} style={{ padding: '14px 24px', textAlign: i === 5 ? 'right' : 'left', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.15em', color: '#857e71' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #1a1510' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,165,60,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '16px 24px', color: '#f3efe7', fontWeight: 600 }}>{s.nombre}</td>
                    <td style={{ padding: '16px 24px', color: '#a7a092', maxWidth: 280 }}>
                      <span style={{ display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{s.descripcion}</span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#a7a092' }}>{s.duracion_minutos} min</td>
                    <td style={{ padding: '16px 24px', color: '#d4a53c', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 16 }}>
                      ${Number(s.precio).toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ ...(s.activo ? ESTADO_BADGE.activo : ESTADO_BADGE.inactivo), fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.04em', padding: '3px 10px' }}>
                        {s.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button onClick={() => openEdit(s)} style={{ color: '#d4a53c', background: 'none', border: 'none', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginRight: 16 }}>Editar</button>
                        <button onClick={() => setConfirmDelete(s)} style={{ color: '#f87171', background: 'none', border: 'none', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Eliminar</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#857e71', fontSize: 13 }}>
          <span>Página {pagination.page} de {pagination.totalPages}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button disabled={pagination.page <= 1} onClick={() => loadPage(pagination.page - 1)}
              style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #2a2419', color: '#857e71', fontFamily: 'Mulish', fontSize: 12, cursor: 'pointer', opacity: pagination.page <= 1 ? 0.3 : 1 }}>
              Anterior
            </button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => loadPage(pagination.page + 1)}
              style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #2a2419', color: '#857e71', fontFamily: 'Mulish', fontSize: 12, cursor: 'pointer', opacity: pagination.page >= pagination.totalPages ? 0.3 : 1 }}>
              Siguiente
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Editar servicio' : 'Nuevo servicio'} onClose={closeForm}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div><FieldLabel>Nombre</FieldLabel><DarkInput type="text" required placeholder="Ej. Corte de cabello" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></div>
            <div><FieldLabel>Descripción</FieldLabel><DarkTextarea required rows={3} placeholder="Descripción del servicio" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><FieldLabel>Duración (min)</FieldLabel><DarkInput type="number" required min={1} value={form.duracion_minutos} onChange={e => setForm(f => ({ ...f, duracion_minutos: Number(e.target.value) }))} /></div>
              <div><FieldLabel>Precio ($)</FieldLabel><DarkInput type="number" required min={0} step={0.01} value={form.precio} onChange={e => setForm(f => ({ ...f, precio: Number(e.target.value) }))} /></div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#d4a53c' }} />
              <span style={{ color: '#a7a092', fontSize: 14, fontFamily: 'Mulish' }}>Servicio activo</span>
            </label>
            {formError && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 14 }}>{formError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
              <button type="button" onClick={closeForm} style={{ padding: '14px 28px', background: 'transparent', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={submitting}
                style={{ padding: '14px 28px', background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Guardando…' : editing ? 'GUARDAR CAMBIOS' : 'CREAR SERVICIO'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Eliminar servicio" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: '#a7a092', fontSize: 14, marginBottom: 24 }}>
            ¿Eliminar <span style={{ color: '#f3efe7', fontWeight: 600 }}>{confirmDelete.nombre}</span>? Esta acción no se puede deshacer.
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
