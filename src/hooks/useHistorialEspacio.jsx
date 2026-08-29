import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  onValue,
  ref,
} from 'firebase/database'

import {
  db,
} from '../services/firebase'

import {
  supabase,
} from '../lib/supabase'


/* ================================================================
   TIMESTAMP FIREBASE
   ================================================================ */

function convertirTimestamp(
  valor,
) {
  const numero =
    Number(
      valor,
    )


  if (
    !Number.isFinite(
      numero,
    )
  ) {
    return 0
  }


  /*
   * Algunos timestamps pueden venir
   * en segundos y otros en milisegundos.
   */

  if (
    numero <
    1000000000000
  ) {
    return (
      numero *
      1000
    )
  }


  return numero
}


/* ================================================================
   HOOK
   ================================================================ */

export default function useHistorialEspacio(
  id,
) {
  /* ==============================================================
     FIREBASE
     ============================================================== */

  const [
    historialFirebase,
    setHistorialFirebase,
  ] =
    useState([])


  const [
    cargandoFirebase,
    setCargandoFirebase,
  ] =
    useState(true)


  /* ==============================================================
     SUPABASE
     ============================================================== */

  const [
    historialReservas,
    setHistorialReservas,
  ] =
    useState([])


  const [
    cargandoReservas,
    setCargandoReservas,
  ] =
    useState(true)


  /* ==============================================================
     HISTORIAL SENSOR FIREBASE
     ============================================================== */

  useEffect(
    () => {

      if (
        !id
      ) {
        setHistorialFirebase([])

        setCargandoFirebase(
          false,
        )

        return undefined
      }


      setCargandoFirebase(
        true,
      )


      const historialRef =
        ref(
          db,
          `historial/${id}`,
        )


      const unsubscribe =
        onValue(

          historialRef,

          (
            snapshot,
          ) => {

            const data =
              snapshot.val() ||
              {}


            const lista =
              Object
                .values(
                  data,
                )
                .map(
                  (
                    evento,
                    indice,
                  ) => ({

                    ...evento,

                    id_evento:
                      `firebase-${
                        evento.fechaHora ||
                        indice
                      }`,

                    tipo:
                      'sensor',

                    timestamp:
                      convertirTimestamp(
                        evento.fechaHora,
                      ),

                  }),
                )


            setHistorialFirebase(
              lista,
            )


            setCargandoFirebase(
              false,
            )

          },

          (
            error,
          ) => {

            console.error(
              'Error leyendo historial Firebase:',
              error,
            )


            setHistorialFirebase(
              [],
            )


            setCargandoFirebase(
              false,
            )

          },

        )


      return () =>
        unsubscribe()

    },
    [
      id,
    ],
  )


  /* ==============================================================
     CARGAR HISTORIAL SUPABASE
     ============================================================== */

  const cargarReservas =
    useCallback(
      async () => {

        if (
          !id
        ) {

          setHistorialReservas(
            [],
          )


          setCargandoReservas(
            false,
          )

          return

        }


        setCargandoReservas(
          true,
        )


        const {
          data,
          error,
        } =
          await supabase
            .from(
              'historial_reservas_puestos',
            )
            .select(`
              id,
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
            `)
            .eq(
              'sensor_id_rtdb',
              id,
            )
            .order(
              'fecha_evento',
              {
                ascending:
                  false,
              },
            )
            .limit(
              100,
            )


        if (
          error
        ) {

          console.error(
            'Error cargando historial de reservas:',
            error,
          )


          setHistorialReservas(
            [],
          )


          setCargandoReservas(
            false,
          )

          return
        }


        const lista =
          (
            data ||
            []
          )
            .map(
              (
                evento,
              ) => ({

                ...evento,

                id_evento:
                  `reserva-${evento.id}`,

                tipo:
                  'reserva',

                timestamp:
                  new Date(
                    evento.fecha_evento,
                  ).getTime(),

              }),
            )


        setHistorialReservas(
          lista,
        )


        setCargandoReservas(
          false,
        )

      },
      [
        id,
      ],
    )


  useEffect(
    () => {

      cargarReservas()

    },
    [
      cargarReservas,
    ],
  )


  /* ==============================================================
     REALTIME RESERVAS
     ============================================================== */

  useEffect(
    () => {

      if (
        !id
      ) {
        return undefined
      }


      const canal =
        supabase
          .channel(
            `historial-reservas-${id}`,
          )

          .on(

            'postgres_changes',

            {
              event:
                '*',

              schema:
                'public',

              table:
                'historial_reservas_puestos',

              filter:
                `sensor_id_rtdb=eq.${id}`,
            },

            () => {

              cargarReservas()

            },

          )

          .subscribe()


      return () => {

        supabase
          .removeChannel(
            canal,
          )

      }

    },
    [
      id,
      cargarReservas,
    ],
  )


  /* ==============================================================
     COMBINAR
     ============================================================== */

  const historial =
    useMemo(
      () => {

        return [

          ...historialFirebase,

          ...historialReservas,

        ]
          .sort(
            (
              a,
              b,
            ) =>
              (
                b.timestamp ||
                0
              )
              -
              (
                a.timestamp ||
                0
              ),
          )

      },
      [
        historialFirebase,
        historialReservas,
      ],
    )


  return {

    historial,

    cargando:
      cargandoFirebase ||
      cargandoReservas,

  }
}