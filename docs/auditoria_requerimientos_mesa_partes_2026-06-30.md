# Auditoria de requerimientos - Mesa de Partes Virtual

Fecha de revision: 2026-06-30

Fuente vigente: `MESA DE PARTES VIRTUAL.pdf` (9 paginas)

La version PDF actualizada reemplaza la interpretacion anterior del DOCX.

## 1. Resumen ejecutivo

El documento solicita transformar la mesa de partes externa en un formulario de acceso libre. El acceso autenticado no puede ser requisito para presentar una solicitud. Para el Hito 6, la gestión de registros, estados y observaciones queda limitada al rol administrador.

El cambio requiere modificar conjuntamente frontend, base de datos, RLS, storage y notificaciones. No es seguro resolverlo habilitando inserciones anonimas directas sobre las tablas actuales. La recepcion publica debe pasar por una funcion backend controlada, con CAPTCHA, validacion, limites de archivos y generacion del codigo unico del documento.

## 2. Requerimientos confirmados

### Acceso y secciones

- La mesa de partes externa debe tener acceso libre.
- Deben existir solo dos secciones principales: Arbitraje y JPRD.
- Se elimina Arbitraje de Emergencia como seccion principal.
- Solicitud de Arbitraje de Emergencia se conserva como tramite dentro de Arbitraje.

### Datos del solicitante

- Se conserva el formulario de datos del solicitante.
- Para Arbitraje se elimina el bloque Datos del Demandado.
- El correo del solicitante se usa para enviar la recepcion de la solicitud con su codigo unico.

### Tramites de Arbitraje

- Solicitud de Arbitraje Institucional.
- Solicitud de Arbitraje de Emergencia.
- Incorporacion a la nomina de Arbitros.
- Renovacion a la nomina de Arbitros.
- Solicitud de copia certificada.
- Ingresar escrito en expediente.
- Otro tramite.

Enlaces de referencia:

- Solicitud de Arbitraje Institucional y de Emergencia: https://docs.google.com/document/d/104YZbWusguV8uw-ftKlYCs9-_1li1DVW/edit
- Incorporacion y Renovacion: https://camaraica.org.pe/centro-de-arbitraje-2/procedimiento-de-incorporacion-arbitral/
- Copias certificadas: https://docs.google.com/document/d/1SEGNUH2TSFAcskidOwHMPb9aSzzC1ICD/edit
- Tarifario: https://camaraica.org.pe/centro-de-arbitraje-2/calculadora-de-costos/

### Tramites de JPRD

- Solicitud de JPRD.
- Incorporacion a la nomina de adjudicadores.
- Ingresar escrito en expediente.
- Otro tramite.

Enlaces de referencia:

- Solicitud de inicio: https://docs.google.com/document/d/1o9Z3W1OJ07BkqMbkLRIkUL9ce4lgFPyv/edit
- Anexo sector privado: https://docs.google.com/document/d/1vdfSL8vcY6euvdGOvcO4ql7TzJBIWroB/edit
- Anexo sector publico: https://docs.google.com/document/d/1MPXzxPIVK6gd1X7D4_Lnd_kkFbZt_cuy/edit
- Incorporacion de adjudicadores: https://camaraica.org.pe/jprd/procedimiento-de-incorporacion-adjudicadores/
- Tarifario: https://camaraica.org.pe/jprd/calculadora-de-costo-jprd/

### Campos condicionales

- Ingresar escrito en expediente: numero de expediente y sumilla, obligatorios.
- Otro tramite: sumilla o asunto, obligatorio.
- Los campos deben aparecer solo al seleccionar el tramite correspondiente.

### Documentos

- Permitir agregar varios documentos con tipo, archivo y comentario opcional.
- Permitir registrar un enlace externo de Drive cuando el archivo sea pesado o no convenga cargarlo al bucket.
- Mantener el bucket privado; no exponer archivos publicamente.
- La version actualizada no define cantidad minima, formatos ni tamano maximo.

### Acreditacion de pago

El comprobante es obligatorio solo para:

- Arbitraje Institucional.
- Arbitraje de Emergencia.
- Incorporacion a la nomina de Arbitros.
- Renovacion a la nomina de Arbitros.
- Solicitud de JPRD.
- Incorporacion a la nomina de adjudicadores.

El comprobante no es obligatorio para:

- Solicitud de copia certificada.
- Ingresar escrito en expediente, tanto en Arbitraje como en JPRD.
- Otro tramite, tanto en Arbitraje como en JPRD.

No mostrar un monto fijo. Mostrar el enlace al tarifario correspondiente.

Datos obligatorios de facturacion:

- Arbitraje: Boleta, Factura al contado o Factura al credito.
- JPRD: Boleta o Factura.
- Nombre o razon social.
- Numero de DNI o RUC.
- Direccion.

### Consentimiento y seguridad

- Aceptacion de notificaciones por correo electronico.
- Aceptacion del tratamiento de datos personales conforme a la Ley 29733.
- CAPTCHA antes del envio.

### Confirmacion

- Enviar un correo de recepcion al solicitante despues de registrar la solicitud y generar el codigo unico.
- Incluir nombre, codigo de seguimiento y enlace a `/trazabilidad`.
- Indicar que es un correo automatico de recepcion. No debe redactarse como conformidad, admision ni aprobacion del tramite.

## 3. Brechas del sistema actual

| Area | Estado actual | Cambio requerido |
| --- | --- | --- |
| Acceso externo | Requiere cuenta, sesion y perfil | Formulario publico sin registro ni inicio de sesion |
| Secciones | Arbitraje, Emergencia y JPRD | Solo Arbitraje y JPRD |
| Tramite | Solo existe `tipo_solicitud` | Agregar catalogo/campo de tramite |
| Partes | Arbitraje exige demandante y demandado | Conservar solo solicitante para Arbitraje |
| JPRD | Exige contratista y entidad | Confirmar si Datos de la Entidad se conserva |
| Solicitudes | `user_id` es obligatorio | Permitir recepcion publica sin propietario autenticado |
| Documentos | `created_by` exige usuario Auth | Registrar actor publico de forma segura |
| Pagos | Datos dummy, monto `0` y operacion `PENDIENTE` | Guardar facturacion y comprobante real |
| Storage | Limite de 20 MB y politicas `authenticated` | Mantener 20 MB y usar carga publica controlada |
| Consentimientos | No existen | Guardar aceptacion, fecha y evidencia minima |
| CAPTCHA | No existe | Integrar Turnstile u otro proveedor |
| Correo | No existe envio externo | Edge Function + webhook de n8n |
| Seguimiento | Detalle protegido por sesion | Consulta publica limitada por codigo |
| Codigo | ARB/AEM/JPR por anio | Confirmar si se conserva o cambia al formato del documento |

## 4. Cambios tecnicos recomendados

### Base de datos

- Reducir `tipo_solicitud` a Arbitraje y JPRD, manteniendo Emergencia como tramite.
- Crear `tipo_tramite` o un catalogo de tramites por seccion.
- Agregar a solicitudes: numero de expediente referido, sumilla/asunto y correo de seguimiento.
- Hacer nullable o reemplazar la dependencia de `solicitudes.user_id` para recepcion publica.
- Ajustar la restriccion de `partes.user_id` para solicitantes no autenticados.
- Agregar a comprobantes: tipo de comprobante, nombre/razon social, DNI/RUC y direccion.
- Agregar evidencia de consentimientos y fecha de aceptacion.
- La consulta por codigo solo debe devolver informacion publica minima; no debe exponer documentos, datos personales ni informacion interna.

### Seguridad y backend

- No conceder escritura general al rol `anon` sobre tablas o `storage.objects`.
- Crear una Edge Function publica para validar CAPTCHA y payload.
- Crear la solicitud y sus entidades relacionadas en una operacion transaccional.
- Emitir URLs firmadas o un mecanismo controlado para carga de archivos.
- Aplicar rate limiting, validacion MIME y el limite de archivo que se apruebe.
- Mantener acceso total autenticado solo para administrador en el alcance del Hito 6.

### Frontend

- Crear una ruta publica de nueva mesa de partes sin `ProtectedRoute`.
- Mantener acceso administrativo separado y no enlazado para administrador; `/login` no debe ser la entrada visible/predecible en producción. El rol interno queda fuera de la gestión del Hito 6.
- Sustituir el selector actual por dos secciones y un desplegable de tramites.
- Implementar campos condicionales por tramite.
- Ocultar pago en tramites donde no aplica.
- Mostrar enlaces de requisitos y tarifarios en una nueva pestana.
- Agregar consentimientos, CAPTCHA y pantalla final con codigo de seguimiento.

### Correo y trazabilidad

- Configurar webhook de n8n para el correo de recepcion.
- Invocar el webhook desde backend, nunca desde el navegador.
- Guardar estado, intentos, respuesta y errores del webhook.
- Crear la pagina publica `/trazabilidad` donde el solicitante ingrese el codigo y vea solo estado y mensajes autorizados.

## 5. Decisiones adoptadas para el Hito 6

Estas decisiones convierten los puntos ambiguos en un alcance implementable. Cualquier cambio posterior debe actualizar el hito y sus pruebas.

1. JPRD no solicitara Datos de la Entidad en el nuevo flujo publico.
2. El codigo usara `YYYY-NNNNNNN` y sera unico por documento recibido.
3. Las cuentas externas quedan solo para compatibilidad con expedientes anteriores.
4. Los tramites con pago exigiran archivo de sustento incluso para Factura al credito.
5. Ambos consentimientos seran obligatorios y versionados; falta recibir el texto legal final para aceptacion.
6. Se usara Cloudflare Turnstile y una integracion de correo de recepcion mediante webhook de n8n.
7. El seguimiento se consultara en `/trazabilidad` ingresando el codigo y mostrara codigo, seccion, tramite, fecha, estado y observaciones publicas.
8. Se exigira un sustento documental minimo: archivo o enlace externo de Drive; formatos PDF, DOC, DOCX, JPG, JPEG y PNG; maximo 20 MB por archivo cargado.
9. Persona juridica solicitara razon social, RUC, representante legal, cargo del representante, celular, correo y domicilio.
10. El rol administrador podra ver los registros realizados, cambiar estado y registrar observaciones; solo las observaciones publicas se mostraran en `/trazabilidad`. El rol interno queda fuera de esta gestion.
11. El login administrativo usara una ruta no enlazada y configurable por ambiente; esta ocultacion no reemplaza la autenticacion ni la validacion de rol.

## 6. Aclaraciones incorporadas por la version PDF

- Los indicadores `(si)` y `(no)` aclaran la aplicacion de la acreditacion de pago por tramite.
- Para copias certificadas, escritos en expediente y otros tramites no se exige comprobante ni datos de facturacion.
- La captura final se limita a consentimiento de notificaciones, tratamiento de datos y CAPTCHA.
- El PDF ya no muestra como requerimiento el enlace para archivos mayores de 30 MB, pero se incorpora un campo de enlace externo de Drive por decision funcional posterior.
- La eliminacion de Datos del Demandado en Arbitraje sigue siendo explicita.
- La permanencia o eliminacion de Datos de la Entidad en JPRD sigue sin indicarse expresamente.

## 7. Orden de implementacion sugerido

1. Verificar las decisiones funcionales adoptadas para el Hito 6.
2. Crear migracion complementaria para tramites, recepcion publica, facturacion y seguimiento.
3. Implementar Edge Function transaccional con CAPTCHA.
4. Implementar carga privada de documentos y limites.
5. Rehacer el formulario publico de Arbitraje/JPRD.
6. Implementar webhook de n8n para correo de recepcion y trazabilidad publica.
7. Ajustar el panel administrador para los nuevos tramites y datos.
8. Implementar permisos de administrador para listar registros, cambiar estados y publicar observaciones en trazabilidad.
9. Ejecutar pruebas de seguridad, RLS, archivos, correo y flujos por cada tramite.
