import {
  useCallback,
  useMemo,
} from 'react'

import {
  supabase,
} from '../lib/supabase'

import usePuestos
  from './usePuestos'


export default function useEspacio(
  id,
) {
  const {
    espacios,
    cargando,
    error,
    recargarRelaciones,
  } =
    usePuestos()


  /* ==============================================================
     ENCONTRAR ESPACIO EN LA CACHÉ GLOBAL
     ============================================================== */

  const espacio =
    useMemo(
      () => {

        if (
          !id
        ) {
          return null
        }


        return (
          espacios.find(
            (
              item,
            ) =>
              item.id ===
              id,
          )
          ||
          null
        )

      },
      [
        espacios,
        id,
      ],
    )


  /* ==============================================================
     RESERVAR COMO PROPIETARIO
     ============================================================== */

  const reservarVehiculo =
    useCallback(
      async (
        vehiculoId,
      ) => {

        if (
          !espacio
            ?.puesto_id
        ) {

          return {

            ok:
              false,

            error:
              'Este espacio no está vinculado correctamente con Supabase.',

          }

        }


        /*
         * No escribimos nada en Firebase.
         *
         * Firebase continúa siendo la
         * lectura física del sensor.
         */

        if (
          espacio
            .estado_sensor !==
          'libre'
        ) {

          return {

            ok:
              false,

            error:
              'El sensor indica que este espacio está ocupado.',

          }

        }


        if (
          espacio.reserva
        ) {

          return {

            ok:
              false,

            error:
              'Este espacio ya posee una reserva.',

          }

        }


        if (
          espacio.ocupacion
        ) {

          return {

            ok:
              false,

            error:
              'Este espacio ya tiene un vehículo asignado.',

          }

        }


        const {
          error:
            errorRpc,
        } =
          await supabase
            .rpc(
              'reservar_mi_puesto',
              {

                p_puesto_id:
                  espacio.puesto_id,

                p_vehiculo_id:
                  Number(
                    vehiculoId,
                  ),

              },
            )


        if (
          errorRpc
        ) {

          return {

            ok:
              false,

            error:
              errorRpc.message,

          }

        }


        await recargarRelaciones()


        return {
          ok:
            true,
        }

      },
      [
        espacio,
        recargarRelaciones,
      ],
    )


  /* ==============================================================
     CANCELAR / FINALIZAR RESERVA
     ============================================================== */

  const cancelarReserva =
    useCallback(
      async () => {

        if (
          !espacio
            ?.puesto_id
        ) {

          return {

            ok:
              false,

            error:
              'Este espacio no está vinculado correctamente.',

          }

        }


        const {
          error:
            errorRpc,
        } =
          await supabase
            .rpc(
              'cancelar_mi_reserva',
              {

                p_puesto_id:
                  espacio.puesto_id,

              },
            )


        if (
          errorRpc
        ) {

          return {

            ok:
              false,

            error:
              errorRpc.message,

          }

        }


        await recargarRelaciones()


        return {
          ok:
            true,
        }

      },
      [
        espacio,
        recargarRelaciones,
      ],
    )


  /* ==============================================================
     FUNCIÓN ADMIN ANTIGUA
     ============================================================== */

  const asignarVehiculo =
    useCallback(
      async (
        vehiculoId,
      ) => {

        if (
          !espacio
            ?.puesto_id
        ) {

          return {

            ok:
              false,

            error:
              'El puesto no está vinculado con Supabase.',

          }

        }


        const {
          error:
            errorRpc,
        } =
          await supabase
            .rpc(
              'asignar_vehiculo_a_puesto',
              {

                p_puesto_id:
                  espacio.puesto_id,

                p_vehiculo_id:
                  vehiculoId,

              },
            )


        if (
          errorRpc
        ) {

          return {

            ok:
              false,

            error:
              errorRpc.message,

          }

        }


        await recargarRelaciones()


        return {
          ok:
            true,
        }

      },
      [
        espacio,
        recargarRelaciones,
      ],
    )


  /* ==============================================================
     LIBERAR ADMIN
     ============================================================== */

  const liberarVehiculo =
    useCallback(
      async () => {

        if (
          !espacio
            ?.puesto_id
        ) {

          return {

            ok:
              false,

            error:
              'El puesto no está vinculado con Supabase.',

          }

        }


        const {
          error:
            errorRpc,
        } =
          await supabase
            .rpc(
              'liberar_vinculo_puesto',
              {

                p_puesto_id:
                  espacio.puesto_id,

              },
            )


        if (
          errorRpc
        ) {

          return {

            ok:
              false,

            error:
              errorRpc.message,

          }

        }


        await recargarRelaciones()


        return {
          ok:
            true,
        }

      },
      [
        espacio,
        recargarRelaciones,
      ],
    )


  return {

    espacio,

    cargando,

    error,

    recargarRelacion:
      recargarRelaciones,

    reservarVehiculo,

    cancelarReserva,

    asignarVehiculo,

    liberarVehiculo,

  }
}