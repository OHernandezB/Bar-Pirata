// Cliente Xano con dos baseURL: AUTH y API
// Defaults alineados con .env.example: AUTH -> Jf-BHmdB, API -> SGvG01BZ
export const AUTH_BASE = (import.meta.env.VITE_XANO_AUTH_BASE_URL || 'https://x8ki-letl-twmt.n7.xano.io/api:Jf-BHmdB').replace(/\/$/, '')
export const API_BASE  = (import.meta.env.VITE_XANO_API_BASE_URL  || 'https://x8ki-letl-twmt.n7.xano.io/api:SGvG01BZ').replace(/\/$/, '')
export const API_ORIGIN = (() => { try { return new URL(API_BASE).origin } catch { const m = API_BASE.match(/^https?:\/\/[^/]+/i); return m ? m[0] : '' } })()

// Paths configurables (permiten seguir rutas exactas del backend)
const PASSWORD_CHANGE_PATH = (import.meta.env.VITE_XANO_PASSWORD_CHANGE_PATH || '/auth/password_change')
const CHECK_EMAIL_PATH     = (import.meta.env.VITE_XANO_CHECK_EMAIL_PATH     || '/auth/check_email')

export let AUTH_TOKEN = ''
export function setAuthToken(token) { 
  AUTH_TOKEN = token || ''; 
  if (token) { 
    try { 
      localStorage.setItem('authToken', token); // Usar 'authToken' consistentemente
    } catch {} 
  } else { 
    try { 
      localStorage.removeItem('authToken'); 
    } catch {} 
  } 
}

function buildHeaders(extra = {}, forceAuth = false) {
  const headers = { Accept: 'application/json', ...extra }
  if (forceAuth || !headers.Authorization) {
    // Asegurar que el token esté actualizado desde localStorage
    const token = localStorage.getItem('authToken') || AUTH_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers
}

function withQuery(url, params) {
  if (!params) return url
  const qs = new URLSearchParams(params).toString()
  return qs ? `${url}?${qs}` : url
}

async function doFetch(base, path, { method = 'GET', params, body, headers } = {}) {
  const url = withQuery(`${base}${path}`, params)
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const init = {
    method,
    headers: isFormData ? buildHeaders(headers) : buildHeaders({ 'Content-Type': 'application/json', ...headers }),
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  }
  const res = await fetch(url, init)
  const text = await res.text()
  let data; try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) { const err = new Error(`Xano error ${res.status}`); err.status = res.status; err.data = data; throw err }
  return data
}

const xFetchAuth = (path, opts) => doFetch(AUTH_BASE, path, opts)
const xFetchApi  = (path, opts) => doFetch(API_BASE,  path, opts)

// Autenticación a AUTH_BASE 
async function fetchAuthPath(path, opts) {
  // Todo lo de /auth/* debe ir exclusivamente al grupo de autenticación (Jf-BHmdB)
  return doFetch(AUTH_BASE, path, opts);
}

// Utils
function formDataToObject(fd, exclude = []) {
  const obj = {}
  for (const [k, v] of fd.entries()) {
    if (exclude.includes(k)) continue
    if (typeof v === 'string') { try { obj[k] = JSON.parse(v) } catch { obj[k] = v } } else { obj[k] = v }
  }
  return obj
}
function ensureImageUrl(val) {
  const url = typeof val === 'string' ? val : (val?.url || val?.path || '')
  if (!url) return val
  // Ya es absoluta
  if (/^https?:\/\//.test(url)) return typeof val === 'string' ? url : { ...val, url }
  // Rutas de assets estáticos del frontend (no prefijar con Xano)
  if (/^\/?IMG\//i.test(url)) {
    const path = url.startsWith('/') ? url : `/${url}`
    return typeof val === 'string' ? path : { ...val, url: path }
  }
  const full = `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`
  return typeof val === 'string' ? full : { ...val, url: full }
}

const isNumericId = (v) => (typeof v === 'number') || (typeof v === 'string' && /^\d+$/.test(v))
function appendCacheBust(url, v) {
  if (!url || !v) return url
  try { const u = new URL(url); u.searchParams.set('v', String(v)); return u.toString() } catch { const sep = url.includes('?') ? '&' : '?'; return `${url}${sep}v=${encodeURIComponent(String(v))}` }
}

async function resolveImageCandidate(val) {
  const s = typeof val === 'string' ? val : (val?.url || val?.path || '')
  if (!s) return ''
  return ensureImageUrl(s)
}

async function normalizeProduct(p) {
  const v = p?.updated_at ?? p?.updatedAt ?? p?.updated ?? p?.id
  const candidates = []
  if (Array.isArray(p?.imagenes)) candidates.push(...p.imagenes)
  if (Array.isArray(p?.images)) candidates.push(...p.images)
  if (p?.imagen) candidates.push(p.imagen)
  if (p?.image) candidates.push(p.image)
  if (p?.image_url) candidates.push(p.image_url)
  if (p?.imagen_url) candidates.push(p.imagen_url)
  // Soporte a posibles campos individuales
  if (p?.imagen1) candidates.push(p.imagen1)
  if (p?.imagen2) candidates.push(p.imagen2)
  if (p?.imagen3) candidates.push(p.imagen3)
  if (p?.image1) candidates.push(p.image1)
  if (p?.image2) candidates.push(p.image2)
  if (p?.image3) candidates.push(p.image3)
  // Búsqueda genérica de claves con 'imagen' o 'image'
  for (const k of Object.keys(p || {})) {
    if (/^(imagen|image)(_url)?$/i.test(k)) {
      const v = p[k]
      if (v && !candidates.includes(v)) candidates.push(v)
    }
  }
  const urlsRaw = await Promise.all(candidates.filter(Boolean).map(resolveImageCandidate))
  const urls = urlsRaw.filter(Boolean).map(u => v ? appendCacheBust(u, v) : u)
  const primary = urls[0] || ''
  return { ...p, imagenes: urls, image: primary, image_url: primary }
}

// Auth (AUTH BASE)
export const signup = (payload) => fetchAuthPath('/auth/signup', { method: 'POST', body: payload })
export const login  = ({ email, password }) => fetchAuthPath('/auth/login', { method: 'POST', body: { email, password } })
export const getMe = async () => {
  // Leer el token directamente de localStorage para asegurar consistencia
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('No hay token de autenticación disponible');
  }
  
  // Asegurar que el token global esté sincronizado
  AUTH_TOKEN = token;
  
  try {
    const data = await fetchAuthPath('/auth/me', {
      method: 'GET',
      headers: buildHeaders({}, true)
    });
    
    // Manejar diferentes formatos de respuesta que Xano puede devolver
    const userData = data?.Self || data?.user || data?.User || data?.data || data;
    
    // Validar que tengamos datos de usuario válidos
    if (!userData || typeof userData !== 'object') {
      console.error('Formato de respuesta inesperado de /auth/me:', data);
      throw new Error('Respuesta inválida de /auth/me');
    }
    
    console.log('✅ /auth/me respuesta exitosa');
    return userData;
  } catch (error) {
    console.error('❌ Error en getMe:', error);
    throw error;
  }
};

// Catálogo (API BASE)
export const getProducts = async (params) => {
  const data = await xFetchApi('/producto', { method: 'GET', params })
  const arr = Array.isArray(data) ? data : (data?.items || [])
  const resolved = await Promise.all(arr.map(normalizeProduct))
  return resolved
}
export const getProduct  = async (id) => {
  const p = await xFetchApi(`/producto/${id}`, { method: 'GET' })
  return p ? normalizeProduct(p) : p
}

// Uploads (API BASE)
export const getUpload = async (id) => {
  if (id == null) return null
  const upId = Array.isArray(id) ? id[0] : id
  try {
    const data = await xFetchApi(`/upload/${upId}`, { method: 'GET' })
    return data
  } catch (err) {
    // No romper flujo si falla la imagen
    return null
  }
}

function augmentPayloadCompat(obj) {
  const data = { ...obj }
  if (data.name && !data.nombre) data.nombre = data.name
  // Asegurar siempre 'nombre_product'
  if (!data.nombre_product) {
    if (data.nombre) data.nombre_product = data.nombre
    else if (data.name) data.nombre_product = data.name
  }
  if (typeof data.price !== 'undefined' && !data.precio) data.precio = Number(data.price)
  if (data.category && !data.categoria) data.categoria = data.category
  const catId = [data.categoria_producto_id, data.categoriaId, data.category_id].find(v => isNumericId(v))
  if (catId != null) data.categoria_producto_id = Number(catId)
  if (Array.isArray(data.tags)) data.tags = data.tags.join(',')
  if (Array.isArray(data.imagenes) && data.imagenes.length > 0) {
    const [i1,i2,i3] = data.imagenes
    if (i1 && !data.imagen) data.imagen = i1
    if (i1 && !data.image) data.image = i1
    if (!data.imagen_url) data.imagen_url = i1
    if (!data.image_url) data.image_url = i1
    if (!data.imagen1) data.imagen1 = i1
    if (i2 && !data.imagen2) data.imagen2 = i2
    if (i3 && !data.imagen3) data.imagen3 = i3
  }
  return data
}
export const updateProduct = (id, payload) => xFetchApi(`/producto/${id}`, { method: 'PUT', body: payload })
export const deleteProduct = (id) => xFetchApi(`/producto/${id}`, { method: 'DELETE' })

// Categoría de Producto (API BASE)
export const getCategories = () => xFetchApi('/categoria_producto', { method: 'GET' })
export const getCategory  = (id) => xFetchApi(`/categoria_producto/${id}`, { method: 'GET' })
export const createCategory = (payload) => xFetchApi('/categoria_producto', { method: 'POST', body: payload })
export const updateCategory = (id, payload) => xFetchApi(`/categoria_producto/${id}`, { method: 'PATCH', body: payload })
export const deleteCategory = (id) => xFetchApi(`/categoria_producto/${id}`, { method: 'DELETE' })

// Usuarios (API BASE) — solo si existe
export const getUsers  = (params) => xFetchApi('/usuario', { method: 'GET', params, headers: buildHeaders({}, true) })
export const getUser   = (id) => xFetchApi(`/usuario/${id}`, { method: 'GET', headers: buildHeaders({}, true) })
// Permite actualizar cualquier campo del usuario (nombre, email, estado, rol, etc.)
export const updateUser = (id, payload) => xFetchApi(`/usuario/${id}`, { method: 'PATCH', body: payload, headers: buildHeaders({}, true) })
export const deleteUser = (id) => xFetchApi(`/usuario/${id}`, { method: 'DELETE', headers: buildHeaders({}, true) })

// Crear usuario (rol fijo cliente, estado por defecto activo)
export const createUser = async (payload) => {
  const body = {
    name: (payload?.name ?? '').toString().trim(),
    last_name: (payload?.last_name ?? '').toString().trim(),
    password: (payload?.password ?? '').toString(),
    direccion: (payload?.direccion ?? '').toString().trim(),
    telefono: (payload?.telefono ?? '').toString().trim(),
    estado: (payload?.estado ?? 'activo'),
    // rol no modificable desde la app: lo omito o el backend fija por defecto
  }
  return xFetchApi('/usuario', { method: 'POST', body, headers: buildHeaders({}, true) })
}

// Helpers de bloqueo - DEPRECATED: Usar updateUser directamente con datos completos
export const blockUser = (id) => updateUser(id, { estado: 'bloqueado' })
export const unblockUser = (id) => updateUser(id, { estado: 'activo' })

// Administración de Usuarios (API BASE) — rutas /admin/usuarios con JWT
export const adminListUsers = (params) => xFetchApi('/admin/usuarios', {
  method: 'GET',
  params,
  headers: buildHeaders({}, true)
})

export const adminCreateUser = (payload) => {
  const body = {
    nombre: (payload?.nombre ?? payload?.name ?? '').toString().trim(),
    email: (payload?.email ?? '').toString().trim().toLowerCase(),
    password: (payload?.password ?? '').toString(),
    estado: (payload?.estado ?? 'activo'),
    rol: (payload?.rol ?? 'cliente'),
  }
  return xFetchApi('/admin/usuarios', { method: 'POST', body, headers: buildHeaders({}, true) })
}

export const adminUpdateUser = (id, payload) => {
  const body = {}
  if (typeof payload?.nombre !== 'undefined') body.nombre = payload.nombre
  if (typeof payload?.email !== 'undefined') body.email = String(payload.email || '').trim().toLowerCase()
  if (typeof payload?.rol !== 'undefined') body.rol = payload.rol
  if (typeof payload?.estado !== 'undefined') body.estado = payload.estado
  return xFetchApi(`/admin/usuarios/${id}`, { method: 'PATCH', body, headers: buildHeaders({}, true) })
}

export const adminDeleteUser = (id) => xFetchApi(`/admin/usuarios/${id}`, { method: 'DELETE', headers: buildHeaders({}, true) })

export const adminBlockUser = (id) => adminUpdateUser(id, { estado: 'bloqueado' })
export const adminUnblockUser = (id) => adminUpdateUser(id, { estado: 'activo' })

export const requestPasswordReset = async (email) => {
  try {
    await fetchAuthPath('/auth/password_reset', { method: 'POST', body: { email } })
    return true
  } catch (err) {
    console.warn('requestPasswordReset fallback (endpoint ausente o distinto)', err)
    // Por seguridad UX, no revelamos si el correo existe.
    return true
  }
}

export const checkEmailRegistered = async (email) => {
  const norm = String(email || '').trim().toLowerCase()
  try {
    const res = await fetchAuthPath(CHECK_EMAIL_PATH, { method: 'POST', body: { email } })
    return !!(res?.exists ?? res?.ok ?? res === true)
  } catch (err) {
    try {
      const data = await xFetchApi('/usuario', { method: 'GET', params: { email } })
      const arr = Array.isArray(data) ? data : (data?.items || [])
      return arr.some(u => String(u?.email || '').trim().toLowerCase() === norm)
    } catch (e) {
      console.warn('checkEmailRegistered fallback: no endpoint/permiso, devolviendo true para UX', e)
      return true
    }
  }
}

export const changePassword = async (email, password) => {
  const payload = { email, password }
  const candidates = [
    PASSWORD_CHANGE_PATH,
    '/auth/password_change',
    '/auth/change_password',
    '/auth/password/update',
    '/auth/password'
  ]

  // Intentar endpoints de autenticación (públicos o con reglas propias)
  for (const path of candidates) {
    try {
      const res = await fetchAuthPath(path, { method: 'POST', body: payload })
      return !!(res?.ok ?? true)
    } catch (err) {
      // Si el endpoint no existe (404), probar el siguiente. Otros errores, propagar.
      if (err?.status && err.status !== 404) throw err
    }
  }

  // Último recurso: actualizar el registro de usuario directamente (requiere permisos/admin)
  try {
    const list = await xFetchApi('/usuario', { method: 'GET', params: { email } })
    const arr = Array.isArray(list) ? list : (list?.items || [])
    const norm = String(email || '').trim().toLowerCase()
    const user = arr.find(u => String(u?.email || '').trim().toLowerCase() === norm)
    if (!user || !isNumericId(user.id)) throw new Error('Usuario no encontrado para actualizar la contraseña')

    try {
      await xFetchApi(`/usuario/${user.id}`, { method: 'PUT', body: { password } })
      return true
    } catch (errPut) {
      await xFetchApi(`/usuario/${user.id}`, { method: 'PATCH', body: { password } })
      return true
    }
  } catch (err) {
    throw new Error('No se pudo actualizar la contraseña en el servidor. Configura un endpoint /auth para cambio de contraseña o habilita permisos de actualización en /usuario.')
  }
}

// Ordenes (API BASE) - para el cliente
export const createOrder = async (orderData) => {
  try {
    const body = {
      items: orderData.items || [],
      total: orderData.total || 0,
      cliente_nombre: orderData.nombre || '',
      cliente_email: orderData.email || '',
      cliente_telefono: orderData.telefono || '',
      cliente_direccion: orderData.direccion || '',
      notas: orderData.notas || '',
      estado: 'pendiente'
    }
    return xFetchApi('/orden', { method: 'POST', body, headers: buildHeaders({}, true) })
  } catch (error) {
    console.error('Error en createOrder:', error)
    throw error
  }
}

// Confirmar pedido (cierra carrito y crea ORDEN + ORDEN_ITEM)
export const confirmPedido = async () => {
  return xFetchApi('/confirmar_pedido', { method: 'POST', headers: buildHeaders({}, true), body: {} })
}

// Listar órdenes
export const getOrdenes = async (params) => {
  const data = await xFetchApi('/orden', { method: 'GET', params, headers: buildHeaders({}, true) })
  const arr = Array.isArray(data) ? data : (data?.items || [])
  return arr
}

// Actualizar estado de una orden
export const updateOrden = async (id, payload) => {
  return xFetchApi(`/orden/${id}`, { method: 'PATCH', body: payload, headers: buildHeaders({}, true) })
}

// Carrito (API BASE)
// Nota: Estos helpers prueban múltiples rutas candidatas para alinearse con Xano real
// Base de API: API_BASE (p.ej. https://.../api:SGvG01BZ)
// Endpoints candidatos documentados:
//   GET  /carrito/actual            → carrito abierto del usuario
//   GET  /carrito                   → carrito actual (algunos proyectos)
//   GET  /cart/current              → alias en inglés
//   POST /carrito/agregar_item      → agregar o actualizar item
//   POST /carrito/item              → crear item
//   POST /cart/add_item             → alias en inglés
//   PATCH/DELETE /carrito/item/{id} → actualizar/eliminar item
//   PATCH/DELETE /item_carrito/{id} → alternativa
export const getCarritoActual = async () => {
  const candidates = ['/carrito/actual', '/carrito', '/cart/current']
  for (const path of candidates) {
    try {
      const data = await xFetchApi(path, { method: 'GET', headers: buildHeaders({}, true) })
      return data
    } catch (err) {
      if (err?.status && err.status !== 404 && err.status !== 400) throw err
    }
  }
  const e = new Error('No se pudo obtener el carrito actual (verifica rutas en Xano)')
  e.code = 'CART_FETCH_FAILED'
  throw e
}

export const agregarItemCarrito = async ({ producto_id, cantidad }) => {
  const bodyVariants = [
    { producto_id, cantidad },
    { id_producto: producto_id, cantidad },
  ]
  const candidates = ['/carrito/agregar_item', '/carrito/item', '/cart/add_item']
  for (const body of bodyVariants) {
    for (const path of candidates) {
      try {
        const res = await xFetchApi(path, { method: 'POST', body, headers: buildHeaders({}, true) })
        return res
      } catch (err) {
        if (err?.status && err.status !== 404 && err.status !== 400) throw err
      }
    }
  }
  const e = new Error('No se pudo agregar el producto al carrito (verifica rutas/params en Xano)')
  e.code = 'CART_ADD_FAILED'
  throw e
}

export const actualizarItemCarrito = async (itemId, payload) => {
  const candidates = [`/carrito/item/${itemId}`, `/item_carrito/${itemId}`]
  for (const path of candidates) {
    try {
      return await xFetchApi(path, { method: 'PATCH', body: payload, headers: buildHeaders({}, true) })
    } catch (err) {
      if (err?.status && err.status !== 404 && err.status !== 400) throw err
    }
  }
  const e = new Error('No se pudo actualizar el item del carrito')
  e.code = 'CART_UPDATE_FAILED'
  throw e
}

export const eliminarItemCarrito = async (itemId) => {
  const candidates = [`/carrito/item/${itemId}`, `/item_carrito/${itemId}`]
  for (const path of candidates) {
    try {
      return await xFetchApi(path, { method: 'DELETE', headers: buildHeaders({}, true) })
    } catch (err) {
      if (err?.status && err.status !== 404 && err.status !== 400) throw err
    }
  }
  const e = new Error('No se pudo eliminar el item del carrito')
  e.code = 'CART_DELETE_FAILED'
  throw e
}
