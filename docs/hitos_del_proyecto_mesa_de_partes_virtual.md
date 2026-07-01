# Hitos del Proyecto – Mesa de Partes Virtual

Este documento describe de forma **simple, cronológica y práctica** los 6 hitos del proyecto, para que todo el equipo de desarrollo tenga claro **qué se construye en cada etapa** y **en qué momento ocurre cada funcionalidad clave**.

---

## 🧩 HITO 1 – Login y gestión de usuarios

**Qué se construye en este hito**

- Pantalla de login
- Pantalla de registro de usuario externo
- Creación de usuarios en el sistema
- Creación de perfil:
  - Persona natural
  - Persona jurídica
- Asignación de rol:
  - Usuario externo
  - Usuario interno
  - Administrador
- Protección de rutas según autenticación y rol

**Qué NO se hace todavía**
- No se crean solicitudes
- No se suben documentos
- No existe flujo administrativo

**Resultado esperado**
> El usuario puede registrarse, iniciar sesión y acceder al sistema según su rol.

---

## 🧩 HITO 2 – Creación de solicitud (sin documentos)

**Qué se construye en este hito**

- Pantalla "Nueva solicitud"
- Selección del tipo de solicitud:
  - Arbitraje
  - Arbitraje de emergencia
  - JPRD
- Formulario básico de la solicitud
- Registro de la solicitud en base de datos
- Generación automática del código de expediente
- Estado inicial de la solicitud: **RECIBIDA**
- Pantalla de detalle de la solicitud
- Registro inicial de historial

**Qué NO se hace todavía**
- No se suben documentos
- No se sube comprobante de pago
- No existe revisión interna

**Resultado esperado**
> Un usuario logueado puede crear una solicitud y verla registrada con su código de expediente.

---

## 🧩 HITO 3 – Documentos y comprobante de pago

**Qué se construye en este hito**

- Carga de documentos de la solicitud
- Carga obligatoria del comprobante de pago
- Almacenamiento de archivos en el sistema
- Asociación de documentos a la solicitud
- Visualización de documentos en el detalle
- Validaciones básicas (archivo obligatorio, tamaño máximo)

**Reglas importantes**
- Los documentos no se reemplazan
- Las subsanaciones generan nuevos documentos

**Resultado esperado**
> La solicitud queda completamente ingresada y lista para revisión administrativa.

---

## 🧩 HITO 4 – Revisión administrativa (usuario interno)

**Qué se construye en este hito**

- Login como usuario interno
- Bandeja de solicitudes
- Vista de detalle completo de la solicitud
- Revisión de documentos
- Revisión del comprobante de pago
- Cambio de estado de la solicitud
- Registro de observaciones
- Registro automático del historial de acciones

**Estados que se manejan en este hito**
- En revisión
- Observada
- Admitida

**Resultado esperado**
> El personal interno puede revisar solicitudes y gestionar su estado con trazabilidad.

---

## 🧩 HITO 5 – Subsanaciones y cierre del trámite

**Qué se construye en este hito**

- Visualización de observaciones por el usuario externo
- Subsanación mediante nuevos documentos
- Cambio de estado a **SUBSANADA**
- Nueva revisión por usuario interno
- Estados finales del expediente:
  - Admitida
  - Rechazada
  - Archivada
- Notificaciones básicas por cambio de estado

**Resultado esperado**
> El flujo completo del trámite funciona desde el registro hasta el cierre, con trazabilidad total.

---

## 🧩 HITO 6 - Adecuación de Mesa de Partes pública y nuevos trámites

**Qué se construye en este hito**

- Formulario público sin registro ni inicio de sesión para solicitantes
- Solo dos secciones principales: Arbitraje y JPRD
- Catálogo de trámites por sección
- Arbitraje de Emergencia como trámite de Arbitraje
- Campos condicionales para escritos y otros trámites
- Representante legal y cargo para persona jurídica
- Pago y facturación obligatorios solo en los trámites aplicables
- Consentimientos y CAPTCHA
- Código único, correo de recepción vía n8n e interfaz `/trazabilidad` por código
- Campo de enlace externo de Drive para documentos pesados
- Ruta administrativa no enlazada para login de admin
- Panel administrador para ver registros, cambiar estado y publicar observaciones de trazabilidad
- El rol interno queda fuera de la gestión del Hito 6
- Adecuación de base de datos, RLS, Storage y bandeja de administrador

**Reglas reemplazadas**

- El solicitante ya no necesita una cuenta para presentar
- El pago deja de ser obligatorio para todos los trámites
- Se elimina Datos del Demandado del formulario de Arbitraje

**Resultado esperado**

> Un visitante puede presentar un trámite público de forma segura, recibir su código de seguimiento y ser atendido desde el panel administrador.

El alcance detallado se encuentra en [Hito 6 - Adecuación de Mesa de Partes Pública](./hito_6_adecuacion_mesa_partes_publica.md).

---

## 📌 Nota final para el equipo

- Cada hito debe entregar una funcionalidad usable y verificable
- No se debe adelantar trabajo de hitos posteriores
- La base de datos, backend y frontend avanzan juntos por hito
- Si el proyecto se detiene en cualquier hito, el sistema sigue siendo coherente

Este documento debe usarse como **guía de implementación y control de alcance** del proyecto.
