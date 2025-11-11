import { API_ORIGIN } from '../api/xano.js'
const BASE_URL = (import.meta.env.VITE_XANO_BASE_URL || API_ORIGIN || '').replace(/\/$/, '')

function isAbs(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim())
}

function unwrap(u) {
  if (!u) return ''
  if (typeof u === 'string') return u
  if (typeof u === 'object') {
    return u.url || u.path || u.href || ''
  }
  return ''
}

export function resolveImageUrl(pathOrUrl) {
  const raw = unwrap(pathOrUrl)
  if (!raw || raw.trim().length === 0) return '/IMG/logo-bar-pirata.png'
  if (isAbs(raw)) return raw
  if (!BASE_URL) return raw.startsWith('/') ? raw : `/${raw}`
  const path = raw.startsWith('/') ? raw : `/${raw}`
  return `${BASE_URL}${path}`
}

export function getProductMainImage(product) {
  try {
    const primaryIndex = (typeof product?.primaryImageIndex === 'number') ? product.primaryImageIndex : null

    const candidates = []

    // Prioridad: imagen_upload (Xano upload objects con url/path)
    if (Array.isArray(product?.imagen_upload) && product.imagen_upload.length > 0) {
      if (primaryIndex != null && primaryIndex >= 0 && primaryIndex < product.imagen_upload.length) {
        candidates.push(product.imagen_upload[primaryIndex])
      }
      candidates.push(...product.imagen_upload)
    } else if (product?.imagen_upload && typeof product.imagen_upload === 'object') {
      candidates.push(product.imagen_upload)
    }

    // Arrays comunes
    if (Array.isArray(product?.images)) candidates.push(...product.images)
    if (Array.isArray(product?.imagenes)) candidates.push(...product.imagenes)
    if (Array.isArray(product?.imagen)) candidates.push(...product.imagen)

    // Objetos/campos individuales
    if (product?.image) candidates.push(product.image)
    if (product?.imagen) candidates.push(product.imagen)
    if (product?.image_url) candidates.push(product.image_url)
    if (product?.imagen_url) candidates.push(product.imagen_url)

    // Variantes numeradas
    if (product?.imagen1) candidates.push(product.imagen1)
    if (product?.imagen2) candidates.push(product.imagen2)
    if (product?.imagen3) candidates.push(product.imagen3)
    if (product?.image1) candidates.push(product.image1)
    if (product?.image2) candidates.push(product.image2)
    if (product?.image3) candidates.push(product.image3)

    // Miniaturas genéricas
    if (product?.thumbnail) candidates.push(product.thumbnail)
    if (product?.thumb_url) candidates.push(product.thumb_url)
    if (product?.miniatura_url) candidates.push(product.miniatura_url)

    // Fallbacks genéricos (por si el backend devuelve path/url sueltos)
    if (product?.url) candidates.push(product.url)
    if (product?.path) candidates.push(product.path)

    for (const c of candidates) {
      const u = unwrap(c)
      if (u && u.trim()) return u
    }
    return ''
  } catch {
    return ''
  }
}

export function getProductImages(product) {
  try {
    const urls = []
    const pushVal = (val) => {
      if (!val) return
      if (typeof val === 'string') {
        const u = resolveImageUrl(val)
        if (u) urls.push(u)
      } else if (typeof val === 'object') {
        const raw = val.url || val.path || ''
        const u = raw ? resolveImageUrl(raw) : ''
        if (u) urls.push(u)
      }
    }

    // Prioridad: imagen_upload (Xano upload objects con url/path)
    const up = product?.imagen_upload
    if (Array.isArray(up)) up.forEach(pushVal)
    else if (up && typeof up === 'object') pushVal(up)

    // Arrays comunes
    ;[product?.imagenes, product?.images, product?.imagen].forEach((arr) => {
      if (Array.isArray(arr)) arr.forEach(pushVal)
    })

    // Objetos/campos individuales
    ;[product?.imagen, product?.image].forEach((obj) => {
      if (obj && !Array.isArray(obj)) pushVal(obj)
    })
    ;[product?.image_url, product?.imagen_url, product?.url, product?.path].forEach(pushVal)

    // Variantes numeradas
    ;[product?.imagen1, product?.imagen2, product?.imagen3, product?.image1, product?.image2, product?.image3].forEach(pushVal)

    const unique = Array.from(new Set(urls.filter(Boolean)))
    return unique
  } catch {
    return []
  }
}