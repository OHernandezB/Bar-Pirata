export async function postJSON(url, payload, token) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  if (!res.ok) {
    console.error('REQ →', url, payload)
    console.error('RES ←', res.status, text)
    throw new Error(`POST ${url} → ${res.status}: ${text}`)
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}