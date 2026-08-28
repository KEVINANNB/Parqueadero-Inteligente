import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
} from '@coreui/react'

const RUTA_IMAGEN = '/images/mapa-parqueadero-base.png'

/* =========================================================
   CONFIGURACIÓN DE POSICIONES SOBRE LA IMAGEN
   Ajustadas para la imagen del parqueadero generada.
   Si luego quieres mover 2px alguna zona, solo editas aquí.
   ========================================================= */

const SECCIONES = {
  A: { left: 11.8, width: 15.8 },
  B: { left: 31.1, width: 15.8 },
  C: { left: 50.4, width: 15.8 },
  D: { left: 69.7, width: 15.8 },
}

const TOP_INICIAL = 28.8
const PASO_FILAS = 5.55
const SUBCOLUMNA_IZQ = 29
const SUBCOLUMNA_DER = 71

/* =========================================================
   HELPERS
   ========================================================= */

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

function obtenerNumeroEspacio(espacio) {
  const numero = Number(espacio?.numero ?? 1)
  if (Number.isNaN(numero)) return 1
  return Math.min(Math.max(numero, 1), 20)
}

function obtenerCodigoEspacio(espacio) {
  if (!espacio) return '—'

  if (espacio.codigo_puesto) {
    return espacio.codigo_puesto
  }

  const letra = obtenerLetraColumna(espacio.columna)
  const numero = String(obtenerNumeroEspacio(espacio)).padStart(2, '0')
  return `${letra}${numero}`
}

function obtenerEstadoVisual(espacio) {
  if (!espacio || !espacio.estado) {
    return {
      color: '#94a3b8',
      borde: '#64748b',
      texto: 'Sin datos',
      fondo: '#f8fafc',
    }
  }

  if (espacio.estado === 'libre') {
    return {
      color: '#22c55e',
      borde: '#15803d',
      texto: 'Libre',
      fondo: '#ecfdf5',
    }
  }

  if (espacio.estado === 'ocupado') {
    return {
      color: '#ef4444',
      borde: '#b91c1c',
      texto: 'Ocupado',
      fondo: '#fef2f2',
    }
  }

  return {
    color: '#94a3b8',
    borde: '#64748b',
    texto: 'Sin datos',
    fondo: '#f8fafc',
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

function obtenerPosicionEspacio(espacio) {
  const letra = obtenerLetraColumna(espacio.columna)
  const numero = obtenerNumeroEspacio(espacio)

  const configuracion = SECCIONES[letra] || SECCIONES.A

  const esSubcolumnaDerecha = numero >= 11
  const filaInterna = esSubcolumnaDerecha ? numero - 11 : numero - 1

  const porcentajeHorizontalInterno = esSubcolumnaDerecha
    ? SUBCOLUMNA_DER
    : SUBCOLUMNA_IZQ

  const left =
    configuracion.left +
    (configuracion.width * porcentajeHorizontalInterno) / 100

  const top = TOP_INICIAL + filaInterna * PASO_FILAS

  return { left, top }
}

function ordenarEspacios(espacios) {
  return [...espacios].sort((a, b) => {
    const colA = obtenerLetraColumna(a.columna)
    const colB = obtenerLetraColumna(b.columna)

    if (colA !== colB) {
      return colA.localeCompare(colB)
    }

    return obtenerNumeroEspacio(a) - obtenerNumeroEspacio(b)
  })
}

/* =========================================================
   MINI FOTO
   ========================================================= */

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
          height: 150,
          borderRadius: 14,
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
          display: 'grid',
          placeItems: 'center',
          color: '#6b7280',
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
        height: 150,
        objectFit: 'cover',
        borderRadius: 14,
        border: '1px solid #e5e7eb',
      }}
    />
  )
}

/* =========================================================
   BOTÓN / ESPACIO
   ========================================================= */

function BotonEspacio({ espacio, activo, onClick }) {
  const estado = obtenerEstadoVisual(espacio)
  const numero = String(obtenerNumeroEspacio(espacio)).padStart(2, '0')
  const ocupado = espacio?.estado === 'ocupado'

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${obtenerCodigoEspacio(espacio)} · ${estado.texto}`}
      className={[
        'slot-parqueadero',
        ocupado ? 'slot-ocupado' : '',
        activo ? 'slot-activo' : '',
      ].join(' ')}
      style={{
        width: 28,
        height: 28,
        minWidth: 28,
        borderRadius: '50%',
        border: activo ? '3px solid #f59e0b' : `2px solid ${estado.borde}`,
        background: estado.color,
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 800,
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        boxShadow: activo
          ? '0 0 0 4px rgba(245,158,11,0.25), 0 6px 14px rgba(0,0,0,0.16)'
          : '0 4px 10px rgba(0,0,0,0.16)',
        transition: 'all 0.18s ease',
        lineHeight: 1,
      }}
    >
      {numero}
    </button>
  )
}

/* =========================================================
   LEYENDA
   ========================================================= */

function LeyendaEstado() {
  const items = [
    {
      color: '#22c55e',
      borde: '#15803d',
      titulo: 'Libre',
      descripcion: 'Espacio disponible',
    },
    {
      color: '#ef4444',
      borde: '#b91c1c',
      titulo: 'Ocupado',
      descripcion: 'Vehículo detectado',
    },
    {
      color: '#94a3b8',
      borde: '#64748b',
      titulo: 'Sin datos',
      descripcion: 'Sin lectura reciente',
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 10,
      }}
    >
      {items.map((item) => (
        <div
          key={item.titulo}
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 14,
            padding: '10px 12px',
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: item.color,
              border: `2px solid ${item.borde}`,
              display: 'inline-block',
              flexShrink: 0,
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
              {item.titulo}
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#6b7280',
                lineHeight: 1.1,
                marginTop: 2,
              }}
            >
              {item.descripcion}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* =========================================================
   COMPONENTE PRINCIPAL
   compacto = true  => tamaño tipo panel pequeño
   compacto = false => tamaño vista grande
   ========================================================= */

export default function MapaParqueaderoVisual({
  espacios = [],
  compacto = false,
}) {
  const espaciosOrdenados = useMemo(() => ordenarEspacios(espacios), [espacios])

  const [seleccionadoId, setSeleccionadoId] = useState(null)

  useEffect(() => {
    if (espaciosOrdenados.length === 0) {
      setSeleccionadoId(null)
      return
    }

    const existe = espaciosOrdenados.some((item) => item.id === seleccionadoId)

    if (!seleccionadoId || !existe) {
      const primeroOcupado =
        espaciosOrdenados.find((item) => item.estado === 'ocupado') ||
        espaciosOrdenados[0]

      setSeleccionadoId(primeroOcupado.id)
    }
  }, [espaciosOrdenados, seleccionadoId])

  const espacioSeleccionado = useMemo(() => {
    return (
      espaciosOrdenados.find((item) => item.id === seleccionadoId) || null
    )
  }, [espaciosOrdenados, seleccionadoId])

  const estadisticas = useMemo(() => {
    const total = espaciosOrdenados.length
    const libres = espaciosOrdenados.filter((item) => item.estado === 'libre').length
    const ocupados = espaciosOrdenados.filter((item) => item.estado === 'ocupado').length
    const sinDatos = total - libres - ocupados

    return {
      total,
      libres,
      ocupados,
      sinDatos,
    }
  }, [espaciosOrdenados])

  const estadoSeleccionado = obtenerEstadoVisual(espacioSeleccionado)
  const vehiculo = espacioSeleccionado?.vehiculo || null

  return (
    <>
      <style>{`
        @keyframes pulsoRojo {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.35); }
          70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }

        .slot-parqueadero:hover {
          transform: scale(1.08);
          filter: brightness(1.03);
        }

        .slot-ocupado {
          animation: pulsoRojo 1.9s infinite;
        }

        .slot-activo {
          z-index: 5;
        }
      `}</style>

      <div className="row g-4">
        {/* =====================================================
            IMAGEN + BOTONES
            ===================================================== */}
        <div className={compacto ? 'col-12' : 'col-12 col-xl-8'}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardBody className="p-3 p-md-4">
              <div className="mb-3">
                <small className="text-success fw-semibold">
                  MAPA PERSONALIZADO DEL PARQUEADERO
                </small>

                <h4 className="mt-1 mb-1">
                  Vista visual de los 80 espacios
                </h4>

                <p className="text-body-secondary mb-0">
                  Haz clic en cualquier espacio para consultar su información.
                </p>
              </div>

              <div className="mb-3">
                <LeyendaEstado />
              </div>

              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: 18,
                  overflow: 'hidden',
                  border: '1px solid #d1d5db',
                  background: '#f3f4f6',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)',
                }}
              >
                <img
                  src={RUTA_IMAGEN}
                  alt="Mapa del parqueadero"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                {espaciosOrdenados.map((espacio) => {
                  const { left, top } = obtenerPosicionEspacio(espacio)
                  const activo = espacio.id === seleccionadoId

                  return (
                    <div
                      key={espacio.id}
                      style={{
                        position: 'absolute',
                        left: `${left}%`,
                        top: `${top}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: activo ? 5 : 2,
                      }}
                    >
                      <BotonEspacio
                        espacio={espacio}
                        activo={activo}
                        onClick={() => setSeleccionadoId(espacio.id)}
                      />
                    </div>
                  )
                })}
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div className="small text-body-secondary">Total</div>
                  <div className="fw-bold fs-4">{estadisticas.total}</div>
                </div>

                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #bbf7d0',
                    borderRadius: 14,
                    padding: 12,
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
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 14,
                    padding: 12,
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
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: 12,
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
            </CCardBody>
          </CCard>
        </div>

        {/* =====================================================
            PANEL DE INFORMACIÓN
            ===================================================== */}
        <div className={compacto ? 'col-12' : 'col-12 col-xl-4'}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardBody>
              <div className="mb-3">
                <small className="text-success fw-semibold">
                  INFORMACIÓN DEL ESPACIO
                </small>

                <h4 className="mt-1 mb-0">
                  {espacioSeleccionado ? obtenerCodigoEspacio(espacioSeleccionado) : 'Sin selección'}
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
                        padding: '6px 12px',
                        borderRadius: 999,
                        fontWeight: 700,
                      }}
                    >
                      {estadoSeleccionado.texto}
                    </CBadge>
                  </div>

                  <div
                    style={{
                      borderRadius: 14,
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      padding: 14,
                      marginBottom: 14,
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
                      <div className="small text-body-secondary">Última actualización</div>
                      <strong>{formatearFecha(espacioSeleccionado.fechaHora)}</strong>
                    </div>
                  </div>

                  {espacioSeleccionado.estado === 'ocupado' && vehiculo && (
                    <div
                      style={{
                        borderRadius: 14,
                        border: '1px solid #e5e7eb',
                        background: '#ffffff',
                        padding: 14,
                        marginBottom: 14,
                      }}
                    >
                      <div className="small text-body-secondary mb-2">
                        Vehículo vinculado
                      </div>

                      <MiniFotoVehiculo vehiculo={vehiculo} />

                      <div className="mt-3 mb-2">
                        <div className="small text-body-secondary">Placa</div>
                        <strong>{vehiculo.placa || '—'}</strong>
                      </div>

                      <div className="mb-2">
                        <div className="small text-body-secondary">Vehículo</div>
                        <strong>
                          {vehiculo.marca || '—'} {vehiculo.modelo || ''}
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

                      <div className="mb-2">
                        <div className="small text-body-secondary">Propietario</div>
                        <strong>{vehiculo.propietario_nombre || '—'}</strong>
                      </div>

                      <div className="mb-2">
                        <div className="small text-body-secondary">Correo</div>
                        <strong>{vehiculo.correo_institucional || '—'}</strong>
                      </div>

                      <div className="mb-0">
                        <div className="small text-body-secondary">Autorización</div>
                        <strong>{vehiculo.autorizado ? 'Autorizado' : 'No autorizado'}</strong>
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
                      ⚠ El espacio está ocupado, pero todavía no hay un vehículo vinculado en Supabase.
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

                  {espacioSeleccionado.estado !== 'libre' &&
                    espacioSeleccionado.estado !== 'ocupado' && (
                      <div
                        style={{
                          borderRadius: 14,
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          padding: 14,
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