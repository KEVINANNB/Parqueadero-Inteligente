import {
  useEffect,
  useMemo,
} from 'react'

import {
  useParkingContext,
} from '../context/ParkingContext'


/* ================================================================
   VIGENCIA DE UNA LECTURA FÍSICA

   Si el sensor lleva más de 10 minutos
   sin escribir, no utilizamos su último
   "ocupado" como ocupación actual.
   ================================================================ */

const VIGENCIA_SENSOR_MS =
  10 * 60 * 1000


/* ================================================================
   TIMESTAMP
   ================================================================ */

function normalizarTimestamp(
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
   ¿LECTURA RECIENTE?
   ================================================================ */

function lecturaReciente(
  fechaHora,
) {
  const timestamp =
    normalizarTimestamp(
      fechaHora,
    )


  if (
    !timestamp
  ) {
    return false
  }


  const antiguedad =
    Date.now() -
    timestamp


  return (
    antiguedad >=
      0

    &&

    antiguedad <=
      VIGENCIA_SENSOR_MS
  )
}


/* ================================================================
   NORMALIZAR ESPACIO
   ================================================================ */

function normalizarEspacio(
  espacio,
) {
  const estadoSensorOriginal =
    espacio.estado_sensor ||
    espacio.estado ||
    null


  const sensorReciente =
    lecturaReciente(
      espacio.fechaHora,
    )


  /*
   * Una lectura vieja no debe dejar
   * un espacio rojo durante horas o días.
   */

  const ocupadoFisicamente =
    sensorReciente

    &&

    estadoSensorOriginal ===
      'ocupado'


  const reservado =
    Boolean(
      espacio.reserva,
    )


  const asignado =
    Boolean(
      espacio.ocupacion,
    )


  const vehiculo =
    espacio
      .ocupacion
      ?.vehiculo

    ||

    espacio
      .reserva
      ?.vehiculo

    ||

    espacio.vehiculo

    ||

    null


  /* ==============================================================
     DISPONIBILIDAD
     ============================================================== */

  const disponible =
    !reservado

    &&

    !asignado

    &&

    !ocupadoFisicamente


  /* ==============================================================
     ESTADO OPERATIVO
     ============================================================== */

  let estadoOperativo =
    'disponible'


  if (
    reservado &&
    !ocupadoFisicamente
  ) {

    estadoOperativo =
      'reservado'

  }


  if (
    asignado &&
    !ocupadoFisicamente &&
    !reservado
  ) {

    estadoOperativo =
      'asignado'

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
   * Para el detalle, cuando una lectura
   * está vencida mostramos el sensor como
   * libre a efectos operativos.
   *
   * Conservamos el original para diagnóstico.
   */

  const estadoSensorEfectivo =
    sensorReciente
      ? estadoSensorOriginal
      : 'libre'


  return {

    ...espacio,


    estado_sensor_original:
      estadoSensorOriginal,


    estado_sensor:
      estadoSensorEfectivo,


    sensor_reciente:
      sensorReciente,


    lectura_vencida:
      !sensorReciente,


    ocupado_fisicamente:
      ocupadoFisicamente,


    reservado,


    disponible,


    vehiculo,


    identificado:
      Boolean(
        vehiculo,
      ),


    estado_operativo:
      estadoOperativo,


    /*
     * Rojo:
     *
     * reserva
     * asignación
     * sensor físico reciente
     *
     * Verde:
     *
     * ningún estado anterior.
     */

    estado:
      disponible
        ? 'libre'
        : 'ocupado',

  }
}


/* ================================================================
   HOOK
   ================================================================ */

export default function usePuestos() {
  const parking =
    useParkingContext()


  useEffect(
    () => {

      parking.activar()

    },
    [
      parking.activar,
    ],
  )


  /* ==============================================================
     ESPACIOS NORMALIZADOS
     ============================================================== */

  const espacios =
    useMemo(
      () =>

        parking.espacios.map(
          normalizarEspacio,
        ),

      [
        parking.espacios,
      ],
    )


  /* ==============================================================
     ESTADÍSTICAS REALES
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


          disponibles,

          reservados,

          ocupadosFisicos,

          noDisponibles,


          /*
           * Compatibilidad con otros
           * componentes antiguos.
           */

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


  return {

    espacios,


    cargando:
      parking.cargando,


    actualizando:
      parking.actualizando,


    error:
      parking.error,


    estadisticas,


    ultimaCarga:
      parking.ultimaCarga,


    recargarRelaciones:
      parking.recargarRelaciones,

  }
}