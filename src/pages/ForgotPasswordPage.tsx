import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
    } catch {
      // siempre mostramos el mismo mensaje (no revelar si el correo existe)
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #1A3A6B 0%, #0F1B3D 100%)' }}
    >
      <div
        className="pointer-events-none fixed top-0 right-0 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(201,148,42,0.18) 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div className="mb-8 text-center relative z-10">
        <h1 className="text-3xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>Carlo</h1>
        <p className="text-sm" style={{ color: 'rgba(201,148,42,0.80)' }}>Sistema de catequesis</p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl p-6 relative z-10"
        style={{ background: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
      >
        <h2 className="text-xl font-bold mb-5" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>
          Recuperar contraseña
        </h2>

        {submitted ? (
          <div className="space-y-4">
            <div
              className="p-4 rounded-2xl text-sm"
              style={{ background: '#E8EEF8', color: '#1A3A6B' }}
            >
              Si el correo existe en el sistema, recibirás un enlace para restablecer tu contraseña.
            </div>
            <Link
              to="/login"
              className="block text-center text-sm font-bold"
              style={{ color: '#1A3A6B' }}
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="email" style={{ color: '#4A5568' }}>
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl px-4 text-base outline-none"
                style={{
                  height: 52,
                  border: '2px solid #E2E6EF',
                  background: '#F8F9FC',
                  color: '#1A2338',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#1A3A6B'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,58,107,0.10)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E2E6EF'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold text-base text-white rounded-2xl"
              style={{
                height: 52,
                background: 'linear-gradient(135deg, #1A3A6B, #2452A0)',
                boxShadow: '0 4px 16px rgba(26,58,107,0.30)',
                opacity: loading ? 0.65 : 1,
                border: 'none',
              }}
            >
              {loading ? 'Enviando…' : 'Enviar enlace'}
            </button>

            <Link
              to="/login"
              className="block text-center text-sm font-semibold"
              style={{ color: '#1A3A6B' }}
            >
              Volver al inicio de sesión
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
