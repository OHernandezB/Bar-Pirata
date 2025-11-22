import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'
import { useAuth } from '../context/AuthContext.jsx'
import { getProducts, deleteProduct, getCategories } from '../api/xano.js'
import ImageCarousel from '../components/ImageCarousel.jsx'

// --- Subida y flujo de creación: constantes de API locales (evitan conflictos de import) ---
const API_ORIGIN = 'https://x8ki-letl-twmt.n7.xano.io'
const API_BASE = `${API_ORIGIN}/api:SGvG01BZ`

export default function AdminProductsPage() {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoria_id: '', estado: true, category: '', tags: '' })
  const [imageFiles, setImageFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [catList, setCatList] = useState([])
  const [catOpen, setCatOpen] = useState(false)
  const [selectedCat, setSelectedCat] = useState(null)
  const catById = useMemo(() => {
    const m = new Map()
    for (const c of catList) {
      const idNum = Number(c.id)
      if (Number.isFinite(idNum)) m.set(idNum, c.name)
    }
    return m
  }, [catList])
  const canSubmit = useMemo(() => {
    const pOk = form.price !== '' && Number.isFinite(Number(form.price))
    const sOk = form.stock !== '' && Number.isFinite(Number(form.stock))
    return Boolean(form.name && pOk && sOk)
  }, [form])
  const canEdit = useMemo(() => !!isAdmin, [isAdmin])

  const didLoad = useRef(false)
  const didLoadCats = useRef(false)

  // Helpers para resolver imagen_url con prioridad estricta
  const isAbsUrl = (s) => typeof s === 'string' && /^https?:\/\//i.test(String(s).trim())
  const toFullPath = (p) => {
    if (!p) return ''
    const path = p.startsWith('/') ? p : `/${p}`
    return `${API_ORIGIN}${path}`
  }
  function resolveImagenUrl(row) {
    const withOrigin = (p) => (p ? `${API_ORIGIN}${p.startsWith('/') ? p : `/${p}`}` : '');

    // PRIORIDAD 1: imagen_upload (array real que entrega Xano)
    const up = row?.imagen_upload;
    if (Array.isArray(up) && up.length) {
      const i = up[0];
      if (i?.url) return i.url; // absoluta
      if (i?.path) return withOrigin(i.path); // construir absoluta
    }

    // PRIORIDAD 2: variantes antiguas por compatibilidad
    const arrays = [row?.imagen, row?.images, row?.imagenes];
    for (const arr of arrays) {
      if (Array.isArray(arr) && arr.length) {
        const i = arr[0];
        if (i?.url) return i.url;
        if (i?.path) return withOrigin(i.path);
      }
    }

    const obj = row?.imagen || row?.image;
    if (obj && typeof obj === 'object') {
      if (obj?.url) return obj.url;
      if (obj?.path) return withOrigin(obj.path);
    }

    if (typeof row?.url === 'string' && /^https?:\/\//i.test(row.url)) return row.url;
    if (typeof row?.path === 'string') return withOrigin(row.path);

    return '';
  }
  function resolveImagenes(row) {
    const urls = [];
    const pushImg = (o) => {
      if (!o) return;
      if (typeof o.url === 'string' && o.url.trim()) urls.push(o.url.trim());
      else if (typeof o.path === 'string' && o.path.trim()) urls.push(toFullPath(o.path.trim()));
    };
    const up = row?.imagen_upload;
    if (Array.isArray(up)) {
      for (const i of up) pushImg(i);
    }
    for (const arr of [row?.imagen, row?.images, row?.imagenes]) {
      if (Array.isArray(arr)) {
        for (const i of arr) pushImg(i);
      }
    }
    for (const obj of [row?.imagen, row?.image]) {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) pushImg(obj);
    }
    if (typeof row?.url === 'string' && /^https?:\/\//i.test(row.url)) urls.push(row.url);
    if (typeof row?.path === 'string') urls.push(toFullPath(row.path));
    return Array.from(new Set(urls.filter(Boolean)));
  }
  const normalizeCategory = (c) => {
    const id = c?.id ?? c?.id_categ ?? c?.categoria_id ?? c?.uuid ?? c?._id
    const name = c?.nombre_categ ?? c?.nombre ?? c?.name ?? c?.title
    return { id, name, raw: c }
  }
  const loadCats = async () => {
    try {
      const data = await getCategories()
      const arr = Array.isArray(data) ? data : (data?.items || [])
      const mapped = arr.map(normalizeCategory).filter(c => c.id != null && c.name)
      setCatList(mapped)
    } catch (err) {
      console.error('getCategories error', err)
    }
  }

  const formatErr = (err) => {
    try {
      const msg = err?.data?.message || err?.data?.error || err?.data?.detail || err?.data
      if (!msg) return ''
      return typeof msg === 'string' ? msg : JSON.stringify(msg)
    } catch { return '' }
  }

  const load = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const data = await getProducts()
      const arr = Array.isArray(data) ? data : (data?.items || [])
      const norm = arr.map((row) => {
        const id = row?.id // el backend usa id numérico
        const nombre = row?.nombre_product ?? '(sin nombre)'
        const precio = Number(row?.precio)
        const categoria_id = Number(row?.categoria_producto_id)
        const imagen_url = resolveImagenUrl(row)
        const imagenes_urls = resolveImagenes(row)
        const descripcion = row?.descripcion ?? row?.description ?? ''
        return {
          id,
          nombre,
          precio: Number.isFinite(precio) ? precio : null,
          categoria_id: Number.isFinite(categoria_id) ? categoria_id : null,
          imagen_url,
          imagenes_urls,
          descripcion,
        }
      })
      setItems(norm)
    } catch (err) {
      console.error('getProducts error', err)
      const texto = (() => {
        const d = err?.data
        if (!d) return ''
        return typeof d === 'string' ? d : JSON.stringify(d)
      })()
      setError(`Error ${err?.status || '??'}: ${texto}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && !didLoad.current) {
      didLoad.current = true
      load()
    }
  }, [isAuthenticated])
  useEffect(() => {
    if (isAuthenticated && !didLoadCats.current) {
      didLoadCats.current = true
      loadCats()
    }
  }, [isAuthenticated])

  // --- Subida de imágenes (multipart/form-data) y flujo de creación ---
  function getAuthToken() {
    // Ajusta si obtienes el token desde context/props
    return localStorage.getItem('token')
  }

  async function uploadSingleImage(file) {
    const token = getAuthToken()
    const formData = new FormData()
    // nombre EXACTO que espera Xano
    formData.append('content', file)

    const res = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // NO poner Content-Type en multipart, el navegador lo define solo
      },
      body: formData,
    })

    let data
    try {
      data = await res.json()
    } catch (e) {
      console.error('Error parseando JSON de /upload/image', e)
      throw new Error('Error al leer la respuesta del servidor al subir imagen')
    }

    console.log('Respuesta de /upload/image:', data)

    if (!res.ok) {
      const msg = data?.message || data?.error || 'Error al subir imagen'
      throw new Error(msg)
    }

    // Normalizar respuesta: siempre debe ser un array de metadatos
    let imagenes = null
    if (Array.isArray(data)) {
      imagenes = data
    } else if (Array.isArray(data?.data)) {
      imagenes = data.data
    } else if (Array.isArray(data?.images)) {
      imagenes = data.images
    } else if (data && typeof data === 'object') {
      // soporte por si Xano devuelve un solo objeto
      imagenes = [data]
    }

    if (!imagenes) {
      console.error('Formato inesperado en respuesta de /upload/image:', data)
      throw new Error('Respuesta inválida al subir imágenes')
    }

    return imagenes
  }

  async function uploadImageLote(files) {
    const todas = []
    for (const file of Array.from(files || [])) {
      const metadatos = await uploadSingleImage(file)
      todas.push(...metadatos)
    }
    return todas
  }

  const buildPayloadProducto = ({ nombre, descripcion, precio, stock, categoria_id, estado }) => {
    const nombreTrim = String(nombre || '').trim()
    if (!nombreTrim) throw new Error('El nombre es requerido')
    const descripcionVal = String(descripcion || '').trim()
    const precioNum = Number(precio)
    const stockNum = Number(stock)
    const categoriaNum = Number(categoria_id)
    const estadoBool = estado === undefined ? true : Boolean(estado)

    if (!Number.isFinite(precioNum) || precioNum <= 0) throw new Error('Precio debe ser > 0')
    if (!Number.isFinite(stockNum) || stockNum < 0) throw new Error('Stock debe ser >= 0')
    if (!Number.isFinite(categoriaNum) || categoriaNum <= 0) throw new Error('categoria_id debe ser > 0')

    return {
      descripcion: descripcionVal ? descripcionVal : null,
      precio: precioNum,
      stock: stockNum,
      categoria_id: categoriaNum,
      estado: estadoBool,
    }
  }

  // Flujo final con nombres EXACTOS del backend (nombre_product, categoria_producto_id, imagen_upload)
  const crearProductoConImagenes = async ({ nombre, codigo, descripcion, precio, stock, activo, categoriaId, files }) => {
    const token = getAuthToken()

    // 1) Crear producto SIN imágenes
    const bodyProducto = {
      nombre_product: String(nombre || '').trim(),
      codigo: String(codigo || ''),
      descripcion: String(descripcion || '').trim(),
      precio: Number(precio),
      stock: Number(stock),
      activo: Boolean(activo),
      categoria_producto_id: Number(categoriaId),
      imagen_upload: [],
    }

    const resCrear = await fetch(`${API_BASE}/producto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyProducto),
    })
    const dataCrear = await resCrear.json().catch(() => null)
    if (!resCrear.ok) {
      const msg = dataCrear?.message || dataCrear?.error || `Error al crear producto (${resCrear.status})`
      throw new Error(msg)
    }
    const productoId = dataCrear?.id
    if (!productoId) throw new Error('Xano no devolvió id de producto')

    // 2) Subir imágenes una por una
    const imagenes = await uploadImageLote(files || [])

    // 3) Asociar todas las imágenes al producto
    const resPatch = await fetch(`${API_BASE}/producto/${productoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imagen_upload: imagenes }),
    })
    const dataPatch = await resPatch.json().catch(() => null)
    if (!resPatch.ok) {
      const msg = dataPatch?.message || dataPatch?.error || `Error al asociar imágenes (${resPatch.status})`
      throw new Error(msg)
    }
    return { id: productoId }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!isAdmin) { alert('Se requiere rol admin para crear productos.'); return }
    if (!canSubmit) return
    setError('')
    try {
      const categoriaId = selectedCat?.id != null
        ? Number(selectedCat.id)
        : (Number.isFinite(Number(form.category)) ? Number(form.category) : (Number.isFinite(Number(form.categoria_id)) ? Number(form.categoria_id) : 1))

      const result = await crearProductoConImagenes({
        nombre: String(form.name || '').trim(),
        codigo: String(form.codigo || ''),
        descripcion: String(form.description || '').trim(),
        precio: Number(form.price),
        stock: Number(form.stock),
        activo: Boolean(form.estado),
        categoriaId: Number(categoriaId),
        files: imageFiles,
      })
      if (result) {
        alert('Producto creado correctamente')
        setForm({ name: '', description: '', price: '', stock: '', categoria_id: '', estado: true, category: '', tags: '' })
        setSelectedCat(null)
        setImageFiles([])
        await load()
      }
    } catch (err) {
      console.error(err)
      const msg = err?.message ?? 'Error al crear el producto'
      setError(msg)
      alert(msg)
    }
  }

  const handleFileSelect = (filesOrFile) => {
    if (!filesOrFile) return
    const list = filesOrFile instanceof File ? [filesOrFile] : Array.from(filesOrFile || [])
    const imgs = list.filter((f) => f.type?.startsWith('image/'))
    if (imgs.length === 0) {
      alert('Selecciona imágenes válidas (jpg, png, etc.).')
      return
    }
    setImageFiles(imgs)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) handleFileSelect(files)
  }

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }

  const handleDelete = async (id) => {
    if (!id) return
    if (!isAdmin) { alert('Se requiere rol admin para eliminar productos.'); return }
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await deleteProduct(id)
      await load()
    } catch (err) {
      console.error('deleteProduct error', err)
      alert('Error eliminando producto. Ver consola.')
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="admin">
        <div className="admin__header">
          <h2>Panel de Productos</h2>
        </div>
        <p className="admin__hint">Debes iniciar sesión para gestionar productos.</p>
      </main>
    )
  }

  return (
    <main className="admin">
      <div className="admin__header">
        <h2>Panel de Productos</h2>
        <div className="admin__actions">
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'Actualizando…' : 'Refrescar'}</button>
        </div>
      </div>
      {!canEdit && (
        <div className="admin__warning">Tu usuario no tiene permisos de edición/eliminación de productos.</div>
      )}

      <section className="admin__section">
        <h3>Crear producto</h3>
        {error && <div className="admin__error">{error}</div>}
        <form onSubmit={handleCreate} className="admin__form">
          <div className="form-field">
            <label>Nombre</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-field">
            <label>Precio</label>
            <input className="form-input" type="number" min="0" step="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
          </div>
          <div className="form-field">
            <label>Stock</label>
            <input className="form-input" type="number" min="0" step="1" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
          </div>
          <div className="form-field form-field--full">
            <label>Descripción</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Categoría</label>
            {catList.length > 0 ? (
              <select
                className="form-input"
                value={selectedCat?.id != null ? String(selectedCat.id) : ''}
                onChange={(e) => {
                  const v = e.target.value;
                  const c = catList.find((x) => String(x.id) === v) || null;
                  setSelectedCat(c);
                }}
              >
                <option value="">Selecciona categoría</option>
                {catList.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            ) : (
              <input className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Escribe la categoría si no carga el listado" />
            )}
          </div>
          <div className="form-field">
            <label>Categoría ID (opcional si seleccionaste arriba)</label>
            <input className="form-input" type="number" min="1" step="1" value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))} placeholder="Ingresa el ID si no aparece el listado" />
          </div>
          <div className="form-field">
            <label>Activo</label>
            <input type="checkbox" checked={Boolean(form.estado)} onChange={e => setForm(f => ({ ...f, estado: e.target.checked }))} />
          </div>
          <div className="form-field">
            <label>Tags (coma)</label>
            <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="ej: clásico, artesanal" />
          </div>
          <div className="form-field form-field--full">
            <label>Imágenes del producto (mínimo 3)</label>
            <div
              className={`admin__dropzone ${isDragging ? 'is-dragging' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => document.getElementById('product-image-input')?.click()}
            >
              {imageFiles.length > 0 ? (
                <div className="admin__dropzone-preview">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="admin__dropzone-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={URL.createObjectURL(file)} alt={`Vista ${idx + 1}`} className="admin__thumb admin__thumb--lg" />
                        <span style={{ fontSize: 12 }}>{file.name}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <button type="button" className="btn btn--ghost" onClick={() => setImageFiles([])}>Quitar imágenes</button>
                  </div>
                </div>
              ) : (
                <div className="admin__dropzone-hint">
                  <span>Arrastra 3+ imágenes aquí o haz clic para seleccionar</span>
                </div>
              )}
              <input
                id="product-image-input"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={!canSubmit || !canEdit}>Crear</button>
          </div>
        </form>
      </section>

      <section className="admin__section">
        <div className="admin__subheader">
          <h3>Lista de productos</h3>
          <input
            className="form-input admin__search"
            placeholder="Buscar por nombre o categoría"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {loading && <p className="admin__status">Cargando…</p>}
        {error && <div className="admin__error">{error}</div>}

        {items.length === 0 && !loading ? (
          <div className="admin__empty">No hay productos aún. Crea el primero arriba.</div>
        ) : (
          <table className="table table--admin">
            <thead>
              <tr>
                <th>ID</th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter((p) => {
                  const q = query.trim().toLowerCase()
                  if (!q) return true
                  return (
                    String(p.nombre || p.name || '').toLowerCase().includes(q) ||
                    String(p.categoria || p.category || '').toLowerCase().includes(q)
                  )
                })
                .map((p) => (
                  <tr key={p.id || p.uuid || p._id}>
                    <td>{p.id || p.uuid || p._id}</td>
                    <td>
                      {(() => {
                        const imgs = Array.isArray(p.imagenes_urls) && p.imagenes_urls.length > 0
                          ? p.imagenes_urls
                          : ((typeof p.imagen_url === 'string' && p.imagen_url.trim()) ? [p.imagen_url] : [])
                        return <ImageCarousel images={imgs} />
                      })()}
                    </td>
                    <td>
                      <div className="table__cell-title">{p.nombre || p.name || '—'}</div>
                      {(p.descripcion || p.description) && (
                        <div className="table__cell-desc">{p.descripcion || p.description}</div>
                      )}
                    </td>
                    <td className="table__cell-price">{p.precio ?? p.price ?? '—'}</td>
                    <td>
                      {(() => {
                        const name = p.categoria_id != null ? catById.get(Number(p.categoria_id)) : (p.categoria || p.category)
                        return name ? (
                          <span className="badge">{name}</span>
                        ) : (
                          <span className="badge badge--muted">—</span>
                        )
                      })()}
                    </td>
                    <td>
                      <button className="btn btn--danger" onClick={() => handleDelete(p.id || p.uuid || p._id)} disabled={!canEdit}>Eliminar</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}

// testMinimo eliminado: flujo de creación unificado en crearProductoDesdeUpload dentro de la página.

// (moved helpers inside component scope)