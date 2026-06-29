import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { loginRequest } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const SpartaLogoSvg = () => (
  <svg width="46" height="46" viewBox="0 0 64 64" fill="#d4a53c">
    <path d="M16 12c10-8 28-8 36 0-6-3-12-3-17-1 5 1 9 4 11 8-6-5-18-6-26-2-2-2-3-4-4-5z" />
    <path d="M20 16c-7 6-9 18-4 28 3 6 8 9 14 10v-7c-5-2-8-7-8-13 0-3 1-6 3-8h19c3 0 4-3 2-5-4-5-16-8-26-5z" />
    <path d="M30 26h6v24c-2 1-4 1-6 0z" />
    <path d="M33 41l13 13M46 41L33 54" stroke="#d4a53c" strokeWidth="2.4" strokeLinecap="round" fill="none" />
  </svg>
)

function extractError(err: unknown): string {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    (err as { response?: { data?: { message?: string } } }).response?.data?.message
  ) {
    return (err as { response: { data: { message: string } } }).response.data.message;
  }
  return "No se pudo conectar al servidor";
}

export default function LoginPage() {
  const { login, loginCliente } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await loginRequest(email, password);
      if (result.tipo === "cliente") {
        loginCliente(result.cliente, result.token);
        navigate("/mis-reservas", { replace: true });
      } else {
        login(result.user, result.token);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative"
      style={{ background: '#0b0907' }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 520, height: 520,
        background: 'radial-gradient(circle, rgba(212,165,60,0.08), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-[440px]"
      >
        <div style={{
          background: '#14110c',
          border: '1px solid rgba(212,165,60,0.14)',
          padding: '48px 44px',
        }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-4">
            <SpartaLogoSvg />
            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 18, letterSpacing: '.22em', color: '#e9d9a8', marginTop: 12 }}>
              SPARTA
            </p>
            <p style={{ fontFamily: 'Mulish', fontWeight: 600, fontSize: 8.5, letterSpacing: '.44em', color: '#8c8475', marginTop: 3 }}>
              BARBERSHOP
            </p>
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: '.08em',
            textAlign: 'center',
            color: '#f3d98e',
            margin: '18px 0 4px',
          }}>
            INICIA SESIÓN
          </h2>
          <p style={{ textAlign: 'center', color: '#8c857a', fontSize: 14, marginBottom: 32 }}>
            Para continuar
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <MdEmail
                size={17}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#d4a53c' }}
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: '#0e0c08',
                  border: '1px solid #2a2419',
                  color: '#f3efe7',
                  fontFamily: 'Mulish',
                  fontSize: 15,
                  padding: '16px 16px 16px 46px',
                  transition: 'border-color .2s',
                  outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = '#d4a53c')}
                onBlur={e => (e.target.style.borderColor = '#2a2419')}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <MdLock
                size={17}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#d4a53c' }}
              />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: '#0e0c08',
                  border: '1px solid #2a2419',
                  color: '#f3efe7',
                  fontFamily: 'Mulish',
                  fontSize: 15,
                  padding: '16px 46px 16px 46px',
                  transition: 'border-color .2s',
                  outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = '#d4a53c')}
                onBlur={e => (e.target.style.borderColor = '#2a2419')}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8c857a', display: 'flex', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 14 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: '#d4a53c',
                border: 'none',
                color: '#161009',
                fontFamily: 'Mulish',
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: '.14em',
                padding: 17,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all .2s',
              }}
              onMouseEnter={e => !loading && ((e.target as HTMLButtonElement).style.background = '#e6bb55')}
              onMouseLeave={e => !loading && ((e.target as HTMLButtonElement).style.background = '#d4a53c')}
            >
              {loading ? 'Iniciando sesión…' : 'INICIAR SESIÓN'}
            </button>

            <p style={{ textAlign: 'center', color: '#8c857a', fontSize: 14, marginTop: 8 }}>
              ¿No tenés cuenta?{' '}
              <Link to="/registro" style={{ color: '#d4a53c', fontWeight: 600 }}>
                Registrate
              </Link>
            </p>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            style={{ color: '#4a4334', fontSize: 11, fontFamily: 'Mulish', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', transition: 'color .2s' }}
            onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = '#d4a53c')}
            onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = '#4a4334')}
          >
            ← Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
