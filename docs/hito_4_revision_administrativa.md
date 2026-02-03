# HITO 4 – Revisión Administrativa (Usuario Interno)

## 🎯 Objetivo del hito

Habilitar la **gestión administrativa interna** de las solicitudes ingresadas, permitiendo al personal de la entidad revisar la información, documentos y comprobantes de pago, registrar observaciones y cambiar el estado del expediente con trazabilidad completa.

Al finalizar este hito, la institución puede **operar la Mesa de Partes Virtual**.

---

## 🛠️ Tareas del hito

### Frontend
- Implementar **login de usuario interno**
- Crear **bandeja de solicitudes** con filtros básicos (estado, tipo, fecha)
- Implementar vista de **detalle completo de la solicitud**
- Visualizar documentos adjuntos y enlaces externos
- Visualizar comprobante de pago y su estado
- Implementar acciones de revisión:
  - Cambiar estado de la solicitud
  - Registrar observaciones
- Visualizar historial de acciones del expediente

### Backend / Servicios
- Crear servicio para **listar solicitudes** (uso interno)
- Crear servicio para **obtener detalle completo** de una solicitud
- Crear servicio para **cambiar estado de la solicitud**
- Crear servicio para **registrar observaciones**
- Registrar automáticamente cada acción en el historial
- Validar permisos de usuario interno

### Base de datos
- Uso de tablas existentes:
  - solicitudes
  - documentos
  - comprobantes_pago
  - historial_solicitud
- Registrar cambios de estado y observaciones en historial

---

## ⚙️ Requerimientos técnicos

- Control de acceso exclusivo para usuarios internos
- Protección de rutas por rol
- Validación de transiciones de estado permitidas
- Persistencia de estados y observaciones
- Registro automático de usuario, fecha y hora por acción
- Manejo de concurrencia básica (evitar estados inconsistentes)

---

## 📋 Requerimientos funcionales

### Bandeja de solicitudes

- Listado de todas las solicitudes ingresadas
- Visualización de:
  - Código de expediente
  - Tipo de solicitud
  - Estado actual
  - Fecha de ingreso
- Acceso al detalle de cada solicitud

### Revisión de solicitud

- Visualizar datos completos de la solicitud
- Visualizar todos los documentos asociados
- Visualizar comprobante de pago
- Registrar observaciones administrativas

### Estados gestionados en este hito

- Recibida
- En revisión
- Observada
- Admitida

Cada cambio de estado debe generar un registro en el historial.

---

## ✅ Definition of Done (DoD)

Este hito se considera **completado** cuando:

- Un usuario interno puede iniciar sesión
- El usuario interno puede ver la bandeja de solicitudes
- El usuario interno puede acceder al detalle completo
- Se pueden revisar documentos y comprobantes
- Se pueden registrar observaciones
- Se pueden cambiar estados permitidos
- Cada acción queda registrada en el historial
- Usuarios no internos no pueden acceder a estas funciones
- El flujo funciona correctamente en el entorno de desarrollo

---

## 📌 Nota importante

Este hito **no incluye**:
- Subsanación por el usuario externo
- Estados finales (rechazada / archivada)
- Notificaciones automáticas

Estas funcionalidades se implementan en el **Hito 5**.

Este documento sirve como **guía de implementación y validación** del cuarto hito del proyecto.