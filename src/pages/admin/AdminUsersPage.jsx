import { useEffect, useMemo, useState } from 'react'
import '../../styles/admin.css'
import '../../styles/admin-users.css'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../api/xano.js'
import { 
  actualizarUsuarioRobusto, 
  eliminarUsuarioRobusto, 
  obtenerUsuariosRobusto,
  cambiarEstadoUsuario,
  XANO_ERROR_TYPES
} from '../../api/xano-admin.js'

// API -> UI
const toUIRol = (v) => {
  const s = String(v || '').trim().toLowerCase()
  if (['admin', 'administrador', 'administrator', 'adm'].includes(s)) return 'administrador'
  return 'cliente'
}
const toUIEstado = (v) => {
  const s = String(v || '').trim().toLowerCase()
  return ['bloqueado', 'blocked', 'inactivo', 'inactive', '0'].includes(s) ? 'bloqueado' : 'activo'
}
const readRol = (u) => (u && (u.rol || u.role || u.Rol || u.Role || '')) || ''

export default function AdminUsersPage() {
  console.log('AdminUsersPage component rendering...')
  const { isAuthenticated, isAdmin, user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uiBusy, setUiBusy] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [query, setQuery] = useState('')
  
  // Estados para crear usuario
  const [newName, setNewName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newDireccion, setNewDireccion] = useState('')
  const [newTelefono, setNewTelefono] = useState('')
  const [newRol, setNewRol] = useState('cliente')

  // Filtros y orden visuales (UI-only)
  const [filter, setFilter] = useState('todos') // todos | activos | bloqueados | admins
  const [sortBy, setSortBy] = useState('nombre') // nombre | estado | fecha

  // Estados para edición inline
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  // const canLoadById = useMemo(() => selectedId && String(selectedId).trim().length > 0, [selectedId])
  const canEdit = useMemo(() => {
    const hasPermission = !!isAdmin
    console.log('Verificando permisos - isAdmin:', isAdmin, 'canEdit:', hasPermission)
    return hasPermission
  }, [isAdmin])
  const canCreate = useMemo(() => !!isAdmin && newName.trim() && newLastName.trim() && newEmail.trim() && newPassword.trim(), [isAdmin, newName, newLastName, newEmail, newPassword])

  // Estadísticas
  const stats = useMemo(() => {
    const total = items.length
    const activos = items.filter(u => toUIEstado(u && (u.estado || u.status)) === 'activo').length
    const bloqueados = items.filter(u => toUIEstado(u && (u.estado || u.status)) === 'bloqueado').length
    const admins = items.filter(u => toUIRol(readRol(u)) === 'administrador').length
    return { total, activos, bloqueados, admins }
  }, [items])

  const load = async () => {
    setLoading(true)
    setError('')
    setStatusMsg('')
    try {
      console.log('Iniciando carga robusta de usuarios...')
      
      let data
      try {
        // Usar la función robusta para obtener usuarios
        data = await obtenerUsuariosRobusto()
      } catch (apiError) {
        console.error('Error en obtenerUsuariosRobusto():', apiError)
        
        // Manejar diferentes tipos de errores
        if (apiError.tipo === XANO_ERROR_TYPES.FATAL_ERROR) {
          throw new Error(`Error fatal del servidor: ${apiError.message}. Contacta al administrador.`)
        } else if (apiError.status === 401) {
          throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.')
        } else if (apiError.status === 403) {
          throw new Error('No tienes permisos para ver los usuarios.')
        } else {
          throw new Error(`Error de API: ${apiError?.message || 'Error desconocido'}`)
        }
      }
      
      console.log('Usuarios recibidos:', data)
      
      if (!data) {
        console.error('No se recibieron datos de usuarios')
        setError('No se recibieron datos del servidor.')
        return
      }
      
      const arr = Array.isArray(data) ? data : (data?.items || [])
      console.log('Array de usuarios:', arr)
      
      if (!Array.isArray(arr) || arr.length === 0) {
        console.warn('Array de usuarios vacío o inválido:', arr)
        setItems([])
        return
      }
      
      const norm = arr.map(u => {
        const rawRol = readRol(u)
        console.log('Procesando usuario:', u)
        return {
          ...u,
          __estado: toUIEstado(u && (u.estado || u.status || 'activo')),
          __rol: toUIRol(rawRol || 'cliente'),
        }
      })
      setItems(norm)
      console.log('Usuarios procesados correctamente:', norm.length)
    } catch (err) {
      console.error('Error completo en getUsers:', err)
      console.error('Error nombre:', err?.name)
      console.error('Error mensaje:', err?.message)
      console.error('Error status:', err?.status)
      console.error('Error datos:', err?.data)
      
      // Mensaje de error más específico para el usuario
      const mensajeError = err?.message || 'Error desconocido al cargar usuarios'
      setError(`Error cargando usuarios: ${mensajeError}`)
      
      // Si es un error de autenticación, sugerir re-login
      if (err?.status === 401) {
        setStatusMsg('🔒 Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.')
      }
    } finally {
      setLoading(false)
    }
  }

  // const loadById = async () => {
  //   if (!canLoadById) return
  //   setLoading(true)
  //   setError('')
  //   try {
  //     const data = await getUser(String(selectedId).trim())
  //     const itemRaw = data && !Array.isArray(data) ? data : null
  //     const item = itemRaw ? {
  //       ...itemRaw,
  //       __estado: toUIEstado(itemRaw.estado ?? itemRaw.status ?? 'activo'),
  //       __rol: toUIRol(readRol(itemRaw) || 'cliente'),
  //     } : null
  //     setItems(item ? [item] : [])
  //   } catch (err) {
  //     console.error('getUser error', err)
  //     setError('No se pudo cargar el usuario por ID.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // Funciones para edición inline
  const startEdit = (user) => {
    if (!canEdit) return
    setEditingId(user.id || user.uuid || user._id)
    setEditForm({
      name: user.name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      direccion: user.direccion || '',
      telefono: user.telefono || '',
      rol: toUIRol(readRol(user)),
      estado: toUIEstado(user.estado ?? user.status ?? 'activo')
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async (user) => {
    const id = user.id || user.uuid || user._id
    if (!id || !canEdit) return

    try {
      setUiBusy(true)
      
      // Preparar los datos para enviar, excluyendo el rol que no debe ser modificable
      // El rol se mantiene igual al original del usuario
      const updateData = {
        name: editForm.name,
        last_name: editForm.last_name,
        email: editForm.email,
        direccion: editForm.direccion,
        telefono: editForm.telefono,
        estado: editForm.estado,
        rol: user.rol || readRol(user) // Preservar el rol original del usuario
        // NOTA: El rol no se modifica desde la interfaz de edición
      }
      
      console.log('Actualizando usuario:', id, 'con datos (rol preservado):', updateData)
      
      // Usar la función robusta para actualizar
      await actualizarUsuarioRobusto(id, updateData)
      
      setStatusMsg('✅ Usuario actualizado correctamente.')
      setEditingId(null)
      setEditForm({})
      await load()
    } catch (err) {
      console.error('saveEdit error:', err)
      console.error('Status:', err.status)
      console.error('Data:', err.data)
      
      // Manejar diferentes tipos de errores
      let mensajeError = 'Error desconocido al actualizar usuario'
      
      if (err.tipo === XANO_ERROR_TYPES.FATAL_ERROR) {
        mensajeError = 'Error del servidor. Contacta al administrador del sistema.'
      } else if (err.status === 400) {
        mensajeError = 'Datos inválidos. Verifica que todos los campos estén completos.'
      } else if (err.status === 401) {
        mensajeError = 'Sesión expirada. Por favor, vuelve a iniciar sesión.'
      } else if (err.status === 403) {
        mensajeError = 'No tienes permisos para actualizar este usuario.'
      } else if (err.status === 404) {
        mensajeError = 'Usuario no encontrado.'
      } else {
        mensajeError = err?.data?.message || err?.message || `Error actualizando usuario (${err?.status || ''}).`
      }
      
      setStatusMsg(`❌ ${mensajeError}`)
    } finally {
      setUiBusy(false)
    }
  }

  const handleBlockToggle = async (user) => {
    console.log('=== INICIANDO BLOQUEO/ACTIVACIÓN ROBUSTA ===')
    
    if (!canEdit) {
      console.log('❌ Sin permisos - canEdit:', canEdit)
      setStatusMsg('❌ No tienes permisos para esta acción')
      return
    }
    
    const id = user.id || user.uuid || user._id
    const currentEstado = toUIEstado(user && (user.estado || user.status || 'activo'))
    const shouldBlock = currentEstado === 'activo'
    
    console.log('BlockToggle - User:', user)
    console.log('BlockToggle - ID:', id)
    console.log('BlockToggle - Current Estado:', currentEstado)
    console.log('BlockToggle - Should Block:', shouldBlock)
    
    if (!id) {
      console.error('❌ No se pudo obtener ID del usuario')
      setStatusMsg('❌ Error: No se pudo identificar el usuario')
      return
    }
    
    try {
      setUiBusy(true)
      
      console.log(`🔄 Intentando cambiar estado a: ${shouldBlock ? 'bloqueado' : 'activo'}`)
      
      // Usar la función robusta para cambiar el estado
      await cambiarEstadoUsuario(id, currentEstado)
      
      console.log('✅ Estado cambiado exitosamente')
      setStatusMsg(`✅ Usuario ${shouldBlock ? 'bloqueado' : 'activado'} correctamente.`)
      
      // Recargar datos para reflejar el cambio
      console.log('🔄 Recargando lista de usuarios...')
      await load()
      
      console.log('=== PROCESO COMPLETADO ===')
      
    } catch (err) {
      console.error('❌ Error en handleBlockToggle:', err)
      console.error('Tipo de error:', err.tipo)
      console.error('Status:', err.status)
      console.error('Datos:', err.datos)
      
      // Manejar diferentes tipos de errores específicos
      let mensajeError = 'Error desconocido al cambiar estado del usuario'
      
      if (err.tipo === XANO_ERROR_TYPES.FATAL_ERROR) {
        mensajeError = 'Error fatal del servidor. El servidor Xano tiene problemas para procesar la solicitud. Contacta al administrador.'
      } else if (err.status === 400) {
        mensajeError = 'Datos inválidos. Verifica que el usuario tenga todos los campos requeridos.'
      } else if (err.status === 401) {
        mensajeError = 'Sesión expirada. Por favor, vuelve a iniciar sesión.'
      } else if (err.status === 403) {
        mensajeError = 'No tienes permisos para cambiar el estado de este usuario.'
      } else if (err.status === 404) {
        mensajeError = 'Usuario no encontrado en el servidor.'
      } else if (err.status === 500) {
        mensajeError = 'Error interno del servidor. Intenta refrescar la página o contacta al administrador si el problema persiste.'
      } else {
        mensajeError = err?.data?.message || err?.message || `Error ${shouldBlock ? 'bloqueando' : 'activando'} usuario (${err?.status || 'desconocido'}).`
      }
      
      console.error('🚨 Error final detectado:', mensajeError)
      setStatusMsg(`❌ ${mensajeError}`)
      
    } finally {
      setUiBusy(false)
    }
  }

  const handleDeleteUser = async (user) => {
    if (!canEdit) return
    
    const id = user.id || user.uuid || user._id
    
    try {
      setUiBusy(true)
      
      console.log('=== INICIANDO ELIMINACIÓN DE USUARIO ===')
      console.log('ID del usuario a eliminar:', id)
      
      // Usar la función robusta para eliminar
      await eliminarUsuarioRobusto(id)
      
      console.log('✅ Usuario eliminado exitosamente')
      setStatusMsg('✅ Usuario eliminado correctamente.')
      await load()
      
    } catch (err) {
      console.error('handleDeleteUser error:', err)
      console.error('Tipo de error:', err.tipo)
      console.error('Status:', err.status)
      console.error('Datos:', err.datos)
      
      // Manejar diferentes tipos de errores específicos
      let mensajeError = 'Error desconocido al eliminar usuario'
      
      if (err.tipo === XANO_ERROR_TYPES.FATAL_ERROR) {
        mensajeError = 'Error fatal del servidor. Contacta al administrador del sistema.'
      } else if (err.status === 400) {
        mensajeError = 'No se puede eliminar el usuario. Puede tener datos relacionados.'
      } else if (err.status === 401) {
        mensajeError = 'Sesión expirada. Por favor, vuelve a iniciar sesión.'
      } else if (err.status === 403) {
        mensajeError = 'No tienes permisos para eliminar usuarios.'
      } else if (err.status === 404) {
        mensajeError = 'Usuario no encontrado. Puede ya haber sido eliminado.'
      } else if (err.status === 500) {
        mensajeError = 'Error interno del servidor. Intenta refrescar la página o contacta al administrador.'
      } else {
        mensajeError = err?.data?.message || err?.message || `Error eliminando usuario (${err?.status || ''}).`
      }
      
      setStatusMsg(`❌ ${mensajeError}`)
    } finally {
      setUiBusy(false)
    }
  }

  const handleCreate = async (e) => {
    e?.preventDefault?.()
    if (!canCreate) return
    try {
      setUiBusy(true)
      await createUser({ 
        name: newName.trim(), 
        last_name: newLastName.trim(), 
        email: newEmail.trim(),
        password: newPassword, 
        direccion: newDireccion.trim(), 
        telefono: newTelefono.trim(),
        rol: newRol
      })
      
      // Limpiar formulario
      setNewName('')
      setNewLastName('')
      setNewEmail('')
      setNewPassword('')
      setNewDireccion('')
      setNewTelefono('')
      setNewRol('cliente')
      
      setStatusMsg('✅ Usuario creado correctamente.')
      await load()
    } catch (err) {
      console.error('createUser error', err)
      const msg = err?.data?.message || `Error creando usuario (${err?.status || ''}).`
      setStatusMsg(`❌ ${msg}`)
    } finally {
      setUiBusy(false)
    }
  }

  useEffect(() => { 
    console.log('=== AdminUsersPage MONTADO ===')
    console.log('Auth state:', isAuthenticated)
    console.log('Admin status:', isAdmin)
    console.log('Current user:', user)
    console.log('Current URL:', window.location.href)
    if (isAuthenticated) {
      console.log('✅ Usuario autenticado, cargando usuarios...')
      load() 
    } else {
      console.log('❌ Usuario no autenticado')
    }
  }, [isAuthenticated, isAdmin, user])

  if (!isAuthenticated) {
    console.log('Rendering not authenticated state')
    return (
      <main className="admin">
        <div className="admin__header">
          <h2>Panel de Usuarios</h2>
        </div>
        <p className="admin__hint">Debes iniciar sesión para gestionar usuarios.</p>
      </main>
    )
  }

  if (!isAdmin) {
    console.log('User is authenticated but not admin')
    return (
      <main className="admin">
        <div className="admin__header">
          <h2>Acceso Denegado</h2>
        </div>
        <p className="admin__hint">No tienes permisos de administrador para acceder a esta página.</p>
      </main>
    )
  }

  console.log('Rendering authenticated admin page')

  return (
    <main className="admin admin-users">
      <section className="admin-content">
        {/* Header del módulo */}
        <div className="admin-users__header">
          <div className="admin-users__titles">
            <div className="breadcrumb">Panel / Usuarios</div>
            <h2 className="admin-users__title">Gestión de Usuarios</h2>
            <p className="admin-users__subtitle">Administra clientes y personal del Bar Pirata</p>
          </div>
          <div className="admin-users__actions">
            <button 
              className="btn btn--gold" 
              onClick={() => document.getElementById('create-form').scrollIntoView({ behavior: 'smooth' })} 
              disabled={!canEdit || uiBusy}
            >
              ➕ Nuevo usuario
            </button>
            <button 
              className="btn" 
              onClick={load} 
              disabled={loading || uiBusy}
            >
              {loading ? '🔄 Actualizando…' : '🔄 Refrescar'}
            </button>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <section className="admin__section admin-users__stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Usuarios totales</div>
              </div>
            </div>
            <div className="stat-card stat-card--success">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-value">{stats.activos}</div>
                <div className="stat-label">Usuarios activos</div>
              </div>
            </div>
            <div className="stat-card stat-card--danger">
              <div className="stat-icon">🚫</div>
              <div className="stat-info">
                <div className="stat-value">{stats.bloqueados}</div>
                <div className="stat-label">Usuarios bloqueados</div>
              </div>
            </div>
            <div className="stat-card stat-card--warning">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <div className="stat-value">{stats.admins}</div>
                <div className="stat-label">Administradores</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mensajes de estado */}
        <section className="admin__section">
          {statusMsg && (
            <div className={`admin__status admin__status--${statusMsg.includes('❌') ? 'error' : 'success'}`}>
              {statusMsg}
            </div>
          )}
          
          {error && <div className="admin__error">❌ {error}</div>}
          
          {!canEdit && (
            <p className="admin__hint">ℹ️ Debes ser administrador para modificar usuarios. El listado es de solo lectura.</p>
          )}
        </section>

        {/* Formulario de creación */}
        {canEdit && (
          <section className="admin__section" id="create-form">
            <div className="admin__section-header">
              <h3>➕ Crear Nuevo Usuario</h3>
            </div>
            <form className="admin__form" onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Nombre *</label>
                  <input 
                    className="form-input" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    required 
                    disabled={uiBusy}
                  />
                </div>
                <div className="form-field">
                  <label>Apellido *</label>
                  <input 
                    className="form-input" 
                    value={newLastName} 
                    onChange={(e) => setNewLastName(e.target.value)} 
                    required 
                    disabled={uiBusy}
                  />
                </div>
                <div className="form-field">
                  <label>Email *</label>
                  <input 
                    className="form-input" 
                    type="email"
                    value={newEmail} 
                    onChange={(e) => setNewEmail(e.target.value)} 
                    required 
                    disabled={uiBusy}
                  />
                </div>
                <div className="form-field">
                  <label>Contraseña *</label>
                  <input 
                    className="form-input" 
                    type="password"
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    disabled={uiBusy}
                  />
                </div>
                <div className="form-field">
                  <label>Dirección</label>
                  <input 
                    className="form-input" 
                    value={newDireccion} 
                    onChange={(e) => setNewDireccion(e.target.value)} 
                    disabled={uiBusy}
                  />
                </div>
                <div className="form-field">
                  <label>Teléfono</label>
                  <input 
                    className="form-input" 
                    value={newTelefono} 
                    onChange={(e) => setNewTelefono(e.target.value)} 
                    disabled={uiBusy}
                  />
                </div>
                <div className="form-field">
                  <label>Rol</label>
                  <select 
                    className="form-input" 
                    value={newRol} 
                    onChange={(e) => setNewRol(e.target.value)}
                    disabled={uiBusy || true} // Deshabilitado para que solo se pueda crear clientes
                    title="El rol solo puede ser asignado por un administrador del sistema"
                  >
                    <option value="cliente">👤 Cliente</option>
                    <option value="administrador">⭐ Administrador</option>
                  </select>
                  <small>
                    ℹ️ Solo se pueden crear usuarios tipo Cliente desde aquí
                  </small>
                </div>
              </div>
              
              <div className="form-actions">
                <button className="btn btn--gold" type="submit" disabled={!canCreate || uiBusy}>
                  {uiBusy ? '⏳ Creando...' : '✅ Crear usuario'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filtros y búsqueda */}
        <section className="admin__section admin-users__toolbar">
          <div className="toolbar-row">
            <input
              className="form-input toolbar-search"
              placeholder="🔍 Buscar por nombre o email"
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

        {/* Lista de usuarios con edición inline */}
        <section className="admin__section">
          {loading && (
            <div className="admin__loading">
              <div className="spinner"></div>
              <p>Cargando usuarios...</p>
            </div>
          )}

          {items.length === 0 && !loading ? (
            <div className="admin__empty">
              <div className="empty-icon">👥</div>
              <h3>No hay usuarios para mostrar</h3>
              <p>{query ? 'Intenta con otro término de búsqueda' : 'Crea el primer usuario para comenzar'}</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table table--admin table--users">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre completo</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
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
                        String(u.name || '').toLowerCase().includes(q) ||
                        String(u.last_name || '').toLowerCase().includes(q) ||
                        String(u.email || '').toLowerCase().includes(q) ||
                        String(u.direccion || '').toLowerCase().includes(q) ||
                        String(u.telefono || '').toLowerCase().includes(q)
                      )
                    })
                    .filter((u) => {
                      if (filter === 'activos') return toUIEstado(u && (u.estado || u.status)) === 'activo'
                      if (filter === 'bloqueados') return toUIEstado(u && (u.estado || u.status)) === 'bloqueado'
                      if (filter === 'admins') return toUIRol(readRol(u)) === 'administrador'
                      return true
                    })
                    .sort((a,b) => {
                      if (sortBy === 'estado') return (toUIEstado(a && (a.estado || a.status))).localeCompare(toUIEstado(b && (b.estado || b.status)))
                      if (sortBy === 'fecha') return 0 // placeholder
                      const an = String((a.name || '') + ' ' + (a.last_name || '')).toLowerCase()
                      const bn = String((b.name || '') + ' ' + (b.last_name || '')).toLowerCase()
                      return an.localeCompare(bn)
                    })
                    .map((u) => {
                      const id = u.id || u.uuid || u._id
                      const isEditingThis = editingId === id
                      const estado = toUIEstado(u && (u.estado || u.status || 'activo'))
                      const rol = toUIRol(readRol(u) || 'cliente')
                      
                      return (
                        <tr key={id} className={`table__row--${estado === 'bloqueado' ? 'disabled' : 'active'}`}>
                          <td><span className="table__id">#{id}</span></td>
                          <td>
                            {isEditingThis ? (
                              <div className="inline-edit">
                                <input
                                  type="text"
                                  className="form-input form-input--inline"
                                  value={editForm.name || ''}
                                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                  placeholder="Nombre"
                                />
                                <input
                                  type="text"
                                  className="form-input form-input--inline"
                                  value={editForm.last_name || ''}
                                  onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                                  placeholder="Apellido"
                                />
                              </div>
                            ) : (
                              <div className="user-info">
                                <div className="user-name">{`${u.name || ''} ${u.last_name || ''}`.trim() || '—'}</div>
                              </div>
                            )}
                          </td>
                          <td>
                            {isEditingThis ? (
                              <input
                                type="email"
                                className="form-input form-input--inline"
                                value={editForm.email || ''}
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                placeholder="Email"
                              />
                            ) : (
                              <span className="table__email">{u.email || '—'}</span>
                            )}
                          </td>
                          <td>
                            {isEditingThis ? (
                              <input
                                type="text"
                                className="form-input form-input--inline"
                                value={editForm.telefono || ''}
                                onChange={(e) => setEditForm({...editForm, telefono: e.target.value})}
                                placeholder="Teléfono"
                              />
                            ) : (
                              u.telefono || '—'
                            )}
                          </td>
                          <td>
                            {isEditingThis ? (
                              <input
                                type="text"
                                className="form-input form-input--inline"
                                value={editForm.direccion || ''}
                                onChange={(e) => setEditForm({...editForm, direccion: e.target.value})}
                                placeholder="Dirección"
                              />
                            ) : (
                              <span className="table__address">{u.direccion || '—'}</span>
                            )}
                          </td>
                          <td>
                            {isEditingThis ? (
                              <select
                                className="form-input form-input--inline"
                                value={editForm.estado || 'activo'}
                                onChange={(e) => setEditForm({...editForm, estado: e.target.value})}
                              >
                                <option value="activo">🟢 Activo</option>
                                <option value="bloqueado">🔴 Bloqueado</option>
                              </select>
                            ) : (
                              <span className={`badge badge--${estado === 'activo' ? 'success' : 'danger'}`}>
                                {estado === 'activo' ? '🟢 Activo' : '🔴 Bloqueado'}
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditingThis ? (
                              <div className="role-readonly">
                                <span className={`badge badge--${editForm.rol === 'administrador' ? 'warning' : 'info'}`}>
                                  {editForm.rol === 'administrador' ? '⭐ Administrador' : '👤 Cliente'}
                                </span>
                                <small>
                                  ℹ️ Rol no modificable
                                </small>
                              </div>
                            ) : (
                              <span className={`badge badge--${rol === 'administrador' ? 'warning' : 'info'}`}>
                                {rol === 'administrador' ? '⭐ Administrador' : '👤 Cliente'}
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="table__actions">
                              {isEditingThis ? (
                                <>
                                  <button 
                                    className="btn btn--success btn--sm" 
                                    onClick={() => saveEdit(u)}
                                    disabled={uiBusy}
                                    title="Guardar cambios"
                                  >
                                    💾 Guardar
                                  </button>
                                  <button 
                                    className="btn btn--ghost btn--sm" 
                                    onClick={cancelEdit}
                                    disabled={uiBusy}
                                    title="Cancelar edición"
                                  >
                                    ❌ Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    className="btn btn--gold btn--sm btn-sm py-1 px-2 action-btn" 
                                    onClick={() => startEdit(u)} 
                                    disabled={!canEdit || uiBusy}
                                    title="Editar usuario"
                                  >
                                    ✏️ Editar
                                  </button>
                                  
                                  <button 
                                    className={`btn btn--sm btn-sm py-1 px-2 action-btn ${estado === 'activo' ? 'btn--amber' : 'btn--success'}`}
                                    onClick={() => {
                                      console.log('Botón bloquear/activar clickeado - Usuario:', u)
                                      console.log('Estado actual:', estado)
                                      console.log('canEdit:', canEdit)
                                      console.log('uiBusy:', uiBusy)
                                      handleBlockToggle(u)
                                    }} 
                                    disabled={!canEdit || uiBusy}
                                    title={estado === 'activo' ? 'Bloquear usuario' : 'Activar usuario'}
                                  >
                                    {estado === 'activo' ? '🚫 Bloquear' : '✅ Activar'}
                                  </button>
                                  
                                  <button 
                                    className="btn btn--danger btn--sm btn-sm py-1 px-2 action-btn" 
                                    onClick={() => handleDeleteUser(u)} 
                                    disabled={!canEdit || uiBusy}
                                    title="Eliminar usuario"
                                  >
                                    🗑️ Eliminar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
