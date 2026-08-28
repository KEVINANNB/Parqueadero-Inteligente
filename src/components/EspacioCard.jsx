import {
  useNavigate,
} from 'react-router-dom'


function claseEstado(
  estado,
) {

  if (
    estado === 'libre'
  ) {
    return 'libre'
  }


  if (
    estado === 'ocupado'
  ) {
    return 'ocupado'
  }


  return 'sin-datos'
}


export default function EspacioCard({
  espacio,
}) {
  const navigate =
    useNavigate()


  if (!espacio) {
    return null
  }


  const vehiculo =
    espacio.vehiculo


  const ocupado =
    espacio.estado ===
    'ocupado'


  return (

    <button

      className={
        `espacio-card ${claseEstado(
          espacio.estado,
        )}`
      }

      onClick={() =>
        navigate(
          `/espacios/${espacio.id}`,
        )
      }

      title={
        `${espacio.etiqueta} · ${espacio.estado}`
      }

    >

      <div className="fila-top">

        <strong>
          {espacio.etiqueta}
        </strong>

        <span>
          {
            espacio
              .distanciaDetectada
          }{' '}
          cm
        </span>

      </div>


      {ocupado &&
        vehiculo && (

          <div
            style={{
              marginTop:
                '0.45rem',

              paddingTop:
                '0.45rem',

              borderTop:
                '1px solid rgba(255,255,255,0.35)',

              textAlign:
                'left',
            }}
          >

            <div
              style={{
                fontWeight:
                  700,

                fontSize:
                  '0.78rem',
              }}
            >
              {vehiculo.placa}
            </div>


            <div
              style={{
                fontSize:
                  '0.7rem',

                marginTop:
                  2,
              }}
            >

              {vehiculo.marca}{' '}
              {vehiculo.modelo}

            </div>

          </div>

        )}


      {ocupado &&
        !vehiculo && (

          <div
            style={{
              marginTop:
                '0.45rem',

              paddingTop:
                '0.45rem',

              borderTop:
                '1px solid rgba(255,255,255,0.35)',

              fontSize:
                '0.68rem',

              fontWeight:
                600,

              textAlign:
                'left',
            }}
          >

            ⚠ Vehículo sin identificar

          </div>

        )}


      {!ocupado &&
        espacio.ocupacion && (

          <div
            style={{
              marginTop:
                '0.45rem',

              fontSize:
                '0.65rem',

              fontWeight:
                600,
            }}
          >

            Vínculo pendiente de liberar

          </div>

        )}

    </button>

  )
}