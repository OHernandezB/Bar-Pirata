// Funciones administrativas optimizadas para Xano con manejo de errores fatales
import { 
  getUsers, 
  updateUser, 
  deleteUser
} from './xano.js'

// Configuración de reintentos y timeouts
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo
const REQUEST_TIMEOUT = 15000; // 15 segundos

// Tipos de errores de Xano
const XANO_ERROR_TYPES = {
  FATAL_ERROR: 'ERROR_FATAL',
  VALIDATION_ERROR: 'ERROR_VALIDACION',
  PERMISSION_ERROR: 'ERROR_PERMISO',
  NOT_FOUND: 'ERROR_NO_ENCONTRADO',
  TIMEOUT: 'ERROR_TIMEOUT'
};

// Función auxiliar para detectar errores fatales de Xano
function detectarErrorFatal(error) {
  if (!error) return false;
  
  // Verificar mensajes de error específicos de Xano
  const mensajeError = error.message || error.data?.message || '';
  const codigoError = error.data?.code || error.code || '';
  
  // Patrones de errores fatales de Xano
  const patronesFatal = [
    /fatal\s+error/i,
    /error\s+fatal/i,
    /unique\s+id/i,
    /function\s+stack/i,
    /internal\s+server\s+error/i,
    /unexpected\s+error/i
  ];
  
  return patronesFatal.some(patron => 
    patron.test(mensajeError) || patron.test(codigoError)
  );
}

// Función para hacer retry con backoff exponencial
async function hacerRetryConBackoff(fn, intento = 1) {
  try {
    return await fn();
  } catch (error) {
    console.error(`Intento ${intento} falló:`, error);
    
    if (intento >= MAX_RETRIES) {
      throw error;
    }
    
    // Si es un error fatal, no reintentar
    if (detectarErrorFatal(error)) {
      console.error('Error fatal detectado, no se reintentará:', error);
      throw error;
    }
    
    // Esperar antes de reintentar (backoff exponencial)
    const delay = RETRY_DELAY * Math.pow(2, intento - 1);
    console.log(`Reintentando en ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return hacerRetryConBackoff(fn, intento + 1);
  }
}

// Función con timeout para requests
async function requestConTimeout(promise, timeout = REQUEST_TIMEOUT) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout de solicitud')), timeout);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

// Función simplificada para actualizar usuarios usando solo endpoints estándar
async function actualizarUsuarioEstandar(id, datos) {
  console.log('🔄 Intentando actualización mediante endpoint estándar /usuario/{id}...');
  
  // Método 1: Enviar todos los campos del usuario
  try {
    const resultado = await requestConTimeout(updateUser(id, datos));
    console.log('✅ Actualización estándar exitosa (método completo)');
    return resultado;
  } catch (error) {
    console.error('❌ Método completo falló:', error);
    
    // Método 2: Enviar solo los campos esenciales si hay error fatal
    if (detectarErrorFatal(error)) {
      console.log('🔄 Intentando método con campos mínimos...');
      return actualizarUsuarioMinimo(id, datos);
    }
    
    throw error;
  }
}

// Estrategia 3: Actualización mínima para evitar errores fatales
async function actualizarUsuarioMinimo(id, datos) {
  console.log('🔄 Intentando actualización con datos mínimos...');
  
  // Extraer solo los campos que realmente necesitamos cambiar
  const datosMinimos = {};
  
  // Solo incluir campos que están explícitamente en los datos de entrada
  if (datos.estado !== undefined) datosMinimos.estado = datos.estado;
  if (datos.rol !== undefined) datosMinimos.rol = datos.rol;
  if (datos.name !== undefined) datosMinimos.name = datos.name;
  if (datos.last_name !== undefined) datosMinimos.last_name = datos.last_name;
  if (datos.email !== undefined) datosMinimos.email = datos.email;
  if (datos.direccion !== undefined) datosMinimos.direccion = datos.direccion;
  if (datos.telefono !== undefined) datosMinimos.telefono = datos.telefono;
  
  console.log('📤 Datos mínimos a enviar:', datosMinimos);
  
  try {
    const resultado = await requestConTimeout(updateUser(id, datosMinimos));
    console.log('✅ Actualización mínima exitosa');
    return resultado;
  } catch (error) {
    console.error('❌ Actualización mínima también falló:', error);
    
    // Método 4: Reintentar con solo el campo estado si es un cambio de estado
    if (datos.estado === 'bloqueado' || datos.estado === 'activo') {
      console.log('🔄 Reintentando con solo el campo estado...');
      const estadoData = { estado: datos.estado };
      return await requestConTimeout(updateUser(id, estadoData));
    }
    
    throw error;
  }
}

// Funciones simplificadas para bloqueo/desbloqueo usando endpoints estándar
async function bloquearUsuario(id) {
  console.log('🔒 Intentando bloquear usuario con endpoint estándar...');
  
  try {
    const resultado = await requestConTimeout(updateUser(id, { estado: 'bloqueado' }));
    console.log('✅ Bloqueo exitoso con endpoint estándar');
    return resultado;
  } catch (error) {
    console.error('❌ Bloqueo con endpoint estándar falló:', error);
    
    // Si hay error fatal, intentar con campos mínimos
    if (detectarErrorFatal(error)) {
      return await requestConTimeout(updateUser(id, { estado: 'bloqueado' }));
    }
    
    throw error;
  }
}

async function desbloquearUsuario(id) {
  console.log('🔓 Intentando desbloquear usuario con endpoint estándar...');
  
  try {
    const resultado = await requestConTimeout(updateUser(id, { estado: 'activo' }));
    console.log('✅ Desbloqueo exitoso con endpoint estándar');
    return resultado;
  } catch (error) {
    console.error('❌ Desbloqueo con endpoint estándar falló:', error);
    
    // Si hay error fatal, intentar con campos mínimos
    if (detectarErrorFatal(error)) {
      return await requestConTimeout(updateUser(id, { estado: 'activo' }));
    }
    
    throw error;
  }
}

// Función principal para actualizar usuarios usando solo endpoints estándar
export async function actualizarUsuarioRobusto(id, datos) {
  console.log('=== INICIANDO ACTUALIZACIÓN ROBUSTA ===');
  console.log('ID:', id);
  console.log('Datos:', datos);
  
  try {
    // Intentar con retry y backoff exponencial usando solo endpoints estándar
    const resultado = await hacerRetryConBackoff(async () => {
      return await actualizarUsuarioEstandar(id, datos);
    });
    
    console.log('✅ Actualización robusta completada exitosamente');
    return resultado;
    
  } catch (error) {
    console.error('❌ Todas las estrategias de actualización fallaron:', error);
    
    // Proporcionar información detallada sobre el error
    const errorInfo = {
      tipo: detectarErrorFatal(error) ? XANO_ERROR_TYPES.FATAL_ERROR : XANO_ERROR_TYPES.VALIDATION_ERROR,
      mensaje: error.message || 'Error desconocido al actualizar usuario',
      status: error.status || 500,
      datos: error.data || null,
      idUsuario: id,
      datosEnviados: datos
    };
    
    console.error('📊 Información del error final:', errorInfo);
    
    // Crear un error mejorado con información adicional
    const errorMejorado = new Error(`Error al actualizar usuario: ${errorInfo.mensaje}`);
    errorMejorado.tipo = errorInfo.tipo;
    errorMejorado.status = errorInfo.status;
    errorMejorado.datos = errorInfo;
    
    throw errorMejorado;
  }
}

// Función para eliminar usuarios usando solo endpoints estándar
export async function eliminarUsuarioRobusto(id) {
  console.log('=== INICIANDO ELIMINACIÓN ROBUSTA ===');
  console.log('ID:', id);
  
  try {
    // Usar solo el endpoint estándar para eliminar
    const resultado = await requestConTimeout(deleteUser(id));
    console.log('✅ Eliminación estándar exitosa');
    return resultado;
  } catch (error) {
    console.error('❌ Eliminación falló:', error);
    
    const errorInfo = {
      tipo: detectarErrorFatal(error) ? XANO_ERROR_TYPES.FATAL_ERROR : XANO_ERROR_TYPES.VALIDATION_ERROR,
      mensaje: error.message || 'Error al eliminar usuario',
      status: error.status || 500,
      datos: error.data || null,
      idUsuario: id
    };
    
    const errorMejorado = new Error(`Error al eliminar usuario: ${errorInfo.mensaje}`);
    errorMejorado.tipo = errorInfo.tipo;
    errorMejorado.status = errorInfo.status;
    errorMejorado.datos = errorInfo;
    
    throw errorMejorado;
  }
}

// Función para obtener usuarios con manejo de errores
export async function obtenerUsuariosRobusto(params = {}) {
  console.log('=== INICIANDO OBTENCIÓN ROBUSTA DE USUARIOS ===');
  
  try {
    const resultado = await hacerRetryConBackoff(async () => {
      return await requestConTimeout(getUsers(params));
    });
    
    console.log('✅ Obtención de usuarios exitosa');
    return resultado;
    
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    
    const errorInfo = {
      tipo: detectarErrorFatal(error) ? XANO_ERROR_TYPES.FATAL_ERROR : XANO_ERROR_TYPES.VALIDATION_ERROR,
      mensaje: error.message || 'Error al obtener lista de usuarios',
      status: error.status || 500,
      datos: error.data || null
    };
    
    const errorMejorado = new Error(`Error al obtener usuarios: ${errorInfo.mensaje}`);
    errorMejorado.tipo = errorInfo.tipo;
    errorMejorado.status = errorInfo.status;
    errorMejorado.datos = errorInfo;
    
    throw errorMejorado;
  }
}

// Función helper para manejar el cambio de estado (bloquear/desbloquear)
export async function cambiarEstadoUsuario(id, estadoActual) {
  const nuevoEstado = estadoActual === 'activo' ? 'bloqueado' : 'activo';
  console.log(`🔄 Cambiando estado de ${estadoActual} a ${nuevoEstado}`);
  
  try {
    // Intentar primero con actualización directa del estado
    console.log('🔄 Intentando actualización directa del estado...');
    await requestConTimeout(updateUser(id, { estado: nuevoEstado }));
    console.log(`✅ Estado cambiado a ${nuevoEstado} con updateUser directo`);
    return nuevoEstado;
  } catch (error) {
    console.error(`❌ Error al cambiar estado directamente:`, error);
    
    // Si falla, usar la función robusta con todos los datos del usuario
    console.log('🔄 Intentando con función robusta...');
    try {
      await actualizarUsuarioRobusto(id, { estado: nuevoEstado });
      console.log(`✅ Estado cambiado a ${nuevoEstado} con función robusta`);
      return nuevoEstado;
    } catch (robustError) {
      console.error(`❌ Error al cambiar estado con función robusta:`, robustError);
      throw robustError;
    }
  }
}

// Exportar tipos de errores para uso en componentes
export { XANO_ERROR_TYPES };