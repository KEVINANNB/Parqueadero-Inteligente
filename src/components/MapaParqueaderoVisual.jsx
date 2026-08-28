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


function obtenerEstadoVisual(espacio) {
  if (!espacio) {
    return {
      color: '#94a3b8',
      borde: '#64748b',
      texto: 'Sin datos',
      fondoSuave: '#f1f5f9',
    }
  }

  if (espacio.estado === 'libre') {
    return {
      color: '#22c55e',
      borde: '#15803d',
      texto: 'Libre',
      fondoSuave: '#ecfdf5',
    }
  }

  if (espacio.estado === 'ocupado') {
    return {
      color: '#ef4444',
      borde: '#b91c1c',
      texto: 'Ocupado',
      fondoSuave: '#fef2f2',
    }
  }

  return {
    color: '#94a3b8',
    borde: '#64748b',
    texto: 'Sin datos',
    fondoSuave: '#f1f5f9',
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


function SlotButton({
  espacio,
  seleccionado,
  onClick,
}) {
  const estado = obtenerEstadoVisual(espacio)

  return (
    <button
      type="button"
      onClick={onClick}
      title={
        espacio
          ? `${espacio.etiqueta} · ${estado.texto}`
          : 'Espacio sin datos'
      }
      style={{
        width: 28,
        height: 28,
        minWidth: 28,
        borderRadius: '50%',
        border: seleccionado
          ? '3px solid #f59e0b'
          : `2px solid ${estado.borde}`,
        background: estado.color,
        cursor: 'pointer',
        boxShadow: seleccionado
          ? '0 0 0 4px rgba(245, 158, 11, 0.22)'
          : '0 3px 8px rgba(0,0,0,0.12)',
        transform: seleccionado ? 'scale(1.12)' : 'scale(1)',
        transition: 'all 0.18s ease',
      }}
    />
  )
}


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


  const [
    seleccionadoId,
    setSeleccionadoId,
  ] = useState(null)


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
    return espaciosOrdenados.find(
      (espacio) => espacio.id === seleccionadoId,
    ) || null
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
    <div className="row g-4">
      <div className="col-12 col-xl-8">
        <CCard className="shadow-sm border-0">
          <CCardBody>
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
              <div>
                <small className="text-success fw-semibold">
                  DISEÑO VISUAL DEL PARQUEADERO
                </small>

                <h4 className="mt-1 mb-1">
                  Mapa interactivo personalizado
                </h4>

                <p className="text-body-secondary mb-0">
                  Haz clic en cualquier círculo para consultar la información
                  del espacio correspondiente.
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <CBadge color="success" className="p-2">
                  ● Libre
                </CBadge>

                <CBadge color="danger" className="p-2">
                  ● Ocupado
                </CBadge>

                <CBadge color="secondary" className="p-2">
                  ● Sin datos
                </CBadge>
              </div>
            </div>

            <div
              style={{
                borderRadius: 18,
                padding: 18,
                border: '4px solid #4ade80',
                background:
                  'linear-gradient(180deg, #eefbf1 0%, #f8fafc 100%)',
                boxShadow: 'inset 0 0 0 4px rgba(74, 222, 128, 0.12)',
                overflowX: 'auto',
              }}
            >
              <div
                style={{
                  minWidth: 520,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '58px repeat(4, 1fr)',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div />

                  {['A', 'B', 'C', 'D'].map((columna) => (
                    <div
                      key={columna}
                      style={{
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: 22,
                        color: '#111827',
                      }}
                    >
                      {columna}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    borderRadius: 16,
                    padding: '14px 12px',
                    background:
                      'linear-gradient(90deg, rgba(16,185,129,0.06) 0%, rgba(255,255,255,0.9) 48%, rgba(16,185,129,0.06) 100%)',
                    border: '1px solid #d1fae5',
                  }}
                >
                  {filas.map((fila) => (
                    <div
                      key={fila.numero}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '58px repeat(4, 1fr)',
                        alignItems: 'center',
                        gap: 12,
                        padding: '7px 0',
                        borderBottom:
                          fila.numero !== '20'
                            ? '1px dashed rgba(15, 23, 42, 0.10)'
                            : 'none',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#334155',
                          fontSize: 13,
                          textAlign: 'center',
                        }}
                      >
                        {fila.numero}
                      </div>

                      {['A', 'B', 'C', 'D'].map((columna) => {
                        const espacio = fila[columna]
                        const seleccionado =
                          espacio?.id === seleccionadoId

                        return (
                          <div
                            key={`${columna}${fila.numero}`}
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <SlotButton
                              espacio={espacio}
                              seleccionado={seleccionado}
                              onClick={() => {
                                if (espacio) {
                                  setSeleccionadoId(espacio.id)
                                }
                              }}
                            />

                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: seleccionado
                                  ? '#b45309'
                                  : '#475569',
                                minWidth: 32,
                              }}
                            >
                              {columna}
                              {fila.numero}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>

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
                      borderRadius: 14,
                      padding: 12,
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <div className="text-body-secondary small">Total</div>
                    <div className="fw-bold fs-4">{estadisticas.total}</div>
                  </div>

                  <div
                    style={{
                      borderRadius: 14,
                      padding: 12,
                      background: '#ecfdf5',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <div className="small" style={{ color: '#166534' }}>
                      Libres
                    </div>
                    <div className="fw-bold fs-4" style={{ color: '#166534' }}>
                      {estadisticas.libres}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 14,
                      padding: 12,
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                    }}
                  >
                    <div className="small" style={{ color: '#991b1b' }}>
                      Ocupados
                    </div>
                    <div className="fw-bold fs-4" style={{ color: '#991b1b' }}>
                      {estadisticas.ocupados}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 14,
                      padding: 12,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div className="small" style={{ color: '#475569' }}>
                      Sin datos
                    </div>
                    <div className="fw-bold fs-4" style={{ color: '#475569' }}>
                      {estadisticas.sinDatos}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </div>

      <div className="col-12 col-xl-4">
        <CCard className="shadow-sm border-0 h-100">
          <CCardBody>
            <div className="mb-3">
              <small className="text-success fw-semibold">
                INFORMACIÓN DEL ESPACIO
              </small>

              <h4 className="mt-1 mb-0">
                {espacioSeleccionado
                  ? espacioSeleccionado.codigo_puesto || espacioSeleccionado.etiqueta
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
                    }}
                  >
                    {estadoSeleccionado.texto}
                  </CBadge>
                </div>

                <div
                  style={{
                    borderRadius: 14,
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    padding: 14,
                    marginBottom: 14,
                  }}
                >
                  <div className="mb-2">
                    <div className="small text-body-secondary">Código</div>
                    <strong>
                      {espacioSeleccionado.codigo_puesto || espacioSeleccionado.etiqueta}
                    </strong>
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
                      borderRadius: 14,
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      padding: 14,
                      marginBottom: 14,
                    }}
                  >
                    <div className="small text-body-secondary mb-2">
                      Vehículo vinculado
                    </div>

                    {vehiculo.foto_url && (
                      <img
                        src={vehiculo.foto_url}
                        alt={vehiculo.placa}
                        style={{
                          width: '100%',
                          height: 160,
                          objectFit: 'cover',
                          borderRadius: 12,
                          marginBottom: 12,
                          border: '1px solid #e5e7eb',
                        }}
                      />
                    )}

                    <div className="mb-2">
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
                      <strong>{vehiculo.color}</strong>
                    </div>

                    <div className="mb-2">
                      <div className="small text-body-secondary">Tipo</div>
                      <strong>{vehiculo.tipo}</strong>
                    </div>

                    <div className="mb-0">
                      <div className="small text-body-secondary">Propietario</div>
                      <strong>{vehiculo.propietario_nombre}</strong>
                    </div>
                  </div>
                )}

                {espacioSeleccionado.estado === 'ocupado' && !vehiculo && (
                  <div
                    style={{
                      borderRadius: 14,
                      background: '#fff7ed',
                      border: '1px solid #fdba74',
                      color: '#9a3412',
                      padding: 14,
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
                      borderRadius: 14,
                      background: '#ecfdf5',
                      border: '1px solid #86efac',
                      color: '#166534',
                      padding: 14,
                      marginBottom: 14,
                      fontWeight: 600,
                    }}
                  >
                    ✓ Este espacio se encuentra disponible.
                  </div>
                )}

                <Link
                  to={`/espacios/${espacioSeleccionado.id}`}
                  style={{
                    textDecoration: 'none',
                  }}
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
  )
}