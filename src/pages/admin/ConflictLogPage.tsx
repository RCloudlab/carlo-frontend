import { useEffect, useState } from 'react'
import { getConflictLog, type ConflictLogEntry, type ConflictLogList } from '../../services/attendance.service'

const CONFLICT_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'duplicate_day', label: 'Duplicado del día' },
  { value: 'student_not_found', label: 'Alumno no encontrado' },
]

const LABELS: Record<string, string> = {
  duplicate_day: 'Duplicado del día',
  student_not_found: 'Alumno no encontrado',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
}

function ConflictBadge({ type }: { type: string }) {
  const s = type === 'duplicate_day'
    ? { background: '#FDF5E0', color: '#C9942A' }
    : { background: '#FDECEA', color: '#C0271E' }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={s}>
      {LABELS[type] ?? type}
    </span>
  )
}

export default function ConflictLogPage() {
  const [conflictType, setConflictType] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<ConflictLogList | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const PAGE_SIZE = 50

  useEffect(() => {
    setLoading(true)
    setError(null)
    getConflictLog({ conflict_type: conflictType || undefined, page, page_size: PAGE_SIZE })
      .then(setData)
      .catch(() => setError('Error al cargar el log de conflictos'))
      .finally(() => setLoading(false))
  }, [conflictType, page])

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: '#F8F9FC' }}>
      <div className="max-w-5xl mx-auto">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-extrabold" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>Log de conflictos</h1>
          {data && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: '#FDECEA', color: '#C0271E' }}>
              {data.total} conflicto{data.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-5">
          <label className="text-sm font-bold" style={{ color: '#4A5568' }}>Tipo:</label>
          <select value={conflictType} onChange={(e) => { setConflictType(e.target.value); setPage(1) }}
            className="rounded-2xl px-4 text-sm outline-none"
            style={{ height: 42, border: '2px solid #E2E6EF', background: '#FFFFFF', color: '#1A2338' }}>
            {CONFLICT_TYPES.map((ct) => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
          </select>
        </div>

        {loading && <div className="text-center py-12" style={{ color: '#8E97AE' }}>Cargando…</div>}
        {error && <div className="rounded-2xl p-4 text-sm font-semibold" style={{ background: '#FDECEA', color: '#C0271E' }}>{error}</div>}

        {!loading && !error && data && data.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#E8EEF8' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3A6B" strokeWidth="1.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p className="text-base font-semibold" style={{ color: '#8E97AE' }}>Sin conflictos registrados</p>
            <p className="text-sm" style={{ color: '#8E97AE' }}>Los conflictos de sync aparecerán aquí cuando ocurran</p>
          </div>
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <>
            {/* Tabla — md+ */}
            <div className="hidden md:block rounded-2xl overflow-hidden mb-4"
              style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E2E6EF' }}>
              <table className="min-w-full text-sm">
                <thead style={{ background: '#F8F9FC', borderBottom: '1px solid #E2E6EF' }}>
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Catequista</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>UUID</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((entry: ConflictLogEntry, i: number) => (
                    <tr key={entry.id} style={{ borderTop: i > 0 ? '1px solid #E2E6EF' : 'none' }}>
                      <td className="px-5 py-3 whitespace-nowrap" style={{ color: '#4A5568' }}>{formatDate(entry.attempted_at)}</td>
                      <td className="px-4 py-3" style={{ color: '#1A2338', fontWeight: 500 }}>
                        {entry.catechist_name ?? <span style={{ color: '#8E97AE', fontStyle: 'italic' }}>Desconocido</span>}
                      </td>
                      <td className="px-4 py-3"><ConflictBadge type={entry.conflict_type} /></td>
                      <td className="px-4 py-3 font-mono text-xs break-all" style={{ color: '#8E97AE' }}>{entry.record_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas — mobile */}
            <div className="md:hidden space-y-3 mb-4">
              {data.items.map((entry: ConflictLogEntry) => (
                <div key={entry.id} className="rounded-2xl p-4"
                  style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E2E6EF' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold" style={{ color: '#1A2338' }}>
                      {entry.catechist_name ?? <span style={{ color: '#8E97AE', fontStyle: 'italic' }}>Desconocido</span>}
                    </p>
                    <ConflictBadge type={entry.conflict_type} />
                  </div>
                  <p className="text-xs mb-1" style={{ color: '#4A5568' }}>{formatDate(entry.attempted_at)}</p>
                  <p className="font-mono text-xs break-all" style={{ color: '#8E97AE' }}>{entry.record_id}</p>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 text-sm font-bold rounded-2xl"
                  style={{ height: 40, border: '2px solid #E2E6EF', background: '#FFFFFF', color: '#4A5568', opacity: page === 1 ? 0.4 : 1 }}>
                  Anterior
                </button>
                <span className="text-sm font-semibold" style={{ color: '#8E97AE' }}>{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 text-sm font-bold rounded-2xl"
                  style={{ height: 40, border: '2px solid #E2E6EF', background: '#FFFFFF', color: '#4A5568', opacity: page === totalPages ? 0.4 : 1 }}>
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
