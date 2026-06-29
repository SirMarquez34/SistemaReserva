import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdMenu, MdClose } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Resumen',   adminOnly: false },
  { to: '/reservas',  label: 'Turnos',    adminOnly: false },
  { to: '/clientes',  label: 'Clientes',  adminOnly: false },
  { to: '/servicios', label: 'Servicios', adminOnly: false },
  { to: '/horarios',  label: 'Horarios',  adminOnly: false },
  { to: '/empleados', label: 'Empleados', adminOnly: true  },
]

const SpartaLogoSvg = () => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="#d4a53c">
    <path d="M16 12c10-8 28-8 36 0-6-3-12-3-17-1 5 1 9 4 11 8-6-5-18-6-26-2-2-2-3-4-4-5z" />
    <path d="M20 16c-7 6-9 18-4 28 3 6 8 9 14 10v-7c-5-2-8-7-8-13 0-3 1-6 3-8h19c3 0 4-3 2-5-4-5-16-8-26-5z" />
    <path d="M30 26h6v24c-2 1-4 1-6 0z" />
  </svg>
)

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.rol === 'admin'
  const visible = NAV_ITEMS.filter(i => !i.adminOnly || isAdmin)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-7 py-7 border-b border-[#2a2419]">
        <div className="flex items-center gap-3">
          <SpartaLogoSvg />
          <div style={{ lineHeight: 1 }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 17, letterSpacing: '.22em', color: '#e9d9a8' }}>
              SPARTA
            </p>
            <p style={{ fontFamily: 'Mulish, sans-serif', fontWeight: 600, fontSize: 8, letterSpacing: '.44em', color: '#8c8475', marginTop: 4 }}>
              ADMIN PANEL
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 overflow-y-auto">
        {visible.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-7 py-3 transition-colors ${
                isActive
                  ? 'bg-[rgba(212,165,60,0.08)]'
                  : 'hover:bg-[rgba(255,255,255,0.02)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  style={{ fontSize: 10, color: isActive ? '#d4a53c' : '#4a4334', flexShrink: 0 }}
                >
                  ●
                </span>
                <span
                  style={{
                    fontFamily: 'Mulish, sans-serif',
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: '.06em',
                    color: isActive ? '#e9d9a8' : '#857e71',
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-[#2a2419] pb-6 pt-4">
        <Link
          to="/"
          className="flex items-center gap-2 px-7 py-2.5 transition-colors group"
          style={{ fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.1em', color: '#857e71' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#d4a53c')}
          onMouseLeave={e => (e.currentTarget.style.color = '#857e71')}
        >
          ‹ VOLVER AL SITIO
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-7 py-2.5 w-full text-left transition-colors"
          style={{ fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.1em', color: '#857e71' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#d4a53c')}
          onMouseLeave={e => (e.currentTarget.style.color = '#857e71')}
        >
          CERRAR SESIÓN
        </button>
      </div>
    </div>
  )
}

export default function AppLayout() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#0b0907] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0b0907] border-r border-[#2a2419] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : -256 }}
        transition={{ type: 'tween', duration: 0.22 }}
        className="fixed left-0 top-0 h-full w-64 bg-[#0b0907] border-r border-[#2a2419] z-50 lg:hidden"
      >
        <div className="absolute top-4 right-3">
          <button onClick={() => setOpen(false)} className="text-[#857e71] hover:text-[#d4a53c] p-1">
            <MdClose className="text-xl" />
          </button>
        </div>
        <SidebarContent onClose={() => setOpen(false)} />
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-[#2a2419] bg-[#0b0907]">
          <button onClick={() => setOpen(true)} className="text-[#857e71] hover:text-[#d4a53c]">
            <MdMenu className="text-2xl" />
          </button>
          <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 14, letterSpacing: '.22em', color: '#e9d9a8' }}>
            SPARTA
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#d4a53c' }}
          >
            <span style={{ color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 12 }}>
              {user?.nombre?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
