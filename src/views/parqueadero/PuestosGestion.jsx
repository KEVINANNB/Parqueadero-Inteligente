import {
  useMemo,
  useState,
} from 'react'

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
  useNavigate,
} from 'react-router-dom'

import usePuestos
  from '../../hooks/usePuestos'


/* ================================================================
   HELPERS
   ================================================================ */

function obtenerErrorTexto(error) {
  if (!error) {
    return ''
  }

  if (
    typeof error ===
    'string'
  ) {
    return error
  }

  return (
    error.message ||
    'No se pudo cargar la información.'
  )
}


function obtenerColorEstado(estado) {
  if (
    estado ===
    'libre'
  ) {
    return 'success'
  }

  if (
    estado ===
    'ocupado'
  ) {
    return 'danger'
  }

  return 'secondary'
}


function obtenerTextoEstado(estado) {
  if (
    estado ===
    'libre'
  ) {
    return 'Libre'
  }

  if (
    estado ===
    'ocupado'
  ) {
    return 'Ocupado'
  }

  return 'Sin datos'
}


/* ================================================================
   COMPONENTE
   ================================================================ */

export default function PuestosGestion() {
  const {
    espacios,
    cargando,
    error,
    estadisticas,
    recargarRelaciones,
  } =
    usePuestos()


  const navigate =
    useNavigate()


  const [
    busqueda,
    setBusqueda,
  ] =
    useState('')


  const [
    filtroEstado,
    setFiltroEstado,
  ] =
    useState('todos')


  /* ==============================================================
     FILTROS
     ============================================================== */

  const espaciosFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase()


      return espacios.filter(
        (
          espacio,
        ) => {
          /* ------------------------------------------------------
             ESTADO
             ------------------------------------------------------ */

          if (
            filtroEstado !==
            'todos'
          ) {
            if (
              espacio.estado !==
              filtroEstado
            ) {
              return false
            }
          }


          /* ------------------------------------------------------
             BÚSQUEDA
             ------------------------------------------------------ */

          if (!texto) {
            return true
          }


          const vehiculo =
            espacio.vehiculo


          const valores = [
            espacio.codigo_puesto,
            espacio.etiqueta,
            espacio.id,
            espacio.estado,
            espacio.distanciaDetectada,

            vehiculo?.placa,
            vehiculo?.marca,
            vehiculo?.modelo,
            vehiculo?.color,
            vehiculo?.propietario_nombre,
            vehiculo?.correo_institucional,
          ]


          return valores
            .map(
              (
                valor,
              ) =>
                String(
                  valor ??
                  '',
                )
                  .toLowerCase(),
            )
            .some(
              (
                valor,
              ) =>
                valor.includes(
                  texto,
                ),
            )
        },
      )
    }, [
      espacios,
      busqueda,
      filtroEstado,
    ])


  return (
    <CCard className="shadow-sm border-0">

      {/* ========================================================
          HEADER
          ======================================================== */}

      <CCardHeader
        className="d-flex flex-wrap justify-content-between align-items-center gap-3"
      >

        <div>

          <div
            className="d-flex align-items-center gap-2"
          >

            <strong
              style={{
                fontSize: 16,
              }}
            >
              Puestos del parqueadero
            </strong>


            <CBadge color="info">
              80 espacios
            </CBadge>

          </div>


          <div className="small text-body-secondary mt-1">

            Consulta del estado actual,
            sensores y vehículos vinculados
            a cada puesto.

          </div>

        </div>


        <CButton
          color="success"
          variant="outline"

          disabled={
            cargando
          }

          onClick={
            recargarRelaciones
          }
        >
          Actualizar
        </CButton>

      </CCardHeader>


      <CCardBody>

        {/* ========================================================
            ESTADÍSTICAS
            ======================================================== */}

        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              'repeat(auto-fit, minmax(145px, 1fr))',

            gap: 12,

            marginBottom: 20,
          }}
        >

          {/* TOTAL */}

          <div
            style={{
              padding: 15,

              border:
                '1px solid #e5e7eb',

              borderRadius:
                12,

              background:
                '#ffffff',
            }}
          >

            <small className="text-body-secondary">
              Total
            </small>


            <div className="fs-3 fw-bold">
              {
                estadisticas.total
              }
            </div>

          </div>


          {/* LIBRES */}

          <div
            style={{
              padding: 15,

              border:
                '1px solid #bbf7d0',

              borderRadius:
                12,

              background:
                '#ecfdf5',
            }}
          >

            <small
              style={{
                color:
                  '#166534',
              }}
            >
              Libres
            </small>


            <div
              className="fs-3 fw-bold"

              style={{
                color:
                  '#166534',
              }}
            >
              {
                estadisticas.libres
              }
            </div>

          </div>


          {/* OCUPADOS */}

          <div
            style={{
              padding: 15,

              border:
                '1px solid #fecaca',

              borderRadius:
                12,

              background:
                '#fef2f2',
            }}
          >

            <small
              style={{
                color:
                  '#991b1b',
              }}
            >
              Ocupados
            </small>


            <div
              className="fs-3 fw-bold"

              style={{
                color:
                  '#991b1b',
              }}
            >
              {
                estadisticas.ocupados
              }
            </div>

          </div>


          {/* IDENTIFICADOS */}

          <div
            style={{
              padding: 15,

              border:
                '1px solid #bfdbfe',

              borderRadius:
                12,

              background:
                '#eff6ff',
            }}
          >

            <small
              style={{
                color:
                  '#1d4ed8',
              }}
            >
              Identificados
            </small>


            <div
              className="fs-3 fw-bold"

              style={{
                color:
                  '#1d4ed8',
              }}
            >
              {
                estadisticas.identificados
              }
            </div>

          </div>


          {/* SIN IDENTIFICAR */}

          <div
            style={{
              padding: 15,

              border:
                '1px solid #fed7aa',

              borderRadius:
                12,

              background:
                '#fff7ed',
            }}
          >

            <small
              style={{
                color:
                  '#9a3412',
              }}
            >
              Sin identificar
            </small>


            <div
              className="fs-3 fw-bold"

              style={{
                color:
                  '#9a3412',
              }}
            >
              {
                estadisticas
                  .sinIdentificar
              }
            </div>

          </div>

        </div>


        {/* ========================================================
            FILTROS
            ======================================================== */}

        <div
          className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3"
        >

          <CFormInput
            type="search"

            placeholder="Buscar A01, sensor, placa, vehículo o propietario..."

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
              maxWidth: 480,
            }}
          />


          <div
            className="d-flex flex-wrap gap-2"
          >

            <CButton
              size="sm"

              color={
                filtroEstado ===
                'todos'
                  ? 'primary'
                  : 'secondary'
              }

              variant={
                filtroEstado ===
                'todos'
                  ? undefined
                  : 'outline'
              }

              onClick={() =>
                setFiltroEstado(
                  'todos',
                )
              }
            >
              Todos
            </CButton>


            <CButton
              size="sm"

              color="success"

              variant={
                filtroEstado ===
                'libre'
                  ? undefined
                  : 'outline'
              }

              onClick={() =>
                setFiltroEstado(
                  'libre',
                )
              }
            >
              Libres
            </CButton>


            <CButton
              size="sm"

              color="danger"

              variant={
                filtroEstado ===
                'ocupado'
                  ? undefined
                  : 'outline'
              }

              onClick={() =>
                setFiltroEstado(
                  'ocupado',
                )
              }
            >
              Ocupados
            </CButton>

          </div>

        </div>


        <div
          className="text-body-secondary small mb-3"
        >
          Mostrando{' '}

          <strong>
            {
              espaciosFiltrados.length
            }
          </strong>

          {' '}de{' '}

          <strong>
            {
              espacios.length
            }
          </strong>

          {' '}puestos.
        </div>


        {/* ========================================================
            CARGANDO
            ======================================================== */}

        {cargando && (

          <div
            className="text-center py-5"
          >

            <CSpinner
              color="success"
            />


            <h5 className="mt-3">
              Cargando puestos...
            </h5>


            <p className="text-body-secondary">
              Consultando Firebase y Supabase.
            </p>

          </div>

        )}


        {/* ========================================================
            ERROR
            ======================================================== */}

        {!cargando &&
          error && (

            <CAlert color="danger">

              <strong>
                No se pudieron cargar
                completamente los puestos.
              </strong>

              <br />

              {
                obtenerErrorTexto(
                  error,
                )
              }

            </CAlert>

          )}


        {/* ========================================================
            TABLA
            ======================================================== */}

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
                    Puesto
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


                  <CTableHeaderCell>
                    Vehículo
                  </CTableHeaderCell>


                  <CTableHeaderCell>
                    Propietario
                  </CTableHeaderCell>


                  <CTableHeaderCell>
                    Integración
                  </CTableHeaderCell>


                  <CTableHeaderCell
                    className="text-center"
                  >
                    Acción
                  </CTableHeaderCell>

                </CTableRow>

              </CTableHead>


              <CTableBody>

                {espaciosFiltrados.map(
                  (
                    espacio,
                  ) => {

                    const vehiculo =
                      espacio.vehiculo


                    return (
                      <CTableRow
                        key={
                          espacio.id
                        }
                      >

                        {/* PUESTO */}

                        <CTableDataCell>

                          <div
                            className="fw-bold"
                            style={{
                              fontSize:
                                15,
                            }}
                          >
                            {
                              espacio
                                .codigo_puesto
                              ||
                              espacio
                                .etiqueta
                              ||
                              '—'
                            }
                          </div>


                          <small className="text-body-secondary">

                            Columna{' '}

                            {
                              espacio
                                .columna
                            }

                          </small>

                        </CTableDataCell>


                        {/* SENSOR */}

                        <CTableDataCell>

                          <code
                            style={{
                              fontSize:
                                11,
                            }}
                          >
                            {
                              espacio.id
                            }
                          </code>

                        </CTableDataCell>


                        {/* ESTADO */}

                        <CTableDataCell>

                          <CBadge
                            color={
                              obtenerColorEstado(
                                espacio.estado,
                              )
                            }
                          >
                            {
                              obtenerTextoEstado(
                                espacio.estado,
                              )
                            }
                          </CBadge>

                        </CTableDataCell>


                        {/* DISTANCIA */}

                        <CTableDataCell>

                          {
                            espacio
                              .distanciaDetectada !=
                            null
                              ? `${espacio.distanciaDetectada} cm`
                              : '—'
                          }

                        </CTableDataCell>


                        {/* VEHÍCULO */}

                        <CTableDataCell>

                          {vehiculo ? (

                            <div
                              className="d-flex align-items-center gap-2"
                            >

                              {vehiculo.foto_url && (

                                <img
                                  src={
                                    vehiculo
                                      .foto_url
                                  }

                                  alt={
                                    vehiculo
                                      .placa
                                  }

                                  style={{
                                    width:
                                      48,

                                    height:
                                      36,

                                    objectFit:
                                      'cover',

                                    borderRadius:
                                      6,

                                    border:
                                      '1px solid #d1d5db',
                                  }}
                                />

                              )}


                              <div>

                                <strong>
                                  {
                                    vehiculo
                                      .placa
                                  }
                                </strong>


                                <div className="small text-body-secondary">

                                  {
                                    vehiculo
                                      .marca
                                  }{' '}

                                  {
                                    vehiculo
                                      .modelo
                                  }

                                </div>

                              </div>

                            </div>

                          ) : (

                            <span className="text-body-secondary">

                              {
                                espacio.estado ===
                                'ocupado'
                                  ? 'Sin identificar'
                                  : '—'
                              }

                            </span>

                          )}

                        </CTableDataCell>


                        {/* PROPIETARIO */}

                        <CTableDataCell>

                          {vehiculo ? (

                            <div>

                              <strong>
                                {
                                  vehiculo
                                    .propietario_nombre
                                  ||
                                  '—'
                                }
                              </strong>


                              <div className="small text-body-secondary">

                                {
                                  vehiculo
                                    .correo_institucional
                                  ||
                                  ''
                                }

                              </div>

                            </div>

                          ) : (

                            '—'

                          )}

                        </CTableDataCell>


                        {/* INTEGRACIÓN */}

                        <CTableDataCell>

                          <CBadge
                            color={
                              espacio
                                .integracion_activa
                                ? 'success'
                                : 'secondary'
                            }
                          >

                            {
                              espacio
                                .integracion_activa
                                ? 'Activa'
                                : 'Inactiva'
                            }

                          </CBadge>

                        </CTableDataCell>


                        {/* ACCIÓN */}

                        <CTableDataCell
                          className="text-center"
                        >

                          <CButton
                            size="sm"

                            color="primary"

                            variant="outline"

                            onClick={() =>
                              navigate(
                                `/espacios/${espacio.id}`,
                              )
                            }
                          >
                            Ver detalle
                          </CButton>

                        </CTableDataCell>

                      </CTableRow>
                    )
                  },
                )}


                {espaciosFiltrados.length ===
                  0 && (

                  <CTableRow>

                    <CTableDataCell
                      colSpan={8}
                      className="text-center py-5 text-body-secondary"
                    >
                      No hay puestos que coincidan
                      con los filtros.
                    </CTableDataCell>

                  </CTableRow>

                )}

              </CTableBody>

            </CTable>

          )}

      </CCardBody>

    </CCard>
  )
}