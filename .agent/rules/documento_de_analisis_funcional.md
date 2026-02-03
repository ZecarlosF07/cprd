# Documento de Análisis Funcional

## Sistema Institucional de Mesa de Partes Virtual
### Procedimientos de Arbitraje, Arbitraje de Emergencia y JPRD

---

## 1. Introducción

El presente documento describe el **análisis funcional completo** del **Sistema Institucional de Mesa de Partes Virtual**, orientado a la gestión administrativa del ingreso de solicitudes y documentos vinculados a procedimientos de Arbitraje, Arbitraje de Emergencia y JPRD (Junta de Prevención y Resolución de Disputas).

Este documento tiene como finalidad establecer de manera clara y estructurada el **alcance funcional del sistema**, los **tipos de usuario**, los **flujos mínimos necesarios**, las **reglas de negocio**, así como las **suposiciones, restricciones y riesgos**, sirviendo como base para las siguientes etapas de diseño técnico y desarrollo.

---

## 2. Objetivo del sistema

El sistema tiene como objetivo principal **digitalizar, centralizar y controlar** el proceso de recepción administrativa de solicitudes y documentos, garantizando:

- Orden y uniformidad en el ingreso de trámites.
- Trazabilidad completa de cada expediente.
- Control de accesos y responsabilidades.
- Claridad en los flujos administrativos internos.

El sistema **no gestiona el fondo del proceso arbitral**, ni reemplaza actos formales del procedimiento, limitándose a la etapa de mesa de partes y control administrativo.

---

## 3. Alcance del sistema

### 3.1 Alcance incluido

El sistema contempla las siguientes funcionalidades:

- Registro e inicio de sesión de usuarios externos.
- Gestión de usuarios internos y roles.
- Presentación digital de solicitudes.
- Formularios diferenciados por tipo de procedimiento.
- Carga, descarga y visualización de documentos.
- Registro obligatorio de comprobantes de pago.
- Generación automática de expedientes con código único.
- Gestión de estados del expediente.
- Registro de observaciones y subsanaciones.
- Notificaciones básicas por cambio de estado.
- Panel de gestión interna para control administrativo.

### 3.2 Alcance excluido

El sistema no incluye:

- Firma digital.
- Validación legal del contenido presentado.
- Integraciones bancarias.
- Validación automática de pagos.
- Cálculo de plazos legales.
- Gestión de audiencias, resoluciones o actuaciones arbitrales.

---

## 4. Tipos de usuario y permisos

### 4.1 Usuario Externo

**Descripción:** Persona natural o jurídica que utiliza el sistema para presentar solicitudes.

**Permisos:**
- Registrarse e iniciar sesión.
- Crear solicitudes.
- Adjuntar documentos y enlaces externos.
- Adjuntar comprobantes de pago.
- Consultar el estado del expediente.
- Visualizar observaciones.
- Subsanar observaciones.

**Restricciones:**
- No puede modificar solicitudes enviadas.
- No puede cambiar estados.
- No puede ver información interna.

---

### 4.2 Usuario Interno

**Descripción:** Personal de la entidad responsable de la gestión administrativa.

**Permisos:**
- Visualizar todas las solicitudes.
- Acceder a documentos y enlaces.
- Revisar comprobantes de pago.
- Marcar pagos como válidos u observados.
- Cambiar estados del expediente.
- Registrar observaciones.
- Consultar trazabilidad completa.

---

### 4.3 Administrador del Sistema

**Descripción:** Rol responsable de la administración del sistema.

**Permisos:**
- Crear y gestionar usuarios internos.
- Asignar roles y permisos.
- Configurar catálogos básicos.
- Acceso total a la información.

---

## 5. Tipos de solicitudes

El sistema gestiona los siguientes tipos de solicitud:

1. Solicitud de Arbitraje.
2. Arbitraje de Emergencia (prioritario).
3. JPRD (Junta de Prevención y Resolución de Disputas).

La selección del tipo de solicitud es obligatoria y determina el formulario y flujo aplicable.

---

## 6. Formularios y datos

### 6.1 Registro de usuario externo

- Persona Natural:
  - Tipo de Documento
  - Número de Documento
  - Nombres y Apellidos
  - Correo electrónico
  - Contraseña

- Persona Jurídica:
  - RUC
  - Razón Social
  - Correo electrónico
  - Contraseña

---

### 6.2 Formulario de solicitud

Cada tipo de solicitud cuenta con su propio formulario, el cual incluye:

- Datos del demandante.
- Datos del demandado.
- Información específica del procedimiento.
- Documentos obligatorios y opcionales.
- Campo para enlace externo (Drive).
- Sección de pago y comprobante.

---

## 7. Gestión documental

- Los documentos iniciales no se reemplazan.
- Las subsanaciones se registran como nuevos documentos.
- No existe versionado formal.
- Tamaño máximo permitido por archivo.
- En caso de superar el límite, se registra un enlace externo.

---

## 8. Pagos y comprobantes

- Todas las solicitudes requieren pago.
- El comprobante es obligatorio para enviar la solicitud.
- El pago se revisa manualmente.
- El usuario interno puede observar el comprobante.
- El usuario externo solo visualiza el estado del expediente.

---

## 9. Estados del expediente

- Recibida
- En revisión
- Observada
- Subsanada
- Admitida
- Rechazada
- Archivada

Los estados son secuenciales y todo cambio queda registrado.

---

## 10. Flujos funcionales

### 10.1 Flujo de creación de solicitud

1. Usuario externo inicia sesión.
2. Selecciona tipo de solicitud.
3. Completa formulario.
4. Adjunta documentos y comprobante de pago.
5. Envía solicitud.
6. El sistema genera expediente.

---

### 10.2 Flujo de revisión

1. Usuario interno revisa la solicitud.
2. Verifica documentos y pago.
3. Cambia estado u observa.
4. Usuario externo subsana si corresponde.

---

## 11. Trazabilidad

El sistema registra:

- Usuario responsable de cada acción.
- Fecha y hora.
- Cambios de estado.
- Observaciones.
- Documentos asociados.

---

## 12. Notificaciones

- Confirmación de recepción.
- Cambio de estado.
- Registro de observaciones.

---

## 13. Suposiciones

- El contenido no es validado legalmente.
- No existen integraciones externas.
- El control de plazos se realiza fuera del sistema.

---

## 14. Riesgos

- Dependencia de enlaces externos.
- Carga administrativa por observaciones.
- Falta de validación automática de pagos.

---

## 15. Límites del sistema

El sistema no reemplaza actos formales del procedimiento arbitral y se limita al control administrativo del ingreso y seguimiento de solicitudes.

---

**Este documento constituye la base formal del análisis funcional del sistema y habilita el paso a la etapa de diseño técnico.**