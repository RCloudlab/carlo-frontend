import { v4 as uuidv4 } from 'uuid'
import { api } from './api'

export interface Student {
  id: string
  parish_id: string
  program_id: string
  full_name: string
  birth_date: string | null
  guardian_name: string | null
  guardian_phone: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  deleted_at: string | null
}

export interface StudentList {
  items: Student[]
  total: number
}

export interface StudentCreate {
  full_name: string
  program_id: string
  birth_date?: string
  guardian_name?: string
  guardian_phone?: string
  notes?: string
}

export interface StudentUpdate {
  full_name?: string
  birth_date?: string | null
  guardian_name?: string | null
  guardian_phone?: string | null
  notes?: string | null
}

export interface StudentListFilters {
  program_id?: string
  search?: string
  active_only?: boolean
  page?: number
  page_size?: number
}

export async function listStudents(filters: StudentListFilters = {}): Promise<StudentList> {
  const params = new URLSearchParams()
  if (filters.program_id) params.set('program_id', filters.program_id)
  if (filters.search) params.set('search', filters.search)
  if (filters.active_only !== undefined) params.set('active_only', String(filters.active_only))
  if (filters.page !== undefined) params.set('page', String(filters.page))
  if (filters.page_size !== undefined) params.set('page_size', String(filters.page_size))
  const { data } = await api.get<StudentList>(`/students?${params.toString()}`)
  return data
}

export async function getStudent(id: string): Promise<Student> {
  const { data } = await api.get<Student>(`/students/${id}`)
  return data
}

export async function createStudent(payload: StudentCreate): Promise<Student> {
  const body = { id: uuidv4(), ...payload }
  const { data } = await api.post<Student>('/students', body)
  return data
}

export async function updateStudent(id: string, payload: StudentUpdate): Promise<Student> {
  const { data } = await api.patch<Student>(`/students/${id}`, payload)
  return data
}

export async function deactivateStudent(id: string): Promise<Student> {
  const { data } = await api.delete<Student>(`/students/${id}`)
  return data
}

export interface StudentProfile {
  id: string
  full_name: string
  program_id: string
  program_name: string
  program_type: string
  required_signatures: number
  signatures_earned: number
  completion_pct: number
  is_certified: boolean
  birth_date: string | null
  guardian_name: string | null
  guardian_phone: string | null
  notes: string | null
  created_at: string
}

export async function getStudentProfile(studentId: string): Promise<StudentProfile> {
  const { data } = await api.get<StudentProfile>(`/students/${studentId}/profile`)
  return data
}

export interface AttendanceDay {
  day: string          // 'YYYY-MM-DD'
  catechist_name: string
  scanned_at: string   // ISO datetime UTC
  source: 'qr' | 'manual'
  extra_count: number
}

export interface AttendanceCalendar {
  items: AttendanceDay[]
  student_id: string
}

export async function getAttendanceCalendar(studentId: string): Promise<AttendanceCalendar> {
  const { data } = await api.get<AttendanceCalendar>(`/students/${studentId}/attendance-calendar`)
  return data
}

export async function downloadStudentQr(studentId: string, studentName: string): Promise<void> {
  const response = await api.get(`/students/${studentId}/qr`, { responseType: 'blob' })
  const url = URL.createObjectURL(response.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `qr-${studentName.replace(/\s+/g, '-')}.png`
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadStudentQrBatch(studentIds: string[]): Promise<void> {
  const response = await api.post('/students/qr-batch', studentIds, { responseType: 'blob' })
  const url = URL.createObjectURL(response.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'qr-alumnos.zip'
  a.click()
  URL.revokeObjectURL(url)
}
