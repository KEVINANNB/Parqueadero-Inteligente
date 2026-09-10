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
   PÁGINAS
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


const MonitoreoEntrada =
  lazy(
    () =>
      import(
        './views/parqueadero/MonitoreoEntrada'
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
   LOADER
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


        <div className="mt-3 text-body-secondary">

          Cargando módulo...

        </div>

      </div>

    </div>

  )
}


/* ================================================================
   APLICACIÓN
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

      {!esPaginaAuth && (
        <AppHeader />
      )}


      <main

        className={
          esPaginaAuth
            ? 'app-main-auth'
            : 'app-main'
        }

      >

        {!esPaginaAuth && (
          <AppBreadcrumb />
        )}


        <Suspense
          fallback={
            <CargandoRuta />
          }
        >

          <Routes>

            {/* INICIO */}

            <Route
              path="/"
              element={
                <Inicio />
              }
            />


            {/* PARQUEADERO */}

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


            {/* MAPA */}

            <Route
              path="/parqueadero/mapa"
              element={
                <MapaParqueadero />
              }
            />


            {/* GESTIÓN */}

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


              {/* NUEVO MÓDULO */}

              <Route

                path="monitoreo-entrada"

                element={
                  <MonitoreoEntrada />
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


            {/* CUENTA */}

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


            {/* AUTENTICACIÓN */}

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


            {/* 404 */}

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
   APP PRINCIPAL
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
     RECUPERAR SESIÓN ANTES DE REDIRECCIONAR
     ============================================================== */

  if (
    cargando
  ) {
    return (

      <div
        style={{
          minHeight:
            '100vh',

          display:
            'grid',

          placeItems:
            'center',

          background:
            '#ffffff',
        }}
      >

        <div className="text-center">

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


  /* ==============================================================
     PROTEGER RUTAS
     ============================================================== */

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
     APP AUTENTICADA
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