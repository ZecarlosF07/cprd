# HITO 1 – Login y Gestión de Usuarios

## 🎯 Objetivo del hito

Implementar la **base de acceso al sistema**, permitiendo que los usuarios se registren, inicien sesión y accedan a la aplicación según su rol. Este hito establece la seguridad, el control de accesos y la estructura mínima de usuarios sobre la cual se construyen todos los hitos posteriores.

Sin este hito, **no es posible** crear solicitudes, cargar documentos ni realizar gestión administrativa.

---

## 🛠️ Tareas del hito

### Frontend
- Crear pantalla de **Login**
- Crear pantalla de **Registro de usuario externo**
- Crear pantalla de **Creación / edición de perfil**
  - Persona natural
  - Persona jurídica
- Implementar protección de rutas (usuario no autenticado / autenticado)
- Implementar redirección según rol:
  - Usuario externo
  - Usuario interno
  - Administrador

### Backend / Servicios
- Configurar autenticación (email y contraseña)
- Crear servicio de registro de usuario
- Crear servicio de inicio de sesión
- Crear servicio de obtención del usuario autenticado
- Crear servicio de creación y actualización de perfil

### Base de datos
- Crear tabla de perfiles de usuario
- Relacionar perfil con usuario autenticado
- Definir campos obligatorios según tipo de persona

---

## ⚙️ Requerimientos técnicos

- Sistema de autenticación seguro (email + contraseña)
- Persistencia de sesión
- Manejo de estados de autenticación en frontend
- Separación de roles (externo, interno, administrador)
- Protección de rutas basada en rol
- Validaciones básicas de formularios
- Manejo de errores de autenticación

---

## 📋 Requerimientos funcionales

- El usuario puede registrarse con correo y contraseña
- El usuario puede iniciar sesión
- El sistema obliga a completar el perfil después del registro
- El perfil puede ser de persona natural o jurídica
- El sistema identifica el rol del usuario
- El usuario solo puede acceder a pantallas permitidas por su rol
- Un usuario no autenticado no puede acceder al sistema

---

## ✅ Definition of Done (DoD)

Este hito se considera **completado** cuando:

- Un usuario externo puede registrarse exitosamente
- Un usuario puede iniciar sesión con sus credenciales
- El perfil queda correctamente registrado y asociado al usuario
- El sistema reconoce el rol del usuario
- Las rutas están protegidas según autenticación y rol
- No es posible acceder a funcionalidades sin estar logueado
- El flujo de login y registro funciona sin errores críticos
- El código está integrado y funcional en el entorno de desarrollo

---

## 📌 Nota importante

Este hito **no incluye** funcionalidades de solicitudes, documentos, pagos ni revisión administrativa. Cualquier lógica adicional debe ser postergada a los siguientes hitos para evitar sobrecargar esta etapa.

Este documento sirve como **referencia de implementación y validación** para el equipo de desarrollo.