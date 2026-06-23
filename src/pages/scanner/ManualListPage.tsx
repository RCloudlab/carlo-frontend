import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  getStudentsInSession,
  registerManualAttendance,
  type StudentInSession,
} from '../../services/session.service'
import { uuidv4 } from '../../utils/uuid'
import { addPendingScan, isAlreadyScannedLocally } from '../../db/offline-queue'

export default function ManualListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId') ?? ''

  const [students, setStudents] = useState<StudentInSession[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      navigate('/scan', { replace: true })
      return
    }
    async function load() {
      setIsLoading(true)
      try {
        const data = await getStudentsInSession(sessionId)
        setStudents(data)
      } catch {
        setError('No se pudo cargar la lista de alumnos')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [sessionId, navigate])

  const filtered = useMemo(() => {
    if (!query.trim()) return students
    const q = query.toLowerCase()
    return students.filter((s) => s.full_name.toLowerCase().includes(q))
  }, [students, query])

  async function handleMark(student: StudentInSession) {
    if (student.is_present || pendingId === student.id) return

    const alreadyLocal = await isAlreadyScannedLocally(sessionId, student.id)
    if (alreadyLocal) {
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, is_present: true } : s)),
      )
      return
    }

    setPendingId(student.id)
    const attendanceId = uuidv4()
    const scannedAt = new Date().toISOString()
    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id ? { ...s, is_present: true, attendance_id: attendanceId } : s,
      ),
    )

    if (!navigator.onLine) {
      await addPendingScan({
        id: attendanceId,
        session_id: sessionId,
        student_id: student.id,
        student_name: student.full_name,
        scanned_at: scannedAt,
        source: 'manual',
      })
      setPendingId(null)
      return
    }

    try {
      await registerManualAttendance(sessionId, {
        id: attendanceId,
        student_id: student.id,
        scanned_at: scannedAt,
      })
    } catch {
      await addPendingScan({
        id: attendanceId,
        session_id: sessionId,
        student_id: student.id,
        student_name: student.full_name,
        scanned_at: scannedAt,
        source: 'manual',
      })
    } finally {
      setPendingId(null)
    }
  }

  const presentCount = students.filter((s) => s.is_present).length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F9FC' }}>
        <p style={{ color: '#8E97AE' }}>Cargando lista…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8F9FC' }}>

      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 sticky top-0 z-10"
        style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E6EF' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/scan')}
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 38, height: 38,
              background: '#F1F3F8',
              border: 'none',
            }}
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>
              Lista Manual
            </h1>
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

      {/* Lista */}
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
            <li key={student.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #E2E6EF' : 'none' }}>
              <button
                onClick={() => handleMark(student)}
                disabled={student.is_present}
                className="w-full flex items-center gap-3 px-4 text-left transition-colors"
                style={{
                  minHeight: 60,
                  background: student.is_present ? 'rgba(26,58,107,0.03)' : '#FFFFFF',
                  border: 'none',
                  cursor: student.is_present ? 'default' : 'pointer',
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

                {/* Badge de estado */}
                {pendingId === student.id && !student.is_present ? (
                  <span className="text-xs" style={{ color: '#8E97AE' }}>…</span>
                ) : student.is_present ? (
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: '#E8EEF8', color: '#1A3A6B' }}
                  >
                    Presente
                  </span>
                ) : (
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: '#FDF5E0', color: '#C9942A' }}
                  >
                    Manual
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {/* Pie */}
      <div
        className="p-4 text-center text-xs font-medium sticky bottom-0"
        style={{ background: '#FFFFFF', color: '#8E97AE', borderTop: '1px solid #E2E6EF' }}
      >
        {presentCount} de {students.length} presentes
      </div>
    </div>
  )
}
