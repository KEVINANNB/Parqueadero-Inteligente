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


function enmascararCedula(
  cedula,
) {
  const texto =
    String(
      cedula ||
      '',
    )


  if (
    !/^\d{10}$/.test(
      texto,
    )
  ) {
    return 'No registrada'
  }


  return (
    '******' +
    texto.slice(-4)
  )
}


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
           PERFILES
           ===================================================== */

        const {
          data:
            perfilesData,

          error:
            errorPerfiles,
        } =
          await supabase
            .from('perfiles')
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
          setError(
            errorPerfiles.message,
          )

          setPerfiles([])

          setCargando(false)

          return
        }


        /* =====================================================
           VEHÍCULOS
           ===================================================== */

        const {
          data:
            vehiculosData,

          error:
            errorVehiculos,
        } =
          await supabase
            .from('vehiculos')
            .select(`
              id,
              usuario_id,
              placa,
              marca,
              modelo,
              autorizado
            `)
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
          setError(
            errorVehiculos.message,
          )

          setCargando(false)

          return
        }


        const vehiculos =
          vehiculosData ??
          []


        const combinado =
          (
            perfilesData ??
            []
          ).map(
            (
              perfil,
            ) => {

              const propios =
                vehiculos.filter(
                  (
                    vehiculo,
                  ) =>
                    vehiculo.usuario_id ===
                    perfil.usuario_id,
                )


              return {

                ...perfil,

                cedula_enmascarada:
                  enmascararCedula(
                    perfil.cedula,
                  ),

                vehiculos:
                  propios,

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
     ACTIVAR / DESACTIVAR CUENTA
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


        const {
          error:
            errorSupabase,
        } =
          await supabase
            .from('perfiles')
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