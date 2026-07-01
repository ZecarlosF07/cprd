# HITO 6 - Adecuación de Mesa de Partes Pública y Nuevos Trámites

## Objetivo del hito

Adecuar el MVP existente a los nuevos requerimientos institucionales, permitiendo que cualquier solicitante presente un trámite de Arbitraje o JPRD sin crear una cuenta, con documentos o enlace externo, pago condicional, consentimientos, CAPTCHA, código único de documento, correo de recepción y trazabilidad pública limitada por código.

El acceso autenticado de gestión para este hito queda limitado al rol `administrador`. Los usuarios internos quedan fuera del alcance operativo del Hito 6. La recepción pública no debe debilitar las políticas RLS ni otorgar escritura anónima directa sobre las tablas o el bucket de Supabase.

Este alcance se basa en la versión PDF actualizada y en la [auditoría de requerimientos](./auditoria_requerimientos_mesa_partes_2026-06-30.md).

---

## Reglas anteriores que este hito reemplaza

Este hito prevalece sobre los siguientes supuestos de los hitos 1 al 5:

- Ya no es obligatorio registrarse o iniciar sesión para presentar una solicitud.
- Las secciones principales dejan de ser Arbitraje, Arbitraje de Emergencia y JPRD; serán únicamente Arbitraje y JPRD.
- Arbitraje de Emergencia se conserva como trámite dentro de Arbitraje.
- Para Arbitraje se elimina el formulario Datos del Demandado.
- El comprobante de pago deja de ser obligatorio para todos los trámites y pasa a depender del trámite seleccionado.
- La recepción debe enviarse al correo declarado por el solicitante mediante webhook de n8n. No es correo de conformidad ni aprobación del trámite.
- El seguimiento público debe realizarse desde una interfaz separada donde el solicitante ingresa el código único del documento, sin exponer el expediente completo.

Los flujos administrativos de revisión, observación y cierre quedan a cargo del rol `administrador` para las solicitudes públicas de este hito.

---

## Decisiones de implementación adoptadas

Para que el hito sea implementable sin decisiones funcionales abiertas, se adoptan estos valores iniciales. Deben modelarse como constantes o catálogo cuando puedan cambiar sin alterar la seguridad:

1. JPRD solicitará únicamente Datos del Solicitante; se elimina Datos de la Entidad del nuevo flujo público porque la versión actualizada pasa directamente de solicitante a datos del documento.
2. El código público tendrá formato `YYYY-NNNNNNN`, por ejemplo `2026-0080598`, y será único por documento recibido.
3. Las cuentas externas existentes se conservan solo para compatibilidad con expedientes previos. Las nuevas presentaciones públicas no requieren cuenta, registro ni inicio de sesión.
4. En los trámites con pago, el archivo de acreditación seguirá siendo obligatorio para Boleta, Factura al contado y Factura al crédito. La opción de facturación no elimina la obligación de adjuntar sustento.
5. Los dos consentimientos serán obligatorios y versionados. El texto definitivo deberá ser entregado por la institución antes de la prueba de aceptación.
6. Se utilizará Cloudflare Turnstile, consistente con la referencia visual. El envío del correo de recepción se realizará llamando un webhook de n8n desde backend; la URL del webhook se configurará como secreto y nunca llegará al navegador.
7. La trazabilidad pública se consultará en `/trazabilidad` ingresando el código y mostrará únicamente código, sección, trámite, fecha de ingreso, estado y observaciones públicas cuando existan.
8. Se exigirá al menos un sustento documental: archivo cargado o enlace externo de Drive. Los archivos cargados aceptarán PDF, DOC, DOCX, JPG, JPEG y PNG, con máximo de 20 MB por archivo, alineado al bucket actual. El enlace de Drive se usará cuando el documento sea más pesado o no convenga cargarlo al bucket.
9. Persona jurídica utilizará razón social, RUC, representante legal, cargo del representante, celular, correo y domicilio. Representante legal y cargo serán obligatorios para mejorar la revisión administrativa.
10. Solo el rol `administrador` podrá ver los registros públicos finalizados, cambiar estado y registrar observaciones para trazabilidad. El rol `interno` no participa en la gestión del Hito 6.
11. El login administrativo no usará `/login` como ruta pública predecible. Se usará una ruta no enlazada y configurable por ambiente, por ejemplo `VITE_ADMIN_LOGIN_PATH`, manteniendo Supabase Auth y validación de rol como seguridad real. Esta ruta no es un secreto porque el frontend puede exponerla en el bundle; solo reduce exposición y evita enlaces visibles.

Cambiar cualquiera de estas decisiones requiere actualizar este hito, la auditoría de requerimientos y la matriz de pruebas antes de modificar código.

---

## Estado real del repositorio al iniciar

- `/` redirige a `/login` y `/solicitudes/nueva` exige perfil externo autenticado.
- `NewSolicitudPage.tsx` concentra el flujo actual y supera el límite de tamaño definido en `.agent`; no debe ampliarse.
- `InternalDashboardPage.tsx` y `AdminDashboardPage.tsx` son vistas estáticas sin consultas ni acciones reales.
- No existen páginas de revisión interna, servicios de cambio de estado ni envío externo de correos.
- No existe infraestructura de Edge Functions ni pruebas unitarias/E2E configuradas.
- El esquema exige `auth.users` en solicitud, solicitante, documentos, comprobantes e historial.
- Las políticas RLS y Storage solo contemplan usuarios autenticados.
- El bucket privado `solicitudes` ya existe con límite de 20 MB y tipos MIME compatibles.

Por lo tanto, el hito incluye el mínimo operativo de administración para listar, revisar, observar y gestionar solicitudes públicas. No debe darse por implementado solo con el formulario externo.

---

## Alcance funcional

### Secciones principales

- Arbitraje.
- JPRD.

No debe mostrarse Arbitraje de Emergencia como sección independiente.

### Trámites de Arbitraje

- Solicitud de Arbitraje Institucional.
- Solicitud de Arbitraje de Emergencia.
- Incorporación a la nómina de Árbitros.
- Renovación a la nómina de Árbitros.
- Solicitud de copia certificada.
- Ingresar escrito en expediente.
- Otro trámite.

### Trámites de JPRD

- Solicitud de JPRD.
- Incorporación a la nómina de adjudicadores.
- Ingresar escrito en expediente.
- Otro trámite.

### Campos condicionales

- Ingresar escrito en expediente debe solicitar número de expediente y sumilla.
- Otro trámite debe solicitar sumilla o asunto.
- Los campos deben mostrarse y validarse únicamente cuando corresponda al trámite seleccionado.

### Reglas de pago

El comprobante y los datos de facturación son obligatorios para:

- Solicitud de Arbitraje Institucional.
- Solicitud de Arbitraje de Emergencia.
- Incorporación a la nómina de Árbitros.
- Renovación a la nómina de Árbitros.
- Solicitud de JPRD.
- Incorporación a la nómina de adjudicadores.

No son obligatorios para:

- Solicitud de copia certificada.
- Ingresar escrito en expediente.
- Otro trámite.

No se debe mostrar un monto fijo. Se debe mostrar el enlace al tarifario correspondiente.

### Datos de facturación

- Arbitraje: Boleta, Factura al contado o Factura al crédito.
- JPRD: Boleta o Factura.
- Nombre o razón social.
- Número de DNI o RUC.
- Dirección.

### Documentos

- Permitir agregar varios documentos.
- Cada documento debe registrar tipo, archivo o enlace externo de Drive, y comentario opcional.
- Los documentos no se reemplazan.
- El bucket debe permanecer privado.
- Exigir al menos un archivo o enlace externo.
- Validar PDF, DOC, DOCX, JPG, JPEG y PNG, con máximo de 20 MB por archivo cargado.
- Validar que los enlaces externos sean URL HTTPS y queden asociados al documento sin convertirlos en archivos públicos.

### Consentimientos y CAPTCHA

- Incorporar aceptación de notificaciones por correo.
- Incorporar aceptación del tratamiento de datos personales.
- Validar CAPTCHA en backend antes de crear o finalizar una solicitud.
- Registrar fecha, versión del texto legal y evidencia mínima de aceptación.

### Recepción y seguimiento

- Generar un código de seguimiento único al finalizar el registro.
- Mostrar una pantalla de confirmación con el código.
- Enviar correo de recepción, no de conformidad, con nombre del solicitante, código, trámite y enlace a `/trazabilidad`.
- Enviar la solicitud de correo mediante webhook de n8n desde backend.
- Registrar estado, intentos, respuesta y error del webhook de n8n.
- La consulta pública no debe revelar documentos, datos personales ni información interna.

### Seguimiento público

- La interfaz pública `/trazabilidad` debe solicitar el código único del documento.
- El resultado solo puede mostrar información pública mínima: código, sección, trámite, fecha de ingreso, estado y observaciones públicas.
- El código no permite adjuntar documentos, cambiar estados, editar datos originales ni acceder a archivos.
- No habrá subsanación pública en este hito.

### Gestión administrativa

- El rol `administrador` puede ver todos los registros finalizados de Mesa de Partes.
- El rol `administrador` puede abrir el detalle administrativo completo, revisar documentos, revisar pagos, cambiar estado y registrar observaciones.
- Cada observación administrativa debe marcarse como `publica` o `interna`.
- Solo las observaciones marcadas como `publica` aparecen en `/trazabilidad`.
- Todo cambio de estado y toda observación del administrador debe quedar en historial con fecha, usuario y visibilidad.

---

## Tareas del hito

### Frontend

- Cambiar `/` para redirigir a `/mesa-de-partes`.
- Crear `/mesa-de-partes` sin `ProtectedRoute` para el formulario público.
- Crear `/trazabilidad` sin `ProtectedRoute`, con un formulario para ingresar el código único del documento.
- Mantener `/admin` como ruta autenticada de gestión del Hito 6.
- Reemplazar `/login` como entrada visible por una ruta administrativa no enlazada y configurable por ambiente, por ejemplo `VITE_ADMIN_LOGIN_PATH`.
- Hacer que `/login`, `/registro`, `/dashboard`, `/solicitudes/nueva` y otras rutas externas heredadas no sean accesos visibles del nuevo flujo público; redirigirlas según corresponda a `/mesa-de-partes` o a una pantalla no encontrada.
- Dejar `/interno` solo como compatibilidad del MVP anterior, sin nuevas funciones de gestión para este hito.
- Conservar componentes y servicios externos heredados únicamente como referencia o compatibilidad técnica, pero no como navegación visible del Hito 6.
- Crear el feature `src/features/mesa-partes-publica/` con carpetas `pages`, `components`, `schemas`, `types` y `utils`.
- Dividir el flujo en componentes pequeños:
  - Selector de sección.
  - Selector de trámite y enlaces de requisitos.
  - Datos del solicitante.
  - Campos condicionales del trámite.
  - Lista de documentos.
  - Pago y facturación condicional.
  - Consentimientos y CAPTCHA.
  - Confirmación de envío.
- Crear esquemas Zod separados para datos comunes, Arbitraje, JPRD, documentos y pago.
- Extraer tipos e interfaces a archivos dedicados.
- Mostrar enlaces de requisitos y tarifarios en una pestaña nueva.
- Crear página pública `/trazabilidad` para consulta por código.
- Adaptar la bandeja y el detalle de administrador para mostrar sección, trámite, facturación y origen público.
- Adaptar el panel administrador para listar registros finalizados, filtrar por estado/sección/trámite/fecha, cambiar estado y registrar observaciones públicas o internas.
- Reemplazar los datos estáticos de `AdminDashboardPage.tsx` por consultas reales con filtros de estado, sección, trámite y fecha.
- Crear una vista administrativa de revisión con documentos, pago, historial, observaciones públicas/internas y cambios de estado permitidos.
- Implementar revisión del comprobante y registro de observaciones públicas o internas.
- Mantener diseño minimalista y reutilizar los componentes UI existentes.
- Mantener cada componente por debajo de 120 líneas y extraer lógica de negocio a funciones puras o servicios.
- Usar únicamente Tailwind para estilos nuevos; no crear CSS específico del feature.
- Evitar `any`, mantener tipos separados y no duplicar reglas entre frontend y backend.

### Servicios y backend

- Crear `supabase/functions/public-intake/` para iniciar y finalizar presentaciones públicas.
- Crear `supabase/functions/public-tracking/` para consulta limitada mediante código.
- Crear `supabase/functions/notification-worker/` para invocar y reintentar webhooks pendientes de n8n.
- Validar CAPTCHA, payload, trámite, obligatoriedad de pago y consentimientos en backend.
- Implementar idempotencia para evitar solicitudes duplicadas por reintentos.
- Usar un UUID generado por el cliente como `idempotency_key`, único por operación y conservado durante 24 horas.
- Limitar `start` a 5 intentos por hora por hash de IP y correo; limitar seguimiento a 30 intentos cada 5 minutos por hash de IP.
- Implementar un flujo de dos fases porque PostgreSQL y Storage no comparten una transacción:
  1. `start`: valida CAPTCHA y datos, crea borrador y sesión de carga, y devuelve URLs firmadas de subida.
  2. `finalize`: verifica archivos, pago y consentimientos; en una transacción PostgreSQL genera código, cambia a `recibida`, registra historial y crea el evento de webhook para correo de recepción.
- Las sesiones de carga y borradores expirarán en 24 horas; las URLs firmadas expirarán en 15 minutos.
- Limpiar diariamente borradores vencidos y archivos huérfanos mediante tarea programada; conservar métricas y errores de limpieza.
- Generar el código único en backend.
- Crear función de consulta pública por código que devuelva únicamente datos autorizados.
- Integrar el webhook de n8n desde backend; la URL y cualquier secreto de autenticación no deben llegar al navegador.
- Enviar a n8n solo la información necesaria para el correo de recepción.
- Registrar errores sin incluir documentos ni datos personales sensibles en logs.
- Crear `src/services/public-intake.service.ts` y `src/services/public-tracking.service.ts` como únicas capas del frontend que conocen estos endpoints.
- Crear `src/services/admin-solicitudes.service.ts` para listar solicitudes, obtener detalle, revisar pago, registrar observación y cambiar estado; no llamar Supabase directamente desde páginas.

### Base de datos

- Crear el script complementario manual `supabase/manual_sql/hito_6_public_intake.sql`.
- Mantener `tipo_solicitud` como sección principal y agregar un campo o catálogo de trámites.
- Conservar `arbitraje_emergencia` únicamente para registros históricos y rechazarlo en el nuevo flujo público como sección principal.
- Agregar estado técnico `borrador`; la bandeja de administrador y la trazabilidad deben excluirlo.
- Hacer nullable `solicitudes.user_id` y agregar `origen` (`publico` o `autenticado`).
- Permitir `codigo_expediente` nulo solo mientras el estado sea `borrador`; exigirlo para cualquier estado operativo.
- Ajustar la restricción de `partes.user_id` para permitir solicitantes públicos sin usuario Auth.
- Hacer nullable `created_by`/`user_id` donde el actor pueda ser público y agregar `actor_tipo` para conservar trazabilidad.
- Agregar número de expediente referido, sumilla/asunto, correo de seguimiento, representante legal y cargo del representante cuando el solicitante sea persona jurídica.
- Agregar campos de facturación al comprobante de pago.
- Crear catálogo `tramites` con sección, código, nombre, enlaces, `requiere_pago`, campos condicionales y estado activo.
- Ampliar tipos documentales para el flujo público con `solicitud_principal`, `anexo`, `documento_identidad`, `poder` y `otro`, conservando valores históricos.
- Permitir documentos con archivo cargado o enlace externo; agregar campos como `enlace_externo_url`, `enlace_externo_tipo` y `archivo_obligatorio` según corresponda.
- Crear almacenamiento de consentimientos con tipo, versión, fecha y solicitud.
- Crear sesión de carga pública con expiración e idempotency key.
- Crear `webhook_outbox` o `email_outbox` con clave única por solicitud, tipo de evento `recepcion_solicitud`, estado, intentos, respuesta y último error.
- Agregar `visibilidad` (`publica` o `interna`) a observaciones/historial; el seguimiento solo puede devolver registros públicos.
- Validar por RLS y funciones backend que el rol `administrador` pueda consultar todos los registros finalizados y ejecutar cambios de estado/observaciones.
- Reintentar el webhook de n8n hasta 5 veces con espera incremental; después marcarlo como `fallido` para revisión administrativa.
- Ajustar índices, constraints, triggers y funciones de código.
- Cambiar la generación de código para ejecutarse al finalizar el borrador, no al insertarlo.
- Generar el correlativo anual dentro de una función PostgreSQL con bloqueo seguro para concurrencia.
- Actualizar RLS para administrador sin conceder acceso directo al rol `anon`.
- Mantener políticas privadas sobre `storage.objects`.
- Mantener el script dentro de `BEGIN/COMMIT`, agregar consultas de validación y documentar rollback. No volver a ejecutar `initial_schema.sql`.

### Correo de recepción y configuración

- Configurar `N8N_RECEPCION_WEBHOOK_URL` como secreto de Supabase, no en variables `VITE_*`.
- Si el webhook requiere seguridad adicional, configurar también `N8N_WEBHOOK_SECRET` para enviarlo como header desde backend.
- La plantilla y el envío del correo se gestionarán en n8n.
- El correo debe llamarse y redactarse como recepción de solicitud, no como conformidad, admisión ni aprobación del trámite.
- No crear correo de observación, cambio de estado o conformidad en este hito salvo decisión posterior.
- Configurar URL pública de trazabilidad según ambiente.
- Configurar claves pública y privada del CAPTCHA en Vercel y Supabase según corresponda.
- Variables públicas de Vercel: `VITE_TURNSTILE_SITE_KEY`, `VITE_PUBLIC_APP_URL` y `VITE_ADMIN_LOGIN_PATH`. Ninguna variable `VITE_*` debe tratarse como secreto.
- Secretos de Supabase: `TURNSTILE_SECRET_KEY`, `N8N_RECEPCION_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET` si aplica, y `PUBLIC_APP_URL`.

### Payload para n8n

El backend enviará a n8n un JSON versionado y estable. No se enviarán archivos ni enlaces privados del bucket.

```json
{
  "event_type": "recepcion_solicitud",
  "version": 1,
  "codigo": "2026-0080598",
  "fecha_recepcion": "2026-07-01T15:30:00-05:00",
  "trazabilidad_url": "https://app.example.com/trazabilidad",
  "solicitante": {
    "tipo_persona": "natural",
    "nombres_apellidos": "Nombre del solicitante",
    "razon_social": null,
    "representante_legal": null,
    "cargo_representante": null,
    "correo": "solicitante@example.com",
    "tipo_documento": "DNI",
    "numero_documento": "00000000"
  },
  "solicitud": {
    "seccion": "arbitraje",
    "tramite_codigo": "arbitraje_institucional",
    "tramite_nombre": "Solicitud de Arbitraje Institucional",
    "numero_expediente_referido": null,
    "sumilla": null,
    "asunto": null,
    "requiere_pago": true
  },
  "documentos": {
    "cantidad_archivos": 2,
    "cantidad_enlaces_externos": 1
  }
}
```

Campos obligatorios para n8n: `event_type`, `version`, `codigo`, `fecha_recepcion`, `trazabilidad_url`, `solicitante.correo`, `solicitud.seccion`, `solicitud.tramite_nombre`. Para persona jurídica también serán obligatorios `solicitante.razon_social`, `solicitante.representante_legal`, `solicitante.cargo_representante` y `solicitante.numero_documento` como RUC.

### Documentación

- Actualizar análisis funcional y técnico con la recepción pública.
- Actualizar diagramas de navegación, flujo y entidad-relación.
- Actualizar el resumen de hitos y reglas de pago.
- Documentar variables de entorno y secretos requeridos.
- Documentar procedimiento de despliegue y rollback.
- Registrar las decisiones adoptadas en la auditoría de requerimientos.

---

## Flujo esperado

1. El visitante abre la Mesa de Partes sin iniciar sesión.
2. Selecciona Arbitraje o JPRD.
3. Selecciona el trámite y consulta sus requisitos.
4. Completa sus datos y los campos condicionales.
5. Selecciona documentos y, cuando corresponda, comprobante y facturación.
6. Acepta los consentimientos y completa el CAPTCHA.
7. `public-intake/start` valida los datos y crea un borrador con sesión de carga temporal.
8. El navegador sube los archivos mediante URLs firmadas al bucket privado.
9. `public-intake/finalize` verifica la carga y finaliza la solicitud de forma idempotente.
10. El sistema genera código único, historial inicial y evento de webhook para correo de recepción.
11. El solicitante ve la confirmación y recibe el correo.
12. El administrador ve únicamente solicitudes finalizadas en su bandeja.

### Flujo de seguimiento

1. El solicitante abre la interfaz pública de seguimiento.
2. Ingresa el código único del documento en `/trazabilidad`.
3. El backend valida formato, rate limit y existencia del código.
4. El sistema muestra solo el estado público y observaciones públicas, sin documentos ni datos personales.
5. Si la solicitud está observada, la pantalla solo informa la observación; no permite subsanar ni adjuntar archivos.

### Flujo administrador

1. El administrador abre la ruta administrativa no enlazada configurada en `VITE_ADMIN_LOGIN_PATH`.
2. Inicia sesión con Supabase Auth.
3. Si su perfil tiene rol `administrador`, entra a `/admin`.
4. Consulta la bandeja de registros finalizados de Mesa de Partes.
5. Abre el detalle completo de una solicitud.
6. Revisa documentos, pago, datos del trámite e historial.
7. Cambia el estado cuando corresponda.
8. Registra una observación y define si será `publica` o `interna`.
9. Si la observación es `publica`, aparece en `/trazabilidad` al consultar el código.

---

## Requerimientos técnicos y de seguridad

- No usar la `service_role` en frontend.
- No otorgar `INSERT`, `UPDATE` o `SELECT` general al rol `anon` sobre tablas sensibles.
- Validar en backend todas las reglas que también se validan en frontend.
- La ruta administrativa no enlazada es una medida de exposición, no un control de seguridad suficiente; todo acceso administrativo debe validar sesión y rol `administrador`.
- El seguimiento por código solo puede devolver información pública mínima y debe tener rate limiting.
- No devolver datos personales, archivos, enlaces privados ni información interna desde la consulta por código.
- Mantener archivos privados y entregar acceso solo mediante backend o URL firmada de corta duración.
- Validar extensión, MIME y tamaño real del archivo.
- La sesión de carga y las URLs firmadas deben expirar y quedar ligadas a un único borrador.
- Evitar que una solicitud incompleta aparezca como recibida en la bandeja de administrador.
- Registrar historial inicial únicamente después de finalizar correctamente la solicitud.
- El fallo del webhook/correo no debe duplicar ni eliminar una solicitud ya registrada.
- El webhook debe enviarse desde `webhook_outbox` o `email_outbox` con clave idempotente y reintentos limitados.
- Proteger el endpoint público contra automatización, reintentos y abuso.
- La `service_role` solo puede existir como secreto de las Edge Functions.

---

## Estructura de archivos objetivo

```text
src/
├── components/layout/
│   └── PublicLayout.tsx
├── features/mesa-partes-publica/
│   ├── components/
│   ├── pages/
│   ├── schemas/
│   ├── types/
│   └── utils/
├── features/admin/
│   ├── components/
│   └── pages/
│       └── AdminSolicitudReviewPage.tsx
├── services/
│   ├── admin-solicitudes.service.ts
│   ├── public-intake.service.ts
│   └── public-tracking.service.ts
└── utils/
    └── public-routes.utils.ts

supabase/
├── functions/
│   ├── public-intake/
│   ├── public-tracking/
│   └── notification-worker/
└── manual_sql/
    └── hito_6_public_intake.sql
```

No se debe ampliar `NewSolicitudPage.tsx`; el nuevo flujo público se implementa en el feature nuevo y el flujo autenticado queda como compatibilidad temporal.

Actualizar `src/utils/constants.ts` con `PUBLIC_INTAKE: '/mesa-de-partes'`, `PUBLIC_TRACKING: '/trazabilidad'` y `ADMIN_LOGIN` leído desde `VITE_ADMIN_LOGIN_PATH`. Los componentes de páginas solo coordinan estado y composición; las llamadas a Supabase/Edge Functions permanecen en `src/services`.

---

## Secuencia de implementación

1. Actualizar auditoría, contratos TypeScript y catálogo de trámites.
2. Crear y revisar `hito_6_public_intake.sql` sin ejecutarlo todavía.
3. Implementar funciones puras de reglas de trámite y sus pruebas unitarias.
4. Implementar Edge Functions y pruebas de autorización/idempotencia.
5. Ejecutar el SQL manual una sola vez en Supabase y validar objetos/RLS.
6. Configurar secretos de Supabase, CORS permitido y variables de Vercel.
7. Desplegar Edge Functions con Supabase CLI previa aprobación; las funciones públicas deben usar `verify_jwt = false`, validar Turnstile en el registro y aplicar rate limiting en el seguimiento.
8. Implementar servicios frontend y el feature público.
9. Adaptar bandeja, detalle y observaciones del administrador.
10. Implementar webhook de n8n para correo de recepción y trazabilidad pública.
11. Ejecutar pruebas integrales en un ambiente no productivo, desplegar y verificar producción.

Rollback: ocultar las rutas públicas mediante configuración, desactivar Edge Functions y conservar las columnas/tablas nuevas. No eliminar datos ni revertir el esquema con operaciones destructivas en producción.

---

## Validación y casos de prueba

### Matriz funcional mínima

- Los siete trámites de Arbitraje.
- Los cuatro trámites de JPRD.
- Persona natural y persona jurídica.
- Un documento mínimo y múltiples documentos.
- Rechazo de archivos fuera de los formatos permitidos o mayores de 20 MB.
- Pago obligatorio en los seis trámites aplicables.
- Ausencia de pago en copias, escritos y otros trámites.
- Boleta, Factura al contado, Factura al crédito y Factura JPRD.
- Campos de expediente y sumilla para escritos.
- Campo de asunto para otros trámites.
- Enlaces de requisitos y tarifarios.
- Enlace externo de Drive como alternativa al archivo cargado.

### Seguridad

- Un visitante no puede consultar tablas ni archivos directamente.
- CAPTCHA inválido o ausente bloquea el registro.
- Un código inexistente o mal formado no revela datos sensibles.
- El código visible solo permite acceder al estado público mínimo.
- Archivos con MIME, extensión o tamaño inválidos son rechazados.
- Repetir la misma operación idempotente no crea duplicados.
- El administrador conserva acceso a todas las solicitudes finalizadas.
- La ruta `/login` no muestra el formulario de acceso administrativo en producción.
- La ruta administrativa no aparece enlazada desde la interfaz pública.
- Un borrador no aparece en la bandeja ni en el seguimiento.
- Una sesión o URL de carga vencida no permite subir archivos.

### Seguimiento y observaciones

- La observación pública se muestra y la interna permanece oculta.
- Una observación pública creada por admin aparece en `/trazabilidad`.
- La pantalla de seguimiento no permite adjuntar documentos.
- La pantalla de seguimiento no permite editar datos ni cambiar estados.
- Una observación interna nunca aparece en la consulta pública.
- Un cambio de estado hecho por admin se refleja en `/trazabilidad`.

### Integraciones

- El webhook de n8n se invoca una sola vez por solicitud finalizada.
- El correo de recepción incluye el enlace a `/trazabilidad`.
- Los fallos del webhook/correo quedan registrados y pueden reintentarse.
- Los secretos no aparecen en el bundle de Vite ni en logs del navegador.

### Calidad

- Agregar Vitest para reglas, esquemas y utilidades del nuevo feature.
- Agregar Playwright para los flujos públicos críticos en escritorio y móvil.
- Agregar scripts `test`, `test:run` y `test:e2e` a `package.json`.
- Ejecutar `yarn tsc --noEmit`.
- Ejecutar `yarn lint`.
- Ejecutar `yarn build`.
- Probar el flujo en escritorio y móvil.
- Verificar RLS, funciones, bucket y políticas en Supabase.

---

## Definition of Done (DoD)

Este hito se considera completado cuando:

- Un visitante puede registrar cualquiera de los trámites definidos sin crear una cuenta.
- Solo se muestran Arbitraje y JPRD como secciones principales.
- Arbitraje de Emergencia funciona como trámite dentro de Arbitraje.
- El formulario de Arbitraje no solicita Datos del Demandado.
- Los campos condicionales aparecen y se validan correctamente.
- El comprobante y la facturación son obligatorios únicamente donde corresponde.
- Los consentimientos y CAPTCHA se validan en backend.
- Los documentos quedan privados y asociados correctamente.
- Se genera un código único de seguimiento.
- Se muestra la confirmación y se dispara el webhook de n8n para el correo institucional de recepción.
- La trazabilidad pública expone únicamente información autorizada.
- Una solicitud observada no puede subsanarse desde la interfaz pública.
- La solicitud aparece correctamente en la bandeja de administrador.
- El administrador puede iniciar sesión desde la ruta administrativa no enlazada y acceder a `/admin` solo si su rol es `administrador`.
- El administrador puede ver los registros realizados, cambiar estado y crear observaciones visibles en trazabilidad cuando las marque como públicas.
- Los borradores y cargas vencidas se limpian o quedan identificados para limpieza segura.
- RLS impide acceso anónimo directo a tablas y archivos.
- El script SQL complementario incluye validación y rollback documentado.
- Las Edge Functions y variables de entorno están documentadas y desplegadas.
- Todos los casos de la matriz funcional y de seguridad están aprobados.
- Las pruebas unitarias y E2E del nuevo flujo finalizan sin errores.
- TypeScript, ESLint y build finalizan sin errores.
- La documentación técnica y funcional queda actualizada.

---

## Fuera de alcance

- Validación automática bancaria.
- Firma digital.
- Validación legal automática de documentos.
- Cálculo de plazos legales.
- Gestión de audiencias o resoluciones.
- Acceso público al contenido completo del expediente.
- Automatización de facturación electrónica.

---

## Resultado esperado

La institución dispone de una Mesa de Partes pública, segura y alineada con los nuevos trámites. El solicitante registra su documentación sin cuenta, recibe un código de seguimiento y puede consultar un estado limitado, mientras el administrador conserva el control administrativo, documental y de trazabilidad del expediente.
