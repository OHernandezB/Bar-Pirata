import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'
import { useAuth } from '../context/AuthContext.jsx'
import { getUsers, getUser, updateUser, deleteUser, createUser, blockUser, unblockUser } from '../api/xano.js'

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
  const [newNombre, setNewNombre] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Filtros y orden visuales (UI-only)
  const [filter, setFilter] = useState('todos') // todos | activos | bloqueados | admins
  const [sortBy, setSortBy] = useState('nombre') // nombre | estado | fecha

  // Modales y confirmaciones
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, type: null, user: null })

  const canLoadById = useMemo(() => selectedId && String(selectedId).trim().length > 0, [selectedId])
  const canEdit = useMemo(() => !!isAdmin, [isAdmin])
  const canCreate = useMemo(() => !!isAdmin && newNombre.trim() && newEmail.trim() && newPassword.trim(), [isAdmin, newNombre, newEmail, newPassword])

  const stats = useMemo(() => {
    const total = items.length
    const activos = items.filter(u => toUIEstado(u?.estado ?? u?.status) === 'activo').length
    const bloqueados = items.filter(u => toUIEstado(u?.estado ?? u?.status) === 'bloqueado').length
    const admins = items.filter(u => toUIRol(readRol(u)) === 'administrador').length
    return { total, activos, bloqueados, admins }
  }, [items])

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

  const handleCreate = async (e) => {
    e?.preventDefault?.()
    if (!canCreate) return
    try {
      await createUser({ nombre: newNombre.trim(), email: newEmail.trim(), password: newPassword })
      setNewNombre('')
      setNewEmail('')
      setNewPassword('')
      setIsCreateOpen(false)
      await load()
    } catch (err) {
      console.error('createUser error', err)
      alert('Error creando usuario. Ver consola.')
    }
  }

  const handleUpdate = async (id, nextEstado, nextRol) => {
    if (!isAdmin) { alert('Se requiere rol admin para modificar usuarios.'); return }
    try {
      // No permitir cambios de rol desde el panel: mantener rol actual sin modificaciones
      await updateUser(id, { estado: toAPIEstado(nextEstado), rol: undefined })
      await load()
    } catch (err) {
      console.error('updateUser error', err)
      alert('Error actualizando usuario. Ver consola.')
    }
  }

  const handleDelete = async (id) => {
    if (!id) return
    if (!isAdmin) { alert('Se requiere rol admin para eliminar usuarios.'); return }
    if (!window.confirm('¿Eliminar este usuario?')) return
    try {
      await deleteUser(id)
      await load()
    } catch (err) {
      console.error('deleteUser error', err)
      alert('Error eliminando usuario. Ver consola.')
    }
  }

  const handleBlock = async (id) => {
    if (!isAdmin) { alert('Se requiere rol admin para bloquear usuarios.'); return }
    try {
      await blockUser(id)
      await load()
    } catch (err) {
      console.error('blockUser error', err)
      alert('Error bloqueando usuario. Ver consola.')
    }
  }

  const handleUnblock = async (id) => {
    if (!isAdmin) { alert('Se requiere rol admin para activar usuarios.'); return }
    try {
      await unblockUser(id)
      await load()
    } catch (err) {
      console.error('unblockUser error', err)
      alert('Error activando usuario. Ver consola.')
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
    <main className="admin admin-users">
      {/* Encabezado del módulo */}
      <div className="admin-users__header">
        <div className="admin-users__titles">
          <div className="breadcrumb">Panel / Usuarios</div>
          <h2 className="admin-users__title">Panel de Usuarios</h2>
          <p className="admin-users__subtitle">Gestiona clientes y administradores del Bar Pirata</p>
        </div>
        <div className="admin-users__actions">
          <button className="btn btn--gold" onClick={() => setIsCreateOpen(true)} disabled={!canEdit}>➕ Nuevo usuario</button>
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'Actualizando…' : 'Refrescar'}</button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <section className="admin__section admin-users__stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Usuarios totales</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{stats.activos}</div>
              <div className="stat-label">Usuarios activos</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚫</div>
            <div className="stat-info">
              <div className="stat-value">{stats.bloqueados}</div>
              <div className="stat-label">Usuarios bloqueados</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <div className="stat-value">{stats.admins}</div>
              <div className="stat-label">Administradores</div>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de herramientas */}
      <section className="admin__section admin-users__toolbar">
        <div className="toolbar-row">
          <input
            className="form-input toolbar-search"
            placeholder="Buscar por nombre o email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="toolbar-filters">
            <button className={`chip ${filter==='todos'?'is-active':''}`} onClick={() => setFilter('todos')}>Todos</button>
            <button className={`chip ${filter==='activos'?'is-active':''}`} onClick={() => setFilter('activos')}>Activos</button>
            <button className={`chip ${filter==='bloqueados'?'is-active':''}`} onClick={() => setFilter('bloqueados')}>Bloqueados</button>
            <button className={`chip ${filter==='admins'?'is-active':''}`} onClick={() => setFilter('admins')}>Administradores</button>
          </div>

          <div className="toolbar-sort">
            <label>Ordenar por</label>
            <select className="form-input" value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
              <option value="nombre">Nombre</option>
              <option value="estado">Estado</option>
              <option value="fecha">Fecha de registro</option>
            </select>
          </div>
        </div>
      </section>

      {/* Lista */}
      <section className="admin__section">
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
                .filter((u) => {
                  if (filter === 'activos') return toUIEstado(u.estado ?? u.status) === 'activo'
                  if (filter === 'bloqueados') return toUIEstado(u.estado ?? u.status) === 'bloqueado'
                  if (filter === 'admins') return toUIRol(readRol(u)) === 'administrador'
                  return true
                })
                .sort((a,b) => {
                  if (sortBy === 'estado') return (toUIEstado(a.estado ?? a.status)).localeCompare(toUIEstado(b.estado ?? b.status))
                  if (sortBy === 'fecha') return 0 // placeholder visual (UI-only)
                  const an = String(a.name || a.nombre || '').toLowerCase()
                  const bn = String(b.name || b.nombre || '').toLowerCase()
                  return an.localeCompare(bn)
                })
                .map((u) => {
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
                        <span className={`badge ${estado==='activo'?'badge--green':'badge--red'}`}>{estado}</span>
                      </td>
                      <td>
                        {rol === 'administrador' ? (
                          <span className="badge badge--gold">{rol}</span>
                        ) : (
                          <span className="badge">{rol}</span>
                        )}
                      </td>
                      <td>
                        <div className="table__actions">
                          <button className="btn btn--ghost" onClick={() => { setEditData(u); setIsEditOpen(true) }} disabled={!canEdit}>✏️ Editar</button>
                          {estado === 'activo' ? (
                            <button className="btn btn--amber" onClick={() => setConfirm({ open: true, type: 'block', user: u })} disabled={!canEdit}>🚫 Bloquear</button>
                          ) : (
                            <button className="btn btn--gold" onClick={() => setConfirm({ open: true, type: 'unblock', user: u })} disabled={!canEdit}>✔️ Activar</button>
                          )}
                          <button className="btn btn--danger" onClick={() => setConfirm({ open: true, type: 'delete', user: u })} disabled={!canEdit}>🗑️ Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        )}
      </section>

      {/* Modal Crear Usuario */}
      {isCreateOpen && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__dialog">
            <div className="modal__header">
              <h3>Nuevo usuario</h3>
            </div>
            <form className="modal__body admin__form" onSubmit={handleCreate}>
              <div className="form-field">
                <label>Nombre</label>
                <input className="form-input" value={newNombre} onChange={e=>setNewNombre(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input className="form-input" type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Contraseña</label>
                <input className="form-input" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
              </div>
              <div className="form-field form-field--full"><div className="form-hint">Rol por defecto: <strong>cliente</strong></div></div>
              <div className="modal__actions">
                <button className="btn btn--gold" type="submit" disabled={!canCreate}>Crear usuario</button>
                <button type="button" className="btn btn--ghost" onClick={() => setIsCreateOpen(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario (UI-only) */}
      {isEditOpen && editData && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__dialog">
            <div className="modal__header">
              <h3>Editar usuario</h3>
            </div>
            <div className="modal__body admin__form">
              <div className="form-field">
                <label>Nombre</label>
                <input className="form-input" defaultValue={editData.name || editData.nombre || ''} />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input className="form-input" type="email" defaultValue={editData.email || ''} />
              </div>
              <div className="form-field">
                <label>Rol</label>
                <input className="form-input" value={toUIRol(readRol(editData))} readOnly />
              </div>
            </div>
            <div className="modal__actions">
              <button className="btn btn--gold" onClick={() => setIsEditOpen(false)}>Guardar cambios</button>
              <button className="btn btn--ghost" onClick={() => setIsEditOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmaciones: eliminar / bloquear / activar */}
      {confirm.open && confirm.user && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__dialog">
            <div className="modal__header">
              <h3>Confirmar acción</h3>
            </div>
            <div className="modal__body">
              <p>¿Estás seguro de realizar esta acción?</p>
            </div>
            <div className="modal__actions">
              {confirm.type === 'delete' && (
                <button className="btn btn--danger" onClick={() => { const id = confirm.user.id || confirm.user.uuid || confirm.user._id; handleDelete(id); setConfirm({ open: false, type: null, user: null }) }}>Confirmar</button>
              )}
              {confirm.type === 'block' && (
                <button className="btn btn--amber" onClick={() => { const id = confirm.user.id || confirm.user.uuid || confirm.user._id; handleBlock(id); setConfirm({ open: false, type: null, user: null }) }}>Confirmar</button>
              )}
              {confirm.type === 'unblock' && (
                <button className="btn btn--gold" onClick={() => { const id = confirm.user.id || confirm.user.uuid || confirm.user._id; handleUnblock(id); setConfirm({ open: false, type: null, user: null }) }}>Confirmar</button>
              )}
              <button className="btn btn--ghost" onClick={() => setConfirm({ open: false, type: null, user: null })}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
  const handleCreate = async (e) => {
    e?.preventDefault?.()
    if (!canCreate) return
    if (!isAdmin) { alert('Se requiere rol admin para crear usuarios.'); return }
    setLoading(true)
    setError('')
    try {
      await createUser({ nombre: newNombre, email: newEmail, password: newPassword, estado: 'activo' /* rol queda fijo cliente */ })
      setNewNombre(''); setNewEmail(''); setNewPassword('')
      await load()
    } catch (err) {
      console.error('createUser error', err)
      setError('No se pudo crear el usuario. Revisa que el email no exista y permisos del endpoint /usuario.')
    } finally {
      setLoading(false)
    }
  }

  const handleBlock = async (id) => {
    if (!isAdmin) { alert('Se requiere rol admin.'); return }
    try { await blockUser(id); await load() } catch (err) { console.error('blockUser error', err); alert('Error bloqueando usuario.') }
  }
  const handleUnblock = async (id) => {
    if (!isAdmin) { alert('Se requiere rol admin.'); return }
    try { await unblockUser(id); await load() } catch (err) { console.error('unblockUser error', err); alert('Error desbloqueando usuario.') }
  }