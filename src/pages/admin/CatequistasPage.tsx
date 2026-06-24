import { useEffect, useState } from 'react'
import {
  listCatequistas,
  createCatequista,
  deactivateCatequista,
  type Catequista,
  type CatequistaCreate,
} from '../../services/users.service'

function emptyForm(): CatequistaCreate {
  return { full_name: '', email: '' }
}

export default function CatequistasPage() {
  const [catequistas, setCatequistas] = useState<Catequista[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CatequistaCreate>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [invited, setInvited] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    listCatequistas()
      .then((res) => { setCatequistas(res.items); setTotal(res.total) })
      .catch(() => setError('Error al cargar catequistas'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm(emptyForm())
    setFormError(null)
    setInvited(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.full_name.trim()) { setFormError('El nombre es obligatorio'); return }
    if (!form.email.trim()) { setFormError('El correo es obligatorio'); return }
    setSaving(true)
    setFormError(null)
    try {
      const created = await createCatequista(form)
      setInvited(created.email)
      load()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      setFormError(status === 409 ? 'Ya existe un usuario con ese correo' : 'Error al crear catequista')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (c: Catequista) => {
    if (!window.confirm(`¿Desactivar a "${c.full_name}"? Sus registros históricos se conservan.`)) return
    try {
      await deactivateCatequista(c.id)
      load()
    } catch {
      alert('Error al desactivar catequista')
    }
  }

  const fStyle = { border: '2px solid #E2E6EF', background: '#F8F9FC', color: '#1A2338' }
  const fCls = "w-full rounded-2xl px-4 py-2.5 text-sm outline-none"

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: '#F8F9FC' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-extrabold" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>Catequistas</h1>
          <button onClick={openCreate} className="px-5 text-sm font-bold text-white rounded-2xl"
            style={{ height: 44, background: 'linear-gradient(135deg, #1A3A6B, #2452A0)', boxShadow: '0 4px 12px rgba(26,58,107,0.25)', border: 'none' }}>
            + Nuevo catequista
          </button>
        </div>

        {loading && <div className="text-center py-12" style={{ color: '#8E97AE' }}>Cargando…</div>}
        {error && <div className="rounded-2xl p-4 text-sm font-semibold" style={{ background: '#FDECEA', color: '#C0271E' }}>{error}</div>}

        {!loading && !error && catequistas.length === 0 && (
          <div className="text-center py-16">
            <p className="text-base font-semibold" style={{ color: '#8E97AE' }}>No hay catequistas registrados</p>
            <p className="text-sm mt-1" style={{ color: '#8E97AE' }}>Invita al equipo para que puedan registrar firmas</p>
          </div>
        )}

        {!loading && !error && catequistas.length > 0 && (
          <>
            <p className="text-xs font-bold mb-3" style={{ color: '#8E97AE' }}>{total} catequista{total !== 1 ? 's' : ''}</p>

            {/* Tabla — solo en md+ */}
            <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E2E6EF' }}>
              <table className="min-w-full text-sm">
                <thead style={{ background: '#F8F9FC', borderBottom: '1px solid #E2E6EF' }}>
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Correo</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {catequistas.map((c, i) => (
                    <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #E2E6EF' : 'none' }}>
                      <td className="px-5 py-3 font-semibold" style={{ color: '#1A2338' }}>{c.full_name}</td>
                      <td className="px-4 py-3" style={{ color: '#4A5568' }}>{c.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                          style={c.is_active ? { background: '#E8EEF8', color: '#1A3A6B' } : { background: '#F1F3F8', color: '#8E97AE' }}>
                          {c.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.is_active && (
                          <button onClick={() => handleDeactivate(c)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl"
                            style={{ background: '#FDECEA', color: '#C0271E', border: 'none' }}>
                            Desactivar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas — solo en mobile */}
            <div className="md:hidden space-y-3">
              {catequistas.map((c) => (
                <div key={c.id} className="rounded-2xl p-4" style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E2E6EF' }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold text-base" style={{ color: '#1A2338' }}>{c.full_name}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold shrink-0"
                      style={c.is_active ? { background: '#E8EEF8', color: '#1A3A6B' } : { background: '#F1F3F8', color: '#8E97AE' }}>
                      {c.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: '#4A5568' }}>{c.email}</p>
                  {c.is_active && (
                    <button onClick={() => handleDeactivate(c)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: '#FDECEA', color: '#C0271E', border: 'none' }}>
                      Desactivar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,20,50,0.50)' }}>
          <div className="w-full max-w-md rounded-3xl p-6" style={{ background: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.30)' }}>
            {invited ? (
              <>
                <h2 className="text-xl font-extrabold mb-3" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>Invitación enviada</h2>
                <div className="p-4 rounded-2xl text-sm mb-5" style={{ background: '#E8EEF8', color: '#1A3A6B' }}>
                  Se envió un enlace de invitación a <strong>{invited}</strong>. El catequista podrá establecer su contraseña (válido 24 horas).
                </div>
                <button onClick={() => setShowModal(false)} className="w-full font-bold text-white rounded-2xl"
                  style={{ height: 50, background: 'linear-gradient(135deg, #1A3A6B, #2452A0)', border: 'none' }}>
                  Entendido
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-extrabold mb-5" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>Nuevo catequista</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>
                      Nombre completo <span style={{ color: '#C0271E' }}>*</span>
                    </label>
                    <input type="text" value={form.full_name}
                      onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                      className={fCls} style={fStyle} placeholder="Nombre y apellidos" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>
                      Correo electrónico <span style={{ color: '#C0271E' }}>*</span>
                    </label>
                    <input type="email" value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className={fCls} style={fStyle} placeholder="correo@ejemplo.com" />
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
                    {saving ? 'Enviando…' : 'Invitar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
