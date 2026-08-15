import { Routes, Route, Link, NavLink } from 'react-router-dom'
import Inicio from './pages/Inicio'
import Estacionamiento from './pages/Estacionamiento'
import DetalleEspacio from './pages/DetalleEspacio'

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark">U</span>
          <span className="brand-text">
            UTEQ Smart Parking
            <small>Monitoreo telemático del parqueadero</small>
          </span>
        </Link>
        <nav className="app-nav">
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/estacionamiento">Parqueadero</NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/estacionamiento" element={<Estacionamiento />} />
          <Route path="/espacios/:id" element={<DetalleEspacio />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>
          UTEQ · Aplicaciones Telemáticas Basadas en Web · Práctica
          experimental — Estacionamiento inteligente con React y Firebase
          RTDB
        </p>
      </footer>
    </div>
  )
}
