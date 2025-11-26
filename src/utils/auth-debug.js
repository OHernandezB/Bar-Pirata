// Función para verificar la consistencia del token entre auth/login y auth/me
export function verifyAuthTokenConsistency() {
  console.log('=== VERIFICANDO CONSISTENCIA DE TOKEN ===');
  
  // Obtener el token actual
  const currentToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
  console.log('Token actual en localStorage:', currentToken ? 'EXISTS' : 'MISSING');
  
  if (currentToken) {
    // Verificar formato JWT básico
    const parts = currentToken.split('.');
    const isJWTFormat = parts.length === 3;
    console.log('Formato JWT válido:', isJWTFormat);
    
    if (isJWTFormat) {
      try {
        // Decodificar payload para verificar
        const payload = JSON.parse(atob(parts[1]));
        console.log('Payload del token:', {
          exp: payload.exp,
          iat: payload.iat,
          userId: payload.userId || payload.sub,
          email: payload.email
        });
        
        // Verificar si el token está expirado
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp && payload.exp < currentTime;
        console.log('Token expirado:', isExpired);
        
      } catch (err) {
        console.error('Error decodificando token:', err);
      }
    }
  }
  
  console.log('=== FIN VERIFICACIÓN ===');
}

// Función para depurar la respuesta de auth/me
export function debugAuthMeResponse(response) {
  console.log('=== DEBUG RESPUESTA AUTH/ME ===');
  console.log('Respuesta completa:', response);
  console.log('Tipo de respuesta:', typeof response);
  console.log('Propiedades disponibles:', Object.keys(response || {}));
  
  // Buscar el usuario en diferentes posibles ubicaciones
  const possibleUserLocations = [
    'Self',
    'user', 
    'User',
    'data',
    'profile',
    'me'
  ];
  
  possibleUserLocations.forEach(key => {
    if (response && response[key]) {
      console.log(`Usuario encontrado en .${key}:`, response[key]);
    }
  });
  
  // Si no se encuentra en propiedades, la respuesta completa podría ser el usuario
  if (response && typeof response === 'object' && !Array.isArray(response)) {
    const hasId = response.id || response.uuid || response.userId || response.email;
    if (hasId) {
      console.log('La respuesta completa parece ser el objeto usuario');
    }
  }
  
  console.log('=== FIN DEBUG ===');
}