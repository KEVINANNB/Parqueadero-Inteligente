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
    ubicacion.pathname === '/login'
    ||
    ubicacion.pathname === '/registro'


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
              PARQUEADERO GENERAL
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
              MAPA DEL PARQUEADERO
              ================================================= */}

          <Route
            path="/parqueadero/mapa"
            element={
              <MapaParqueadero />
            }
          />


          {/* =================================================
              MÓDULO DE GESTIÓN
              
              AQUÍ ESTÁ LA CORRECCIÓN IMPORTANTE.
              GestionParqueaderoLayout contiene el menú lateral.
              Outlet muestra cada sección a la derecha.
              ================================================= */}

          <Route
            path="/parqueadero"
            element={
              <GestionParqueaderoLayout />
            }
          >

            {/* Si entran solamente a /parqueadero */}

            <Route
              index
              element={
                <Navigate
                  to="vehiculos"
                  replace
                />
              }
            />


            {/* VEHÍCULOS */}

            <Route
              path="vehiculos"
              element={
                <ListaVehiculos />
              }
            />


            {/* PUESTOS */}

            <Route
              path="puestos"
              element={
                <PuestosGestion />
              }
            />


            {/* PROPIETARIOS */}

            <Route
              path="propietarios"
              element={
                <Propietarios />
              }
            />


            {/* HISTORIAL */}

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
              CUALQUIER RUTA DESCONOCIDA
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