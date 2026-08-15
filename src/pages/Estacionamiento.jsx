import { useEffect, useMemo, useState } from 'react'
import useEspacios from '../hooks/useEspacios'
import ResumenEstacionamiento from '../components/ResumenEstacionamiento'
import FiltrosEspacios from '../components/FiltrosEspacios'
import CuadriculaEstacionamiento from '../components/CuadriculaEstacionamiento'
import MapaEstacionamiento from '../components/MapaEstacionamiento'
import { iniciarSimulacion } from '../services/simulacion'

export default function Estacionamiento() {
  const { espacios, cargando, error, estadisticas } = useEspacios()
  const [filtros, setFiltros] = useState({ estado: 'todos', columna: 'todas' })

  // Inicia la simulación periódica mientras el usuario está en esta página
  useEffect(() => {
    const detener = iniciarSimulacion(15000)
    return () => detener()
  }, [])

  const espaciosFiltrados = useMemo(() => {
    return espacios.filter((e) => {
      const coincideEstado = filtros.estado === 'todos' || e.estado === filtros.estado
      const coincideColumna =
        filtros.columna === 'todas' || e.columna === filtros.columna
      return coincideEstado && coincideColumna
    })
  }, [espacios, filtros])

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Campus UTEQ · Quevedo</span>
          <h1>Parqueadero inteligente</h1>
          <p>
            Disponibilidad de los 80 espacios en tiempo real, con filtros por
            columna y estado.
          </p>
        </div>
        <span className="badge-live">
          <span className="dot-pulse" /> RTDB en vivo
        </span>
      </div>

      <ResumenEstacionamiento estadisticas={estadisticas} />

      <div className="layout-split">
        <div className="panel">
          <div className="panel-title">
            <h2>Disponibilidad por espacio</h2>
            <div className="legend">
              <span>
                <i className="i-libre" /> Libre
              </span>
              <span>
                <i className="i-ocupado" /> Ocupado
              </span>
              <span>
                <i className="i-gris" /> Sin datos
              </span>
            </div>
          </div>

          <FiltrosEspacios filtros={filtros} onCambiarFiltros={setFiltros} />

          {cargando && <p className="estado-cargando">Cargando espacios…</p>}
          {error && (
            <p className="estado-vacio">
              No se pudo conectar a Firebase. Revisa tu archivo .env.
            </p>
          )}
          {!cargando && !error && (
            <CuadriculaEstacionamiento espacios={espaciosFiltrados} />
          )}
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>Ubicación del parqueadero</h2>
          </div>
          <MapaEstacionamiento />
        </div>
      </div>
    </>
  )
}
