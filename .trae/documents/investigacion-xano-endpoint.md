# Investigación del Endpoint PATCH /usuario/:id en Xano

## Resumen de la Investigación

Tras analizar el código actual y los errores reportados, he identificado varios problemas potenciales con el endpoint PATCH `/usuario/:id` en Xano.

## Análisis del Problema

### 1. **Function Stack del Endpoint PATCH /usuario/:id**

Basándome en el análisis del código, el endpoint probablemente tiene estos problemas:

#### **Inputs Definidos (probables):**
```
- id: integer (path parameter, requerido)
- name: string (opcional)
- last_name: string (opcional) 
- email: string (opcional)
- direccion: string (opcional)
- telefono: string (opcional)
- rol: string (opcional, valores: 'cliente', 'administrador')
- estado: string (opcional, valores: 'activo', 'bloqueado')
```

#### **Validaciones que pueden causar ERROR_FATAL:**
1. **Campos requeridos faltantes**: El endpoint puede requerir TODOS los campos del usuario
2. **Validación de email único**: Si el email ya existe en otro usuario
3. **Validación de formato de email**: Formato incorrecto de email
4. **Validación de rol**: Solo valores permitidos ('cliente', 'administrador')
5. **Validación de estado**: Solo valores permitidos ('activo', 'bloqueado')
6. **Constraints de base de datos**: Foreign keys, unique constraints, etc.

### 2. **Casos de Prueba Analizados**

#### **Caso 1: Body completo con todos los campos**
```json
{
  "name": "Claudia",
  "last_name": "Berrios", 
  "email": "claudia@example.com",
  "direccion": "Dirección de prueba",
  "telefono": "+56912345678",
  "rol": "cliente",
  "estado": "bloqueado"
}
```

#### **Caso 2: Body parcial solo con estado**
```json
{
  "estado": "bloqueado"
}
```

### 3. **Errores Identificados**

#### **Error Fatal (500) - Causas Probables:**
1. **Null Reference**: El Function Stack intenta acceder a campos que no existen
2. **Database Constraint**: Violación de constraints en la base de datos
3. **Missing Required Fields**: Falta de campos obligatorios
4. **Type Mismatch**: Tipos de datos incorrectos
5. **Logic Error**: Error en la lógica del Function Stack

#### **Error 400 - Causas Probables:**
1. **Email duplicado**: El email ya existe en otro usuario
2. **Formato inválido**: Email con formato incorrecto
3. **Valores no permitidos**: Rol o estado con valores no válidos

### 4. **Soluciones Recomendadas**

#### **Opción A: Crear Endpoints Separados (RECOMENDADO)**
```
POST /usuario/:id/bloquear
POST /usuario/:id/activar
POST /usuario/:id/cambiar-rol
```

#### **Opción B: Modificar Function Stack Existente**
- Hacer TODOS los campos opcionales excepto el ID
- Agregar validaciones de null/undefined
- Manejar errores de constraint de forma elegante
- Retornar mensajes de error específicos

#### **Opción C: Usar PUT en lugar de PATCH**
- Enviar TODOS los campos del usuario siempre
- No permitir actualizaciones parciales

### 5. **JSON Exacto para Frontend**

#### **Para bloquear usuario:**
```json
{
  "name": "Claudia",
  "last_name": "Berrios",
  "email": "claudia@example.com", 
  "direccion": "Dirección actual del usuario",
  "telefono": "+56912345678",
  "rol": "cliente",
  "estado": "bloqueado"
}
```

#### **Para activar usuario:**
```json
{
  "name": "Claudia", 
  "last_name": "Berrios",
  "email": "claudia@example.com",
  "direccion": "Dirección actual del usuario", 
  "telefono": "+56912345678",
  "rol": "cliente", 
  "estado": "activo"
}
```

### 6. **Cambios Necesarios en el Function Stack**

#### **Validaciones que DEBE tener el endpoint:**
```javascript
// 1. Validar que el usuario existe
const user = await db.usuario.findUnique({ where: { id: params.id } })
if (!user) return { status: 404, message: "Usuario no encontrado" }

// 2. Validar email único (solo si se envía email)
if (body.email && body.email !== user.email) {
  const existing = await db.usuario.findFirst({ where: { email: body.email } })
  if (existing) return { status: 400, message: "Email ya existe" }
}

// 3. Validar valores permitidos
const validEstados = ['activo', 'bloqueado']
const validRoles = ['cliente', 'administrador']

if (body.estado && !validEstados.includes(body.estado)) {
  return { status: 400, message: "Estado inválido" }
}

if (body.rol && !validRoles.includes(body.rol)) {
  return { status: 400, message: "Rol inválido" }
}

// 4. Actualizar solo los campos enviados
const updateData = {}
if (body.name !== undefined) updateData.name = body.name
if (body.last_name !== undefined) updateData.last_name = body.last_name
if (body.email !== undefined) updateData.email = body.email
if (body.direccion !== undefined) updateData.direccion = body.direccion
if (body.telefono !== undefined) updateData.telefono = body.telefono
if (body.rol !== undefined) updateData.rol = body.rol
if (body.estado !== undefined) updateData.estado = body.estado

// 5. Ejecutar actualización
await db.usuario.update({
  where: { id: params.id },
  data: updateData
})
```

### 7. **Recomendaciones Inmediatas**

1. **Contactar al desarrollador de Xano** para revisar el Function Stack
2. **Ver logs de Xano** para identificar el error exacto
3. **Crear endpoints separados** para operaciones simples (bloquear/activar)
4. **Implementar manejo de errores** más específico en el frontend
5. **Agregar validación** de campos antes de enviar a Xano

### 8. **Código Frontend Temporal (Workaround)**

```javascript
// Mientras se arregla el endpoint, usar este workaround
const updateUserStatus = async (user, newStatus) => {
  try {
    // Enviar TODOS los campos del usuario
    const updateData = {
      name: user.name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      direccion: user.direccion || '',
      telefono: user.telefono || '',
      rol: user.rol || 'cliente',
      estado: newStatus
    }
    
    // Validar campos requeridos
    if (!updateData.name || !updateData.last_name || !updateData.email) {
      throw new Error('Faltan campos requeridos del usuario')
    }
    
    await updateUser(user.id, updateData)
    
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    
    // Si falla con datos completos, intentar método alternativo
    if (error.status === 500) {
      try {
        // Intentar solo con el estado y campos mínimos
        const minimalData = {
          name: user.name,
          last_name: user.last_name,
          email: user.email,
          estado: newStatus
        }
        await updateUser(user.id, minimalData)
      } catch (fallbackError) {
        throw fallbackError
      }
    } else {
      throw error
    }
  }
}
```

## Conclusión

El error "Fatal Error" indica un problema en el Function Stack de Xano que necesita ser revisado directamente en la plataforma. Los campos requeridos y las validaciones deben ser configurados correctamente para permitir actualizaciones parciales sin causar errores fatales.