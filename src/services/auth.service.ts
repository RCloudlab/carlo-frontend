import { api } from './api'
import { useAuthStore } from '../store/auth.store'

export async function login(email: string, password: string): Promise<void> {
  // El backend responde con access_token en body y refresh_token como httpOnly cookie
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
    return false
  }
}
