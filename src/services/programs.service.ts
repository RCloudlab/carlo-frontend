import { api } from './api'

export type ProgramType = 'primera_comunion' | 'confirmacion'

export interface Program {
  id: string
  parish_id: string
  name: string
  type: ProgramType
  required_signatures: number
  academic_year: number
  start_date: string
  end_date: string
  is_active: boolean
}

export interface ProgramList {
  items: Program[]
  total: number
}

export interface ProgramCreate {
  name: string
  type: ProgramType
  required_signatures: number
  academic_year: number
  start_date: string
  end_date: string
}

export interface ProgramUpdate {
  name?: string
  required_signatures?: number
  start_date?: string
  end_date?: string
  is_active?: boolean
}

export async function listPrograms(activeOnly = false): Promise<ProgramList> {
  const params = activeOnly ? '?active_only=true' : ''
  const { data } = await api.get<ProgramList>(`/programs/all${params}`)
  return data
}

export async function getProgram(id: string): Promise<Program> {
  const { data } = await api.get<Program>(`/programs/${id}`)
  return data
}

export async function createProgram(payload: ProgramCreate): Promise<Program> {
  const { data } = await api.post<Program>('/programs', payload)
  return data
}

export async function updateProgram(id: string, payload: ProgramUpdate): Promise<Program> {
  const { data } = await api.patch<Program>(`/programs/${id}`, payload)
  return data
}

export async function deactivateProgram(id: string): Promise<Program> {
  const { data } = await api.delete<Program>(`/programs/${id}`)
  return data
}

export async function downloadQrLabels(programId: string, programName: string): Promise<void> {
  const response = await api.get(`/programs/${programId}/qr-labels`, { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `qr-labels-${programName.replace(/[^\w\-]/g, '-')}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
