import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCarritoActual, agregarItemCarrito, actualizarItemCarrito, eliminarItemCarrito, getProduct } from '../api/xano.js'
import { resolveImageUrl } from '../utils/images.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const mapServerItem = async (serverItem) => {
    const pid = serverItem?.producto_id
    let p = null
    try { if (pid != null) p = await getProduct(pid) } catch {}
    const nombre = p?.nombre ?? p?.name ?? ''
    const precio = Number(serverItem?.precio_unit_snapshot ?? p?.precio ?? p?.price ?? 0)
    const cantidad = Number(serverItem?.cantidad ?? 0)
    const imagen = resolveImageUrl(p?.image ?? p?.imagen ?? p?.image_url ?? p?.imagen_url)
    return {
      id: serverItem?.id,
      nombre,
      descripcion: p?.descripcion ?? '',
      precio,
      quantity: cantidad,
      qty: cantidad,
      stock: Number(p?.stock ?? 99),
      imagen,
      image: imagen,
    }
  }

  const refresh = async () => {
    if (!isAuthenticated || !user) { setItems([]); return }
    setLoading(true)
    try {
      const data = await getCarritoActual()
      const rawItems = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : [])
      const mapped = await Promise.all(rawItems.map(mapServerItem))
      setItems(mapped)
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (productoId, qty = 1) => {
    if (!isAuthenticated) return false
    await agregarItemCarrito({ producto_id: productoId, cantidad: qty })
    await refresh()
    return true
  }

  const removeItem = async (id) => { await eliminarItemCarrito(id); await refresh() }
  const updateQty = async (id, qty) => { await actualizarItemCarrito(id, { cantidad: qty }); await refresh() }
  const clearCart = async () => { for (const it of items) { try { await eliminarItemCarrito(it.id) } catch {} } await refresh() }

  const total = useMemo(() => items.reduce((sum, i) => sum + (Number(i.precio) || 0) * (Number(i.qty) || Number(i.quantity) || 0), 0), [items]);

  const value = { items, addProduct, removeItem, updateQty, clearCart, total, refresh, loading };

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  return ctx;
}
