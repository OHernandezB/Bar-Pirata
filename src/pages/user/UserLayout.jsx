import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useEffect } from 'react'
import '../../styles/admin.css'

export default function UserLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="admin-shell no-aside">
      <main className="admin-shell__main">
        <Outlet />
      </main>
    </div>
  )
}
