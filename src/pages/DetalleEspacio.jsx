import { useParams, Link } from 'react-router-dom'
import useEspacio from '../hooks/useEspacio'
import useHistorialEspacio from '../hooks/useHistorialEspacio'
import HistorialEspacio from '../components/HistorialEspacio'
import MapaEstacionamiento from '../components/MapaEstacionamiento'

function formatoFecha(timestamp) {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function DetalleEspacio() {
  const { id } = useParams()
  const { espacio, cargando } = useEspacio(id)
  const { historial, cargando: cargandoHistorial } = useHistorialEspacio(id)

  if (cargando) {
    return <p className="estado-cargando">Cargando espacio…</p>
  }

  if (!espacio) {
    return (
      <div>
        <p className="estado-vacio">No se encontró el espacio "{id}".</p>
        <Link to="/estacionamiento" className="volver">
          ← Volver al estacionamiento
        </Link>
      </div>
    )
  }

  const porcentajeBarra = Math.min(100, (espacio.distanciaDetectada / 260) * 100)

  return (
    <>
      <div className="detalle-header">
        <Link to="/estacionamiento" className="volver">
          ← Volver al estacionamiento
        </Link>
        <span className={`estado-pill ${espacio.estado}`}>
          {espacio.estado === 'libre' ? 'Libre' : 'Ocupado'}
        </span>
      </div>

      <div className="layout-split sensor-detalle">
        <div className="panel">
          <div className="panel-title">
            <h2>Sensor seleccionado</h2>
          </div>
          <h1 style={{ margin: '0 0 0.3rem' }}>{espacio.etiqueta}</h1>

          <div className="label" style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--text-2)' }}>
            Distancia detectada
          </div>
          <div className="medida-grande">{espacio.distanciaDetectada} cm</div>
          <div className="barra">
            <div className="barra-fill" style={{ width: `${porcentajeBarra}%` }} />
          </div>

          <div className="detalle-lista">
            <div className="fila">
              <span>ID RTDB</span>
              <b>{espacio.id}</b>
            </div>
            <div className="fila">
              <span>Columna / número</span>
              <b>
                {espacio.columna} / {espacio.numero}
              </b>
            </div>
            <div className="fila">
              <span>Centro geográfico</span>
              <b>
                {espacio.ubicacion.latitud.toFixed(6)},{' '}
                {espacio.ubicacion.longitud.toFixed(6)}
              </b>
            </div>
            <div className="fila">
              <span>Bounding box (N/S/O/E)</span>
              <b>
                {espacio.ubicacion.boundingBox.norte.toFixed(6)} /{' '}
                {espacio.ubicacion.boundingBox.sur.toFixed(6)} /{' '}
                {espacio.ubicacion.boundingBox.oeste.toFixed(6)} /{' '}
                {espacio.ubicacion.boundingBox.este.toFixed(6)}
              </b>
            </div>
            <div className="fila">
              <span>Última actualización</span>
              <b>{formatoFecha(espacio.fechaHora)}</b>
            </div>
          </div>

          <div className="panel-title" style={{ marginTop: '1.5rem' }}>
            <h2>Historial reciente</h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>
              {historial.length} eventos
            </span>
          </div>
          <HistorialEspacio historial={historial} cargando={cargandoHistorial} />
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>Ubicación del espacio</h2>
          </div>
          <MapaEstacionamiento espacioSeleccionado={espacio} />
        </div>
      </div>
    </>
  )
}
