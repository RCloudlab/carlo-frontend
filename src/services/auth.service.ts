import { api } from './api'
import { useAuthStore } from '../store/auth.store'

export async function login(email: string, password: string): Promise<void> {
  // Limpiar estado de sesión anterior antes de autenticar con nueva cuenta
  useAuthStore.getState().clearAuth()

  // El backend responde con access_token en body y refresh_token como httpOnly cookie
  // El backend también invalida cualquier cookie previa en /login
  const { data: tokenData } = await api.post<{ access_token: string }>('/auth/login', {
    email,
    password,
  })
  const { data: user } = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  useAuthStore.getState().setAuth(user, tokenData.access_token)
}

export async function logout(): Promise<void> {
  try {
    // El backend invalida la httpOnly cookie del refresh_token
    await api.post('/auth/logout')
  } finally {
    useAuthStore.getState().clearAuth()
  }
}

export async function tryRestoreSession(): Promise<boolean> {
  try {
    // La cookie httpOnly se envía automáticamente (withCredentials: true)
    const { data: tokenData } = await api.post<{ access_token: string }>('/auth/refresh')
    const { data: user } = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    useAuthStore.getState().setAuth(user, tokenData.access_token)
    return true
  } catch {
    // Cookie inválida o expirada — limpiar cualquier estado residual
    useAuthStore.getState().clearAuth()
    return false
  }
}
