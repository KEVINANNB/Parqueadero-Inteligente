import {
  Link,
} from 'react-router-dom'

import {
  CAlert,
  CCard,
  CCardBody,
  CCol,
  CRow,
} from '@coreui/react'

import CIcon
  from '@coreui/icons-react'

import {
  cilCarAlt,
  cilList,
  cilMap,
  cilSettings,
  cilSpeedometer,
  cilUser,
} from '@coreui/icons'

import {
  useAuth,
} from '../context/AuthContext'


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


            <h5 className="mb-2">
              {titulo}
            </h5>


            <p className="small mb-0">
              {descripcion}
            </p>

          </CCardBody>

        </CCard>
      </Link>
    </CCol>
  )
}


export default function Inicio() {
  const {
    autenticado,
    esAdmin,
    vistaActiva,
    puedeAdministrar,
  } = useAuth()


  const opciones = [

    {
      titulo:
        'Parqueadero',

      descripcion:
        'Consulta la disponibilidad y el estado de los 80 espacios.',

      icono:
        cilSpeedometer,

      ruta:
        '/estacionamiento',
    },


    {
      titulo:
        'Vehículos y propietarios',

      descripcion:
        puedeAdministrar
          ? 'Administra todos los vehículos y propietarios registrados.'
          : 'Consulta los vehículos autorizados y sus propietarios.',

      icono:
        cilList,

      ruta:
        '/parqueadero/vehiculos',
    },


    {
      titulo:
        'Mapa del parqueadero',

      descripcion:
        'Visualiza los 80 espacios sobre el mapa del campus y consulta cada puesto.',

      icono:
        cilMap,

      ruta:
        '/parqueadero/mapa',
    },

  ]


  if (autenticado) {
    opciones.push(

      {
        titulo:
          'Mis vehículos',

        descripcion:
          'Consulta y modifica los vehículos asociados a tu cuenta.',

        icono:
          cilCarAlt,

        ruta:
          '/cuenta/vehiculos',
      },


      {
        titulo:
          'Mi perfil',

        descripcion:
          'Consulta y actualiza tus datos personales y fotografía.',

        icono:
          cilUser,

        ruta:
          '/cuenta/perfil',
      },

    )
  } else {
    opciones.push({

      titulo:
        'Iniciar sesión',

      descripcion:
        'Accede a tu cuenta del Smart Parking UTEQ.',

      icono:
        cilUser,

      ruta:
        '/login',

    })
  }


  if (puedeAdministrar) {
    opciones.push({

      titulo:
        'Administración',

      descripcion:
        'Acceso completo para crear, editar, autorizar y eliminar vehículos.',

      icono:
        cilSettings,

      ruta:
        '/parqueadero/vehiculos',

    })
  }


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
          Selecciona una opción para
          acceder a los servicios del
          sistema.
        </p>

      </div>


      {esAdmin && (

        <CAlert
          color={
            vistaActiva ===
            'admin'
              ? 'warning'
              : 'info'
          }
          className="mb-4"
        >

          {vistaActiva ===
          'admin' ? (

            <>
              Estás utilizando la{' '}

              <strong>
                Vista administrador
              </strong>

              . Tienes habilitados los
              controles de administración
              del sistema.
            </>

          ) : (

            <>
              Tu cuenta es administrador,
              pero estás utilizando la{' '}

              <strong>
                Vista usuario
              </strong>

              .
            </>

          )}

        </CAlert>

      )}


      <CRow className="g-4">

        {opciones.map(
          (
            opcion,
          ) => (

            <TarjetaMenu
              key={
                opcion.titulo
              }
              {...opcion}
            />

          ),
        )}

      </CRow>

    </div>
  )
}