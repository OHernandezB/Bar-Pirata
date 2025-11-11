import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-shell admin-theme">
      <aside className="admin-shell__aside">
        <div className="admin-shell__brand">
          <img src="/IMG/logo-bar-pirata.png" alt="" />
          <span>Bar Pirata — Admin</span>
        </div>

        <nav className="admin-shell__nav">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'is-active' : undefined)}>Resumen</NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>Usuarios</NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>Productos</NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>Categorías</NavLink>
        </nav>


      </aside>

      <main className="admin-shell__main">
    <Outlet />
    {/* Eliminado: footer interno © Bar Pirata */}
  </main>
    </div>
  )
}