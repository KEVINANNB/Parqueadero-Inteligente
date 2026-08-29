import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import Inicio
  from './pages/Inicio'

import Estacionamiento
  from './pages/Estacionamiento'

import DetalleEspacio
  from './pages/DetalleEspacio'

import Login
  from './pages/Login'

import Registro
  from './pages/Registro'

import ListaVehiculos
  from './views/parqueadero/ListaVehiculos'

import MapaParqueadero
  from './views/parqueadero/MapaParqueadero'

import GestionParqueaderoLayout
  from './views/parqueadero/GestionParqueaderoLayout'

import PuestosGestion
  from './views/parqueadero/PuestosGestion'

import Propietarios
  from './views/parqueadero/Propietarios'

import HistorialParqueadero
  from './views/parqueadero/HistorialParqueadero'

import MiPerfil
  from './views/cuenta/MiPerfil'

import MisVehiculos
  from './views/cuenta/MisVehiculos'

import AppHeader
  from './components/AppHeader'

import AppBreadcrumb
  from './components/AppBreadcrumb'

import {
  useAuth,
} from './context/AuthContext'


export default function App() {
  const ubicacion =
    useLocation()


  const {
    autenticado,
  } =
    useAuth()


  /* =========================================================
     LOGIN / REGISTRO
     ========================================================= */

  const esPaginaAuth =
    ubicacion.pathname ===
      '/login'
    ||
    ubicacion.pathname ===
      '/registro'


  /* =========================================================
     LOGIN OBLIGATORIO
     ========================================================= */

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


      <main
        className={
          esPaginaAuth
            ? 'app-main-auth'
            : 'app-main'
        }
      >

        {/* =====================================================
            MIGA DE PAN GLOBAL

            Se muestra automáticamente
            según la ruta actual.
            ===================================================== */}

        {!esPaginaAuth && (
          <AppBreadcrumb />
        )}


        <Routes>

          {/* =================================================
              MENÚ PRINCIPAL
              ================================================= */}

          <Route
            path="/"
            element={
              <Inicio />
            }
          />


          {/* =================================================
              PARQUEADERO
              ================================================= */}

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


          {/* =================================================
              MAPA
              ================================================= */}

          <Route
            path="/parqueadero/mapa"
            element={
              <MapaParqueadero />
            }
          />


          {/* =================================================
              MÓDULO VEHÍCULOS / PUESTOS /
              PROPIETARIOS / HISTORIAL
              ================================================= */}

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


          {/* =================================================
              CUENTA
              ================================================= */}

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


          {/* =================================================
              AUTENTICACIÓN
              ================================================= */}

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


          {/* =================================================
              404
              ================================================= */}

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