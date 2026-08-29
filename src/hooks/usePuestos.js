import {
  useEffect,
} from 'react'

import {
  useParkingContext,
} from '../context/ParkingContext'


export default function usePuestos() {
  const parking =
    useParkingContext()


  /*
   * La primera vista que necesite
   * información del parqueadero activa
   * el servicio compartido.
   *
   * Después permanecerá en memoria
   * mientras el usuario navega por la app.
   */

  useEffect(
    () => {

      parking.activar()

    },
    [
      parking.activar,
    ],
  )


  return {

    espacios:
      parking.espacios,

    cargando:
      parking.cargando,

    actualizando:
      parking.actualizando,

    error:
      parking.error,

    estadisticas:
      parking.estadisticas,

    ultimaCarga:
      parking.ultimaCarga,

    recargarRelaciones:
      parking.recargarRelaciones,

  }
}