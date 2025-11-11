import { API_BASE, AUTH_TOKEN } from './xano.js'
import { uploadImages } from './upload.js'

export function buildProductoPayload(input) {
  const nombre = String(input.nombre ?? '').trim();
  const descripcion = (input.descripcion ?? '').toString().trim();
  const precioN = Number(input.precio);
  const stockN = Number(input.stock);
  const catN = Number(input.categoria_id);

  if (!nombre) throw new Error('Falta el nombre.');
  if (!Number.isFinite(precioN) || precioN <= 0) throw new Error('Precio debe ser numérico y > 0.');
  if (!Number.isFinite(stockN) || stockN < 0) throw new Error('Stock debe ser numérico y ≥ 0.');
  if (!Number.isFinite(catN) || catN <= 0) throw new Error('Categoria ID inválido.');

  return {
    nombre,
    descripcion: descripcion || null,
    precio: precioN,
    stock: stockN,
    categoria_id: catN,
  };
}

export async function crearProductoConImagenes(data, files) {
  const base = buildProductoPayload(data);

  // Subir 1..N imágenes usando Base64 → /upload/image
  const ids = files?.length ? await uploadImages(files) : [];
  if (ids.length === 0) throw new Error('Debes subir al menos una imagen.');

  // Crear producto en endpoint singular /producto con imagen_upload
  const body = { ...base, imagen_upload: ids.length === 1 ? ids[0] : ids };

  const r = await fetch(`${API_BASE}/producto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AUTH_TOKEN}` },
    body: JSON.stringify(body),
  });

  const text = await r.text();
  if (!r.ok) throw new Error(`POST /producto → ${r.status}: ${text}`);
  let payload; try { payload = JSON.parse(text) } catch { throw new Error(`POST /producto no-JSON: ${text}`) }
  return payload;
}