# HITO 2 – Creación de Solicitud (sin documentos)

## 🎯 Objetivo del hito

Implementar el **núcleo funcional del sistema**, permitiendo que un usuario autenticado cree una solicitud administrativa y que el sistema genere un expediente con código único, estado inicial y trazabilidad básica.

Este hito materializa por primera vez el negocio de la Mesa de Partes Virtual.

---

## 🛠️ Tareas del hito

### Frontend
- Crear pantalla **“Nueva solicitud”**
- Implementar selección de tipo de solicitud:
  - Arbitraje
  - Arbitraje de Emergencia
  - JPRD
- Implementar formulario base según tipo de solicitud (ver campos más abajo)
- Validar campos obligatorios del formulario
- Implementar acción de **guardar solicitud**
- Crear pantalla de **detalle de solicitud**
- Mostrar código de expediente, tipo y estado
- Crear pantalla **“Nueva solicitud”**
- Implementar selección de tipo de solicitud:
  - Arbitraje
  - Arbitraje de Emergencia
  - JPRD
- Implementar formulario base según tipo de solicitud
- Validar campos obligatorios del formulario
- Implementar acción de **guardar solicitud**
- Crear pantalla de **detalle de solicitud**
- Mostrar código de expediente y estado

### Backend / Servicios
- Crear servicio para **crear solicitud**
- Generar automáticamente el **código único de expediente**
- Asignar tipo de solicitud
- Asignar estado inicial: **RECIBIDA**
- Asociar solicitud al usuario creador
- Crear servicio para obtener detalle de solicitud

### Base de datos
- Crear tabla de **solicitudes**
- Crear tabla de **historial de solicitud**
- Definir relación solicitud – usuario
- Definir campos mínimos del expediente

---

## ⚙️ Requerimientos técnicos

- El usuario debe estar autenticado para crear solicitudes
- Validaciones de datos en frontend y backend
- Generación segura y única del código de expediente
- Persistencia correcta de estados
- Registro automático de historial al crear la solicitud
- Control de acceso: solo el creador puede ver su solicitud

---

## 📋 Requerimientos funcionales

### Campos de la solicitud – Comunes a todos los tipos

- Tipo de solicitud (Arbitraje / Arbitraje de Emergencia / JPRD)
- Usuario solicitante (desde sesión)
- Fecha y hora de presentación (automática)
- Código de expediente (automático)
- Estado de la solicitud (automático)

### Campos específicos – Solicitud de Arbitraje / Arbitraje de Emergencia

**Datos del demandante** (precargados desde el perfil):
- Tipo de persona
- Tipo y número de documento / RUC
- Nombres y apellidos o razón social
- Domicilio
- Correo electrónico

**Datos del demandado**:
- Tipo de persona
- Tipo y número de documento / RUC
- Nombres y apellidos o razón social
- Domicilio
- Correo electrónico

**Información del procedimiento**:
- Breve descripción de la controversia
- Pretensión principal

### Campos específicos – Solicitud JPRD

**Datos del solicitante / contratista** (precargados desde el perfil):
- Tipo de persona
- Tipo y número de documento / RUC
- Nombres y apellidos o razón social
- Domicilio
- Correo electrónico

**Datos de la entidad**:
- Nombre de la entidad
- RUC de la entidad
- Dirección de la entidad
- Correo electrónico de contacto

**Información del procedimiento**:
- Breve descripción del conflicto o consulta

---

## 📋 Requerimientos funcionales (continuación)

- El usuario puede crear una nueva solicitud
- El usuario debe seleccionar obligatoriamente el tipo de solicitud
- El sistema genera un código de expediente único
- La solicitud se registra con estado **RECIBIDA**
- El usuario puede visualizar el detalle de su solicitud
- Cada solicitud tiene un historial inicial registrado

- El usuario puede crear una nueva solicitud
- El usuario debe seleccionar obligatoriamente el tipo de solicitud
- El sistema genera un código de expediente único
- La solicitud se registra con estado **RECIBIDA**
- El usuario puede visualizar el detalle de su solicitud
- Cada solicitud tiene un historial inicial registrado

---

## ✅ Definition of Done (DoD)

Este hito se considera **completado** cuando:

- Un usuario autenticado puede crear una solicitud
- La solicitud queda registrada en base de datos
- El código de expediente se genera automáticamente
- El estado inicial es **RECIBIDA**
- El detalle de la solicitud se visualiza correctamente
- El historial registra la creación de la solicitud
- Un usuario no autenticado no puede crear solicitudes
- El código está integrado y funcional en el entorno de desarrollo

---

## 📌 Nota importante

Este hito **no incluye**:
- Carga de documentos
- Carga de comprobante de pago
- Revisión administrativa
- Subsanaciones

Cualquier lógica relacionada con archivos o pagos pertenece al **Hito 3**.

Este documento sirve como **guía de implementación y validación** del segundo hito del proyecto.

