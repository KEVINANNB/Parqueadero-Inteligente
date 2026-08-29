-- =====================================================================
-- UTEQ SMART PARKING
-- 006 - PERFILES DE USUARIO + REGISTRO DE VEHÍCULOS POR USUARIO
--
-- EJECUTAR DESPUÉS DE:
--   002_crud_vehiculos_rls.sql
--   003_roles_admin_usuario.sql
--   004_vincular_cuentas_vehiculos.sql
--   005_conectar_puestos_vehiculos.sql
--
-- OBJETIVOS:
--
-- 1. Separar perfiles de vehículos.
-- 2. Crear perfil automáticamente por cada auth.users.
-- 3. Crear perfiles retroactivos para cuentas existentes.
-- 4. Permitir editar datos personales sin tener vehículo.
-- 5. Permitir que usuario normal registre vehículos.
-- 6. Nuevo vehículo de usuario = autorizado FALSE.
-- 7. Administrador sigue teniendo control total.
-- 8. Mantener usuario_id como vínculo real.
-- =====================================================================


begin;


-- =====================================================================
-- 1. TABLA DE PERFILES
-- =====================================================================

create table if not exists
  public.perfiles
(
  usuario_id uuid primary key,

  nombre text not null,

  correo text not null,

  cedula text,

  foto_url text,

  activo boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint perfiles_usuario_id_fkey

    foreign key (
      usuario_id
    )

    references
      auth.users(id)

    on update cascade

    on delete cascade,

  constraint perfiles_cedula_formato

    check (
      cedula is null

      or

      cedula ~ '^[0-9]{10}$'
    )
);


create index if not exists
  idx_perfiles_correo

on public.perfiles (
  lower(correo)
);


-- =====================================================================
-- 2. RLS
-- =====================================================================

alter table
  public.perfiles

enable row level security;


revoke all
on public.perfiles
from anon;


grant select
on public.perfiles
to authenticated;


grant update
on public.perfiles
to authenticated;


-- =====================================================================
-- 3. POLÍTICAS
--
-- USUARIO:
--   ve su propio perfil.
--
-- ADMIN:
--   ve todos.
-- =====================================================================

drop policy if exists
  "Usuario consulta su perfil"

on public.perfiles;


create policy
  "Usuario consulta su perfil"

on public.perfiles

for select

to authenticated

using (

  usuario_id =
    auth.uid()

  or

  public.es_admin()

);


-- =====================================================================
-- 4. UPDATE PERFIL
-- =====================================================================

drop policy if exists
  "Usuario actualiza su perfil"

on public.perfiles;


create policy
  "Usuario actualiza su perfil"

on public.perfiles

for update

to authenticated

using (

  usuario_id =
    auth.uid()

  or

  public.es_admin()

)

with check (

  usuario_id =
    auth.uid()

  or

  public.es_admin()

);


-- =====================================================================
-- 5. PROTEGER CAMPOS DEL PERFIL
--
-- Usuario normal:
--
-- PUEDE:
--   nombre
--   cedula
--   foto_url
--
-- NO PUEDE:
--   usuario_id
--   correo
--   activo
--   created_at
--
-- ADMIN:
--   puede administrar.
-- =====================================================================

create or replace function
  public.proteger_perfil_usuario()

returns trigger

language plpgsql

security invoker

set search_path =
  public

as $$

begin

  -- ---------------------------------------------------------------
  -- Normalización general.
  -- ---------------------------------------------------------------

  new.nombre :=
    upper(
      trim(
        new.nombre
      )
    );


  new.foto_url :=
    nullif(
      trim(
        coalesce(
          new.foto_url,
          ''
        )
      ),
      ''
    );


  new.cedula :=
    nullif(
      regexp_replace(
        coalesce(
          new.cedula,
          ''
        ),
        '\D',
        '',
        'g'
      ),
      ''
    );


  if
    new.cedula is not null

    and

    new.cedula !~
      '^[0-9]{10}$'

  then

    raise exception
      'La cédula debe contener exactamente 10 números.';

  end if;


  new.updated_at :=
    now();


  -- ---------------------------------------------------------------
  -- ADMIN
  -- ---------------------------------------------------------------

  if public.es_admin() then

    return new;

  end if;


  -- ---------------------------------------------------------------
  -- Debe ser dueño.
  -- ---------------------------------------------------------------

  if
    old.usuario_id
      is distinct from
    auth.uid()

  then

    raise exception
      'No tienes permiso para modificar este perfil.';

  end if;


  -- ---------------------------------------------------------------
  -- Campos protegidos.
  -- ---------------------------------------------------------------

  if

       new.usuario_id
         is distinct from
       old.usuario_id


    or


       new.correo
         is distinct from
       old.correo


    or


       new.activo
         is distinct from
       old.activo


    or


       new.created_at
         is distinct from
       old.created_at

  then

    raise exception
      'No puedes modificar campos administrativos de tu cuenta.';

  end if;


  return new;

end;

$$;


drop trigger if exists
  trg_proteger_perfil_usuario

on public.perfiles;


create trigger
  trg_proteger_perfil_usuario

before update

on public.perfiles

for each row

execute function
  public.proteger_perfil_usuario();


-- =====================================================================
-- 6. CREAR PERFIL AUTOMÁTICAMENTE AL REGISTRARSE
-- =====================================================================

create or replace function
  public.crear_perfil_nuevo_usuario()

returns trigger

language plpgsql

security definer

set search_path =
  public,
  auth

as $$

declare

  nombre_inicial text;

  foto_inicial text;

begin

  nombre_inicial :=

    coalesce(

      nullif(
        new.raw_user_meta_data
          ->> 'full_name',
        ''
      ),

      nullif(
        new.raw_user_meta_data
          ->> 'name',
        ''
      ),

      split_part(
        coalesce(
          new.email,
          'usuario'
        ),
        '@',
        1
      )

    );


  foto_inicial :=

    coalesce(

      nullif(
        new.raw_user_meta_data
          ->> 'avatar_url',
        ''
      ),

      nullif(
        new.raw_user_meta_data
          ->> 'picture',
        ''
      )

    );


  insert into
    public.perfiles
    (
      usuario_id,
      nombre,
      correo,
      foto_url,
      activo
    )

  values
    (
      new.id,

      upper(
        trim(
          nombre_inicial
        )
      ),

      lower(
        trim(
          coalesce(
            new.email,
            ''
          )
        )
      ),

      foto_inicial,

      true
    )

  on conflict (
    usuario_id
  )

  do nothing;


  return new;

end;

$$;


drop trigger if exists
  on_auth_user_created_smartparking

on auth.users;


create trigger
  on_auth_user_created_smartparking

after insert

on auth.users

for each row

execute function
  public.crear_perfil_nuevo_usuario();


-- =====================================================================
-- 7. CREAR PERFILES PARA CUENTAS QUE YA EXISTEN
--
-- Intenta recuperar nombre, cédula y foto desde vehiculos.
-- Si no existe vehículo, usa metadata de Supabase / Google.
-- =====================================================================

insert into
  public.perfiles
  (
    usuario_id,
    nombre,
    correo,
    cedula,
    foto_url,
    activo
  )

select

  u.id,


  upper(
    trim(
      coalesce(

        nullif(
          v.propietario_nombre,
          ''
        ),

        nullif(
          u.raw_user_meta_data
            ->> 'full_name',
          ''
        ),

        nullif(
          u.raw_user_meta_data
            ->> 'name',
          ''
        ),

        split_part(
          u.email,
          '@',
          1
        )

      )
    )
  )
  as nombre,


  lower(
    trim(
      u.email
    )
  )
  as correo,


  nullif(
    v.cedula_propietario,
    ''
  )
  as cedula,


  coalesce(

    nullif(
      v.foto_propietario_url,
      ''
    ),

    nullif(
      u.raw_user_meta_data
        ->> 'avatar_url',
      ''
    ),

    nullif(
      u.raw_user_meta_data
        ->> 'picture',
      ''
    )

  )
  as foto_url,


  true


from
  auth.users as u


left join lateral
(

  select

    vv.propietario_nombre,

    vv.cedula_propietario,

    vv.foto_propietario_url

  from
    public.vehiculos as vv

  where

    vv.usuario_id =
      u.id

    or

    lower(
      trim(
        vv.correo_institucional
      )
    )
      =
    lower(
      trim(
        u.email
      )
    )

    or

    lower(
      trim(
        coalesce(
          vv.correo_microsoft,
          ''
        )
      )
    )
      =
    lower(
      trim(
        u.email
      )
    )

  order by

    case
      when
        vv.usuario_id =
          u.id
      then 0
      else 1
    end,

    vv.id

  limit 1

) as v

on true


where
  u.email is not null


on conflict (
  usuario_id
)

do nothing;


-- =====================================================================
-- 8. VOLVER A VINCULAR VEHÍCULOS ANTIGUOS
-- =====================================================================

update
  public.vehiculos as v

set
  usuario_id =
    p.usuario_id

from
  public.perfiles as p

where

  v.usuario_id
    is null

  and

  (

    lower(
      trim(
        v.correo_institucional
      )
    )
      =
    lower(
      trim(
        p.correo
      )
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
      trim(
        p.correo
      )
    )

  );


-- =====================================================================
-- 9. PERMITIR INSERT DE VEHÍCULOS A USUARIO NORMAL
--
-- IMPORTANTE:
-- el BEFORE INSERT posterior asignará:
--
--   usuario_id = auth.uid()
--   autorizado = false
--   propietario = perfil
--
-- =====================================================================

drop policy if exists
  "Usuario registra su vehiculo"

on public.vehiculos;


create policy
  "Usuario registra su vehiculo"

on public.vehiculos

for insert

to authenticated

with check (

  usuario_id =
    auth.uid()

  and

  autorizado = false

);


-- La política del administrador que ya existe se mantiene:
--
-- "Admin inserta vehiculos"
--
-- Las políticas INSERT se combinan con OR.


-- =====================================================================
-- 10. PREPARAR VEHÍCULO AL INSERTAR
--
-- ADMIN:
--   mantiene funcionamiento administrativo.
--
-- USUARIO:
--   no puede adjudicar auto a otra persona.
--   no puede auto-autorizarse.
-- =====================================================================

create or replace function
  public.preparar_nuevo_vehiculo()

returns trigger

language plpgsql

security definer

set search_path =
  public,
  auth

as $$

declare

  perfil_actual
    public.perfiles%rowtype;

  id_encontrado
    uuid;

begin

  -- ---------------------------------------------------------------
  -- ADMINISTRADOR
  -- ---------------------------------------------------------------

  if public.es_admin() then

    if
      new.usuario_id
        is null

    then

      select
        u.id

      into
        id_encontrado

      from
        auth.users as u

      where

        lower(
          trim(
            u.email
          )
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
          trim(
            u.email
          )
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

      limit 1;


      new.usuario_id :=
        id_encontrado;

    end if;


    return new;

  end if;


  -- ---------------------------------------------------------------
  -- USUARIO NORMAL
  -- ---------------------------------------------------------------

  if auth.uid() is null then

    raise exception
      'No existe una sesión autenticada.';

  end if;


  select
    *

  into
    perfil_actual

  from
    public.perfiles

  where
    usuario_id =
      auth.uid();


  if not found then

    raise exception
      'No existe un perfil asociado a tu cuenta.';

  end if;


  if not perfil_actual.activo then

    raise exception
      'Tu cuenta se encuentra inactiva.';

  end if;


  if
    perfil_actual.cedula
      is null

    or

    perfil_actual.cedula
      !~ '^[0-9]{10}$'

  then

    raise exception
      'Completa primero tu cédula en Mi perfil antes de registrar un vehículo.';

  end if;


  -- ---------------------------------------------------------------
  -- Datos que el usuario NO puede falsificar.
  -- ---------------------------------------------------------------

  new.usuario_id :=
    auth.uid();


  new.propietario_nombre :=
    perfil_actual.nombre;


  new.correo_institucional :=
    perfil_actual.correo;


  new.cedula_propietario :=
    perfil_actual.cedula;


  new.foto_propietario_url :=
    coalesce(
      perfil_actual.foto_url,
      ''
    );


  new.autorizado :=
    false;


  new.foto_fuente_url :=

    coalesce(

      nullif(
        new.foto_fuente_url,
        ''
      ),

      new.foto_url

    );


  return new;

end;

$$;


-- El trigger antiguo de 004 ya no debe controlar INSERT.

drop trigger if exists
  trg_vincular_usuario_insert

on public.vehiculos;


drop trigger if exists
  trg_preparar_nuevo_vehiculo

on public.vehiculos;


create trigger
  trg_preparar_nuevo_vehiculo

before insert

on public.vehiculos

for each row

execute function
  public.preparar_nuevo_vehiculo();


-- =====================================================================
-- 11. NUEVA PROTECCIÓN DE UPDATE DE VEHÍCULO
--
-- Mantiene lo creado en 004, pero permite sincronizar la cédula
-- cuando el usuario la cambió correctamente desde su perfil.
-- =====================================================================

create or replace function
  public.proteger_campos_vehiculo_usuario()

returns trigger

language plpgsql

security invoker

set search_path =
  public

as $$

declare

  correo_actual
    text;

  correo_coincide
    boolean;

  cedula_perfil
    text;

begin

  -- ---------------------------------------------------------------
  -- ADMIN
  -- ---------------------------------------------------------------

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
        trim(
          old.correo_institucional
        )
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


  -- ---------------------------------------------------------------
  -- PRIMERA VINCULACIÓN DE REGISTROS ANTIGUOS.
  -- ---------------------------------------------------------------

  if

    old.usuario_id
      is null

    and

    new.usuario_id =
      auth.uid()

    and

    correo_coincide

  then

    return new;

  end if;


  -- ---------------------------------------------------------------
  -- DEBE SER PROPIETARIO.
  -- ---------------------------------------------------------------

  if

    old.usuario_id
      is distinct from
    auth.uid()

  then

    raise exception
      'No tienes permiso para editar este vehículo.';

  end if;


  -- ---------------------------------------------------------------
  -- CÉDULA ACTUAL DEL PERFIL.
  -- ---------------------------------------------------------------

  select
    cedula

  into
    cedula_perfil

  from
    public.perfiles

  where
    usuario_id =
      auth.uid();


  -- ---------------------------------------------------------------
  -- CAMPOS COMPLETAMENTE PROTEGIDOS.
  -- ---------------------------------------------------------------

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


  -- ---------------------------------------------------------------
  -- CÉDULA:
  -- solo puede cambiar si coincide con SU perfil.
  -- ---------------------------------------------------------------

  if

    new.cedula_propietario
      is distinct from
    old.cedula_propietario

    and

    new.cedula_propietario
      is distinct from
    cedula_perfil

  then

    raise exception
      'La cédula del vehículo debe coincidir con tu perfil.';

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


-- =====================================================================
-- 12. SINCRONIZAR PERFIL -> VEHÍCULOS
--
-- Si el usuario cambia:
--
-- nombre
-- cédula
-- fotografía
--
-- todos sus vehículos reflejan los datos nuevos.
-- =====================================================================

create or replace function
  public.sincronizar_perfil_con_vehiculos()

returns trigger

language plpgsql

security definer

set search_path =
  public

as $$

begin

  update
    public.vehiculos

  set

    propietario_nombre =
      new.nombre,


    foto_propietario_url =
      coalesce(
        new.foto_url,
        ''
      ),


    cedula_propietario =
      coalesce(
        new.cedula,
        cedula_propietario
      )

  where

    usuario_id =
      new.usuario_id;


  return new;

end;

$$;


drop trigger if exists
  trg_sincronizar_perfil_vehiculos

on public.perfiles;


create trigger
  trg_sincronizar_perfil_vehiculos

after update
of
  nombre,
  cedula,
  foto_url

on public.perfiles

for each row

execute function
  public.sincronizar_perfil_con_vehiculos();


commit;


-- =====================================================================
-- 13. VERIFICACIONES
-- =====================================================================


-- Todas las cuentas deben aparecer aquí.

select

  p.usuario_id,

  p.nombre,

  p.correo,

  p.cedula,

  p.activo,

  count(v.id)
    as vehiculos

from
  public.perfiles p

left join
  public.vehiculos v

on
  v.usuario_id =
    p.usuario_id

group by

  p.usuario_id,

  p.nombre,

  p.correo,

  p.cedula,

  p.activo

order by
  p.nombre;


-- Políticas de vehículos.

select

  polname,

  polcmd

from
  pg_policy

where
  polrelid =
    'public.vehiculos'::regclass

order by
  polname;


-- Políticas de perfiles.

select

  polname,

  polcmd

from
  pg_policy

where
  polrelid =
    'public.perfiles'::regclass

order by
  polname;