export function buildProductoPayload(input) {
  const nombre = String(input?.nombre ?? '').trim()
  const descripcion = String(input?.descripcion ?? '').trim()
  const precioN = Number(input?.precio)
  const stockN = Number(input?.stock)
  const catN = Number(input?.categoria_id)

  if (!nombre) throw new Error('Falta el nombre.')
  if (!Number.isFinite(precioN) || precioN <= 0) throw new Error('Precio debe ser numérico y > 0.')
  if (!Number.isFinite(stockN) || stockN < 0) throw new Error('Stock debe ser numérico y ≥ 0.')
  if (!Number.isFinite(catN) || catN <= 0) throw new Error('Categoria ID inválido.')

  return {
    nombre,
    descripcion: descripcion || null,
    precio: precioN,
    stock: stockN,
    categoria_id: catN,
  }
}