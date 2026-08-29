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

        /* =====================================================
           CONTENEDOR GENERAL

           Sacamos este módulo del límite de 1200px de app-main.
           Así aprovechamos casi todo el ancho real del monitor.
           ===================================================== */

        .gestion-parqueadero {
          width: calc(100vw - 36px);
          max-width: 1500px;

          position: relative;

          left: 50%;
          transform: translateX(-50%);

          display: grid;

          grid-template-columns:
            195px minmax(0, 1fr);

          align-items: start;

          gap: 16px;

          margin-top: 4px;
          margin-bottom: 28px;
        }


        /* =====================================================
           MENÚ LATERAL
           ===================================================== */

        .gestion-sidebar {
          width: 100%;

          overflow: hidden;

          border:
            1px solid #dfe7ed;

          border-radius:
            4px;

          background:
            #ffffff;

          box-shadow:
            0 5px 18px
            rgba(15, 23, 42, 0.06);

          position: sticky;

          top: 88px;
        }


        .gestion-sidebar-header {
          min-height: 54px;

          display: flex;

          align-items: center;

          gap: 11px;

          padding:
            0 14px;

          background:
            #eef4f8;

          color:
            #26394a;

          border-bottom:
            1px solid #dfe7ed;

          font-size:
            11px;

          font-weight:
            800;

          letter-spacing:
            .025em;
        }


        .gestion-sidebar-menu-icon {
          color:
            #1879ae;

          font-size:
            19px;

          line-height:
            1;
        }


        .gestion-sidebar-nav {
          display:
            flex;

          flex-direction:
            column;
        }


        .gestion-sidebar-link {
          position:
            relative;

          min-height:
            55px;

          display:
            flex;

          align-items:
            center;

          gap:
            11px;

          padding:
            0 14px;

          color:
            #415363;

          text-decoration:
            none;

          background:
            #ffffff;

          border-bottom:
            1px solid #e7edf1;

          font-size:
            11px;

          font-weight:
            500;

          transition:
            background .15s ease,
            color .15s ease;
        }


        .gestion-sidebar-link:last-child {
          border-bottom:
            0;
        }


        .gestion-sidebar-link:hover {
          color:
            #086b9f;

          background:
            #f4f9fc;
        }


        .gestion-sidebar-link.active {
          color:
            #076a9d;

          background:
            #e6f3fb;

          font-weight:
            700;
        }


        .gestion-sidebar-link.active::before {
          content:
            '';

          position:
            absolute;

          top:
            0;

          bottom:
            0;

          left:
            0;

          width:
            4px;

          background:
            #087db8;
        }


        .gestion-sidebar-link-icon {
          width:
            20px;

          display:
            flex;

          justify-content:
            center;

          color:
            #317fa8;
        }


        .gestion-sidebar-link.active
        .gestion-sidebar-link-icon {
          color:
            #087db8;
        }


        /* =====================================================
           CONTENIDO DERECHO
           ===================================================== */

        .gestion-contenido {
          min-width:
            0;

          width:
            100%;
        }


        /*
         * Hacemos que las tarjetas aprovechen
         * absolutamente todo el espacio disponible.
         */

        .gestion-contenido > * {
          width:
            100%;
        }


        .gestion-contenido .card {
          width:
            100%;

          margin-left:
            0 !important;

          margin-right:
            0 !important;
        }


        /* =====================================================
           CABECERA DE LAS TARJETAS
           ===================================================== */

        .gestion-contenido .card-header {
          padding:
            10px 14px;
        }


        .gestion-contenido .card-body {
          padding:
            12px 14px;
        }


        /* =====================================================
           TABLAS MÁS COMPACTAS

           Aquí está la parte que hará que aparezcan
           Estado + Acciones sin tener que bajar el zoom.
           ===================================================== */

        .gestion-contenido .table {
          width:
            100%;

          margin-bottom:
            0;

          font-size:
            12px;
        }


        .gestion-contenido .table th,
        .gestion-contenido .table td {
          padding:
            7px 7px;

          vertical-align:
            middle;

          line-height:
            1.25;
        }


        .gestion-contenido .table th {
          font-size:
            11.5px;

          font-weight:
            700;
        }


        /* =====================================================
           1 - FOTO VEHÍCULO
           ===================================================== */

        .gestion-contenido
        .table th:nth-child(1) {
          width:
            75px;
        }


        .gestion-contenido
        .table td:nth-child(1) {
          width:
            75px;

          min-width:
            75px;
        }


        /*
         * La imagen original mide 90 x 60.
         * Visualmente sigue viéndose bien en 68 x 46.
         */

        .gestion-contenido
        .table td:nth-child(1) img {
          width:
            68px !important;

          min-width:
            68px !important;

          height:
            46px !important;

          object-fit:
            cover;

          border-radius:
            6px !important;
        }


        /*
         * También reduce el cuadro "Sin foto".
         */

        .gestion-contenido
        .table td:nth-child(1) > div {
          width:
            68px !important;

          height:
            46px !important;

          font-size:
            10px !important;
        }


        /* =====================================================
           2 - PLACA
           ===================================================== */

        .gestion-contenido
        .table th:nth-child(2),
        .gestion-contenido
        .table td:nth-child(2) {
          width:
            92px;

          white-space:
            nowrap;
        }


        .gestion-contenido
        .table td:nth-child(2) .badge {
          font-size:
            11px;

          padding:
            6px 8px;
        }


        /* =====================================================
           3 - VEHÍCULO
           ===================================================== */

        .gestion-contenido
        .table th:nth-child(3),
        .gestion-contenido
        .table td:nth-child(3) {
          width:
            105px;
        }


        /* =====================================================
           4 - AÑO / COLOR
           ===================================================== */

        .gestion-contenido
        .table th:nth-child(4),
        .gestion-contenido
        .table td:nth-child(4) {
          width:
            78px;
        }


        /* =====================================================
           5 - PROPIETARIO

           En ListaVehiculos actualmente existe minWidth: 260.
           Aquí lo sobrescribimos.
           ===================================================== */

        .gestion-contenido
        .table th:nth-child(5) {
          min-width:
            185px !important;

          width:
            185px !important;
        }


        .gestion-contenido
        .table td:nth-child(5) {
          min-width:
            185px !important;

          width:
            185px !important;
        }


        /*
         * Foto circular del propietario:
         * 52px -> 40px.
         */

        .gestion-contenido
        .table td:nth-child(5) img {
          width:
            40px !important;

          min-width:
            40px !important;

          height:
            40px !important;
        }


        /*
         * Reduce el espacio entre foto y nombre.
         */

        .gestion-contenido
        .table td:nth-child(5)
        .d-flex {
          gap:
            8px !important;
        }


        .gestion-contenido
        .table td:nth-child(5)
        strong {
          font-size:
            11.5px;

          line-height:
            1.2;
        }


        .gestion-contenido
        .table td:nth-child(5)
        .small {
          font-size:
            10px;
        }


        /* =====================================================
           6 - CÉDULA
           ===================================================== */

        .gestion-contenido
        .table th:nth-child(6),
        .gestion-contenido
        .table td:nth-child(6) {
          width:
            92px;

          white-space:
            nowrap;

          font-size:
            11px;
        }


        /* =====================================================
           7 - CORREO
           ===================================================== */

        .gestion-contenido
        .table th:nth-child(7) {
          width:
            155px;
        }


        .gestion-contenido
        .table td:nth-child(7) {
          width:
            155px;

          max-width:
            155px;

          font-size:
            10.5px;

          overflow-wrap:
            anywhere;

          word-break:
            break-word;
        }


        /* =====================================================
           8 - ESTADO
           ===================================================== */

        .gestion-contenido
        .table th:nth-child(8),
        .gestion-contenido
        .table td:nth-child(8) {
          width:
            85px;

          text-align:
            center;

          white-space:
            nowrap;
        }


        .gestion-contenido
        .table td:nth-child(8)
        .badge {
          font-size:
            10px;

          padding:
            5px 7px;
        }


        /* =====================================================
           9 - ACCIONES
           ===================================================== */

        .gestion-contenido
        .table th:nth-child(9),
        .gestion-contenido
        .table td:nth-child(9) {
          width:
            100px;

          min-width:
            100px;

          text-align:
            center;
        }


        /*
         * Si Editar y Eliminar están dentro de un flex,
         * los colocamos uno debajo del otro.
         *
         * Esto ahorra bastante espacio horizontal.
         */

        .gestion-contenido
        .table td:nth-child(9)
        .d-flex {
          flex-direction:
            column !important;

          gap:
            4px !important;

          align-items:
            stretch !important;
        }


        .gestion-contenido
        .table td:nth-child(9)
        .btn {
          width:
            100%;

          min-width:
            0;

          padding:
            4px 7px !important;

          font-size:
            10.5px !important;

          line-height:
            1.2;
        }


        /* =====================================================
           TABLE RESPONSIVE

           Solo aparecerá scrollbar en pantallas realmente
           pequeñas, no debería necesitarse a 1366px / 100%.
           ===================================================== */

        .gestion-contenido
        .table-responsive {
          width:
            100%;

          overflow-x:
            auto;

          scrollbar-width:
            thin;
        }


        /* =====================================================
           BOTONES SUPERIORES
           ===================================================== */

        .gestion-contenido
        .card-header .btn {
          padding:
            8px 13px;

          font-size:
            12px;
        }


        /* =====================================================
           BUSCADOR
           ===================================================== */

        .gestion-contenido
        input[type="search"] {
          min-height:
            38px;

          font-size:
            12px;
        }


        /* =====================================================
           LAPTOPS / PANTALLAS MEDIANAS
           ===================================================== */

        @media (
          max-width: 1200px
        ) {

          .gestion-parqueadero {
            width:
              calc(100vw - 24px);

            grid-template-columns:
              175px minmax(0, 1fr);

            gap:
              12px;
          }


          .gestion-sidebar-link {
            padding:
              0 11px;

            font-size:
              10.5px;
          }


          .gestion-contenido
          .table {
            font-size:
              11px;
          }


          .gestion-contenido
          .table th,
          .gestion-contenido
          .table td {
            padding:
              6px 5px;
          }

        }


        /* =====================================================
           TABLET

           Aquí sí convertimos el menú lateral en menú horizontal.
           ===================================================== */

        @media (
          max-width: 900px
        ) {

          .gestion-parqueadero {
            width:
              100%;

            left:
              auto;

            transform:
              none;

            grid-template-columns:
              1fr;

            gap:
              14px;
          }


          .gestion-sidebar {
            position:
              static;
          }


          .gestion-sidebar-nav {
            display:
              grid;

            grid-template-columns:
              repeat(
                4,
                minmax(0, 1fr)
              );
          }


          .gestion-sidebar-link {
            justify-content:
              center;

            flex-direction:
              column;

            gap:
              5px;

            padding:
              10px 5px;

            text-align:
              center;

            font-size:
              10px;

            border-right:
              1px solid #e7edf1;
          }


          .gestion-sidebar-link.active::before {
            top:
              auto;

            right:
              0;

            bottom:
              0;

            width:
              auto;

            height:
              4px;
          }

        }


        /* =====================================================
           MÓVIL
           ===================================================== */

        @media (
          max-width: 550px
        ) {

          .gestion-sidebar-nav {
            grid-template-columns:
              1fr 1fr;
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