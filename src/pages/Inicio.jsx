import { Link } from 'react-router-dom'

import {
  CCard,
  CCardBody,
  CCol,
  CRow,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'

import {
  cilCarAlt,
  cilList,
  cilMap,
  cilSpeedometer,
  cilUser,
} from '@coreui/icons'

import { useAuth } from '../context/AuthContext'

const OPCIONES_BASE = [
  {
    titulo: 'Parqueadero',
    descripcion:
      'Consulta disponibilidad y estado de los espacios.',
    icono: cilSpeedometer,
    ruta: '/estacionamiento',
  },
  {
    titulo: 'Vehículos y propietarios',
    descripcion:
      'Consulta los vehículos registrados y sus propietarios.',
    icono: cilList,
    ruta: '/parqueadero/vehiculos',
  },
  {
    titulo: 'Mapa del campus',
    descripcion:
      'Consulta la ubicación del parqueadero UTEQ.',
    icono: cilMap,
    ruta: '/estacionamiento',
  },
]

function TarjetaMenu({
  titulo,
  descripcion,
  icono,
  ruta,
}) {
  return (
    <CCol
      xs={12}
      sm={6}
      md={4}
      xl={3}
    >
      <Link
        to={ruta}
        className="text-decoration-none"
      >
        <CCard className="menu-sga-card h-100 shadow-sm">
          <CCardBody>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="menu-sga-icon">
                <CIcon
                  icon={icono}
                  size="xl"
                />
              </div>

              <span
                className="text-warning"
                title="Acceso rápido"
              >
                ★
              </span>
            </div>

            <h5 className="text-body mb-2">
              {titulo}
            </h5>

            <p className="text-body-secondary small mb-0">
              {descripcion}
            </p>
          </CCardBody>
        </CCard>
      </Link>
    </CCol>
  )
}

export default function Inicio() {
  const { autenticado } = useAuth()

  const opciones = [
    ...OPCIONES_BASE,

    ...(autenticado
      ? [
          {
            titulo: 'Mis vehículos',
            descripcion:
              'Consulta y modifica los datos de tus vehículos.',
            icono: cilCarAlt,
            ruta: '/cuenta/vehiculos',
          },
          {
            titulo: 'Mi perfil',
            descripcion:
              'Consulta y actualiza tus datos personales.',
            icono: cilUser,
            ruta: '/cuenta/perfil',
          },
        ]
      : [
          {
            titulo: 'Iniciar sesión',
            descripcion:
              'Accede a tu cuenta del Smart Parking.',
            icono: cilUser,
            ruta: '/login',
          },
        ]),
  ]

  return (
    <div className="dashboard-sga">
      <div className="mb-4">
        <small className="text-success fw-semibold">
          UTEQ SMART PARKING
        </small>

        <h2 className="mt-1 mb-2">
          Menú principal
        </h2>

        <p className="text-body-secondary">
          Selecciona una opción para acceder
          a los servicios del sistema.
        </p>
      </div>

      <CRow className="g-4">
        {opciones.map((opcion) => (
          <TarjetaMenu
            key={opcion.titulo}
            {...opcion}
          />
        ))}
      </CRow>
    </div>
  )
}