-- ================================================================
-- UTEQ SMART PARKING
-- 005 - INTEGRACIÓN:
--
-- FIREBASE ESPACIOS
--        ↕
-- SUPABASE PUESTOS
--        ↕
-- VEHÍCULOS / PROPIETARIOS
--
-- OBJETIVO:
--
-- ESP-C01-01 -> A01 -> VEHÍCULO -> PROPIETARIO
--
-- No elimina registros históricos existentes.
-- ================================================================

begin;


-- ================================================================
-- 1. VERIFICAR QUE EXISTAN EXACTAMENTE 80 PUESTOS
-- ================================================================

do $$

declare
  total_puestos integer;

begin

  select count(*)
  into total_puestos
  from public.puestos;


  if total_puestos <> 80 then

    raise exception
      'Se esperaban 80 puestos en public.puestos, pero existen %.',
      total_puestos;

  end if;

end;

$$;


-- ================================================================
-- 2. AGREGAR CAMPOS DE INTEGRACIÓN A PUESTOS
--
-- No modificamos los campos originales.
-- Añadimos identificadores específicos para la unión con Firebase.
-- ================================================================

alter table public.puestos
add column if not exists
  codigo_integracion text;


alter table public.puestos
add column if not exists
  sensor_id_rtdb text;


alter table public.puestos
add column if not exists
  integracion_activa boolean
  not null
  default true;


-- ================================================================
-- 3. VINCULAR LOS 80 PUESTOS CON LOS 80 IDs DE FIREBASE
--
-- Firebase utiliza:
--
-- COLUMNA A
-- ESP-C01-01 ... ESP-C01-20
--
-- COLUMNA B
-- ESP-C02-01 ... ESP-C02-20
--
-- COLUMNA C
-- ESP-C03-01 ... ESP-C03-20
--
-- COLUMNA D
-- ESP-C04-01 ... ESP-C04-20
--
-- Código humano:
--
-- A01 ... A20
-- B01 ... B20
-- C01 ... C20
-- D01 ... D20
-- ================================================================

with puestos_numerados as (

  select

    id,

    row_number()
      over (
        order by id
      ) as posicion

  from public.puestos

)

update public.puestos as p

set

  codigo_integracion =

    chr(
      65 +
      (
        (
          n.posicion - 1
        ) / 20
      )::integer
    )

    ||

    lpad(
      (
        (
          (
            n.posicion - 1
          ) % 20
        ) + 1
      )::text,
      2,
      '0'
    ),


  sensor_id_rtdb =

    'ESP-C'

    ||

    lpad(
      (
        (
          (
            n.posicion - 1
          ) / 20
        ) + 1
      )::text,
      2,
      '0'
    )

    ||

    '-'

    ||

    lpad(
      (
        (
          (
            n.posicion - 1
          ) % 20
        ) + 1
      )::text,
      2,
      '0'
    )


from puestos_numerados as n

where
  p.id = n.id;


-- ================================================================
-- 4. ÍNDICES
-- ================================================================

create unique index if not exists
  uq_puestos_codigo_integracion

on public.puestos(
  codigo_integracion
);


create unique index if not exists
  uq_puestos_sensor_id_rtdb

on public.puestos(
  sensor_id_rtdb
);


-- ================================================================
-- 5. TABLA DE OCUPACIONES ACTUALES
--
-- IMPORTANTE:
--
-- Firebase responde:
--
--   ¿está ocupado físicamente?
--
-- Esta tabla responde:
--
--   ¿QUÉ vehículo está ocupando ese puesto?
--
-- Un puesto -> máximo un vehículo actual.
-- Un vehículo -> máximo un puesto actual.
-- ================================================================

create table if not exists
public.ocupaciones_puestos_actuales (

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


  fecha_asignacion timestamptz
  not null
  default now(),


  asignado_por uuid
  references auth.users(id)
  on delete set null,


  observacion text

);


create index if not exists
  idx_ocupaciones_puesto

on public.ocupaciones_puestos_actuales(
  puesto_id
);


create index if not exists
  idx_ocupaciones_vehiculo

on public.ocupaciones_puestos_actuales(
  vehiculo_id
);


-- ================================================================
-- 6. INTENTAR RECUPERAR REGISTROS ACTIVOS DE LA TABLA ORIGINAL
--
-- La base original posee registros_estacionamiento.
--
-- Como pueden existir diferentes versiones del SQL,
-- detectamos las columnas antes de migrar.
--
-- No borramos ni modificamos registros históricos.
-- ================================================================

do $$

declare

  tiene_puesto boolean;

  tiene_vehiculo boolean;

  tiene_fecha_salida boolean;

  tiene_estado boolean;

begin

  select exists (

    select 1
    from information_schema.columns

    where table_schema = 'public'

    and table_name =
      'registros_estacionamiento'

    and column_name =
      'puesto_id'

  )
  into tiene_puesto;


  select exists (

    select 1
    from information_schema.columns

    where table_schema = 'public'

    and table_name =
      'registros_estacionamiento'

    and column_name =
      'vehiculo_id'

  )
  into tiene_vehiculo;


  select exists (

    select 1
    from information_schema.columns

    where table_schema = 'public'

    and table_name =
      'registros_estacionamiento'

    and column_name =
      'fecha_salida'

  )
  into tiene_fecha_salida;


  select exists (

    select 1
    from information_schema.columns

    where table_schema = 'public'

    and table_name =
      'registros_estacionamiento'

    and column_name =
      'estado'

  )
  into tiene_estado;


  -- --------------------------------------------------------------
  -- Si existe fecha_salida:
  --
  -- fecha_salida NULL = vehículo todavía dentro.
  -- --------------------------------------------------------------

  if
    tiene_puesto
    and
    tiene_vehiculo
    and
    tiene_fecha_salida
  then

    execute '

      insert into
      public.ocupaciones_puestos_actuales
      (
        puesto_id,
        vehiculo_id,
        observacion
      )

      select
        puesto_id,
        vehiculo_id,
        ''Importado desde registros_estacionamiento''

      from public.registros_estacionamiento

      where fecha_salida is null

      and puesto_id is not null

      and vehiculo_id is not null

      on conflict do nothing

    ';


  -- --------------------------------------------------------------
  -- Si no hay fecha_salida pero existe estado:
  -- --------------------------------------------------------------

  elsif
    tiene_puesto
    and
    tiene_vehiculo
    and
    tiene_estado
  then

    execute '

      insert into
      public.ocupaciones_puestos_actuales
      (
        puesto_id,
        vehiculo_id,
        observacion
      )

      select
        puesto_id,
        vehiculo_id,
        ''Importado desde registros_estacionamiento''

      from public.registros_estacionamiento

      where
        upper(estado::text)
        in (
          ''ACTIVO'',
          ''OCUPADO'',
          ''ABIERTO''
        )

      and puesto_id is not null

      and vehiculo_id is not null

      on conflict do nothing

    ';

  end if;

end;

$$;


-- ================================================================
-- 7. RLS DE PUESTOS
-- ================================================================

alter table public.puestos
enable row level security;


drop policy if exists
  "Usuarios autenticados leen puestos"
on public.puestos;


create policy
  "Usuarios autenticados leen puestos"

on public.puestos

for select

to authenticated

using (
  true
);


grant select (
  id,
  codigo_integracion,
  sensor_id_rtdb,
  integracion_activa
)

on public.puestos

to authenticated;


-- ================================================================
-- 8. RLS OCUPACIONES
-- ================================================================

alter table
public.ocupaciones_puestos_actuales
enable row level security;


drop policy if exists
  "Usuarios autenticados leen ocupaciones"
on public.ocupaciones_puestos_actuales;


create policy
  "Usuarios autenticados leen ocupaciones"

on public.ocupaciones_puestos_actuales

for select

to authenticated

using (
  true
);


grant select
on public.ocupaciones_puestos_actuales
to authenticated;


-- ================================================================
-- 9. FUNCIÓN ADMIN:
-- ASIGNAR VEHÍCULO A PUESTO
--
-- Elimina previamente:
--
-- - cualquier vehículo del puesto
-- - cualquier puesto anterior del vehículo
--
-- Así nunca existen duplicados.
-- ================================================================

create or replace function
public.asignar_vehiculo_a_puesto(

  p_puesto_id bigint,

  p_vehiculo_id bigint

)

returns void

language plpgsql

security definer

set search_path = public

as $$

begin

  if not public.es_admin() then

    raise exception
      'Solo un administrador puede vincular vehículos con puestos.';

  end if;


  if not exists (

    select 1
    from public.puestos

    where id = p_puesto_id

  ) then

    raise exception
      'El puesto seleccionado no existe.';

  end if;


  if not exists (

    select 1
    from public.vehiculos

    where id = p_vehiculo_id

  ) then

    raise exception
      'El vehículo seleccionado no existe.';

  end if;


  -- --------------------------------------------------------------
  -- Un vehículo no puede ocupar dos espacios.
  -- --------------------------------------------------------------

  delete from
  public.ocupaciones_puestos_actuales

  where vehiculo_id =
    p_vehiculo_id;


  -- --------------------------------------------------------------
  -- Un puesto no puede tener dos vehículos.
  -- --------------------------------------------------------------

  delete from
  public.ocupaciones_puestos_actuales

  where puesto_id =
    p_puesto_id;


  insert into
  public.ocupaciones_puestos_actuales
  (
    puesto_id,
    vehiculo_id,
    fecha_asignacion,
    asignado_por
  )

  values
  (
    p_puesto_id,
    p_vehiculo_id,
    now(),
    auth.uid()
  );

end;

$$;


revoke all

on function
public.asignar_vehiculo_a_puesto(
  bigint,
  bigint
)

from public;


grant execute

on function
public.asignar_vehiculo_a_puesto(
  bigint,
  bigint
)

to authenticated;


-- ================================================================
-- 10. FUNCIÓN ADMIN:
-- LIBERAR VÍNCULO
--
-- Esto NO cambia Firebase.
--
-- Firebase sigue determinando físicamente si el sensor
-- está ocupado o libre.
--
-- Aquí solamente eliminamos la identidad del vehículo.
-- ================================================================

create or replace function
public.liberar_vinculo_puesto(

  p_puesto_id bigint

)

returns void

language plpgsql

security definer

set search_path = public

as $$

begin

  if not public.es_admin() then

    raise exception
      'Solo un administrador puede liberar vínculos de puestos.';

  end if;


  delete from
  public.ocupaciones_puestos_actuales

  where puesto_id =
    p_puesto_id;

end;

$$;


revoke all

on function
public.liberar_vinculo_puesto(
  bigint
)

from public;


grant execute

on function
public.liberar_vinculo_puesto(
  bigint
)

to authenticated;


commit;


-- ================================================================
-- 11. VERIFICAR LOS 80 PUESTOS
-- ================================================================

select

  id,

  codigo_integracion,

  sensor_id_rtdb,

  integracion_activa

from public.puestos

order by id;


-- ================================================================
-- 12. ESTADÍSTICAS
-- ================================================================

select

  count(*) as puestos_totales,

  count(sensor_id_rtdb)
    as puestos_con_sensor

from public.puestos;


-- ================================================================
-- 13. OCUPACIONES IDENTIFICADAS
-- ================================================================

select

  p.codigo_integracion as puesto,

  p.sensor_id_rtdb,

  v.placa,

  v.marca,

  v.modelo,

  v.propietario_nombre,

  o.fecha_asignacion

from public.ocupaciones_puestos_actuales o

join public.puestos p
  on p.id = o.puesto_id

join public.vehiculos v
  on v.id = o.vehiculo_id

order by
  p.codigo_integracion;