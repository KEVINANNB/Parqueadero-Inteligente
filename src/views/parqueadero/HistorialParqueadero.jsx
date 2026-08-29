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
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

import {
  db,
} from '../../services/firebase'

import {
  supabase,
} from '../../lib/supabase'

import {
  useAuth,
} from '../../context/AuthContext'


/* ================================================================
   CONFIGURACIÓN
   ================================================================ */

const LIMITE_VISUAL =
  500


/* ================================================================
   TIMESTAMP
   ================================================================ */

function normalizarTimestamp(
  valor,
) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return 0
  }


  /*
   * Supabase devuelve ISO.
   */

  if (
    typeof valor ===
    'string'
  ) {

    const convertido =
      new Date(
        valor,
      ).getTime()


    if (
      Number.isFinite(
        convertido,
      )
    ) {
      return convertido
    }

  }


  /*
   * Firebase normalmente utiliza
   * timestamp numérico.
   */

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
   * segundos → milisegundos
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
   FECHA
   ================================================================ */

function formatearFecha(
  valor,
) {
  const timestamp =
    normalizarTimestamp(
      valor,
    )


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
          '2-digit',

        year:
          'numeric',

        hour:
          '2-digit',

        minute:
          '2-digit',

        second:
          '2-digit',

      },
    )

  } catch {

    return '—'

  }
}


/* ================================================================
   COLOR DEL EVENTO
   ================================================================ */

function colorEvento(
  evento,
) {
  if (
    evento.tipo ===
    'reserva'
  ) {

    if (
      evento.tipo_evento ===
      'reserva_creada'
    ) {
      return 'warning'
    }


    return 'secondary'

  }


  if (
    evento.estado ===
    'libre'
  ) {
    return 'success'
  }


  if (
    evento.estado ===
    'ocupado'
  ) {
    return 'danger'
  }


  return 'secondary'
}


/* ================================================================
   TEXTO DEL EVENTO
   ================================================================ */

function textoEvento(
  evento,
) {
  if (
    evento.tipo ===
    'reserva'
  ) {

    if (
      evento.tipo_evento ===
      'reserva_creada'
    ) {
      return 'Reserva'
    }


    if (
      evento.tipo_evento ===
      'reserva_cancelada'
    ) {
      return 'Reserva cancelada'
    }


    return 'Reserva'

  }


  if (
    evento.estado ===
    'libre'
  ) {
    return 'Libre'
  }


  if (
    evento.estado ===
    'ocupado'
  ) {
    return 'Ocupado'
  }


  return (
    evento.estado ||
    'Sin datos'
  )
}


/* ================================================================
   COMPONENTE
   ================================================================ */

export default function HistorialParqueadero() {
  const {
    usuario,
    esAdmin,
  } =
    useAuth()


  /* ==============================================================
     FIREBASE

     SOLAMENTE ADMIN.
     ============================================================== */

  const [
    eventosSensores,
    setEventosSensores,
  ] =
    useState([])


  const [
    cargandoSensores,
    setCargandoSensores,
  ] =
    useState(
      esAdmin,
    )


  const [
    errorSensores,
    setErrorSensores,
  ] =
    useState(null)


  /* ==============================================================
     SUPABASE
     ============================================================== */

  const [
    eventosReservas,
    setEventosReservas,
  ] =
    useState([])


  const [
    cargandoReservas,
    setCargandoReservas,
  ] =
    useState(true)


  const [
    errorReservas,
    setErrorReservas,
  ] =
    useState(null)


  /* ==============================================================
     MAPA SENSOR → PUESTO
     ============================================================== */

  const [
    puestosPorSensor,
    setPuestosPorSensor,
  ] =
    useState(
      new Map(),
    )


  /* ==============================================================
     BÚSQUEDA
     ============================================================== */

  const [
    busqueda,
    setBusqueda,
  ] =
    useState('')


  /* ==============================================================
     FILTRO
     ============================================================== */

  const [
    filtro,
    setFiltro,
  ] =
    useState('todos')


  /* ==============================================================
     CARGAR PUESTOS
     ============================================================== */

  useEffect(
    () => {

      /*
       * Solo el administrador necesita
       * traducir los sensores Firebase
       * a códigos A01, B06, etc.
       */

      if (
        !esAdmin
      ) {
        return
      }


      let activo =
        true


      const cargar =
        async () => {

          const {
            data,
            error,
          } =
            await supabase
              .from(
                'puestos',
              )
              .select(`
                id,
                sensor_id_rtdb,
                codigo_integracion
              `)


          if (
            !activo
          ) {
            return
          }


          if (
            error
          ) {
            console.error(
              'Error cargando puestos:',
              error,
            )

            return
          }


          const mapa =
            new Map()


          ;(
            data ||
            []
          ).forEach(
            (
              puesto,
            ) => {

              mapa.set(
                puesto.sensor_id_rtdb,
                puesto.codigo_integracion,
              )

            },
          )


          setPuestosPorSensor(
            mapa,
          )

        }


      cargar()


      return () => {

        activo =
          false

      }

    },
    [
      esAdmin,
    ],
  )


  /* ==============================================================
     FIREBASE - HISTORIAL GENERAL
     SOLO ADMINISTRADOR
     ============================================================== */

  useEffect(
    () => {

      /*
       * USUARIO NORMAL:
       *
       * NO consulta historial global
       * de Firebase.
       */

      if (
        !esAdmin
      ) {

        setEventosSensores(
          [],
        )


        setCargandoSensores(
          false,
        )


        setErrorSensores(
          null,
        )


        return undefined
      }


      setCargandoSensores(
        true,
      )


      const historialRef =
        ref(
          db,
          'historial',
        )


      const unsubscribe =
        onValue(

          historialRef,

          (
            snapshot,
          ) => {

            const datos =
              snapshot.val() ||
              {}


            const lista =
              Object.entries(
                datos,
              )
                .flatMap(
                  ([
                    sensorId,
                    eventosEspacio,
                  ]) => {

                    if (
                      !eventosEspacio ||
                      typeof eventosEspacio !==
                        'object'
                    ) {
                      return []
                    }


                    return Object.entries(
                      eventosEspacio,
                    )
                      .map(
                        ([
                          eventoId,
                          evento,
                        ]) => {

                          const timestamp =
                            normalizarTimestamp(
                              evento.fechaHora,
                            )


                          return {

                            ...evento,


                            id_evento:
                              `sensor-${sensorId}-${eventoId}`,


                            tipo:
                              'sensor',


                            sensorId,


                            eventoId,


                            timestamp,

                          }

                        },
                      )

                  },
                )
                .sort(
                  (
                    a,
                    b,
                  ) =>
                    b.timestamp -
                    a.timestamp,
                )


            setEventosSensores(
              lista,
            )


            setErrorSensores(
              null,
            )


            setCargandoSensores(
              false,
            )

          },

          (
            errorFirebase,
          ) => {

            console.error(
              'Error Firebase:',
              errorFirebase,
            )


            setErrorSensores(
              errorFirebase,
            )


            setCargandoSensores(
              false,
            )

          },

        )


      return () =>
        unsubscribe()

    },
    [
      esAdmin,
    ],
  )


  /* ==============================================================
     CARGAR HISTORIAL DE RESERVAS
     ============================================================== */

  const cargarReservas =
    useCallback(
      async () => {

        if (
          !usuario
        ) {
          setEventosReservas(
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


        setErrorReservas(
          null,
        )


        /*
         * No agregamos .eq(usuario_id).
         *
         * RLS decide:
         *
         * ADMIN → todas.
         *
         * USUARIO → solamente propias.
         */

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
            .order(
              'fecha_evento',
              {
                ascending:
                  false,
              },
            )
            .limit(
              1000,
            )


        if (
          error
        ) {

          console.error(
            'Error historial reservas:',
            error,
          )


          setErrorReservas(
            error,
          )


          setEventosReservas(
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
                  normalizarTimestamp(
                    evento.fecha_evento,
                  ),

              }),
            )


        setEventosReservas(
          lista,
        )


        setCargandoReservas(
          false,
        )

      },
      [
        usuario,
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
     SUPABASE REALTIME
     ============================================================== */

  useEffect(
    () => {

      if (
        !usuario
      ) {
        return undefined
      }


      const canal =
        supabase
          .channel(
            `historial-general-${
              usuario.id
            }`,
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

            },

            () => {

              /*
               * Volvemos a consultar.
               *
               * RLS filtra nuevamente
               * lo que cada usuario
               * tiene permiso de ver.
               */

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
      usuario,
      cargarReservas,
    ],
  )


  /* ==============================================================
     UNIR HISTORIALES
     ============================================================== */

  const eventos =
    useMemo(
      () => {

        /*
         * ADMIN:
         *
         * Firebase sensores
         * +
         * Supabase reservas.
         */

        if (
          esAdmin
        ) {

          return [

            ...eventosSensores,

            ...eventosReservas,

          ]
            .sort(
              (
                a,
                b,
              ) =>
                b.timestamp -
                a.timestamp,
            )

        }


        /*
         * USUARIO NORMAL:
         *
         * exclusivamente eventos
         * asociados a su cuenta.
         */

        return eventosReservas
          .slice()
          .sort(
            (
              a,
              b,
            ) =>
              b.timestamp -
              a.timestamp,
          )

      },
      [
        esAdmin,
        eventosSensores,
        eventosReservas,
      ],
    )


  /* ==============================================================
     FILTRAR
     ============================================================== */

  const filtrados =
    useMemo(
      () => {

        const texto =
          busqueda
            .trim()
            .toLowerCase()


        let lista =
          eventos


        /* ========================================================
           FILTRO TIPO
           ======================================================== */

        if (
          filtro ===
          'sensores'
        ) {

          lista =
            lista.filter(
              (
                evento,
              ) =>
                evento.tipo ===
                'sensor',
            )

        }


        if (
          filtro ===
          'reservas'
        ) {

          lista =
            lista.filter(
              (
                evento,
              ) =>
                evento.tipo ===
                'reserva',
            )

        }


        if (
          !texto
        ) {

          return lista.slice(
            0,
            LIMITE_VISUAL,
          )

        }


        return lista
          .filter(
            (
              evento,
            ) => {

              const codigo =
                evento.codigo_puesto
                ||
                puestosPorSensor.get(
                  evento.sensorId,
                )
                ||
                evento.etiqueta
                ||
                ''


              return [

                codigo,

                evento.sensorId,

                evento.sensor_id_rtdb,

                evento.estado,

                evento.tipo_evento,

                evento.placa,

                evento.marca,

                evento.modelo,

                evento.propietario_nombre,

                evento.distanciaDetectada,

              ]
                .some(
                  (
                    valor,
                  ) =>
                    String(
                      valor ??
                      '',
                    )
                      .toLowerCase()
                      .includes(
                        texto,
                      ),
                )

            },
          )
          .slice(
            0,
            LIMITE_VISUAL,
          )

      },
      [
        eventos,
        busqueda,
        filtro,
        puestosPorSensor,
      ],
    )


  /* ==============================================================
     CARGANDO
     ============================================================== */

  const cargando =
    cargandoReservas

    ||

    (
      esAdmin &&
      cargandoSensores
    )


  /* ==============================================================
     ERROR
     ============================================================== */

  const error =
    errorReservas

    ||

    (
      esAdmin
        ? errorSensores
        : null
    )


  /* ==============================================================
     RENDER
     ============================================================== */

  return (
    <CCard className="shadow-sm">

      {/* ========================================================
          HEADER
          ======================================================== */}

      <CCardHeader>

        <div
          className="d-flex flex-wrap justify-content-between align-items-center gap-3"
        >

          <div>

            <strong>

              {
                esAdmin
                  ? 'Historial general'
                  : 'Mi historial'
              }

            </strong>


            <div
              className="small text-body-secondary mt-1"
            >

              {esAdmin ? (

                <>
                  Eventos de los 80
                  sensores y reservas
                  realizadas en el
                  parqueadero.
                </>

              ) : (

                <>
                  Reservas y movimientos
                  asociados exclusivamente
                  a tu cuenta.
                </>

              )}

            </div>

          </div>


          <CBadge
            color={
              esAdmin
                ? 'warning'
                : 'success'
            }

            textColor={
              esAdmin
                ? 'dark'
                : undefined
            }
          >

            {
              esAdmin
                ? 'Administrador'
                : 'Usuario'
            }

          </CBadge>

        </div>

      </CCardHeader>


      <CCardBody>

        {/* ======================================================
            INFORMACIÓN USUARIO NORMAL
            ====================================================== */}

        {!esAdmin && (

          <CAlert
            color="info"
            className="mb-3"
          >

            <strong>
              Historial privado.
            </strong>

            {' '}

            Solo puedes consultar los
            registros relacionados con
            tu propia cuenta y tus
            vehículos.

          </CAlert>

        )}


        {/* ======================================================
            CONTROLES
            ====================================================== */}

        <div
          className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3"
        >

          <CFormInput

            type="search"

            placeholder={
              esAdmin

                ? 'Buscar sensor, puesto, vehículo, propietario...'

                : 'Buscar espacio, placa o vehículo...'
            }

            value={
              busqueda
            }

            onChange={(
              evento,
            ) =>
              setBusqueda(
                evento
                  .target
                  .value,
              )
            }

            style={{
              maxWidth:
                470,
            }}

          />


          <div className="text-body-secondary">

            <strong>
              {
                eventos.length
              }
            </strong>

            {' '}

            {
              esAdmin
                ? 'eventos registrados'
                : 'eventos propios'
            }

          </div>

        </div>


        {/* ======================================================
            FILTROS ADMIN
            ====================================================== */}

        {esAdmin && (

          <div
            className="d-flex flex-wrap gap-2 mb-3"
          >

            <CButton

              size="sm"

              color={
                filtro ===
                'todos'
                  ? 'primary'
                  : 'secondary'
              }

              variant={
                filtro ===
                'todos'
                  ? undefined
                  : 'outline'
              }

              onClick={() =>
                setFiltro(
                  'todos',
                )
              }
            >
              Todos
            </CButton>


            <CButton

              size="sm"

              color={
                filtro ===
                'sensores'
                  ? 'primary'
                  : 'secondary'
              }

              variant={
                filtro ===
                'sensores'
                  ? undefined
                  : 'outline'
              }

              onClick={() =>
                setFiltro(
                  'sensores',
                )
              }
            >
              Sensores
            </CButton>


            <CButton

              size="sm"

              color={
                filtro ===
                'reservas'
                  ? 'warning'
                  : 'secondary'
              }

              variant={
                filtro ===
                'reservas'
                  ? undefined
                  : 'outline'
              }

              onClick={() =>
                setFiltro(
                  'reservas',
                )
              }
            >
              Reservas
            </CButton>

          </div>

        )}


        {/* ======================================================
            CARGANDO
            ====================================================== */}

        {cargando && (

          <div className="text-center py-5">

            <CSpinner
              color="success"
            />


            <p className="mt-3">

              Cargando historial...

            </p>

          </div>

        )}


        {/* ======================================================
            ERROR
            ====================================================== */}

        {error && (

          <CAlert color="danger">

            <strong>
              No se pudo cargar
              el historial.
            </strong>


            <div className="mt-1">

              {
                error.message ||
                String(
                  error,
                )
              }

            </div>

          </CAlert>

        )}


        {/* ======================================================
            SIN HISTORIAL
            ====================================================== */}

        {!cargando &&
          !error &&
          eventos.length ===
            0 && (

          <CAlert color="secondary">

            {esAdmin ? (

              <>
                Aún no existen eventos
                registrados.
              </>

            ) : (

              <>
                Todavía no tienes
                movimientos registrados.

                Cuando reserves o
                canceles un espacio,
                aparecerá aquí.
              </>

            )}

          </CAlert>

        )}


        {/* ======================================================
            TABLA
            ====================================================== */}

        {!cargando &&
          !error &&
          eventos.length >
            0 && (

          <CTable
            responsive
            hover
            bordered
            align="middle"
          >

            <CTableHead color="light">

              <CTableRow>

                <CTableHeaderCell>
                  Fecha
                </CTableHeaderCell>


                <CTableHeaderCell>
                  Tipo
                </CTableHeaderCell>


                <CTableHeaderCell>
                  Espacio
                </CTableHeaderCell>


                {esAdmin && (

                  <CTableHeaderCell>
                    Sensor
                  </CTableHeaderCell>

                )}


                <CTableHeaderCell>

                  {
                    esAdmin
                      ? 'Vehículo / dato'
                      : 'Vehículo'
                  }

                </CTableHeaderCell>


                <CTableHeaderCell>
                  Estado
                </CTableHeaderCell>


                {esAdmin && (

                  <CTableHeaderCell>
                    Propietario
                  </CTableHeaderCell>

                )}

              </CTableRow>

            </CTableHead>


            <CTableBody>

              {filtrados.map(
                (
                  evento,
                ) => {

                  const esReserva =
                    evento.tipo ===
                    'reserva'


                  const codigo =
                    evento.codigo_puesto

                    ||

                    puestosPorSensor.get(
                      evento.sensorId,
                    )

                    ||

                    evento.etiqueta

                    ||

                    '—'


                  const sensor =
                    evento.sensorId

                    ||

                    evento
                      .sensor_id_rtdb

                    ||

                    '—'


                  return (

                    <CTableRow
                      key={
                        evento.id_evento
                      }
                    >

                      {/* FECHA */}

                      <CTableDataCell>

                        {
                          formatearFecha(
                            evento.timestamp,
                          )
                        }

                      </CTableDataCell>


                      {/* TIPO */}

                      <CTableDataCell>

                        <CBadge
                          color={
                            esReserva
                              ? 'warning'
                              : 'info'
                          }

                          textColor={
                            esReserva
                              ? 'dark'
                              : undefined
                          }
                        >

                          {
                            esReserva
                              ? 'Reserva'
                              : 'Sensor'
                          }

                        </CBadge>

                      </CTableDataCell>


                      {/* ESPACIO */}

                      <CTableDataCell>

                        <strong>
                          {
                            codigo
                          }
                        </strong>

                      </CTableDataCell>


                      {/* SENSOR ADMIN */}

                      {esAdmin && (

                        <CTableDataCell>

                          <code>
                            {
                              sensor
                            }
                          </code>

                        </CTableDataCell>

                      )}


                      {/* VEHÍCULO / DATO */}

                      <CTableDataCell>

                        {esReserva ? (

                          <>

                            <strong>
                              {
                                evento.placa ||
                                '—'
                              }
                            </strong>


                            {(evento.marca ||
                              evento.modelo) && (

                              <div className="small text-body-secondary">

                                {
                                  evento.marca
                                }

                                {' '}

                                {
                                  evento.modelo
                                }

                              </div>

                            )}

                          </>

                        ) : (

                          <>

                            {
                              evento
                                .distanciaDetectada
                              ??
                              '—'
                            }


                            {
                              evento
                                .distanciaDetectada !=
                              null
                                ? ' cm'
                                : ''
                            }

                          </>

                        )}

                      </CTableDataCell>


                      {/* ESTADO */}

                      <CTableDataCell>

                        <CBadge
                          color={
                            colorEvento(
                              evento,
                            )
                          }
                        >

                          {
                            textoEvento(
                              evento,
                            )
                          }

                        </CBadge>

                      </CTableDataCell>


                      {/* PROPIETARIO ADMIN */}

                      {esAdmin && (

                        <CTableDataCell>

                          {
                            esReserva
                              ? evento
                                  .propietario_nombre
                                ||
                                '—'

                              : '—'
                          }

                        </CTableDataCell>

                      )}

                    </CTableRow>

                  )

                },
              )}

            </CTableBody>

          </CTable>

        )}


        {/* ======================================================
            AVISO LÍMITE
            ====================================================== */}

        {!cargando &&
          eventos.length >
            LIMITE_VISUAL &&
          !busqueda && (

          <div
            className="small text-body-secondary mt-3"
          >

            Mostrando los{' '}

            {
              LIMITE_VISUAL
            }

            {' '}eventos más recientes de{' '}

            {
              eventos.length
            }

            .

          </div>

        )}

      </CCardBody>

    </CCard>
  )
}