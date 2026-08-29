import { Link } from 'react-router-dom'

export default function PageSectionHeader({
  breadcrumb = [],
  eyebrow = 'CAMPUS UTEQ · QUEVEDO',
  title = 'Sección',
  subtitle = '',
}) {
  return (
    <>
      <style>{`
        .page-section-header {
          width: 100%;
          margin: 0 0 24px 0;
          padding-top: 2px;
        }

        .page-section-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;

          gap: 7px;

          min-height: 26px;

          margin-bottom: 13px;

          font-size: 11px;
          font-weight: 500;

          color: #1779b5;
        }

        .page-section-breadcrumb a {
          color: #1779b5;
          text-decoration: none;

          transition: color .15s ease;
        }

        .page-section-breadcrumb a:hover {
          color: #075985;
          text-decoration: underline;
        }

        .page-section-breadcrumb-current {
          color: #64748b;
        }

        .page-section-breadcrumb-separator {
          color: #94a3b8;
        }

        .page-section-divider {
          width: 185px;
          height: 3px;

          margin-bottom: 14px;

          border-radius: 999px;

          background: #111827;
        }

        .page-section-eyebrow {
          margin: 0 0 8px 0;

          color: #15803d;

          font-size: 11px;
          font-weight: 600;

          letter-spacing: .22em;

          text-transform: uppercase;
        }

        .page-section-title {
          margin: 0 0 9px 0;

          color: #111827;

          font-size: clamp(29px, 3vw, 38px);
          font-weight: 600;

          line-height: 1.08;

          letter-spacing: -0.025em;
        }

        .page-section-subtitle {
          max-width: 760px;

          margin: 0;

          color: #5b6472;

          font-size: 13px;
          line-height: 1.65;
        }

        @media (max-width: 768px) {
          .page-section-divider {
            width: 135px;
          }

          .page-section-title {
            font-size: 27px;
          }

          .page-section-subtitle {
            font-size: 12px;
          }
        }
      `}</style>

      <section className="page-section-header">

        {/* BREADCRUMB */}

        {breadcrumb.length > 0 && (
          <nav
            className="page-section-breadcrumb"
            aria-label="Navegación"
          >
            {breadcrumb.map((item, index) => {
              const esUltimo =
                index === breadcrumb.length - 1

              const label =
                typeof item === 'string'
                  ? item
                  : item.label

              const to =
                typeof item === 'string'
                  ? null
                  : item.to

              return (
                <span
                  key={`${label}-${index}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  {!esUltimo && to ? (
                    <Link to={to}>
                      {label}
                    </Link>
                  ) : (
                    <span
                      className={
                        esUltimo
                          ? 'page-section-breadcrumb-current'
                          : ''
                      }
                    >
                      {label}
                    </span>
                  )}

                  {!esUltimo && (
                    <span className="page-section-breadcrumb-separator">
                      /
                    </span>
                  )}
                </span>
              )
            })}
          </nav>
        )}

        {/* LÍNEA NEGRA */}

        <div className="page-section-divider" />

        {/* UBICACIÓN */}

        <p className="page-section-eyebrow">
          {eyebrow}
        </p>

        {/* TÍTULO */}

        <h1 className="page-section-title">
          {title}
        </h1>

        {/* DESCRIPCIÓN */}

        {subtitle && (
          <p className="page-section-subtitle">
            {subtitle}
          </p>
        )}

      </section>
    </>
  )
}