import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  getReservations, createReservation, updateReservation,
  deleteReservation, marcarAsistencia,
  type Reservation, type ReservationPayload,
} from "../api/reservations";
import { getClients, type Client } from "../api/clients";
import { getServices, type Service } from "../api/services";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const ESTADOS = ["pendiente", "confirmada", "cancelada", "completada", "no_asistio"] as const;

const ESTADO_BADGE: Record<string, React.CSSProperties> = {
  pendiente:  { background: 'rgba(234,179,8,0.12)',  color: '#fbbf24', border: '1px solid rgba(234,179,8,0.3)' },
  confirmada: { background: 'rgba(80,180,110,0.14)', color: '#6bd393', border: '1px solid rgba(80,180,110,0.4)' },
  cancelada:  { background: 'rgba(239,68,68,0.1)',   color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
  completada: { background: 'rgba(59,130,246,0.1)',  color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' },
  no_asistio: { background: 'rgba(107,114,128,0.1)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.3)' },
}
const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente", confirmada: "Confirmada", cancelada: "Cancelada",
  completada: "Completada", no_asistio: "No asistió",
}

const EMPTY_FORM: ReservationPayload = {
  cliente_id: 0, servicio_id: 0, fecha: "", hora_inicio: "", hora_fin: "", estado: "pendiente", observaciones: "",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 52, padding: '0 18px',
  background: '#0e0c08', border: '1px solid #2a2419',
  color: '#f3efe7', fontFamily: 'Mulish', fontSize: 14,
  transition: 'border-color .2s', outline: 'none',
}
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none' }
const textareaStyle: React.CSSProperties = {
  width: '100%', padding: '14px 18px', background: '#0e0c08', border: '1px solid #2a2419',
  color: '#f3efe7', fontFamily: 'Mulish', fontSize: 14,
  transition: 'border-color .2s', outline: 'none', resize: 'none',
}

function DarkSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={selectStyle}
    onFocus={e => (e.target.style.borderColor = '#d4a53c')}
    onBlur={e => (e.target.style.borderColor = '#2a2419')} />
}
function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={inputStyle}
    onFocus={e => (e.target.style.borderColor = '#d4a53c')}
    onBlur={e => (e.target.style.borderColor = '#2a2419')} />
}
function DarkTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={textareaStyle}
    onFocus={e => (e.target.style.borderColor = '#d4a53c')}
    onBlur={e => (e.target.style.borderColor = '#2a2419')} />
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.12em', color: '#857e71', marginBottom: 10, textTransform: 'uppercase' }}>{children}</label>
}

export default function ReservasPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "admin";

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [form, setForm] = useState<ReservationPayload>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Reservation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [attendanceRow, setAttendanceRow] = useState<number | null>(null);

  async function loadPage(page: number) {
    setLoading(true); setError(null);
    try {
      const res = await getReservations(page, 10);
      setReservations(res.data); setPagination(res.pagination);
    } catch { setError("No se pudieron cargar las reservas"); }
    finally { setLoading(false); }
  }

  async function loadSelects() {
    const [c, s] = await Promise.all([getClients(1, 100), getServices(1, 100)]);
    setClients(c.data); setServices(s.data.filter((s: Service) => s.activo));
  }

  useEffect(() => { loadPage(1); loadSelects(); }, []);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setFormError(null); setShowForm(true); }
  function openEdit(r: Reservation) {
    setEditing(r);
    setForm({
      cliente_id: r.cliente_id, servicio_id: r.servicio_id,
      fecha: r.fecha.slice(0, 10), hora_inicio: r.hora_inicio.slice(0, 5),
      hora_fin: r.hora_fin.slice(0, 5), estado: r.estado, observaciones: r.observaciones ?? "",
    });
    setFormError(null); setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditing(null); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setFormError(null);
    if (!form.cliente_id) { setFormError("Selecciona un cliente"); return; }
    if (!form.servicio_id) { setFormError("Selecciona un servicio"); return; }
    if (form.hora_fin <= form.hora_inicio) { setFormError("La hora de fin debe ser posterior a la hora de inicio"); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, observaciones: form.observaciones || undefined };
      if (editing) {
        const u = await updateReservation(editing.id, payload);
        setReservations(p => p.map(r => r.id === u.id ? { ...r, ...u } : r));
        await loadPage(pagination.page);
      } else { await createReservation(payload); await loadPage(1); }
      closeForm();
    } catch (err: unknown) {
      setFormError((err as any)?.response?.data?.message || "Error al guardar la reserva");
    } finally { setSubmitting(false); }
  }

  async function handleAsistencia(id: number, asistio: boolean) {
    try {
      const updated = await marcarAsistencia(id, asistio);
      setReservations(p => p.map(r => r.id === updated.id ? { ...r, estado: updated.estado } : r));
    } finally { setAttendanceRow(null); }
  }

  async function handleDelete() {
    if (!confirmDelete) return; setDeleting(true);
    try { await deleteReservation(confirmDelete.id); setConfirmDelete(null); await loadPage(pagination.page); }
    catch { setConfirmDelete(null); }
    finally { setDeleting(false); }
  }

  return (
    <div style={{ padding: '48px 48px 60px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.4em', color: '#d4a53c', marginBottom: 10 }}>PANEL ADMIN</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 48, color: '#f5f1e8', margin: 0 }}>Turnos</h2>
          <p style={{ color: '#857e71', fontSize: 14, marginTop: 6 }}>{pagination.total} turnos registrados</p>
        </div>
        <button
          onClick={openCreate}
          style={{ background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', padding: '14px 24px', cursor: 'pointer', transition: 'all .2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#e6bb55')}
          onMouseLeave={e => (e.currentTarget.style.background = '#d4a53c')}
        >
          + NUEVA RESERVA
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#15110c', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        {error && <div style={{ padding: '14px 24px', fontSize: 14, color: '#f87171', background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>{error}</div>}
        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center', color: '#857e71', fontSize: 14 }}>Cargando…</div>
        ) : reservations.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center', color: '#857e71', fontSize: 14 }}>No hay reservas registradas</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1a1510' }}>
                  {['FECHA', 'SERVICIO', 'CLIENTE', 'HORARIO', 'ESTADO', 'ACCIONES'].map((h, i) => (
                    <th key={h} style={{ padding: '14px 24px', textAlign: i === 5 ? 'right' : 'left', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.15em', color: '#857e71' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #1a1510' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,165,60,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '16px 24px', color: '#d4a53c', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 15 }}>{formatDate(r.fecha)}</td>
                    <td style={{ padding: '16px 24px', color: '#f3efe7', fontWeight: 600 }}>{r.servicio_nombre}</td>
                    <td style={{ padding: '16px 24px', color: '#a7a092' }}>{r.cliente_nombre}</td>
                    <td style={{ padding: '16px 24px', color: '#a7a092' }}>{r.hora_inicio.slice(0, 5)} – {r.hora_fin.slice(0, 5)}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ ...(ESTADO_BADGE[r.estado] ?? ESTADO_BADGE.no_asistio), fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.04em', padding: '3px 10px' }}>
                        {ESTADO_LABEL[r.estado] ?? r.estado}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                        {r.estado === "confirmada" && (
                          attendanceRow === r.id ? (
                            <>
                              <button onClick={() => handleAsistencia(r.id, true)}
                                style={{ padding: '4px 10px', background: 'rgba(80,180,110,0.15)', border: '1px solid rgba(80,180,110,0.3)', color: '#6bd393', fontFamily: 'Mulish', fontSize: 12, cursor: 'pointer' }}>
                                Asistió
                              </button>
                              <button onClick={() => handleAsistencia(r.id, false)}
                                style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontFamily: 'Mulish', fontSize: 12, cursor: 'pointer' }}>
                                No asistió
                              </button>
                              <button onClick={() => setAttendanceRow(null)}
                                style={{ color: '#857e71', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }}>×</button>
                            </>
                          ) : (
                            <button onClick={() => setAttendanceRow(r.id)}
                              style={{ color: '#a78bfa', background: 'none', border: 'none', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                              Asistencia
                            </button>
                          )
                        )}
                        <button onClick={() => openEdit(r)}
                          style={{ color: '#d4a53c', background: 'none', border: 'none', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                          Editar
                        </button>
                        {isAdmin && (
                          <button onClick={() => setConfirmDelete(r)}
                            style={{ color: '#f87171', background: 'none', border: 'none', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
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
        <Modal title={editing ? "Editar reserva" : "Nueva reserva"} onClose={closeForm}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div><FieldLabel>Cliente</FieldLabel>
              <DarkSelect required value={form.cliente_id || ""} onChange={e => setForm(f => ({ ...f, cliente_id: Number(e.target.value) }))}>
                <option value="">Selecciona un cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </DarkSelect>
            </div>
            <div><FieldLabel>Servicio</FieldLabel>
              <DarkSelect required value={form.servicio_id || ""} onChange={e => setForm(f => ({ ...f, servicio_id: Number(e.target.value) }))}>
                <option value="">Selecciona un servicio</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.nombre} ({s.duracion_minutos} min — ${Number(s.precio).toFixed(2)})</option>)}
              </DarkSelect>
            </div>
            <div><FieldLabel>Fecha</FieldLabel><DarkInput type="date" required value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><FieldLabel>Hora inicio</FieldLabel><DarkInput type="time" required value={form.hora_inicio} onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))} /></div>
              <div><FieldLabel>Hora fin</FieldLabel><DarkInput type="time" required value={form.hora_fin} onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))} /></div>
            </div>
            <div><FieldLabel>Estado</FieldLabel>
              <DarkSelect value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as ReservationPayload["estado"] }))}>
                {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABEL[e] ?? e}</option>)}
              </DarkSelect>
            </div>
            <div><FieldLabel>Observaciones <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#857e71' }}>(opcional)</span></FieldLabel>
              <DarkTextarea rows={2} placeholder="Notas adicionales…" value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} />
            </div>
            {formError && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 14 }}>{formError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
              <button type="button" onClick={closeForm} style={{ padding: '14px 28px', background: 'transparent', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={submitting} style={{ padding: '14px 28px', background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Guardando…' : editing ? 'GUARDAR CAMBIOS' : 'CREAR RESERVA'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Eliminar reserva" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: '#a7a092', fontSize: 14, marginBottom: 24 }}>
            ¿Eliminar la reserva de <span style={{ color: '#f3efe7', fontWeight: 600 }}>{confirmDelete.cliente_nombre}</span> para <span style={{ color: '#f3efe7', fontWeight: 600 }}>{confirmDelete.servicio_nombre}</span>?
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
  );
}
