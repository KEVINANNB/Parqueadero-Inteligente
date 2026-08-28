import {
  MapContainer,
  Popup,
  Rectangle,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'

import {
  Link,
} from 'react-router-dom'

import {
  useEffect,
  useMemo,
} from 'react'

import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

import {
  BOUNDING_BOX,
} from '../services/geometria'


/* ================================================================
   CORRECCIÓN DE ICONOS LEAFLET
   ================================================================ */

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})


/* ================================================================
   LÍMITES GENERALES DEL PARQUEADERO
   ================================================================ */

const LIMITES_PARQUEADERO = [
  [
    BOUNDING_BOX.sur,
    BOUNDING_BOX.oeste,
  ],

  [
    BOUNDING_BOX.norte,
    BOUNDING_BOX.este,
  ],
]


/* ================================================================
   AJUSTAR AUTOMÁTICAMENTE EL MAPA
   ================================================================ */

function AjustarMapa({
  grande,
}) {
  const mapa =
    useMap()

  useEffect(() => {
    mapa.fitBounds(
      LIMITES_PARQUEADERO,
      {
        padding:
          grande
            ? [40, 40]
            : [20, 20],
      },
    )

    /*
     * Leaflet a veces calcula el tamaño
     * antes de que CoreUI termine de
     * renderizar el contenedor.
     */
    const temporizador =
      setTimeout(() => {
        mapa.invalidateSize()
      }, 200)

    return () =>
      clearTimeout(
        temporizador,
      )
  }, [
    mapa,
    grande,
  ])

  return null
}


/* ================================================================
   COLORES POR ESTADO
   ================================================================ */

function obtenerColor(
  espacio,
) {
  if (
    espacio.estado === 'libre'
  ) {
    return {
      borde:
        '#15803d',

      relleno:
        '#22c55e',

      texto:
        'Libre',
    }
  }

  if (
    espacio.estado ===
    'ocupado'
  ) {
    return {
      borde:
        '#b91c1c',

      relleno:
        '#ef4444',

      texto:
        'Ocupado',
    }
  }

  return {
    borde:
      '#64748b',

    relleno:
      '#94a3b8',

    texto:
      'Sin datos',
  }
}


/* ================================================================
   CONVERTIR BOUNDING BOX A FORMATO LEAFLET
   ================================================================ */

function obtenerBounds(
  espacio,
) {
  const box =
    espacio
      ?.ubicacion
      ?.boundingBox

  if (!box) {
    return null
  }

  return [
    [
      box.sur,
      box.oeste,
    ],

    [
      box.norte,
      box.este,
    ],
  ]
}


/* ================================================================
   POPUP DEL PUESTO
   ================================================================ */

function ContenidoPopup({
  espacio,
}) {
  const vehiculo =
    espacio.vehiculo

  const ocupado =
    espacio.estado ===
    'ocupado'

  const color =
    obtenerColor(
      espacio,
    )

  return (
    <div
      style={{
        minWidth:
          230,

        maxWidth:
          300,

        color:
          '#111827',
      }}
    >
      {/* ======================================================
          CABECERA
          ====================================================== */}

      <div
        style={{
          display:
            'flex',

          justifyContent:
            'space-between',

          alignItems:
            'center',

          gap:
            10,

          marginBottom:
            10,
        }}
      >
        <div>
          <div
            style={{
              fontSize:
                20,

              fontWeight:
                800,
            }}
          >
            {espacio.etiqueta}
          </div>

          <small
            style={{
              color:
                '#6b7280',
            }}
          >
            {
              espacio.id
            }
          </small>
        </div>

        <span
          style={{
            padding:
              '4px 8px',

            borderRadius:
              999,

            background:
              color.relleno,

            color:
              '#ffffff',

            fontWeight:
              700,

            fontSize:
              11,
          }}
        >
          {color.texto}
        </span>
      </div>


      {/* ======================================================
          SENSOR
          ====================================================== */}

      <div
        style={{
          padding:
            '8px 0',

          borderTop:
            '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            fontSize:
              12,

            color:
              '#6b7280',
          }}
        >
          Distancia detectada
        </div>

        <strong>
          {
            espacio
              .distanciaDetectada
          }{' '}
          cm
        </strong>
      </div>


      {/* ======================================================
          VEHÍCULO IDENTIFICADO
          ====================================================== */}

      {ocupado &&
        vehiculo && (
          <div
            style={{
              padding:
                '10px 0',

              borderTop:
                '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                display:
                  'flex',

                gap:
                  10,

                alignItems:
                  'center',

                marginBottom:
                  8,
              }}
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
                      65,

                    height:
                      45,

                    objectFit:
                      'cover',

                    borderRadius:
                      6,
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

                <div
                  style={{
                    fontSize:
                      12,
                  }}
                >
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


            <div
              style={{
                fontSize:
                  12,

                color:
                  '#6b7280',
              }}
            >
              Propietario
            </div>

            <strong
              style={{
                fontSize:
                  13,
              }}
            >
              {
                vehiculo
                  .propietario_nombre
              }
            </strong>
          </div>
        )}


      {/* ======================================================
          OCUPADO SIN VEHÍCULO IDENTIFICADO
          ====================================================== */}

      {ocupado &&
        !vehiculo && (
          <div
            style={{
              margin:
                '8px 0',

              padding:
                10,

              borderRadius:
                6,

              background:
                '#fff7ed',

              color:
                '#9a3412',

              fontWeight:
                600,

              fontSize:
                12,
            }}
          >
            ⚠ Vehículo sin
            identificar
          </div>
        )}


      {/* ======================================================
          LIBRE
          ====================================================== */}

      {!ocupado && (
        <div
          style={{
            margin:
              '8px 0',

            padding:
              10,

            borderRadius:
              6,

            background:
              '#ecfdf5',

            color:
              '#166534',

            fontWeight:
              600,

            fontSize:
              12,
          }}
        >
          ✓ Espacio disponible
        </div>
      )}


      {/* ======================================================
          DETALLE
          ====================================================== */}

      <Link
        to={
          `/espacios/${espacio.id}`
        }
        style={{
          display:
            'block',

          marginTop:
            10,

          textAlign:
            'center',

          padding:
            '8px 10px',

          borderRadius:
            6,

          background:
            '#087b26',

          color:
            '#ffffff',

          fontWeight:
            700,

          textDecoration:
            'none',
        }}
      >
        Ver detalle completo
      </Link>
    </div>
  )
}


/* ================================================================
   COMPONENTE PRINCIPAL
   ================================================================ */

export default function MapaEstacionamiento({
  espacios = [],
  espacioSeleccionado = null,
  grande = false,
}) {
  /*
   * Si estamos en DetalleEspacio
   * únicamente tenemos un espacio.
   *
   * Si estamos en MapaParqueadero,
   * tenemos los 80.
   */

  const espaciosMostrar =
    useMemo(() => {
      if (
        espacios.length > 0
      ) {
        return espacios
      }

      if (
        espacioSeleccionado
      ) {
        return [
          espacioSeleccionado,
        ]
      }

      return []
    }, [
      espacios,
      espacioSeleccionado,
    ])


  const centro = [
    (
      BOUNDING_BOX.norte +
      BOUNDING_BOX.sur
    ) / 2,

    (
      BOUNDING_BOX.oeste +
      BOUNDING_BOX.este
    ) / 2,
  ]


  return (
    <div
      style={{
        width:
          '100%',

        height:
          grande
            ? '72vh'
            : '430px',

        minHeight:
          grande
            ? 600
            : 350,

        overflow:
          'hidden',

        borderRadius:
          12,

        border:
          '1px solid #d1d5db',

        background:
          '#e5e7eb',
      }}
    >
      <MapContainer
        center={centro}
        zoom={19}
        scrollWheelZoom
        style={{
          height:
            '100%',

          width:
            '100%',
        }}
      >
        <AjustarMapa
          grande={grande}
        />


        {/* ======================================================
            MAPA SATELITAL / CALLE
            ====================================================== */}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* ======================================================
            CONTORNO GENERAL
            ====================================================== */}

        <Rectangle
          bounds={
            LIMITES_PARQUEADERO
          }
          pathOptions={{
            color:
              '#111827',

            weight:
              3,

            fill:
              false,

            dashArray:
              '6 5',
          }}
        />


        {/* ======================================================
            80 ESPACIOS
            ====================================================== */}

        {espaciosMostrar.map(
          (
            espacio,
          ) => {
            const bounds =
              obtenerBounds(
                espacio,
              )

            if (!bounds) {
              return null
            }


            const color =
              obtenerColor(
                espacio,
              )


            const seleccionado =
              espacioSeleccionado
                ?.id ===
              espacio.id


            return (
              <Rectangle
                key={
                  espacio.id
                }
                bounds={
                  bounds
                }
                pathOptions={{
                  color:
                    seleccionado
                      ? '#f59e0b'
                      : color.borde,

                  weight:
                    seleccionado
                      ? 5
                      : 2,

                  fillColor:
                    color.relleno,

                  fillOpacity:
                    espacio.estado ===
                    'libre'
                      ? 0.46
                      : 0.58,
                }}
              >
                {/* ============================================
                    ETIQUETA A01, A02...
                    ============================================ */}

                {grande && (
                  <Tooltip
                    permanent
                    direction="center"
                    opacity={0.9}
                  >
                    <strong>
                      {
                        espacio
                          .etiqueta
                      }
                    </strong>
                  </Tooltip>
                )}


                {/* ============================================
                    POPUP
                    ============================================ */}

                <Popup>
                  <ContenidoPopup
                    espacio={
                      espacio
                    }
                  />
                </Popup>
              </Rectangle>
            )
          },
        )}

      </MapContainer>
    </div>
  )
}