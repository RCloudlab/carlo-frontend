import { api } from './api'

export type ReportStatus = 'certificado' | 'en_riesgo' | 'en_camino'

export interface ReportStudent {
  id: string
  full_name: string
  program_name: string
  required_signatures: number
  signatures_earned: number
  completion_pct: number
  is_certified: boolean
  status: ReportStatus
}

export interface ReportList {
  items: ReportStudent[]
  total: number
  program_name: string | null
  at_risk_count: number
  certified_count: number
}

export interface ReportFilters {
  program_id: string
  search?: string
  only_at_risk?: boolean
  page?: number
  page_size?: number
}

function buildParams(filters: ReportFilters): URLSearchParams {
  const params = new URLSearchParams({ program_id: filters.program_id })
  if (filters.search) params.set('search', filters.search)
  if (filters.only_at_risk) params.set('only_at_risk', 'true')
  if (filters.page !== undefined) params.set('page', String(filters.page))
  if (filters.page_size !== undefined) params.set('page_size', String(filters.page_size))
  return params
}

export async function getProgressReport(filters: ReportFilters): Promise<ReportList> {
  const { data } = await api.get<ReportList>(`/reports/progress?${buildParams(filters).toString()}`)
  return data
}

async function _downloadExport(path: string, filters: ReportFilters, filename: string): Promise<void> {
  const response = await api.get(`${path}?${buildParams(filters).toString()}`, { responseType: 'blob' })
  const url = URL.createObjectURL(response.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportReportPdf(filters: ReportFilters, programName: string): Promise<void> {
  const safeName = programName.replace(/[^\w\-]/g, '-')
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  await _downloadExport('/reports/export/pdf', filters, `reporte-${safeName}-${fecha}.pdf`)
}

export async function exportReportExcel(filters: ReportFilters, programName: string): Promise<void> {
  const safeName = programName.replace(/[^\w\-]/g, '-')
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  await _downloadExport('/reports/export/excel', filters, `reporte-${safeName}-${fecha}.xlsx`)
}
