function formatoFecha(timestamp) {
  return new Date(timestamp).toLocaleString('es-EC', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function HistorialEspacio({ historial, cargando }) {
  if (cargando) {
    return <p className="estado-cargando">Cargando historial…</p>
  }

  if (!historial.length) {
    return <p className="estado-vacio">Aún no hay eventos registrados.</p>
  }

  return (
    <div className="historial-lista">
      {historial.map((evento) => (
        <div className="historial-item" key={evento.fechaHora}>
          <span className="estado">
            <span
              className="dot"
              style={{
                background:
                  evento.estado === 'libre'
                    ? 'var(--verde)'
                    : 'var(--rojo)',
              }}
            />
            {evento.estado === 'libre' ? 'Libre' : 'Ocupado'}
          </span>
          <span>{evento.distanciaDetectada} cm</span>
          <span>{formatoFecha(evento.fechaHora)}</span>
        </div>
      ))}
    </div>
  )
}
