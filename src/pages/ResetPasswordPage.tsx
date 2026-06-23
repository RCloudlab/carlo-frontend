import { useState, FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const fieldStyle = {
    height: 52,
    border: '2px solid #E2E6EF',
    background: '#F8F9FC',
    color: '#1A2338',
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#1A3A6B'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,58,107,0.10)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#E2E6EF'
    e.currentTarget.style.boxShadow = 'none'
  }

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-5"
        style={{ background: 'linear-gradient(160deg, #1A3A6B 0%, #0F1B3D 100%)' }}
      >
        <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
          <p className="text-sm mb-4" style={{ color: '#4A5568' }}>
            Este enlace ya no es válido. Solicita uno nuevo.
          </p>
          <Link
            to="/forgot-password"
            className="block text-center text-sm font-bold"
            style={{ color: '#1A3A6B' }}
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: password })
      setSuccess(true)
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          ? (err as { response: { data: { detail: string } } }).response.data.detail
          : 'Este enlace ya no es válido. Solicita uno nuevo.'
      setError(msg)
    } finally {
      setLoading(false)
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

      <div className="mb-8 text-center relative z-10">
        <h1 className="text-3xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>Carlo</h1>
        <p className="text-sm" style={{ color: 'rgba(201,148,42,0.80)' }}>Sistema de catequesis</p>
      </div>

      <div
        className="w-full max-w-sm rounded-3xl p-6 relative z-10"
        style={{ background: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
      >
        <h2 className="text-xl font-bold mb-5" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>
          Nueva contraseña
        </h2>

        {success ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl text-sm" style={{ background: '#E8EEF8', color: '#1A3A6B' }}>
              Contraseña actualizada correctamente. Ya puedes iniciar sesión.
            </div>
            <Link
              to="/login"
              className="block text-center font-bold text-base text-white rounded-2xl py-3"
              style={{ background: 'linear-gradient(135deg, #1A3A6B, #2452A0)', boxShadow: '0 4px 16px rgba(26,58,107,0.30)' }}
            >
              Ir al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="password" style={{ color: '#4A5568' }}>
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl px-4 text-base outline-none"
                style={fieldStyle}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="confirm" style={{ color: '#4A5568' }}>
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-2xl px-4 text-base outline-none"
                style={fieldStyle}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm font-semibold px-3 py-2 rounded-xl"
                style={{ color: '#C0271E', background: '#FDECEA' }}>
                {error}
              </p>
            )}

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
              {loading ? 'Guardando…' : 'Guardar contraseña'}
            </button>

            <Link
              to="/forgot-password"
              className="block text-center text-sm font-semibold"
              style={{ color: '#1A3A6B' }}
            >
              Solicitar un nuevo enlace
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
