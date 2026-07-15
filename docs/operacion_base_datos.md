# Operación de base de datos

## Fuente de verdad

Los scripts vigentes se crean y versionan en `supabase/manual_sql/`. Su ejecución es manual mediante Supabase SQL Editor y requiere autorización del responsable del ambiente. No se ejecutan automáticamente desde CI ni como parte de este hito.

Para una instalación nueva, el orden vigente es:

1. `supabase/manual_sql/initial_schema.sql` — esquema base.
2. `supabase/manual_sql/hito_6_public_intake.sql` — ingreso y trazabilidad públicos.
3. `supabase/manual_sql/hito_6_edge_functions_hardening.sql` — controles y soporte operativo de Edge Functions.
4. `supabase/manual_sql/promote_admin.sql` — solo cuando corresponda promover un usuario autorizado; no es parte del aprovisionamiento general.

`supabase/migrations_legacy/` contiene antecedentes históricos y no debe aplicarse en instalaciones nuevas salvo una instrucción técnica aprobada. `supabase/migrations/` se conserva vacía por compatibilidad con herramientas, pero no es la ruta vigente para cambios nuevos.

## Requisitos de cada script

- Usar una transacción cuando las sentencias lo permitan.
- Ser idempotente o documentar claramente su precondición.
- Incluir consultas de validación posteriores sin datos sensibles.
- Documentar un rollback seguro o explicar por qué requiere restauración.
- No contener credenciales, tokens ni datos personales reales.

## Registro por ambiente

Copiar una fila por cada ejecución autorizada. No registrar cadenas de conexión ni valores secretos.

| Ambiente | Script y versión/commit | Fecha UTC | Responsable | Resultado | Evidencia no sensible | Rollback requerido |
|---|---|---|---|---|---|---|
| `por definir` | `por definir` | `AAAA-MM-DD HH:mm` | `por definir` | `pendiente` | `ticket o captura sin datos` | `sí/no` |

## Validación operativa

Después de aplicar un script, el responsable debe ejecutar sus verificaciones, registrar el resultado y confirmar que RLS, políticas, funciones y buckets mantienen el comportamiento esperado. Cualquier fallo detiene los scripts posteriores hasta completar el rollback o una corrección aprobada.
