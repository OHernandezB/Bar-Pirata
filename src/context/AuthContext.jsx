import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as xanoLogin, setAuthToken } from '../api/xano.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('xano_token')
    if (t) {
      setToken(t)
      setAuthToken(t)
    }
    const u = localStorage.getItem('xano_user')
    if (u) {
      try { setUser(JSON.parse(u)) } catch {}
    }
  }, [])

  const login = async (email, password) => {
    const data = await xanoLogin({ email, password })
    // Intentar detectar token en respuesta común
    const tok = data?.authToken || data?.token || data?.access_token || data?.jwt || data?.session?.token
    if (tok) {
      setToken(tok)
      setAuthToken(tok)
      localStorage.setItem('xano_token', tok)
    }
    // Usuario/perfil
    const usr = data?.user || data?.profile || data
    if (usr) {
      setUser(usr)
      try { localStorage.setItem('xano_user', JSON.stringify(usr)) } catch {}
    }
    return { token: tok, user: usr, raw: data }
  }

  const logout = () => {
    setToken('')
    setUser(null)
    setAuthToken('')
    localStorage.removeItem('xano_token')
    localStorage.removeItem('xano_user')
  }

  const value = useMemo(() => ({ token, user, isAuthenticated: !!token, login, logout }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}