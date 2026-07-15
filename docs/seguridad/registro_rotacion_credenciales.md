# Registro de clasificación y rotación de credenciales

Este registro contiene únicamente metadatos. Está prohibido copiar aquí valores, fragmentos, URLs privadas de webhook o capturas que muestren secretos.

## Revisión del Hito 7

Se inspeccionaron los nombres de variables del `.env` retirado del índice y su historial accesible. Solo se identificaron variables `VITE_*`, que se incorporan al bundle del navegador y se clasifican como configuración pública:

| Proveedor | Identificador no sensible | Clasificación | Responsable | Fecha | Estado | Verificación |
|---|---|---|---|---|---|---|
| Supabase | `VITE_SUPABASE_URL` | Pública | Repositorio | 2026-07-15 | Revisada | Nombre presente; valor no registrado |
| Supabase | `VITE_SUPABASE_ANON_KEY` | Pública por diseño | Repositorio | 2026-07-15 | Revisada | Uso exclusivo como clave anónima del navegador |
| Aplicación | `VITE_ADMIN_LOGIN_PATH` | Pública | Repositorio | 2026-07-15 | Revisada | Ruta configurable, no credencial |
| Cloudflare | `VITE_TURNSTILE_SITE_KEY` | Pública por diseño | Repositorio | 2026-07-15 | Revisada | Site key del navegador, no secret key |

No se identificaron por nombre secretos de backend versionados en ese archivo o en su historial revisado. Por ello no se abre un bloqueo de rotación automática. Esta conclusión no sustituye la revisión de los paneles externos por el responsable de plataforma.

## Secretos exclusivos de plataforma

Los siguientes identificadores deben existir solo como secretos del entorno de Edge Functions: `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `N8N_RECEPCION_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, `NOTIFICATION_WORKER_SECRET` y `RATE_LIMIT_SALT`.

Si alguno se confirma expuesto, el despliegue y el cierre del hito quedan bloqueados hasta que el responsable de plataforma registre su revocación o rotación con este formato:

| Proveedor | Identificador no sensible | Clasificación | Responsable | Fecha | Estado | Verificación no sensible |
|---|---|---|---|---|---|---|
| `por definir` | `nombre de variable` | Secreto | `por definir` | `AAAA-MM-DD` | `pendiente/rotado/revocado` | `ticket o evento de auditoría` |
