import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getProducts, createProduct, deleteProduct } from '../api/xano.js'

export default function AdminProductsPage() {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', tags: '' })
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

  useEffect(() => { if (isAuthenticated) load() }, [isAuthenticated])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        category: form.category || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      }
      await createProduct(payload)
      setForm({ name: '', description: '', price: '', category: '', tags: '' })
      await load()
    } catch (err) {
      console.error('createProduct error', err)
      alert('Error creando producto. Ver consola.')
    }
  }

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
      <main id="admin" style={{ width: 'min(100%, 800px)', margin: '2rem auto', padding: '1rem' }}>
        <h2>Productos (Admin)</h2>
        <p>Debes iniciar sesión para gestionar productos.</p>
      </main>
    )
  }

  return (
    <main id="admin" style={{ width: 'min(100%, 1000px)', margin: '2rem auto', padding: '1rem' }}>
      <h2>Productos (Admin)</h2>
      <section style={{ margin: '1rem 0' }}>
        <h3>Crear producto</h3>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label>Nombre<input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></label>
          <label>Precio<input type="number" min="0" step="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></label>
          <label style={{ gridColumn: '1 / -1' }}>Descripción<textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></label>
          <label>Categoría<input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></label>
          <label>Tags (coma)<input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="ej: clásico, artesanal" /></label>
          <div style={{ gridColumn: '1 / -1' }}>
            <button className="btn" type="submit" disabled={!canSubmit}>Crear</button>
          </div>
        </form>
      </section>

      <section>
        <h3>Lista de productos</h3>
        {loading && <p>Cargando…</p>}
        {error && <div className="map__placeholder" style={{ border: '1px solid #b87333' }}>{error}</div>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>ID</th>
              <th style={{ textAlign: 'left' }}>Nombre</th>
              <th>Precio</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id || p.uuid || p._id}>
                <td>{p.id || p.uuid || p._id}</td>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.category || '-'}</td>
                <td>
                  <button className="btn" onClick={() => handleDelete(p.id || p.uuid || p._id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}