# HITO 3 – Documentos y Comprobante de Pago

## 🎯 Objetivo del hito

Completar el **ingreso formal de la solicitud**, permitiendo adjuntar los documentos requeridos y el comprobante de pago obligatorio, asegurando su correcta asociación al expediente y manteniendo la trazabilidad del proceso.

Al finalizar este hito, la solicitud queda **lista para revisión administrativa**.

---

## 🛠️ Tareas del hito

### Frontend
- Implementar componente de **carga de documentos** de la solicitud
- Implementar componente de **carga de comprobante de pago** (obligatorio)
- Validar tipo y tamaño máximo de archivos
- Permitir registrar **enlace externo** cuando el archivo supere el límite
- Mostrar listado de documentos adjuntos en el detalle de la solicitud
- Mostrar estado del comprobante de pago
- Bloquear el envío final si no existe comprobante de pago

### Backend / Servicios
- Crear servicio para registrar documentos de la solicitud
- Crear servicio para registrar comprobante de pago
- Validar asociación documento–solicitud
- Registrar usuario que carga el archivo
- Registrar acción en el historial de la solicitud
- Permitir enlaces externos como alternativa a archivos

### Base de datos
- Crear tabla **documentos**
- Crear tabla **comprobantes_pago**
- Relacionar documentos y comprobantes con la solicitud
- Registrar usuario creador del documento

---

## ⚙️ Requerimientos técnicos

- Uso de almacenamiento de archivos (storage)
- Control de tamaño máximo por archivo
- Soporte para enlaces externos (Drive u otros)
- Persistencia segura de URLs de archivos
- Validación de archivos en frontend y backend
- Control de acceso: solo el creador puede adjuntar documentos
- Registro automático de historial por cada carga

---

## 📋 Requerimientos funcionales

### Documentos de la solicitud

- Tipo de documento
- Archivo adjunto (URL interna)
- Enlace externo (opcional)
- Comentario u observación del usuario
- Usuario que adjunta el documento
- Fecha y hora de carga

### Comprobante de pago

- Archivo del comprobante (URL interna)
- Estado del comprobante:
  - Pendiente
  - Observado
  - Validado
- Motivo de observación (si aplica)
- Usuario que revisa el comprobante (uso interno posterior)
- Fecha y hora de carga

### Reglas funcionales clave

- El comprobante de pago es **obligatorio** para completar la solicitud
- Los documentos **no se reemplazan**
- Las subsanaciones se registran como **nuevos documentos**
- Una solicitud sin comprobante no puede avanzar a revisión

---

## ✅ Definition of Done (DoD)

Este hito se considera **completado** cuando:

- El usuario puede adjuntar documentos a una solicitud
- El usuario puede adjuntar un comprobante de pago
- El sistema bloquea solicitudes sin comprobante
- Los archivos quedan almacenados y asociados correctamente
- Los documentos se visualizan en el detalle de la solicitud
- Cada carga genera un registro de historial
- Se respetan las reglas de no reemplazo de documentos
- El código está integrado y funcional en el entorno de desarrollo

---

## 📌 Nota importante

Este hito **no incluye**:
- Validación del pago
- Cambio de estado administrativo
- Observaciones internas
- Subsanaciones formales (eso ocurre en el Hito 5)

Este documento sirve como **guía de implementación y validación** del tercer hito del proyecto.