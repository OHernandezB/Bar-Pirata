export const AUTH_BASE = (import.meta.env.VITE_XANO_AUTH_BASE_URL || 'https://x8ki-letl-twmt.n7.xano.io/api:SGvG01BZ').replace(/\/$/, '')
let AUTH_TOKEN = localStorage.getItem('auth_token') || ''

export function setAuthToken(t) {
  AUTH_TOKEN = t || ''
  if (t) localStorage.setItem('auth_token', t)
  else localStorage.removeItem('auth_token')
}

export async function apiFetch(url, opts = {}) {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`
  const res = await fetch(url, { ...opts, headers })
  return res
}