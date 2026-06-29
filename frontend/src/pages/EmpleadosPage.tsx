import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado, type Empleado, type EmpleadoCreatePayload } from '../api/empleados'
import Modal from '../components/Modal'

interface CreateForm { nombre: string; correo: string; contrasena: string }
interface EditForm   { nombre: string; correo: string; contrasena: string }
const EMPTY_C: CreateForm = { nombre: '', correo: '', contrasena: '' }
const EMPTY_E: EditForm   = { nombre: '', correo: '', contrasena: '' }

function extractError(err: unknown): string {
  return (err as any)?.response?.data?.message || 'Error al procesar la solicitud'
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 52, padding: '0 18px',
  background: '#0e0c08', border: '1px solid #2a2419',
  color: '#f3efe7', fontFamily: 'Mulish', fontSize: 14,
  transition: 'border-color .2s', outline: 'none',
}

function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props}
    style={inputStyle}
    onFocus={e => (e.target.style.borderColor = '#d4a53c')}
    onBlur={e => (e.target.style.borderColor = '#2a2419')} />
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.12em', color: '#857e71', marginBottom: 10, textTransform: 'uppercase' }}>{children}</label>
}

export default function EmpleadosPage() {
  const [empleados, setEmpleados]   = useState<Empleado[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  const [showCreate, setShowCreate]   = useState(false)
  const [createForm, setCreateForm]   = useState<CreateForm>(EMPTY_C)
  const [creating, setCreating]       = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [editing, setEditing]     = useState<Empleado | null>(null)
  const [editForm, setEditForm]   = useState<EditForm>(EMPTY_E)
  const [saving, setSaving]       = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState<Empleado | null>(null)
  const [deleting, setDeleting]           = useState(false)

  async function loadPage(page: number) {
    setLoading(true); setError(null)
    try { const r = await getEmpleados(page, 10); setEmpleados(r.data); setPagination(r.pagination) }
    catch { setError('No se pudieron cargar los empleados') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadPage(1) }, [])

  function openCreate() { setCreateForm(EMPTY_C); setCreateError(null); setShowCreate(true) }
  function openEdit(e: Empleado) { setEditing(e); setEditForm({ nombre: e.nombre, correo: e.correo, contrasena: '' }); setEditError(null) }

  async function handleCreate(ev: FormEvent) {
    ev.preventDefault(); setCreateError(null); setCreating(true)
    try {
      const payload: EmpleadoCreatePayload = { nombre: createForm.nombre, correo: createForm.correo, contrasena: createForm.contrasena }
      await createEmpleado(payload); setShowCreate(false); await loadPage(1)
    } catch (err) { setCreateError(extractError(err)) }
    finally { setCreating(false) }
  }

  async function handleEdit(ev: FormEvent) {
    ev.preventDefault(); if (!editing) return; setEditError(null); setSaving(true)
    try {
      const payload: { nombre: string; correo: string; contrasena?: string } = { nombre: editForm.nombre, correo: editForm.correo }
      if (editForm.contrasena) payload.contrasena = editForm.contrasena
      const updated = await updateEmpleado(editing.id, payload)
      setEmpleados(p => p.map(e => e.id === updated.id ? updated : e))
      setEditing(null)
    } catch (err) { setEditError(extractError(err)) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirmDelete) return; setDeleting(true)
    try { await deleteEmpleado(confirmDelete.id); setConfirmDelete(null); await loadPage(pagination.page) }
    catch { setConfirmDelete(null) }
    finally { setDeleting(false) }
  }

  return (
    <div style={{ padding: '48px 48px 60px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.4em', color: '#d4a53c', marginBottom: 10 }}>PANEL ADMIN</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 48, color: '#f5f1e8', margin: 0 }}>Empleados</h2>
          <p style={{ color: '#857e71', fontSize: 14, marginTop: 6 }}>{pagination.total} empleados registrados</p>
        </div>
        <button
          onClick={openCreate}
          style={{ background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', padding: '14px 24px', cursor: 'pointer', transition: 'all .2s' }}
          onMouseEnter={e => ((e.currentTarget).style.background = '#e6bb55')}
          onMouseLeave={e => ((e.currentTarget).style.background = '#d4a53c')}
        >
          + AGREGAR EMPLEADO
        </button>
      </div>

      {error && <div style={{ padding: '14px 24px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: '#f87171', fontSize: 14 }}>{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 160, background: '#15110c', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : empleados.length === 0 ? (
        <div style={{ padding: '80px', textAlign: 'center', color: '#857e71', fontSize: 14, background: '#15110c', border: '1px solid rgba(255,255,255,0.05)' }}>
          No hay empleados registrados
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {empleados.map((e, idx) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * idx }}
              style={{ background: '#15110c', border: '1px solid rgba(255,255,255,0.05)', padding: '26px 24px' }}
            >
              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'linear-gradient(150deg, #2a2114, #15110c)',
                  border: '1px solid rgba(212,165,60,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 22, color: '#d4a53c' }}>
                    {e.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p style={{ fontFamily: 'Mulish', fontWeight: 700, fontSize: 16, color: '#f3efe7', margin: 0 }}>{e.nombre}</p>
                  <p style={{ fontFamily: 'Mulish', fontSize: 13, color: '#d4a53c', marginTop: 2 }}>{e.correo}</p>
                </div>
              </div>

              {/* Schedule placeholder */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#857e71" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                </svg>
                <span style={{ fontFamily: 'Mulish', fontSize: 13, color: '#857e71' }}>Empleado activo</span>
              </div>

              {/* Bottom row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ background: 'rgba(80,180,110,0.14)', border: '1px solid rgba(80,180,110,0.4)', color: '#6bd393', fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.04em', padding: '3px 10px' }}>
                  Activo
                </span>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button onClick={() => openEdit(e)} style={{ color: '#d4a53c', background: 'none', border: 'none', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => setConfirmDelete(e)} style={{ color: '#f87171', background: 'none', border: 'none', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Eliminar</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#857e71', fontSize: 13 }}>
          <span>Página {pagination.page} de {pagination.totalPages}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button disabled={pagination.page <= 1} onClick={() => loadPage(pagination.page - 1)}
              style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #2a2419', color: '#857e71', fontFamily: 'Mulish', fontSize: 12, cursor: 'pointer', opacity: pagination.page <= 1 ? 0.3 : 1 }}>Anterior</button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => loadPage(pagination.page + 1)}
              style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #2a2419', color: '#857e71', fontFamily: 'Mulish', fontSize: 12, cursor: 'pointer', opacity: pagination.page >= pagination.totalPages ? 0.3 : 1 }}>Siguiente</button>
          </div>
        </div>
      )}

      {/* Create */}
      {showCreate && (
        <Modal title="Nuevo empleado" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div><FieldLabel>Nombre</FieldLabel><DarkInput type="text" required placeholder="Nombre completo" value={createForm.nombre} onChange={e => setCreateForm(f => ({ ...f, nombre: e.target.value }))} /></div>
            <div><FieldLabel>Correo</FieldLabel><DarkInput type="email" required placeholder="correo@ejemplo.com" value={createForm.correo} onChange={e => setCreateForm(f => ({ ...f, correo: e.target.value }))} /></div>
            <div><FieldLabel>Contraseña inicial</FieldLabel><DarkInput type="password" required minLength={6} placeholder="Mínimo 6 caracteres" value={createForm.contrasena} onChange={e => setCreateForm(f => ({ ...f, contrasena: e.target.value }))} /></div>
            {createError && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 14 }}>{createError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
              <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '14px 28px', background: 'transparent', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={creating} style={{ padding: '14px 28px', background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', cursor: 'pointer', opacity: creating ? 0.6 : 1 }}>
                {creating ? 'Creando…' : 'CREAR EMPLEADO'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit */}
      {editing && (
        <Modal title="Editar empleado" onClose={() => setEditing(null)}>
          <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div><FieldLabel>Nombre</FieldLabel><DarkInput type="text" required value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} /></div>
            <div><FieldLabel>Correo</FieldLabel><DarkInput type="email" required value={editForm.correo} onChange={e => setEditForm(f => ({ ...f, correo: e.target.value }))} /></div>
            <div>
              <FieldLabel>Nueva contraseña <span style={{ fontFamily: 'Mulish', fontWeight: 400, fontSize: 11, color: '#857e71', letterSpacing: 0, textTransform: 'none' }}>(vacío = no cambiar)</span></FieldLabel>
              <DarkInput type="password" minLength={6} placeholder="Mínimo 6 caracteres" value={editForm.contrasena} onChange={e => setEditForm(f => ({ ...f, contrasena: e.target.value }))} />
            </div>
            {editError && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 14 }}>{editError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
              <button type="button" onClick={() => setEditing(null)} style={{ padding: '14px 28px', background: 'transparent', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={saving} style={{ padding: '14px 28px', background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando…' : 'GUARDAR CAMBIOS'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete */}
      {confirmDelete && (
        <Modal title="Eliminar empleado" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: '#a7a092', fontSize: 14, marginBottom: 24 }}>
            ¿Eliminar a <span style={{ color: '#f3efe7', fontWeight: 600 }}>{confirmDelete.nombre}</span>? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ padding: '14px 28px', background: 'transparent', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleDelete} disabled={deleting} style={{ padding: '14px 28px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontFamily: 'Mulish', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: deleting ? 0.6 : 1 }}>
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
