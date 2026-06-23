import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/session.store'
import { getPrograms, createSession } from '../../services/session.service'
import { uuidv4 } from '../../utils/uuid'

export default function NewSessionPage() {
  const navigate = useNavigate()
  const { programs, setPrograms, setActiveSession } = useSessionStore()
  const [selectedProgram, setSelectedProgram] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (programs.length === 0) {
      getPrograms().then(setPrograms).catch(() => setError('No se pudieron cargar los programas'))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProgram) return
    setIsSubmitting(true)
    setError(null)
    try {
      const session = await createSession({
        id: uuidv4(),
        program_id: selectedProgram,
        session_date: sessionDate,
        started_at: new Date().toISOString(),
      })
      setActiveSession(session)
      navigate('/scan', { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { detail?: string } } })?.response?.status
      if (status === 409) {
        setError('Ya tienes una sesión abierta para este programa hoy')
      } else {
        setError('No se pudo crear la sesión. Intenta de nuevo.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 text-sm font-medium min-h-[44px] flex items-center"
      >
        ← Volver
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nueva Sesión de Misa</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Programa <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona un programa…</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.academic_year})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !selectedProgram}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl min-h-[44px] disabled:opacity-50"
        >
          {isSubmitting ? 'Abriendo sesión…' : 'Abrir Sesión'}
        </button>
      </form>
    </div>
  )
}
