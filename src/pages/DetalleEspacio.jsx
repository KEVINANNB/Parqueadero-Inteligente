import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CFormLabel,
  CFormSelect,
  CSpinner,
} from '@coreui/react'

import useEspacio
  from '../hooks/useEspacio'

import useHistorialEspacio
  from '../hooks/useHistorialEspacio'

import useMiCuenta
  from '../hooks/useMiCuenta'

import {
  useAuth,
} from '../context/AuthContext'

import HistorialEspacio
  from '../components/HistorialEspacio'


/* ================================================================
   FECHA
   ================================================================ */

function formatoFecha(
  timestamp,
) {
  if (
    !timestamp
  ) {
    return '—'
  }


  try {

    return new Date(
      timestamp,
    ).toLocaleString(
      'es-EC',
      {

        day:
          '2-digit',

        month:
          'short',

        year:
          'numeric',

        hour:
          '2-digit',

        minute:
          '2-digit',

      },
    )

  } catch {

    return '—'

  }
}


/* ================================================================
   CÓDIGO
   ================================================================ */

function codigoEspacio(
  espacio,
) {
  if (
    espacio
      ?.codigo_puesto
  ) {
    return (
      espacio.codigo_puesto
    )
  }


  return (
    espacio?.etiqueta ||
    '—'
  )
}


/* ================================================================
   ESTADO PARA EL USUARIO
   ================================================================ */

function obtenerEstado(
  espacio,
) {
  if (
    !espacio
  ) {
    return {
      texto:
        'Sin datos',

      color:
        'secondary',
    }
  }


  if (
    espacio
      .estado_operativo ===
    'reservado'
  ) {

    return {
      texto:
        'Reservado',

      color:
        'danger',
    }

  }


  if (
    espacio
      .estado_operativo ===
    'ocupado_identificado'
  ) {

    return {
      texto:
        'Ocupado identificado',

      color:
        'danger',
    }

  }


  if (
    espacio
      .estado_operativo ===
    'ocupado_sin_identificar'
  ) {

    return {
      texto:
        'Ocupado sin identificar',

      color:
        'warning',
    }

  }


  if (
    espacio
      .estado_operativo ===
    'asignado'
  ) {

    return {
      texto:
        'Asignado',

      color:
        'danger',
    }

  }


  if (
    espacio
      .estado_operativo ===
    'disponible'
  ) {

    return {
      texto:
        'Disponible',

      color:
        'success',
    }

  }


  return {
    texto:
      'Sin datos',

    color:
      'secondary',
  }
}


/* ================================================================
   MINI VEHÍCULO
   ================================================================ */

function VehiculoResumen({
  vehiculo,
}) {
  if (
    !vehiculo
  ) {
    return null
  }


  return (
    <CCard
      className="border-0"

      style={{
        background:
          '#f8fafc',
      }}
    >

      <CCardBody>

        <div
          style={{
            display:
              'flex',

            gap:
              14,

            alignItems:
              'center',
          }}
        >

          {vehiculo.foto_url ? (

            <img

              src={
                vehiculo.foto_url
              }

              alt={
                vehiculo.placa
              }

              loading="lazy"

              decoding="async"

              style={{
                width:
                  105,

                height:
                  70,

                objectFit:
                  'cover',

                borderRadius:
                  9,

                border:
                  '1px solid #d1d5db',
              }}

            />

          ) : (

            <div
              style={{
                width:
                  105,

                height:
                  70,

                display:
                  'grid',

                placeItems:
                  'center',

                borderRadius:
                  9,

                background:
                  '#e5e7eb',

                color:
                  '#64748b',

                fontSize:
                  11,
              }}
            >
              Sin foto
            </div>

          )}


          <div>

            <CBadge
              color="dark"
              className="mb-2"
            >
              {
                vehiculo.placa
              }
            </CBadge>


            <h5 className="mb-1">

              {
                vehiculo.marca
              }

              {' '}

              {
                vehiculo.modelo
              }

            </h5>


            <div className="small text-body-secondary">

              {
                vehiculo
                  .propietario_nombre
              }

            </div>

          </div>

        </div>

      </CCardBody>

    </CCard>
  )
}


/* ================================================================
   DETALLE
   ================================================================ */

export default function DetalleEspacio() {
  const {
    id,
  } =
    useParams()


  const {
    usuario,
  } =
    useAuth()


  const {
    espacio,
    cargando,
    reservarVehiculo,
    cancelarReserva,
  } =
    useEspacio(
      id,
    )


  const {
    historial,
    cargando:
      cargandoHistorial,
  } =
    useHistorialEspacio(
      id,
    )


  const {
    vehiculos,
    cargando:
      cargandoCuenta,
  } =
    useMiCuenta()


  const [
    vehiculoSeleccionado,
    setVehiculoSeleccionado,
  ] =
    useState('')


  const [
    procesando,
    setProcesando,
  ] =
    useState(false)


  const [
    mensaje,
    setMensaje,
  ] =
    useState(null)


  /* ==============================================================
     VEHÍCULOS AUTORIZADOS DEL USUARIO
     ============================================================== */

  const vehiculosAutorizados =
    useMemo(
      () =>

        vehiculos.filter(
          (
            vehiculo,
          ) =>
            vehiculo.autorizado,
        ),

      [
        vehiculos,
      ],
    )


  useEffect(
    () => {

      if (
        vehiculosAutorizados
          .length ===
        0
      ) {

        setVehiculoSeleccionado(
          '',
        )

        return

      }


      const existe =
        vehiculosAutorizados
          .some(
            (
              vehiculo,
            ) =>
              String(
                vehiculo.id,
              ) ===
              String(
                vehiculoSeleccionado,
              ),
          )


      if (
        !existe
      ) {

        setVehiculoSeleccionado(
          String(
            vehiculosAutorizados[0]
              .id,
          ),
        )

      }

    },
    [
      vehiculosAutorizados,
      vehiculoSeleccionado,
    ],
  )


  /* ==============================================================
     CARGA
     ============================================================== */

  if (
    cargando
  ) {

    return (
      <div className="text-center py-5">

        <CSpinner
          color="success"
        />


        <p className="mt-3">
          Cargando espacio...
        </p>

      </div>
    )

  }


  if (
    !espacio
  ) {

    return (
      <div>

        <CAlert color="danger">

          No se encontró el espacio{' '}

          <strong>
            {id}
          </strong>

          .

        </CAlert>


        <Link
          to="/parqueadero/mapa"
        >
          ← Volver al mapa
        </Link>

      </div>
    )

  }


  /* ==============================================================
     VARIABLES DEL ESPACIO
     ============================================================== */

  const estado =
    obtenerEstado(
      espacio,
    )


  const tieneReserva =
    Boolean(
      espacio.reserva,
    )


  const reservaPropia =
    espacio
      .reserva
      ?.usuario_id ===
    usuario?.id


  const tieneOcupacion =
    Boolean(
      espacio.ocupacion,
    )


  const disponible =
    espacio.disponible


  const vehiculoActual =
    espacio.vehiculo


  const numero =
    String(
      espacio.numero ||
      '',
    )
      .padStart(
        2,
        '0',
      )


  /* ==============================================================
     RESERVAR
     ============================================================== */

  const reservar =
    async () => {

      if (
        !vehiculoSeleccionado
      ) {

        setMensaje({

          tipo:
            'warning',

          texto:
            'Selecciona primero el vehículo que utilizarás.',

        })

        return

      }


      setProcesando(
        true,
      )


      setMensaje(
        null,
      )


      const resultado =
        await reservarVehiculo(
          Number(
            vehiculoSeleccionado,
          ),
        )


      setProcesando(
        false,
      )


      if (
        resultado.ok
      ) {

        setMensaje({

          tipo:
            'success',

          texto:
            `El espacio ${codigoEspacio(
              espacio,
            )} fue reservado correctamente.`,

        })

      } else {

        setMensaje({

          tipo:
            'danger',

          texto:
            resultado.error,

        })

      }

    }


  /* ==============================================================
     CANCELAR
     ============================================================== */

  const cancelar =
    async () => {

      setProcesando(
        true,
      )


      setMensaje(
        null,
      )


      const resultado =
        await cancelarReserva()


      setProcesando(
        false,
      )


      if (
        resultado.ok
      ) {

        setMensaje({

          tipo:
            'success',

          texto:
            'La reserva fue liberada correctamente.',

        })

      } else {

        setMensaje({

          tipo:
            'danger',

          texto:
            resultado.error,

        })

      }

    }


  /* ==============================================================
     RENDER
     ============================================================== */

  return (
    <>

      {/* ========================================================
          CABECERA
          ======================================================== */}

      <div
        className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
      >

        <Link
          to="/parqueadero/mapa"
          className="text-decoration-none"
        >
          ← Volver al mapa
        </Link>


        <CBadge
          color={
            estado.color
          }

          className="px-3 py-2"
        >
          {
            estado.texto
          }
        </CBadge>

      </div>


      {mensaje && (

        <CAlert
          color={
            mensaje.tipo
          }
        >
          {
            mensaje.texto
          }
        </CAlert>

      )}


      {/* ========================================================
          DOS COLUMNAS
          ======================================================== */}

      <div
        style={{
          display:
            'grid',

          gridTemplateColumns:
            'minmax(0, 1.25fr) minmax(330px, .75fr)',

          gap:
            24,

          alignItems:
            'start',
        }}
      >

        {/* ======================================================
            IZQUIERDA
            ====================================================== */}

        <div>

          <CCard className="shadow-sm mb-4">

            <CCardBody className="p-4">

              <small
                className="text-success fw-semibold"
              >
                ESPACIO DEL PARQUEADERO
              </small>


              <div
                className="d-flex flex-wrap justify-content-between align-items-end gap-3 mt-2 mb-4"
              >

                <div>

                  <h1 className="mb-1">

                    Espacio{' '}

                    {
                      codigoEspacio(
                        espacio,
                      )
                    }

                  </h1>


                  <p className="text-body-secondary mb-0">

                    Zona de estacionamiento
                    Smart Parking UTEQ

                  </p>

                </div>


                <div
                  className="text-end"
                >

                  <div
                    className="small text-body-secondary"
                  >
                    Distancia del sensor
                  </div>


                  <div
                    style={{
                      fontSize:
                        28,

                      fontWeight:
                        700,
                    }}
                  >

                    {
                      espacio
                        .distanciaDetectada
                    }

                    {' '}cm

                  </div>

                </div>

              </div>


              {/* ===============================================
                  DATOS ÚTILES
                  =============================================== */}

              <div
                style={{
                  display:
                    'grid',

                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(180px, 1fr))',

                  gap:
                    12,
                }}
              >

                {/* CÓDIGO */}

                <div className="border rounded p-3">

                  <small className="text-body-secondary">
                    Código del espacio
                  </small>


                  <div className="fw-bold fs-5 mt-1">

                    {
                      codigoEspacio(
                        espacio,
                      )
                    }

                  </div>

                </div>


                {/* ZONA */}

                <div className="border rounded p-3">

                  <small className="text-body-secondary">
                    Zona / columna
                  </small>


                  <div className="fw-bold fs-5 mt-1">

                    Columna{' '}

                    {
                      espacio.columna
                    }

                  </div>

                </div>


                {/* NÚMERO */}

                <div className="border rounded p-3">

                  <small className="text-body-secondary">
                    Número
                  </small>


                  <div className="fw-bold fs-5 mt-1">

                    {
                      numero
                    }

                  </div>

                </div>


                {/* SENSOR */}

                <div className="border rounded p-3">

                  <small className="text-body-secondary">
                    Sensor
                  </small>


                  <div className="fw-bold mt-1">

                    {
                      espacio.id
                    }

                  </div>

                </div>


                {/* SENSOR FÍSICO */}

                <div className="border rounded p-3">

                  <small className="text-body-secondary">
                    Estado del sensor
                  </small>


                  <div className="mt-1">

                    <CBadge
                      color={
                        espacio
                          .estado_sensor ===
                        'libre'
                          ? 'success'
                          : 'danger'
                      }
                    >

                      {
                        espacio
                          .estado_sensor ===
                        'libre'
                          ? 'Libre'
                          : 'Ocupado'
                      }

                    </CBadge>

                  </div>

                </div>


                {/* DISPONIBILIDAD */}

                <div className="border rounded p-3">

                  <small className="text-body-secondary">
                    Disponibilidad
                  </small>


                  <div className="mt-1">

                    <CBadge
                      color={
                        estado.color
                      }
                    >

                      {
                        estado.texto
                      }

                    </CBadge>

                  </div>

                </div>


                {/* ACTUALIZACIÓN */}

                <div
                  className="border rounded p-3"

                  style={{
                    gridColumn:
                      'span 2',
                  }}
                >

                  <small className="text-body-secondary">
                    Última lectura del sensor
                  </small>


                  <div className="fw-semibold mt-1">

                    {
                      formatoFecha(
                        espacio.fechaHora,
                      )
                    }

                  </div>

                </div>

              </div>

            </CCardBody>

          </CCard>


          {/* ====================================================
              HISTORIAL
              ==================================================== */}

          <CCard className="shadow-sm">

            <CCardBody className="p-4">

              <div
                className="d-flex justify-content-between align-items-center mb-3"
              >

                <h5 className="mb-0">
                  Historial reciente
                </h5>


                <span className="small text-body-secondary">

                  {
                    historial.length
                  }

                  {' '}eventos

                </span>

              </div>


              <HistorialEspacio

                historial={
                  historial
                }

                cargando={
                  cargandoHistorial
                }

              />

            </CCardBody>

          </CCard>

        </div>


        {/* ======================================================
            DERECHA: RESERVA
            ====================================================== */}

        <CCard className="shadow-sm">

          <CCardBody className="p-4">

            <small className="text-success fw-semibold">

              GESTIÓN DEL ESPACIO

            </small>


            <h4 className="mt-2">

              {
                disponible

                  ? 'Reservar este espacio'

                  : reservaPropia

                    ? 'Tu reserva'

                    : tieneReserva

                      ? 'Espacio reservado'

                      : tieneOcupacion ||
                        espacio
                          .ocupado_fisicamente

                        ? 'Espacio ocupado'

                        : 'Estado del espacio'
              }

            </h4>


            {/* ===============================================
                DISPONIBLE
                =============================================== */}

            {disponible && (

              <>

                <p className="text-body-secondary">

                  Selecciona cuál de tus
                  vehículos utilizará
                  este espacio.

                </p>


                {cargandoCuenta ? (

                  <div className="text-center py-4">

                    <CSpinner
                      color="success"
                    />

                  </div>

                ) : vehiculosAutorizados
                    .length >
                  0 ? (

                  <>

                    <div className="mb-3">

                      <CFormLabel>

                        Vehículo

                      </CFormLabel>


                      <CFormSelect

                        value={
                          vehiculoSeleccionado
                        }

                        onChange={(
                          evento,
                        ) =>
                          setVehiculoSeleccionado(
                            evento
                              .target
                              .value,
                          )
                        }

                      >

                        {vehiculosAutorizados
                          .map(
                            (
                              vehiculo,
                            ) => (

                              <option

                                key={
                                  vehiculo.id
                                }

                                value={
                                  vehiculo.id
                                }

                              >

                                {
                                  vehiculo.placa
                                }

                                {' · '}

                                {
                                  vehiculo.marca
                                }

                                {' '}

                                {
                                  vehiculo.modelo
                                }

                              </option>

                            ),
                          )}

                      </CFormSelect>

                    </div>


                    <CAlert
                      color="info"
                      className="small"
                    >

                      Solo aparecen
                      vehículos previamente
                      autorizados por un
                      administrador.

                    </CAlert>


                    <CButton

                      color="success"

                      className="w-100"

                      disabled={
                        procesando
                      }

                      onClick={
                        reservar
                      }

                    >

                      {procesando
                        ? 'Reservando...'
                        : 'Reservar este espacio'}

                    </CButton>

                  </>

                ) : (

                  <CAlert color="warning">

                    No tienes vehículos
                    autorizados disponibles.


                    <div className="mt-3">

                      <Link
                        to="/cuenta/vehiculos"
                      >
                        Ver mis vehículos
                      </Link>

                    </div>

                  </CAlert>

                )}

              </>

            )}


            {/* ===============================================
                RESERVA
                =============================================== */}

            {tieneReserva && (

              <>

                <div className="mb-3">

                  <VehiculoResumen
                    vehiculo={
                      vehiculoActual
                    }
                  />

                </div>


                <div
                  className="border rounded p-3 mb-3"
                >

                  <small className="text-body-secondary">

                    Reservado desde

                  </small>


                  <div className="fw-semibold mt-1">

                    {
                      formatoFecha(
                        espacio
                          .reserva
                          ?.fecha_reserva,
                      )
                    }

                  </div>

                </div>


                {reservaPropia ? (

                  <>

                    <CAlert color="success">

                      Este espacio está
                      reservado por tu
                      cuenta.

                    </CAlert>


                    <CButton

                      color="danger"

                      variant="outline"

                      className="w-100"

                      disabled={
                        procesando
                      }

                      onClick={
                        cancelar
                      }

                    >

                      {
                        espacio
                          .ocupado_fisicamente

                          ? 'Finalizar uso del espacio'

                          : 'Cancelar reserva'
                      }

                    </CButton>

                  </>

                ) : (

                  <CAlert color="warning">

                    Otro usuario ya
                    reservó este espacio.

                  </CAlert>

                )}

              </>

            )}


            {/* ===============================================
                OCUPACIÓN SIN RESERVA
                =============================================== */}

            {!tieneReserva &&
              !disponible &&
              (
                tieneOcupacion ||
                espacio
                  .ocupado_fisicamente
              ) && (

              <>

                {vehiculoActual ? (

                  <VehiculoResumen
                    vehiculo={
                      vehiculoActual
                    }
                  />

                ) : (

                  <CAlert color="warning">

                    <strong>
                      Vehículo sin identificar.
                    </strong>

                    <br />

                    El sensor detecta
                    ocupación, pero no
                    existe una reserva
                    ni vehículo relacionado
                    con este espacio.

                  </CAlert>

                )}

              </>

            )}

          </CCardBody>

        </CCard>

      </div>


      {/* RESPONSIVE */}

      <style>{`

        @media (
          max-width: 900px
        ) {

          .app-main > div
          > div[style*="grid-template-columns"] {
            grid-template-columns:
              1fr !important;
          }

        }

      `}</style>

    </>
  )
}