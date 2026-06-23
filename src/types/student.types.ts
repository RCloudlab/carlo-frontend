export interface Student {
  id: string // UUID generado en cliente — inmutable, codificado en QR
  parish_id: string
  program_id: string
  program_name?: string
  full_name: string
  birth_date?: string
  guardian_name?: string
  guardian_phone?: string
  photo_url?: string
  is_active: boolean
  notes?: string
  created_at: string
  deleted_at?: string | null
  // Progreso de certificación (desde vista student_certification_progress)
  signatures_earned?: number
  required_signatures?: number
  completion_pct?: number
  is_certified?: boolean
}

export interface StudentCreate {
  id: string // Cliente provee — NO opcional
  program_id: string
  full_name: string
  birth_date?: string
  guardian_name?: string
  guardian_phone?: string
}
