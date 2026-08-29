function formatoFecha(
  timestamp,
) {
  if (
    !timestamp
  ) {
    return '—'
  }


  return new Date(
    timestamp,
  ).toLocaleString(
    'es-EC',
    {
      day:
        '2-digit',

      month:
        'short',

      hour:
        '2-digit',

      minute:
        '2-digit',

      second:
        '2-digit',
    },
  )
}


/* ================================================================
   SENSOR
   ================================================================ */

function EventoSensor({
  evento,
}) {
  const libre =
    evento.estado ===
    'libre'


  return (
    <div
      className="historial-item"
    >

      <span className="estado">

        <span
          className="dot"

          style={{
            background:
              libre
                ? 'var(--verde)'
                : 'var(--rojo)',
          }}
        />


        {
          libre
            ? 'Libre'
            : 'Ocupado'
        }

      </span>


      <span>

        {
          evento
            .distanciaDetectada
        }

        {' '}cm

      </span>


      <span>

        {
          formatoFecha(
            evento.timestamp,
          )
        }

      </span>

    </div>
  )
}


/* ================================================================
   RESERVA
   ================================================================ */

function EventoReserva({
  evento,
}) {
  const creada =
    evento.tipo_evento ===
    'reserva_creada'


  return (
    <div
      className="historial-item"

      style={{
        background:
          creada
            ? '#fff7ed'
            : '#f8fafc',
      }}
    >

      {/* EVENTO */}

      <span className="estado">

        <span
          className="dot"

          style={{
            background:
              creada
                ? '#f59e0b'
                : '#64748b',
          }}
        />


        <strong>

          {
            creada
              ? 'Reserva'
              : 'Reserva cancelada'
          }

        </strong>

      </span>


      {/* VEHÍCULO */}

      <span>

        {evento.placa ? (

          <>

            <strong>
              {evento.placa}
            </strong>

            {' · '}

            {
              evento.marca
            }

            {' '}

            {
              evento.modelo
            }

          </>

        ) : (

          'Vehículo'

        )}

      </span>


      {/* FECHA */}

      <span>

        {
          formatoFecha(
            evento.timestamp,
          )
        }

      </span>

    </div>
  )
}


/* ================================================================
   COMPONENTE
   ================================================================ */

export default function HistorialEspacio({
  historial,
  cargando,
}) {
  if (
    cargando
  ) {

    return (
      <p className="estado-cargando">

        Cargando historial…

      </p>
    )

  }


  if (
    !historial.length
  ) {

    return (
      <p className="estado-vacio">

        Aún no hay eventos registrados.

      </p>
    )

  }


  return (
    <div className="historial-lista">

      {historial.map(
        (
          evento,
        ) => {

          if (
            evento.tipo ===
            'reserva'
          ) {

            return (
              <EventoReserva

                key={
                  evento.id_evento
                }

                evento={
                  evento
                }

              />
            )

          }


          return (
            <EventoSensor

              key={
                evento.id_evento
              }

              evento={
                evento
              }

            />
          )

        },
      )}

    </div>
  )
}