import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdLocationOn, MdPhone, MdEmail, MdSend } from 'react-icons/md'
import { FaInstagram, FaFacebook } from 'react-icons/fa'

import heroImg from '../assets/Embl.png'
import corteCabelloImg from '../assets/CorteCabello.webp'
import coloracionBarbaImg from '../assets/Coloracion de barba.png'
import afeitadoImg from '../assets/AfeitadoTradicional.jpg'
import tratamientoFacialImg from '../assets/TratamientoFacial.jpg'
import depilacionImg from '../assets/DepilacionConCera.webp'
import hidratacionImg from '../assets/HidratacionFacial.jpg'
import exfoliacionImg from '../assets/ExfoliacionCapilar.jpg'
import coloracionCabelloImg from '../assets/Coloracion de cabello.png'
import semipermanentesImg from '../assets/Semipermanentes.png'
import arregloImg from '../assets/ArregloPerfilado.jpg'
import modeloImg from '../assets/Embl.png'

import { getServices, type Service } from '../api/services'

const ALL_IMAGES = [
  corteCabelloImg, coloracionBarbaImg, afeitadoImg, tratamientoFacialImg,
  depilacionImg, hidratacionImg, exfoliacionImg, coloracionCabelloImg,
  semipermanentesImg, arregloImg,
]

function getServiceImage(nombre: string, idx: number): string {
  const n = nombre.toLowerCase()
  if (n.includes('corte') && (n.includes('cabello') || n.includes('pelo'))) return corteCabelloImg
  if (n.includes('barba') && n.includes('color')) return coloracionBarbaImg
  if (n.includes('afeitado')) return afeitadoImg
  if (n.includes('facial') || n.includes('tratamiento')) return tratamientoFacialImg
  if (n.includes('depilac')) return depilacionImg
  if (n.includes('hidratac')) return hidratacionImg
  if (n.includes('exfoliaci')) return exfoliacionImg
  if (n.includes('cabello') && n.includes('color')) return coloracionCabelloImg
  if (n.includes('semiperm') || n.includes('tinte')) return semipermanentesImg
  if (n.includes('arreglo') || n.includes('perfil')) return arregloImg
  return ALL_IMAGES[idx % ALL_IMAGES.length]
}

const SpartaLogoSvg = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="#d4a53c">
    <path d="M16 12c10-8 28-8 36 0-6-3-12-3-17-1 5 1 9 4 11 8-6-5-18-6-26-2-2-2-3-4-4-5z" />
    <path d="M20 16c-7 6-9 18-4 28 3 6 8 9 14 10v-7c-5-2-8-7-8-13 0-3 1-6 3-8h19c3 0 4-3 2-5-4-5-16-8-26-5z" />
    <path d="M30 26h6v24c-2 1-4 1-6 0z" />
    <path d="M33 41l13 13M46 41L33 54" stroke="#d4a53c" strokeWidth="2.4" strokeLinecap="round" fill="none" />
  </svg>
)

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease: 'easeOut' } }),
}

export default function LandingPage() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [services, setServices]     = useState<Service[]>([])
  const [email, setEmail]           = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    getServices(1, 8).then(r => setServices(r.data.filter((s: Service) => s.activo))).catch(() => {})
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenu(false)
  }

  const navLinks = [
    { label: 'INICIO',    action: () => scrollTo('inicio') },
    { label: 'SERVICIOS', action: () => scrollTo('servicios') },
    { label: 'NOSOTROS',  action: () => scrollTo('nosotros') },
    { label: 'CONTACTO',  action: () => scrollTo('contacto') },
  ]

  return (
    <div style={{ background: '#0b0907', color: '#f3efe7', minHeight: '100vh', cursor: 'default', userSelect: 'none' }}>

      {/* ══ NAVBAR ══ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 74,
        background: scrolled ? 'rgba(11,9,7,.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(212,165,60,.12)' : '1px solid transparent',
        transition: 'all .3s',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <a onClick={() => scrollTo('inicio')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textDecoration: 'none' }}>
            <SpartaLogoSvg size={32} />
            <div>
              <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 15, letterSpacing: '.22em', color: '#e9d9a8', margin: 0 }}>SPARTA</p>
              <p style={{ fontFamily: 'Mulish', fontWeight: 600, fontSize: 8, letterSpacing: '.44em', color: '#8c8475', margin: 0 }}>BARBERSHOP</p>
            </div>
          </a>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="hidden md:flex">
            {navLinks.map(l => (
              <button key={l.label} onClick={l.action}
                style={{ background: 'none', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.18em', cursor: 'pointer', transition: 'color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#d4a53c')}
                onMouseLeave={e => (e.currentTarget.style.color = '#857e71')}
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="hidden md:flex">
            <Link to="/login"
              style={{ color: '#857e71', fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.18em', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = '#d4a53c')}
              onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = '#857e71')}
            >
              INICIAR SESIÓN
            </Link>
            <Link to="/registro"
              style={{ padding: '10px 22px', border: '1px solid rgba(212,165,60,.5)', color: '#d4a53c', fontFamily: 'Mulish', fontWeight: 800, fontSize: 11, letterSpacing: '.14em', textDecoration: 'none', transition: 'all .2s' }}
              onMouseEnter={e => { (e.target as HTMLAnchorElement).style.background = '#d4a53c'; (e.target as HTMLAnchorElement).style.color = '#161009' }}
              onMouseLeave={e => { (e.target as HTMLAnchorElement).style.background = 'transparent'; (e.target as HTMLAnchorElement).style.color = '#d4a53c' }}
            >
              REGISTRARME
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMobileMenu(v => !v)}
            style={{ background: 'none', border: 'none', color: '#857e71', fontSize: 22, cursor: 'pointer' }}>
            {mobileMenu ? '✕' : '☰'}
          </button>
        </div>

        {mobileMenu && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: '#0f0c07', borderTop: '1px solid #2a2419', padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}
            className="md:hidden">
            {navLinks.map(l => (
              <button key={l.label} onClick={l.action}
                style={{ background: 'none', border: 'none', color: '#857e71', fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.18em', cursor: 'pointer', textAlign: 'left', padding: '8px 0' }}>
                {l.label}
              </button>
            ))}
            <Link to="/login" style={{ color: '#857e71', fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.18em', padding: '8px 0', textDecoration: 'none' }}>
              INICIAR SESIÓN
            </Link>
            <Link to="/registro"
              style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#d4a53c', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 11, letterSpacing: '.14em', textDecoration: 'none' }}>
              REGISTRARME
            </Link>
          </motion.div>
        )}
      </header>

      {/* ══ HERO ══ */}
      <section id="inicio" style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Left content */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '50%', padding: '100px 96px 80px 80px' }} className="w-full lg:w-1/2 px-8 lg:px-20">

          <motion.p initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.5em', color: '#d4a53c', marginBottom: 32 }}>
            SPARTA BARBERSHOP
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(56px, 6vw, 88px)', lineHeight: 1.05, color: '#f5f1e8', margin: 0 }}>
            Reservá tu
          </motion.h1>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.18 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(56px, 6vw, 88px)', lineHeight: 1.05, color: '#d4a53c', margin: '0 0 28px' }}>
            Mejor Versión
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            style={{ color: '#857e71', fontSize: 15, lineHeight: 1.75, maxWidth: 360, marginBottom: 40 }}>
            Servicios profesionales para el cuidado personal que te merecés. Tradición, precisión y carácter espartano.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.32 }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
            <button onClick={() => scrollTo('servicios')}
              style={{ padding: '14px 32px', background: '#d4a53c', border: 'none', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 11, letterSpacing: '.2em', cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e6bb55')}
              onMouseLeave={e => (e.currentTarget.style.background = '#d4a53c')}>
              VER SERVICIOS
            </button>
            <Link to="/registro"
              style={{ padding: '14px 32px', border: '1px solid #4a4334', color: '#857e71', fontFamily: 'Mulish', fontWeight: 800, fontSize: 11, letterSpacing: '.2em', textDecoration: 'none', transition: 'all .2s', display: 'inline-block' }}
              onMouseEnter={e => { (e.target as HTMLAnchorElement).style.borderColor = '#d4a53c'; (e.target as HTMLAnchorElement).style.color = '#d4a53c' }}
              onMouseLeave={e => { (e.target as HTMLAnchorElement).style.borderColor = '#4a4334'; (e.target as HTMLAnchorElement).style.color = '#857e71' }}>
              CREAR CUENTA
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.45 }}
            style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[
              { num: '+10', label: 'Años de experiencia' },
              { num: '+5k', label: 'Clientes satisfechos' },
              { num: '+8',  label: 'Profesionales' },
            ].map(({ num, label }, i) => (
              <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 28, color: '#d4a53c', margin: 0, lineHeight: 1 }}>{num}</p>
                  <p style={{ fontFamily: 'Mulish', fontSize: 10, letterSpacing: '.1em', color: '#4a4334', margin: 0, marginTop: 4 }}>{label}</p>
                </div>
                {i < 2 && <div style={{ width: 1, height: 32, background: '#2a2419' }} />}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right image */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%' }} className="hidden lg:block">
          <img src={heroImg} alt="Sparta Barber" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0b0907, rgba(11,9,7,.3) 40%, transparent)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,9,7,.5), transparent)' }} />
        </motion.div>
      </section>

      {/* ══ SERVICES ══ */}
      <section id="servicios" style={{ padding: '96px 0', background: '#0b0907' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.45em', color: '#d4a53c', marginBottom: 16 }}>LO QUE OFRECEMOS</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 56, color: '#f5f1e8', margin: 0 }}>
              Nuestros Servicios
            </h2>
          </motion.div>

          {services.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#4a4334', fontSize: 14, padding: '48px 0' }}>Cargando servicios…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
              {services.map((s, i) => (
                <motion.div key={s.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.07}
                  style={{ background: '#15110c', border: '1px solid #2a2419', display: 'flex', flexDirection: 'column', transition: 'border-color .3s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,165,60,.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2419')}
                >
                  {/* Image */}
                  <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                    <img src={getServiceImage(s.nombre, i)} alt={s.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    {/* Price badge */}
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'rgba(11,9,7,.85)', border: '1px solid rgba(212,165,60,.4)',
                      padding: '4px 10px',
                      fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 15, color: '#d4a53c',
                    }}>
                      ${Number(s.precio).toFixed(2)}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 20, color: '#f5f1e8', margin: '0 0 8px' }}>
                      {s.nombre}
                    </h3>
                    <p style={{ color: '#857e71', fontSize: 13, lineHeight: 1.6, flex: 1, marginBottom: 16 }}>{s.descripcion}</p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ color: '#4a4334', fontSize: 12, fontFamily: 'Mulish' }}>{s.duracion_minutos} min</span>
                    </div>

                    <Link to="/registro"
                      style={{ display: 'block', textAlign: 'center', padding: '12px', border: '1px solid rgba(212,165,60,.5)', color: '#d4a53c', fontFamily: 'Mulish', fontWeight: 800, fontSize: 11, letterSpacing: '.2em', textDecoration: 'none', transition: 'all .2s' }}
                      onMouseEnter={e => { (e.target as HTMLAnchorElement).style.background = '#d4a53c'; (e.target as HTMLAnchorElement).style.color = '#161009' }}
                      onMouseLeave={e => { (e.target as HTMLAnchorElement).style.background = 'transparent'; (e.target as HTMLAnchorElement).style.color = '#d4a53c' }}>
                      RESERVAR
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ NOSOTROS ══ */}
      <section id="nosotros" style={{ padding: '96px 0', background: '#0e0b07' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="grid-cols-1 lg:grid-cols-2">

          {/* Image frame */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ position: 'relative' }}>
            <div style={{ border: '1px solid rgba(212,165,60,.2)', padding: 12 }}>
              <img src={modeloImg} alt="Sparta Barbershop"
                style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }} />
            </div>
            {/* Decorative gold corner */}
            <div style={{ position: 'absolute', top: -8, left: -8, width: 40, height: 40, borderTop: '2px solid #d4a53c', borderLeft: '2px solid #d4a53c' }} />
            <div style={{ position: 'absolute', bottom: -8, right: -8, width: 40, height: 40, borderBottom: '2px solid #d4a53c', borderRight: '2px solid #d4a53c' }} />
          </motion.div>

          {/* Content */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.1}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.45em', color: '#d4a53c', marginBottom: 20 }}>QUIÉNES SOMOS</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 52, color: '#f5f1e8', margin: '0 0 24px', lineHeight: 1.1 }}>
              Tradición y<br /><span style={{ fontStyle: 'italic', color: '#d4a53c' }}>Excelencia</span>
            </h2>
            <p style={{ color: '#857e71', fontSize: 15, lineHeight: 1.75, marginBottom: 48 }}>
              Somos una barbería premium que fusiona la tradición del cuidado masculino con las técnicas más modernas. Nuestro equipo de especialistas está comprometido con ofrecerte una experiencia única en cada visita.
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, borderTop: '1px solid #2a2419', paddingTop: 32 }}>
              {[
                { num: '+3', label: 'Años' },
                { num: '+5k', label: 'Clientes' },
                { num: '+8',  label: 'Profesionales' },
              ].map(({ num, label }) => (
                <div key={num} style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 38, color: '#d4a53c', margin: 0, lineHeight: 1 }}>{num}</p>
                  <p style={{ fontFamily: 'Mulish', fontSize: 11, letterSpacing: '.1em', color: '#857e71', margin: '6px 0 0' }}>{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ CONTACTO CTA ══ */}
      <section id="contacto" style={{ padding: '80px 0', background: '#15110c', borderTop: '1px solid #2a2419', borderBottom: '1px solid #2a2419' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="grid-cols-1 lg:grid-cols-2">

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.45em', color: '#d4a53c', marginBottom: 16 }}>RESERVAS</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 44, color: '#f5f1e8', margin: '0 0 24px', lineHeight: 1.15 }}>
              ¿Listo para tu<br /><span style={{ fontStyle: 'italic', color: '#d4a53c' }}>próximo turno?</span>
            </h2>
            <Link to="/registro"
              style={{ display: 'inline-block', padding: '14px 32px', background: '#d4a53c', color: '#161009', fontFamily: 'Mulish', fontWeight: 800, fontSize: 11, letterSpacing: '.2em', textDecoration: 'none', transition: 'all .2s' }}
              onMouseEnter={e => ((e.target as HTMLAnchorElement).style.background = '#e6bb55')}
              onMouseLeave={e => ((e.target as HTMLAnchorElement).style.background = '#d4a53c')}>
              RESERVAR AHORA
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.1}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { Icon: MdLocationOn, text: 'Av. Francisco de Orellana, Guayaquil' },
              { Icon: MdPhone,      text: '+593 945321567' },
              { Icon: MdEmail,      text: 'sparta@reservas.com' },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 36, height: 36, background: 'rgba(212,165,60,.08)', border: '1px solid rgba(212,165,60,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ color: '#d4a53c', fontSize: 16 }} />
                </div>
                <span style={{ color: '#857e71', fontSize: 14, fontFamily: 'Mulish' }}>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: '#0b0907', borderTop: '1px solid #2a2419' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }} className="grid-cols-1 md:grid-cols-3">

          {/* Col 1 — Logo + social */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <SpartaLogoSvg size={28} />
              <div>
                <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 14, letterSpacing: '.22em', color: '#e9d9a8', margin: 0 }}>SPARTA</p>
                <p style={{ fontFamily: 'Mulish', fontWeight: 600, fontSize: 8, letterSpacing: '.44em', color: '#8c8475', margin: 0 }}>BARBERSHOP</p>
              </div>
            </div>
            <p style={{ color: '#4a4334', fontSize: 12, lineHeight: 1.7, marginBottom: 22, maxWidth: 220 }}>
              Barbería premium para el guerrero moderno. Tradición, precisión y carácter.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[FaInstagram, FaFacebook].map((Icon, i) => (
                <a key={i} href="#"
                  style={{ width: 32, height: 32, border: '1px solid #2a2419', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a4334', transition: 'all .2s', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#d4a53c'; (e.currentTarget as HTMLAnchorElement).style.color = '#d4a53c' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2a2419'; (e.currentTarget as HTMLAnchorElement).style.color = '#4a4334' }}>
                  <Icon style={{ fontSize: 13 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Contacto */}
          <div>
            <p style={{ fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.35em', color: '#d4a53c', marginBottom: 22 }}>CONTÁCTANOS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { Icon: MdLocationOn, text: 'Av. Francisco de Orellana, Guayaquil' },
                { Icon: MdPhone,      text: '+593 945321567' },
                { Icon: MdEmail,      text: 'sparta@reservas.com' },
              ].map(({ Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon style={{ color: '#d4a53c', fontSize: 14, flexShrink: 0 }} />
                  <span style={{ color: '#857e71', fontSize: 12 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3 — Newsletter */}
          <div>
            <p style={{ fontFamily: 'Mulish', fontWeight: 700, fontSize: 11, letterSpacing: '.35em', color: '#d4a53c', marginBottom: 22 }}>SUSCRÍBETE</p>
            <p style={{ color: '#4a4334', fontSize: 12, lineHeight: 1.7, marginBottom: 18 }}>Recibe promociones y novedades exclusivas.</p>
            <div style={{ display: 'flex' }}>
              <input type="email" placeholder="Tu correo electrónico" value={email} onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, padding: '12px 16px', background: '#15110c', border: '1px solid #2a2419', borderRight: 'none', color: '#f3efe7', fontFamily: 'Mulish', fontSize: 12, outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = '#d4a53c')}
                onBlur={e => (e.target.style.borderColor = '#2a2419')}
              />
              <button style={{ padding: '12px 14px', background: '#d4a53c', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MdSend style={{ color: '#161009', fontSize: 15 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #2a2419', padding: '18px 40px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: '#3a3020', fontSize: 11, fontFamily: 'Mulish' }}>© {new Date().getFullYear()} Sparta Barbershop. Todos los derechos reservados.</p>
            <div style={{ display: 'flex', gap: 24 }}>
              {['servicios', 'nosotros', 'contacto'].map(l => (
                <button key={l} onClick={() => scrollTo(l)}
                  style={{ background: 'none', border: 'none', color: '#3a3020', fontFamily: 'Mulish', fontWeight: 600, fontSize: 11, letterSpacing: '.1em', cursor: 'pointer', textTransform: 'capitalize', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#d4a53c')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#3a3020')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
