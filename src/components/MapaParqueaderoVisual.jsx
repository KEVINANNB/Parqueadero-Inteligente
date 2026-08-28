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


/* ================================================================
   HELPERS
   ================================================================ */

function obtenerLetraColumna(columna) {
  if (typeof columna === 'string') {
    const valor = columna.trim().toUpperCase()
    if (['A', 'B', 'C', 'D'].includes(valor)) {
      return valor
    }
  }

  const numero = Number(columna)

  if (numero === 1) return 'A'
  if (numero === 2) return 'B'
  if (numero === 3) return 'C'
  if (numero === 4) return 'D'

  return 'A'
}

function obtenerCodigoEspacio(espacio) {
  if (!espacio) return '—'

  const letra = obtenerLetraColumna(espacio.columna)
  const numero = String(espacio.numero ?? '').padStart(2, '0')

  return `${letra}-${numero}`
}

function obtenerEstadoVisual(espacio) {
  if (!espacio) {
    return {
      color: '#94a3b8',
      borde: '#64748b',
      texto: 'Sin datos',
      fondo: '#f1f5f9',
      sombra: '0 0 0 4px rgba(148, 163, 184, 0.16)',
    }
  }

  if (espacio.estado === 'libre') {
    return {
      color: '#22c55e',
      borde: '#15803d',
      texto: 'Libre',
      fondo: '#ecfdf5',
      sombra: '0 0 0 4px rgba(34, 197, 94, 0.16)',
    }
  }

  if (espacio.estado === 'ocupado') {
    return {
      color: '#ef4444',
      borde: '#b91c1c',
      texto: 'Ocupado',
      fondo: '#fef2f2',
      sombra: '0 0 0 4px rgba(239, 68, 68, 0.16)',
    }
  }

  return {
    color: '#94a3b8',
    borde: '#64748b',
    texto: 'Sin datos',
    fondo: '#f1f5f9',
    sombra: '0 0 0 4px rgba(148, 163, 184, 0.16)',
  }
}

function formatearFecha(fecha) {
  if (!fecha) return '—'

  try {
    return new Date(fecha).toLocaleString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return fecha
  }
}


/* ================================================================
   MINI FOTO VEHÍCULO
   ================================================================ */

function MiniFotoVehiculo({ vehiculo }) {
  const [errorImagen, setErrorImagen] = useState(false)

  useEffect(() => {
    setErrorImagen(false)
  }, [vehiculo?.foto_url])

  if (!vehiculo?.foto_url || errorImagen) {
    return (
      <div
        style={{
          width: '100%',
          height: 165,
          borderRadius: 16,
          background:
            'linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)',
          border: '1px solid #e5e7eb',
          display: 'grid',
          placeItems: 'center',
          color: '#64748b',
          fontWeight: 700,
          textAlign: 'center',
          padding: 16,
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
      src={vehiculo.foto_url}
      alt={vehiculo.placa || 'Vehículo'}
      onError={() => setErrorImagen(true)}
      style={{
        width: '100%',
        height: 165,
        objectFit: 'cover',
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
      }}
    />
  )
}


/* ================================================================
   LEYENDA ELEGANTE
   ================================================================ */

function LegendItem({
  color,
  borde,
  titulo,
  descripcion,
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 16,
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 6px 14px rgba(15, 23, 42, 0.05)',
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: color,
          border: `2px solid ${borde}`,
          display: 'inline-block',
        }}
      />

      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: '#111827',
            lineHeight: 1.1,
          }}
        >
          {titulo}
        </div>

        <div
          style={{
            fontSize: 11,
            color: '#6b7280',
            lineHeight: 1.1,
            marginTop: 2,
          }}
        >
          {descripcion}
        </div>
      </div>
    </div>
  )
}


/* ================================================================
   SLOT CÍRCULO BONITO
   ================================================================ */

function SlotButton({
  espacio,
  seleccionado,
  onClick,
}) {
  const estado = obtenerEstadoVisual(espacio)

  if (!espacio) {
    return (
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: '#e5e7eb',
          border: '2px solid #cbd5e1',
          opacity: 0.55,
        }}
      />
    )
  }

  const numero = String(espacio.numero).padStart(2, '0')
  const ocupado = espacio.estado === 'ocupado'

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${obtenerCodigoEspacio(espacio)} · ${estado.texto}`}
      className={[
        'slot-bonito',
        ocupado ? 'slot-ocupado' : '',
        seleccionado ? 'slot-seleccionado' : '',
      ].join(' ')}
      style={{
        width: 38,
        height: 38,
        minWidth: 38,
        borderRadius: '50%',
        border: seleccionado
          ? '3px solid #f59e0b'
          : `2px solid ${estado.borde}`,
        background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${estado.color} 42%, ${estado.borde} 100%)`,
        color: '#ffffff',
        fontWeight: 800,
        fontSize: 12,
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        boxShadow: seleccionado
          ? '0 0 0 5px rgba(245, 158, 11, 0.22), 0 8px 18px rgba(0,0,0,0.18)'
          : `0 6px 16px rgba(0,0,0,0.16), ${estado.sombra}`,
        transition: 'all 0.18s ease',
        transform: seleccionado ? 'scale(1.10)' : 'scale(1)',
        position: 'relative',
      }}
    >
      {numero}
    </button>
  )
}


/* ================================================================
   COMPONENTE PRINCIPAL
   ================================================================ */

export default function MapaParqueaderoVisual({
  espacios = [],
}) {
  const espaciosOrdenados = useMemo(() => {
    return [...espacios].sort((a, b) => {
      const colA = obtenerLetraColumna(a.columna)
      const colB = obtenerLetraColumna(b.columna)

      if (colA !== colB) {
        return colA.localeCompare(colB)
      }

      return Number(a.numero) - Number(b.numero)
    })
  }, [espacios])


  const mapaEspacios = useMemo(() => {
    const mapa = new Map()

    espaciosOrdenados.forEach((espacio) => {
      const letra = obtenerLetraColumna(espacio.columna)
      const numero = String(espacio.numero).padStart(2, '0')
      mapa.set(`${letra}${numero}`, espacio)
    })

    return mapa
  }, [espaciosOrdenados])


  const filas = useMemo(() => {
    return Array.from({ length: 20 }, (_, index) => {
      const numero = index + 1
      const codigo = String(numero).padStart(2, '0')

      return {
        numero: codigo,
        A: mapaEspacios.get(`A${codigo}`) || null,
        B: mapaEspacios.get(`B${codigo}`) || null,
        C: mapaEspacios.get(`C${codigo}`) || null,
        D: mapaEspacios.get(`D${codigo}`) || null,
      }
    })
  }, [mapaEspacios])


  const [seleccionadoId, setSeleccionadoId] = useState(null)

  useEffect(() => {
    if (espaciosOrdenados.length === 0) {
      setSeleccionadoId(null)
      return
    }

    const existeSeleccionado = espaciosOrdenados.some(
      (espacio) => espacio.id === seleccionadoId,
    )

    if (!seleccionadoId || !existeSeleccionado) {
      const primeroOcupado =
        espaciosOrdenados.find(
          (espacio) => espacio.estado === 'ocupado',
        ) || espaciosOrdenados[0]

      setSeleccionadoId(primeroOcupado.id)
    }
  }, [espaciosOrdenados, seleccionadoId])


  const espacioSeleccionado = useMemo(() => {
    return (
      espaciosOrdenados.find(
        (espacio) => espacio.id === seleccionadoId,
      ) || null
    )
  }, [espaciosOrdenados, seleccionadoId])


  const estadisticas = useMemo(() => {
    const total = espaciosOrdenados.length

    const libres = espaciosOrdenados.filter(
      (espacio) => espacio.estado === 'libre',
    ).length

    const ocupados = espaciosOrdenados.filter(
      (espacio) => espacio.estado === 'ocupado',
    ).length

    const sinDatos = total - libres - ocupados

    return {
      total,
      libres,
      ocupados,
      sinDatos,
    }
  }, [espaciosOrdenados])


  const vehiculo = espacioSeleccionado?.vehiculo || null
  const estadoSeleccionado = obtenerEstadoVisual(espacioSeleccionado)

  return (
    <>
      <style>{`
        @keyframes pulseRojo {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.35); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        @keyframes pulseSeleccionado {
          0% { transform: scale(1.08); }
          50% { transform: scale(1.16); }
          100% { transform: scale(1.08); }
        }

        .slot-bonito:hover {
          transform: translateY(-2px) scale(1.08) !important;
          filter: brightness(1.04);
        }

        .slot-ocupado {
          animation: pulseRojo 1.9s infinite;
        }

        .slot-seleccionado {
          animation: pulseSeleccionado 1.4s infinite ease-in-out;
        }
      `}</style>

      <div className="row g-4">
        {/* ======================================================
            PANEL IZQUIERDO GRANDE
            ====================================================== */}
        <div className="col-12 col-xl-8">
          <CCard className="shadow-sm border-0">
            <CCardBody>
              {/* ==================================================
                  HEADER
                  ================================================== */}
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <small className="text-success fw-semibold">
                    DISEÑO VISUAL DEL PARQUEADERO
                  </small>

                  <h4 className="mt-1 mb-1">
                    Mapa interactivo personalizado
                  </h4>

                  <p className="text-body-secondary mb-0">
                    Haz clic en cualquier espacio para consultar la información
                    del parqueadero en tiempo real.
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 10,
                    minWidth: 260,
                  }}
                >
                  <LegendItem
                    color="#22c55e"
                    borde="#15803d"
                    titulo="Libre"
                    descripcion="Espacio disponible"
                  />

                  <LegendItem
                    color="#ef4444"
                    borde="#b91c1c"
                    titulo="Ocupado"
                    descripcion="Vehículo detectado"
                  />

                  <LegendItem
                    color="#94a3b8"
                    borde="#64748b"
                    titulo="Sin datos"
                    descripcion="Sin lectura reciente"
                  />
                </div>
              </div>

              {/* ==================================================
                  FONDO ILUSTRADO
                  ================================================== */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: 26,
                  padding: 22,
                  background:
                    'linear-gradient(180deg, #89d86f 0%, #68c252 100%)',
                  boxShadow:
                    'inset 0 0 0 3px rgba(255,255,255,0.25), 0 14px 30px rgba(15, 23, 42, 0.08)',
                  overflowX: 'auto',
                }}
              >
                {/* Césped decorativo */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 12,
                    borderRadius: 22,
                    border: '2px dashed rgba(255,255,255,0.18)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Patio asfaltado */}
                <div
                  style={{
                    position: 'relative',
                    minWidth: 640,
                    borderRadius: 24,
                    padding: '24px 20px 26px',
                    background:
                      'linear-gradient(180deg, #777f85 0%, #6d767d 100%)',
                    border: '8px solid #d1d5db',
                    boxShadow:
                      'inset 0 0 0 3px rgba(255,255,255,0.18), inset 0 0 20px rgba(0,0,0,0.12)',
                  }}
                >
                  {/* Flechas inferiores */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 70,
                      right: 70,
                      bottom: 12,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 12,
                      pointerEvents: 'none',
                    }}
                  >
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: 30,
                          opacity: 0.92,
                          fontWeight: 700,
                        }}
                      >
                        ↑
                      </div>
                    ))}
                  </div>

                  {/* Encabezados A B C D */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '64px repeat(4, 1fr)',
                      gap: 14,
                      marginBottom: 14,
                      alignItems: 'center',
                    }}
                  >
                    <div />

                    {['A', 'B', 'C', 'D'].map((columna) => (
                      <div
                        key={columna}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            minWidth: 78,
                            textAlign: 'center',
                            padding: '6px 16px',
                            borderRadius: 14,
                            background:
                              'linear-gradient(180deg, #1ba94c 0%, #0f7d33 100%)',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: 24,
                            boxShadow: '0 8px 16px rgba(0,0,0,0.16)',
                          }}
                        >
                          {columna}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Carriles / líneas */}
                  <div
                    style={{
                      borderRadius: 18,
                      padding: '10px 12px 28px',
                      background:
                        'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.05) 100%)',
                    }}
                  >
                    {filas.map((fila) => (
                      <div
                        key={fila.numero}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '64px repeat(4, 1fr)',
                          gap: 14,
                          alignItems: 'center',
                          padding: '7px 0',
                          borderBottom:
                            fila.numero !== '20'
                              ? '1px dashed rgba(255,255,255,0.18)'
                              : 'none',
                        }}
                      >
                        {/* Número de fila */}
                        <div
                          style={{
                            textAlign: 'center',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: 13,
                            opacity: 0.92,
                          }}
                        >
                          {fila.numero}
                        </div>

                        {['A', 'B', 'C', 'D'].map((columna, index) => {
                          const espacio = fila[columna]
                          const seleccionado =
                            espacio?.id === seleccionadoId

                          return (
                            <div
                              key={`${columna}${fila.numero}`}
                              style={{
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: 44,
                              }}
                            >
                              {/* Línea vertical del carril */}
                              {index < 4 && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    right: -7,
                                    top: -10,
                                    bottom: -10,
                                    borderRight:
                                      index !== 3
                                        ? '2px dashed rgba(255,255,255,0.24)'
                                        : 'none',
                                    pointerEvents: 'none',
                                  }}
                                />
                              )}

                              <SlotButton
                                espacio={espacio}
                                seleccionado={seleccionado}
                                onClick={() => {
                                  if (espacio) {
                                    setSeleccionadoId(espacio.id)
                                  }
                                }}
                              />
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Entrada / salida decorativa */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 14,
                      bottom: 88,
                      width: 62,
                      height: 100,
                      borderRadius: 16,
                      background:
                        'linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%)',
                      border: '2px solid rgba(255,255,255,0.48)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#0f172a',
                      fontWeight: 700,
                      fontSize: 12,
                      textAlign: 'center',
                      boxShadow: '0 8px 14px rgba(0,0,0,0.14)',
                    }}
                  >
                    Entrada
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 44,
                      height: 74,
                      borderRadius: 14,
                      background:
                        'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 900,
                      fontSize: 26,
                      boxShadow: '0 8px 16px rgba(37, 99, 235, 0.24)',
                    }}
                  >
                    P
                  </div>
                </div>

                {/* Tarjetas rápidas */}
                <div
                  style={{
                    marginTop: 18,
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      borderRadius: 16,
                      padding: 14,
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)',
                    }}
                  >
                    <div className="text-body-secondary small">Total</div>
                    <div className="fw-bold fs-3">{estadisticas.total}</div>
                  </div>

                  <div
                    style={{
                      borderRadius: 16,
                      padding: 14,
                      background: '#ecfdf5',
                      border: '1px solid #bbf7d0',
                      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)',
                    }}
                  >
                    <div className="small" style={{ color: '#166534' }}>
                      Libres
                    </div>
                    <div className="fw-bold fs-3" style={{ color: '#166534' }}>
                      {estadisticas.libres}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 16,
                      padding: 14,
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)',
                    }}
                  >
                    <div className="small" style={{ color: '#991b1b' }}>
                      Ocupados
                    </div>
                    <div className="fw-bold fs-3" style={{ color: '#991b1b' }}>
                      {estadisticas.ocupados}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 16,
                      padding: 14,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)',
                    }}
                  >
                    <div className="small" style={{ color: '#475569' }}>
                      Sin datos
                    </div>
                    <div className="fw-bold fs-3" style={{ color: '#475569' }}>
                      {estadisticas.sinDatos}
                    </div>
                  </div>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </div>

        {/* ======================================================
            PANEL DERECHO INFO
            ====================================================== */}
        <div className="col-12 col-xl-4">
          <CCard className="shadow-sm border-0 h-100">
            <CCardBody>
              <div className="mb-3">
                <small className="text-success fw-semibold">
                  INFORMACIÓN DEL ESPACIO
                </small>

                <h4 className="mt-1 mb-0">
                  {espacioSeleccionado
                    ? obtenerCodigoEspacio(espacioSeleccionado)
                    : 'Sin selección'}
                </h4>
              </div>

              {!espacioSeleccionado ? (
                <div className="text-body-secondary">
                  Selecciona un espacio para ver la información.
                </div>
              ) : (
                <>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: estadoSeleccionado.color,
                        border: `2px solid ${estadoSeleccionado.borde}`,
                        display: 'inline-block',
                      }}
                    />

                    <CBadge
                      style={{
                        background: estadoSeleccionado.color,
                        color: '#ffffff',
                        fontWeight: 700,
                        borderRadius: 999,
                        padding: '7px 12px',
                      }}
                    >
                      {estadoSeleccionado.texto}
                    </CBadge>
                  </div>

                  <div
                    style={{
                      borderRadius: 16,
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      padding: 16,
                      marginBottom: 14,
                      boxShadow: '0 6px 14px rgba(15, 23, 42, 0.04)',
                    }}
                  >
                    <div className="mb-2">
                      <div className="small text-body-secondary">Código</div>
                      <strong>{obtenerCodigoEspacio(espacioSeleccionado)}</strong>
                    </div>

                    <div className="mb-2">
                      <div className="small text-body-secondary">Sensor</div>
                      <strong>{espacioSeleccionado.id}</strong>
                    </div>

                    <div className="mb-2">
                      <div className="small text-body-secondary">Distancia</div>
                      <strong>{espacioSeleccionado.distanciaDetectada} cm</strong>
                    </div>

                    <div className="mb-2">
                      <div className="small text-body-secondary">Columna</div>
                      <strong>{obtenerLetraColumna(espacioSeleccionado.columna)}</strong>
                    </div>

                    <div className="mb-0">
                      <div className="small text-body-secondary">
                        Última actualización
                      </div>
                      <strong>{formatearFecha(espacioSeleccionado.fechaHora)}</strong>
                    </div>
                  </div>

                  {espacioSeleccionado.estado === 'ocupado' && vehiculo && (
                    <div
                      style={{
                        borderRadius: 16,
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        padding: 16,
                        marginBottom: 14,
                        boxShadow: '0 6px 14px rgba(15, 23, 42, 0.04)',
                      }}
                    >
                      <div className="small text-body-secondary mb-2">
                        Vehículo vinculado
                      </div>

                      <MiniFotoVehiculo vehiculo={vehiculo} />

                      <div className="mt-3 mb-2">
                        <div className="small text-body-secondary">Placa</div>
                        <strong>{vehiculo.placa}</strong>
                      </div>

                      <div className="mb-2">
                        <div className="small text-body-secondary">Vehículo</div>
                        <strong>
                          {vehiculo.marca} {vehiculo.modelo}
                        </strong>
                      </div>

                      <div className="mb-2">
                        <div className="small text-body-secondary">Color</div>
                        <strong>{vehiculo.color || '—'}</strong>
                      </div>

                      <div className="mb-2">
                        <div className="small text-body-secondary">Tipo</div>
                        <strong>{vehiculo.tipo || '—'}</strong>
                      </div>

                      <div className="mb-0">
                        <div className="small text-body-secondary">Propietario</div>
                        <strong>{vehiculo.propietario_nombre || '—'}</strong>
                      </div>
                    </div>
                  )}

                  {espacioSeleccionado.estado === 'ocupado' && !vehiculo && (
                    <div
                      style={{
                        borderRadius: 16,
                        background: '#fff7ed',
                        border: '1px solid #fdba74',
                        color: '#9a3412',
                        padding: 16,
                        marginBottom: 14,
                        fontWeight: 600,
                      }}
                    >
                      ⚠ El espacio está ocupado, pero todavía no hay un vehículo
                      vinculado en Supabase.
                    </div>
                  )}

                  {espacioSeleccionado.estado === 'libre' && (
                    <div
                      style={{
                        borderRadius: 16,
                        background: '#ecfdf5',
                        border: '1px solid #86efac',
                        color: '#166534',
                        padding: 16,
                        marginBottom: 14,
                        fontWeight: 600,
                      }}
                    >
                      ✓ Este espacio se encuentra disponible.
                    </div>
                  )}

                  {espacioSeleccionado.estado !== 'libre' &&
                    espacioSeleccionado.estado !== 'ocupado' && (
                      <div
                        style={{
                          borderRadius: 16,
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          padding: 16,
                          marginBottom: 14,
                          fontWeight: 600,
                        }}
                      >
                        ℹ Este espacio no tiene datos recientes del sensor.
                      </div>
                    )}

                  <Link
                    to={`/espacios/${espacioSeleccionado.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <CButton color="success" className="w-100">
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