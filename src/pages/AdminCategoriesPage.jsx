import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'
import { useAuth } from '../context/AuthContext.jsx'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/xano.js'

export default function AdminCategoriesPage() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const canSubmit = useMemo(() => name.trim().length > 0, [name])
  const canEdit = useMemo(() => !!isAdmin, [isAdmin])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getCategories()
      const arr = Array.isArray(data) ? data : (data?.items || [])
      setItems(arr)
    } catch (err) {
      console.error('getCategories error', err)
      setError('No se pudieron cargar categorías. Revisa configuración de Xano y CORS.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (isAuthenticated) load() }, [isAuthenticated])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      await createCategory({ nombre_categ: name.trim(), descripcion: description.trim() })
      setName('')
      setDescription('')
      await load()
    } catch (err) {
      console.error('createCategory error', err)
      alert(`Error creando categoría (HTTP ${err?.status || '??'}). ${formatErr(err)}`)
    }
  }

  const handleUpdate = async (id, nextName, nextDesc) => {
    if (!isAdmin) { alert('Se requiere rol admin para modificar categorías.'); return }
    try {
      await updateCategory(id, { nombre_categ: (nextName ?? '').toString().trim(), descripcion: (nextDesc ?? '').toString().trim() })
      await load()
    } catch (err) {
      console.error('updateCategory error', err)
      alert(`Error actualizando categoría (HTTP ${err?.status || '??'}). ${formatErr(err)}`)
    }
  }

  const handleDelete = async (id) => {
    if (!id) return
    if (!isAdmin) { alert('Se requiere rol admin para eliminar categorías.'); return }
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await deleteCategory(id)
      await load()
    } catch (err) {
      console.error('deleteCategory error', err)
      alert(`Error eliminando categoría (HTTP ${err?.status || '??'}). ${formatErr(err)}`)
    }
  }

  const formatErr = (err) => {
    try {
      const msg = err?.data?.message || err?.data?.error || err?.data?.detail || err?.data
      if (!msg) return ''
      return typeof msg === 'string' ? msg : JSON.stringify(msg)
    } catch { return '' }
  }

  if (!isAuthenticated) {
    return (
      <main className="admin">
        <div className="admin__header">
          <h2>Panel de Categorías</h2>
        </div>
        <p className="admin__hint">Debes iniciar sesión para gestionar categorías.</p>
      </main>
    )
  }

  return (
    <main className="admin">
      <div className="admin__header">
        <h2>Panel de Categorías</h2>
        <div className="admin__actions">
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'Actualizando…' : 'Refrescar'}</button>
        </div>
      </div>

      {!canEdit && (
        <div className="admin__warning">Tu usuario no tiene permisos de edición/eliminación. Rol actual: {String(user?.rol || user?.role || user?.rol_usuario || user?.perfil || 'desconocido')}</div>
      )}

      <section className="admin__section">
        <h3>Crear categoría</h3>
        <form onSubmit={handleCreate} className="admin__form">
          <div className="form-field">
            <label>Nombre</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Descripción</label>
            <input className="form-input" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={!canSubmit}>Crear</button>
          </div>
        </form>
      </section>

      <section className="admin__section">
        {loading && <p className="admin__status">Cargando…</p>}
        {error && <div className="admin__error">{error}</div>}

        {items.length === 0 && !loading ? (
          <div className="admin__empty">No hay categorías para mostrar.</div>
        ) : (
          <table className="table table--admin">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const id = c.id || c.uuid || c._id
                const nombre = c.nombre_categ || c.nombre || c.name || ''
                const descripcion = c.descripcion || ''
                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>
                      <input
                        className="form-input"
                        defaultValue={nombre}
                        onChange={(e) => (c.__nextName = e.target.value)}
                        disabled={!canEdit}
                      />
                    </td>
                    <td>
                      <input
                        className="form-input"
                        defaultValue={descripcion}
                        onChange={(e) => (c.__nextDesc = e.target.value)}
                        disabled={!canEdit}
                      />
                    </td>
                    <td>
                      <div className="table__actions">
                        <button className="btn" onClick={() => handleUpdate(id, c.__nextName ?? nombre, c.__nextDesc ?? descripcion)} disabled={!canEdit}>Guardar</button>
                        <button className="btn btn--danger" onClick={() => handleDelete(id)} disabled={!canEdit}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}