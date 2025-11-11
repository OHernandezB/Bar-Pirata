export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onerror = () => reject(new Error('No se pudo leer el archivo'))
    fr.onload = () => {
      const result = String(fr.result || '')
      if (!result.startsWith('data:')) return reject(new Error('DataURL inválido'))
      resolve(result)
    }
    fr.readAsDataURL(file)
  })
}