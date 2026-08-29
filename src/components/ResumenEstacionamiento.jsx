export default function ResumenEstacionamiento({
  estadisticas,
}) {
  const {
    total,

    disponibles,

    reservados,

    ocupadosFisicos,

    porcentajeDisponible,
  } =
    estadisticas


  return (
    <div className="stats-grid">

      {/* TOTAL */}

      <div className="stat-card">

        <div className="label">
          Total
        </div>


        <div className="value">
          {total}
        </div>


        <div className="hint">

          espacios monitoreados

        </div>

      </div>


      {/* DISPONIBLES */}

      <div className="stat-card">

        <div className="label">

          Disponibles

        </div>


        <div className="value verde">

          {disponibles}

        </div>


        <div className="hint">

          {
            porcentajeDisponible
              .toFixed(0)
          }

          % del parqueadero

        </div>

      </div>


      {/* RESERVADOS */}

      <div className="stat-card">

        <div className="label">

          Reservados

        </div>


        <div className="value rojo">

          {reservados}

        </div>


        <div className="hint">

          apartados por usuarios

        </div>

      </div>


      {/* OCUPADOS */}

      <div className="stat-card">

        <div className="label">

          Ocupados por sensor

        </div>


        <div className="value rojo">

          {ocupadosFisicos}

        </div>


        <div className="hint">

          vehículos detectados

        </div>

      </div>


      {/* DISTRIBUCIÓN */}

      <div className="stat-card">

        <div className="label">

          Distribución

        </div>


        <div className="value">

          4 × 20

        </div>


        <div className="hint">

          columnas × espacios

        </div>

      </div>

    </div>
  )
}