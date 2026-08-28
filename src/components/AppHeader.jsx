import {
  CContainer,
  CHeader,
  CHeaderNav,
  CNavItem,
} from '@coreui/react'

import {
  Link,
  NavLink,
} from 'react-router-dom'

import Logo from './Logo'
import UserMenu from './UserMenu'

import {
  useAuth,
} from '../context/AuthContext'


export default function AppHeader() {
  const {
    usuario,
  } = useAuth()


  return (
    <CHeader
      position="sticky"
      className="app-header-sga border-bottom shadow-sm"
    >
      <CContainer fluid>

        {/* =====================================================
            LOGO
            ===================================================== */}

        <Link
          to="/"
          className="d-flex align-items-center text-decoration-none"
        >
          <Logo
            width={210}
            height={48}
          />
        </Link>


        {/* =====================================================
            NAVEGACIÓN DERECHA
            ===================================================== */}

        <CHeaderNav className="ms-auto d-flex align-items-center gap-3">

          {/* INICIO */}

          <CNavItem>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `header-link ${
                  isActive
                    ? 'active'
                    : ''
                }`
              }
            >
              Inicio
            </NavLink>
          </CNavItem>


          {/* PARQUEADERO */}

          <CNavItem>
            <NavLink
              to="/estacionamiento"
              className={({ isActive }) =>
                `header-link ${
                  isActive
                    ? 'active'
                    : ''
                }`
              }
            >
              Parqueadero
            </NavLink>
          </CNavItem>


          {/* =================================================
              USUARIO
              ================================================= */}

          {usuario ? (

            /*
             * Si ya inició sesión:
             *
             * foto
             * nombre
             * correo
             * menú desplegable
             */

            <UserMenu />

          ) : (

            /*
             * Si NO inició sesión:
             *
             * botón Iniciar sesión.
             */

            <NavLink
              to="/login"
              className="btn btn-light btn-sm px-3"
            >
              Iniciar sesión
            </NavLink>

          )}

        </CHeaderNav>

      </CContainer>
    </CHeader>
  )
}