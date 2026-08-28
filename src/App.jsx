import {
  Routes,
  Route,
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

import RutaProtegida
  from './components/RutaProtegida'

import AppHeader
  from './components/AppHeader'


export default function App() {
  return (
    <div className="app-shell">

      <AppHeader />


      <main className="app-main">

        <Routes>

          {/* ====================================================
              INICIO
              ==================================================== */}

          <Route
            path="/"
            element={
              <Inicio />
            }
          />


          {/* ====================================================
              PARQUEADERO
              ==================================================== */}

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


          {/* ====================================================
              MAPA GRANDE
              ==================================================== */}

          <Route
            path="/parqueadero/mapa"
            element={
              <RutaProtegida>

                <MapaParqueadero />

              </RutaProtegida>
            }
          />


          {/* ====================================================
              AUTENTICACIÓN
              ==================================================== */}

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


          {/* ====================================================
              VEHÍCULOS
              ==================================================== */}

          <Route
            path="/parqueadero/vehiculos"
            element={
              <RutaProtegida>

                <ListaVehiculos />

              </RutaProtegida>
            }
          />


          {/* ====================================================
              CUENTA
              ==================================================== */}

          <Route
            path="/cuenta/perfil"
            element={
              <RutaProtegida>

                <MiPerfil />

              </RutaProtegida>
            }
          />


          <Route
            path="/cuenta/vehiculos"
            element={
              <RutaProtegida>

                <MisVehiculos />

              </RutaProtegida>
            }
          />

        </Routes>

      </main>


      <footer className="app-footer">

        <p>
          UTEQ · Aplicaciones
          Telemáticas Basadas en Web
          · Smart Parking UTEQ
        </p>

      </footer>

    </div>
  )
}