import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/session.store'
import { getStudentsInSession, type StudentInSession } from '../../services/session.service'

export default function StudentsListPage() {
  const navigate = useNavigate()
  const { activeSession } = useSessionStore()
  const [students, setStudents] = useState<StudentInSession[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activeSession) {
      navigate('/scan', { replace: true })
      return
    }
    async function load() {
      setIsLoading(true)
      try {
        const data = await getStudentsInSession(activeSession!.id)
        setStudents(data)
      } catch {
        setError('No se pudo cargar la lista de alumnos')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [activeSession, navigate])

  const filtered = useMemo(() => {
    if (!query.trim()) return students
    const q = query.toLowerCase()
    return students.filter((s) => s.full_name.toLowerCase().includes(q))
  }, [students, query])

  const presentCount = students.filter((s) => s.is_present).length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F9FC' }}>
        <p style={{ color: '#8E97AE' }}>Cargando alumnos…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8F9FC', maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 sticky top-0 z-10"
        style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E6EF' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/scan')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 38, height: 38, background: '#F1F3F8', border: 'none' }}
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>
              Alumnos
            </h1>
            {activeSession && (
              <p className="text-xs" style={{ color: '#8E97AE' }}>
                Sesión del {activeSession.session_date}
              </p>
            )}
          </div>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: '#E8EEF8', color: '#1A3A6B' }}
          >
            {presentCount}/{students.length}
          </span>
        </div>

        {/* Buscador */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#8E97AE" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Buscar alumno…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 text-sm rounded-xl outline-none"
            style={{
              height: 42,
              border: '2px solid #E2E6EF',
              background: '#F8F9FC',
              color: '#1A2338',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#1A3A6B'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,58,107,0.08)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E2E6EF'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 p-3 rounded-2xl text-sm font-semibold"
          style={{ background: '#FDECEA', color: '#C0271E' }}>
          {error}
        </div>
      )}

      {!activeSession && !isLoading && (
        <div className="mx-4 mt-6 p-5 rounded-2xl text-center"
          style={{ background: '#FFFFFF', border: '1px solid #E2E6EF' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: '#4A5568' }}>
            No hay una sesión activa
          </p>
          <button
            onClick={() => navigate('/scan')}
            className="text-sm font-bold px-5 py-2 rounded-xl"
            style={{ background: '#E8EEF8', color: '#1A3A6B' }}
          >
            Ir al inicio
          </button>
        </div>
      )}

      {/* Lista */}
      {students.length > 0 && (
        <ul className="flex-1 bg-white mt-2" style={{ borderTop: '1px solid #E2E6EF', borderBottom: '1px solid #E2E6EF' }}>
          {filtered.length === 0 && (
            <li className="p-6 text-center text-sm" style={{ color: '#8E97AE' }}>Sin resultados</li>
          )}

          {filtered.map((student, idx) => {
            const initials = student.full_name
              .split(' ')
              .slice(0, 2)
              .map((n) => n[0])
              .join('')

            return (
              <li
                key={student.id}
                className="flex items-center gap-3 px-4"
                style={{
                  minHeight: 60,
                  borderBottom: idx < filtered.length - 1 ? '1px solid #E2E6EF' : 'none',
                  background: student.is_present ? 'rgba(26,58,107,0.03)' : '#FFFFFF',
                }}
              >
                {/* Avatar */}
                <div
                  className="flex items-center justify-center rounded-full text-sm font-extrabold shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    background: student.is_present
                      ? 'linear-gradient(135deg, #1A3A6B, #2452A0)'
                      : 'linear-gradient(135deg, #E8EEF8, #F1F3F8)',
                    color: student.is_present ? '#FFFFFF' : '#8E97AE',
                  }}
                >
                  {student.is_present ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : initials}
                </div>

                {/* Nombre */}
                <span
                  className="flex-1 text-sm font-semibold"
                  style={{ color: student.is_present ? '#1A3A6B' : '#1A2338' }}
                >
                  {student.full_name}
                </span>

                {/* Badge */}
                {student.is_present ? (
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: '#E8EEF8', color: '#1A3A6B' }}
                  >
                    Presente
                  </span>
                ) : (
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: '#F8F9FC', color: '#8E97AE' }}
                  >
                    Pendiente
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {/* Pie */}
      <div
        className="p-4 text-center text-xs font-medium"
        style={{ background: '#FFFFFF', color: '#8E97AE', borderTop: '1px solid #E2E6EF' }}
      >
        {presentCount} de {students.length} presentes
      </div>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex"
        style={{ background: '#FFFFFF', borderTop: '1px solid #E2E6EF', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        <NavTab
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          }
          label="Escanear"
          onClick={() => navigate('/scan')}
        />
        <NavTab
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          }
          label="Alumnos"
          active
        />
      </nav>
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
