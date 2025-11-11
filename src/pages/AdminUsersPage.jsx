import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'
import { useAuth } from '../context/AuthContext.jsx'
import { getUsers, getUser, updateUser, deleteUser } from '../api/xano.js'

// API -> UI
const toUIRol = (v) => {
  const s = String(v ?? '').trim().toLowerCase()
  if (['admin', 'administrador', 'administrator', 'adm'].includes(s)) return 'administrador'
  return 'cliente'
}
const toUIEstado = (v) => {
  const s = String(v ?? '').trim().toLowerCase()
  return ['bloqueado', 'blocked', 'inactivo', 'inactive', '0'].includes(s) ? 'bloqueado' : 'activo'
}
const readRol = (u) => (u?.rol ?? u?.role ?? u?.Rol ?? u?.Role ?? '')

// UI -> API  (DB usa texto "administrador")
const toAPIRol = (v) => (String(v).toLowerCase() === 'administrador' ? 'administrador' : 'cliente')
const toAPIEstado = (v) => (String(v).toLowerCase() === 'bloqueado' ? 'bloqueado' : 'activo')

export default function AdminUsersPage() {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')

  const canLoadById = useMemo(() => selectedId && String(selectedId).trim().length > 0, [selectedId])
  const canEdit = useMemo(() => !!isAdmin, [isAdmin])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getUsers()
      const arr = Array.isArray(data) ? data : (data?.items || [])
      const norm = arr.map(u => {
  const rawRol = readRol(u)
  return {
    ...u,
    __estado: toUIEstado(u?.estado ?? u?.status ?? 'activo'),
    __rol: toUIRol(rawRol || 'cliente'),
  }
})
      console.table(arr.map(u => ({
        id: u.id || u.uuid || u._id,
        rol_api: u.rol ?? u.rol,
        estado_api: u.estado ?? u.status
      })))
      setItems(norm)
    } catch (err) {
      console.error('getUsers error', err)
      setError('No se pudieron cargar usuarios. Si la API no expone /usuario, este módulo se omite.')
    } finally {
      setLoading(false)
    }
  }

  const loadById = async () => {
    if (!canLoadById) return
    setLoading(true)
    setError('')
    try {
      const data = await getUser(String(selectedId).trim())
      const itemRaw = data && !Array.isArray(data) ? data : null
      const item = itemRaw ? {
        ...itemRaw,
        __estado: toUIEstado(itemRaw.estado ?? itemRaw.status ?? 'activo'),
       __rol: toUIRol(readRol(itemRaw) || 'cliente'),
      } : null
      setItems(item ? [item] : [])
    } catch (err) {
      console.error('getUser error', err)
      setError('No se pudo cargar el usuario por ID.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (isAuthenticated) load() }, [isAuthenticated])

  const handleUpdate = async (id, nextEstado, nextRol) => {
    if (!isAdmin) { alert('Se requiere rol admin para modificar usuarios.'); return }
    try {
      await updateUser(id, { estado: toAPIEstado(nextEstado), rol: toAPIRol(nextRol) })
      await load()
    } catch (err) {
      console.error('updateUser error', err)
      alert('Error actualizando usuario. Ver consola.')
    }
  }

  const handleDelete = async (id) => {
    if (!id) return
    if (!isAdmin) { alert('Se requiere rol admin para eliminar usuarios.'); return }
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await deleteUser(id)
      await load()
    } catch (err) {
      console.error('deleteUser error', err)
      alert('Error eliminando usuario. Ver consola.')
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="admin">
        <div className="admin__header">
          <h2>Panel de Usuarios</h2>
        </div>
        <p className="admin__hint">Debes iniciar sesión para gestionar usuarios.</p>
      </main>
    )
  }

  return (
    <main className="admin">
      <div className="admin__header">
        <h2>Panel de Usuarios</h2>
        <div className="admin__actions">
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'Actualizando…' : 'Refrescar'}</button>
        </div>
      </div>

      <section className="admin__section">
        <div className="admin__subheader">
          <h3>Lista de usuarios</h3>
          <input
            className="form-input admin__search"
            placeholder="Buscar por nombre o email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {!canEdit && (
          <p className="admin__hint">Debes ser administrador para modificar usuarios. El listado es de solo lectura.</p>
        )}

        <div className="admin__filters">
          <div className="form-field">
            <label>ID de usuario</label>
            <input className="form-input" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} placeholder="Ej: 12" />
          </div>
          <div className="form-actions">
            <button className="btn" onClick={loadById} disabled={!canLoadById}>Cargar por ID</button>
          </div>
        </div>

        {loading && <p className="admin__status">Cargando…</p>}
        {error && <div className="admin__error">{error}</div>}

        {items.length === 0 && !loading ? (
          <div className="admin__empty">No hay usuarios para mostrar.</div>
        ) : (
          <table className="table table--admin">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter((u) => {
                  const q = query.trim().toLowerCase()
                  if (!q) return true
                  return (
                    String(u.name || u.nombre || '').toLowerCase().includes(q) ||
                    String(u.email || '').toLowerCase().includes(q)
                  )
                })
                .map((u, idx) => {
                  const id = u.id || u.uuid || u._id
                  const nombre = u.name || u.nombre || '—'
                  const email = u.email || '—'
                  const estado = toUIEstado(u.estado ?? u.status ?? 'activo')
                  const rol = toUIRol(readRol(u) || 'cliente')
                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{nombre}</td>
                      <td>{email}</td>
                      <td>
                        <select value={(u.__estado ?? toUIEstado(u.estado ?? u.status ?? 'activo'))} onChange={(e)=>setItems(p=>{const c=[...p]; c[idx]={...p[idx], __estado:e.target.value}; return c;})} className="form-input" disabled={!canEdit}>
                          <option value="activo">activo</option>
                          <option value="bloqueado">bloqueado</option>
                        </select>
                      </td>
                      <td>
                        <select value={(u.__rol ?? toUIRol(u.rol ?? u.rol ?? 'cliente'))} onChange={(e)=>setItems(p=>{const c=[...p]; c[idx]={...p[idx], __rol:e.target.value}; return c;})} className="form-input" disabled={!canEdit}>
                          <option value="cliente">cliente</option>
                          <option value="administrador">administrador</option>
                        </select>
                      </td>
                      <td>
                        <div className="table__actions">
                          <button className="btn" onClick={() => handleUpdate(id, u.__estado ?? estado, u.__rol ?? rol)} disabled={!canEdit}>Guardar</button>
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