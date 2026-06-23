import { useState, FormEvent } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { login } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  if (user) {
    return <Navigate to={user.role === 'coordinador' ? '/admin' : '/scan'} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const role = useAuthStore.getState().user?.role
      navigate(role === 'coordinador' ? '/admin' : '/scan', { replace: true })
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #1A3A6B 0%, #0F1B3D 100%)' }}
    >
      {/* Destellos dorados decorativos */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(201,148,42,0.18) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-48 h-48 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(244,200,66,0.10) 0%, transparent 70%)' }}
      />

      {/* Logo + título */}
      <div className="mb-8 flex flex-col items-center gap-3 relative z-10">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #1A3A6B, #2452A0)',
            border: '3px solid rgba(201,148,42,0.60)',
            boxShadow: '0 0 0 6px rgba(201,148,42,0.12), 0 8px 24px rgba(0,0,0,0.30)',
          }}
        >
          {/* Cruz eucarística */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="15" y="4" width="6" height="28" rx="2" fill="rgba(201,148,42,0.9)" />
            <rect x="4" y="13" width="28" height="6" rx="2" fill="rgba(201,148,42,0.9)" />
          </svg>
        </div>
        <div>
          <h1
            className="text-3xl font-extrabold text-center tracking-tight"
            style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
          >
            Carlo
          </h1>
          <p className="text-center text-sm" style={{ color: 'rgba(201,148,42,0.80)' }}>
            Sistema de catequesis
          </p>
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl p-6 relative z-10"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        <h2
          className="text-xl font-bold mb-5"
          style={{ color: '#1A2338', letterSpacing: '-0.01em' }}
        >
          Iniciar sesión
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-bold mb-2"
              htmlFor="email"
              style={{ color: '#4A5568' }}
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl px-4 text-base outline-none transition-all"
              style={{
                height: '52px',
                border: '2px solid #E2E6EF',
                background: '#F8F9FC',
                color: '#1A2338',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1A3A6B'
                e.currentTarget.style.background = '#FFFFFF'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,58,107,0.10)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E2E6EF'
                e.currentTarget.style.background = '#F8F9FC'
                e.currentTarget.style.boxShadow = 'none'
              }}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label
              className="block text-sm font-bold mb-2"
              htmlFor="password"
              style={{ color: '#4A5568' }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl px-4 text-base outline-none transition-all"
              style={{
                height: '52px',
                border: '2px solid #E2E6EF',
                background: '#F8F9FC',
                color: '#1A2338',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1A3A6B'
                e.currentTarget.style.background = '#FFFFFF'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,58,107,0.10)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E2E6EF'
                e.currentTarget.style.background = '#F8F9FC'
                e.currentTarget.style.boxShadow = 'none'
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm font-semibold px-3 py-2 rounded-xl"
              style={{ color: '#C0271E', background: '#FDECEA' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold text-base text-white rounded-2xl transition-opacity"
            style={{
              height: '52px',
              background: 'linear-gradient(135deg, #1A3A6B, #2452A0)',
              boxShadow: '0 4px 16px rgba(26,58,107,0.30)',
              opacity: loading ? 0.65 : 1,
            }}
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>

          <Link
            to="/forgot-password"
            className="block text-center text-sm font-semibold mt-1"
            style={{ color: '#1A3A6B' }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </form>
      </div>

      {/* Cita de Carlo Acutis */}
      <p
        className="mt-8 text-center text-xs max-w-xs leading-relaxed relative z-10"
        style={{ color: 'rgba(201,148,42,0.65)' }}
      >
        ✦ &ldquo;La Eucaristía es mi autopista al cielo.&rdquo;
        <br />
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>— Beato Carlo Acutis</span>
      </p>
    </div>
  )
}
