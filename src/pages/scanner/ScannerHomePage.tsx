import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/session.store'
import { useAuthStore } from '../../store/auth.store'
import { getActiveSessions, createSession, closeSession } from '../../services/session.service'
import { logout } from '../../services/auth.service'
import { uuidv4 } from '../../utils/uuid'

export default function ScannerHomePage() {
  const navigate = useNavigate()
  const { activeSession, setActiveSession, setLoading, isLoading } = useSessionStore()
  const user = useAuthStore((s) => s.user)

  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [showSheet, setShowSheet] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10))
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const sessions = await getActiveSessions()
        setActiveSession(sessions[0] ?? null)
      } catch {
        setError('No se pudo cargar la sesión activa')
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleClose() {
    if (!activeSession) return
    try {
      await closeSession(activeSession.id)
      setActiveSession(null)
      setShowCloseConfirm(false)
    } catch {
      setError('No se pudo cerrar la sesión')
    }
  }

  async function handleCreateSession(dateOverride?: string) {
    if (creating) return
    setCreating(true)
    setError(null)
    const date = dateOverride ?? sessionDate
    try {
      const session = await createSession({
        id: uuidv4(),
        session_date: date,
        started_at: new Date().toISOString(),
      })
      setActiveSession(session)
      setShowSheet(false)
      navigate('/scan/qr')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        // Ya existe una sesión activa — recuperarla y abrir el escáner
        try {
          const sessions = await getActiveSessions()
          if (sessions[0]) {
            setActiveSession(sessions[0])
            setShowSheet(false)
            navigate('/scan/qr')
            return
          }
        } catch { /* si falla el GET, caemos al error genérico */ }
      }
      setError('No se pudo crear la sesión')
    } finally {
      setCreating(false)
    }
  }

  const today = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F9FC' }}>
        <p style={{ color: '#8E97AE' }}>Cargando…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8F9FC', maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E6EF' }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>
              Hola, {user?.full_name?.split(' ')[0] ?? 'Catequista'} 👋
            </h1>
            <p className="text-sm capitalize" style={{ color: '#8E97AE' }}>{today}</p>
          </div>
          <button
            onClick={async () => { await logout(); navigate('/login', { replace: true }) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: '#FDECEA', color: '#C0271E', border: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Salir
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 overflow-y-auto pb-24">

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: '#FDECEA', color: '#C0271E' }}>
            {error}
          </div>
        )}

        {/* CTA card */}
        <div
          className="rounded-3xl p-6 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1A3A6B 0%, #0F1B3D 100%)',
            border: '1px solid rgba(201,148,42,0.20)',
            boxShadow: '0 8px 24px rgba(26,58,107,0.25)',
          }}
        >
          {/* Destellos */}
          <div className="pointer-events-none absolute -top-10 -right-5 w-32 h-32 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,148,42,0.22) 0%, transparent 70%)' }} />
          <div className="pointer-events-none absolute -bottom-8 left-5 w-20 h-20 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(244,200,66,0.12) 0%, transparent 70%)' }} />

          <p className="text-xs font-bold mb-1 relative z-10" style={{ color: 'rgba(201,148,42,0.80)', letterSpacing: '0.05em' }}>
            ✦ San Carlo Acutis, ruega por nosotros
          </p>
          <h2 className="text-xl font-extrabold text-white mb-5 relative z-10" style={{ letterSpacing: '-0.01em' }}>
            {activeSession ? 'Sesión activa ahora' : 'Registra la asistencia de hoy'}
          </h2>

          {activeSession ? (
            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => navigate('/scan/qr')}
                className="flex items-center gap-2 px-5 font-bold text-white rounded-2xl"
                style={{
                  height: 48,
                  background: 'linear-gradient(135deg, #C9942A, #E8B84B)',
                  boxShadow: '0 4px 16px rgba(201,148,42,0.40)',
                  fontSize: 14,
                }}
              >
                <QrIcon /> Escanear QR
              </button>
              <button
                onClick={() => navigate(`/scan/manual?sessionId=${activeSession.id}`)}
                className="flex items-center gap-2 px-5 font-bold rounded-2xl"
                style={{
                  height: 48,
                  background: 'rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.20)',
                  fontSize: 14,
                }}
              >
                <ListIcon /> Lista manual
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 relative z-10">
              <button
                onClick={() => handleCreateSession()}
                disabled={creating}
                className="flex items-center gap-2 px-5 font-extrabold text-white rounded-2xl"
                style={{
                  height: 50,
                  background: 'linear-gradient(135deg, #C9942A, #E8B84B)',
                  boxShadow: '0 4px 16px rgba(201,148,42,0.40)',
                  fontSize: 15,
                  opacity: creating ? 0.65 : 1,
                }}
              >
                <PlusIcon /> {creating ? 'Abriendo…' : 'Abrir sesión de hoy'}
              </button>
              <button
                onClick={() => setShowSheet(true)}
                className="text-xs font-semibold underline text-center"
                style={{ color: 'rgba(255,255,255,0.55)', background: 'transparent', border: 'none' }}
              >
                Usar otra fecha
              </button>
            </div>
          )}
        </div>

        {/* Sesión activa — detalle */}
        {activeSession && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase mb-3" style={{ color: '#8E97AE', letterSpacing: '0.07em' }}>
              Sesión activa
            </p>
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: '#FFFFFF', border: '1px solid #E2E6EF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: '#E8EEF8' }}>
                <QrIcon color="#1A3A6B" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: '#1A2338' }}>
                  {activeSession.session_date}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#8E97AE' }}>
                  {activeSession.status === 'reopened' ? 'Reabierta' : 'Abierta'}
                </p>
              </div>
              <button
                onClick={() => setShowCloseConfirm(true)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl"
                style={{ color: '#C0271E', background: '#FDECEA' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex"
        style={{ background: '#FFFFFF', borderTop: '1px solid #E2E6EF', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        <NavTab icon={<QrIcon />} label="Escanear" active />
        <NavTab icon={<StudentsIcon />} label="Alumnos" onClick={() => navigate('/students')} />
      </nav>

      {/* Diálogo cierre de sesión */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(10,20,50,0.50)' }}>
          <div
            className="w-full max-w-sm rounded-t-3xl p-6 space-y-4"
            style={{ background: '#FFFFFF', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
          >
            <h2 className="text-lg font-extrabold" style={{ color: '#1A2338' }}>¿Cerrar sesión?</h2>
            <p className="text-sm" style={{ color: '#8E97AE' }}>
              Ya no podrás escanear en esta sesión. El coordinador puede reabrirla si es necesario.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 font-bold rounded-2xl"
                style={{ height: 50, border: '2px solid #E2E6EF', color: '#4A5568' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleClose}
                className="flex-1 font-bold text-white rounded-2xl"
                style={{ height: 50, background: '#C0271E' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom sheet — Nueva sesión */}
      {showSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(10,20,50,0.50)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSheet(false) }}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl px-5"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 -12px 40px rgba(0,0,0,0.18)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 36px)',
              animation: 'sheet-up 280ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Handle */}
            <div className="w-9 h-1 rounded-full mx-auto mt-3 mb-6" style={{ background: '#E2E6EF' }} />

            <div className="mb-6">
              <h3 className="text-xl font-extrabold" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>
                Nueva sesión de misa
              </h3>
              <p className="text-xs font-bold mt-1" style={{ color: '#C9942A' }}>
                ✦ Que cada firma cuente para el cielo
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>Fecha de la misa</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full rounded-2xl px-4 text-base outline-none"
                style={{
                  height: 52,
                  border: '2px solid #E2E6EF',
                  background: '#F8F9FC',
                  color: '#1A2338',
                }}
              />
            </div>

            <button
              onClick={handleCreateSession}
              disabled={creating}
              className="w-full font-extrabold text-white rounded-2xl"
              style={{
                height: 52,
                background: 'linear-gradient(135deg, #C9942A, #E8B84B)',
                boxShadow: '0 4px 16px rgba(201,148,42,0.40)',
                opacity: creating ? 0.65 : 1,
                fontSize: 16,
              }}
            >
              {creating ? 'Abriendo…' : '📷 Abrir escáner'}
            </button>

            <button
              onClick={() => setShowSheet(false)}
              className="w-full font-semibold mt-3"
              style={{ height: 46, color: '#8E97AE', background: 'transparent', border: 'none', fontSize: 15 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sheet-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function NavTab({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1 py-2"
      style={{ background: 'transparent', border: 'none' }}
    >
      <span style={{ color: active ? '#1A3A6B' : '#8E97AE' }}>{icon}</span>
      <span className="text-xs font-semibold" style={{ color: active ? '#1A3A6B' : '#8E97AE' }}>{label}</span>
      {active && <div className="w-1 h-1 rounded-full" style={{ background: '#C9942A' }} />}
    </button>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function QrIcon({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function StudentsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  )
}
