import {
  NavLink,
  Outlet,
} from 'react-router-dom'

import CIcon from '@coreui/icons-react'

import {
  cilCarAlt,
  cilList,
  cilSpeedometer,
  cilUser,
} from '@coreui/icons'


const opciones = [
  {
    titulo: 'Vehículos',
    ruta: '/parqueadero/vehiculos',
    icono: cilCarAlt,
  },

  {
    titulo: 'Puestos',
    ruta: '/parqueadero/puestos',
    icono: cilSpeedometer,
  },

  {
    titulo: 'Propietarios',
    ruta: '/parqueadero/propietarios',
    icono: cilUser,
  },

  {
    titulo: 'Historial',
    ruta: '/parqueadero/historial',
    icono: cilList,
  },
]


export default function GestionParqueaderoLayout() {
  return (
    <>
      <style>{`
        .gestion-parqueadero {
          width: 100%;
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          align-items: start;
          gap: 24px;
        }

        .gestion-sidebar {
          width: 100%;
          overflow: hidden;

          border: 1px solid #dfe7ed;
          border-radius: 4px;

          background: #ffffff;

          box-shadow:
            0 5px 18px rgba(15, 23, 42, 0.06);

          position: sticky;
          top: 88px;
        }

        .gestion-sidebar-header {
          min-height: 58px;

          display: flex;
          align-items: center;

          gap: 13px;

          padding: 0 17px;

          background: #eef4f8;

          color: #26394a;

          border-bottom: 1px solid #dfe7ed;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: .025em;
        }

        .gestion-sidebar-menu-icon {
          color: #1879ae;
          font-size: 20px;
          line-height: 1;
        }

        .gestion-sidebar-nav {
          display: flex;
          flex-direction: column;
        }

        .gestion-sidebar-link {
          position: relative;

          min-height: 58px;

          display: flex;
          align-items: center;

          gap: 14px;

          padding: 0 17px;

          color: #415363;

          text-decoration: none;

          background: #ffffff;

          border-bottom: 1px solid #e7edf1;

          font-size: 12px;
          font-weight: 500;

          transition:
            background .15s ease,
            color .15s ease;
        }

        .gestion-sidebar-link:last-child {
          border-bottom: 0;
        }

        .gestion-sidebar-link:hover {
          color: #086b9f;
          background: #f4f9fc;
        }

        .gestion-sidebar-link.active {
          color: #076a9d;

          background: #e6f3fb;

          font-weight: 700;
        }

        .gestion-sidebar-link.active::before {
          content: '';

          position: absolute;

          top: 0;
          bottom: 0;
          left: 0;

          width: 4px;

          background: #087db8;
        }

        .gestion-sidebar-link-icon {
          width: 22px;

          display: flex;
          justify-content: center;

          color: #317fa8;
        }

        .gestion-sidebar-link.active
        .gestion-sidebar-link-icon {
          color: #087db8;
        }

        .gestion-contenido {
          min-width: 0;
        }

        @media (max-width: 900px) {
          .gestion-parqueadero {
            grid-template-columns: 1fr;
          }

          .gestion-sidebar {
            position: static;
          }

          .gestion-sidebar-nav {
            display: grid;

            grid-template-columns:
              repeat(4, minmax(0, 1fr));
          }

          .gestion-sidebar-link {
            justify-content: center;

            flex-direction: column;

            gap: 5px;

            padding: 10px 5px;

            text-align: center;

            font-size: 10px;

            border-right: 1px solid #e7edf1;
          }

          .gestion-sidebar-link.active::before {
            top: auto;
            right: 0;
            bottom: 0;

            width: auto;
            height: 4px;
          }
        }

        @media (max-width: 550px) {
          .gestion-sidebar-nav {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>


      <div className="gestion-parqueadero">

        {/* =====================================================
            MENÚ IZQUIERDO
            ===================================================== */}

        <aside className="gestion-sidebar">

          <div className="gestion-sidebar-header">

            <span className="gestion-sidebar-menu-icon">
              ☰
            </span>

            <span>
              MENÚ
            </span>

          </div>


          <nav className="gestion-sidebar-nav">

            {opciones.map(
              (
                opcion,
              ) => (

                <NavLink

                  key={
                    opcion.ruta
                  }

                  to={
                    opcion.ruta
                  }

                  className={({
                    isActive,
                  }) =>
                    `gestion-sidebar-link ${
                      isActive
                        ? 'active'
                        : ''
                    }`
                  }

                >

                  <span className="gestion-sidebar-link-icon">

                    <CIcon
                      icon={
                        opcion.icono
                      }
                    />

                  </span>


                  <span>
                    {
                      opcion.titulo
                    }
                  </span>

                </NavLink>

              ),
            )}

          </nav>

        </aside>


        {/* =====================================================
            CONTENIDO
            ===================================================== */}

        <section className="gestion-contenido">

          <Outlet />

        </section>

      </div>
    </>
  )
}