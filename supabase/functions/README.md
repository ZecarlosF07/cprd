# Despliegue de Edge Functions - Hito 6

## Orden obligatorio

1. Ejecutar `supabase/manual_sql/hito_6_public_intake.sql`.
2. Ejecutar `supabase/manual_sql/hito_6_edge_functions_hardening.sql`.
3. Configurar los secretos indicados abajo.
4. Desplegar `public-intake`, `public-tracking` y `notification-worker`.
5. Desactivar la verificación JWT del gateway para las tres funciones. Los endpoints públicos aplican sus propios controles y el worker exige `x-worker-secret`.

Despliegue por CLI sin Docker:

```bash
supabase functions deploy public-intake --no-verify-jwt --use-api
supabase functions deploy public-tracking --no-verify-jwt --use-api
supabase functions deploy notification-worker --no-verify-jwt --use-api
```

## Secretos de Supabase

Obligatorios:

```text
N8N_RECEPCION_WEBHOOK_URL=https://...
PUBLIC_APP_URL=https://dominio-publico.example
TURNSTILE_SECRET_KEY=...
NOTIFICATION_WORKER_SECRET=valor-aleatorio-largo
```

Opcionales:

```text
N8N_WEBHOOK_SECRET=...
TURNSTILE_EXPECTED_HOSTNAME=dominio-publico.example
RATE_LIMIT_SALT=valor-aleatorio-largo
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` son proporcionados automáticamente por Supabase.

## Variable pública del frontend

Configurar en Vercel y volver a desplegar:

```text
VITE_TURNSTILE_SITE_KEY=...
```

## Reintentos del webhook

Programar una llamada `POST` a `notification-worker` cada minuto desde Supabase Cron o un monitor privado, enviando:

```text
x-worker-secret: <NOTIFICATION_WORKER_SECRET>
```

La cola conserva los fallos y reintenta hasta cinco veces con espera incremental. El header `Idempotency-Key` enviado a n8n contiene el UUID del evento de la cola.
