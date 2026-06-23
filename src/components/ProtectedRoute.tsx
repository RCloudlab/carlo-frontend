import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  requiredRole?: 'catequista' | 'coordinador'
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredRole && user?.role !== requiredRole) {
    // Redirigir al home del rol real en lugar de /login para evitar loop
    return <Navigate to={user?.role === 'coordinador' ? '/admin' : '/scan'} replace />
  }

  return <>{children}</>
}
