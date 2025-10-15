import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { token } = await login(email, password)
      if (token) {
        navigate('/admin/products')
      } else {
        setError('Login sin token devuelto. Revisa configuración de Xano.')
      }
    } catch (err) {
      console.error('Login error', err)
      setError('Error al iniciar sesión. Ver consola para más detalles.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-instagram">
      <div className="login-card">
        <div className="login-card__header">
          <img src="/IMG/logo-bar-pirata.png" alt="Bar Pirata" className="login-logo" />
          <h2 className="login-title">Iniciar sesión</h2>
        </div>
        {isAuthenticated && (
          <p className="login-info">Ya estás autenticado. Puedes ir al panel de productos.</p>
        )}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Teléfono, usuario o correo electrónico"
            required
          />
          <div className="login-password">
            <input
              className="login-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
            <button type="button" className="login-toggle" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <button className="btn login-submit" type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
          {error && <div className="login-error">{error}</div>}
          <div className="login-divider">o</div>
          <div className="login-meta">
            <a href="#" onClick={(e) => e.preventDefault()}>¿Olvidaste tu contraseña?</a>
          </div>
        </form>
      </div>

      <div className="login-card login-card--secondary">
        <p>
          ¿No tienes una cuenta?{' '}
          <a href="#" onClick={(e) => e.preventDefault()}>Regístrate</a>
        </p>
      </div>
    </main>
  )
}