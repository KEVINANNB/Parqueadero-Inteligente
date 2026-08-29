import {
  Link,
  useLocation,
} from 'react-router-dom'


/* ================================================================
   OBTENER LA RUTA DE NAVEGACIÓN
   ================================================================ */

function obtenerBreadcrumb(
  pathname,
) {
  /* ==============================================================
     PARQUEADERO
     ============================================================== */

  if (
    pathname ===
    '/estacionamiento'
  ) {
    return [
      {
        label:
          'Inicio',

        to:
          '/',
      },

      {
        label:
          'Parqueadero',
      },
    ]
  }


  /* ==============================================================
     DETALLE DE UN ESPACIO
     ============================================================== */

  if (
    pathname.startsWith(
      '/espacios/',
    )
  ) {
    return [
      {
        label:
          'Inicio',

        to:
          '/',
      },

      {
        label:
          'Parqueadero',

        to:
          '/estacionamiento',
      },

      {
        label:
          'Detalle del espacio',
      },
    ]
  }


  /* ==============================================================
     MAPA
     ============================================================== */

  if (
    pathname ===
    '/parqueadero/mapa'
  ) {
    return [
      {
        label:
          'Inicio',

        to:
          '/',
      },

      {
        label:
          'Mapa del parqueadero',
      },
    ]
  }


  /* ==============================================================
     VEHÍCULOS
     ============================================================== */

  if (
    pathname ===
    '/parqueadero/vehiculos'
  ) {
    return [
      {
        label:
          'Inicio',

        to:
          '/',
      },

      {
        label:
          'Vehículos y propietarios',
      },
    ]
  }


  /* ==============================================================
     PUESTOS
     ============================================================== */

  if (
    pathname ===
    '/parqueadero/puestos'
  ) {
    return [
      {
        label:
          'Inicio',

        to:
          '/',
      },

      {
        label:
          'Vehículos y propietarios',

        to:
          '/parqueadero/vehiculos',
      },

      {
        label:
          'Puestos',
      },
    ]
  }


  /* ==============================================================
     PROPIETARIOS
     ============================================================== */

  if (
    pathname ===
    '/parqueadero/propietarios'
  ) {
    return [
      {
        label:
          'Inicio',

        to:
          '/',
      },

      {
        label:
          'Vehículos y propietarios',

        to:
          '/parqueadero/vehiculos',
      },

      {
        label:
          'Propietarios',
      },
    ]
  }


  /* ==============================================================
     HISTORIAL
     ============================================================== */

  if (
    pathname ===
    '/parqueadero/historial'
  ) {
    return [
      {
        label:
          'Inicio',

        to:
          '/',
      },

      {
        label:
          'Vehículos y propietarios',

        to:
          '/parqueadero/vehiculos',
      },

      {
        label:
          'Historial',
      },
    ]
  }


  /* ==============================================================
     MIS VEHÍCULOS
     ============================================================== */

  if (
    pathname ===
    '/cuenta/vehiculos'
  ) {
    return [
      {
        label:
          'Inicio',

        to:
          '/',
      },

      {
        label:
          'Mis vehículos',
      },
    ]
  }


  /* ==============================================================
     MI PERFIL
     ============================================================== */

  if (
    pathname ===
    '/cuenta/perfil'
  ) {
    return [
      {
        label:
          'Inicio',

        to:
          '/',
      },

      {
        label:
          'Mi perfil',
      },
    ]
  }


  /*
   * No mostramos breadcrumb:
   *
   * /
   * /login
   * /registro
   */

  return null
}


/* ================================================================
   COMPONENTE
   ================================================================ */

export default function AppBreadcrumb() {
  const ubicacion =
    useLocation()


  const elementos =
    obtenerBreadcrumb(
      ubicacion.pathname,
    )


  if (
    !elementos
  ) {
    return null
  }


  /*
   * El módulo administrativo ocupa
   * prácticamente todo el ancho del monitor.
   *
   * Hacemos que el breadcrumb respete
   * ese mismo ancho.
   */

  const esGestion =
    ubicacion.pathname ===
      '/parqueadero/vehiculos'
    ||
    ubicacion.pathname ===
      '/parqueadero/puestos'
    ||
    ubicacion.pathname ===
      '/parqueadero/propietarios'
    ||
    ubicacion.pathname ===
      '/parqueadero/historial'


  return (
    <>
      <style>{`

        /* =====================================================
           BREADCRUMB GENERAL
           ===================================================== */

        .smart-breadcrumb {
          width: 100%;

          min-height: 42px;

          display: flex;

          align-items: center;

          margin-bottom: 14px;

          padding-top: 7px;
          padding-bottom: 7px;

          border-bottom:
            1px solid #e5e7eb;

          font-size: 11px;

          line-height: 1.2;

          color: #6b7280;
        }


        /* =====================================================
           MÓDULO DE VEHÍCULOS

           Coincide con el ancho del menú lateral.
           ===================================================== */

        .smart-breadcrumb-wide {
          width:
            calc(100vw - 36px);

          max-width:
            1500px;

          position:
            relative;

          left:
            50%;

          transform:
            translateX(-50%);
        }


        /* =====================================================
           CONTENIDO
           ===================================================== */

        .smart-breadcrumb-inner {
          display:
            flex;

          flex-wrap:
            wrap;

          align-items:
            center;

          gap:
            7px;

          width:
            100%;
        }


        /* =====================================================
           ENLACE
           ===================================================== */

        .smart-breadcrumb-link {
          color:
            #0b78b5 !important;

          text-decoration:
            none !important;

          cursor:
            pointer;

          transition:
            color .15s ease;
        }


        .smart-breadcrumb-link:hover {
          color:
            #075985 !important;

          text-decoration:
            underline !important;
        }


        /* =====================================================
           SEPARADOR
           ===================================================== */

        .smart-breadcrumb-separator {
          color:
            #94a3b8;

          user-select:
            none;
        }


        /* =====================================================
           POSICIÓN ACTUAL
           ===================================================== */

        .smart-breadcrumb-current {
          color:
            #64748b;
        }


        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (
          max-width: 1200px
        ) {

          .smart-breadcrumb-wide {
            width:
              calc(100vw - 24px);
          }

        }


        @media (
          max-width: 900px
        ) {

          .smart-breadcrumb {
            min-height:
              38px;

            margin-bottom:
              12px;

            font-size:
              10.5px;
          }


          .smart-breadcrumb-wide {
            width:
              100%;

            left:
              auto;

            transform:
              none;
          }

        }

      `}</style>


      <nav
        className={
          esGestion
            ? 'smart-breadcrumb smart-breadcrumb-wide'
            : 'smart-breadcrumb'
        }

        aria-label="Miga de pan"
      >

        <div className="smart-breadcrumb-inner">

          {elementos.map(
            (
              elemento,
              indice,
            ) => {

              const ultimo =
                indice ===
                elementos.length - 1


              return (
                <span
                  key={
                    `${elemento.label}-${indice}`
                  }

                  style={{
                    display:
                      'inline-flex',

                    alignItems:
                      'center',

                    gap:
                      7,
                  }}
                >

                  {/* ===========================================
                      ENLACE
                      =========================================== */}

                  {!ultimo &&
                  elemento.to ? (

                    <Link
                      to={
                        elemento.to
                      }

                      className="smart-breadcrumb-link"
                    >
                      {
                        elemento.label
                      }
                    </Link>

                  ) : (

                    <span className="smart-breadcrumb-current">

                      {
                        elemento.label
                      }

                    </span>

                  )}


                  {/* ===========================================
                      /
                      =========================================== */}

                  {!ultimo && (

                    <span className="smart-breadcrumb-separator">

                      /

                    </span>

                  )}

                </span>
              )
            },
          )}

        </div>

      </nav>
    </>
  )
}