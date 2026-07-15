# Mesa de Partes Virtual CPRD

Aplicación web para recibir solicitudes públicas de arbitraje y JPRD, consultar su trazabilidad y gestionar expedientes mediante perfiles externos, internos y administradores.

## Arquitectura

- React 19, TypeScript y Vite para la aplicación web.
- Tailwind CSS para la interfaz.
- Supabase Auth, Postgres, Storage y Edge Functions para autenticación, datos, archivos e ingreso público.
- `public-intake` valida CAPTCHA, archivos, idempotencia y rate limit antes de registrar una solicitud.
- n8n recibe notificaciones mediante una cola de salida con reintentos.

Los contratos funcionales se describen en [Hito 6](docs/hito_6_adecuacion_mesa_partes_publica.md) y las puertas de calidad en [Hito 7](docs/hito_7_saneamiento_tecnico_calidad_y_seguridad.md). Las reglas de implementación están en [.agent/rules/rules.md](.agent/rules/rules.md).

## Requisitos e instalación

- Node.js 22.
- Yarn 1.x.

```bash
yarn install --frozen-lockfile
cp .env.example .env
yarn dev
```

La aplicación local queda disponible en la URL mostrada por Vite. `.env` es local y nunca debe versionarse.

## Variables del frontend

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_LOGIN_PATH=/acceso-cprd
VITE_TURNSTILE_SITE_KEY=
```

Todas las variables `VITE_*` son públicas porque se incluyen en el navegador. Los secretos `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `N8N_WEBHOOK_SECRET`, `NOTIFICATION_WORKER_SECRET` y similares pertenecen exclusivamente al entorno de las Edge Functions; nunca deben agregarse al frontend ni al repositorio.

## Rutas principales

- `/mesa-de-partes`: ingreso público sin autenticación.
- `/trazabilidad`: consulta pública por código con estado actual y línea de tiempo de eventos públicos.
- `/login` y `/registro`: redirigen al ingreso público.
- Ruta indicada por `VITE_ADMIN_LOGIN_PATH`: autenticación administrativa.
- `/dashboard`, `/interno` y `/admin`: áreas protegidas por perfil y rol.

## Comandos de calidad

```bash
yarn check:env       # impide versionar archivos de entorno
yarn typecheck       # aplicación y Edge Functions
yarn lint            # aplicación, scripts y Edge Functions
yarn check:size      # máximo 120 líneas no vacías por TSX
yarn test:run        # pruebas unitarias
yarn test:coverage   # cobertura con umbrales obligatorios
yarn test:e2e        # Chromium desktop y móvil, servicios simulados
yarn build           # build de producción
```

Playwright levanta Vite en `http://127.0.0.1:4173` con configuración ficticia e intercepta servicios externos. No requiere credenciales productivas.

## Supabase y SQL

Los cambios de base de datos se versionan en `supabase/manual_sql/` y se ejecutan manualmente desde SQL Editor; este repositorio no autoriza su ejecución automática. El orden, la evidencia por ambiente y la separación de scripts legacy están definidos en [Operación de base de datos](docs/operacion_base_datos.md).

Las Edge Functions se encuentran en `supabase/functions/`. Su configuración y orden de despliegue están descritos en [su README](supabase/functions/README.md). Un despliegue o una ejecución SQL en producción requiere aprobación explícita.

## Integración continua

`.github/workflows/quality.yml` ejecuta las validaciones, cobertura, build y E2E en cada pull request o push hacia `main`. El workflow no utiliza secretos de producción y publica reportes de cobertura y diagnósticos de Playwright.
