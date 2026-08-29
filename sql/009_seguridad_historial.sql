-- =====================================================================
-- UTEQ SMART PARKING
-- 009 - SEGURIDAD DEL HISTORIAL
--
-- ADMIN:
--   puede consultar todo el historial de reservas.
--
-- USUARIO NORMAL:
--   solamente puede consultar eventos pertenecientes a su cuenta.
-- =====================================================================

begin;


-- =====================================================================
-- 1. ASEGURAR RLS
-- =====================================================================

alter table
public.historial_reservas_puestos
enable row level security;


-- =====================================================================
-- 2. ELIMINAR POLÍTICA ABIERTA ANTERIOR
-- =====================================================================

drop policy if exists
  "Usuarios autenticados leen historial reservas"
on public.historial_reservas_puestos;


drop policy if exists
  "Historial propio o administrador"
on public.historial_reservas_puestos;


-- =====================================================================
-- 3. NUEVA POLÍTICA
--
-- ADMIN:
-- public.es_admin() = true
--
-- USUARIO:
-- solo registros cuyo usuario_id coincide con auth.uid()
-- =====================================================================

create policy
  "Historial propio o administrador"

on public.historial_reservas_puestos

for select

to authenticated

using (

  usuario_id =
    auth.uid()

  or

  public.es_admin()

);


-- =====================================================================
-- 4. PERMISOS
-- =====================================================================

revoke all
on public.historial_reservas_puestos
from anon;


grant select
on public.historial_reservas_puestos
to authenticated;


commit;


-- =====================================================================
-- 5. VERIFICACIÓN
-- =====================================================================

select
  id,
  usuario_id,
  codigo_puesto,
  tipo_evento,
  placa,
  fecha_evento
from
  public.historial_reservas_puestos
order by
  fecha_evento desc;