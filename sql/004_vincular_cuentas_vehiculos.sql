-- ================================================================
-- UTEQ SMART PARKING
-- 004 - VINCULACIÓN CUENTA SUPABASE <-> VEHÍCULOS
--
-- Requisitos:
--   001 -> esquema inicial
--   002 -> CRUD
--   003 -> roles administrador / usuario
--
-- Objetivos:
--   1. Relacionar vehiculos con auth.users usando usuario_id.
--   2. Vincular registros antiguos mediante correo.
--   3. Permitir varios vehículos por propietario.
--   4. Usar auth.uid() en "Mis vehículos".
--   5. Mantener seguridad RLS.
--   6. Permitir vinculación automática de cuentas nuevas.
-- ================================================================


begin;


-- ================================================================
-- 0. DESACTIVAR TEMPORALMENTE EL TRIGGER DE 003
--
-- El trigger anterior protege UPDATE.
-- Durante esta migración necesitamos modificar usuario_id desde
-- el SQL Editor, donde auth.uid() es NULL.
--
-- Al final del script se vuelve a crear.
-- ================================================================

drop trigger if exists
  trg_proteger_campos_vehiculo_usuario
on public.vehiculos;



-- ================================================================
-- 1. AGREGAR usuario_id
-- ================================================================

alter table public.vehiculos

add column if not exists
  usuario_id uuid;



-- ================================================================
-- 2. RELACIÓN CON auth.users
-- ================================================================

do $$

begin

  if not exists (

    select 1

    from pg_constraint

    where conname =
      'vehiculos_usuario_id_fkey'

      and conrelid =
        'public.vehiculos'::regclass

  ) then

    alter table public.vehiculos

    add constraint
      vehiculos_usuario_id_fkey

    foreign key (usuario_id)

    references auth.users(id)

    on update cascade

    on delete set null;

  end if;

end;

$$;



-- ================================================================
-- 3. ÍNDICE usuario_id
-- ================================================================

create index if not exists
  idx_vehiculos_usuario_id

on public.vehiculos(usuario_id);



-- ================================================================
-- 4. PERMITIR VARIOS VEHÍCULOS POR PROPIETARIO
--
-- La versión inicial tenía:
--
-- cedula_propietario UNIQUE
--
-- Eso impide que una persona tenga más de un automóvil.
--
-- Eliminamos únicamente el UNIQUE sobre la cédula.
-- La placa sigue siendo UNIQUE.
-- ================================================================

do $$

declare

  restriccion record;

begin

  for restriccion in

    select
      conname

    from pg_constraint

    where
      conrelid =
        'public.vehiculos'::regclass

      and contype = 'u'

      and pg_get_constraintdef(oid)
        ilike '%cedula_propietario%'

  loop

    execute format(

      'alter table public.vehiculos drop constraint %I',

      restriccion.conname

    );

  end loop;

end;

$$;



create index if not exists
  idx_vehiculos_cedula_propietario

on public.vehiculos(
  cedula_propietario
);



-- ================================================================
-- 5. VINCULAR CUENTAS QUE YA EXISTEN
--
-- Se compara:
--
-- auth.users.email
--
-- con:
--
-- correo_institucional
-- correo_microsoft
--
-- Este UPDATE funciona ahora porque el trigger de protección
-- fue retirado temporalmente.
-- ================================================================

update public.vehiculos as v

set usuario_id = u.id

from auth.users as u

where

  v.usuario_id is null

  and (

    lower(
      trim(v.correo_institucional)
    )

    =

    lower(
      trim(u.email)
    )


    or


    lower(
      trim(
        coalesce(
          v.correo_microsoft,
          ''
        )
      )
    )

    =

    lower(
      trim(u.email)
    )

  );



-- ================================================================
-- 6. FUNCIÓN: VINCULAR MIS VEHÍCULOS
--
-- Se llamará desde React cuando el usuario abra:
--
--   Mi perfil
--   Mis vehículos
--
-- Caso:
--
-- vehículo ya existe
--        ↓
-- estudiante crea cuenta después
--        ↓
-- inicia sesión
--        ↓
-- RPC encuentra mismo correo
--        ↓
-- usuario_id = auth.uid()
-- ================================================================

create or replace function
  public.vincular_mis_vehiculos()

returns integer

language plpgsql

security definer

set search_path =
  public,
  auth

as $$

declare

  correo_actual text;

  total_vinculados integer;

begin

  -- --------------------------------------------------------------
  -- Debe existir usuario autenticado.
  -- --------------------------------------------------------------

  if auth.uid() is null then

    raise exception
      'No existe una sesión autenticada.';

  end if;


  correo_actual :=

    lower(

      trim(

        coalesce(
          auth.jwt() ->> 'email',
          ''
        )

      )

    );


  if correo_actual = '' then

    return 0;

  end if;


  -- --------------------------------------------------------------
  -- Únicamente puede tomar registros:
  --
  -- usuario_id NULL
  --
  -- o
  --
  -- ya pertenecientes al mismo usuario.
  -- --------------------------------------------------------------

  update public.vehiculos

  set usuario_id =
    auth.uid()

  where

    (
      usuario_id is null

      or

      usuario_id =
        auth.uid()
    )

    and

    (

      lower(
        trim(correo_institucional)
      )
        =
      correo_actual


      or


      lower(
        trim(
          coalesce(
            correo_microsoft,
            ''
          )
        )
      )
        =
      correo_actual

    );


  get diagnostics

    total_vinculados =
      row_count;


  return total_vinculados;

end;

$$;



revoke all

on function
  public.vincular_mis_vehiculos()

from public;



revoke all

on function
  public.vincular_mis_vehiculos()

from anon;



grant execute

on function
  public.vincular_mis_vehiculos()

to authenticated;



-- ================================================================
-- 7. FUNCIÓN:
-- SINCRONIZAR usuario_id AL CREAR/EDITAR DESDE ADMIN
--
-- Si el administrador escribe un correo que ya tiene cuenta,
-- el UUID se asigna automáticamente.
-- ================================================================

create or replace function
  public.sincronizar_usuario_id_vehiculo()

returns trigger

language plpgsql

security definer

set search_path =
  public,
  auth

as $$

declare

  id_encontrado uuid;

begin

  id_encontrado := null;


  select
    u.id

  into
    id_encontrado

  from auth.users as u

  where

    lower(
      trim(u.email)
    )

    =

    lower(
      trim(
        coalesce(
          new.correo_institucional,
          ''
        )
      )
    )


    or


    lower(
      trim(u.email)
    )

    =

    lower(
      trim(
        coalesce(
          new.correo_microsoft,
          ''
        )
      )
    )

  order by

    case

      when

        lower(
          trim(u.email)
        )

        =

        lower(
          trim(
            coalesce(
              new.correo_institucional,
              ''
            )
          )
        )

      then 0

      else 1

    end

  limit 1;


  /*
   * Si encuentra cuenta:
   *
   * usuario_id = UUID encontrado.
   *
   * Si no encuentra:
   *
   * usuario_id = NULL.
   */

  new.usuario_id :=
    id_encontrado;


  return new;

end;

$$;



-- ================================================================
-- 8. TRIGGER INSERT
-- ================================================================

drop trigger if exists
  trg_vincular_usuario_insert
on public.vehiculos;


create trigger
  trg_vincular_usuario_insert

before insert

on public.vehiculos

for each row

execute function
  public.sincronizar_usuario_id_vehiculo();



-- ================================================================
-- 9. TRIGGER CAMBIO DE CORREO POR ADMIN
-- ================================================================

drop trigger if exists
  trg_vincular_usuario_email_update
on public.vehiculos;


create trigger
  trg_vincular_usuario_email_update

before update
of
  correo_institucional,
  correo_microsoft

on public.vehiculos

for each row

execute function
  public.sincronizar_usuario_id_vehiculo();



-- ================================================================
-- 10. PERMISO SELECT usuario_id
-- ================================================================

grant select (
  usuario_id
)

on public.vehiculos

to authenticated;



-- ================================================================
-- 11. POLÍTICA SELECT
--
-- USUARIO:
--
--   ve vehículos autorizados
--
--   +
--
--   puede ver los suyos aunque estén NO autorizados.
--
-- ADMIN:
--
--   ve todos.
-- ================================================================

drop policy if exists
  "Lectura autenticada de vehiculos"

on public.vehiculos;



create policy
  "Lectura autenticada de vehiculos"

on public.vehiculos

for select

to authenticated

using (

  autorizado = true

  or

  usuario_id =
    auth.uid()

  or

  public.es_admin()

);



-- ================================================================
-- 12. POLÍTICA UPDATE PROPIETARIO
--
-- Ya NO depende del correo.
--
-- Depende de:
--
-- usuario_id = auth.uid()
-- ================================================================

drop policy if exists
  "Usuario edita su propio vehiculo"

on public.vehiculos;



create policy
  "Usuario edita su propio vehiculo"

on public.vehiculos

for update

to authenticated

using (

  usuario_id =
    auth.uid()

)

with check (

  usuario_id =
    auth.uid()

);



-- ================================================================
-- 13. NUEVO TRIGGER DE SEGURIDAD
--
-- Esta versión ya entiende:
--
--   usuario_id
--
-- y también permite la PRIMERA vinculación:
--
-- NULL -> auth.uid()
--
-- siempre que el correo coincida.
-- ================================================================

create or replace function
  public.proteger_campos_vehiculo_usuario()

returns trigger

language plpgsql

security invoker

set search_path = public

as $$

declare

  correo_actual text;

  correo_coincide boolean;

begin

  -- --------------------------------------------------------------
  -- ADMIN
  -- --------------------------------------------------------------

  if public.es_admin() then

    return new;

  end if;


  correo_actual :=

    lower(

      trim(

        coalesce(
          auth.jwt() ->> 'email',
          ''
        )

      )

    );


  correo_coincide :=

    (

      lower(
        trim(old.correo_institucional)
      )
        =
      correo_actual


      or


      lower(
        trim(
          coalesce(
            old.correo_microsoft,
            ''
          )
        )
      )
        =
      correo_actual

    );


  -- --------------------------------------------------------------
  -- CASO ESPECIAL:
  -- PRIMERA VINCULACIÓN
  --
  -- old.usuario_id = NULL
  --
  -- new.usuario_id = auth.uid()
  --
  -- correo coincide
  --
  -- Se permite.
  -- --------------------------------------------------------------

  if

    old.usuario_id is null

    and

    new.usuario_id =
      auth.uid()

    and

    correo_coincide

  then

    return new;

  end if;


  -- --------------------------------------------------------------
  -- RESTO DE OPERACIONES:
  -- debe ser realmente propietario.
  -- --------------------------------------------------------------

  if

    old.usuario_id
      is distinct from
    auth.uid()

  then

    raise exception
      'No tienes permiso para editar este vehículo.';

  end if;


  -- --------------------------------------------------------------
  -- PROTEGER CAMPOS SENSIBLES
  -- --------------------------------------------------------------

  if

       new.id
         is distinct from
       old.id


    or


       new.usuario_id
         is distinct from
       old.usuario_id


    or


       new.placa
         is distinct from
       old.placa


    or


       new.anio
         is distinct from
       old.anio


    or


       new.cedula_propietario
         is distinct from
       old.cedula_propietario


    or


       new.correo_institucional
         is distinct from
       old.correo_institucional


    or


       new.correo_microsoft
         is distinct from
       old.correo_microsoft


    or


       new.autorizado
         is distinct from
       old.autorizado


    or


       new.foto_fuente_url
         is distinct from
       old.foto_fuente_url


    or


       new.created_at
         is distinct from
       old.created_at

  then

    raise exception
      'Como usuario normal no puedes modificar campos restringidos.';

  end if;


  return new;

end;

$$;



-- ================================================================
-- 14. RECREAR TRIGGER DE PROTECCIÓN
-- ================================================================

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
-- 15. VERIFICACIÓN GENERAL
-- ================================================================

select

  count(*) as
    vehiculos_totales,

  count(usuario_id) as
    vehiculos_vinculados,

  count(*) -
    count(usuario_id) as
    vehiculos_sin_cuenta

from public.vehiculos;



-- ================================================================
-- 16. VER VINCULACIONES
-- ================================================================

select

  v.id,

  v.placa,

  v.propietario_nombre,

  v.correo_institucional,

  v.correo_microsoft,

  u.email as
    cuenta_supabase,

  v.usuario_id

from public.vehiculos as v

left join auth.users as u

  on u.id =
    v.usuario_id

order by

  v.propietario_nombre;