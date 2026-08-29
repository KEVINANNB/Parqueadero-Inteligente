-- =====================================================================
-- UTEQ SMART PARKING
-- 008 - HISTORIAL DE RESERVAS DE PUESTOS
--
-- Registra automáticamente:
--
-- RESERVA CREADA
-- RESERVA CANCELADA
--
-- sin modificar el historial físico de Firebase.
-- =====================================================================

begin;


-- =====================================================================
-- 1. TABLA DE HISTORIAL
-- =====================================================================

create table if not exists
public.historial_reservas_puestos
(
  id bigserial
  primary key,


  reserva_id bigint
  not null,


  puesto_id bigint,


  sensor_id_rtdb text,


  codigo_puesto text,


  vehiculo_id bigint,


  usuario_id uuid,


  tipo_evento text
  not null
  check (
    tipo_evento in (
      'reserva_creada',
      'reserva_cancelada'
    )
  ),


  fecha_evento timestamptz
  not null
  default now(),


  placa text,


  marca text,


  modelo text,


  propietario_nombre text,


  observacion text
);


-- =====================================================================
-- 2. EVITAR DUPLICADOS
-- =====================================================================

create unique index if not exists
uq_historial_reserva_evento

on public.historial_reservas_puestos
(
  reserva_id,
  tipo_evento
);


create index if not exists
idx_historial_reserva_sensor

on public.historial_reservas_puestos
(
  sensor_id_rtdb
);


create index if not exists
idx_historial_reserva_puesto

on public.historial_reservas_puestos
(
  puesto_id
);


create index if not exists
idx_historial_reserva_usuario

on public.historial_reservas_puestos
(
  usuario_id
);


-- =====================================================================
-- 3. RLS
-- =====================================================================

alter table
public.historial_reservas_puestos
enable row level security;


grant select
on public.historial_reservas_puestos
to authenticated;


drop policy if exists
  "Usuarios autenticados leen historial reservas"
on public.historial_reservas_puestos;


create policy
  "Usuarios autenticados leen historial reservas"

on public.historial_reservas_puestos

for select

to authenticated

using (
  true
);


-- =====================================================================
-- 4. FUNCIÓN DEL TRIGGER
-- =====================================================================

create or replace function
public.registrar_historial_reserva()

returns trigger

language plpgsql

security definer

set search_path = public

as $$

declare

  v_reserva_id bigint;

  v_puesto_id bigint;

  v_vehiculo_id bigint;

  v_usuario_id uuid;

  v_fecha timestamptz;

  v_sensor text;

  v_codigo text;

  v_placa text;

  v_marca text;

  v_modelo text;

  v_propietario text;

  v_tipo text;

begin

  -- ===============================================================
  -- RESERVA CREADA
  -- ===============================================================

  if TG_OP = 'INSERT' then

    v_reserva_id :=
      NEW.id;

    v_puesto_id :=
      NEW.puesto_id;

    v_vehiculo_id :=
      NEW.vehiculo_id;

    v_usuario_id :=
      NEW.usuario_id;

    v_fecha :=
      NEW.fecha_reserva;

    v_tipo :=
      'reserva_creada';


  -- ===============================================================
  -- RESERVA ELIMINADA
  -- ===============================================================

  elsif TG_OP = 'DELETE' then

    v_reserva_id :=
      OLD.id;

    v_puesto_id :=
      OLD.puesto_id;

    v_vehiculo_id :=
      OLD.vehiculo_id;

    v_usuario_id :=
      OLD.usuario_id;

    v_fecha :=
      now();

    v_tipo :=
      'reserva_cancelada';

  else

    return null;

  end if;


  -- ===============================================================
  -- DATOS DEL PUESTO
  -- ===============================================================

  select

    sensor_id_rtdb,

    codigo_integracion

  into

    v_sensor,

    v_codigo

  from
    public.puestos

  where
    id =
      v_puesto_id;


  -- ===============================================================
  -- DATOS DEL VEHÍCULO
  -- ===============================================================

  select

    placa,

    marca,

    modelo,

    propietario_nombre

  into

    v_placa,

    v_marca,

    v_modelo,

    v_propietario

  from
    public.vehiculos

  where
    id =
      v_vehiculo_id;


  -- ===============================================================
  -- GUARDAR EVENTO
  -- ===============================================================

  insert into
  public.historial_reservas_puestos
  (
    reserva_id,

    puesto_id,

    sensor_id_rtdb,

    codigo_puesto,

    vehiculo_id,

    usuario_id,

    tipo_evento,

    fecha_evento,

    placa,

    marca,

    modelo,

    propietario_nombre,

    observacion
  )

  values
  (
    v_reserva_id,

    v_puesto_id,

    v_sensor,

    v_codigo,

    v_vehiculo_id,

    v_usuario_id,

    v_tipo,

    v_fecha,

    v_placa,

    v_marca,

    v_modelo,

    v_propietario,

    case

      when v_tipo =
        'reserva_creada'

      then
        'Espacio reservado por el propietario'

      else
        'Reserva liberada'

    end
  )

  on conflict (
    reserva_id,
    tipo_evento
  )

  do nothing;


  if TG_OP = 'INSERT' then

    return NEW;

  end if;


  return OLD;

end;

$$;


-- =====================================================================
-- 5. TRIGGER
-- =====================================================================

drop trigger if exists
trg_historial_reserva_puesto

on public.reservas_puestos_actuales;


create trigger
trg_historial_reserva_puesto

after insert or delete

on public.reservas_puestos_actuales

for each row

execute function
public.registrar_historial_reserva();


-- =====================================================================
-- 6. RECUPERAR RESERVAS QUE YA EXISTEN
--
-- Por ejemplo B06, que ya reservaste antes de crear este historial.
-- =====================================================================

insert into
public.historial_reservas_puestos
(
  reserva_id,

  puesto_id,

  sensor_id_rtdb,

  codigo_puesto,

  vehiculo_id,

  usuario_id,

  tipo_evento,

  fecha_evento,

  placa,

  marca,

  modelo,

  propietario_nombre,

  observacion
)

select

  r.id,

  r.puesto_id,

  p.sensor_id_rtdb,

  p.codigo_integracion,

  r.vehiculo_id,

  r.usuario_id,

  'reserva_creada',

  r.fecha_reserva,

  v.placa,

  v.marca,

  v.modelo,

  v.propietario_nombre,

  'Reserva existente incorporada al historial'

from
  public.reservas_puestos_actuales r

join
  public.puestos p

on
  p.id =
    r.puesto_id

join
  public.vehiculos v

on
  v.id =
    r.vehiculo_id

on conflict (
  reserva_id,
  tipo_evento
)

do nothing;


-- =====================================================================
-- 7. REALTIME
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
        'historial_reservas_puestos'

  )
  then

    alter publication
      supabase_realtime

    add table
      public.historial_reservas_puestos;

  end if;

end;

$$;


commit;


-- =====================================================================
-- 8. VERIFICACIÓN
-- =====================================================================

select

  codigo_puesto,

  tipo_evento,

  placa,

  marca,

  modelo,

  propietario_nombre,

  fecha_evento

from
  public.historial_reservas_puestos

order by
  fecha_evento desc;