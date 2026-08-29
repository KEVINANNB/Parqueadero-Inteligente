import {
  lazy,
  Suspense,
} from 'react'

import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import {
  CSpinner,
} from '@coreui/react'

import AppHeader
  from './components/AppHeader'

import AppBreadcrumb
  from './components/AppBreadcrumb'

import {
  useAuth,
} from './context/AuthContext'

import {
  ParkingProvider,
} from './context/ParkingContext'


/* ================================================================
   CARGA DIFERIDA DE PÁGINAS

   Cada módulo se descargará cuando realmente sea necesario.
   ================================================================ */

const Inicio =
  lazy(
    () =>
      import(
        './pages/Inicio'
      ),
  )


const Estacionamiento =
  lazy(
    () =>
      import(
        './pages/Estacionamiento'
      ),
  )


const DetalleEspacio =
  lazy(
    () =>
      import(
        './pages/DetalleEspacio'
      ),
  )


const Login =
  lazy(
    () =>
      import(
        './pages/Login'
      ),
  )


const Registro =
  lazy(
    () =>
      import(
        './pages/Registro'
      ),
  )


const ListaVehiculos =
  lazy(
    () =>
      import(
        './views/parqueadero/ListaVehiculos'
      ),
  )


const MapaParqueadero =
  lazy(
    () =>
      import(
        './views/parqueadero/MapaParqueadero'
      ),
  )


const GestionParqueaderoLayout =
  lazy(
    () =>
      import(
        './views/parqueadero/GestionParqueaderoLayout'
      ),
  )


const PuestosGestion =
  lazy(
    () =>
      import(
        './views/parqueadero/PuestosGestion'
      ),
  )


const Propietarios =
  lazy(
    () =>
      import(
        './views/parqueadero/Propietarios'
      ),
  )


const HistorialParqueadero =
  lazy(
    () =>
      import(
        './views/parqueadero/HistorialParqueadero'
      ),
  )


const MiPerfil =
  lazy(
    () =>
      import(
        './views/cuenta/MiPerfil'
      ),
  )


const MisVehiculos =
  lazy(
    () =>
      import(
        './views/cuenta/MisVehiculos'
      ),
  )


/* ================================================================
   LOADER DE RUTA
   ================================================================ */

function CargandoRuta() {
  return (
    <div
      style={{
        minHeight:
          300,

        display:
          'grid',

        placeItems:
          'center',
      }}
    >

      <div className="text-center">

        <CSpinner
          color="success"
        />


        <div
          className="mt-3 text-body-secondary"
        >
          Cargando módulo...
        </div>

      </div>

    </div>
  )
}


/* ================================================================
   CONTENIDO PRINCIPAL
   ================================================================ */

function AplicacionAutenticada({
  esPaginaAuth,
  autenticado,
}) {
  return (
    <div
      className={
        esPaginaAuth
          ? 'app-shell app-shell-auth'
          : 'app-shell'
      }
    >

      {/* =====================================================
          HEADER
          ===================================================== */}

      {!esPaginaAuth && (
        <AppHeader />
      )}


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main
        className={
          esPaginaAuth
            ? 'app-main-auth'
            : 'app-main'
        }
      >

        {/* ===================================================
            BREADCRUMB
            =================================================== */}

        {!esPaginaAuth && (
          <AppBreadcrumb />
        )}


        {/* ===================================================
            RUTAS
            =================================================== */}

        <Suspense
          fallback={
            <CargandoRuta />
          }
        >

          <Routes>

            {/* ===============================================
                INICIO
                =============================================== */}

            <Route
              path="/"
              element={
                <Inicio />
              }
            />


            {/* ===============================================
                PARQUEADERO
                =============================================== */}

            <Route
              path="/estacionamiento"
              element={
                <Estacionamiento />
              }
            />


            <Route
              path="/espacios/:id"
              element={
                <DetalleEspacio />
              }
            />


            {/* ===============================================
                MAPA
                =============================================== */}

            <Route
              path="/parqueadero/mapa"
              element={
                <MapaParqueadero />
              }
            />


            {/* ===============================================
                GESTIÓN
                =============================================== */}

            <Route
              path="/parqueadero"
              element={
                <GestionParqueaderoLayout />
              }
            >

              <Route
                index
                element={
                  <Navigate
                    to="vehiculos"
                    replace
                  />
                }
              />


              <Route
                path="vehiculos"
                element={
                  <ListaVehiculos />
                }
              />


              <Route
                path="puestos"
                element={
                  <PuestosGestion />
                }
              />


              <Route
                path="propietarios"
                element={
                  <Propietarios />
                }
              />


              <Route
                path="historial"
                element={
                  <HistorialParqueadero />
                }
              />

            </Route>


            {/* ===============================================
                CUENTA
                =============================================== */}

            <Route
              path="/cuenta/perfil"
              element={
                <MiPerfil />
              }
            />


            <Route
              path="/cuenta/vehiculos"
              element={
                <MisVehiculos />
              }
            />


            {/* ===============================================
                LOGIN
                =============================================== */}

            <Route
              path="/login"
              element={
                <Login />
              }
            />


            <Route
              path="/registro"
              element={
                <Registro />
              }
            />


            {/* ===============================================
                404
                =============================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to={
                    autenticado
                      ? '/'
                      : '/login'
                  }
                  replace
                />
              }
            />

          </Routes>

        </Suspense>

      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      {!esPaginaAuth && (

        <footer className="app-footer">

          <p>
            UTEQ · Aplicaciones
            Telemáticas Basadas en Web
            · Smart Parking UTEQ
          </p>

        </footer>

      )}

    </div>
  )
}


/* ================================================================
   APP
   ================================================================ */

export default function App() {
  const ubicacion =
    useLocation()


  const {
    autenticado,
    cargando,
  } =
    useAuth()


  const esPaginaAuth =
    ubicacion.pathname ===
    '/login'
    ||
    ubicacion.pathname ===
    '/registro'


  /* ==============================================================
     PROTEGER RUTAS
     ============================================================== */
  if (
    cargando
  ) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#ffffff',
        }}
      >

        <div
          className="text-center"
        >

          <CSpinner
            color="success"
          />


          <h5 className="mt-3 mb-1">

            Smart Parking UTEQ

          </h5>


          <div className="text-body-secondary">

            Recuperando tu sesión...

          </div>

        </div>

      </div>
    )
  }
  if (
    !autenticado &&
    !esPaginaAuth
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }


  /* ==============================================================
     LOGIN / REGISTRO

     No necesitamos ParkingProvider aquí.
     ============================================================== */

  if (
    esPaginaAuth
  ) {
    return (
      <AplicacionAutenticada
        esPaginaAuth
        autenticado={
          autenticado
        }
      />
    )
  }


  /* ==============================================================
     APLICACIÓN AUTENTICADA

     El provider permanece montado al cambiar de página.
     ============================================================== */

  return (
    <ParkingProvider>

      <AplicacionAutenticada
        esPaginaAuth={
          false
        }

        autenticado={
          autenticado
        }
      />

    </ParkingProvider>
  )
}