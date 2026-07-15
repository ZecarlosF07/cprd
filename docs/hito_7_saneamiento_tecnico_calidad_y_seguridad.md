# HITO 7 - Saneamiento Técnico, Calidad y Seguridad del Repositorio

## Objetivo del hito

Corregir las observaciones técnicas detectadas durante la revisión inicial del repositorio y establecer una base verificable de calidad para continuar con la auditoría funcional y de seguridad del Hito 6.

Este hito no modifica las reglas de negocio vigentes de la Mesa de Partes Pública. Su propósito es eliminar deuda técnica observable, recuperar las validaciones automáticas del proyecto, proteger la configuración sensible y documentar de forma suficiente la operación del repositorio.

La fuente funcional vigente continúa siendo el [Hito 6](./hito_6_adecuacion_mesa_partes_publica.md).

---

## Observaciones que originan el hito

1. `yarn tsc --noEmit` falla por una importación no utilizada de `RegisterPage` y porque el estado `borrador` no está contemplado en `estado.utils.ts`.
2. `yarn lint` finaliza correctamente, pero la configuración actual solo analiza archivos JavaScript y JSX; los archivos TypeScript y TSX quedan fuera de la revisión.
3. No existen pruebas unitarias ni E2E configuradas y `package.json` no contiene scripts de pruebas.
4. Varios componentes y páginas React superan el límite interno de 120 líneas establecido en `.agent/rules/rules.md`.
5. `.env` está versionado aunque las reglas de `.gitignore` indican que debe permanecer fuera del repositorio.
6. `README.md` conserva el contenido genérico de Vite y no documenta el proyecto, su configuración ni sus procedimientos de validación.
7. `supabase/migrations/` está vacío, mientras el esquema vigente se distribuye entre `supabase/manual_sql/` y `supabase/migrations_legacy/`; falta documentar claramente la fuente de verdad y el orden de aplicación.
8. Existen archivos extensos con múltiples responsabilidades que dificultan las pruebas y la revisión, especialmente en los flujos autenticados heredados y en `public-intake`.
9. El `tsconfig.json` raíz solo cubre `src/`; las Edge Functions tienen un `supabase/functions/tsconfig.json` separado que no forma parte de los controles actuales.
10. No existe un workflow de integración continua que ejecute las validaciones antes de integrar cambios.
11. No están definidos el entorno reproducible de Playwright, los umbrales de cobertura ni la comprobación automática del límite de 120 líneas.
12. La rotación de credenciales depende de accesos externos y necesita responsables, condición de bloqueo y evidencia de cierre sin valores sensibles.

---

## Alcance

### TypeScript y compilación

- Eliminar la importación no utilizada de `RegisterPage` en el enrutador.
- Incorporar el estado `borrador` al mapa visual de estados o excluirlo mediante una decisión tipada y documentada.
- Mantener `strict`, `noUnusedLocals`, `noUnusedParameters` y las demás reglas estrictas existentes.
- Agregar los siguientes scripts a `package.json`:
  - `typecheck:app` para ejecutar `tsc --noEmit` sobre `src/`.
  - `typecheck:functions` para ejecutar `tsc -p supabase/functions/tsconfig.json`.
  - `typecheck` para ejecutar ambos controles como una única puerta de calidad.
- Corregir todos los errores TypeScript que aparezcan durante el saneamiento, sin introducir `any`, `@ts-ignore` ni aserciones inseguras para ocultarlos.
- Mantener separado el tipado del navegador y de las Edge Functions, sin incluir globals de Deno en la aplicación React.
- Confirmar que `yarn typecheck:app`, `yarn typecheck:functions`, `yarn typecheck` y `yarn build` terminen sin errores.

### ESLint para TypeScript y React

- Configurar ESLint para analizar `ts`, `tsx`, `js` y `jsx`, usando overrides separados para la aplicación y las Edge Functions.
- Incorporar `typescript-eslint` con configuración type-aware para `src/`, además de las reglas de React Hooks.
- Configurar un override para `supabase/functions/**/*.ts` compatible con `supabase/functions/tsconfig.json`, los globals declarados de Deno y los imports remotos tipados existentes.
- Activar reglas que detecten variables sin uso, promesas ignoradas, tipos inseguros y supresiones injustificadas.
- Revisar los `eslint-disable` existentes y conservar únicamente los que tengan una justificación técnica válida.
- Agregar exclusiones solo para artefactos generados como `dist`, cobertura y reportes de pruebas.
- Agregar `lint:app`, `lint:functions` y un `lint` agregado que ejecute ambos alcances.
- Confirmar que `yarn lint` analiza realmente `src/`, `supabase/functions/` y las configuraciones aplicables.

### Pruebas automatizadas

- Incorporar Vitest para pruebas unitarias y de integración ligera.
- Incorporar Testing Library para componentes React que requieran interacción.
- Incorporar Playwright para los flujos públicos críticos definidos en el Hito 6.
- Agregar scripts como mínimo:
  - `test` para modo interactivo o watch.
  - `test:run` para ejecución única en CI.
  - `test:coverage` para reporte de cobertura.
  - `test:e2e` para pruebas de navegador.
- Crear pruebas unitarias para:
  - Catálogo y reglas de trámites.
  - Pago obligatorio o no obligatorio por trámite.
  - Campos condicionales de expediente, sumilla y asunto.
  - Esquema de solicitud pública.
  - Utilidades de estados y rutas.
- Crear pruebas E2E iniciales para:
  - Acceso público a `/mesa-de-partes` sin autenticación.
  - Navegación hacia `/trazabilidad`.
  - Validaciones principales del formulario público.
  - Redirección de `/login` hacia el flujo público.
  - Protección de `/admin` para usuarios sin rol administrador.
- Ejecutar por defecto las pruebas E2E del Hito 7 en modo local determinista:
  - `baseURL` igual a `http://127.0.0.1:4173` mediante el `webServer` de Playwright, ejecutando `yarn dev --host 127.0.0.1 --port 4173`.
  - Servidor local de Vite sin conexión a servicios productivos; el build se valida por separado con `yarn build`.
  - Intercepción de las solicitudes a Supabase Edge Functions para simular recepción, trazabilidad y errores controlados.
  - Sustitución controlada de Turnstile únicamente en el entorno E2E; el bypass no debe estar disponible en builds de producción.
  - Sesión no autenticada simulada para comprobar la protección de `/admin`; las pruebas con un administrador real quedan para integración en ambiente no productivo.
  - Chromium en viewport de escritorio y un proyecto móvil con viewport equivalente a un teléfono moderno.
- Mantener las pruebas de integración contra staging como una suite separada y opcional para este hito; nunca utilizar credenciales de producción.
- Medir cobertura como mínimo sobre `src/features/mesa-partes-publica/schemas/`, `src/features/mesa-partes-publica/utils/`, `src/utils/` y los módulos puros extraídos de `public-intake`.
- Exigir en ese alcance al menos 80 % de líneas, statements y funciones, y 70 % de branches.
- Registrar la cobertura global del código heredado como línea base informativa; cualquier módulo heredado modificado durante el hito debe incorporar pruebas y no reducir su cobertura.

### Tamaño y responsabilidades de componentes

- Aplicar el límite de 120 líneas a componentes y páginas React, excluyendo únicamente líneas en blanco cuando se mida de forma automatizada.
- Crear `scripts/check-component-size.mjs` y el comando `yarn check:size` para recorrer `src/**/*.tsx`, contar líneas no vacías y fallar cuando un componente o página exceda 120 líneas.
- Excluir del control únicamente archivos generados; cualquier excepción temporal debe indicar archivo, motivo, responsable y fecha límite, y no puede permanecer al cerrar el hito.
- Dividir componentes extensos por responsabilidad, priorizando:
  - `NewSolicitudPage.tsx`.
  - `SolicitudDetailPage.tsx`.
  - `DocumentosForm.tsx`.
  - `ProfilePage.tsx`.
  - `ExternalDashboardPage.tsx`.
  - `DocumentoUpload.tsx`.
  - `ComprobantePagoUpload.tsx`.
- Extraer tipos a archivos dedicados.
- Extraer validaciones y transformaciones a funciones puras en `utils` o `schemas`.
- Mantener las llamadas a Supabase en `services`.
- Evitar duplicar componentes o reglas entre el flujo público y el flujo autenticado heredado.
- Conservar el comportamiento funcional existente durante la refactorización.

### Modularización de servicios y Edge Functions

- Dividir `src/services/solicitud.service.ts` por casos de uso o dominio cuando la separación reduzca responsabilidades sin introducir dependencias circulares.
- Modularizar `supabase/functions/public-intake/index.ts` en archivos específicos para:
  - Validación de petición y payload.
  - Verificación de CAPTCHA y rate limit.
  - Validación y almacenamiento de archivos.
  - Idempotencia y finalización en base de datos.
  - Envío y registro del webhook.
  - Respuestas HTTP y CORS.
- Mantener `index.ts` como punto de entrada y coordinador del flujo.
- Agregar pruebas a las funciones puras extraídas.
- No cambiar contratos públicos ni reglas de seguridad sin actualizar el Hito 6 y su matriz de pruebas.

### Protección de secretos y archivos de entorno

- Confirmar que `.env` no siga versionado mediante `git ls-files .env`.
- Retirar `.env` del índice de Git sin borrar el archivo de desarrollo local.
- Mantener únicamente `.env.example` con nombres de variables y valores vacíos o evidentemente ficticios.
- Asignar al responsable de implementación del repositorio la retirada de `.env`, el inventario de nombres de variables expuestas y la verificación del historial, sin mostrar ni copiar valores sensibles en logs, commits o documentación.
- Clasificar cada valor encontrado como público, secreto o pendiente de confirmación. Las variables `VITE_*` son visibles en el navegador y no deben contener secretos; una clave pública se revisa, pero no se rota automáticamente salvo que la política del proveedor lo requiera.
- Asignar al responsable de plataforma con acceso a Supabase, Cloudflare y n8n la rotación o revocación de todo secreto real expuesto, incluyendo `service_role`, secretos de Turnstile, webhook de n8n y secreto del worker cuando corresponda.
- Usar `docs/seguridad/registro_rotacion_credenciales.md` como evidencia, registrando solo proveedor, identificador no sensible, clasificación, responsable, fecha, estado y verificación; nunca el valor de la credencial.
- Si se confirma un secreto real expuesto, bloquear el cierre del hito y cualquier despliegue hasta contar con evidencia de rotación o revocación. El saneamiento local no debe ocultar este bloqueo.
- No reescribir el historial Git sin aprobación explícita y una estrategia coordinada con el equipo.
- Documentar qué variables son públicas `VITE_*` y cuáles son secretos exclusivos de Supabase Edge Functions.
- Agregar `yarn check:env` para fallar si Git rastrea `.env` o variantes no permitidas, conservando únicamente `.env.example`.

### Integración continua

- Crear `.github/workflows/quality.yml` y ejecutarlo en pull requests hacia `main` y pushes a `main`.
- Fijar la versión de Node.js y usar Yarn con `yarn install --frozen-lockfile`.
- Ejecutar en el pipeline, como mínimo:
  - `yarn check:env`.
  - `yarn typecheck`.
  - `yarn lint`.
  - `yarn check:size`.
  - `yarn test:coverage`.
  - `yarn build`.
  - Instalación de Chromium de Playwright y `yarn test:e2e` en modo local simulado.
- No inyectar credenciales de producción en el workflow. Las pruebas del Hito 7 deben ser reproducibles con datos ficticios y servicios interceptados.
- Publicar como artefactos el reporte de cobertura y, cuando falle Playwright, sus trazas o capturas sin datos sensibles.
- Considerar el workflow exitoso como condición obligatoria para cerrar el hito. La configuración externa de protección de rama debe ser realizada por el responsable del repositorio si se dispone de permisos.

### Documentación del proyecto

- Reemplazar el README genérico de Vite por documentación específica de la Mesa de Partes CPRD.
- Incluir como mínimo:
  - Propósito y alcance del sistema.
  - Arquitectura general.
  - Requisitos de Node.js y Yarn.
  - Instalación local.
  - Variables de entorno sin valores sensibles.
  - Scripts disponibles.
  - Rutas públicas y administrativas.
  - Estrategia de Supabase y despliegue de Edge Functions.
  - Ejecución de typecheck, lint, pruebas y build.
  - Enlaces a los hitos y reglas del proyecto.
- Eliminar referencias innecesarias a la plantilla inicial y activos de ejemplo que ya no se utilicen.

### Orden y trazabilidad de SQL

- Documentar que los cambios vigentes de base de datos se crean como scripts versionados en `supabase/manual_sql/` y se ejecutan manualmente desde SQL Editor.
- Identificar explícitamente `supabase/manual_sql/initial_schema.sql` como esquema base y ordenar los scripts complementarios del Hito 6.
- Marcar `supabase/migrations_legacy/` como antecedente no aplicable a instalaciones nuevas, salvo instrucción documentada.
- Definir si `supabase/migrations/` debe conservarse como carpeta vacía o eliminarse en un cambio posterior; no usarla para nuevas migraciones mientras la regla vigente indique ejecución manual.
- Crear un registro documental de scripts aplicados por ambiente, con fecha, responsable y resultado de validación.
- Verificar que cada script nuevo use transacción cuando corresponda, incluya validaciones posteriores y documente un rollback seguro.

---

## Secuencia de implementación

1. Retirar `.env` del índice, clasificar la exposición y activar el bloqueo de seguridad si se confirma algún secreto real.
2. Coordinar la rotación o revocación externa y registrar evidencia no sensible cuando corresponda.
3. Corregir los errores actuales de TypeScript y agregar typecheck separado para aplicación y Edge Functions.
4. Ampliar ESLint a TypeScript, React y Edge Functions, y corregir todos los hallazgos reales.
5. Crear `check:env` y `check:size` con pruebas de sus condiciones de éxito y fallo.
6. Configurar Vitest, Testing Library, cobertura y Playwright en el entorno local simulado definido.
7. Crear pruebas de caracterización para preservar el comportamiento existente.
8. Refactorizar componentes y páginas que exceden 120 líneas.
9. Modularizar servicios y `public-intake` respaldados por pruebas.
10. Reemplazar el README y documentar variables, scripts, SQL y despliegue.
11. Crear el workflow de CI y verificar una ejecución completa sin secretos productivos.
12. Ejecutar la matriz completa de validación y revisar el diff para descartar secretos o cambios funcionales involuntarios.

---

## Validación y casos de prueba

### Calidad estática

- `yarn typecheck:app`, `yarn typecheck:functions` y `yarn typecheck` finalizan con código 0.
- `yarn lint:app`, `yarn lint:functions` y `yarn lint` finalizan con código 0.
- `yarn build` finaliza con código 0.
- `yarn check:size` finaliza con código 0 y no existen excepciones abiertas.
- No existen nuevos usos de `any`, `@ts-ignore` o silenciamiento general de reglas.
- Ningún componente o página React excede 120 líneas.

### Pruebas

- `yarn test:run` finaliza sin errores.
- `yarn test:coverage` finaliza sin errores y cumple 80 % de líneas, statements y funciones, y 70 % de branches en el alcance obligatorio.
- `yarn test:e2e` finaliza sin errores contra `http://127.0.0.1:4173`, con servicios interceptados, en los proyectos Chromium de escritorio y móvil.
- Las reglas de pago y campos condicionales están cubiertas por pruebas.
- Las rutas públicas y administrativas críticas cuentan con pruebas.
- Los errores de validación relevantes cuentan con al menos un caso negativo.

### Seguridad de configuración

- `.env` no aparece en `git ls-files`.
- `yarn check:env` finaliza con código 0.
- `.env.example` no contiene secretos.
- Ningún secreto de Edge Functions aparece en variables `VITE_*`.
- Las credenciales potencialmente expuestas fueron clasificadas y, cuando correspondía, rotadas o revocadas por el responsable de plataforma.
- El registro de rotación contiene evidencia no sensible y no quedan bloqueos de seguridad abiertos.
- El repositorio permanece libre de claves, tokens y URLs privadas de webhook.

### Integración continua

- `.github/workflows/quality.yml` existe y ejecuta todos los controles definidos.
- El workflow finaliza correctamente en una ejecución asociada al hito.
- El workflow no utiliza secretos ni credenciales de producción.
- Los reportes de cobertura y fallos E2E se publican sin información sensible.

### Documentación y base de datos

- El README permite instalar, configurar, validar y ejecutar el proyecto desde cero.
- El orden de los scripts SQL vigentes está documentado.
- Las migraciones legacy están claramente separadas del procedimiento actual.
- Existe un formato para registrar la ejecución manual de SQL por ambiente.

---

## Definition of Done (DoD)

Este hito se considera completado cuando:

- TypeScript y ESLint cubren tanto la aplicación React como las Edge Functions y finalizan sin errores.
- Pruebas unitarias, cobertura, pruebas E2E locales y build finalizan sin errores.
- La cobertura cumple los umbrales definidos para los módulos críticos y modificados.
- Los errores actuales de `RegisterPage` y del estado `borrador` están corregidos.
- `check:size` confirma que los componentes y páginas cumplen el límite de 120 líneas sin excepciones abiertas.
- Los archivos extensos priorizados tienen responsabilidades separadas y pruebas de caracterización.
- `.env` dejó de estar versionado, `check:env` previene su reingreso y las credenciales expuestas fueron clasificadas y tratadas por el responsable correspondiente.
- No quedan bloqueos de rotación o revocación abiertos y existe evidencia no sensible.
- El workflow de CI ejecuta exitosamente todas las puertas de calidad sin credenciales productivas.
- El README describe el proyecto real y su operación.
- La estrategia de scripts SQL manuales y archivos legacy está documentada sin ambigüedades.
- No se alteraron las reglas funcionales vigentes del Hito 6.
- El repositorio queda preparado para una auditoría funcional, técnica y de seguridad exhaustiva.

---

## Fuera de alcance

- Incorporar nuevos trámites o modificar reglas de negocio.
- Cambiar la arquitectura de Supabase por otro backend.
- Ejecutar scripts SQL en producción sin aprobación.
- Desplegar Edge Functions o frontend en producción.
- Reescribir el historial Git sin coordinación y aprobación explícita.
- Declarar aprobado el Hito 6: este saneamiento prepara la auditoría, pero no la reemplaza.

---

## Resultado esperado

El proyecto dispone de una base técnica limpia, documentada y verificable. Los controles automáticos detectan regresiones, los secretos permanecen fuera del repositorio, la estructura respeta las reglas internas y el equipo puede iniciar la auditoría integral del Hito 6 con señales confiables de calidad.

---

## Registro de implementación local — 2026-07-15

Se implementaron las puertas de calidad, pruebas unitarias y E2E, cobertura, control de tamaño, control de archivos de entorno, modularización prioritaria, workflow de CI y documentación operativa. La validación local obtuvo los siguientes resultados:

- TypeScript de aplicación y Edge Functions: conforme.
- ESLint de aplicación y Edge Functions: sin errores; los avisos informativos corresponden al cliente Supabase sin tipos generados y quedan visibles para una auditoría posterior.
- Componentes TSX: ninguno supera 120 líneas no vacías.
- Pruebas unitarias: 40 casos aprobados.
- Cobertura crítica: 95.39 % de statements y líneas, 93.75 % de funciones y 92.85 % de branches.
- Playwright: 10 casos aprobados en Chromium de escritorio y móvil contra servicios interceptados.
- Build de producción y comprobación de `.env`: conformes.
- `.env` fue retirado del índice sin eliminar la copia local; la clasificación no sensible está en `docs/seguridad/registro_rotacion_credenciales.md`.

La ejecución real de `.github/workflows/quality.yml` y la protección de rama quedan pendientes de crear o actualizar el pull request en el proveedor Git. No se ejecutaron scripts SQL, despliegues ni cambios de infraestructura durante esta implementación.
