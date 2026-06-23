import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // envía httpOnly cookie de refresh_token automáticamente
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)))
  failedQueue = []
}

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    const isRefreshEndpoint = original?.url?.includes('/auth/refresh')

    if (error.response?.status !== 401 || original._retry || isRefreshEndpoint) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true
    try {
      // El refresh_token viaja automáticamente como httpOnly cookie (withCredentials: true)
      const { data } = await api.post<{ access_token: string }>('/auth/refresh')
      sessionStorage.setItem('access_token', data.access_token)
      processQueue(null, data.access_token)
      original.headers.Authorization = `Bearer ${data.access_token}`
      return api(original)
    } catch (err) {
      processQueue(err, null)
      sessionStorage.removeItem('access_token')
      const { useAuthStore } = await import('../store/auth.store')
      useAuthStore.getState().clearAuth()
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  },
)
