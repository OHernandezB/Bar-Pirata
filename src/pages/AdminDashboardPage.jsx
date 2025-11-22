import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminDashboardPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

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
              <span className="kpi-value">hoy 12:34</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}