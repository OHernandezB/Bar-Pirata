import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, loadUser } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [loading, isAuthenticated, navigate])

  useEffect(() => {
    if (!loading && isAuthenticated && !user) {
      loadUser?.()
    }
  }, [loading, isAuthenticated, user, loadUser])

  return (
    <main className="login-instagram">
      <div className="login-card">
        <div className="login-card__header">
          <img src="/IMG/logo-bar-pirata.png" alt="Bar Pirata" className="login-logo" />
          <h2 className="login-title">Mi perfil</h2>
        </div>

        {loading ? (
          <div className="login-info" style={{ textAlign: 'center' }}>
            <p>Verificando sesión...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="login-info" style={{ textAlign: 'center' }}>
            <p>No hay datos de usuario guardados.</p>
            <div className="login-meta" style={{ marginTop: 12 }}>
              <Link to="/login">Inicia sesión</Link>
            </div>
          </div>
        ) : (
          <div className="login-info" style={{ textAlign: 'left' }}>
            <p><strong>Nombre:</strong> {user?.name || user?.nombre || '-'}</p>
            <p><strong>Apellido:</strong> {user?.last_name || user?.apellido || '-'}</p>
            <p><strong>Email:</strong> {user?.email || '-'}</p>
            <p><strong>Dirección:</strong> {user?.direccion || '-'}</p>
            <p><strong>Teléfono:</strong> {user?.telefono || '-'}</p>

            <div className="login-meta" style={{ marginTop: 12, display: 'flex', gap: 12 }}>
              <Link to="/inicio">Ir al inicio</Link>
              <Link to="/cliente/catalogo">Catálogo</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
