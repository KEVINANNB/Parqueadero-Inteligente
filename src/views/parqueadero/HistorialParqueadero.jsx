import {
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


function formatearFecha(
  valor,
) {
  if (!valor) {
    return '—'
  }


  try {

    return new Date(
      valor,
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

    return String(
      valor,
    )

  }
}


export default function HistorialParqueadero() {
  const [
    eventos,
    setEventos,
  ] =
    useState([])


  const [
    cargando,
    setCargando,
  ] =
    useState(true)


  const [
    error,
    setError,
  ] =
    useState(null)


  const [
    busqueda,
    setBusqueda,
  ] =
    useState('')


  /* =============================================================
     FIREBASE
     ============================================================= */

  useEffect(() => {

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
                  espacioId,
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
                      ]) => ({

                        ...evento,

                        eventoId,

                        espacioId,

                      }),
                    )

                },
              )
              .sort(
                (
                  a,
                  b,
                ) =>
                  Number(
                    b.fechaHora ||
                    0,
                  )
                  -
                  Number(
                    a.fechaHora ||
                    0,
                  ),
              )


          setEventos(
            lista,
          )

          setError(
            null,
          )

          setCargando(
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

          setCargando(
            false,
          )

        },

      )


    return () =>
      unsubscribe()

  }, [])


  const filtrados =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase()


      if (!texto) {

        return eventos.slice(
          0,
          250,
        )

      }


      return eventos
        .filter(
          (
            evento,
          ) =>
            [
              evento.espacioId,
              evento.etiqueta,
              evento.estado,
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
              ),
        )
        .slice(
          0,
          250,
        )

    }, [
      eventos,
      busqueda,
    ])


  function colorEstado(
    estado,
  ) {

    if (
      estado === 'libre'
    ) {
      return 'success'
    }


    if (
      estado === 'ocupado'
    ) {
      return 'danger'
    }


    return 'secondary'
  }


  return (
    <CCard className="shadow-sm">

      <CCardHeader>

        <strong>
          Historial
        </strong>


        <div className="small text-body-secondary mt-1">

          Cambios registrados por los
          sensores del parqueadero.

        </div>

      </CCardHeader>


      <CCardBody>

        <div
          className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3"
        >

          <CFormInput

            type="search"

            placeholder="Buscar sensor, puesto o estado..."

            value={
              busqueda
            }

            onChange={(
              evento,
            ) =>
              setBusqueda(
                evento.target.value,
              )
            }

            style={{
              maxWidth: 440,
            }}

          />


          <span className="text-body-secondary">

            {
              eventos.length
            }{' '}

            eventos registrados

          </span>

        </div>


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


        {error && (

          <CAlert color="danger">

            No se pudo cargar
            el historial.

          </CAlert>

        )}


        {!cargando &&
          !error && (

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
                    Espacio
                  </CTableHeaderCell>

                  <CTableHeaderCell>
                    Sensor
                  </CTableHeaderCell>

                  <CTableHeaderCell>
                    Estado
                  </CTableHeaderCell>

                  <CTableHeaderCell>
                    Distancia
                  </CTableHeaderCell>

                </CTableRow>

              </CTableHead>


              <CTableBody>

                {filtrados.map(
                  (
                    evento,
                  ) => (

                    <CTableRow
                      key={
                        `${evento.espacioId}-${evento.eventoId}`
                      }
                    >

                      <CTableDataCell>

                        {
                          formatearFecha(
                            evento
                              .fechaHora,
                          )
                        }

                      </CTableDataCell>


                      <CTableDataCell>

                        <strong>
                          {
                            evento
                              .etiqueta
                            ||
                            '—'
                          }
                        </strong>

                      </CTableDataCell>


                      <CTableDataCell>

                        <code>
                          {
                            evento
                              .espacioId
                          }
                        </code>

                      </CTableDataCell>


                      <CTableDataCell>

                        <CBadge
                          color={
                            colorEstado(
                              evento.estado,
                            )
                          }
                        >

                          {
                            evento.estado
                            ||
                            'sin datos'
                          }

                        </CBadge>

                      </CTableDataCell>


                      <CTableDataCell>

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

                      </CTableDataCell>

                    </CTableRow>

                  ),
                )}

              </CTableBody>

            </CTable>

          )}

      </CCardBody>

    </CCard>
  )
}