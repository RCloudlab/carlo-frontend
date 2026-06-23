import { api } from './api'
import type { Program, MassSession } from '../store/session.store'

export interface MassSessionCreate {
  id: string
  program_id?: string
  session_date: string
  started_at: string
}

export interface StudentInSession {
  id: string
  full_name: string
  is_present: boolean
  attendance_id: string | null
}

export interface ManualAttendanceCreate {
  id: string
  student_id: string
  scanned_at: string
}

export async function getPrograms(): Promise<Program[]> {
  const { data } = await api.get<Program[]>('/programs')
  return data
}

export async function createSession(payload: MassSessionCreate): Promise<MassSession> {
  const { data } = await api.post<MassSession>('/sessions', payload)
  return data
}

export async function getActiveSessions(): Promise<MassSession[]> {
  const { data } = await api.get<MassSession[]>('/sessions/active')
  return data
}

export async function closeSession(sessionId: string): Promise<MassSession> {
  const { data } = await api.patch<MassSession>(`/sessions/${sessionId}/close`)
  return data
}

export async function reopenSession(sessionId: string): Promise<MassSession> {
  const { data } = await api.patch<MassSession>(`/sessions/${sessionId}/reopen`)
  return data
}

export async function getStudentsInSession(sessionId: string): Promise<StudentInSession[]> {
  const { data } = await api.get<StudentInSession[]>(`/sessions/${sessionId}/students`)
  return data
}

export async function registerManualAttendance(
  sessionId: string,
  payload: ManualAttendanceCreate,
): Promise<void> {
  await api.post(`/sessions/${sessionId}/attendance/manual`, payload)
}
