import { API_BASE, AUTH_TOKEN } from './xano.js'
import { fileToDataURL } from '@/utils/base64'

async function uploadOneBase64(file) {
  const dataURL = await fileToDataURL(file) // "data:image/jpeg;base64,..."
  const r = await fetch(`${API_BASE}/upload/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({ content: dataURL }),
  })

  const text = await r.text()
  if (!r.ok) throw new Error(`UPLOAD /upload/image → ${r.status}: ${text}`)

  let payload
  try { payload = JSON.parse(text) } catch { throw new Error(`UPLOAD no-JSON: ${text}`) }
  const obj = Array.isArray(payload) ? payload[0] : payload
  const id = Number(obj?.id ?? obj?.upload_id)
  if (!Number.isFinite(id)) throw new Error(`UPLOAD sin id válido: ${text}`)
  return id
}

export async function uploadImages(files) {
  const ids = []
  for (const f of files ?? []) {
    ids.push(await uploadOneBase64(f))
  }
  return ids
}