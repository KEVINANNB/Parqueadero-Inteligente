import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'

import {
  cilAccountLogout,
  cilCarAlt,
  cilSpeedometer,
  cilUser,
} from '@coreui/icons'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import useMiCuenta from '../hooks/useMiCuenta'

export default function UserMenu() {
  const { usuario, rol, cerrarSesion } = useAuth()
  const { perfil } = useMiCuenta()

  const navigate = useNavigate()

  if (!usuario) return null

  const iniciales = perfil.nombre
    ?.split(' ')
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase()

  const salir = async () => {
    await cerrarSesion()
    navigate('/')
  }

  return (
    <CDropdown alignment="end">
      <CDropdownToggle
        color="transparent"
        caret={false}
        className="d-flex align-items-center gap-2 border-0 text-white"
      >
        {perfil.foto ? (
          <CAvatar
            src={perfil.foto}
            size="md"
            status="success"
          />
        ) : (
          <CAvatar
            color="light"
            textColor="success"
            size="md"
          >
            {iniciales || 'U'}
          </CAvatar>
        )}

        <div className="d-none d-lg-block text-start">
          <div className="fw-semibold">
            {perfil.nombre}
          </div>

          <small className="text-white-50">
            {perfil.correo}
          </small>
        </div>
      </CDropdownToggle>

      <CDropdownMenu
        className="pt-0"
        style={{ minWidth: 300 }}
      >
        <CDropdownHeader className="bg-body-secondary py-3">
          <div className="d-flex align-items-center gap-3">
            {perfil.foto ? (
              <CAvatar
                src={perfil.foto}
                size="xl"
              />
            ) : (
              <CAvatar
                color="success"
                textColor="white"
                size="xl"
              >
                {iniciales || 'U'}
              </CAvatar>
            )}

            <div>
              <div className="fw-semibold">
                {perfil.nombre}
              </div>

              <div className="small text-body-secondary">
                {perfil.correo}
              </div>

              <CBadge
                color={rol === 'admin' ? 'danger' : 'success'}
                className="mt-1"
              >
                {rol === 'admin'
                  ? 'Administrador'
                  : 'Usuario'}
              </CBadge>
            </div>
          </div>
        </CDropdownHeader>

        <CDropdownItem
          role="button"
          onClick={() => navigate('/cuenta/perfil')}
        >
          <CIcon icon={cilUser} className="me-2" />
          Mi perfil
        </CDropdownItem>

        <CDropdownItem
          role="button"
          onClick={() => navigate('/cuenta/vehiculos')}
        >
          <CIcon icon={cilCarAlt} className="me-2" />
          Mis vehículos
        </CDropdownItem>

        <CDropdownItem
          role="button"
          onClick={() => navigate('/estacionamiento')}
        >
          <CIcon icon={cilSpeedometer} className="me-2" />
          Ver parqueadero
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem
          role="button"
          className="text-danger"
          onClick={salir}
        >
          <CIcon
            icon={cilAccountLogout}
            className="me-2"
          />
          Cerrar sesión
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}