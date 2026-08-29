-- =====================================================================
-- UTEQ SMART PARKING
-- 007 - RESERVA DE PUESTOS POR PROPIETARIOS
--
-- REQUIERE:
-- 005_conectar_puestos_vehiculos.sql
-- 006_perfiles_y_registro_usuario.sql
--
-- OBJETIVO:
--
-- USUARIO
--   ↓
-- selecciona uno de SUS vehículos autorizados
--   ↓
-- selecciona puesto disponible
--   ↓
-- reserva
--   ↓
-- el puesto deja de estar disponible
--   ↓
-- el mapa lo muestra rojo
--
-- Firebase continúa indicando la ocupación FÍSICA.
-- Supabase almacena la RESERVA.
-- =====================================================================


begin;


-- =====================================================================
-- 1. TABLA DE RESERVAS ACTIVAS
-- =====================================================================

create table if not exists
public.reservas_puestos_actuales
(
  id bigserial
  primary key,


  puesto_id bigint
  not null
  unique
  references public.puestos(id)
  on update cascade
  on delete cascade,


  vehiculo_id bigint
  not null
  unique
  references public.vehiculos(id)
  on update cascade
  on delete cascade,


  usuario_id uuid
  not null
  unique
  references auth.users(id)
  on delete cascade,


  fecha_reserva timestamptz
  not null
  default now(),


  observacion text
);


-- =====================================================================
-- 2. ÍNDICES
-- =====================================================================

create index if not exists
idx_reserva_puesto
on public.reservas_puestos_actuales(
  puesto_id
);


create index if not exists
idx_reserva_vehiculo
on public.reservas_puestos_actuales(
  vehiculo_id
);


create index if not exists
idx_reserva_usuario
on public.reservas_puestos_actuales(
  usuario_id
);


-- =====================================================================
-- 3. RLS
-- =====================================================================

alter table
public.reservas_puestos_actuales
enable row level security;


revoke all
on public.reservas_puestos_actuales
from anon;


grant select
on public.reservas_puestos_actuales
to authenticated;


drop policy if exists
  "Usuarios autenticados leen reservas"
on public.reservas_puestos_actuales;


create policy
  "Usuarios autenticados leen reservas"

on public.reservas_puestos_actuales

for select

to authenticated

using (
  true
);


-- =====================================================================
-- 4. FUNCIÓN RESERVAR MI PUESTO
--
-- REGLAS:
--
-- - requiere sesión
-- - cuenta activa
-- - vehículo debe pertenecer al usuario
-- - vehículo debe estar autorizado
-- - un usuario solo tiene UNA reserva activa
-- - un vehículo solo puede reservar UN puesto
-- - un puesto solo puede estar reservado UNA vez
-- - no permite reservar un puesto actualmente asignado
-- =====================================================================

create or replace function
public.reservar_mi_puesto(

  p_puesto_id bigint,

  p_vehiculo_id bigint

)

returns void

language plpgsql

security definer

set search_path =
  public,
  auth

as $$

declare

  v_usuario_id uuid;

  v_activo boolean;

  v_usuario_reserva uuid;

begin

  -- ---------------------------------------------------------------
  -- SESIÓN
  -- ---------------------------------------------------------------

  v_usuario_id :=
    auth.uid();


  if
    v_usuario_id is null
  then

    raise exception
      'No existe una sesión autenticada.';

  end if;


  -- ---------------------------------------------------------------
  -- PERFIL ACTIVO
  -- ---------------------------------------------------------------

  select
    activo

  into
    v_activo

  from
    public.perfiles

  where
    usuario_id =
      v_usuario_id;


  if
    not found
  then

    raise exception
      'No existe un perfil asociado a tu cuenta.';

  end if;


  if
    not v_activo
  then

    raise exception
      'Tu cuenta se encuentra inactiva.';

  end if;


  -- ---------------------------------------------------------------
  -- PUESTO EXISTENTE
  -- ---------------------------------------------------------------

  if not exists (

    select 1

    from
      public.puestos

    where
      id =
        p_puesto_id

  )
  then

    raise exception
      'El puesto seleccionado no existe.';

  end if;


  -- ---------------------------------------------------------------
  -- VEHÍCULO PROPIO Y AUTORIZADO
  -- ---------------------------------------------------------------

  if not exists (

    select 1

    from
      public.vehiculos

    where
      id =
        p_vehiculo_id

    and
      usuario_id =
        v_usuario_id

    and
      autorizado =
        true

  )
  then

    raise exception
      'Solo puedes reservar utilizando uno de tus vehículos autorizados.';

  end if;


  -- ---------------------------------------------------------------
  -- NO PERMITIR SI YA EXISTE UNA OCUPACIÓN/ASIGNACIÓN ACTUAL
  -- ---------------------------------------------------------------

  if exists (

    select 1

    from
      public.ocupaciones_puestos_actuales

    where
      puesto_id =
        p_puesto_id

  )
  then

    raise exception
      'Este espacio ya tiene un vehículo asignado.';

  end if;


  -- ---------------------------------------------------------------
  -- COMPROBAR SI OTRO USUARIO YA RESERVÓ EL PUESTO
  -- ---------------------------------------------------------------

  select
    usuario_id

  into
    v_usuario_reserva

  from
    public.reservas_puestos_actuales

  where
    puesto_id =
      p_puesto_id;


  if
    found

    and

    v_usuario_reserva
      is distinct from
    v_usuario_id

  then

    raise exception
      'Este espacio acaba de ser reservado por otro usuario.';

  end if;


  -- ---------------------------------------------------------------
  -- SOLO UNA RESERVA POR CUENTA
  --
  -- Si cambia de espacio o de vehículo,
  -- liberamos la reserva anterior.
  -- ---------------------------------------------------------------

  delete from
    public.reservas_puestos_actuales

  where
    usuario_id =
      v_usuario_id;


  -- ---------------------------------------------------------------
  -- CREAR NUEVA RESERVA
  -- ---------------------------------------------------------------

  begin

    insert into
    public.reservas_puestos_actuales
    (
      puesto_id,

      vehiculo_id,

      usuario_id,

      fecha_reserva,

      observacion
    )

    values
    (
      p_puesto_id,

      p_vehiculo_id,

      v_usuario_id,

      now(),

      'Reserva realizada por el propietario'
    );


  exception

    when unique_violation then

      raise exception
        'El espacio o vehículo ya posee una reserva activa.';

  end;

end;

$$;


revoke all

on function
public.reservar_mi_puesto(
  bigint,
  bigint
)

from public;


grant execute

on function
public.reservar_mi_puesto(
  bigint,
  bigint
)

to authenticated;


-- =====================================================================
-- 5. CANCELAR / FINALIZAR MI RESERVA
--
-- Usuario:
--   solo puede eliminar SU reserva.
--
-- Admin:
--   puede liberar cualquier reserva.
-- =====================================================================

create or replace function
public.cancelar_mi_reserva(

  p_puesto_id bigint

)

returns void

language plpgsql

security definer

set search_path =
  public,
  auth

as $$

declare

  v_usuario_id uuid;

  v_total integer;

begin

  v_usuario_id :=
    auth.uid();


  if
    v_usuario_id is null
  then

    raise exception
      'No existe una sesión autenticada.';

  end if;


  if
    public.es_admin()
  then

    delete from
      public.reservas_puestos_actuales

    where
      puesto_id =
        p_puesto_id;

  else

    delete from
      public.reservas_puestos_actuales

    where
      puesto_id =
        p_puesto_id

    and
      usuario_id =
        v_usuario_id;

  end if;


  get diagnostics
    v_total =
      row_count;


  if
    v_total = 0
  then

    raise exception
      'No existe una reserva que puedas cancelar en este puesto.';

  end if;

end;

$$;


revoke all

on function
public.cancelar_mi_reserva(
  bigint
)

from public;


grant execute

on function
public.cancelar_mi_reserva(
  bigint
)

to authenticated;


-- =====================================================================
-- 6. REALTIME
--
-- Esto permite que si una persona reserva un espacio,
-- los demás usuarios vean inmediatamente el cambio.
-- =====================================================================

do $$

begin

  if not exists (

    select 1

    from
      pg_publication_tables

    where
      pubname =
        'supabase_realtime'

    and
      schemaname =
        'public'

    and
      tablename =
        'reservas_puestos_actuales'

  )
  then

    alter publication
      supabase_realtime

    add table
      public.reservas_puestos_actuales;

  end if;


  if not exists (

    select 1

    from
      pg_publication_tables

    where
      pubname =
        'supabase_realtime'

    and
      schemaname =
        'public'

    and
      tablename =
        'ocupaciones_puestos_actuales'

  )
  then

    alter publication
      supabase_realtime

    add table
      public.ocupaciones_puestos_actuales;

  end if;

end;

$$;


commit;


-- =====================================================================
-- 7. VERIFICACIÓN
-- =====================================================================

select
  *
from
  public.reservas_puestos_actuales

order by
  fecha_reserva desc;