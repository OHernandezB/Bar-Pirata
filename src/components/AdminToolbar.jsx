import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/admin.css'

export default function AdminToolbar() {
  const { isAdmin, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated || !isAdmin) return null

  const go = (to) => navigate(to)
  const refresh = () => window.location.reload()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar__inner">
        <h2 className="admin-toolbar__title">Bienvenido Administrador</h2>
        <div className="admin-toolbar__actions">
          <button className="btn" onClick={refresh}>Refrescar</button>
          <button className="btn btn--ghost" onClick={handleLogout}>Cerrar Sesion</button>
        </div>
      </div>
    </div>
  )
}