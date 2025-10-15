import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <main id="login" style={{ width: 'min(100%, 640px)', margin: '2rem auto', padding: '1rem' }}>
      <h2>Iniciar sesión</h2>
      {isAuthenticated && <p>Ya estás autenticado. Puedes ir al panel de productos.</p>}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <label>
          Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar'}</button>
        {error && <div className="map__placeholder" style={{ border: '1px solid #b87333' }}>{error}</div>}
      </form>
    </main>
  )
}