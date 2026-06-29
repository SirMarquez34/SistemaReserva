import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getStats } from '../api/stats'
import { getReservations, type Reservation } from '../api/reservations'

interface Stats { reservas: number; clientes: number; servicios: number; horarios: number }

const BAR_DATA = [
  { mes: 'Ene', reservas: 38 }, { mes: 'Feb', reservas: 52 }, { mes: 'Mar', reservas: 61 },
  { mes: 'Abr', reservas: 74 }, { mes: 'May', reservas: 88 }, { mes: 'Jun', reservas: 95 },
  { mes: 'Jul', reservas: 82 },
]
const PIE_DATA = [
  { name: 'Corte Clásico', value: 38 }, { name: 'Corte + Barba', value: 27 },
  { name: 'Afeitado Navaja', value: 18 }, { name: 'Tratamiento', value: 17 },
]
const PIE_COLORS = ['#d4a53c', '#c8972e', '#b8841f', '#a07018']

const ESTADO_STYLES: Record<string, React.CSSProperties> = {
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
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1a1510', border: '1px solid #2a2419', padding: '8px 14px', fontSize: 12 }}>
      <p style={{ color: '#857e71', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#d4a53c', fontWeight: 700 }}>{payload[0].value} reservas</p>
    </div>
  )
}

function StatCard({ label, value, loading, gold = false }: { label: string; value: string | number; loading: boolean; gold?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: gold ? 'linear-gradient(160deg, #1c1610, #100d09)' : '#15110c',
        border: gold ? '1px solid rgba(212,165,60,0.3)' : '1px solid rgba(255,255,255,0.05)',
        padding: '24px 26px',
      }}
    >
      <p style={{ fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.18em', color: gold ? '#d4a53c' : '#857e71', marginBottom: 16 }}>
        {label}
      </p>
      {loading ? (
        <div style={{ width: 60, height: 32, background: '#2a2419', animation: 'pulse 1.5s infinite' }} />
      ) : (
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600,
          fontSize: 38,
          lineHeight: 1,
          color: gold ? '#d4a53c' : '#f3efe7',
        }}>
          {value}
        </p>
      )}
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats]           = useState<Stats | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, r] = await Promise.all([getStats(), getReservations(1, 6)])
        setStats(s)
        setReservations(r.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div style={{ padding: '48px 48px 60px', display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Header */}
      <div>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.4em', color: '#d4a53c', marginBottom: 10 }}>PANEL ADMIN</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 48, color: '#f5f1e8', margin: 0 }}>
          Resumen
        </h2>
        <p style={{ color: '#857e71', fontSize: 14, marginTop: 6 }}>Vista general de tu barbería</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="TURNOS"    value={stats?.reservas ?? 0}  loading={loading} />
        <StatCard label="CLIENTES"  value={stats?.clientes ?? 0}  loading={loading} />
        <StatCard label="SERVICIOS" value={stats?.servicios ?? 0} loading={loading} />
        <StatCard label="HORARIOS"  value={stats?.horarios ?? 0}  loading={loading} gold />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{ background: '#15110c', border: '1px solid rgba(255,255,255,0.05)', padding: '28px 28px 22px' }}
        >
          <p style={{ fontFamily: 'Mulish', fontWeight: 700, fontSize: 14, color: '#f3efe7', marginBottom: 4 }}>Reservas por mes</p>
          <p style={{ color: '#857e71', fontSize: 12, marginBottom: 24 }}>Tendencia de los últimos 7 meses</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={BAR_DATA} barCategoryGap="35%">
              <XAxis dataKey="mes" tick={{ fill: '#857e71', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#857e71', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212,165,60,0.05)' }} />
              <Bar dataKey="reservas" fill="#d4a53c" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          style={{ background: '#15110c', border: '1px solid rgba(255,255,255,0.05)', padding: '28px 28px 22px' }}
        >
          <p style={{ fontFamily: 'Mulish', fontWeight: 700, fontSize: 14, color: '#f3efe7', marginBottom: 4 }}>Servicios más solicitados</p>
          <p style={{ color: '#857e71', fontSize: 12, marginBottom: 24 }}>Distribución del último mes</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: '#857e71', fontSize: 11 }}>{v}</span>} />
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Participación']}
                contentStyle={{ background: '#1a1510', border: '1px solid #2a2419', borderRadius: 0, fontSize: 12 }}
                labelStyle={{ color: '#857e71' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent reservations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        style={{ background: '#15110c', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}
      >
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #2a2419' }}>
          <p style={{ fontFamily: 'Mulish', fontWeight: 700, fontSize: 14, color: '#f3efe7' }}>Próximos turnos</p>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#857e71', fontSize: 14 }}>Cargando…</div>
        ) : reservations.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#857e71', fontSize: 14 }}>Sin reservas aún</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1a1510' }}>
                  {['FECHA', 'SERVICIO', 'CLIENTE', 'HORA', 'ESTADO'].map(h => (
                    <th key={h} style={{ padding: '14px 24px', textAlign: 'left', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.15em', color: '#857e71' }}>
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
                    <td style={{ padding: '16px 24px', color: '#d4a53c', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 15 }}>
                      {formatDate(r.fecha)}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#f3efe7', fontWeight: 600 }}>{r.servicio_nombre}</td>
                    <td style={{ padding: '16px 24px', color: '#a7a092' }}>{r.cliente_nombre}</td>
                    <td style={{ padding: '16px 24px', color: '#a7a092' }}>{r.hora_inicio.slice(0, 5)} hs</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        ...(ESTADO_STYLES[r.estado] ?? { background: 'rgba(107,114,128,0.1)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.3)' }),
                        fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.04em', padding: '3px 10px',
                      }}>
                        {ESTADO_LABEL[r.estado] ?? r.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
