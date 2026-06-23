import { db, type PendingScan } from './schema'

export type { PendingScan }

export async function addPendingScan(record: Omit<PendingScan, 'sync_status' | 'created_at'>): Promise<void> {
  await db.pending_scans.add({
    ...record,
    sync_status: 'pending',
    created_at: Date.now(),
  })
}

export async function isAlreadyScannedLocally(session_id: string, student_id: string): Promise<boolean> {
  const count = await db.pending_scans
    .where({ session_id, student_id })
    .count()
  return count > 0
}

export async function getPendingScans(session_id: string): Promise<PendingScan[]> {
  return db.pending_scans
    .where('session_id')
    .equals(session_id)
    .and((r) => r.sync_status === 'pending')
    .sortBy('created_at')
}

export async function getAllPendingScans(): Promise<PendingScan[]> {
  return db.pending_scans
    .where('sync_status')
    .equals('pending')
    .sortBy('created_at')
}

export async function markAsSynced(id: string): Promise<void> {
  await db.pending_scans.update(id, { sync_status: 'synced' })
}

export async function markAsError(id: string): Promise<void> {
  await db.pending_scans.update(id, { sync_status: 'error' })
}

export async function getPendingCount(): Promise<number> {
  return db.pending_scans.where('sync_status').equals('pending').count()
}
