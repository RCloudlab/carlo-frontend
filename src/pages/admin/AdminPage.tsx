import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { api } from '../../services/api'

interface AdminStats {
  total_students: number
  at_risk_count: number
  avg_compliance_pct: number
  pending_sync_count: number
}

function StatCard({
  label,
  value,
  sub,
  accent,
  onClick,
}: {
  label: string
  value: string | number
  sub?: string
  accent: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 text-left rounded-2xl p-5 transition-opacity"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        borderTop: `3px solid ${accent}`,
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid #E2E6EF`,
        borderTopColor: accent,
        borderTopWidth: 3,
        minWidth: 140,
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.opacity = '0.85' }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
    >
      <p
        className="text-3xl font-extrabold"
        style={{ color: accent, letterSpacing: '-0.03em' }}
      >
        {value}
      </p>
      <p className="text-sm font-semibold mt-0.5" style={{ color: '#1A2338' }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: '#8E97AE' }}>{sub}</p>}
    </button>
  )
}

export default function AdminPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<AdminStats>('/reports/admin/stats')
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  })()

  const firstName = user?.full_name?.split(' ')[0] ?? 'Coordinador'

  return (
    <div className="min-h-screen" style={{ background: '#F8F9FC' }}>

      {/* Hero */}
      <div
        className="px-6 pt-8 pb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1A3A6B 0%, #0F1B3D 100%)' }}
      >
        <div
          className="pointer-events-none absolute -top-10 -right-8 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,148,42,0.20) 0%, transparent 70%)' }}
        />
        <p className="text-xs font-bold mb-1 relative z-10" style={{ color: 'rgba(201,148,42,0.80)', letterSpacing: '0.05em' }}>
          ✦ PANEL DE COORDINACIÓN
        </p>
        <h1
          className="text-2xl font-extrabold text-white relative z-10"
          style={{ letterSpacing: '-0.01em' }}
        >
          {greeting}, {firstName}
        </h1>
        <p className="text-sm mt-1 relative z-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">

        {/* Stats */}
        <div>
          <p className="text-xs font-bold uppercase mb-3" style={{ color: '#8E97AE', letterSpacing: '0.07em' }}>
            Resumen general
          </p>
          {loading ? (
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 rounded-2xl p-5 animate-pulse"
                  style={{ background: '#E2E6EF', height: 100 }}
                />
              ))}
            </div>
          ) : stats ? (
            <div className="flex flex-wrap gap-3">
              <StatCard
                label="Alumnos activos"
                value={stats.total_students}
                accent="#1A3A6B"
              />
              <StatCard
                label="En riesgo"
                value={stats.at_risk_count}
                sub="< 70% de asistencia"
                accent="#C0271E"
                onClick={() => navigate('/admin/reports')}
              />
              <StatCard
                label="Cumplimiento prom."
                value={`${stats.avg_compliance_pct}%`}
                accent="#C9942A"
              />
            </div>
          ) : (
            <div
              className="rounded-2xl p-4 text-sm"
              style={{ background: '#FDECEA', color: '#C0271E' }}
            >
              No se pudieron cargar las estadísticas
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div>
          <p className="text-xs font-bold uppercase mb-3" style={{ color: '#8E97AE', letterSpacing: '0.07em' }}>
            Acciones rápidas
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              {
                label: 'Ver alumnos',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                path: '/admin/students',
                accent: '#1A3A6B',
                bg: '#E8EEF8',
              },
              {
                label: 'Reportes',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                ),
                path: '/admin/reports',
                accent: '#C9942A',
                bg: '#FDF5E0',
              },
              {
                label: 'Programas',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                ),
                path: '/admin/programs',
                accent: '#2452A0',
                bg: '#E8EEF8',
              },
              {
                label: 'Catequistas',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ),
                path: '/admin/catequistas',
                accent: '#3B5998',
                bg: '#E8EEF8',
              },
              {
                label: 'Log conflictos',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ),
                path: '/admin/conflicts',
                accent: '#C0271E',
                bg: '#FDECEA',
              },
            ].map(({ label, icon, path, accent, bg }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity"
                style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E2E6EF' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: bg, color: accent }}
                >
                  {icon}
                </div>
                <span className="text-sm font-bold" style={{ color: '#1A2338' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cita de Carlo */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1A3A6B, #0F1B3D)', border: '1px solid rgba(201,148,42,0.20)' }}
        >
          <div
            className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,148,42,0.18) 0%, transparent 70%)' }}
          />
          <p className="text-sm italic text-white relative z-10 leading-relaxed">
            &ldquo;La Eucaristía es mi autopista al cielo.&rdquo;
          </p>
          <p className="text-xs mt-2 relative z-10" style={{ color: 'rgba(201,148,42,0.70)' }}>
            — Beato Carlo Acutis
          </p>
        </div>
      </div>
    </div>
  )
}
