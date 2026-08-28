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
  cilSettings,
  cilSpeedometer,
  cilUser,
} from '@coreui/icons'

import { useNavigate } from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

import useMiCuenta from '../hooks/useMiCuenta'

export default function UserMenu() {
  const {
    usuario,
    rol,
    esAdmin,
    vistaActiva,
    cambiarModoVista,
    cerrarSesion,
  } = useAuth()

  const {
    perfil,
  } = useMiCuenta()

  const navigate = useNavigate()

  if (!usuario) {
    return null
  }

  const iniciales =
    perfil.nombre
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((palabra) => palabra[0])
      .join('')
      .toUpperCase() || 'U'

  const salir = async () => {
    await cerrarSesion()

    navigate('/', {
      replace: true,
    })
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
            {iniciales}
          </CAvatar>
        )}

        <div className="d-none d-lg-block text-start">
          <div className="fw-semibold text-white">
            {perfil.nombre}
          </div>

          <small
            style={{
              color:
                'rgba(255,255,255,0.72)',
            }}
          >
            {perfil.correo}
          </small>
        </div>
      </CDropdownToggle>

      <CDropdownMenu
        className="pt-0"
        style={{
          minWidth: 320,
        }}
      >
        <CDropdownHeader className="py-3">
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
                {iniciales}
              </CAvatar>
            )}

            <div className="overflow-hidden">
              <div className="fw-semibold">
                {perfil.nombre}
              </div>

              <div className="small text-body-secondary text-truncate">
                {perfil.correo}
              </div>

              <div className="d-flex gap-1 flex-wrap mt-1">
                <CBadge
                  color={
                    rol === 'admin'
                      ? 'danger'
                      : 'success'
                  }
                >
                  {rol === 'admin'
                    ? 'Administrador'
                    : 'Usuario'}
                </CBadge>

                {esAdmin && (
                  <CBadge
                    color={
                      vistaActiva === 'admin'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {vistaActiva === 'admin'
                      ? 'Vista admin'
                      : 'Vista usuario'}
                  </CBadge>
                )}
              </div>
            </div>
          </div>
        </CDropdownHeader>

        <CDropdownItem
          role="button"
          onClick={() =>
            navigate('/cuenta/perfil')
          }
        >
          <CIcon
            icon={cilUser}
            className="me-2"
          />

          Mi perfil
        </CDropdownItem>

        <CDropdownItem
          role="button"
          onClick={() =>
            navigate('/cuenta/vehiculos')
          }
        >
          <CIcon
            icon={cilCarAlt}
            className="me-2"
          />

          Mis vehículos
        </CDropdownItem>

        <CDropdownItem
          role="button"
          onClick={() =>
            navigate('/estacionamiento')
          }
        >
          <CIcon
            icon={cilSpeedometer}
            className="me-2"
          />

          Ver parqueadero
        </CDropdownItem>

        {esAdmin && (
          <>
            <CDropdownDivider />

            <CDropdownHeader>
              Cambiar modo
            </CDropdownHeader>

            <CDropdownItem
              role="button"
              className={
                vistaActiva === 'normal'
                  ? 'fw-semibold'
                  : ''
              }
              onClick={() => {
                cambiarModoVista('normal')
                navigate('/')
              }}
            >
              <CIcon
                icon={cilUser}
                className="me-2"
              />

              Vista usuario

              {vistaActiva === 'normal' && (
                <span className="ms-2">
                  ✓
                </span>
              )}
            </CDropdownItem>

            <CDropdownItem
              role="button"
              className={
                vistaActiva === 'admin'
                  ? 'fw-semibold'
                  : ''
              }
              onClick={() => {
                cambiarModoVista('admin')
                navigate('/')
              }}
            >
              <CIcon
                icon={cilSettings}
                className="me-2"
              />

              Vista administrador

              {vistaActiva === 'admin' && (
                <span className="ms-2">
                  ✓
                </span>
              )}
            </CDropdownItem>
          </>
        )}

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