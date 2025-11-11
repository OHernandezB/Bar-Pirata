import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { apiFetch, AUTH_BASE, setAuthToken } from '@/lib/http'

export default function SignupPage() {
  const nav = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  async function onSubmit(data) {
    const res = await apiFetch(`${AUTH_BASE}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        last_name: data.last_name || '',
        email: data.email,
        password: data.password,
        direccion: data.direccion || '',
        telefono: data.telefono || ''
      })
    })

    let body = {}
    try { body = await res.json() } catch { body = {} }

    if (!res.ok) {
      alert(body.message || (res.status === 409 ? 'Email ya registrado' : 'No se pudo crear la cuenta'))
      return
    }

    setAuthToken(body.token)
    localStorage.setItem('user', JSON.stringify(body.user || {}))
    nav('/profile')
  }

  return (
    <main className="login-instagram">
      <div className="login-card">
        <div className="login-card__header">
          <img src="/IMG/logo-bar-pirata.png" alt="Bar Pirata" className="login-logo" />
          <h2 className="login-title">Crear cuenta</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <input placeholder="Nombre" {...register('name', { required: true })} aria-invalid={errors?.name ? 'true' : undefined} className="login-input" />
          <input placeholder="Apellido" {...register('last_name', { required: true })} aria-invalid={errors?.last_name ? 'true' : undefined} className="login-input" />
          <input type="email" placeholder="Correo electrónico" {...register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })} aria-invalid={errors?.email ? 'true' : undefined} className="login-input" />
          <input type="password" placeholder="Contraseña" {...register('password', { required: true, minLength: 8 })} aria-invalid={errors?.password ? 'true' : undefined} className="login-input" />
          <input placeholder="Dirección" {...register('direccion')} className="login-input" />
          <input placeholder="Teléfono" {...register('telefono')} className="login-input" />

          <button className="btn login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creando…' : 'Registrarme'}
          </button>
        </form>

        <div className="login-meta" style={{ marginTop: '0.75rem', textAlign: 'center' }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </main>
  )
}