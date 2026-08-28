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


export default function useMiCuenta() {
  const {
    usuario,
  } = useAuth()


  const [
    vehiculos,
    setVehiculos,
  ] = useState([])


  const [
    cargando,
    setCargando,
  ] = useState(true)


  const [
    error,
    setError,
  ] = useState('')


  /*
   * =============================================================
   * CARGAR MIS VEHÍCULOS
   * =============================================================
   *
   * 1. Comprueba que exista sesión.
   * 2. Intenta vincular por correo si usuario_id todavía es NULL.
   * 3. Consulta únicamente:
   *
   *      usuario_id = auth.uid()
   *
   * De esta forma ya no dependemos del correo para todas
   * las operaciones.
   */
  const cargar =
    useCallback(async () => {

      if (!usuario?.id) {

        setVehiculos([])

        setCargando(false)

        return

      }


      setCargando(true)

      setError('')


      /*
       * ---------------------------------------------------------
       * Vinculación automática.
       *
       * Si el registro antiguo tiene:
       *
       * usuario_id = NULL
       *
       * la función buscará:
       *
       * correo institucional
       *
       * o:
       *
       * correo Microsoft
       *
       * y asignará el UUID.
       * ---------------------------------------------------------
       */

      const {
        error:
          errorVinculacion,
      } =
        await supabase.rpc(
          'vincular_mis_vehiculos',
        )


      if (errorVinculacion) {

        console.error(
          'Error vinculando vehículos:',
          errorVinculacion,
        )


        setVehiculos([])

        setError(
          `No se pudo vincular la cuenta con sus vehículos: ${errorVinculacion.message}`,
        )

        setCargando(false)

        return

      }


      /*
       * ---------------------------------------------------------
       * Ahora consultamos por UUID.
       * ---------------------------------------------------------
       */

      const {
        data,
        error:
          errorSupabase,
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
              ascending: true,
            },
          )


      if (errorSupabase) {

        console.error(
          'Error cargando mis vehículos:',
          errorSupabase,
        )


        setVehiculos([])

        setError(
          errorSupabase.message,
        )

      } else {

        setVehiculos(
          data ?? [],
        )

      }


      setCargando(false)

    }, [
      usuario?.id,
    ])


  useEffect(() => {

    cargar()

  }, [
    cargar,
  ])


  /*
   * =============================================================
   * PERFIL
   * =============================================================
   *
   * Actualmente los datos del propietario están dentro
   * de vehiculos.
   *
   * Tomamos el primer vehículo porque el nombre,
   * correo, cédula y foto pertenecen al mismo propietario.
   */
  const perfil =
    useMemo(() => {

      const primerVehiculo =
        vehiculos[0]


      return {

        nombre:
          primerVehiculo
            ?.propietario_nombre
          ||
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
          'Usuario',


        correo:
          primerVehiculo
            ?.correo_institucional
          ||
          usuario?.email
          ||
          '',


        correoCuenta:
          usuario?.email
          ||
          '',


        cedula:
          primerVehiculo
            ?.cedula_enmascarada
          ||
          'No registrada',


        foto:
          primerVehiculo
            ?.foto_propietario_url
          ||
          usuario
            ?.user_metadata
            ?.avatar_url
          ||
          usuario
            ?.user_metadata
            ?.picture
          ||
          '',


        cantidadVehiculos:
          vehiculos.length,


        vinculado:
          vehiculos.length > 0,

      }

    }, [
      vehiculos,
      usuario,
    ])


  /*
   * =============================================================
   * ACTUALIZAR MI PERFIL
   * =============================================================
   *
   * Si un propietario posee varios vehículos,
   * actualizamos sus datos en TODOS ellos.
   *
   * Esto es necesario porque actualmente el modelo
   * guarda los datos del propietario dentro de vehiculos.
   */
  const actualizarPerfil =
    useCallback(

      async ({
        propietario_nombre,
        foto_propietario_url,
      }) => {

        if (!usuario?.id) {

          return {
            ok: false,

            error:
              'No existe una sesión activa.',
          }

        }


        if (
          vehiculos.length === 0
        ) {

          return {
            ok: false,

            error:
              'Tu cuenta todavía no tiene vehículos vinculados.',
          }

        }


        const cambios = {

          propietario_nombre:
            propietario_nombre
              .trim()
              .toUpperCase(),


          foto_propietario_url:
            foto_propietario_url
              .trim(),

        }


        const {
          error:
            errorSupabase,
        } =
          await supabase
            .from('vehiculos')
            .update(
              cambios,
            )
            .eq(
              'usuario_id',
              usuario.id,
            )


        if (errorSupabase) {

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
        usuario?.id,
        vehiculos.length,
        cargar,
      ],

    )


  /*
   * =============================================================
   * ACTUALIZAR UNO DE MIS VEHÍCULOS
   * =============================================================
   */
  const actualizarMiVehiculo =
    useCallback(

      async (
        id,
        cambios,
      ) => {

        if (!usuario?.id) {

          return {
            ok: false,

            error:
              'No existe una sesión activa.',
          }

        }


        /*
         * El WHERE contiene:
         *
         * id = vehículo elegido
         *
         * Y
         *
         * usuario_id = cuenta actual
         *
         * Además Supabase RLS vuelve a comprobarlo.
         */

        const {
          data,
          error:
            errorSupabase,
        } =
          await supabase
            .from('vehiculos')
            .update(
              cambios,
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


        if (errorSupabase) {

          return {
            ok: false,

            error:
              errorSupabase.message,
          }

        }


        setVehiculos(
          (
            vehiculosActuales,
          ) =>

            vehiculosActuales.map(
              (
                vehiculo,
              ) =>

                vehiculo.id === id
                  ? data
                  : vehiculo,

            ),
        )


        return {
          ok: true,

          data,
        }

      },

      [
        usuario?.id,
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

    actualizarMiVehiculo,

  }
}