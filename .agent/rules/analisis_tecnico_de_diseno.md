# Análisis Técnico de Diseño de la Aplicación

## Sistema Institucional de Mesa de Partes Virtual

### Procedimientos de Arbitraje, Arbitraje de Emergencia y JPRD

---

## 1. Introducción

El presente documento describe el **análisis técnico de diseño** del Sistema Institucional de Mesa de Partes Virtual, tomando como base el Resumen Ejecutivo, el Documento de Análisis Funcional y las aclaraciones funcionales y operativas levantadas durante la etapa de definición.

Este análisis tiene como objetivo establecer las **decisiones técnicas fundamentales** que guiarán la construcción del sistema, asegurando coherencia entre el modelo funcional, la arquitectura tecnológica y la futura implementación.

El sistema se desarrollará como una aplicación **SaaS institucional de uso interno**, orientada a la recepción administrativa, control documental y trazabilidad de solicitudes vinculadas a procedimientos de Arbitraje, Arbitraje de Emergencia y JPRD.

---

## 2. Principios técnicos de diseño

El diseño técnico del sistema se rige por los siguientes principios:

- **Unificación de modelo**: evitar duplicidad de estructuras por tipo de procedimiento.
- **Separación de responsabilidades**: diferenciación clara entre usuario, parte, solicitud y expediente.
- **Trazabilidad completa**: toda acción relevante debe quedar registrada.
- **Control de accesos**: basado en rol y pertenencia, reforzado a nivel backend.
- **Simplicidad operativa**: priorizar soluciones claras y mantenibles frente a automatizaciones complejas.
- **Escalabilidad funcional**: permitir la incorporación futura de nuevos procedimientos o validaciones.

---

## 3. Arquitectura general del sistema

El sistema adopta una arquitectura **frontend–backend desacoplada**, compuesta por:

- **Frontend**: Aplicación web desarrollada en React.
- **Backend**: Supabase como plataforma unificada de:
  - Autenticación de usuarios
  - Base de datos relacional (PostgreSQL)
  - Almacenamiento de archivos
  - Lógica de seguridad (RLS, funciones, triggers)

El frontend se comunica directamente con Supabase mediante su SDK, sin un backend intermedio tradicional.

---

## 4. Tipos de usuario y su rol técnico

### 4.1 Usuario Externo

- Usuario autenticado mediante Supabase Auth.
- Representa **directamente a la parte principal del trámite**:
  - Demandante (Arbitraje / Arbitraje de Emergencia)
  - Contratista (JPRD)
- Puede:
  - Crear solicitudes
  - Adjuntar documentos
  - Adjuntar comprobantes de pago
  - Subsanar observaciones
  - Consultar el estado de sus expedientes

### 4.2 Usuario Interno

- Usuario autenticado con rol interno.
- Gestiona solicitudes y expedientes.
- Puede:
  - Visualizar todas las solicitudes
  - Revisar documentos y pagos
  - Cambiar estados
  - Registrar observaciones

### 4.3 Administrador del Sistema

- Usuario con privilegios totales.
- Gestiona usuarios internos, roles y configuraciones básicas.

---

## 5. Modelo conceptual unificado

### 5.1 Usuario vs Parte

Se establece una **separación técnica clara** entre:

- **Usuario**: identidad autenticada del sistema.
- **Parte**: entidad que participa en una solicitud.

El usuario externo **sí está vinculado** a una Parte cuando actúa como demandante o contratista.

---

### 5.2 Entidad Parte

La entidad **Parte** es única y genérica, diferenciada por:

- Rol dentro de la solicitud
- Tipo de persona (natural o jurídica)

#### Roles definidos:

- demandante
- demandado
- contratista
- entidad

#### Relación con usuario:

- El campo `user_id` es:
  - Obligatorio para roles demandante y contratista
  - Nulo para roles demandado y entidad

---

## 6. Tipos de solicitud

El sistema maneja un único modelo de Solicitud, tipificado por el campo `tipo_solicitud`:

- ARBITRAJE
- ARBITRAJE_EMERGENCIA
- JPRD

El tipo de solicitud determina:

- Los roles de las partes
- Las etiquetas del formulario
- Algunas reglas de obligatoriedad

No determina estructuras de datos distintas.

---

## 7. Expediente

Cada solicitud genera un **expediente único**, identificado por un código institucional.

Características técnicas:

- Código generado automáticamente en backend
- Asociado a una única solicitud
- Contenedor lógico de:
  - Partes
  - Documentos
  - Comprobantes
  - Historial

---

## 8. Gestión documental

### 8.1 Documentos

Los documentos son entidades independientes asociadas a una solicitud o expediente.

Características:

- No existe versionado formal
- Las subsanaciones se registran como nuevos documentos
- Cada documento puede tener:
  - Archivo físico
  - Enlace externo (Drive)

### 8.2 Comprobante de pago

El comprobante de pago es un **tipo especial de documento**:

- Es obligatorio para enviar la solicitud
- Se revisa manualmente
- Puede ser observado
- Tiene estado propio

---

## 9. Flujo de estados del expediente

Los estados del expediente son secuenciales:

- Recibida
- En revisión
- Observada
- Subsanada
- Admitida
- Rechazada
- Archivada

Reglas técnicas:

- Solo usuarios internos pueden cambiar estados
- Todo cambio de estado genera un registro de trazabilidad

---

## 10. Trazabilidad y auditoría

El sistema registra de manera obligatoria:

- Usuario responsable de cada acción
- Fecha y hora
- Tipo de acción
- Solicitud y expediente asociados

La trazabilidad es transversal a todo el sistema y no depende del frontend.

---

## 11. Notificaciones

El sistema contempla notificaciones básicas por:

- Confirmación de recepción
- Cambio de estado
- Registro de observaciones

Las notificaciones se disparan por eventos del sistema y no alteran el flujo principal.

---

## 12. Seguridad y control de acceso

El control de acceso se implementa mediante:

- Autenticación con Supabase Auth
- Autorización basada en:
  - Rol del usuario
  - Relación del usuario con la Parte

Principios clave:

- El usuario externo solo puede acceder a solicitudes donde está vinculado como Parte
- Los usuarios internos acceden a todas las solicitudes
- Las reglas se aplican a nivel de base de datos (RLS)

---

## 13. Diseño del frontend

El frontend en React se estructura de forma modular:

- Formularios dinámicos configurados por tipo de solicitud
- Componentes reutilizables:
  - Formulario de Parte
  - Carga de Documentos
  - Carga de Comprobante
- Protección de rutas por rol

El frontend no implementa reglas críticas de seguridad sin respaldo en backend.

---

## 14. Suposiciones y límites técnicos

El diseño asume que:

- No existe validación legal automática
- No existen integraciones bancarias
- El control de plazos se realiza fuera del sistema

Estos límites son intencionales y alineados con el alcance institucional del sistema.

---

## 15. Conclusión

El diseño técnico propuesto proporciona una base sólida, coherente y mantenible para el desarrollo del Sistema de Mesa de Partes Virtual.

Las decisiones adoptadas permiten:

- Reducir complejidad
- Evitar duplicidad
- Garantizar trazabilidad
- Asegurar control de accesos

Este documento habilita formalmente el inicio de la etapa de **diseño detallado de base de datos, reglas de seguridad e implementación frontend**.