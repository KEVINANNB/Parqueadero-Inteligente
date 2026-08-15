export default function ResumenEstacionamiento({ estadisticas }) {
  const { total, libres, ocupados, porcentajeDisponible } = estadisticas

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="label">Total</div>
        <div className="value">{total}</div>
        <div className="hint">espacios monitoreados</div>
      </div>
      <div className="stat-card">
        <div className="label">Disponibles</div>
        <div className="value verde">{libres}</div>
        <div className="hint">
          {porcentajeDisponible.toFixed(0)}% del parqueadero
        </div>
      </div>
      <div className="stat-card">
        <div className="label">Ocupados</div>
        <div className="value rojo">{ocupados}</div>
        <div className="hint">
          {(100 - porcentajeDisponible).toFixed(0)}% del parqueadero
        </div>
      </div>
      <div className="stat-card">
        <div className="label">Distribución</div>
        <div className="value">4 × 20</div>
        <div className="hint">columnas × espacios</div>
      </div>
    </div>
  )
}
