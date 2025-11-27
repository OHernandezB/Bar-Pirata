import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getOrdenes } from '../../api/xano.js'
import '../../styles/admin.css'

export default function UserOrdersPage() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }

    const loadOrders = async () => {
      setLoading(true)
      try {
        const arr = await getOrdenes({ usuario_id: user?.id })
        setOrders(Array.isArray(arr) ? arr : [])
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'aprobado': return 'status-completed'
      case 'pendiente': return 'status-pending'
      case 'rechazado': return 'status-cancelled'
      default: return ''
    }
  }

  return (
    <main className="admin">
      <div className="admin__header">
        <h2>Mis Órdenes</h2>
      </div>

      <section className="admin__section">
        {loading ? (
          <p className="admin__status">Cargando órdenes...</p>
        ) : orders.length === 0 ? (
          <div className="admin__empty">
            No tienes órdenes aún.
            <br />
            <button 
              className="btn" 
              onClick={() => navigate('/cliente/catalogo')}
              style={{ marginTop: '1rem' }}
            >
              Hacer mi primer pedido
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <strong>Orden #{order.id}</strong>
                    <span className="order-date">{new Date(order.fecha).toLocaleString('es-CL', { hour12: false })}</span>
                  </div>
                  <span className={`order-status ${getStatusColor(order.estado)}`}>
                    {order.estado}
                  </span>
                </div>
                
                <div className="order-total">
                  <strong>Total: ${Number(order.total_orden ?? order.total ?? 0).toLocaleString('es-CL')}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
