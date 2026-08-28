-- ================================================================
-- UTEQ SMART PARKING
-- 003 - ROLES ADMINISTRADOR / USUARIO
--
-- Requisitos:
--   001 -> esquema y datos iniciales
--   002 -> CRUD inicial
--
-- Este script:
--   1. Configura rol administrador mediante app_metadata.
--   2. Permite lectura segura.
--   3. Admin puede INSERT / UPDATE / DELETE.
--   4. Usuario normal solo UPDATE de su propio registro.
--   5. Protege columnas sensibles mediante trigger.
-- ================================================================

begin;


-- ================================================================
-- 1. FUNCIÓN PARA IDENTIFICAR ADMINISTRADOR
-- ================================================================

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      auth.jwt()
      -> 'app_metadata'
      ->> 'role'
    ) = 'admin',
    false
  );
$$;

grant execute
on function public.es_admin()
to authenticated;


-- ================================================================
-- 2. ELIMINAR POLÍTICAS ANTERIORES
-- ================================================================

drop policy if exists
  "Lectura publica de vehiculos autorizados"
on public.vehiculos;

drop policy if exists
  "Admin inserta vehiculos"
on public.vehiculos;

drop policy if exists
  "Admin edita cualquier vehiculo"
on public.vehiculos;

drop policy if exists
  "Usuario edita su propio vehiculo"
on public.vehiculos;

drop policy if exists
  "Admin elimina vehiculos"
on public.vehiculos;

drop policy if exists
  "Lectura autenticada de vehiculos"
on public.vehiculos;


-- ================================================================
-- 3. ACTIVAR RLS
-- ================================================================

alter table public.vehiculos
enable row level security;


-- ================================================================
-- 4. QUITAR LECTURA ANÓNIMA
-- ================================================================

revoke select
on public.vehiculos
from anon;

revoke select (
  id,
  placa,
  marca,
  modelo,
  anio,
  color,
  tipo,
  foto_url,
  foto_fuente_url,
  foto_propietario_url,
  cedula_enmascarada,
  propietario_nombre,
  correo_institucional,
  autorizado
)
on public.vehiculos
from anon;


-- ================================================================
-- 5. COLUMNAS PÚBLICAS PARA USUARIOS AUTENTICADOS
--
-- NO entregamos:
--   cedula_propietario completa
--   correo_microsoft
-- ================================================================

grant select (
  id,
  placa,
  marca,
  modelo,
  anio,
  color,
  tipo,
  foto_url,
  foto_fuente_url,
  foto_propietario_url,
  cedula_enmascarada,
  propietario_nombre,
  correo_institucional,
  autorizado
)
on public.vehiculos
to authenticated;


-- ================================================================
-- 6. PERMISOS SQL
--
-- PostgreSQL solamente conoce el rol "authenticated".
-- La separación usuario/admin se aplica realmente mediante:
--
--   RLS + public.es_admin() + trigger.
-- ================================================================

grant insert
on public.vehiculos
to authenticated;

grant update
on public.vehiculos
to authenticated;

grant delete
on public.vehiculos
to authenticated;


-- ================================================================
-- 7. POLÍTICA SELECT
--
-- Usuario:
--   únicamente vehículos autorizados.
--
-- Administrador:
--   todos, incluidos NO autorizados.
-- ================================================================

create policy
  "Lectura autenticada de vehiculos"
on public.vehiculos
for select
to authenticated
using (
  autorizado = true
  or public.es_admin()
);


-- ================================================================
-- 8. INSERT
-- SOLO ADMINISTRADOR
-- ================================================================

create policy
  "Admin inserta vehiculos"
on public.vehiculos
for insert
to authenticated
with check (
  public.es_admin()
);


-- ================================================================
-- 9. UPDATE ADMIN
-- ================================================================

create policy
  "Admin edita cualquier vehiculo"
on public.vehiculos
for update
to authenticated
using (
  public.es_admin()
)
with check (
  public.es_admin()
);


-- ================================================================
-- 10. UPDATE USUARIO NORMAL
--
-- Solo puede actualizar la fila cuyo correo
-- coincide con su JWT.
-- ================================================================

create policy
  "Usuario edita su propio vehiculo"
on public.vehiculos
for update
to authenticated
using (
  lower(correo_institucional)
  =
  lower(
    auth.jwt() ->> 'email'
  )
)
with check (
  lower(correo_institucional)
  =
  lower(
    auth.jwt() ->> 'email'
  )
);


-- ================================================================
-- 11. DELETE
-- SOLO ADMINISTRADOR
-- ================================================================

create policy
  "Admin elimina vehiculos"
on public.vehiculos
for delete
to authenticated
using (
  public.es_admin()
);


-- ================================================================
-- 12. TRIGGER DE PROTECCIÓN
--
-- Aunque un usuario normal intente modificar la BD
-- desde consola, REST o JavaScript manualmente,
-- estos campos quedan bloqueados.
--
-- USUARIO NORMAL puede modificar:
--
--   propietario_nombre
--   marca
--   modelo
--   color
--   tipo
--   foto_url
--   foto_propietario_url
--
-- NO puede modificar:
--
--   id
--   placa
--   anio
--   cedula_propietario
--   correo_institucional
--   correo_microsoft
--   autorizado
--   foto_fuente_url
--   created_at
-- ================================================================

create or replace function
public.proteger_campos_vehiculo_usuario()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin

  -- ------------------------------------------------------------
  -- El administrador no tiene estas restricciones.
  -- ------------------------------------------------------------

  if public.es_admin() then
    return new;
  end if;


  -- ------------------------------------------------------------
  -- Confirmar que realmente es el propietario.
  -- ------------------------------------------------------------

  if lower(old.correo_institucional)
     <>
     lower(
       coalesce(
         auth.jwt() ->> 'email',
         ''
       )
     )
  then
    raise exception
      'No tienes permiso para editar este vehículo.';
  end if;


  -- ------------------------------------------------------------
  -- Campos protegidos.
  -- ------------------------------------------------------------

  if
       new.id
         is distinct from old.id

    or new.placa
         is distinct from old.placa

    or new.anio
         is distinct from old.anio

    or new.cedula_propietario
         is distinct from old.cedula_propietario

    or new.correo_institucional
         is distinct from old.correo_institucional

    or new.correo_microsoft
         is distinct from old.correo_microsoft

    or new.autorizado
         is distinct from old.autorizado

    or new.foto_fuente_url
         is distinct from old.foto_fuente_url

    or new.created_at
         is distinct from old.created_at

  then

    raise exception
      'Como usuario normal no puedes modificar campos restringidos.';

  end if;


  return new;

end;
$$;


drop trigger if exists
  trg_proteger_campos_vehiculo_usuario
on public.vehiculos;


create trigger
  trg_proteger_campos_vehiculo_usuario

before update
on public.vehiculos

for each row

execute function
  public.proteger_campos_vehiculo_usuario();


commit;


-- ================================================================
-- 13. VERIFICACIÓN
-- ================================================================

select
  polname as politica,
  polcmd as operacion
from pg_policy
where polrelid =
  'public.vehiculos'::regclass
order by polname;