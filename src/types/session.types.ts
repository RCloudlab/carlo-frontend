export type SessionStatus = 'open' | 'closed' | 'reopened'

export interface MassSession {
  id: string // UUID generado en cliente al abrir la sesión
  parish_id: string
  program_id: string
  program_name?: string
  catechist_id: string
  catechist_name?: string
  session_date: string // YYYY-MM-DD
  started_at: string   // ISO 8601 con timezone
  closed_at?: string | null
  status: SessionStatus
  notes?: string
  attendance_count?: number
}

export interface MassSessionCreate {
  id: string // Cliente provee — generado con uuidv4() antes de abrir sesión
  program_id: string
  session_date: string
  started_at: string
}
