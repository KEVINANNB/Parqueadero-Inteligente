import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  supabase,
} from '../lib/supabase'


const ParkingContext =
  createContext(null)


export function ParkingProvider({
  children,
}) {
  /* ==============================================================
     ACTIVACIÓN
     ============================================================== */

  const [
    activo,
    setActivo,
  ] =
    useState(false)


  /* ==============================================================
     FIREBASE
     ============================================================== */

  const [
    espaciosFirebase,
    setEspaciosFirebase,
  ] =
    useState([])


  const [
    cargandoFirebase,
    setCargandoFirebase,
  ] =
    useState(false)


  const [
    errorFirebase,
    setErrorFirebase,
  ] =
    useState(null)


  /* ==============================================================
     SUPABASE
     ============================================================== */

  const [
    puestosSupabase,
    setPuestosSupabase,
  ] =
    useState([])


  const [
    cargandoSupabase,
    setCargandoSupabase,
  ] =
    useState(false)


  const [
    errorSupabase,
    setErrorSupabase,
  ] =
    useState(null)


  /* ==============================================================
     INFORMACIÓN DE CACHÉ
     ============================================================== */

  const [
    ultimaCarga,
    setUltimaCarga,
  ] =
    useState(null)


  const [
    actualizando,
    setActualizando,
  ] =
    useState(false)


  const solicitudActualRef =
    useRef(0)


  /* ==============================================================
     ACTIVAR
     ============================================================== */

  const activar =
    useCallback(
      () => {

        setActivo(
          (
            actual,
          ) => {

            if (
              actual
            ) {
              return actual
            }


            setCargandoFirebase(
              true,
            )


            setCargandoSupabase(
              true,
            )


            return true

          },
        )

      },
      [],
    )


  /* ==============================================================
     FIREBASE EN TIEMPO REAL
     ============================================================== */

  useEffect(
    () => {

      if (
        !activo
      ) {
        return undefined
      }


      let unsubscribe =
        null


      let cancelado =
        false


      const iniciarFirebase =
        async () => {

          try {

            const [
              firebaseDatabase,
              firebaseService,
            ] =
              await Promise.all([

                import(
                  'firebase/database'
                ),

                import(
                  '../services/firebase'
                ),

              ])


            if (
              cancelado
            ) {
              return
            }


            const {
              onValue,
              ref,
            } =
              firebaseDatabase


            const {
              db,
            } =
              firebaseService


            const espaciosRef =
              ref(
                db,
                'espacios',
              )


            unsubscribe =
              onValue(

                espaciosRef,

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
                      .sort(
                        (
                          a,
                          b,
                        ) => {

                          if (
                            a.columna !==
                            b.columna
                          ) {
                            return (
                              a.columna -
                              b.columna
                            )
                          }


                          return (
                            a.numero -
                            b.numero
                          )

                        },
                      )


                  setEspaciosFirebase(
                    lista,
                  )


                  setCargandoFirebase(
                    false,
                  )


                  setErrorFirebase(
                    null,
                  )

                },

                (
                  error,
                ) => {

                  console.error(
                    'Error Firebase:',
                    error,
                  )


                  setErrorFirebase(
                    error,
                  )


                  setCargandoFirebase(
                    false,
                  )

                },

              )

          } catch (
            error
          ) {

            console.error(
              'No se pudo iniciar Firebase:',
              error,
            )


            if (
              !cancelado
            ) {

              setErrorFirebase(
                error,
              )


              setCargandoFirebase(
                false,
              )

            }

          }

        }


      iniciarFirebase()


      return () => {

        cancelado =
          true


        if (
          typeof unsubscribe ===
          'function'
        ) {
          unsubscribe()
        }

      }

    },
    [
      activo,
    ],
  )


  /* ==============================================================
     SUPABASE:
     PUESTOS + OCUPACIONES + RESERVAS + VEHÍCULOS
     ============================================================== */

  const cargarRelaciones =
    useCallback(
      async ({
        mostrarCarga = true,
      } = {}) => {

        const solicitud =
          ++solicitudActualRef.current


        if (
          mostrarCarga
        ) {
          setCargandoSupabase(
            true,
          )
        }


        setActualizando(
          true,
        )


        setErrorSupabase(
          null,
        )


        try {

          /* =====================================================
             TRES CONSULTAS EN PARALELO
             ===================================================== */

          const [
            resultadoPuestos,
            resultadoOcupaciones,
            resultadoReservas,
          ] =
            await Promise.all([

              supabase
                .from(
                  'puestos',
                )
                .select(`
                  id,
                  codigo_integracion,
                  sensor_id_rtdb,
                  integracion_activa
                `)
                .order(
                  'id',
                  {
                    ascending:
                      true,
                  },
                ),


              supabase
                .from(
                  'ocupaciones_puestos_actuales',
                )
                .select(`
                  id,
                  puesto_id,
                  vehiculo_id,
                  fecha_asignacion,
                  asignado_por,
                  observacion
                `),


              supabase
                .from(
                  'reservas_puestos_actuales',
                )
                .select(`
                  id,
                  puesto_id,
                  vehiculo_id,
                  usuario_id,
                  fecha_reserva,
                  observacion
                `),

            ])


          if (
            solicitud !==
            solicitudActualRef.current
          ) {
            return
          }


          if (
            resultadoPuestos.error
          ) {
            throw (
              resultadoPuestos.error
            )
          }


          if (
            resultadoOcupaciones.error
          ) {
            throw (
              resultadoOcupaciones.error
            )
          }


          if (
            resultadoReservas.error
          ) {
            throw (
              resultadoReservas.error
            )
          }


          const puestosData =
            resultadoPuestos.data ||
            []


          const ocupacionesData =
            resultadoOcupaciones.data ||
            []


          const reservasData =
            resultadoReservas.data ||
            []


          /* =====================================================
             VEHÍCULOS UTILIZADOS
             ===================================================== */

          const vehiculoIds =
            [
              ...new Set([

                ...ocupacionesData
                  .map(
                    (
                      ocupacion,
                    ) =>
                      ocupacion
                        .vehiculo_id,
                  ),

                ...reservasData
                  .map(
                    (
                      reserva,
                    ) =>
                      reserva
                        .vehiculo_id,
                  ),

              ].filter(
                Boolean,
              )),
            ]


          let vehiculosData =
            []


          if (
            vehiculoIds.length >
            0
          ) {

            const {
              data,
              error,
            } =
              await supabase
                .from(
                  'vehiculos',
                )
                .select(`
                  id,
                  usuario_id,
                  placa,
                  marca,
                  modelo,
                  anio,
                  color,
                  tipo,
                  foto_url,
                  foto_propietario_url,
                  propietario_nombre,
                  correo_institucional,
                  autorizado
                `)
                .in(
                  'id',
                  vehiculoIds,
                )


            if (
              error
            ) {
              throw error
            }


            vehiculosData =
              data ||
              []

          }


          if (
            solicitud !==
            solicitudActualRef.current
          ) {
            return
          }


          /* =====================================================
             MAPA VEHÍCULOS
             ===================================================== */

          const vehiculosPorId =
            new Map(

              vehiculosData.map(
                (
                  vehiculo,
                ) => [

                  vehiculo.id,

                  vehiculo,

                ],
              ),

            )


          /* =====================================================
             MAPA OCUPACIONES
             ===================================================== */

          const ocupacionesPorPuesto =
            new Map(

              ocupacionesData.map(
                (
                  ocupacion,
                ) => [

                  ocupacion
                    .puesto_id,

                  {
                    ...ocupacion,

                    vehiculo:
                      vehiculosPorId.get(
                        ocupacion
                          .vehiculo_id,
                      ) ||
                      null,
                  },

                ],
              ),

            )


          /* =====================================================
             MAPA RESERVAS
             ===================================================== */

          const reservasPorPuesto =
            new Map(

              reservasData.map(
                (
                  reserva,
                ) => [

                  reserva
                    .puesto_id,

                  {
                    ...reserva,

                    vehiculo:
                      vehiculosPorId.get(
                        reserva
                          .vehiculo_id,
                      ) ||
                      null,
                  },

                ],
              ),

            )


          /* =====================================================
             PUESTOS COMPLETOS
             ===================================================== */

          const puestosCompletos =
            puestosData.map(
              (
                puesto,
              ) => ({

                ...puesto,


                ocupacion:
                  ocupacionesPorPuesto.get(
                    puesto.id,
                  ) ||
                  null,


                reserva:
                  reservasPorPuesto.get(
                    puesto.id,
                  ) ||
                  null,

              }),
            )


          setPuestosSupabase(
            puestosCompletos,
          )


          setUltimaCarga(
            new Date(),
          )


          setErrorSupabase(
            null,
          )

        } catch (
          error
        ) {

          console.error(
            'Error cargando relaciones:',
            error,
          )


          if (
            solicitud ===
            solicitudActualRef.current
          ) {
            setErrorSupabase(
              error,
            )
          }

        } finally {

          if (
            solicitud ===
            solicitudActualRef.current
          ) {

            setCargandoSupabase(
              false,
            )


            setActualizando(
              false,
            )

          }

        }

      },
      [],
    )


  /* ==============================================================
     PRIMERA CARGA
     ============================================================== */

  useEffect(
    () => {

      if (
        !activo
      ) {
        return
      }


      cargarRelaciones()

    },
    [
      activo,
      cargarRelaciones,
    ],
  )


  /* ==============================================================
     SUPABASE REALTIME

     Si otro usuario reserva/cancela:
     todos los mapas se actualizan.
     ============================================================== */

  useEffect(
    () => {

      if (
        !activo
      ) {
        return undefined
      }


      const canal =
        supabase
          .channel(
            'smart-parking-relaciones',
          )

          .on(

            'postgres_changes',

            {
              event:
                '*',

              schema:
                'public',

              table:
                'reservas_puestos_actuales',
            },

            () => {

              cargarRelaciones({
                mostrarCarga:
                  false,
              })

            },

          )

          .on(

            'postgres_changes',

            {
              event:
                '*',

              schema:
                'public',

              table:
                'ocupaciones_puestos_actuales',
            },

            () => {

              cargarRelaciones({
                mostrarCarga:
                  false,
              })

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
      activo,
      cargarRelaciones,
    ],
  )


  /* ==============================================================
     ACTUALIZACIÓN MANUAL
     ============================================================== */

  const recargarRelaciones =
    useCallback(
      async () => {

        if (
          !activo
        ) {

          activar()

          return

        }


        await cargarRelaciones({
          mostrarCarga:
            false,
        })

      },
      [
        activo,
        activar,
        cargarRelaciones,
      ],
    )


  /* ==============================================================
     FIREBASE + SUPABASE
     ============================================================== */

  const espacios =
    useMemo(
      () => {

        const puestosPorSensor =
          new Map(

            puestosSupabase.map(
              (
                puesto,
              ) => [

                puesto
                  .sensor_id_rtdb,

                puesto,

              ],
            ),

          )


        return espaciosFirebase.map(
          (
            espacio,
          ) => {

            const puesto =
              puestosPorSensor.get(
                espacio.id,
              )


            const ocupacion =
              puesto
                ?.ocupacion
              ||
              null


            const reserva =
              puesto
                ?.reserva
              ||
              null


            const estadoSensor =
              espacio.estado ||
              null


            const ocupadoFisicamente =
              estadoSensor ===
              'ocupado'


            const reservado =
              Boolean(
                reserva,
              )


            const asignado =
              Boolean(
                ocupacion,
              )


            /*
             * Vehículo identificado:
             *
             * 1. ocupación actual
             * 2. reserva
             */

            const vehiculo =
              ocupacion
                ?.vehiculo
              ||
              reserva
                ?.vehiculo
              ||
              null


            /*
             * Un espacio es realmente
             * DISPONIBLE solamente cuando:
             *
             * - sensor = libre
             * - sin ocupación
             * - sin reserva
             */

            const disponible =
              estadoSensor ===
                'libre'

              &&

              !reservado

              &&

              !asignado


            /* =================================================
               ESTADO OPERATIVO
               ================================================= */

            let estadoOperativo =
              'sin_datos'


            if (
              estadoSensor ===
              'libre'
            ) {

              if (
                reservado
              ) {

                estadoOperativo =
                  'reservado'

              } else if (
                asignado
              ) {

                estadoOperativo =
                  'asignado'

              } else {

                estadoOperativo =
                  'disponible'

              }

            }


            if (
              ocupadoFisicamente
            ) {

              if (
                vehiculo
              ) {

                estadoOperativo =
                  'ocupado_identificado'

              } else {

                estadoOperativo =
                  'ocupado_sin_identificar'

              }

            }


            /*
             * COMPATIBILIDAD VISUAL:
             *
             * Los componentes actuales entienden:
             *
             * libre
             * ocupado
             *
             * Por eso una reserva se representa
             * visualmente como ocupado (ROJO),
             * pero conservamos estado_sensor para
             * conocer la lectura física verdadera.
             */

            let estadoVisual =
              estadoSensor


            if (
              reservado ||
              asignado ||
              ocupadoFisicamente
            ) {

              estadoVisual =
                'ocupado'

            }


            return {

              ...espacio,


              /* SENSOR ORIGINAL */

              estado_sensor:
                estadoSensor,


              /* ESTADO VISUAL */

              estado:
                estadoVisual,


              estado_operativo:
                estadoOperativo,


              ocupado_fisicamente:
                ocupadoFisicamente,


              reservado,


              disponible,


              /* PUESTO */

              puesto_id:
                puesto?.id ||
                null,


              codigo_puesto:
                puesto
                  ?.codigo_integracion
                ||
                espacio.etiqueta,


              integracion_activa:
                puesto
                  ?.integracion_activa
                ??
                false,


              /* RELACIONES */

              ocupacion,


              reserva,


              vehiculo,


              identificado:
                Boolean(
                  vehiculo,
                ),

            }

          },
        )

      },
      [
        espaciosFirebase,
        puestosSupabase,
      ],
    )


  /* ==============================================================
     ESTADÍSTICAS
     ============================================================== */

  const estadisticas =
    useMemo(
      () => {

        const total =
          espacios.length


        let disponibles =
          0


        let reservados =
          0


        let ocupadosFisicos =
          0


        let identificados =
          0


        let sinIdentificar =
          0


        for (
          const espacio
          of espacios
        ) {

          if (
            espacio.disponible
          ) {
            disponibles +=
              1
          }


          if (
            espacio.reservado

            &&

            !espacio
              .ocupado_fisicamente
          ) {
            reservados +=
              1
          }


          if (
            espacio
              .ocupado_fisicamente
          ) {

            ocupadosFisicos +=
              1


            if (
              espacio.vehiculo
            ) {

              identificados +=
                1

            } else {

              sinIdentificar +=
                1

            }

          }

        }


        const noDisponibles =
          Math.max(
            0,

            total -
            disponibles,
          )


        const porcentajeDisponible =
          total >
          0

            ? (
                disponibles /
                total
              ) * 100

            : 0


        return {

          total,


          /* NUEVOS */

          disponibles,

          reservados,

          ocupadosFisicos,

          noDisponibles,


          /* COMPATIBILIDAD */

          libres:
            disponibles,

          ocupados:
            noDisponibles,

          identificados,

          sinIdentificar,

          porcentajeDisponible,

        }

      },
      [
        espacios,
      ],
    )


  /* ==============================================================
     ESTADO GENERAL
     ============================================================== */

  const cargando =
    !activo
    ||
    cargandoFirebase
    ||
    cargandoSupabase


  const valor =
    useMemo(
      () => ({

        activo,

        activar,

        espacios,

        cargando,

        actualizando,

        error:
          errorFirebase ||
          errorSupabase,

        estadisticas,

        ultimaCarga,

        recargarRelaciones,

      }),
      [
        activo,
        activar,
        espacios,
        cargando,
        actualizando,
        errorFirebase,
        errorSupabase,
        estadisticas,
        ultimaCarga,
        recargarRelaciones,
      ],
    )


  return (
    <ParkingContext.Provider
      value={
        valor
      }
    >

      {children}

    </ParkingContext.Provider>
  )
}


export function useParkingContext() {
  const contexto =
    useContext(
      ParkingContext,
    )


  if (
    !contexto
  ) {

    throw new Error(
      'useParkingContext debe utilizarse dentro de ParkingProvider.',
    )

  }


  return contexto
}