const COLUMNAS = [1, 2, 3, 4]
const LETRA = ['A', 'B', 'C', 'D']

export default function FiltrosEspacios({ filtros, onCambiarFiltros }) {
  const { estado, columna } = filtros

  return (
    <div className="filtros">
      <div className="chip-group">
        {['todos', 'libre', 'ocupado'].map((valor) => (
          <button
            key={valor}
            className={`chip ${estado === valor ? 'activo' : ''}`}
            onClick={() => onCambiarFiltros({ ...filtros, estado: valor })}
          >
            {valor === 'todos'
              ? 'Todos'
              : valor === 'libre'
                ? 'Libres'
                : 'Ocupados'}
          </button>
        ))}
      </div>
      <div className="chip-group">
        <button
          className={`chip ${columna === 'todas' ? 'activo' : ''}`}
          onClick={() => onCambiarFiltros({ ...filtros, columna: 'todas' })}
        >
          Todas
        </button>
        {COLUMNAS.map((c) => (
          <button
            key={c}
            className={`chip ${columna === c ? 'activo' : ''}`}
            onClick={() => onCambiarFiltros({ ...filtros, columna: c })}
          >
            {LETRA[c - 1]}
          </button>
        ))}
      </div>
    </div>
  )
}
