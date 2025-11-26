// Manual test for Xano authentication
// This script tests the authentication flow with Xano

console.log('=== TEST DE AUTENTICACIÓN XANO ===');

// Test 1: Check if we have a token
const token = localStorage.getItem('authToken');
console.log('1. Token status:', token ? '✅ Token presente' : '❌ No hay token');

if (token) {
    console.log('   Token:', token.substring(0, 50) + '...');
}

// Test 2: Import and test getMe function
import('./src/api/xano.js').then(module => {
    const { getMe, AUTH_BASE, API_BASE } = module;
    
    console.log('\n2. Configuración Xano:');
    console.log('   AUTH_BASE:', AUTH_BASE);
    console.log('   API_BASE:', API_BASE);
    
    // Test 3: Try to get current user
    console.log('\n3. Probando getMe()...');
    getMe()
        .then(user => {
            console.log('✅ getMe() exitoso:');
            console.log('   Usuario:', user);
            console.log('   Nombre:', user.name || user.nombre || 'No disponible');
            console.log('   Email:', user.email || 'No disponible');
            console.log('   Rol:', user.rol || user.role || 'No disponible');
        })
        .catch(error => {
            console.log('❌ Error en getMe():', error.message);
            console.log('   Status:', error.status);
            console.log('   Data:', error.data);
        });
        
    // Test 4: Test user listing
    setTimeout(() => {
        console.log('\n4. Probando getUsers()...');
        const { getUsers } = module;
        getUsers()
            .then(users => {
                console.log('✅ getUsers() exitoso:');
                console.log('   Total usuarios:', users.length);
                if (users.length > 0) {
                    console.log('   Primer usuario:', users[0].name || users[0].nombre, '-', users[0].email);
                }
            })
            .catch(error => {
                console.log('❌ Error en getUsers():', error.message);
                console.log('   Status:', error.status);
            });
    }, 2000);
    
}).catch(error => {
    console.log('❌ Error importando módulo Xano:', error);
});

// Test 5: Check network connectivity
console.log('\n5. Verificando conectividad...');
fetch('https://x8ki-letl-twmt.n7.xano.io/api:Jf-BHmdB/auth/me', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    }
})
.then(response => {
    console.log('✅ Conexión a Xano establecida');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    return response.json();
})
.then(data => {
    console.log('   Response data:', data);
})
.catch(error => {
    console.log('❌ Error de conexión:', error.message);
});

console.log('\n=== FIN DEL TEST ===');