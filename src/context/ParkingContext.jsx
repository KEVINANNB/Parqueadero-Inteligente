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


/* ================================================================
   CONTEXTO
   ================================================================ */

const ParkingContext =
  createContext(null)


/* ================================================================
   PROVIDER
   ================================================================ */

export function ParkingProvider({
  children,
}) {
  /* ==============================================================
     ACTIVACIÓN DIFERIDA

     El sistema NO conecta Firebase ni consulta los puestos hasta que
     alguna página realmente llama a usePuestos().
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


  /*
   * Evita determinadas condiciones de carrera
   * cuando se pulsan varias actualizaciones.
   */

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


            /*
             * Dejamos cargando desde este
             * mismo render para evitar un
             * pequeño parpadeo de datos vacíos.
             */

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
     FIREBASE
     ============================================================== */

  useEffect(
    () => {

      if (
        !activo
      ) {
        return undefined
      }


      let unsubscribe = null

      let cancelado =
        false


      const iniciarFirebase =
        async () => {

          try {

            /*
             * Firebase se importa dinámicamente.
             *
             * Esto significa que el paquete de Firebase
             * no tiene que cargarse al abrir el menú
             * principal.
             */

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
     CARGAR RELACIONES SUPABASE
     ============================================================== */

  const cargarRelaciones =
    useCallback(
      async ({
        mostrarCarga = true,
      } = {}) => {

        /*
         * Número único para esta ejecución.
         */

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
             PUESTOS + OCUPACIONES EN PARALELO

             Antes:
               puestos
                 ↓
               ocupaciones

             Ahora:
               puestos ───────┐
                              ├── al mismo tiempo
               ocupaciones ───┘
             ===================================================== */

          const [
            resultadoPuestos,
            resultadoOcupaciones,
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
                  observacion
                `),

            ])


          if (
            solicitud !==
            solicitudActualRef.current
          ) {
            return
          }


          /* =====================================================
             ERRORES
             ===================================================== */

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


          const puestosData =
            resultadoPuestos.data ||
            []


          const ocupacionesData =
            resultadoOcupaciones.data ||
            []


          /* =====================================================
             IDS VEHÍCULOS RELACIONADOS
             ===================================================== */

          const vehiculoIds = [

            ...new Set(

              ocupacionesData
                .map(
                  (
                    ocupacion,
                  ) =>
                    ocupacion
                      .vehiculo_id,
                )
                .filter(
                  Boolean,
                ),

            ),

          ]


          /* =====================================================
             SOLO CONSULTAR VEHÍCULOS QUE REALMENTE APARECEN
             ===================================================== */

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
             MAPAS DE BÚSQUEDA
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
     PRIMERA CARGA SUPABASE
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
     RECARGAR MANUALMENTE
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
     UNIR FIREBASE + SUPABASE
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


            return {

              ...espacio,


              /* ================================================
                 PUESTO
                 ================================================ */

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


              /* ================================================
                 OCUPACIÓN
                 ================================================ */

              ocupacion:
                puesto
                  ?.ocupacion
                ||
                null,


              /* ================================================
                 VEHÍCULO
                 ================================================ */

              vehiculo:
                puesto
                  ?.ocupacion
                  ?.vehiculo
                ||
                null,


              identificado:
                Boolean(
                  puesto
                    ?.ocupacion
                    ?.vehiculo,
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


        let libres =
          0

        let ocupados =
          0

        let identificados =
          0


        /*
         * Una única pasada.
         *
         * Antes había varios .filter() independientes.
         */

        for (
          const espacio
          of espacios
        ) {

          if (
            espacio.estado ===
            'libre'
          ) {
            libres +=
              1

            continue
          }


          if (
            espacio.estado ===
            'ocupado'
          ) {

            ocupados +=
              1


            if (
              espacio.identificado
            ) {
              identificados +=
                1
            }

          }

        }


        const sinIdentificar =
          ocupados -
          identificados


        const porcentajeDisponible =
          total >
          0

            ? (
                libres /
                total
              ) * 100

            : 0


        return {

          total,

          libres,

          ocupados,

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


  /* ==============================================================
     VALOR
     ============================================================== */

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


/* ================================================================
   HOOK INTERNO
   ================================================================ */

export function useParkingContext() {
  const contexto =
    useContext(
      ParkingContext,
    )


  if (
    !contexto
  ) {
    throw new Error(
      'useParkingContext debe usarse dentro de <ParkingProvider>.',
    )
  }


  return contexto
}