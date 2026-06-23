import { api } from './api'

export interface AttendanceScanPayload {
  id: string
  student_uuid: string
  mass_session_id: string
  scanned_at: string
}

export type AttendanceScanStatus =
  | 'registered'
  | 'duplicate_session'
  | 'duplicate_day'
  | 'student_not_found'
  | 'session_not_active'

export interface AttendanceScanResult {
  status: AttendanceScanStatus
  student_name: string | null
}

export async function scanAttendance(payload: AttendanceScanPayload): Promise<AttendanceScanResult> {
  const { data } = await api.post<AttendanceScanResult>('/attendance/scan', payload)
  return data
}

// ── Sync offline batch ───────────────────────────────────────────────────────

export interface SyncRecord {
  id: string
  student_id: string
  scanned_at: string
  source: 'qr' | 'manual'
}

export type SyncRecordStatus = 'registered' | 'duplicate_record' | 'duplicate_day' | 'student_not_found'

export interface SyncRecordResult {
  record_id: string
  status: SyncRecordStatus
}

export interface SyncResponse {
  session_id: string
  summary: {
    registered: number
    duplicate_record: number
    duplicate_day: number
    student_not_found: number
  }
  results: SyncRecordResult[]
}

export async function syncBatch(session_id: string, records: SyncRecord[]): Promise<SyncResponse> {
  const { data } = await api.post<SyncResponse>('/attendance/sync', { session_id, records })
  return data
}

// ── Conflict log ─────────────────────────────────────────────────────────────

export interface ConflictLogEntry {
  id: string
  attempted_at: string
  conflict_type: string
  record_id: string
  student_id: string | null
  session_id: string | null
  catechist_name: string | null
  raw_payload: Record<string, unknown>
}

export interface ConflictLogList {
  items: ConflictLogEntry[]
  total: number
  page: number
  page_size: number
}

export interface ConflictLogFilters {
  conflict_type?: string
  page?: number
  page_size?: number
}

export async function getConflictLog(filters: ConflictLogFilters = {}): Promise<ConflictLogList> {
  const params = new URLSearchParams()
  if (filters.conflict_type) params.set('conflict_type', filters.conflict_type)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.page_size) params.set('page_size', String(filters.page_size))
  const { data } = await api.get<ConflictLogList>(`/attendance/conflicts?${params.toString()}`)
  return data
}
