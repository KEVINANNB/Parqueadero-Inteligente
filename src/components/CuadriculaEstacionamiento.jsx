import EspacioCard from './EspacioCard'

const LETRA = ['A', 'B', 'C', 'D']

export default function CuadriculaEstacionamiento({ espacios }) {
  const columnas = [1, 2, 3, 4].map((col) =>
    espacios
      .filter((e) => e.columna === col)
      .sort((a, b) => a.numero - b.numero)
  )

  return (
    <div>
      <div className="cuadricula-entrada">ENTRADA · · · · · · · · · · · ·</div>
      <div className="cuadricula">
        {columnas.map((espaciosColumna, i) => (
          <div key={i}>
            <div className="columna-titulo">COLUMNA {LETRA[i]}</div>
            <div className="columna-espacios">
              {espaciosColumna.map((espacio) => (
                <EspacioCard key={espacio.id} espacio={espacio} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
