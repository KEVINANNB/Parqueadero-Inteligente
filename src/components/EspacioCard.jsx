import { useNavigate } from 'react-router-dom'

function claseEstado(estado) {
  if (estado === 'libre') return 'libre'
  if (estado === 'ocupado') return 'ocupado'
  return 'sin-datos'
}

export default function EspacioCard({ espacio }) {
  const navigate = useNavigate()

  if (!espacio) return null

  return (
    <button
      className={`espacio-card ${claseEstado(espacio.estado)}`}
      onClick={() => navigate(`/espacios/${espacio.id}`)}
      title={`${espacio.id} · ${espacio.estado}`}
    >
      <div className="fila-top">
        <span>{espacio.etiqueta}</span>
        <span>{espacio.distanciaDetectada} cm</span>
      </div>
    </button>
  )
}
