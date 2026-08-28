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


export default function usePuestos() {
  /* =============================================================
     FIREBASE
     ============================================================= */

  const [
    espaciosFirebase,
    setEspaciosFirebase,
  ] = useState([])


  const [
    cargandoFirebase,
    setCargandoFirebase,
  ] = useState(true)


  const [
    errorFirebase,
    setErrorFirebase,
  ] = useState(null)


  /* =============================================================
     SUPABASE
     ============================================================= */

  const [
    puestosSupabase,
    setPuestosSupabase,
  ] = useState([])


  const [
    cargandoSupabase,
    setCargandoSupabase,
  ] = useState(true)


  const [
    errorSupabase,
    setErrorSupabase,
  ] = useState(null)


  /* =============================================================
     FIREBASE EN TIEMPO REAL
     ============================================================= */

  useEffect(() => {
    const espaciosRef =
      ref(
        db,
        'espacios',
      )


    const unsubscribe =
      onValue(

        espaciosRef,

        (
          snapshot,
        ) => {
          const data =
            snapshot.val() || {}


          const lista =
            Object.values(data)
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


    return () =>
      unsubscribe()

  }, [])


  /* =============================================================
     CARGAR RELACIONES DE SUPABASE
     ============================================================= */

  const cargarRelaciones =
    useCallback(
      async () => {

        setCargandoSupabase(
          true,
        )

        setErrorSupabase(
          null,
        )


        /*
         * -------------------------------------------------------
         * 1. PUESTOS
         * -------------------------------------------------------
         */

        const {
          data:
            puestosData,

          error:
            errorPuestos,

        } =
          await supabase
            .from('puestos')
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
            )


        if (errorPuestos) {

          console.error(
            'Error cargando puestos:',
            errorPuestos,
          )

          setErrorSupabase(
            errorPuestos,
          )

          setCargandoSupabase(
            false,
          )

          return
        }


        /*
         * -------------------------------------------------------
         * 2. OCUPACIONES ACTUALES
         * -------------------------------------------------------
         */

        const {
          data:
            ocupacionesData,

          error:
            errorOcupaciones,

        } =
          await supabase
            .from(
              'ocupaciones_puestos_actuales',
            )
            .select(`
              id,
              puesto_id,
              vehiculo_id,
              fecha_asignacion,
              observacion
            `)


        if (
          errorOcupaciones
        ) {

          console.error(
            'Error cargando ocupaciones:',
            errorOcupaciones,
          )

          setErrorSupabase(
            errorOcupaciones,
          )

          setCargandoSupabase(
            false,
          )

          return
        }


        /*
         * -------------------------------------------------------
         * 3. IDs DE VEHÍCULOS ACTUALMENTE VINCULADOS
         * -------------------------------------------------------
         */

        const vehiculoIds = [
          ...new Set(
            (
              ocupacionesData ||
              []
            )
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


        let vehiculosData = []


        if (
          vehiculoIds.length >
          0
        ) {

          const {
            data,

            error:
              errorVehiculos,

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
            errorVehiculos
          ) {

            console.error(
              'Error cargando vehículos vinculados:',
              errorVehiculos,
            )

            setErrorSupabase(
              errorVehiculos,
            )

            setCargandoSupabase(
              false,
            )

            return
          }


          vehiculosData =
            data || []
        }


        /*
         * -------------------------------------------------------
         * 4. CREAR MAPAS DE BÚSQUEDA
         * -------------------------------------------------------
         */

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
            (
              ocupacionesData ||
              []
            ).map(
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


        /*
         * -------------------------------------------------------
         * 5. AÑADIR OCUPACIÓN A CADA PUESTO
         * -------------------------------------------------------
         */

        const puestosCompletos =
          (
            puestosData ||
            []
          ).map(
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

        setCargandoSupabase(
          false,
        )

      },
      [],
    )


  useEffect(() => {

    cargarRelaciones()

  }, [
    cargarRelaciones,
  ])


  /* =============================================================
     UNIR FIREBASE + SUPABASE
     ============================================================= */

  const espacios =
    useMemo(() => {

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


            /*
             * Datos Supabase del
             * puesto físico.
             */

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


            /*
             * Vehículo relacionado.
             */

            ocupacion:
              puesto
                ?.ocupacion
              ||
              null,


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

    }, [
      espaciosFirebase,
      puestosSupabase,
    ])


  /* =============================================================
     ESTADÍSTICAS
     ============================================================= */

  const estadisticas =
    useMemo(() => {

      const total =
        espacios.length


      const libres =
        espacios.filter(
          (
            espacio,
          ) =>
            espacio.estado ===
            'libre',
        ).length


      const ocupados =
        espacios.filter(
          (
            espacio,
          ) =>
            espacio.estado ===
            'ocupado',
        ).length


      const identificados =
        espacios.filter(
          (
            espacio,
          ) =>
            espacio.estado ===
              'ocupado'
            &&
            espacio
              .identificado,
        ).length


      const sinIdentificar =
        espacios.filter(
          (
            espacio,
          ) =>
            espacio.estado ===
              'ocupado'
            &&
            !espacio
              .identificado,
        ).length


      const porcentajeDisponible =
        total > 0

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

    }, [
      espacios,
    ])


  return {

    espacios,


    cargando:
      cargandoFirebase
      ||
      cargandoSupabase,


    error:
      errorFirebase
      ||
      errorSupabase,


    estadisticas,


    recargarRelaciones:
      cargarRelaciones,

  }
}