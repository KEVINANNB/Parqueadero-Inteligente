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

import { useAuth } from '../context/AuthContext'

export default function AppHeader() {
  const { usuario } = useAuth()

  return (
    <CHeader
      position="sticky"
      className="app-header-sga border-bottom shadow-sm"
    >
      <CContainer fluid>
        <Link
          to="/"
          className="d-flex align-items-center text-decoration-none"
        >
          <Logo width={210} height={48} />
        </Link>

        <CHeaderNav className="ms-auto d-flex align-items-center gap-3">
          <CNavItem>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `header-link ${
                  isActive ? 'active' : ''
                }`
              }
            >
              Inicio
            </NavLink>
          </CNavItem>

          <CNavItem>
            <NavLink
              to="/estacionamiento"
              className={({ isActive }) =>
                `header-link ${
                  isActive ? 'active' : ''
                }`
              }
            >
              Parqueadero
            </NavLink>
          </CNavItem>

          {usuario ? (
            <UserMenu />
          ) : (
            <NavLink
              to="/login"
              className="btn btn-light btn-sm"
            >
              Iniciar sesión
            </NavLink>
          )}
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}