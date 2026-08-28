import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom'
import Inicio from './pages/Inicio'
import Estacionamiento from './pages/Estacionamiento'
import DetalleEspacio from './pages/DetalleEspacio'
import Login from './pages/Login'
import Registro from './pages/Registro'
import ListaVehiculos from './views/parqueadero/ListaVehiculos'
import RutaProtegida from './components/RutaProtegida'
import Logo from './components/Logo'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { usuario, rol, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const manejarCerrarSesion = async () => {
    await cerrarSesion()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          <Logo width={220} height={44} />
        </Link>
        <nav className="app-nav">
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/estacionamiento">Parqueadero</NavLink>
          <NavLink to="/parqueadero/vehiculos">Vehículos</NavLink>

          {usuario ? (
            <div className="app-nav-user">
              <span className="app-nav-email">
                {usuario.email} {rol === 'admin' && <span className="badge-admin">admin</span>}
              </span>
              <button className="btn btn-ghost" onClick={manejarCerrarSesion}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <NavLink to="/login">Iniciar sesión</NavLink>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/estacionamiento" element={<Estacionamiento />} />
          <Route path="/espacios/:id" element={<DetalleEspacio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/parqueadero/vehiculos"
            element={
              <RutaProtegida>
                <ListaVehiculos />
              </RutaProtegida>
            }
          />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>
          UTEQ · Aplicaciones Telemáticas Basadas en Web · Panel de Administración del Smart Parking
          UTEQ (Grupo 5)
        </p>
      </footer>
    </div>
  )
}
