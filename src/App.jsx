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

import MiPerfil
  from './views/cuenta/MiPerfil'

import MisVehiculos
  from './views/cuenta/MisVehiculos'

import AppHeader
  from './components/AppHeader'

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
     PÁGINAS PÚBLICAS DE AUTENTICACIÓN
     ========================================================= */

  const esPaginaAuth =
    ubicacion.pathname === '/login'
    ||
    ubicacion.pathname === '/registro'


  /* =========================================================
     BLOQUEO GENERAL
     =========================================================

     Esta es la parte fundamental.

     Si NO existe sesión:

     /
     /estacionamiento
     /parqueadero/mapa
     /parqueadero/vehiculos
     /cuenta/perfil
     /cuenta/vehiculos
     /espacios/...

     TODOS son enviados a /login.

     De esta manera el menú principal NUNCA puede aparecer
     sin autenticación.
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

          Login y registro no muestran la barra principal.

          Después de autenticarse vuelve automáticamente.
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


          <Route
            path="/parqueadero/mapa"
            element={
              <MapaParqueadero />
            }
          />


          <Route
            path="/parqueadero/vehiculos"
            element={
              <ListaVehiculos />
            }
          />


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
              RUTA DESCONOCIDA
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

          Tampoco aparece en Login / Registro.
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