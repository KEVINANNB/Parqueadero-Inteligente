import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  supabase,
} from '../lib/supabase'

import {
  useAuth,
} from '../context/AuthContext'


const COLUMNAS_MI_CUENTA = `
  id,
  usuario_id,
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
`


const COLUMNAS_PERFIL = `
  usuario_id,
  nombre,
  correo,
  cedula,
  foto_url,
  activo,
  created_at,
  updated_at
`


function enmascararCedula(
  cedula,
) {
  const texto =
    String(
      cedula || '',
    )
      .replace(
        /\D/g,
        '',
      )


  if (
    texto.length !== 10
  ) {
    return 'No registrada'
  }


  return (
    '******' +
    texto.slice(-4)
  )
}


export default function useMiCuenta() {
  const {
    usuario,
  } =
    useAuth()


  const [
    perfilDb,
    setPerfilDb,
  ] =
    useState(null)


  const [
    vehiculos,
    setVehiculos,
  ] =
    useState([])


  const [
    cargando,
    setCargando,
  ] =
    useState(true)


  const [
    error,
    setError,
  ] =
    useState('')


  /* =========================================================
     CARGAR PERFIL + VEHÍCULOS
     ========================================================= */

  const cargar =
    useCallback(
      async () => {

        if (
          !usuario?.id
        ) {
          setPerfilDb(null)

          setVehiculos([])

          setCargando(false)

          return
        }


        setCargando(true)

        setError('')


        /* =====================================================
           1. PERFIL
           ===================================================== */

        const {
          data:
            perfilData,

          error:
            errorPerfil,
        } =
          await supabase
            .from('perfiles')
            .select(
              COLUMNAS_PERFIL,
            )
            .eq(
              'usuario_id',
              usuario.id,
            )
            .maybeSingle()


        if (
          errorPerfil
        ) {
          console.error(
            'Error cargando perfil:',
            errorPerfil,
          )

          setError(
            errorPerfil.message,
          )
        }


        setPerfilDb(
          perfilData ??
          null,
        )


        /* =====================================================
           2. VINCULAR VEHÍCULOS ANTIGUOS POR CORREO
           ===================================================== */

        const {
          error:
            errorVinculacion,
        } =
          await supabase.rpc(
            'vincular_mis_vehiculos',
          )


        if (
          errorVinculacion
        ) {
          console.warn(
            'No se pudo ejecutar vinculación automática:',
            errorVinculacion,
          )
        }


        /* =====================================================
           3. MIS VEHÍCULOS
           ===================================================== */

        const {
          data:
            vehiculosData,

          error:
            errorVehiculos,
        } =
          await supabase
            .from('vehiculos')
            .select(
              COLUMNAS_MI_CUENTA,
            )
            .eq(
              'usuario_id',
              usuario.id,
            )
            .order(
              'id',
              {
                ascending:
                  true,
              },
            )


        if (
          errorVehiculos
        ) {
          console.error(
            'Error cargando vehículos:',
            errorVehiculos,
          )

          setVehiculos([])

          setError(
            errorVehiculos.message,
          )
        } else {
          setVehiculos(
            vehiculosData ??
            [],
          )
        }


        setCargando(false)

      },
      [
        usuario?.id,
      ],
    )


  useEffect(
    () => {
      cargar()
    },
    [
      cargar,
    ],
  )


  /* =========================================================
     PERFIL FINAL
     ========================================================= */

  const perfil =
    useMemo(
      () => {

        const nombreFallback =

          usuario
            ?.user_metadata
            ?.full_name

          ||

          usuario
            ?.user_metadata
            ?.name

          ||

          usuario
            ?.email
            ?.split('@')[0]

          ||

          'Usuario'


        const fotoFallback =

          usuario
            ?.user_metadata
            ?.avatar_url

          ||

          usuario
            ?.user_metadata
            ?.picture

          ||

          ''


        return {

          usuarioId:
            usuario?.id ||
            '',


          nombre:
            perfilDb
              ?.nombre
            ||
            nombreFallback,


          correo:
            perfilDb
              ?.correo
            ||
            usuario?.email
            ||
            '',


          correoCuenta:
            usuario?.email
            ||
            '',


          cedula:
            perfilDb
              ?.cedula
            ||
            '',


          cedulaEnmascarada:
            enmascararCedula(
              perfilDb?.cedula,
            ),


          foto:
            perfilDb
              ?.foto_url
            ||
            fotoFallback,


          activo:
            perfilDb
              ?.activo
            ??
            true,


          cantidadVehiculos:
            vehiculos.length,


          vinculado:
            vehiculos.length >
            0,


          existe:
            !!perfilDb,

        }

      },
      [
        perfilDb,
        usuario,
        vehiculos.length,
      ],
    )


  /* =========================================================
     ACTUALIZAR MI PERFIL
     ========================================================= */

  const actualizarPerfil =
    useCallback(
      async ({
        nombre,
        cedula,
        foto_url,
      }) => {

        if (
          !usuario?.id
        ) {
          return {
            ok: false,

            error:
              'No existe una sesión activa.',
          }
        }


        const nombreLimpio =
          String(
            nombre ||
            '',
          )
            .trim()


        const cedulaLimpia =
          String(
            cedula ||
            '',
          )
            .replace(
              /\D/g,
              '',
            )


        const fotoLimpia =
          String(
            foto_url ||
            '',
          )
            .trim()


        if (
          !nombreLimpio
        ) {
          return {
            ok: false,

            error:
              'Ingresa tu nombre completo.',
          }
        }


        if (
          cedulaLimpia &&
          !/^\d{10}$/.test(
            cedulaLimpia,
          )
        ) {
          return {
            ok: false,

            error:
              'La cédula debe contener exactamente 10 números.',
          }
        }


        const {
          data,
          error:
            errorSupabase,
        } =
          await supabase
            .from('perfiles')
            .update({
              nombre:
                nombreLimpio,

              cedula:
                cedulaLimpia ||
                null,

              foto_url:
                fotoLimpia ||
                null,
            })
            .eq(
              'usuario_id',
              usuario.id,
            )
            .select(
              COLUMNAS_PERFIL,
            )
            .single()


        if (
          errorSupabase
        ) {
          return {
            ok: false,

            error:
              errorSupabase.message,
          }
        }


        setPerfilDb(
          data,
        )


        await cargar()


        return {
          ok: true,

          data,
        }

      },
      [
        usuario?.id,
        cargar,
      ],
    )


  /* =========================================================
     CREAR MI VEHÍCULO
     ========================================================= */

  const crearMiVehiculo =
    useCallback(
      async (
        datos,
      ) => {

        if (
          !usuario?.id
        ) {
          return {
            ok: false,

            error:
              'No existe una sesión activa.',
          }
        }


        if (
          !perfilDb
        ) {
          return {
            ok: false,

            error:
              'No se pudo encontrar tu perfil.',
          }
        }


        if (
          !perfilDb.activo
        ) {
          return {
            ok: false,

            error:
              'Tu cuenta se encuentra inactiva.',
          }
        }


        if (
          !/^\d{10}$/.test(
            String(
              perfilDb.cedula ||
              '',
            ),
          )
        ) {
          return {
            ok: false,

            error:
              'Completa primero tu cédula en Mi perfil.',
          }
        }


        /*
         * NO mandamos:
         *
         * usuario_id
         * propietario
         * correo
         * cédula
         * autorizado
         *
         * El trigger SQL los asigna.
         */

        const payload = {

          placa:
            String(
              datos.placa ||
              '',
            )
              .trim()
              .toUpperCase(),


          marca:
            String(
              datos.marca ||
              '',
            )
              .trim(),


          modelo:
            String(
              datos.modelo ||
              '',
            )
              .trim(),


          anio:
            Number(
              datos.anio,
            ),


          color:
            String(
              datos.color ||
              '',
            )
              .trim(),


          tipo:
            datos.tipo ||
            'AUTOMOVIL',


          foto_url:
            String(
              datos.foto_url ||
              '',
            )
              .trim(),


          foto_fuente_url:
            String(
              datos.foto_url ||
              '',
            )
              .trim(),

        }


        const {
          data,
          error:
            errorSupabase,
        } =
          await supabase
            .from('vehiculos')
            .insert(
              payload,
            )
            .select(
              COLUMNAS_MI_CUENTA,
            )
            .single()


        if (
          errorSupabase
        ) {
          return {
            ok: false,

            error:
              errorSupabase.message,
          }
        }


        setVehiculos(
          (
            actuales,
          ) => [
            ...actuales,
            data,
          ],
        )


        return {
          ok: true,

          data,
        }

      },
      [
        usuario?.id,
        perfilDb,
      ],
    )


  /* =========================================================
     ACTUALIZAR MI VEHÍCULO
     ========================================================= */

  const actualizarMiVehiculo =
    useCallback(
      async (
        id,
        cambios,
      ) => {

        if (
          !usuario?.id
        ) {
          return {
            ok: false,

            error:
              'No existe una sesión activa.',
          }
        }


        /*
         * Solo enviamos campos permitidos.
         */

        const cambiosPermitidos = {

          marca:
            String(
              cambios.marca ||
              '',
            )
              .trim(),


          modelo:
            String(
              cambios.modelo ||
              '',
            )
              .trim(),


          color:
            String(
              cambios.color ||
              '',
            )
              .trim(),


          tipo:
            cambios.tipo ||
            'AUTOMOVIL',


          foto_url:
            String(
              cambios.foto_url ||
              '',
            )
              .trim(),

        }


        /*
         * Si el modal permite editar
         * fotografía del propietario,
         * la enviamos al PERFIL, no solamente
         * a un vehículo.
         */

        if (
          cambios
            .foto_propietario_url !==
          undefined
        ) {

          const nuevaFoto =
            String(
              cambios
                .foto_propietario_url ||
              '',
            )
              .trim()


          const {
            error:
              errorFoto,
          } =
            await supabase
              .from('perfiles')
              .update({
                foto_url:
                  nuevaFoto ||
                  null,
              })
              .eq(
                'usuario_id',
                usuario.id,
              )


          if (
            errorFoto
          ) {
            return {
              ok: false,

              error:
                errorFoto.message,
            }
          }

        }


        const {
          data,
          error:
            errorSupabase,
        } =
          await supabase
            .from('vehiculos')
            .update(
              cambiosPermitidos,
            )
            .eq(
              'id',
              id,
            )
            .eq(
              'usuario_id',
              usuario.id,
            )
            .select(
              COLUMNAS_MI_CUENTA,
            )
            .single()


        if (
          errorSupabase
        ) {
          return {
            ok: false,

            error:
              errorSupabase.message,
          }
        }


        setVehiculos(
          (
            actuales,
          ) =>
            actuales.map(
              (
                vehiculo,
              ) =>
                vehiculo.id ===
                id
                  ? data
                  : vehiculo,
            ),
        )


        await cargar()


        return {
          ok: true,

          data,
        }

      },
      [
        usuario?.id,
        cargar,
      ],
    )


  return {

    perfil,

    vehiculos,

    cargando,

    error,

    recargar:
      cargar,

    actualizarPerfil,

    crearMiVehiculo,

    actualizarMiVehiculo,

  }
}