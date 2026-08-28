import Logo from './Logo'


export default function PantallaCarga({
  texto = 'Preparando Smart Parking...',
}) {
  return (
    <div className="smart-loading-screen">

      <div className="smart-loading-content">

        {/* ===================================================
            LOGO
            =================================================== */}

        <div className="smart-loading-logo">

          <Logo
            width={300}
            height={72}
          />

        </div>


        {/* ===================================================
            ICONO P
            =================================================== */}

        <div className="smart-loading-parking">

          <div className="smart-loading-p">
            P
          </div>


          <span className="smart-loading-ring smart-loading-ring-1" />

          <span className="smart-loading-ring smart-loading-ring-2" />

        </div>


        {/* ===================================================
            PUNTOS ANIMADOS
            =================================================== */}

        <div className="smart-loading-spinner">

          <span />

          <span />

          <span />

        </div>


        {/* ===================================================
            TEXTO
            =================================================== */}

        <div className="smart-loading-text">

          <h3>
            Smart Parking UTEQ
          </h3>


          <p>
            {texto}
          </p>

        </div>

      </div>

    </div>
  )
}