export type AttendanceSource = 'qr' | 'manual'
export type SyncStatus = 'pending' | 'synced' | 'error'

// Registro en backend
export interface AttendanceRecord {
  id: string // UUID generado en cliente en el momento del escaneo
  session_id: string
  student_id: string
  scanned_by: string
  scanned_at: string   // ISO 8601 con timezone — timestamp del dispositivo
  source: AttendanceSource
  synced_at?: string | null // NULL = llegó online; NOT NULL = vino del sync offline
}

// Registro en IndexedDB (cola offline)
export interface PendingAttendanceRecord {
  id: string
  session_id: string
  student_id: string
  student_name?: string // para mostrar feedback sin necesitar red
  scanned_at: string
  source: AttendanceSource
  sync_status: SyncStatus
  created_locally_at: string
}

export type ScanResultStatus =
  | 'registered'
  | 'duplicate_record'
  | 'duplicate_day'
  | 'student_not_found'
  | 'unknown_qr'

export interface ScanResult {
  status: ScanResultStatus
  student?: {
    id: string
    full_name: string
    signatures_earned?: number
    required_signatures?: number
    completion_pct?: number
  }
  message?: string
  first_scan_at?: string
}
