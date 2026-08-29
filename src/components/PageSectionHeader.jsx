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
          margin: 0 0 22px 0;
          padding-top: 4px;
        }

        .page-section-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;

          margin-bottom: 14px;

          font-size: 12px;
          color: #3b82f6;
        }

        .page-section-breadcrumb a,
        .page-section-breadcrumb span {
          text-decoration: none;
          color: inherit;
        }

        .page-section-divider {
          width: 180px;
          max-width: 100%;
          height: 4px;
          border-radius: 999px;
          background: #111827;
          margin-bottom: 14px;
        }

        .page-section-eyebrow {
          margin: 0 0 8px 0;

          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;

          color: #15803d;
        }

        .page-section-title {
          margin: 0 0 8px 0;

          font-size: 30px;
          line-height: 1.12;
          font-weight: 700;

          color: #111827;
        }

        .page-section-subtitle {
          margin: 0;

          max-width: 760px;

          font-size: 14px;
          line-height: 1.6;

          color: #4b5563;
        }

        @media (max-width: 900px) {
          .page-section-title {
            font-size: 26px;
          }
        }

        @media (max-width: 600px) {
          .page-section-header {
            margin-bottom: 18px;
          }

          .page-section-divider {
            width: 120px;
            height: 3px;
          }

          .page-section-eyebrow {
            font-size: 11px;
            letter-spacing: 0.16em;
          }

          .page-section-title {
            font-size: 22px;
          }

          .page-section-subtitle {
            font-size: 13px;
          }
        }
      `}</style>

      <section className="page-section-header">
        {breadcrumb.length > 0 && (
          <div className="page-section-breadcrumb">
            {breadcrumb.map((item, index) => (
              <span key={`${item}-${index}`}>
                {item}
                {index < breadcrumb.length - 1 ? ' / ' : ''}
              </span>
            ))}
          </div>
        )}

        <div className="page-section-divider" />

        <p className="page-section-eyebrow">
          {eyebrow}
        </p>

        <h1 className="page-section-title">
          {title}
        </h1>

        {subtitle ? (
          <p className="page-section-subtitle">
            {subtitle}
          </p>
        ) : null}
      </section>
    </>
  )
}