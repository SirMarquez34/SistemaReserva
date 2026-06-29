import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  getClients, createClient, updateClient, deleteClient,
  type Client, type ClientPayload,
} from "../api/clients";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const EMPTY: ClientPayload = { nombre: "", telefono: "", email: "" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 52, padding: '0 18px',
  background: '#0e0c08', border: '1px solid #2a2419',
  color: '#f3efe7', fontFamily: 'Mulish', fontSize: 14,
  transition: 'border-color .2s', outline: 'none',
}

function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={inputStyle}
    onFocus={e => (e.target.style.borderColor = '#d4a53c')}
    onBlur={e => (e.target.style.borderColor = '#2a2419')} />
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.12em', color: '#857e71', marginBottom: 10, textTransform: 'uppercase' }}>{children}</label>
}

export default function ClientesPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "admin";

  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientPayload>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadPage(page: number) {
    setLoading(true); setError(null);
    try { const res = await getClients(page, 10); setClients(res.data); setPagination(res.pagination); }
    catch { setError("No se pudieron cargar los clientes"); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadPage(1); }, []);

  function openCreate() { setEditing(null); setForm(EMPTY); setFormError(null); setShowForm(true); }
  function openEdit(c: Client) {
    setEditing(c);
    setForm({ nombre: c.nombre, telefono: c.telefono, email: c.email });
    setFormError(null); setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditing(null); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setFormError(null); setSubmitting(true);
    try {
      if (editing) { const u = await updateClient(editing.id, form); setClients(p => p.map(c => c.id === u.id ? u : c)); }
      else { await createClient(form); await loadPage(1); }
      closeForm();
    } catch (err: unknown) {
      setFormError((err as any)?.response?.data?.message || "Error al guardar el cliente");
    } finally { setSubmitting(false); }
  }

  async function handleDelete() {
    if (!confirmDelete) return; setDeleting(true);
    try { await deleteClient(confirmDelete.id); setConfirmDelete(null); await loadPage(pagination.page); }
    catch { setConfirmDelete(null); }
    finally { setDeleting(false); }
  }

  return (
    <div style={{ padding: '48px 48px 60px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.4em', color: '#d4a53c', marginBottom: 10 }}>PANEL ADMIN</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 48, color: '#f5f1e8', margin: 0 }}>Clientes</h2>
          <p style={{ color: '#857e71', fontSize: 14, marginTop: 6 }}>{pagination.total} clientes registrados</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate}
            style={{ background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', padding: '14px 24px', cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e6bb55')}
            onMouseLeave={e => (e.currentTarget.style.background = '#d4a53c')}
          >
            + NUEVO CLIENTE
          </button>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#15110c', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        {error && <div style={{ padding: '14px 24px', fontSize: 14, color: '#f87171', background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>{error}</div>}
        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center', color: '#857e71', fontSize: 14 }}>Cargando…</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center', color: '#857e71', fontSize: 14 }}>No hay clientes registrados</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1a1510' }}>
                  {['NOMBRE', 'EMAIL', 'TELÉFONO', 'REGISTRO', ...(isAdmin ? ['ACCIONES'] : [])].map((h, i) => (
                    <th key={h} style={{ padding: '14px 24px', textAlign: i === 4 ? 'right' : 'left', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.15em', color: '#857e71' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #1a1510' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,165,60,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '16px 24px', color: '#f3efe7', fontWeight: 600 }}>{c.nombre}</td>
                    <td style={{ padding: '16px 24px', color: '#a7a092' }}>{c.email}</td>
                    <td style={{ padding: '16px 24px', color: '#a7a092' }}>{c.telefono}</td>
                    <td style={{ padding: '16px 24px', color: '#857e71', fontFamily: "'Cormorant Garamond', serif", fontSize: 15 }}>{formatDate(c.created_at)}</td>
                    {isAdmin && (
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button onClick={() => openEdit(c)}
                          style={{ color: '#d4a53c', background: 'none', border: 'none', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginRight: 16 }}>
                          Editar
                        </button>
                        <button onClick={() => setConfirmDelete(c)}
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

      {showForm && (
        <Modal title={editing ? "Editar cliente" : "Nuevo cliente"} onClose={closeForm}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div><FieldLabel>Nombre</FieldLabel><DarkInput type="text" required placeholder="Nombre completo" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></div>
            <div><FieldLabel>Email</FieldLabel><DarkInput type="email" required placeholder="correo@ejemplo.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><FieldLabel>Teléfono</FieldLabel><DarkInput type="tel" required placeholder="Teléfono" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} /></div>
            {formError && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 14 }}>{formError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
              <button type="button" onClick={closeForm} style={{ padding: '14px 28px', background: 'transparent', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={submitting}
                style={{ padding: '14px 28px', background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Guardando…' : editing ? 'GUARDAR CAMBIOS' : 'CREAR CLIENTE'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Eliminar cliente" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: '#a7a092', fontSize: 14, marginBottom: 24 }}>
            ¿Eliminar a <span style={{ color: '#f3efe7', fontWeight: 600 }}>{confirmDelete.nombre}</span>? Esta acción no se puede deshacer.
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
  );
}
