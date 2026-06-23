import { create } from 'zustand'

export interface Program {
  id: string
  parish_id: string
  name: string
  type: string
  required_signatures: number
  academic_year: number
  is_active: boolean
}

export interface MassSession {
  id: string
  parish_id: string
  program_id: string
  catechist_id: string
  session_date: string
  started_at: string
  closed_at: string | null
  status: 'open' | 'closed' | 'reopened'
  notes: string | null
}

interface SessionState {
  activeSession: MassSession | null
  programs: Program[]
  isLoading: boolean
  setActiveSession: (session: MassSession | null) => void
  setPrograms: (programs: Program[]) => void
  setLoading: (loading: boolean) => void
  clearSession: () => void
}

// session.store NO persiste — se reconstruye desde API al iniciar
export const useSessionStore = create<SessionState>((set) => ({
  activeSession: null,
  programs: [],
  isLoading: false,
  setActiveSession: (session) => set({ activeSession: session }),
  setPrograms: (programs) => set({ programs }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearSession: () => set({ activeSession: null }),
}))
