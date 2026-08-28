import Logo from './Logo'

export default function PantallaCarga({
  texto = 'Preparando Smart Parking...',
}) {
  return (
    <div className="smart-loading-screen">
      <div className="smart-loading-content">

        <div className="smart-loading-logo">
          <Logo
            width={310}
            height={75}
          />
        </div>

        <div className="smart-loading-parking">
          <div className="smart-loading-p">
            P
          </div>

          <span className="smart-loading-ring smart-loading-ring-1" />
          <span className="smart-loading-ring smart-loading-ring-2" />
        </div>

        <div className="smart-loading-spinner">
          <span />
          <span />
          <span />
        </div>

        <h3>
          Smart Parking UTEQ
        </h3>

        <p>
          {texto}
        </p>

      </div>
    </div>
  )
}