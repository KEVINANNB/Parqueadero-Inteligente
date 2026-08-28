import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function AppHeader() {
  const { autenticado } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="app-header-sga">
      <div className="header-left">
        <Logo width={180} height={42} />
      </div>

      <nav className="header-nav">
        <Link to="/" className="header-link">Inicio</Link>
        <Link to="/parqueadero/vehiculos" className="header-link">Parqueadero</Link>

        {!autenticado && (
          <button
            className="header-login-btn"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </button>
        )}
      </nav>
    </header>
  )
}