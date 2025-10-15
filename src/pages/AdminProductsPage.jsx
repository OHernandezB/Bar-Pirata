import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'
import { useAuth } from '../context/AuthContext.jsx'
import { getProducts, createProduct, deleteProduct } from '../api/xano.js'

export default function AdminProductsPage() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', tags: '' })
  const [imageFile, setImageFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const canSubmit = useMemo(() => form.name && form.price, [form])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProducts()
      const arr = Array.isArray(data) ? data : (data?.items || [])
      setItems(arr)
    } catch (err) {
      console.error('getProducts error', err)
      setError('No se pudieron cargar productos. Revisa configuración de Xano y CORS.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAll = async () => {
    if (items.length === 0) return
    if (!confirm('¿Eliminar TODOS los productos? Esta acción es irreversible.')) return
    setLoading(true)
    try {
      for (const p of items) {
        const id = p.id || p.uuid || p._id
        if (id) {
          try { await deleteProduct(id) } catch (err) { console.error('deleteProduct error', id, err) }
        }
      }
      await load()
    } catch (err) {
      console.error('bulk delete error', err)
      alert('Error al eliminar todos los productos. Ver consola.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (isAuthenticated) load() }, [isAuthenticated])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      const tagsArr = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      if (imageFile) {
        const fd = new FormData()
        fd.append('name', form.name)
        fd.append('price', String(Number(form.price)))
        if (form.description) fd.append('description', form.description)
        if (form.category) fd.append('category', form.category)
        if (tagsArr.length > 0) fd.append('tags', JSON.stringify(tagsArr))
        fd.append('image', imageFile)
        await createProduct(fd)
      } else {
        const payload = {
          name: form.name,
          description: form.description || undefined,
          price: Number(form.price),
          category: form.category || undefined,
          tags: tagsArr.length > 0 ? tagsArr : undefined,
        }
        await createProduct(payload)
      }
      setForm({ name: '', description: '', price: '', category: '', tags: '' })
      setImageFile(null)
      await load()
    } catch (err) {
      console.error('createProduct error', err)
      alert('Error creando producto. Ver consola.')
    }
  }

  const handleFileSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Selecciona una imagen válida (jpg, png, etc.).')
      return
    }
    setImageFile(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }

  const handleDelete = async (id) => {
    if (!id) return
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
          <button className="btn btn--danger" onClick={handleDeleteAll} disabled={loading || items.length === 0}>Eliminar todos</button>
          <button className="btn btn--ghost" onClick={() => { logout(); navigate('/login'); }}>Salir</button>
        </div>
      </div>

      <section className="admin__section">
        <h3>Crear producto</h3>
        <form onSubmit={handleCreate} className="admin__form">
          <div className="form-field">
            <label>Nombre</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-field">
            <label>Precio</label>
            <input className="form-input" type="number" min="0" step="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
          </div>
          <div className="form-field form-field--full">
            <label>Descripción</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Categoría</label>
            <input className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Tags (coma)</label>
            <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="ej: clásico, artesanal" />
          </div>
          <div className="form-field form-field--full">
            <label>Imagen del producto</label>
            <div
              className={`admin__dropzone ${isDragging ? 'is-dragging' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => document.getElementById('product-image-input')?.click()}
            >
              {imageFile ? (
                <div className="admin__dropzone-preview">
                  <img src={URL.createObjectURL(imageFile)} alt="Vista previa" className="admin__thumb admin__thumb--lg" />
                  <div className="admin__dropzone-meta">
                    <span>{imageFile.name}</span>
                    <button type="button" className="btn btn--ghost" onClick={() => setImageFile(null)}>Quitar</button>
                  </div>
                </div>
              ) : (
                <div className="admin__dropzone-hint">
                  <span>Arrastra una imagen aquí o haz clic para seleccionar</span>
                </div>
              )}
              <input
                id="product-image-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={!canSubmit}>Crear</button>
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
                    String(p.name || '').toLowerCase().includes(q) ||
                    String(p.category || '').toLowerCase().includes(q)
                  )
                })
                .map((p) => (
                  <tr key={p.id || p.uuid || p._id}>
                    <td>{p.id || p.uuid || p._id}</td>
                    <td>
                      {(() => { const u = p?.image?.url || p?.image_url || (typeof p?.image === 'string' ? p.image : ''); return u ? <img src={u} alt={p.name} className="admin__thumb" /> : <span className="badge badge--muted">—</span>; })()}
                    </td>
                    <td>
                      <div className="table__cell-title">{p.name}</div>
                      {p.description && (
                        <div className="table__cell-desc">{p.description}</div>
                      )}
                    </td>
                    <td className="table__cell-price">{p.price}</td>
                    <td>
                      {p.category ? (
                        <span className="badge">{p.category}</span>
                      ) : (
                        <span className="badge badge--muted">—</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn--danger" onClick={() => handleDelete(p.id || p.uuid || p._id)}>Eliminar</button>
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