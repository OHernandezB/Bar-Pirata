import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Si ya está autenticado, redirige (especialmente útil tras refrescar)
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/cliente/catalogo', { replace: true })
    }
  }, [isAuthenticated, isAdmin, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const ok = await login(email, password) // <- login() devuelve booleano
      if (!ok) {
        setError('No se pudo iniciar sesión. Verifica tus credenciales.')
      }
    } catch (err) {
      console.error('Login error', err)
      setError('Error al iniciar sesión. Revisa la consola para más detalles.')
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

        <form onSubmit={handleSubmit} className="login-form">
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
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
            <button
              type="button"
              className="login-toggle"
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <button className="btn login-submit" type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>

          {error && <div className="login-error">{error}</div>}

          <div className="login-divider">o</div>
          <div className="login-meta">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/recuperar') }}>¿Olvidaste tu contraseña?</a>
          </div>
        </form>
      </div>

      <div className="login-card login-card--secondary">
        <p>
          ¿No tienes una cuenta?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/signup') }}>Regístrate</a>
        </p>
      </div>
    </main>
  )
}
