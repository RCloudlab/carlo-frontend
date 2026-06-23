import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getStudentProfile,
  getAttendanceCalendar,
  downloadStudentQr,
  type StudentProfile,
  type AttendanceDay,
} from '../../services/students.service'

const TYPE_LABELS: Record<string, string> = {
  primera_comunion: 'Primera Comunión',
  confirmacion: 'Confirmación',
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function toLocalTimeStr(isoUtc: string): string {
  return new Date(isoUtc).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function AttendanceCalendarWidget({
  items,
  inscriptionDate,
}: {
  items: AttendanceDay[]
  inscriptionDate: string
}) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<AttendanceDay | null>(null)

  const signedDays = new Map<string, AttendanceDay>()
  for (const item of items) {
    // Usar scanned_at en hora local del dispositivo para determinar el día correcto
    const localDate = new Date(item.scanned_at)
    const localKey = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`
    signedDays.set(localKey, { ...item, day: localKey })
  }

  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDay = new Date(viewYear, viewMonth + 1, 0)
  const startOffset = firstDay.getDay()
  const inscriptionDt = new Date(inscriptionDate)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelected(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelected(null)
  }

  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const getCellStyle = (d: Date): { bg: string; color: string; cursor: string } => {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (signedDays.has(key)) return { bg: '#1A3A6B', color: '#FFFFFF', cursor: 'pointer' }
    const isSunday = d.getDay() === 0
    const isPast = d < today
    const afterInscription = d >= inscriptionDt
    if (isSunday && isPast && afterInscription) return { bg: 'rgba(192,39,30,0.12)', color: '#C0271E', cursor: 'default' }
    if (isSunday) return { bg: '#F1F3F8', color: '#8E97AE', cursor: 'default' }
    return { bg: 'transparent', color: '#C5CCDA', cursor: 'default' }
  }

  const handleDayClick = (d: Date) => {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const item = signedDays.get(key)
    if (item) setSelected(item === selected ? null : item)
  }

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()

  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-xl"
          style={{ background: '#F1F3F8', border: 'none' }}
          aria-label="Mes anterior"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h3 className="text-sm font-bold" style={{ color: '#1A2338' }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-xl"
          style={{ background: '#F1F3F8', border: 'none' }}
          aria-label="Mes siguiente"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-xs" style={{ color: '#8E97AE' }}>
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#1A3A6B' }} />
          Firma
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: '#8E97AE' }}>
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'rgba(192,39,30,0.25)' }} />
          Ausente
        </span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: '#8E97AE' }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`pad-${i}`} />
          const { bg, color, cursor } = getCellStyle(d)
          const todayRing = isToday(d)
          return (
            <button
              key={d.toISOString()}
              onClick={() => cursor === 'pointer' && handleDayClick(d)}
              className="aspect-square flex items-center justify-center text-xs font-medium rounded-full transition-opacity"
              style={{
                background: bg,
                color,
                cursor,
                border: todayRing ? '1.5px dashed #C9942A' : 'none',
                minHeight: 32,
              }}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>

      {/* Detail */}
      {selected && (
        <div className="mt-4 p-4 rounded-2xl" style={{ background: '#E8EEF8' }}>
          <p className="text-sm font-bold capitalize" style={{ color: '#1A3A6B' }}>
            {new Date(`${selected.day}T12:00:00`).toLocaleDateString('es-MX', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
          <p className="text-sm mt-1" style={{ color: '#3D4A5C' }}>
            {selected.source === 'manual' ? 'Registro manual' : 'Escaneo QR'} por{' '}
            <span className="font-semibold">{selected.catechist_name}</span>
            {' '}a las {toLocalTimeStr(selected.scanned_at)}
          </p>
          {selected.extra_count > 0 && (
            <p className="text-xs mt-1" style={{ color: '#8E97AE' }}>
              +{selected.extra_count} intento{selected.extra_count > 1 ? 's' : ''} adicional{selected.extra_count > 1 ? 'es' : ''} ese día
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.min(pct, 100)
  const isAtRisk = clamped < 70
  const isCertified = clamped >= 100
  const gradient = isCertified
    ? 'linear-gradient(90deg, #C9942A, #F4C842)'   // dorado — certificado
    : isAtRisk
    ? 'linear-gradient(90deg, #C0271E, #E03228)'   // rojo polo — en riesgo
    : 'linear-gradient(90deg, #1A3A6B, #2452A0)'   // azul marino — en camino

  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: 10, background: '#E2E6EF' }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${clamped}%`, background: gradient }}
      />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [calendarItems, setCalendarItems] = useState<AttendanceDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingQr, setDownloadingQr] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([getStudentProfile(id), getAttendanceCalendar(id)])
      .then(([prof, cal]) => {
        setProfile(prof)
        setCalendarItems(cal.items)
      })
      .catch(() => setError('Alumno no encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDownloadQr = async () => {
    if (!profile) return
    setDownloadingQr(true)
    try {
      await downloadStudentQr(profile.id, profile.full_name)
    } catch {
      alert('Error al descargar el QR')
    } finally {
      setDownloadingQr(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F9FC' }}>
        <p style={{ color: '#8E97AE' }}>Cargando…</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen p-4" style={{ background: '#F8F9FC' }}>
        <div className="max-w-2xl mx-auto pt-16 text-center">
          <p className="text-lg mb-4" style={{ color: '#C0271E' }}>{error ?? 'Error desconocido'}</p>
          <button
            onClick={() => navigate('/admin/students')}
            className="text-sm font-semibold"
            style={{ color: '#1A3A6B' }}
          >
            ← Volver a alumnos
          </button>
        </div>
      </div>
    )
  }

  const pct = profile.completion_pct
  const isAtRisk = pct < 70
  const isCertified = pct >= 100
  const initials = profile.full_name.split(' ').slice(0, 2).map((n) => n[0]).join('')
  const inscriptionDate = new Date(profile.created_at).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen pb-10" style={{ background: '#F8F9FC' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header pegajoso */}
        <div
          className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E6EF' }}
        >
          <button
            onClick={() => navigate('/admin/students')}
            className="w-10 h-10 flex items-center justify-center rounded-xl"
            style={{ background: '#F1F3F8', border: 'none' }}
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h1 className="text-lg font-extrabold flex-1" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>
            Expediente
          </h1>
          <button
            onClick={handleDownloadQr}
            disabled={downloadingQr}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold"
            style={{ background: '#E8EEF8', color: '#1A3A6B', border: 'none', opacity: downloadingQr ? 0.6 : 1 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloadingQr ? '…' : 'QR'}
          </button>
        </div>

        {/* Hero azul marino */}
        <div
          className="px-5 py-7 flex items-center gap-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1A3A6B, #0F1B3D)' }}
        >
          <div
            className="pointer-events-none absolute -top-8 -right-8 w-36 h-36 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,148,42,0.20) 0%, transparent 70%)' }}
          />
          {/* Avatar dorado */}
          <div
            className="flex items-center justify-center text-2xl font-extrabold text-white shrink-0 rounded-full relative z-10"
            style={{
              width: 68, height: 68,
              background: 'linear-gradient(135deg, #C9942A, #E8B84B)',
              border: '3px solid rgba(201,148,42,0.50)',
              boxShadow: '0 4px 16px rgba(201,148,42,0.30)',
            }}
          >
            {initials}
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-extrabold text-white" style={{ letterSpacing: '-0.01em' }}>
              {profile.full_name}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {TYPE_LABELS[profile.program_type] ?? profile.program_type}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(201,148,42,0.80)' }}>
              ✦ Inscrito: {inscriptionDate}
            </p>
          </div>
        </div>

        <div className="px-4 pt-4 space-y-4">

          {/* Progreso */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <p className="px-5 pt-4 pb-0 text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.07em' }}>
              Progreso de certificación
            </p>
            <div className="px-5 pb-5 pt-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-extrabold" style={{ color: '#1A2338', letterSpacing: '-0.03em' }}>
                  {profile.signatures_earned}
                  <span className="text-base font-normal ml-1" style={{ color: '#8E97AE' }}>
                    / {profile.required_signatures} firmas
                  </span>
                </span>
                {isCertified ? (
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: '#FDF5E0', color: '#C9942A', border: '1px solid rgba(201,148,42,0.25)' }}
                  >
                    ✦ Certificado
                  </span>
                ) : isAtRisk ? (
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: '#FDECEA', color: '#C0271E', border: '1px solid rgba(192,39,30,0.20)' }}
                  >
                    ⚠ En riesgo
                  </span>
                ) : null}
              </div>
              <ProgressBar pct={pct} />
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: '#8E97AE' }}>{pct.toFixed(1)}% completado</span>
                {!isCertified && (
                  <span className="text-xs" style={{ color: '#8E97AE' }}>
                    Faltan {profile.required_signatures - profile.signatures_earned} firmas
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Calendario */}
          <div>
            <p className="text-xs font-bold uppercase mb-3" style={{ color: '#8E97AE', letterSpacing: '0.07em' }}>
              Calendario de asistencia
            </p>
            <AttendanceCalendarWidget
              items={calendarItems}
              inscriptionDate={profile.created_at}
            />
          </div>

          {/* Información adicional */}
          {(profile.birth_date || profile.guardian_name || profile.guardian_phone || profile.notes) && (
            <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <p className="text-xs font-bold uppercase mb-4" style={{ color: '#8E97AE', letterSpacing: '0.07em' }}>
                Información del alumno
              </p>
              <dl className="grid grid-cols-2 gap-4">
                {profile.birth_date && (
                  <div>
                    <dt className="text-xs font-semibold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.04em' }}>Nacimiento</dt>
                    <dd className="mt-0.5 text-sm" style={{ color: '#1A2338' }}>{profile.birth_date}</dd>
                  </div>
                )}
                {profile.guardian_name && (
                  <div>
                    <dt className="text-xs font-semibold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.04em' }}>Tutor</dt>
                    <dd className="mt-0.5 text-sm" style={{ color: '#1A2338' }}>{profile.guardian_name}</dd>
                  </div>
                )}
                {profile.guardian_phone && (
                  <div>
                    <dt className="text-xs font-semibold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.04em' }}>Teléfono</dt>
                    <dd className="mt-0.5 text-sm" style={{ color: '#1A2338' }}>{profile.guardian_phone}</dd>
                  </div>
                )}
              </dl>
              {profile.notes && (
                <div className="mt-4">
                  <dt className="text-xs font-semibold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.04em' }}>Notas</dt>
                  <dd className="mt-1 text-sm whitespace-pre-wrap" style={{ color: '#1A2338' }}>{profile.notes}</dd>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
