-- ================================================================
-- UTEQ SMART PARKING — Ampliación para CRUD (Grupo 5)
-- Ejecutar en Supabase DESPUÉS de supabase_parqueadero_uteq.sql
--
-- Modelo de roles: se usa auth.users.raw_app_meta_data ->> 'role'
-- ('admin' | null). app_metadata NO es editable por el propio usuario
-- (a diferencia de user_metadata), así que un usuario normal no puede
-- auto-promoverse a admin. Para volver admin a una cuenta:
--   Supabase Studio -> Authentication -> Users -> (usuario) ->
--   editar "Raw App Meta Data" -> { "role": "admin" }
-- ================================================================

begin;

-- ----------------------------------------------------------------
-- 1. Permisos de escritura a nivel de tabla
-- ----------------------------------------------------------------
grant insert (
  placa, marca, modelo, anio, color, tipo,
  foto_url, foto_fuente_url, foto_propietario_url,
  cedula_propietario, propietario_nombre,
  correo_institucional, correo_microsoft, autorizado
) on public.vehiculos to authenticated;

-- Columnas que un usuario NORMAL puede actualizar de su propio vehículo
-- (datos y fotos, nunca placa/cédula/correo/autorizado)
grant update (
  marca, modelo, color, tipo, foto_url, foto_propietario_url
) on public.vehiculos to authenticated;

grant delete on public.vehiculos to authenticated;

-- ----------------------------------------------------------------
-- 2. Función auxiliar: ¿el usuario autenticado es admin?
-- ----------------------------------------------------------------
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ----------------------------------------------------------------
-- 3. Políticas de INSERT
--    Solo el administrador puede registrar nuevos vehículos.
-- ----------------------------------------------------------------
drop policy if exists "Admin inserta vehiculos" on public.vehiculos;
create policy "Admin inserta vehiculos"
on public.vehiculos
for insert
to authenticated
with check (public.es_admin());

-- ----------------------------------------------------------------
-- 4. Políticas de UPDATE
--    - Admin: puede editar cualquier vehículo, cualquier columna
--      permitida.
--    - Usuario normal: solo puede editar el vehículo cuyo correo
--      institucional coincide con su propio correo de sesión.
-- ----------------------------------------------------------------
drop policy if exists "Admin edita cualquier vehiculo" on public.vehiculos;
create policy "Admin edita cualquier vehiculo"
on public.vehiculos
for update
to authenticated
using (public.es_admin())
with check (public.es_admin());

drop policy if exists "Usuario edita su propio vehiculo" on public.vehiculos;
create policy "Usuario edita su propio vehiculo"
on public.vehiculos
for update
to authenticated
using (correo_institucional = auth.jwt() ->> 'email')
with check (correo_institucional = auth.jwt() ->> 'email');

-- ----------------------------------------------------------------
-- 5. Políticas de DELETE
--    Solo el administrador puede eliminar.
-- ----------------------------------------------------------------
drop policy if exists "Admin elimina vehiculos" on public.vehiculos;
create policy "Admin elimina vehiculos"
on public.vehiculos
for delete
to authenticated
using (public.es_admin());

commit;

-- ----------------------------------------------------------------
-- 6. Verificación rápida
-- ----------------------------------------------------------------
select polname, polcmd from pg_policy
where polrelid = 'public.vehiculos'::regclass;
