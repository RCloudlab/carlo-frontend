// Punto único de generación de UUIDs en el proyecto.
// SIEMPRE importar desde aquí — NUNCA usar crypto.randomUUID() directamente
// (falla en HTTP y en iOS sin HTTPS).
import { v4 as uuidv4 } from 'uuid'

export { uuidv4 }
