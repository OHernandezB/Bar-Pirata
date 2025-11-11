import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestPasswordReset } from '../api/xano.js'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      console.error('Solicitud de recuperación falló', err)
      setError('No se pudo enviar el enlace. Inténtalo más tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-instagram">
      <div className="login-card">
        <div className="login-card__header">
          <img src="/IMG/logo-bar-pirata.png" alt="Bar Pirata" className="login-logo" />
          <h2 className="login-title">Recuperar contraseña</h2>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="login-form">
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
            />

            <button className="btn login-submit" type="submit" disabled={loading || !email}>
              {loading ? 'Enviando…' : 'Enviar enlace'}
            </button>

            {error && <div className="login-error">{error}</div>}

            <div className="login-divider">o</div>
            <div className="login-meta">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Volver a iniciar sesión</a>
            </div>
          </form>
        ) : (
          <div className="login-info" style={{ textAlign: 'center' }}>
            <p>
              Hemos enviado un enlace de recuperación.
              Revisa tu bandeja de entrada y también la carpeta de spam.
            </p>
            <div className="login-meta" style={{ marginTop: 12 }}>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Volver a iniciar sesión</a>
            </div>
          </div>
        )}
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