import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '../../styles/admin.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { getOrdenes, updateOrden } from '../../api/xano.js'

export default function AdminDashboardPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [lastAccess, setLastAccess] = useState('')
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    let ts = ''
    try {
      const token = localStorage.getItem('authToken') || ''
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')))
        const iat = Number(payload.iat || payload.auth_time || payload.issued_at || 0)
        if (iat) ts = new Date(iat * 1000).toISOString()
      }
    } catch {}
    if (!ts) {
      try { ts = localStorage.getItem('lastAccessAt') || '' } catch {}
    }
    if (ts) {
      try {
        const d = new Date(ts)
        const fmt = d.toLocaleString('es-CL', { hour12: false })
        setLastAccess(fmt)
      } catch { setLastAccess(ts) }
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoadingOrders(true)
      setStatusMsg('')
      try {
        const arr = await getOrdenes({ estado: 'pendiente' })
        setOrders(Array.isArray(arr) ? arr : [])
      } catch (err) {
        console.error('Error cargando órdenes pendientes:', err)
        setStatusMsg('Error cargando órdenes pendientes')
      } finally {
        setLoadingOrders(false)
      }
    }
    load()
  }, [])

  if (!isAuthenticated) {
    return (
      <main className="admin">
        <section className="admin-dashboard">
          <h2>Panel de Administración</h2>
          <p className="admin__hint">Debes iniciar sesión para acceder al panel.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="admin">
      <section className="admin-dashboard">
        <h2>Panel de Administración</h2>

        {/* Tarjetas de KPIs */}
        <div className="admin-kpis" role="list">
          <div className="kpi-card" role="listitem">
            <span className="kpi-icon" aria-hidden="true">👤</span>
            <div className="kpi-info">
              <span className="kpi-title">Usuarios registrados</span>
              <span className="kpi-value">128</span>
            </div>
          </div>
          <div className="kpi-card" role="listitem">
            <span className="kpi-icon" aria-hidden="true">📦</span>
            <div className="kpi-info">
              <span className="kpi-title">Productos activos</span>
              <span className="kpi-value">54</span>
            </div>
          </div>
          <div className="kpi-card" role="listitem">
            <span className="kpi-icon" aria-hidden="true">🏷️</span>
            <div className="kpi-info">
              <span className="kpi-title">Categorías</span>
              <span className="kpi-value">12</span>
            </div>
          </div>
          <div className="kpi-card" role="listitem">
            <span className="kpi-icon" aria-hidden="true">⏰</span>
            <div className="kpi-info">
              <span className="kpi-title">Último acceso</span>
              <span className="kpi-value kpi-value--sm">{lastAccess || '—'}</span>
            </div>
          </div>
        </div>

        {/* Órdenes pendientes */}
        <section className="admin__section admin-orders">
          <div className="admin__subheader">
            <h3>Órdenes pendientes</h3>
            <div className="admin__actions">
              <button className="btn" onClick={async () => {
                setLoadingOrders(true)
                try { const arr = await getOrdenes({ estado: 'pendiente' }); setOrders(Array.isArray(arr) ? arr : []) }
                finally { setLoadingOrders(false) }
              }} disabled={loadingOrders}>{loadingOrders ? 'Actualizando…' : 'Refrescar'}</button>
              <a className="btn" href="/admin/orders">Gestionar órdenes</a>
            </div>
          </div>
          {statusMsg && <p className="admin__status">{statusMsg}</p>}
          {orders.length === 0 ? (
            <div className="admin__empty">No hay órdenes pendientes</div>
          ) : (
            <div className="table-responsive admin-orders__table">
              <table className="table table--admin">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="table__cell-title">#{o.id}</td>
                      <td className="table__cell-desc">{o.usuario_id ?? '-'}</td>
                      <td>{new Date(o.fecha).toLocaleString('es-CL', { hour12: false })}</td>
                      <td className="table__cell-price">${Number(o.total_orden ?? o.subtotal ?? 0).toLocaleString('es-CL')}</td>
                      <td><span className="badge">{o.estado}</span></td>
                      <td>
                        <div className="admin-orders__actions">
                          <button className="btn" onClick={async () => {
                            try {
                              await updateOrden(o.id, { estado: 'aprobado' })
                              setStatusMsg(`Pedido #${o.id} aprobado`)
                              setOrders(prev => prev.filter(x => x.id !== o.id))
                            } catch (err) {
                              console.error('Error aprobando orden:', err)
                              setStatusMsg('Error aprobando orden')
                            }
                          }}>Aprobar</button>
                          <button className="btn btn--danger" onClick={async () => {
                            try {
                              await updateOrden(o.id, { estado: 'rechazado' })
                              setStatusMsg(`Pedido #${o.id} rechazado`)
                              setOrders(prev => prev.filter(x => x.id !== o.id))
                            } catch (err) {
                              console.error('Error rechazando orden:', err)
                              setStatusMsg('Error rechazando orden')
                            }
                          }}>Rechazar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
