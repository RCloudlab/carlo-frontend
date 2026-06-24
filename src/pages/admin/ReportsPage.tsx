import { useEffect, useState } from 'react'
import { getProgressReport, exportReportPdf, exportReportExcel, type ReportStudent, type ReportList } from '../../services/reports.service'
import { listPrograms, type Program } from '../../services/programs.service'

const PAGE_SIZE = 50

const STATUS_LABEL: Record<string, string> = {
  certificado: 'Certificado',
  en_camino: 'En camino',
  en_riesgo: 'En riesgo',
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    certificado: { bg: '#FDF5E0', color: '#C9942A' },
    en_camino:   { bg: '#E8EEF8', color: '#1A3A6B' },
    en_riesgo:   { bg: '#FDECEA', color: '#C0271E' },
  }
  const s = styles[status] ?? { bg: '#F1F3F8', color: '#8E97AE' }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.color }}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

function MiniProgress({ pct }: { pct: number }) {
  const clamped = Math.min(pct, 100)
  const color = clamped >= 100 ? '#C9942A' : clamped >= 70 ? '#1A3A6B' : '#C0271E'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: '#E2E6EF' }}>
        <div className="h-full rounded-full" style={{ width: `${clamped}%`, background: color }} />
      </div>
      <span className="text-xs w-10 text-right" style={{ color: '#8E97AE' }}>{pct.toFixed(0)}%</span>
    </div>
  )
}

export default function ReportsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [search, setSearch] = useState('')
  const [onlyAtRisk, setOnlyAtRisk] = useState(false)
  const [page, setPage] = useState(1)
  const [report, setReport] = useState<ReportList | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)

  const totalPages = report ? Math.max(1, Math.ceil(report.total / PAGE_SIZE)) : 1

  useEffect(() => {
    listPrograms(true).then((res) => setPrograms(res.items)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedProgram) { setReport(null); return }
    setLoading(true)
    setError(null)
    getProgressReport({
      program_id: selectedProgram,
      search: search || undefined,
      only_at_risk: onlyAtRisk || undefined,
      page,
      page_size: PAGE_SIZE,
    })
      .then(setReport)
      .catch(() => setError('Error al cargar el reporte'))
      .finally(() => setLoading(false))
  }, [selectedProgram, search, onlyAtRisk, page])

  const handleProgramChange = (v: string) => { setSelectedProgram(v); setSearch(''); setPage(1) }
  const handleSearchChange = (v: string) => { setSearch(v); setPage(1) }
  const handleAtRiskChange = (v: boolean) => { setOnlyAtRisk(v); setPage(1) }

  const displayed: ReportStudent[] = report?.items ?? []
  const programName = report?.program_name ?? programs.find((p) => p.id === selectedProgram)?.name ?? 'reporte'
  const exportFilters = { program_id: selectedProgram, search: search || undefined, only_at_risk: onlyAtRisk || undefined }

  const handleExportPdf = async () => {
    setExporting('pdf')
    try { await exportReportPdf(exportFilters, programName) }
    catch { alert('Error al exportar PDF') }
    finally { setExporting(null) }
  }

  const handleExportExcel = async () => {
    setExporting('excel')
    try { await exportReportExcel(exportFilters, programName) }
    catch { alert('Error al exportar Excel') }
    finally { setExporting(null) }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8F9FC' }}>
      <div className="max-w-6xl mx-auto p-4 lg:p-8">

        {/* Encabezado */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-extrabold" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>Reportes</h1>
          {selectedProgram && report && (
            <div className="flex gap-2">
              <button onClick={handleExportPdf} disabled={exporting !== null}
                className="flex items-center gap-2 px-4 text-sm font-bold rounded-2xl"
                style={{ height: 42, border: '2px solid #E2E6EF', color: '#4A5568', background: '#FFFFFF', opacity: exporting !== null ? 0.6 : 1 }}>
                {exporting === 'pdf' ? 'Generando…' : 'Exportar PDF'}
              </button>
              <button onClick={handleExportExcel} disabled={exporting !== null}
                className="flex items-center gap-2 px-4 text-sm font-bold text-white rounded-2xl"
                style={{ height: 42, background: 'linear-gradient(135deg, #1A3A6B, #2452A0)', boxShadow: '0 4px 12px rgba(26,58,107,0.25)', opacity: exporting !== null ? 0.6 : 1, border: 'none' }}>
                {exporting === 'excel' ? 'Generando…' : 'Exportar Excel'}
              </button>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center mb-5">
          <select value={selectedProgram} onChange={(e) => handleProgramChange(e.target.value)}
            className="rounded-2xl px-4 text-sm outline-none"
            style={{ height: 44, border: '2px solid #E2E6EF', background: '#FFFFFF', color: '#1A2338', minWidth: 220 }}>
            <option value="">Selecciona un programa…</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {selectedProgram && (
            <input type="text" value={search} onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar alumno…" className="rounded-2xl px-4 text-sm outline-none flex-1"
              style={{ height: 44, border: '2px solid #E2E6EF', background: '#FFFFFF', color: '#1A2338', minWidth: 160 }} />
          )}

          {selectedProgram && (
            <label className="flex items-center gap-2 cursor-pointer px-3" style={{ height: 44 }}>
              <input type="checkbox" checked={onlyAtRisk} onChange={(e) => handleAtRiskChange(e.target.checked)}
                className="w-4 h-4 rounded" style={{ accentColor: '#C0271E' }} />
              <span className="text-sm font-bold" style={{ color: '#C0271E' }}>Solo en riesgo</span>
            </label>
          )}
        </div>

        {/* Stats */}
        {report && !loading && (
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              { label: 'Total', value: report.total, accent: '#1A3A6B' },
              { label: 'Certificados', value: report.certified_count, accent: '#C9942A' },
              { label: 'En riesgo', value: report.at_risk_count, accent: '#C0271E' },
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-2xl px-5 py-4 text-center"
                style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderTop: `3px solid ${accent}` }}>
                <p className="text-3xl font-extrabold" style={{ color: accent, letterSpacing: '-0.03em' }}>{value}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: '#8E97AE' }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty states */}
        {!selectedProgram && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#E8EEF8' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A3A6B" strokeWidth="1.5">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <p className="text-base font-semibold" style={{ color: '#8E97AE' }}>Selecciona un programa para ver el reporte</p>
          </div>
        )}
        {selectedProgram && loading && <div className="text-center py-12" style={{ color: '#8E97AE' }}>Cargando reporte…</div>}
        {selectedProgram && error && <div className="text-center py-12 font-semibold" style={{ color: '#C0271E' }}>{error}</div>}
        {selectedProgram && !loading && !error && displayed.length === 0 && (
          <div className="text-center py-16">
            <p className="text-base font-semibold" style={{ color: '#8E97AE' }}>No hay alumnos en este programa</p>
          </div>
        )}

        {/* Tabla — md+ */}
        {!loading && !error && displayed.length > 0 && (
          <>
            <div className="hidden md:block rounded-2xl overflow-hidden"
              style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E2E6EF' }}>
              <table className="min-w-full text-sm">
                <thead style={{ background: '#F8F9FC', borderBottom: '1px solid #E2E6EF' }}>
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Nombre</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Firmas</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Req.</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em', minWidth: 140 }}>Avance</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((s, i) => (
                    <tr key={s.id} style={{
                      background: s.status === 'en_riesgo' ? 'rgba(192,39,30,0.04)' : s.status === 'certificado' ? 'rgba(201,148,42,0.04)' : '#FFFFFF',
                      borderTop: i > 0 ? '1px solid #E2E6EF' : 'none',
                    }}>
                      <td className="px-5 py-3 font-semibold" style={{ color: '#1A2338' }}>{s.full_name}</td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: '#1A2338' }}>{s.signatures_earned}</td>
                      <td className="px-4 py-3 text-right" style={{ color: '#8E97AE' }}>{s.required_signatures}</td>
                      <td className="px-4 py-3" style={{ minWidth: 140 }}><MiniProgress pct={s.completion_pct} /></td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas — mobile */}
            <div className="md:hidden space-y-3">
              {displayed.map((s) => (
                <div key={s.id} className="rounded-2xl p-4"
                  style={{
                    background: s.status === 'en_riesgo' ? 'rgba(192,39,30,0.04)' : s.status === 'certificado' ? 'rgba(201,148,42,0.04)' : '#FFFFFF',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                    border: '1px solid #E2E6EF',
                  }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-bold text-base" style={{ color: '#1A2338' }}>{s.full_name}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm" style={{ color: '#8E97AE' }}>Firmas:</span>
                    <span className="text-sm font-bold" style={{ color: '#1A2338' }}>{s.signatures_earned}</span>
                    <span className="text-sm" style={{ color: '#8E97AE' }}>/ {s.required_signatures}</span>
                  </div>
                  <MiniProgress pct={s.completion_pct} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Paginación */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="text-xs font-bold px-4 py-2 rounded-xl"
              style={{ border: '2px solid #E2E6EF', background: '#FFFFFF', color: page === 1 ? '#C5CCDA' : '#1A3A6B', cursor: page === 1 ? 'default' : 'pointer' }}>
              ← Anterior
            </button>
            <span className="text-xs font-semibold" style={{ color: '#8E97AE' }}>Página {page} de {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="text-xs font-bold px-4 py-2 rounded-xl"
              style={{ border: '2px solid #E2E6EF', background: '#FFFFFF', color: page === totalPages ? '#C5CCDA' : '#1A3A6B', cursor: page === totalPages ? 'default' : 'pointer' }}>
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
