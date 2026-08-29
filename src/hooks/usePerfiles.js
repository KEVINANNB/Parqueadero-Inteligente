import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  supabase,
} from '../lib/supabase'

import {
  useAuth,
} from '../context/AuthContext'


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


const COLUMNAS_VEHICULO = `
  id,
  usuario_id,
  placa,
  marca,
  modelo,
  foto_propietario_url,
  cedula_enmascarada,
  propietario_nombre,
  correo_institucional,
  autorizado
`


/* ================================================================
   HELPERS
   ================================================================ */

function normalizarTexto(
  valor,
) {
  return String(
    valor || '',
  )
    .trim()
    .toLowerCase()
}


function normalizarCorreo(
  valor,
) {
  return normalizarTexto(
    valor,
  )
}


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


/*
 * Crea una llave estable para un
 * propietario histórico que todavía
 * no tenga cuenta.
 */

function crearLlaveHistorica(
  vehiculo,
) {
  const correo =
    normalizarCorreo(
      vehiculo
        .correo_institucional,
    )


  if (
    correo
  ) {
    return (
      `correo:${correo}`
    )
  }


  const cedula =
    normalizarTexto(
      vehiculo
        .cedula_enmascarada,
    )


  if (
    cedula &&
    cedula !==
      'no registrada'
  ) {
    return (
      `cedula:${cedula}`
    )
  }


  const nombre =
    normalizarTexto(
      vehiculo
        .propietario_nombre,
    )


  return (
    `nombre:${nombre || vehiculo.id}`
  )
}


/* ================================================================
   HOOK
   ================================================================ */

export default function usePerfiles() {
  const {
    puedeAdministrar,
  } =
    useAuth()


  const [
    perfiles,
    setPerfiles,
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


  /* ==============================================================
     CARGAR
     ============================================================== */

  const cargar =
    useCallback(
      async () => {

        if (
          !puedeAdministrar
        ) {
          setPerfiles([])

          setCargando(false)

          return
        }


        setCargando(true)

        setError('')


        /* =====================================================
           1. CUENTAS / PERFILES REALES
           ===================================================== */

        const {
          data:
            perfilesData,

          error:
            errorPerfiles,
        } =
          await supabase
            .from(
              'perfiles',
            )
            .select(
              COLUMNAS_PERFIL,
            )
            .order(
              'nombre',
              {
                ascending:
                  true,
              },
            )


        if (
          errorPerfiles
        ) {
          console.error(
            'Error cargando perfiles:',
            errorPerfiles,
          )

          setError(
            errorPerfiles.message,
          )

          setPerfiles([])

          setCargando(false)

          return
        }


        /* =====================================================
           2. VEHÍCULOS Y PROPIETARIOS HISTÓRICOS
           ===================================================== */

        const {
          data:
            vehiculosData,

          error:
            errorVehiculos,
        } =
          await supabase
            .from(
              'vehiculos',
            )
            .select(
              COLUMNAS_VEHICULO,
            )
            .order(
              'propietario_nombre',
              {
                ascending:
                  true,
              },
            )


        if (
          errorVehiculos
        ) {
          console.error(
            'Error cargando vehículos para propietarios:',
            errorVehiculos,
          )

          setError(
            errorVehiculos.message,
          )

          setPerfiles([])

          setCargando(false)

          return
        }


        const cuentas =
          perfilesData ??
          []


        const vehiculos =
          vehiculosData ??
          []


        /* =====================================================
           3. ÍNDICES DE CUENTAS
           ===================================================== */

        const perfilesPorId =
          new Map()


        const perfilesPorCorreo =
          new Map()


        cuentas.forEach(
          (
            perfil,
          ) => {

            perfilesPorId.set(
              perfil.usuario_id,
              perfil,
            )


            const correo =
              normalizarCorreo(
                perfil.correo,
              )


            if (
              correo
            ) {
              perfilesPorCorreo.set(
                correo,
                perfil,
              )
            }

          },
        )


        /* =====================================================
           4. MAPA FINAL DE PROPIETARIOS
           ===================================================== */

        const mapa =
          new Map()


        /*
         * Primero insertamos todas las cuentas.
         *
         * Así una persona recién registrada
         * aparece aunque tenga 0 vehículos.
         */

        cuentas.forEach(
          (
            perfil,
          ) => {

            mapa.set(
              `perfil:${perfil.usuario_id}`,
              {

                usuario_id:
                  perfil.usuario_id,

                nombre:
                  perfil.nombre ||
                  'Sin nombre',

                correo:
                  perfil.correo ||
                  '',

                cedula:
                  perfil.cedula ||
                  '',

                cedula_enmascarada:
                  enmascararCedula(
                    perfil.cedula,
                  ),

                foto_url:
                  perfil.foto_url ||
                  '',

                activo:
                  perfil.activo,

                created_at:
                  perfil.created_at,

                updated_at:
                  perfil.updated_at,

                tieneCuenta:
                  true,

                origen:
                  'perfil',

                vehiculos:
                  [],

                cantidadVehiculos:
                  0,

                pendientes:
                  0,

              },
            )

          },
        )


        /* =====================================================
           5. AGREGAR VEHÍCULOS
           ===================================================== */

        vehiculos.forEach(
          (
            vehiculo,
          ) => {

            let perfilRelacionado =
              null


            /* -------------------------------------------------
               Primero intentamos usuario_id.
               ------------------------------------------------- */

            if (
              vehiculo.usuario_id
            ) {
              perfilRelacionado =
                perfilesPorId.get(
                  vehiculo.usuario_id,
                ) ||
                null
            }


            /* -------------------------------------------------
               Si no hay usuario_id, intentamos correo.
               ------------------------------------------------- */

            if (
              !perfilRelacionado
            ) {
              const correoVehiculo =
                normalizarCorreo(
                  vehiculo
                    .correo_institucional,
                )


              if (
                correoVehiculo
              ) {
                perfilRelacionado =
                  perfilesPorCorreo.get(
                    correoVehiculo,
                  ) ||
                  null
              }
            }


            /* =================================================
               VEHÍCULO PERTENECE A CUENTA REAL
               ================================================= */

            if (
              perfilRelacionado
            ) {
              const llave =
                `perfil:${perfilRelacionado.usuario_id}`


              const propietario =
                mapa.get(
                  llave,
                )


              if (
                propietario
              ) {
                propietario.vehiculos.push({
                  id:
                    vehiculo.id,

                  placa:
                    vehiculo.placa,

                  marca:
                    vehiculo.marca,

                  modelo:
                    vehiculo.modelo,

                  autorizado:
                    Boolean(
                      vehiculo.autorizado,
                    ),
                })


                /*
                 * Si el perfil todavía no tiene
                 * fotografía, usamos temporalmente
                 * la histórica.
                 */

                if (
                  !propietario.foto_url &&
                  vehiculo
                    .foto_propietario_url
                ) {
                  propietario.foto_url =
                    vehiculo
                      .foto_propietario_url
                }


                /*
                 * Si el perfil no tiene cédula,
                 * podemos mostrar la enmascarada
                 * del vehículo.
                 */

                if (
                  !propietario.cedula &&
                  vehiculo
                    .cedula_enmascarada
                ) {
                  propietario.cedula_enmascarada =
                    vehiculo
                      .cedula_enmascarada
                }
              }


              return
            }


            /* =================================================
               PROPIETARIO HISTÓRICO SIN CUENTA
               ================================================= */

            const llaveHistorica =
              crearLlaveHistorica(
                vehiculo,
              )


            if (
              !mapa.has(
                llaveHistorica,
              )
            ) {
              mapa.set(
                llaveHistorica,
                {

                  usuario_id:
                    null,

                  nombre:
                    vehiculo
                      .propietario_nombre
                    ||
                    'Propietario sin nombre',

                  correo:
                    vehiculo
                      .correo_institucional
                    ||
                    '',

                  cedula:
                    '',

                  cedula_enmascarada:
                    vehiculo
                      .cedula_enmascarada
                    ||
                    'No registrada',

                  foto_url:
                    vehiculo
                      .foto_propietario_url
                    ||
                    '',

                  activo:
                    null,

                  created_at:
                    null,

                  updated_at:
                    null,

                  tieneCuenta:
                    false,

                  origen:
                    'vehiculo',

                  vehiculos:
                    [],

                  cantidadVehiculos:
                    0,

                  pendientes:
                    0,

                },
              )
            }


            const propietarioHistorico =
              mapa.get(
                llaveHistorica,
              )


            propietarioHistorico
              .vehiculos
              .push({
                id:
                  vehiculo.id,

                placa:
                  vehiculo.placa,

                marca:
                  vehiculo.marca,

                modelo:
                  vehiculo.modelo,

                autorizado:
                  Boolean(
                    vehiculo.autorizado,
                  ),
              })

          },
        )


        /* =====================================================
           6. CALCULAR ESTADÍSTICAS POR PROPIETARIO
           ===================================================== */

        const combinado =
          Array.from(
            mapa.values(),
          )
            .map(
              (
                propietario,
              ) => {

                const propios =
                  propietario
                    .vehiculos


                return {

                  ...propietario,

                  cantidadVehiculos:
                    propios.length,


                  pendientes:
                    propios.filter(
                      (
                        vehiculo,
                      ) =>
                        !vehiculo.autorizado,
                    ).length,

                }

              },
            )
            .sort(
              (
                a,
                b,
              ) =>
                String(
                  a.nombre ||
                  '',
                )
                  .localeCompare(
                    String(
                      b.nombre ||
                      '',
                    ),
                    'es',
                    {
                      sensitivity:
                        'base',
                    },
                  ),
            )


        setPerfiles(
          combinado,
        )


        setCargando(false)

      },
      [
        puedeAdministrar,
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
     ACTIVAR / DESACTIVAR CUENTA REAL
     ========================================================= */

  const cambiarActivo =
    useCallback(
      async (
        usuarioId,
        activo,
      ) => {

        if (
          !puedeAdministrar
        ) {
          return {
            ok: false,

            error:
              'No tienes permisos de administrador.',
          }
        }


        if (
          !usuarioId
        ) {
          return {
            ok: false,

            error:
              'Este propietario no tiene una cuenta registrada.',
          }
        }


        const {
          error:
            errorSupabase,
        } =
          await supabase
            .from(
              'perfiles',
            )
            .update({
              activo,
            })
            .eq(
              'usuario_id',
              usuarioId,
            )


        if (
          errorSupabase
        ) {
          return {
            ok: false,

            error:
              errorSupabase.message,
          }
        }


        await cargar()


        return {
          ok: true,
        }

      },
      [
        puedeAdministrar,
        cargar,
      ],
    )


  return {

    perfiles,

    cargando,

    error,

    recargar:
      cargar,

    cambiarActivo,

  }
}