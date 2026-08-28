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


export default function useEspacio(
  id,
) {
  const [
    espacioFirebase,
    setEspacioFirebase,
  ] =
    useState(null)


  const [
    puestoSupabase,
    setPuestoSupabase,
  ] =
    useState(null)


  const [
    ocupacion,
    setOcupacion,
  ] =
    useState(null)


  const [
    cargandoFirebase,
    setCargandoFirebase,
  ] =
    useState(true)


  const [
    cargandoSupabase,
    setCargandoSupabase,
  ] =
    useState(true)


  const [
    error,
    setError,
  ] =
    useState(null)


  /* =============================================================
     FIREBASE
     ============================================================= */

  useEffect(() => {

    if (!id) {
      return
    }


    setCargandoFirebase(
      true,
    )


    const espacioRef =
      ref(
        db,
        `espacios/${id}`,
      )


    const unsubscribe =
      onValue(

        espacioRef,

        (
          snapshot,
        ) => {

          setEspacioFirebase(
            snapshot.val(),
          )

          setCargandoFirebase(
            false,
          )

        },

        (
          errorFirebase,
        ) => {

          console.error(
            errorFirebase,
          )

          setError(
            errorFirebase,
          )

          setCargandoFirebase(
            false,
          )

        },

      )


    return () =>
      unsubscribe()

  }, [
    id,
  ])


  /* =============================================================
     SUPABASE
     ============================================================= */

  const cargarRelacion =
    useCallback(
      async () => {

        if (!id) {
          return
        }


        setCargandoSupabase(
          true,
        )


        /*
         * -------------------------------------------------------
         * PUESTO
         * -------------------------------------------------------
         */

        const {
          data:
            puesto,

          error:
            errorPuesto,

        } =
          await supabase
            .from('puestos')
            .select(`
              id,
              codigo_integracion,
              sensor_id_rtdb,
              integracion_activa
            `)
            .eq(
              'sensor_id_rtdb',
              id,
            )
            .maybeSingle()


        if (
          errorPuesto
        ) {

          setError(
            errorPuesto,
          )

          setCargandoSupabase(
            false,
          )

          return
        }


        setPuestoSupabase(
          puesto,
        )


        if (!puesto) {

          setOcupacion(
            null,
          )

          setCargandoSupabase(
            false,
          )

          return
        }


        /*
         * -------------------------------------------------------
         * OCUPACIÓN
         * -------------------------------------------------------
         */

        const {
          data:
            ocupacionData,

          error:
            errorOcupacion,

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
            .eq(
              'puesto_id',
              puesto.id,
            )
            .maybeSingle()


        if (
          errorOcupacion
        ) {

          setError(
            errorOcupacion,
          )

          setCargandoSupabase(
            false,
          )

          return
        }


        if (
          !ocupacionData
        ) {

          setOcupacion(
            null,
          )

          setCargandoSupabase(
            false,
          )

          return
        }


        /*
         * -------------------------------------------------------
         * VEHÍCULO
         * -------------------------------------------------------
         */

        const {
          data:
            vehiculo,

          error:
            errorVehiculo,

        } =
          await supabase
            .from('vehiculos')
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
              cedula_enmascarada,
              autorizado
            `)
            .eq(
              'id',
              ocupacionData
                .vehiculo_id,
            )
            .maybeSingle()


        if (
          errorVehiculo
        ) {

          setError(
            errorVehiculo,
          )

          setCargandoSupabase(
            false,
          )

          return
        }


        setOcupacion({

          ...ocupacionData,

          vehiculo:
            vehiculo ||
            null,

        })


        setCargandoSupabase(
          false,
        )

      },
      [
        id,
      ],
    )


  useEffect(() => {

    cargarRelacion()

  }, [
    cargarRelacion,
  ])


  /* =============================================================
     ASIGNAR VEHÍCULO
     ============================================================= */

  const asignarVehiculo =
    useCallback(

      async (
        vehiculoId,
      ) => {

        if (
          !puestoSupabase
            ?.id
        ) {

          return {
            ok: false,

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
                  puestoSupabase.id,

                p_vehiculo_id:
                  vehiculoId,

              },
            )


        if (
          errorRpc
        ) {

          return {

            ok: false,

            error:
              errorRpc.message,

          }

        }


        await cargarRelacion()


        return {
          ok: true,
        }

      },

      [
        puestoSupabase,
        cargarRelacion,
      ],

    )


  /* =============================================================
     LIBERAR VÍNCULO
     ============================================================= */

  const liberarVehiculo =
    useCallback(
      async () => {

        if (
          !puestoSupabase
            ?.id
        ) {

          return {
            ok: false,

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
                  puestoSupabase.id,

              },
            )


        if (
          errorRpc
        ) {

          return {

            ok: false,

            error:
              errorRpc.message,

          }

        }


        await cargarRelacion()


        return {
          ok: true,
        }

      },

      [
        puestoSupabase,
        cargarRelacion,
      ],

    )


  /* =============================================================
     OBJETO FINAL
     ============================================================= */

  const espacio =
    useMemo(() => {

      if (
        !espacioFirebase
      ) {
        return null
      }


      return {

        ...espacioFirebase,


        puesto_id:
          puestoSupabase
            ?.id
          ||
          null,


        codigo_puesto:
          puestoSupabase
            ?.codigo_integracion
          ||
          espacioFirebase
            .etiqueta,


        ocupacion,


        vehiculo:
          ocupacion
            ?.vehiculo
          ||
          null,


        identificado:
          Boolean(
            ocupacion
              ?.vehiculo,
          ),

      }

    }, [
      espacioFirebase,
      puestoSupabase,
      ocupacion,
    ])


  return {

    espacio,


    cargando:
      cargandoFirebase
      ||
      cargandoSupabase,


    error,


    recargarRelacion:
      cargarRelacion,


    asignarVehiculo,


    liberarVehiculo,

  }
}