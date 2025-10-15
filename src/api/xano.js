// Cliente ligero para Xano usando fetch
// Configuración vía variables de entorno Vite:
// - VITE_XANO_BASE_URL: e.g. https://x8z5-1234-abc-api.xano.io
// - VITE_XANO_API_KEY: token de autenticación (opcional)

const BASE_URL = (import.meta.env.VITE_XANO_BASE_URL || '').replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_XANO_API_KEY || '';
let AUTH_TOKEN = '';

export function setAuthToken(token) {
  AUTH_TOKEN = token || '';
}

function buildHeaders(extra = {}) {
  const headers = {
    'Accept': 'application/json',
    ...extra,
  };
  // Autenticación: por defecto Authorization: Bearer
  // Orden de preferencia: token dinámico de login, luego API_KEY
  if (!headers.Authorization && !headers['X-API-KEY']) {
    if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    else if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`;
  }
  return headers;
}

function withQuery(url, params) {
  if (!params) return url;
  const usp = new URLSearchParams(params);
  const qs = usp.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function xFetch(path, { method = 'GET', params, body, headers } = {}) {
  if (!BASE_URL) {
    console.warn('[Xano] VITE_XANO_BASE_URL no está definido. Se omitirá la llamada.');
    return null;
  }
  const url = withQuery(`${BASE_URL}${path}`, params);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const init = {
    method,
    headers: isFormData ? buildHeaders(headers) : buildHeaders({ 'Content-Type': 'application/json', ...headers }),
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  };
  const res = await fetch(url, init);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(`Xano error ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Reservas removidas del proyecto

// Auth: login
const LOGIN_PATH = import.meta.env.VITE_XANO_LOGIN_PATH || '';
export async function login({ email, password }) {
  if (!BASE_URL || !LOGIN_PATH) {
    console.warn('[Xano] Falta BASE_URL o LOGIN_PATH.');
    return null;
  }
  const data = await xFetch(LOGIN_PATH, { method: 'POST', body: { email, password } });
  return data;
}

// Perfil del usuario autenticado (opcional)
const ME_PATH = import.meta.env.VITE_XANO_ME_PATH || '';
export async function getMe() {
  if (!BASE_URL || !ME_PATH) {
    console.warn('[Xano] Falta BASE_URL o ME_PATH.');
    return null;
  }
  return xFetch(ME_PATH, { method: 'GET' });
}

// Productos (CRUD)
const PRODUCTS_PATH = import.meta.env.VITE_XANO_PRODUCTS_PATH || '';
export const getProducts = (params) => {
  if (!BASE_URL || !PRODUCTS_PATH) {
    console.warn('[Xano] Falta BASE_URL o PRODUCTS_PATH.');
    return Promise.resolve([]);
  }
  return xFetch(PRODUCTS_PATH, { method: 'GET', params });
};

export const createProduct = (payload) => {
  if (!BASE_URL || !PRODUCTS_PATH) {
    console.warn('[Xano] Falta BASE_URL o PRODUCTS_PATH.');
    return Promise.resolve(null);
  }
  return xFetch(PRODUCTS_PATH, { method: 'POST', body: payload });
};

export const updateProduct = (id, payload) => {
  if (!BASE_URL || !PRODUCTS_PATH) {
    console.warn('[Xano] Falta BASE_URL o PRODUCTS_PATH.');
    return Promise.resolve(null);
  }
  return xFetch(`${PRODUCTS_PATH}/${id}`, { method: 'PATCH', body: payload });
};

export const deleteProduct = (id) => {
  if (!BASE_URL || !PRODUCTS_PATH) {
    console.warn('[Xano] Falta BASE_URL o PRODUCTS_PATH.');
    return Promise.resolve(null);
  }
  return xFetch(`${PRODUCTS_PATH}/${id}`, { method: 'DELETE' });
};