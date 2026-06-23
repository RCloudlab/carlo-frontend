import { create } from 'zustand'

interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'catequista' | 'coordinador'
  parish_id: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, accessToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: (user, accessToken) => {
    sessionStorage.setItem('access_token', accessToken)
    set({ user, isAuthenticated: true })
  },
  clearAuth: () => {
    sessionStorage.removeItem('access_token')
    set({ user: null, isAuthenticated: false })
  },
}))
