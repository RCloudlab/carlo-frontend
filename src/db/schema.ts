import Dexie, { type Table } from 'dexie'

export interface PendingScan {
  id: string            // UUID del attendance_record — generado en cliente
  session_id: string
  student_id: string
  student_name: string  // para feedback offline sin necesitar red
  scanned_at: string    // ISO 8601 UTC — timestamp del dispositivo
  source: 'qr' | 'manual'
  sync_status: 'pending' | 'synced' | 'error'
  created_at: number    // Date.now() — para ordenar
}

class CarloOfflineDB extends Dexie {
  pending_scans!: Table<PendingScan>

  constructor() {
    super('carlo_offline')
    this.version(1).stores({
      // Índices: PK + campos de búsqueda frecuente
      pending_scans: 'id, session_id, student_id, sync_status, created_at',
    })
  }
}

export const db = new CarloOfflineDB()
