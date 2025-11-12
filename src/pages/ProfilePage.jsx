import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      setUser(raw ? JSON.parse(raw) : null)
    } catch {
      setUser(null)
    }
  }, [])

  return (
    <main className="login-instagram">
      <div className="login-card">
        <div className="login-card__header">
          <img src="/IMG/logo-bar-pirata.png" alt="Bar Pirata" className="login-logo" />
          <h2 className="login-title">Mi perfil</h2>
        </div>

        {!user ? (
          <div className="login-info" style={{ textAlign: 'center' }}>
            <p>No hay datos de usuario guardados.</p>
            <div className="login-meta" style={{ marginTop: 12 }}>
              <Link to="/login">Inicia sesión</Link>
            </div>
          </div>
        ) : (
          <div className="login-info" style={{ textAlign: 'left' }}>
            <p><strong>Nombre:</strong> {user.name || user.nombre || '-'}</p>
            <p><strong>Apellido:</strong> {user.last_name || user.apellido || '-'}</p>
            <p><strong>Email:</strong> {user.email || '-'}</p>
            <p><strong>Dirección:</strong> {user.direccion || '-'}</p>
            <p><strong>Teléfono:</strong> {user.telefono || '-'}</p>

            <div className="login-meta" style={{ marginTop: 12, display: 'flex', gap: 12 }}>
              <Link to="/inicio">Ir al inicio</Link>
              <Link to="/menu">Ver carta</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}