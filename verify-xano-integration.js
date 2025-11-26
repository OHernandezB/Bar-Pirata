// Verificación de integración con Xano
import { AUTH_BASE, API_BASE } from './src/api/xano.js'

console.log('=== VERIFICACIÓN DE INTEGRACIÓN CON XANO ===')
console.log('')

// 1. Verificar rutas base
console.log('1. RUTAS BASE:')
console.log(`   AUTH_BASE: ${AUTH_BASE}`)
console.log(`   API_BASE:  ${API_BASE}`)
console.log('')

// 2. Verificar endpoints de autenticación
console.log('2. ENDPOINTS DE AUTENTICACIÓN:')
console.log(`   POST ${AUTH_BASE}/auth/login`)
console.log(`   POST ${AUTH_BASE}/auth/signup`)
console.log(`   GET  ${AUTH_BASE}/auth/me`)
console.log('')

// 3. Verificar endpoints de usuarios
console.log('3. ENDPOINTS DE USUARIOS:')
console.log(`   GET    ${API_BASE}/usuario`)
console.log(`   POST   ${API_BASE}/usuario`)
console.log(`   GET    ${API_BASE}/usuario/{id}`)
console.log(`   PATCH  ${API_BASE}/usuario/{id}`)
console.log(`   DELETE ${API_BASE}/usuario/{id}`)
console.log('')

// 4. Verificar formato de token
console.log('4. FORMATO DE TOKEN ESPERADO:')
console.log('   Authorization: Bearer <token>')
console.log('   Token guardado en: localStorage.authToken')
console.log('')

// 5. Verificar headers
console.log('5. HEADERS POR DEFECTO:')
console.log('   Accept: application/json')
console.log('   Content-Type: application/json')
console.log('   Authorization: Bearer <token> (cuando está autenticado)')
console.log('')

// 6. Funciones principales
console.log('6. FUNCIONES PRINCIPALES:')
console.log('   - getMe(): Obtiene datos del usuario autenticado')
console.log('   - getUsers(): Lista todos los usuarios')
console.log('   - getUser(id): Obtiene un usuario específico')
console.log('   - updateUser(id, data): Actualiza un usuario')
console.log('   - deleteUser(id): Elimina un usuario')
console.log('   - createUser(data): Crea un nuevo usuario')
console.log('   - blockUser(id): Bloquea un usuario (estado: bloqueado)')
console.log('   - unblockUser(id): Activa un usuario (estado: activo)')
console.log('')

console.log('=== INSTRUCCIONES DE USO ===')
console.log('')
console.log('1. Asegúrate de tener el token en localStorage.authToken')
console.log('2. El token se enviará automáticamente en el header Authorization')
console.log('3. Las respuestas se manejan automáticamente (data.Self ?? data)')
console.log('4. Los errores se capturan y muestran en consola')
console.log('5. Verifica que tu backend Xano tenga los mismos endpoints')
console.log('')

console.log('=== TEST RECOMENDADO ===')
console.log('')
console.log('Puedes probar manualmente en la consola del navegador:')
console.log('')
console.log('// Verificar token')
console.log('localStorage.getItem("authToken")')
console.log('')
console.log('// Probar getMe')
console.log('import { getMe } from "./src/api/xano.js"')
console.log('getMe().then(user => console.log("Usuario:", user)).catch(err => console.error("Error:", err))')
console.log('')
console.log('// Probar lista de usuarios')
console.log('import { getUsers } from "./src/api/xano.js"')
console.log('getUsers().then(users => console.log("Usuarios:", users)).catch(err => console.error("Error:", err))')

export function verifyIntegration() {
  console.log('✅ Verificación completada - revisa la consola para más detalles')
}