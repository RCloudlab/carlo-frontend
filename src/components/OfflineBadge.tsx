import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { useOfflinePendingCount } from '../hooks/useOfflinePendingCount'

export default function OfflineBadge() {
  const { isOnline } = useNetworkStatus()
  const pendingCount = useOfflinePendingCount()

  // No mostrar si está online y no hay pendientes
  if (isOnline && pendingCount === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg min-h-[44px] min-w-[44px] justify-center"
      style={{ background: pendingCount > 0 ? '#F59E0B' : '#6B7280' }}
      role="status"
      aria-live="polite"
    >
      <span className="text-white text-sm font-bold leading-none">
        {!isOnline && pendingCount === 0 && 'Sin conexión'}
        {pendingCount > 0 && `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
      </span>
    </div>
  )
}
