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
        <p>Bienvenido. Usa el menú lateral para navegar.</p>
      </section>
    </main>
  )
}