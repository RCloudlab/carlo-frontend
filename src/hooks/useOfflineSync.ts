import { useCallback, useEffect, useRef, useState } from 'react'
import { getAllPendingScans, markAsSynced, markAsError } from '../db/offline-queue'
import { syncBatch } from '../services/attendance.service'
import { useNetworkStatus } from './useNetworkStatus'

export function useOfflineSync() {
  const { isOnline } = useNetworkStatus()
  const [isSyncing, setIsSyncing] = useState(false)
  const syncLock = useRef(false)

  const runSync = useCallback(async () => {
    if (syncLock.current) return
    syncLock.current = true
    setIsSyncing(true)

    try {
      const pending = await getAllPendingScans()
      if (pending.length === 0) return

      // Agrupar por session_id
      const bySession = new Map<string, typeof pending>()
      for (const scan of pending) {
        const group = bySession.get(scan.session_id) ?? []
        group.push(scan)
        bySession.set(scan.session_id, group)
      }

      // Enviar un batch por sesión
      for (const [session_id, scans] of bySession) {
        try {
          const response = await syncBatch(
            session_id,
            scans.map((s) => ({
              id: s.id,
              student_id: s.student_id,
              scanned_at: s.scanned_at,
              source: s.source,
            })),
          )

          for (const result of response.results) {
            if (
              result.status === 'registered' ||
              result.status === 'duplicate_record' ||
              result.status === 'duplicate_day'
            ) {
              await markAsSynced(result.record_id)
            } else if (result.status === 'student_not_found') {
              await markAsError(result.record_id)
            }
          }
        } catch {
          // Error de red — dejar como pending para reintento automático
          // Los UUIDs garantizan idempotencia en el siguiente intento
        }
      }
    } finally {
      syncLock.current = false
      setIsSyncing(false)
    }
  }, [])

  // Disparar sync al reconectarse
  useEffect(() => {
    if (isOnline) {
      runSync()
    }
  }, [isOnline, runSync])

  // También sincronizar al montar si ya hay conexión (ej. reload tras sesión offline)
  useEffect(() => {
    if (navigator.onLine) {
      runSync()
    }
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { isSyncing, runSync }
}
