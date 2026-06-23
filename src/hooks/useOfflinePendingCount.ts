import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'

export function useOfflinePendingCount(): number {
  const count = useLiveQuery(
    () => db.pending_scans.where('sync_status').equals('pending').count(),
    [],
  )
  return count ?? 0
}
