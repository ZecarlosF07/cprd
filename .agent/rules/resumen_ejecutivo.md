# Resumen Ejecutivo del Proyecto

## Mesa de Partes Virtual para Procedimientos de Arbitraje y JPRD

### 1. Contexto y propósito
El proyecto consiste en el desarrollo de un **Sistema Institucional de Mesa de Partes Virtual**, orientado a la gestión ordenada, controlada y trazable del ingreso de solicitudes y documentos vinculados a procedimientos de **Arbitraje**, **Arbitraje de Emergencia** y **JPRD (Junta de Prevención y Resolución de Disputas)**.

La finalidad del sistema es **digitalizar y centralizar** el proceso de recepción administrativa de solicitudes, reemplazando mecanismos manuales o dispersos, y garantizando un manejo uniforme de la información, control documental y seguimiento del trámite desde su ingreso hasta su cierre administrativo.

El sistema está concebido como un **SaaS institucional**, de uso interno de la entidad, enfocado en la eficiencia operativa, la trazabilidad y el control de accesos, y no como una plataforma comercial abierta ni como un sistema integral de gestión del proceso arbitral.

---

### 2. Alcance general del sistema
El sistema cubre exclusivamente la **etapa de recepción y control administrativo** de las solicitudes, permitiendo a los usuarios externos presentar sus trámites de manera digital y al personal interno gestionarlos de forma estructurada, con estados definidos y trazabilidad completa.

Dentro de este alcance, el sistema permite:
- Registro e inicio de sesión de usuarios externos (personas naturales y jurídicas).
- Presentación de solicitudes mediante formularios digitales diferenciados según el tipo de procedimiento.
- Carga y administración de documentos asociados a cada expediente.
- Registro obligatorio del comprobante de pago como parte del ingreso de la solicitud.
- Generación automática de un expediente con código único.
- Seguimiento del estado del trámite por parte del usuario externo.
- Panel de gestión interna para revisión, observación, validación básica y control del flujo de solicitudes.

El sistema no incluye integraciones externas avanzadas, automatizaciones complejas ni validaciones legales automáticas, manteniendo un enfoque estrictamente administrativo e institucional.

---

### 3. Tipos de solicitudes
El sistema permite el ingreso de tres tipos de solicitudes, cada una con su propio formulario y lógica operativa:

- **Solicitud de Arbitraje**
- **Arbitraje de Emergencia**, identificado con prioridad en la atención interna.
- **JPRD (Junta de Prevención y Resolución de Disputas)**

La selección del tipo de solicitud es obligatoria y constituye el primer paso del flujo de ingreso, garantizando que la información y los documentos se capturen de acuerdo con la naturaleza del procedimiento.

---

### 4. Usuarios del sistema
El sistema contempla tres perfiles principales de usuario:

- **Usuario Externo**: Persona natural o jurídica que se registra en el sistema para presentar solicitudes, adjuntar documentos y comprobantes de pago, realizar subsanaciones y consultar el estado de sus expedientes.
- **Usuario Interno**: Personal de la entidad encargado de revisar solicitudes, verificar documentos y pagos, registrar observaciones y gestionar los estados del expediente dentro del flujo administrativo.
- **Administrador del Sistema**: Responsable de la administración de usuarios internos, asignación de roles y configuración básica del sistema.

Cada perfil cuenta con permisos claramente delimitados, asegurando control de accesos, trazabilidad de acciones y separación de responsabilidades.

---

### 5. Flujo general de funcionamiento
De manera resumida, el funcionamiento del sistema es el siguiente:

1. El usuario externo se registra e inicia sesión.
2. Selecciona el tipo de solicitud que desea presentar.
3. Completa el formulario correspondiente al procedimiento.
4. Adjunta los documentos requeridos y, de ser necesario, enlaces externos para anexos.
5. Adjunta obligatoriamente el comprobante de pago.
6. Envía la solicitud.
7. El sistema genera un expediente con código único y registra la fecha y hora de presentación.
8. El usuario interno revisa la solicitud, verifica la documentación y el pago, y gestiona el estado del expediente.
9. En caso de observaciones, el usuario externo subsana hasta la admisión o rechazo final del trámite.

---

### 6. Principios del sistema
El diseño y funcionamiento del sistema se rigen por los siguientes principios:

- **Orden**: toda solicitud y documento se encuentra estructurado y centralizado en un único expediente.
- **Trazabilidad**: cada acción queda registrada con fecha, hora y responsable.
- **Control**: flujos claros, estados definidos y roles diferenciados.
- **Claridad operativa**: procesos comprensibles tanto para usuarios externos como internos.

---

### 7. Límites del sistema
El sistema no contempla en esta etapa:
- Firma digital ni validación legal del contenido presentado.
- Integraciones bancarias o validación automática de pagos.
- Cálculo o control de plazos legales.
- Gestión de audiencias, resoluciones u otras actuaciones propias del proceso arbitral.

Estos elementos podrán ser evaluados e incorporados en fases posteriores, una vez consolidado el funcionamiento institucional del sistema.

---

Este resumen ejecutivo proporciona una **visión global y alineada del sistema institucional**, sirviendo como base para el desarrollo del análisis funcional detallado y el posterior diseño técnico.

