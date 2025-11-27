// Test script to verify the Xano API endpoints are working correctly
import { 
  actualizarUsuarioRobusto, 
  cambiarEstadoUsuario,
  obtenerUsuariosRobusto 
} from '../src/api/xano-admin.js'

// Test user data (using the user ID from the web reference)
const TEST_USER_ID = 15;
const TEST_USER_DATA = {
  name: "Claudia",
  last_name: "Berrios", 
  email: "ejemplo@correo.cl",
  direccion: "Maipu 586",
  telefono: "564558697",
  rol: "cliente",
  estado: "activo"
};

console.log('🧪 Iniciando pruebas de API con endpoints estándar...');

async function testObtenerUsuarios() {
  console.log('\n📋 Test 1: Obteniendo lista de usuarios...');
  try {
    const usuarios = await obtenerUsuariosRobusto();
    console.log('✅ Usuarios obtenidos exitosamente:', usuarios.length, 'usuarios');
    
    // Buscar el usuario de prueba
    const usuarioTest = usuarios.find(u => u.id === TEST_USER_ID || u.email === TEST_USER_DATA.email);
    if (usuarioTest) {
      console.log('✅ Usuario de prueba encontrado:', usuarioTest.name, usuarioTest.email);
      return usuarioTest;
    } else {
      console.log('⚠️ Usuario de prueba no encontrado, usando datos mock');
      return { id: TEST_USER_ID, ...TEST_USER_DATA };
    }
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error.message);
    console.error('Tipo de error:', error.tipo);
    console.error('Status:', error.status);
    throw error;
  }
}

async function testActualizarUsuario(usuario) {
  console.log('\n✏️ Test 2: Actualizando usuario...');
  console.log('Usuario a actualizar:', usuario.name, usuario.email);
  
  const datosActualizados = {
    ...usuario,
    telefono: "999999999", // Cambiar solo el teléfono
    direccion: "Dirección Actualizada"
  };
  
  try {
    const resultado = await actualizarUsuarioRobusto(usuario.id, datosActualizados);
    console.log('✅ Usuario actualizado exitosamente');
    return resultado;
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error.message);
    console.error('Tipo de error:', error.tipo);
    console.error('Status:', error.status);
    console.error('Datos del error:', error.datos);
    throw error;
  }
}

async function testCambiarEstado(usuario) {
  console.log('\n🔄 Test 3: Cambiando estado del usuario...');
  const estadoActual = usuario.estado || "activo";
  const nuevoEstado = estadoActual === "activo" ? "bloqueado" : "activo";
  
  console.log(`Cambiando estado de ${estadoActual} a ${nuevoEstado}`);
  
  try {
    const resultado = await cambiarEstadoUsuario(usuario.id, estadoActual);
    console.log(`✅ Estado cambiado exitosamente a: ${resultado}`);
    return resultado;
  } catch (error) {
    console.error('❌ Error cambiando estado:', error.message);
    console.error('Tipo de error:', error.tipo);
    console.error('Status:', error.status);
    console.error('Datos del error:', error.datos);
    throw error;
  }
}

async function testRestaurarEstado(usuario) {
  console.log('\n🔄 Test 4: Restaurando estado original...');
  const estadoActual = usuario.estado || "activo";
  const estadoOriginal = estadoActual === "activo" ? "bloqueado" : "activo";
  
  try {
    const resultado = await cambiarEstadoUsuario(usuario.id, estadoActual);
    console.log(`✅ Estado restaurado a: ${resultado}`);
    return resultado;
  } catch (error) {
    console.error('❌ Error restaurando estado:', error.message);
    throw error;
  }
}

// Ejecutar todas las pruebas
async function ejecutarPruebas() {
  try {
    console.log('🚀 Iniciando batería de pruebas...\n');
    
    // Test 1: Obtener usuarios
    const usuario = await testObtenerUsuarios();
    
    // Test 2: Actualizar usuario
    await testActualizarUsuario(usuario);
    
    // Test 3: Cambiar estado
    await testCambiarEstado(usuario);
    
    // Test 4: Restaurar estado
    await testRestaurarEstado(usuario);
    
    console.log('\n🎉 ¡Todas las pruebas se completaron exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('- ✅ Obtener usuarios: FUNCIONANDO');
    console.log('- ✅ Actualizar usuario: FUNCIONANDO'); 
    console.log('- ✅ Cambiar estado: FUNCIONANDO');
    console.log('- ✅ Restaurar estado: FUNCIONANDO');
    console.log('\n🎯 El sistema está listo para usar con endpoints estándar /usuario/{id}');
    
  } catch (error) {
    console.error('\n💥 Error en las pruebas:', error.message);
    console.error('Por favor revisa:');
    console.error('1. Tu conexión a internet');
    console.error('2. Que el token de autenticación sea válido');
    console.error('3. Que los endpoints /usuario/{id} existan en tu Xano');
    console.error('4. Que tengas permisos para actualizar usuarios');
    process.exit(1);
  }
}

// Ejecutar si se corre directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  ejecutarPruebas();
}

export { ejecutarPruebas };