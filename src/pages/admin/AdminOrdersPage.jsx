import { useEffect, useState } from 'react'
import '../../styles/admin.css'
import { getOrdenes, updateOrden } from '../../api/xano.js'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const load = async () => {
    setLoading(true)
    setStatusMsg('')
    try {
      const arr = await getOrdenes({ estado: 'pendiente' })
      setOrders(Array.isArray(arr) ? arr : [])
    } catch (err) {
      setStatusMsg('Error cargando órdenes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <main className="admin">
      <div className="admin__header">
        <h2>Órdenes</h2>
        <div className="admin__actions">
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'Actualizando…' : 'Refrescar'}</button>
        </div>
      </div>

      {statusMsg && <p className="admin__status">{statusMsg}</p>}

      <section className="admin__section">
        {orders.length === 0 ? (
          <div className="admin__empty">No hay órdenes pendientes</div>
        ) : (
          <div className="table-responsive">
            <table className="table table--admin">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
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
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn" onClick={async () => { try { await updateOrden(o.id, { estado: 'aprobado' }); setStatusMsg(`Pedido #${o.id} aprobado`); setOrders(prev => prev.filter(x => x.id !== o.id)) } catch { setStatusMsg('Error aprobando orden') } }}>Aprobar</button>
                        <button className="btn btn--danger" onClick={async () => { try { await updateOrden(o.id, { estado: 'rechazado' }); setStatusMsg(`Pedido #${o.id} rechazado`); setOrders(prev => prev.filter(x => x.id !== o.id)) } catch { setStatusMsg('Error rechazando orden') } }}>Rechazar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
