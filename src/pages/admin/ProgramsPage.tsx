import { useEffect, useState } from 'react'
import {
  listPrograms,
  createProgram,
  updateProgram,
  deactivateProgram,
  downloadQrLabels,
  type Program,
  type ProgramCreate,
  type ProgramType,
} from '../../services/programs.service'

const TYPE_LABELS: Record<ProgramType, string> = {
  primera_comunion: 'Primera Comunión',
  confirmacion: 'Confirmación',
}

const CURRENT_YEAR = new Date().getFullYear()

function emptyForm(): ProgramCreate {
  return {
    name: '',
    type: 'primera_comunion',
    required_signatures: 52,
    academic_year: CURRENT_YEAR,
    start_date: `${CURRENT_YEAR}-01-01`,
    end_date: `${CURRENT_YEAR}-12-31`,
  }
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Program | null>(null)
  const [form, setForm] = useState<ProgramCreate>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    listPrograms()
      .then((res) => { setPrograms(res.items); setTotal(res.total) })
      .catch(() => setError('Error al cargar programas'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (p: Program) => {
    setEditing(p)
    setForm({
      name: p.name,
      type: p.type,
      required_signatures: p.required_signatures,
      academic_year: p.academic_year,
      start_date: p.start_date,
      end_date: p.end_date,
    })
    setFormError(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('El nombre es obligatorio'); return }
    setSaving(true)
    setFormError(null)
    try {
      if (editing) {
        await updateProgram(editing.id, {
          name: form.name,
          required_signatures: form.required_signatures,
          start_date: form.start_date,
          end_date: form.end_date,
        })
      } else {
        await createProgram(form)
      }
      setShowModal(false)
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { status?: number } })?.response?.status === 409
        ? 'Ya existe un programa de este tipo para ese año'
        : 'Error al guardar el programa'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPdf = async (p: Program) => {
    setDownloadingPdf(p.id)
    try {
      await downloadQrLabels(p.id, p.name)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 400) {
        alert('Este programa no tiene alumnos activos')
      } else {
        alert('Error al descargar el PDF')
      }
    } finally {
      setDownloadingPdf(null)
    }
  }

  const handleDeactivate = async (p: Program) => {
    if (!window.confirm(`¿Desactivar el programa "${p.name}"?`)) return
    try {
      await deactivateProgram(p.id)
      load()
    } catch {
      alert('Error al desactivar el programa')
    }
  }

  const handleReactivate = async (p: Program) => {
    if (!window.confirm(`¿Reactivar el programa "${p.name}"?`)) return
    try {
      await updateProgram(p.id, { is_active: true })
      load()
    } catch {
      alert('Error al reactivar el programa')
    }
  }

  const fS = { border: '2px solid #E2E6EF', background: '#F8F9FC', color: '#1A2338' }
  const fC = "w-full rounded-2xl px-4 py-2.5 text-sm outline-none"

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: '#F8F9FC' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-extrabold" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>Programas</h1>
          <button onClick={openCreate} className="px-5 text-sm font-bold text-white rounded-2xl"
            style={{ height: 44, background: 'linear-gradient(135deg, #1A3A6B, #2452A0)', boxShadow: '0 4px 12px rgba(26,58,107,0.25)', border: 'none' }}>
            + Nuevo programa
          </button>
        </div>

        {loading && <div className="text-center py-12" style={{ color: '#8E97AE' }}>Cargando…</div>}
        {error && <div className="rounded-2xl p-4 text-sm font-semibold" style={{ background: '#FDECEA', color: '#C0271E' }}>{error}</div>}

        {!loading && !error && programs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-base font-semibold" style={{ color: '#8E97AE' }}>No hay programas creados</p>
            <p className="text-sm mt-1" style={{ color: '#8E97AE' }}>Crea el primer programa para empezar a inscribir alumnos</p>
          </div>
        )}

        {!loading && !error && programs.length > 0 && (
          <>
            <p className="text-xs font-bold mb-3" style={{ color: '#8E97AE' }}>{total} programa{total !== 1 ? 's' : ''}</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E2E6EF' }}>
              <table className="min-w-full text-sm">
                <thead style={{ background: '#F8F9FC', borderBottom: '1px solid #E2E6EF' }}>
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Año</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Firmas</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p, i) => (
                    <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid #E2E6EF' : 'none' }}>
                      <td className="px-5 py-3 font-semibold" style={{ color: '#1A2338' }}>{p.name}</td>
                      <td className="px-4 py-3" style={{ color: '#4A5568' }}>{TYPE_LABELS[p.type as ProgramType] ?? p.type}</td>
                      <td className="px-4 py-3" style={{ color: '#4A5568' }}>{p.academic_year}</td>
                      <td className="px-4 py-3" style={{ color: '#4A5568' }}>{p.required_signatures}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold"
                          style={p.is_active ? { background: '#E8EEF8', color: '#1A3A6B' } : { background: '#F1F3F8', color: '#8E97AE' }}>
                          {p.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" style={{ whiteSpace: 'nowrap' }}>
                        <button onClick={() => openEdit(p)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl mr-1"
                          style={{ background: '#E8EEF8', color: '#2452A0', border: 'none' }}>
                          Editar
                        </button>
                        {p.is_active && (
                          <button onClick={() => handleDownloadPdf(p)} disabled={downloadingPdf === p.id}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl mr-1"
                            style={{ background: '#FDF5E0', color: '#C9942A', border: 'none', opacity: downloadingPdf === p.id ? 0.5 : 1 }}>
                            {downloadingPdf === p.id ? '…' : 'PDF QR'}
                          </button>
                        )}
                        {p.is_active ? (
                          <button onClick={() => handleDeactivate(p)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl"
                            style={{ background: '#FDECEA', color: '#C0271E', border: 'none' }}>
                            Desactivar
                          </button>
                        ) : (
                          <button onClick={() => handleReactivate(p)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl"
                            style={{ background: '#E8F5E9', color: '#2E7D32', border: 'none' }}>
                            Reactivar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,20,50,0.50)' }}>
          <div className="w-full max-w-md rounded-3xl p-6" style={{ background: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.30)' }}>
            <h2 className="text-xl font-extrabold mb-5" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>
              {editing ? 'Editar programa' : 'Nuevo programa'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>
                  Nombre <span style={{ color: '#C0271E' }}>*</span>
                </label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={fC} style={fS} placeholder="Ej. Primera Comunión 2025" />
              </div>

              {!editing && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>
                      Tipo <span style={{ color: '#C0271E' }}>*</span>
                    </label>
                    <select value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ProgramType }))}
                      className={fC} style={fS}>
                      <option value="primera_comunion">Primera Comunión</option>
                      <option value="confirmacion">Confirmación</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>
                      Año académico <span style={{ color: '#C0271E' }}>*</span>
                    </label>
                    <input type="number" value={form.academic_year}
                      onChange={(e) => setForm((f) => ({ ...f, academic_year: Number(e.target.value) }))}
                      className={fC} style={fS} min={2000} max={2100} />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>
                  Firmas requeridas <span style={{ color: '#C0271E' }}>*</span>
                </label>
                <input type="number" value={form.required_signatures}
                  onChange={(e) => setForm((f) => ({ ...f, required_signatures: Number(e.target.value) }))}
                  className={fC} style={fS} min={1} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>Inicio</label>
                  <input type="date" value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    className={fC} style={fS} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>Fin</label>
                  <input type="date" value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    className={fC} style={fS} />
                </div>
              </div>

              {formError && (
                <p className="text-sm font-semibold px-3 py-2 rounded-xl" style={{ color: '#C0271E', background: '#FDECEA' }}>
                  {formError}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} disabled={saving}
                className="flex-1 font-bold rounded-2xl"
                style={{ height: 50, border: '2px solid #E2E6EF', color: '#4A5568', background: '#FFFFFF', opacity: saving ? 0.5 : 1 }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 font-bold text-white rounded-2xl"
                style={{ height: 50, background: 'linear-gradient(135deg, #1A3A6B, #2452A0)', border: 'none', opacity: saving ? 0.65 : 1 }}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
