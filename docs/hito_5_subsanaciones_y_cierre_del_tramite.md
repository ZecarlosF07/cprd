# HITO 5 – Subsanaciones y Cierre del Trámite

## 🎯 Objetivo del hito

Completar el **ciclo total del trámite administrativo**, permitiendo que el usuario externo subsane observaciones, que el usuario interno realice la revisión final y que el expediente llegue a un **estado de cierre**, manteniendo trazabilidad completa y notificaciones básicas.

Al finalizar este hito, el sistema opera **de inicio a fin** según el flujo definido.

---

## 🛠️ Tareas del hito

### Frontend
- Mostrar **observaciones** al usuario externo
- Implementar flujo de **subsanación** mediante carga de nuevos documentos
- Mostrar estado **SUBSANADA** en la solicitud
- Actualizar vista de detalle con nuevos documentos
- Implementar visualización de **estados finales** del expediente
- Mostrar notificaciones básicas por cambio de estado

### Backend / Servicios
- Crear servicio para **registrar subsanaciones** (nuevos documentos)
- Crear servicio para **cambiar estado a SUBSANADA**
- Validar flujo de revisión posterior a la subsanación
- Crear servicio para **estados finales** del expediente
- Crear servicio de **notificaciones básicas**
- Registrar todas las acciones en el historial

### Base de datos
- Uso de tablas existentes:
  - documentos
  - solicitudes
  - historial_solicitud
  - notificaciones
- Registro de nuevas acciones y estados finales

---

## ⚙️ Requerimientos técnicos

- Control de transiciones de estado válidas
- Asociación de subsanaciones como nuevos documentos
- Persistencia de historial completo del expediente
- Gestión básica de notificaciones (sin integraciones externas)
- Control de acceso según rol (externo / interno)
- Prevención de modificaciones a expedientes cerrados

---

## 📋 Requerimientos funcionales

### Subsanación por usuario externo

- El usuario puede visualizar observaciones registradas
- El usuario puede adjuntar **nuevos documentos** para subsanar
- La subsanación no elimina documentos previos
- El estado cambia automáticamente a **SUBSANADA**

### Revisión posterior

- El usuario interno puede revisar la subsanación
- El usuario interno puede cambiar el estado del expediente

### Estados finales del expediente

- Admitida
- Rechazada
- Archivada

Una vez alcanzado un estado final, el expediente queda **cerrado** y no puede ser modificado.

---

## ✅ Definition of Done (DoD)

Este hito se considera **completado** cuando:

- El usuario externo puede subsanar observaciones
- Las subsanaciones se registran como nuevos documentos
- El estado cambia correctamente a **SUBSANADA**
- El usuario interno puede revisar y decidir
- El expediente puede llegar a un estado final
- Los estados finales bloquean modificaciones posteriores
- Todas las acciones quedan registradas en el historial
- Se generan notificaciones básicas por cambio de estado
- El flujo completo funciona correctamente en el entorno de desarrollo

---

## 📌 Nota final

Este hito cierra el alcance del MVP definido para la Mesa de Partes Virtual.

No incluye:
- Firma digital
- Validación legal de contenido
- Integraciones bancarias
- Automatización de plazos legales

Este documento sirve como **referencia final de implementación y validación** del proyecto.