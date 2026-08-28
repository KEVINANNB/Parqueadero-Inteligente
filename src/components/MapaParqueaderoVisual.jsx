import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
} from '@coreui/react'


/* =========================================================
   IMAGEN BASE
   ========================================================= */

const RUTA_IMAGEN =
  '/images/mapa-parqueadero-base.png'


/* =========================================================
   POSICIONES CALIBRADAS PARA LA IMAGEN BASE
   1672 x 941 - relación 16:9

   Cada sección tiene 2 columnas:
   A01-A10 | A11-A20
   B01-B10 | B11-B20
   C01-C10 | C11-C20
   D01-D10 | D11-D20
   ========================================================= */

const POSICIONES_X = {
  A: {
    izquierda: 11.7,
    derecha: 21.35,
  },

  B: {
    izquierda: 33.7,
    derecha: 43.35,
  },

  C: {
    izquierda: 55.4,
    derecha: 65.0,
  },

  D: {
    izquierda: 75.55,
    derecha: 85.15,
  },
}


/*
 * Centros verticales de las 10 filas.
 *
 * La imagen tiene:
 *
 * 01 / 11
 * 02 / 12
 * ...
 * 10 / 20
 */

const FILAS_Y = [
  27.3,
  32.4,
  37.5,
  42.5,
  47.6,
  52.6,
  57.7,
  62.7,
  67.7,
  72.8,
]


/*
 * Tamaño del rectángulo.
 *
 * Son porcentajes respecto a la imagen.
 */

const ANCHO_SLOT = 8.75
const ALTO_SLOT = 4.25


/* =========================================================
   HELPERS
   ========================================================= */

function obtenerLetraColumna(
  columna,
) {
  if (
    typeof columna ===
    'string'
  ) {
    const valor =
      columna
        .trim()
        .toUpperCase()

    if (
      ['A', 'B', 'C', 'D']
        .includes(valor)
    ) {
      return valor
    }
  }

  const numero =
    Number(columna)

  if (numero === 1) {
    return 'A'
  }

  if (numero === 2) {
    return 'B'
  }

  if (numero === 3) {
    return 'C'
  }

  if (numero === 4) {
    return 'D'
  }

  return 'A'
}


function obtenerNumeroEspacio(
  espacio,
) {
  const numero =
    Number(
      espacio?.numero ?? 1,
    )

  if (
    Number.isNaN(numero)
  ) {
    return 1
  }

  return Math.min(
    Math.max(
      numero,
      1,
    ),
    20,
  )
}


function obtenerCodigoEspacio(
  espacio,
) {
  if (!espacio) {
    return '—'
  }

  if (
    espacio.codigo_puesto
  ) {
    return (
      espacio.codigo_puesto
    )
  }

  const letra =
    obtenerLetraColumna(
      espacio.columna,
    )

  const numero =
    String(
      obtenerNumeroEspacio(
        espacio,
      ),
    ).padStart(
      2,
      '0',
    )

  return `${letra}${numero}`
}


/* =========================================================
   POSICIÓN DE CADA RECTÁNGULO
   ========================================================= */

function obtenerPosicionEspacio(
  espacio,
) {
  const columna =
    obtenerLetraColumna(
      espacio.columna,
    )

  const numero =
    obtenerNumeroEspacio(
      espacio,
    )


  /*
   * 1-10 están a la izquierda.
   * 11-20 están a la derecha.
   */

  const derecha =
    numero > 10


  /*
   * Convertimos:
   *
   * 01 -> fila 0
   * 10 -> fila 9
   *
   * 11 -> fila 0
   * 20 -> fila 9
   */

  const indiceFila =
    derecha
      ? numero - 11
      : numero - 1


  const x =
    derecha
      ? POSICIONES_X[
          columna
        ].derecha

      : POSICIONES_X[
          columna
        ].izquierda


  const y =
    FILAS_Y[
      indiceFila
    ]


  return {
    left: x,
    top: y,
  }
}


/* =========================================================
   ESTADOS
   ========================================================= */

function obtenerEstadoVisual(
  espacio,
) {
  if (
    !espacio ||
    !espacio.estado
  ) {
    return {
      color:
        'rgba(100, 116, 139, 0.82)',

      borde:
        '#475569',

      texto:
        'Sin datos',

      fondo:
        '#f8fafc',
    }
  }


  if (
    espacio.estado ===
    'libre'
  ) {
    return {
      color:
        'rgba(22, 163, 74, 0.84)',

      borde:
        '#166534',

      texto:
        'Libre',

      fondo:
        '#ecfdf5',
    }
  }


  if (
    espacio.estado ===
    'ocupado'
  ) {
    return {
      color:
        'rgba(220, 38, 38, 0.84)',

      borde:
        '#991b1b',

      texto:
        'Ocupado',

      fondo:
        '#fef2f2',
    }
  }


  return {
    color:
      'rgba(100, 116, 139, 0.82)',

    borde:
      '#475569',

    texto:
      'Sin datos',

    fondo:
      '#f8fafc',
  }
}


function formatearFecha(
  fecha,
) {
  if (!fecha) {
    return '—'
  }

  try {
    return new Date(
      fecha,
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
    return fecha
  }
}


/* =========================================================
   FOTO VEHÍCULO
   ========================================================= */

function MiniFotoVehiculo({
  vehiculo,
}) {
  const [
    errorImagen,
    setErrorImagen,
  ] = useState(false)


  useEffect(() => {
    setErrorImagen(false)
  }, [
    vehiculo?.foto_url,
  ])


  if (
    !vehiculo?.foto_url ||
    errorImagen
  ) {
    return (
      <div
        style={{
          width:
            '100%',

          height:
            150,

          borderRadius:
            14,

          background:
            '#f3f4f6',

          border:
            '1px solid #e5e7eb',

          display:
            'grid',

          placeItems:
            'center',

          color:
            '#6b7280',

          fontWeight:
            700,

          textAlign:
            'center',

          padding:
            16,
        }}
      >
        Sin fotografía
        <br />
        del vehículo
      </div>
    )
  }


  return (
    <img
      src={
        vehiculo.foto_url
      }

      alt={
        vehiculo.placa ||
        'Vehículo'
      }

      onError={() =>
        setErrorImagen(
          true,
        )
      }

      style={{
        width:
          '100%',

        height:
          150,

        objectFit:
          'cover',

        borderRadius:
          14,

        border:
          '1px solid #e5e7eb',
      }}
    />
  )
}


/* =========================================================
   BOTÓN RECTANGULAR
   ========================================================= */

function BotonEspacio({
  espacio,
  activo,
  onClick,
}) {
  const estado =
    obtenerEstadoVisual(
      espacio,
    )

  const codigo =
    obtenerCodigoEspacio(
      espacio,
    )


  return (
    <button
      type="button"

      onClick={
        onClick
      }

      title={
        `${codigo} · ${estado.texto}`
      }

      className={[
        'slot-parqueadero-rect',
        activo
          ? 'slot-parqueadero-activo'
          : '',
      ].join(' ')}

      style={{
        width:
          '100%',

        height:
          '100%',

        padding:
          0,

        borderRadius:
          5,

        border:
          activo
            ? '3px solid #fbbf24'
            : `2px solid ${estado.borde}`,

        background:
          estado.color,

        color:
          '#ffffff',

        fontSize:
          'clamp(8px, 0.72vw, 12px)',

        fontWeight:
          800,

        display:
          'flex',

        alignItems:
          'center',

        justifyContent:
          'center',

        cursor:
          'pointer',

        boxShadow:
          activo
            ? '0 0 0 3px rgba(251, 191, 36, 0.32), 0 5px 12px rgba(0,0,0,0.22)'
            : '0 2px 5px rgba(0,0,0,0.15)',

        textShadow:
          '0 1px 2px rgba(0,0,0,0.45)',

        letterSpacing:
          '0.02em',

        backdropFilter:
          'blur(1px)',

        transition:
          'transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {codigo}
    </button>
  )
}


/* =========================================================
   LEYENDA
   ========================================================= */

function LeyendaEstado() {
  const items = [
    {
      color:
        '#16a34a',

      borde:
        '#166534',

      titulo:
        'Libre',
    },

    {
      color:
        '#dc2626',

      borde:
        '#991b1b',

      titulo:
        'Ocupado',
    },

    {
      color:
        '#64748b',

      borde:
        '#475569',

      titulo:
        'Sin datos',
    },
  ]


  return (
    <div
      style={{
        display:
          'flex',

        flexWrap:
          'wrap',

        gap:
          10,
      }}
    >
      {items.map(
        (
          item,
        ) => (
          <div
            key={
              item.titulo
            }

            style={{
              display:
                'flex',

              alignItems:
                'center',

              gap:
                8,

              background:
                '#ffffff',

              border:
                '1px solid #e5e7eb',

              borderRadius:
                999,

              padding:
                '7px 12px',

              boxShadow:
                '0 3px 8px rgba(15,23,42,0.04)',
            }}
          >
            <span
              style={{
                width:
                  13,

                height:
                  13,

                borderRadius:
                  4,

                background:
                  item.color,

                border:
                  `2px solid ${item.borde}`,

                display:
                  'inline-block',
              }}
            />

            <span
              style={{
                fontSize:
                  12,

                fontWeight:
                  700,

                color:
                  '#374151',
              }}
            >
              {item.titulo}
            </span>
          </div>
        ),
      )}
    </div>
  )
}


/* =========================================================
   ORDENAR
   ========================================================= */

function ordenarEspacios(
  espacios,
) {
  return [
    ...espacios,
  ].sort(
    (
      a,
      b,
    ) => {
      const colA =
        obtenerLetraColumna(
          a.columna,
        )

      const colB =
        obtenerLetraColumna(
          b.columna,
        )


      if (
        colA !== colB
      ) {
        return colA
          .localeCompare(
            colB,
          )
      }


      return (
        obtenerNumeroEspacio(
          a,
        )
        -
        obtenerNumeroEspacio(
          b,
        )
      )
    },
  )
}


/* =========================================================
   COMPONENTE
   ========================================================= */

export default function MapaParqueaderoVisual({
  espacios = [],
  compacto = false,
}) {
  const espaciosOrdenados =
    useMemo(
      () =>
        ordenarEspacios(
          espacios,
        ),

      [
        espacios,
      ],
    )


  const [
    seleccionadoId,
    setSeleccionadoId,
  ] =
    useState(null)


  useEffect(() => {
    if (
      espaciosOrdenados.length ===
      0
    ) {
      setSeleccionadoId(
        null,
      )

      return
    }


    const existe =
      espaciosOrdenados.some(
        (
          item,
        ) =>
          item.id ===
          seleccionadoId,
      )


    if (
      !seleccionadoId ||
      !existe
    ) {
      const primeroOcupado =
        espaciosOrdenados.find(
          (
            item,
          ) =>
            item.estado ===
            'ocupado',
        )
        ||
        espaciosOrdenados[0]


      setSeleccionadoId(
        primeroOcupado.id,
      )
    }
  }, [
    espaciosOrdenados,
    seleccionadoId,
  ])


  const espacioSeleccionado =
    useMemo(
      () =>
        espaciosOrdenados.find(
          (
            item,
          ) =>
            item.id ===
            seleccionadoId,
        )
        ||
        null,

      [
        espaciosOrdenados,
        seleccionadoId,
      ],
    )


  const estadisticas =
    useMemo(
      () => {
        const total =
          espaciosOrdenados.length


        const libres =
          espaciosOrdenados.filter(
            (
              item,
            ) =>
              item.estado ===
              'libre',
          ).length


        const ocupados =
          espaciosOrdenados.filter(
            (
              item,
            ) =>
              item.estado ===
              'ocupado',
          ).length


        const sinDatos =
          total -
          libres -
          ocupados


        return {
          total,
          libres,
          ocupados,
          sinDatos,
        }
      },

      [
        espaciosOrdenados,
      ],
    )


  const estadoSeleccionado =
    obtenerEstadoVisual(
      espacioSeleccionado,
    )


  const vehiculo =
    espacioSeleccionado
      ?.vehiculo
    ||
    null


  return (
    <>
      <style>{`

        .slot-parqueadero-rect:hover {
          transform: scale(1.045);
          filter: brightness(1.10);
          z-index: 20;
        }

        .slot-parqueadero-activo {
          animation: seleccionadoSuave 1.5s ease-in-out infinite;
        }

        @keyframes seleccionadoSuave {

          0% {
            filter: brightness(1);
          }

          50% {
            filter: brightness(1.16);
          }

          100% {
            filter: brightness(1);
          }

        }

      `}</style>


      <div className="row g-4">

        {/* =====================================================
            MAPA
            ===================================================== */}

        <div
          className={
            compacto
              ? 'col-12'
              : 'col-12 col-xl-8'
          }
        >
          <CCard className="shadow-sm border-0 h-100">

            <CCardBody className="p-3 p-md-4">

              <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">

                <div>

                  <small className="text-success fw-semibold">
                    MAPA DEL PARQUEADERO
                  </small>

                  <h4 className="mt-1 mb-1">
                    Disponibilidad en tiempo real
                  </h4>

                  <p className="text-body-secondary mb-0">
                    Selecciona un espacio para consultar sus datos.
                  </p>

                </div>


                <LeyendaEstado />

              </div>


              {/* ===============================================
                  IMAGEN + 80 RECTÁNGULOS
                  =============================================== */}

              <div
                style={{
                  position:
                    'relative',

                  width:
                    '100%',

                  aspectRatio:
                    '1672 / 941',

                  borderRadius:
                    16,

                  overflow:
                    'hidden',

                  border:
                    '1px solid #cbd5e1',

                  background:
                    '#e5e7eb',

                  boxShadow:
                    '0 8px 22px rgba(15,23,42,0.10)',
                }}
              >

                <img
                  src={
                    RUTA_IMAGEN
                  }

                  alt="Mapa personalizado del parqueadero"

                  draggable="false"

                  style={{
                    width:
                      '100%',

                    height:
                      '100%',

                    display:
                      'block',

                    objectFit:
                      'fill',

                    userSelect:
                      'none',

                    pointerEvents:
                      'none',
                  }}
                />


                {espaciosOrdenados.map(
                  (
                    espacio,
                  ) => {

                    const {
                      left,
                      top,
                    } =
                      obtenerPosicionEspacio(
                        espacio,
                      )


                    const activo =
                      espacio.id ===
                      seleccionadoId


                    return (
                      <div
                        key={
                          espacio.id
                        }

                        style={{
                          position:
                            'absolute',

                          left:
                            `${left}%`,

                          top:
                            `${top}%`,

                          width:
                            `${ANCHO_SLOT}%`,

                          height:
                            `${ALTO_SLOT}%`,

                          transform:
                            'translate(-50%, -50%)',

                          zIndex:
                            activo
                              ? 10
                              : 2,
                        }}
                      >

                        <BotonEspacio

                          espacio={
                            espacio
                          }

                          activo={
                            activo
                          }

                          onClick={() =>
                            setSeleccionadoId(
                              espacio.id,
                            )
                          }

                        />

                      </div>
                    )
                  },
                )}

              </div>


              {/* ===============================================
                  ESTADÍSTICAS
                  =============================================== */}

              <div
                style={{
                  marginTop:
                    14,

                  display:
                    'grid',

                  gridTemplateColumns:
                    'repeat(4, minmax(0, 1fr))',

                  gap:
                    10,
                }}
              >

                <div className="border rounded-3 p-3">

                  <small className="text-body-secondary">
                    Total
                  </small>

                  <div className="fs-4 fw-bold">
                    {
                      estadisticas.total
                    }
                  </div>

                </div>


                <div
                  className="rounded-3 p-3"
                  style={{
                    background:
                      '#ecfdf5',

                    border:
                      '1px solid #bbf7d0',
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
                    className="fs-4 fw-bold"
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


                <div
                  className="rounded-3 p-3"
                  style={{
                    background:
                      '#fef2f2',

                    border:
                      '1px solid #fecaca',
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
                    className="fs-4 fw-bold"
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


                <div
                  className="rounded-3 p-3"
                  style={{
                    background:
                      '#f8fafc',

                    border:
                      '1px solid #e2e8f0',
                  }}
                >

                  <small
                    style={{
                      color:
                        '#475569',
                    }}
                  >
                    Sin datos
                  </small>

                  <div
                    className="fs-4 fw-bold"
                    style={{
                      color:
                        '#475569',
                    }}
                  >
                    {
                      estadisticas.sinDatos
                    }
                  </div>

                </div>

              </div>

            </CCardBody>

          </CCard>

        </div>


        {/* =====================================================
            INFORMACIÓN
            ===================================================== */}

        <div
          className={
            compacto
              ? 'col-12'
              : 'col-12 col-xl-4'
          }
        >

          <CCard className="shadow-sm border-0 h-100">

            <CCardBody>

              <small className="text-success fw-semibold">
                INFORMACIÓN DEL ESPACIO
              </small>


              <h3 className="mt-1 mb-3">

                {espacioSeleccionado
                  ? obtenerCodigoEspacio(
                      espacioSeleccionado,
                    )
                  : 'Sin selección'}

              </h3>


              {!espacioSeleccionado ? (

                <p className="text-body-secondary">
                  Selecciona uno de los espacios del mapa.
                </p>

              ) : (

                <>

                  {/* ESTADO */}

                  <div className="d-flex align-items-center gap-2 mb-3">

                    <span
                      style={{
                        width:
                          15,

                        height:
                          15,

                        borderRadius:
                          4,

                        background:
                          estadoSeleccionado.color,

                        border:
                          `2px solid ${estadoSeleccionado.borde}`,
                      }}
                    />


                    <CBadge
                      style={{
                        background:
                          estadoSeleccionado.color,

                        color:
                          '#ffffff',

                        padding:
                          '7px 12px',
                      }}
                    >
                      {
                        estadoSeleccionado.texto
                      }
                    </CBadge>

                  </div>


                  {/* DATOS SENSOR */}

                  <div
                    style={{
                      border:
                        '1px solid #e5e7eb',

                      borderRadius:
                        14,

                      padding:
                        14,

                      marginBottom:
                        14,
                    }}
                  >

                    <div className="mb-2">

                      <small className="text-body-secondary">
                        Código
                      </small>

                      <div className="fw-bold">
                        {
                          obtenerCodigoEspacio(
                            espacioSeleccionado,
                          )
                        }
                      </div>

                    </div>


                    <div className="mb-2">

                      <small className="text-body-secondary">
                        Sensor
                      </small>

                      <div className="fw-bold">
                        {
                          espacioSeleccionado.id
                        }
                      </div>

                    </div>


                    <div className="mb-2">

                      <small className="text-body-secondary">
                        Distancia detectada
                      </small>

                      <div className="fw-bold">
                        {
                          espacioSeleccionado.distanciaDetectada
                        } cm
                      </div>

                    </div>


                    <div>

                      <small className="text-body-secondary">
                        Última actualización
                      </small>

                      <div className="fw-bold">
                        {
                          formatearFecha(
                            espacioSeleccionado.fechaHora,
                          )
                        }
                      </div>

                    </div>

                  </div>


                  {/* VEHÍCULO */}

                  {espacioSeleccionado.estado ===
                    'ocupado'
                    &&
                    vehiculo && (

                      <div
                        style={{
                          border:
                            '1px solid #e5e7eb',

                          borderRadius:
                            14,

                          padding:
                            14,

                          marginBottom:
                            14,
                        }}
                      >

                        <small className="text-body-secondary">
                          Vehículo vinculado
                        </small>


                        <div className="mt-2">

                          <MiniFotoVehiculo
                            vehiculo={
                              vehiculo
                            }
                          />

                        </div>


                        <div className="mt-3">

                          <small className="text-body-secondary">
                            Placa
                          </small>

                          <div className="fw-bold fs-5">
                            {
                              vehiculo.placa ||
                              '—'
                            }
                          </div>

                        </div>


                        <div className="mt-2">

                          <small className="text-body-secondary">
                            Vehículo
                          </small>

                          <div className="fw-bold">
                            {
                              vehiculo.marca
                            }{' '}
                            {
                              vehiculo.modelo
                            }
                          </div>

                        </div>


                        <div className="mt-2">

                          <small className="text-body-secondary">
                            Color
                          </small>

                          <div className="fw-bold">
                            {
                              vehiculo.color ||
                              '—'
                            }
                          </div>

                        </div>


                        <div className="mt-2">

                          <small className="text-body-secondary">
                            Propietario
                          </small>

                          <div className="fw-bold">
                            {
                              vehiculo.propietario_nombre ||
                              '—'
                            }
                          </div>

                        </div>

                      </div>
                    )}


                  {/* OCUPADO SIN IDENTIFICAR */}

                  {espacioSeleccionado.estado ===
                    'ocupado'
                    &&
                    !vehiculo && (

                      <div
                        style={{
                          background:
                            '#fff7ed',

                          border:
                            '1px solid #fdba74',

                          color:
                            '#9a3412',

                          borderRadius:
                            12,

                          padding:
                            14,

                          marginBottom:
                            14,

                          fontWeight:
                            600,
                        }}
                      >
                        ⚠ Vehículo sin identificar.
                      </div>
                    )}


                  {/* LIBRE */}

                  {espacioSeleccionado.estado ===
                    'libre' && (

                      <div
                        style={{
                          background:
                            '#ecfdf5',

                          border:
                            '1px solid #86efac',

                          color:
                            '#166534',

                          borderRadius:
                            12,

                          padding:
                            14,

                          marginBottom:
                            14,

                          fontWeight:
                            600,
                        }}
                      >
                        ✓ Este espacio está disponible.
                      </div>
                    )}


                  <Link
                    to={
                      `/espacios/${espacioSeleccionado.id}`
                    }

                    style={{
                      textDecoration:
                        'none',
                    }}
                  >

                    <CButton
                      color="success"
                      className="w-100"
                    >
                      Ver detalle completo
                    </CButton>

                  </Link>

                </>
              )}

            </CCardBody>

          </CCard>

        </div>

      </div>
    </>
  )
}