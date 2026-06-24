import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  listStudents,
  createStudent,
  updateStudent,
  deactivateStudent,
  downloadStudentQr,
  downloadStudentQrBatch,
  type Student,
  type StudentCreate,
} from '../../services/students.service'
import { listPrograms, type Program } from '../../services/programs.service'

const PAGE_SIZE = 50

function emptyForm(): StudentCreate {
  return {
    full_name: '',
    program_id: '',
    birth_date: undefined,
    guardian_name: undefined,
    guardian_phone: undefined,
    notes: undefined,
  }
}

export default function StudentsPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [total, setTotal] = useState(0)
  const [programs, setPrograms] = useState<Program[]>([])
  const [filterProgram, setFilterProgram] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState<StudentCreate>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectingAll, setSelectingAll] = useState(false)   // cargando todos los IDs
  const [allListedSelected, setAllListedSelected] = useState(false) // todos los del filtro seleccionados
  const [downloadingBatch, setDownloadingBatch] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const allPageSelected = students.length > 0 && students.every((s) => selected.has(s.id))

  const load = (p = page) => {
    setLoading(true)
    setError(null)
    listStudents({
      program_id: filterProgram || undefined,
      search: search || undefined,
      active_only: true,
      page: p,
      page_size: PAGE_SIZE,
    })
      .then((res) => { setStudents(res.items); setTotal(res.total) })
      .catch(() => setError('Error al cargar alumnos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    listPrograms(true).then((res) => setPrograms(res.items)).catch(() => {})
  }, [])

  useEffect(() => {
    setPage(1)
    setSelected(new Set())
    setAllListedSelected(false)
    load(1)
  }, [filterProgram, search]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSelected(new Set())
    setAllListedSelected(false)
    load(page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSelect = (id: string) => {
    setAllListedSelected(false)
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const togglePageAll = () => {
    if (allPageSelected) {
      setSelected(new Set())
      setAllListedSelected(false)
    } else {
      setSelected(new Set(students.map((s) => s.id)))
    }
  }

  const selectAllListed = async () => {
    setSelectingAll(true)
    try {
      const res = await listStudents({
        program_id: filterProgram || undefined,
        search: search || undefined,
        active_only: true,
        page: 1,
        page_size: 200, // límite del backend
      })
      setSelected(new Set(res.items.map((s) => s.id)))
      setAllListedSelected(true)
    } catch {
      alert('Error al seleccionar todos los alumnos')
    } finally {
      setSelectingAll(false)
    }
  }

  const clearSelection = () => {
    setSelected(new Set())
    setAllListedSelected(false)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm(), program_id: filterProgram })
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (s: Student) => {
    setEditing(s)
    setForm({
      full_name: s.full_name,
      program_id: s.program_id,
      birth_date: s.birth_date ?? undefined,
      guardian_name: s.guardian_name ?? undefined,
      guardian_phone: s.guardian_phone ?? undefined,
      notes: s.notes ?? undefined,
    })
    setFormError(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.full_name.trim()) { setFormError('El nombre es obligatorio'); return }
    if (!editing && !form.program_id) { setFormError('Selecciona un programa'); return }
    setSaving(true)
    setFormError(null)
    try {
      if (editing) {
        await updateStudent(editing.id, {
          full_name: form.full_name,
          birth_date: form.birth_date ?? null,
          guardian_name: form.guardian_name ?? null,
          guardian_phone: form.guardian_phone ?? null,
          notes: form.notes ?? null,
        })
      } else {
        await createStudent(form)
      }
      setShowModal(false)
      load(page)
    } catch {
      setFormError('Error al guardar el alumno')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (s: Student) => {
    if (!window.confirm(`¿Desactivar a "${s.full_name}"? El historial se conserva.`)) return
    try {
      await deactivateStudent(s.id)
      setSelected((prev) => { const n = new Set(prev); n.delete(s.id); return n })
      load(page)
    } catch {
      alert('Error al desactivar alumno')
    }
  }

  const handleDownloadQr = async (s: Student) => {
    try { await downloadStudentQr(s.id, s.full_name) }
    catch { alert('Error al descargar QR') }
  }

  const handleDownloadBatch = async () => {
    if (selected.size === 0) return
    setDownloadingBatch(true)
    try { await downloadStudentQrBatch(Array.from(selected)) }
    catch { alert('Error al descargar QRs') }
    finally { setDownloadingBatch(false) }
  }

  const fieldCls = "w-full rounded-2xl px-4 py-2.5 text-sm outline-none"
  const fieldStyle = { border: '2px solid #E2E6EF', background: '#F8F9FC', color: '#1A2338' }

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: '#F8F9FC' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-extrabold" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>Alumnos</h1>
          <button
            onClick={openCreate}
            className="px-5 text-sm font-bold text-white rounded-2xl"
            style={{ height: 44, background: 'linear-gradient(135deg, #1A3A6B, #2452A0)', boxShadow: '0 4px 12px rgba(26,58,107,0.25)', border: 'none' }}
          >
            + Nuevo alumno
          </button>
        </div>

        <div className="flex flex-wrap gap-3 items-center mb-5">
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="rounded-2xl px-4 text-sm outline-none"
            style={{ height: 42, border: '2px solid #E2E6EF', background: '#FFFFFF', color: '#1A2338', minWidth: 200 }}
          >
            <option value="">Todos los programas</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre…"
            className="rounded-2xl px-4 text-sm outline-none flex-1"
            style={{ height: 42, border: '2px solid #E2E6EF', background: '#FFFFFF', color: '#1A2338', minWidth: 160 }}
          />
          {total > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: '#E8EEF8', color: '#1A3A6B' }}>
              {total} alumno{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Barra de acciones de selección */}
        {selected.size > 0 && (
          <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: '1px solid #C5D3EA' }}>
            <div className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ background: '#E8EEF8' }}>
              <span className="text-sm font-bold" style={{ color: '#1A3A6B' }}>
                {allListedSelected
                  ? `Todos los ${selected.size} alumnos seleccionados`
                  : `${selected.size} alumno${selected.size !== 1 ? 's' : ''} seleccionado${selected.size !== 1 ? 's' : ''}`}
              </span>
              <button
                onClick={handleDownloadBatch}
                disabled={downloadingBatch}
                className="text-sm font-bold px-4 py-1.5 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #C9942A, #E0A830)', border: 'none', opacity: downloadingBatch ? 0.6 : 1 }}
              >
                {downloadingBatch ? 'Descargando…' : `Descargar QR${selected.size > 1 ? 's' : ''}`}
              </button>
              <button
                onClick={clearSelection}
                className="text-xs font-bold px-3 py-1.5 rounded-xl"
                style={{ background: '#FFFFFF', color: '#8E97AE', border: '1px solid #E2E6EF' }}
              >
                Limpiar
              </button>
            </div>
            {/* Banner "seleccionar todos" — aparece solo cuando la página está completa y hay más páginas */}
            {allPageSelected && !allListedSelected && total > PAGE_SIZE && (
              <div className="px-4 py-2.5 text-sm text-center" style={{ background: '#D6E4F7', borderTop: '1px solid #C5D3EA' }}>
                <span style={{ color: '#1A3A6B' }}>Solo están seleccionados los {students.length} de esta página. </span>
                <button
                  onClick={selectAllListed}
                  disabled={selectingAll}
                  className="font-bold underline"
                  style={{ color: '#1A3A6B', background: 'none', border: 'none', cursor: 'pointer', opacity: selectingAll ? 0.6 : 1 }}
                >
                  {selectingAll ? 'Cargando…' : `Seleccionar los ${total} alumnos`}
                </button>
              </div>
            )}
          </div>
        )}

        {loading && <div className="text-center py-12" style={{ color: '#8E97AE' }}>Cargando…</div>}
        {error && <div className="rounded-2xl p-4 text-sm font-semibold" style={{ background: '#FDECEA', color: '#C0271E' }}>{error}</div>}

        {!loading && !error && students.length === 0 && (
          <div className="text-center py-16">
            <p className="text-base font-semibold" style={{ color: '#8E97AE' }}>No hay alumnos inscritos</p>
            <p className="text-sm mt-1" style={{ color: '#8E97AE' }}>Crea el primer alumno para que reciba su QR</p>
          </div>
        )}

        {!loading && !error && students.length > 0 && (
          <>
            {/* Tabla — md+ */}
            <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E2E6EF' }}>
              <table className="min-w-full text-sm">
                <thead style={{ background: '#F8F9FC', borderBottom: '1px solid #E2E6EF' }}>
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={allPageSelected} onChange={togglePageAll}
                        className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: '#2452A0' }} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Tutor</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: '#8E97AE', letterSpacing: '0.06em' }}>Teléfono</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id}
                      style={{
                        borderTop: i > 0 ? '1px solid #E2E6EF' : 'none',
                        background: selected.has(s.id) ? 'rgba(36,82,160,0.04)' : '#FFFFFF',
                      }}>
                      <td className="px-4 py-3 w-10">
                        <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)}
                          className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: '#2452A0' }} />
                      </td>
                      <td className="px-3 py-3 font-semibold" style={{ color: '#1A2338' }}>{s.full_name}</td>
                      <td className="px-4 py-3" style={{ color: '#4A5568' }}>{s.guardian_name ?? '—'}</td>
                      <td className="px-4 py-3" style={{ color: '#4A5568' }}>{s.guardian_phone ?? '—'}</td>
                      <td className="px-4 py-3 text-right" style={{ whiteSpace: 'nowrap' }}>
                        <button onClick={() => navigate(`/admin/students/${s.id}`)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl mr-1"
                          style={{ background: '#E8EEF8', color: '#1A3A6B', border: 'none' }}>
                          Perfil
                        </button>
                        <button onClick={() => handleDownloadQr(s)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl mr-1"
                          style={{ background: '#FDF5E0', color: '#C9942A', border: 'none' }}>
                          QR
                        </button>
                        <button onClick={() => openEdit(s)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl mr-1"
                          style={{ background: '#E8EEF8', color: '#2452A0', border: 'none' }}>
                          Editar
                        </button>
                        <button onClick={() => handleDeactivate(s)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl"
                          style={{ background: '#FDECEA', color: '#C0271E', border: 'none' }}>
                          Desactivar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas — mobile */}
            <div className="md:hidden space-y-3">
              {students.map((s) => (
                <div key={s.id} className="rounded-2xl p-4"
                  style={{
                    background: selected.has(s.id) ? 'rgba(36,82,160,0.04)' : '#FFFFFF',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                    border: selected.has(s.id) ? '1px solid #C5D3EA' : '1px solid #E2E6EF',
                  }}>
                  <div className="flex items-start gap-3 mb-1">
                    <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)}
                      className="w-4 h-4 rounded mt-1 cursor-pointer shrink-0" style={{ accentColor: '#2452A0' }} />
                    <div className="flex-1">
                      <p className="font-bold text-base" style={{ color: '#1A2338' }}>{s.full_name}</p>
                      {s.guardian_name && (
                        <p className="text-sm mt-0.5" style={{ color: '#4A5568' }}>
                          <span style={{ color: '#8E97AE' }}>Tutor: </span>{s.guardian_name}
                        </p>
                      )}
                      {s.guardian_phone && (
                        <p className="text-sm" style={{ color: '#4A5568' }}>
                          <span style={{ color: '#8E97AE' }}>Tel: </span>{s.guardian_phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 pl-7">
                    <button onClick={() => navigate(`/admin/students/${s.id}`)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: '#E8EEF8', color: '#1A3A6B', border: 'none' }}>
                      Perfil
                    </button>
                    <button onClick={() => handleDownloadQr(s)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: '#FDF5E0', color: '#C9942A', border: 'none' }}>
                      QR
                    </button>
                    <button onClick={() => openEdit(s)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: '#E8EEF8', color: '#2452A0', border: 'none' }}>
                      Editar
                    </button>
                    <button onClick={() => handleDeactivate(s)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: '#FDECEA', color: '#C0271E', border: 'none' }}>
                      Desactivar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Paginación */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs font-bold px-4 py-2 rounded-xl"
              style={{ border: '2px solid #E2E6EF', background: '#FFFFFF', color: page === 1 ? '#C5CCDA' : '#1A3A6B', cursor: page === 1 ? 'default' : 'pointer' }}
            >
              ← Anterior
            </button>
            <span className="text-xs font-semibold" style={{ color: '#8E97AE' }}>
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-xs font-bold px-4 py-2 rounded-xl"
              style={{ border: '2px solid #E2E6EF', background: '#FFFFFF', color: page === totalPages ? '#C5CCDA' : '#1A3A6B', cursor: page === totalPages ? 'default' : 'pointer' }}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,20,50,0.50)' }}>
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6" style={{ background: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.30)' }}>
            <h2 className="text-xl font-extrabold mb-5" style={{ color: '#1A2338', letterSpacing: '-0.01em' }}>
              {editing ? 'Editar alumno' : 'Nuevo alumno'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>
                  Nombre completo <span style={{ color: '#C0271E' }}>*</span>
                </label>
                <input type="text" value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  className={fieldCls} style={fieldStyle} placeholder="Nombre y apellidos" />
              </div>

              {!editing && (
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>
                    Programa <span style={{ color: '#C0271E' }}>*</span>
                  </label>
                  <select value={form.program_id}
                    onChange={(e) => setForm((f) => ({ ...f, program_id: e.target.value }))}
                    className={fieldCls} style={fieldStyle}>
                    <option value="">Selecciona un programa</option>
                    {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>
                  Fecha de nacimiento <span style={{ color: '#8E97AE', fontWeight: 400 }}>(opcional)</span>
                </label>
                <input type="date" value={form.birth_date ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value || undefined }))}
                  className={fieldCls} style={fieldStyle} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>
                  Nombre del tutor <span style={{ color: '#8E97AE', fontWeight: 400 }}>(opcional)</span>
                </label>
                <input type="text" value={form.guardian_name ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, guardian_name: e.target.value || undefined }))}
                  className={fieldCls} style={fieldStyle} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#4A5568' }}>
                  Teléfono del tutor <span style={{ color: '#8E97AE', fontWeight: 400 }}>(opcional)</span>
                </label>
                <input type="tel" value={form.guardian_phone ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, guardian_phone: e.target.value || undefined }))}
                  className={fieldCls} style={fieldStyle} placeholder="10 dígitos" />
              </div>

              {formError && (
                <p className="text-sm font-semibold px-3 py-2 rounded-xl" style={{ color: '#C0271E', background: '#FDECEA' }}>
                  {formError}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} disabled={saving}
                className="flex-1 font-bold rounded-2xl" style={{ height: 50, border: '2px solid #E2E6EF', color: '#4A5568', background: '#FFFFFF', opacity: saving ? 0.5 : 1 }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 font-bold text-white rounded-2xl" style={{ height: 50, background: 'linear-gradient(135deg, #1A3A6B, #2452A0)', boxShadow: '0 4px 12px rgba(26,58,107,0.25)', border: 'none', opacity: saving ? 0.65 : 1 }}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
