// Test para verificar el formato correcto de los endpoints de Xano
// y depurar el error 400 en bloqueo/desbloqueo

console.log('=== TEST DE DEPURACIÓN XANO ===');

// Configuración de Xano
const AUTH_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:Jf-BHmdB';
const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:SGvG01BZ';

// Obtener token del entorno o usar uno de prueba
const token = process.env.AUTH_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sIjoiYWRtaW4iLCJpYXQiOjE3MzI1MDAwMDB9.dGhpcyBpcyBhIHNhbXBsZSB0b2tlbg';
console.log('Token actual:', token ? 'Presente' : 'No encontrado');

// Función auxiliar para hacer peticiones
async function testRequest(url, method = 'GET', body = null) {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  console.log(`\n--- ${method} ${url} ---`);
  console.log('Headers:', headers);
  if (body) console.log('Body:', body);

  try {
    const response = await fetch(url, {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const data = await response.json().catch(() => response.text());
    console.log('Response:', data);

    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Error de conexión:', error.message);
    return { success: false, error: error.message };
  }
}

// Tests
async function runTests() {
  console.log('Iniciando tests...');

  // Test 1: Obtener usuarios
  console.log('\n=== TEST 1: GET /usuario ===');
  const usersResult = await testRequest(`${API_BASE}/usuario`);
  
  if (usersResult.success && usersResult.data && usersResult.data.length > 0) {
    const firstUser = Array.isArray(usersResult.data) ? usersResult.data[0] : usersResult.data.items?.[0];
    console.log('Primer usuario:', firstUser);
    
    if (firstUser) {
      const userId = firstUser.id || firstUser.uuid || firstUser._id;
      console.log('User ID encontrado:', userId);

      // Test 2: Actualizar estado individual
      console.log('\n=== TEST 2: PATCH /usuario/:id (solo estado) ===');
      const currentEstado = firstUser.estado || firstUser.status || 'activo';
      const newEstado = currentEstado === 'activo' ? 'bloqueado' : 'activo';
      
      const updateResult = await testRequest(
        `${API_BASE}/usuario/${userId}`,
        'PATCH',
        { estado: newEstado }
      );

      // Test 3: Verificar formato de datos completo
      console.log('\n=== TEST 3: PATCH /usuario/:id (datos completos) ===');
      const fullUpdateResult = await testRequest(
        `${API_BASE}/usuario/${userId}`,
        'PATCH',
        {
          name: firstUser.name,
          last_name: firstUser.last_name,
          email: firstUser.email,
          estado: currentEstado, // Volver al estado original
          rol: firstUser.rol || 'cliente'
        }
      );

      // Test 4: Probar endpoints específicos de bloqueo si existen
      console.log('\n=== TEST 4: Verificar endpoints de bloqueo ===');
      
      // Intentar diferentes formatos de endpoint
      const blockEndpoints = [
        `${API_BASE}/usuario/${userId}/block`,
        `${API_BASE}/usuario/${userId}/unblock`,
        `${API_BASE}/admin/usuarios/${userId}/block`,
        `${API_BASE}/admin/usuarios/${userId}/status`
      ];

      for (const endpoint of blockEndpoints) {
        console.log(`\nProbando: ${endpoint}`);
        await testRequest(endpoint, 'POST', { estado: 'bloqueado' });
      }
    }
  } else {
    console.log('No se pudieron obtener usuarios para testear');
  }

  console.log('\n=== FIN DE LOS TESTS ===');
}

// Ejecutar tests
runTests().catch(console.error);