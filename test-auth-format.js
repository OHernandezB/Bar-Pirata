// Script para probar el formato de respuesta de auth/login vs auth/me
import { AUTH_BASE, setAuthToken } from './src/api/xano.js'

async function testAuthFormats() {
  console.log('=== PROBANDO FORMATOS DE AUTH ===')
  
  // Test 1: Ver qué devuelve /auth/me sin token
  try {
    console.log('\n1. Probando /auth/me sin token...')
    const res1 = await fetch(`${AUTH_BASE}/auth/me`)
    const data1 = await res1.json()
    console.log('Respuesta sin token:', data1)
  } catch (err) {
    console.log('Error sin token (esperado):', err.message)
  }

  // Test 2: Si tienes credenciales de prueba, puedes hacer login y ver el formato
  console.log('\n2. Para probar con token válido, necesito:')
  console.log('   - Email de prueba')
  console.log('   - Contraseña de prueba')
  console.log('   Luego puedo verificar el formato de ambos endpoints')
  
  console.log('\n=== FORMATOS ESPERADOS ===')
  console.log('Login debería devolver algo como:')
  console.log('  { token: "eyJ...", user: {...} }')
  console.log('  ó { authToken: "eyJ...", user: {...} }')
  console.log('  ó { access_token: "eyJ...", user: {...} }')
  
  console.log('\nMe debería devolver algo como:')
  console.log('  { Self: {...} }')
  console.log('  ó { user: {...} }')
  console.log('  ó directamente {...}')
}

testAuthFormats()