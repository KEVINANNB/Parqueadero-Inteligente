import {
  useEffect,
  useState,
} from 'react'

import {
  CAlert,
  CAvatar,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'

import CIcon
  from '@coreui/icons-react'

import {
  cilCarAlt,
  cilEnvelopeClosed,
  cilReload,
  cilUser,
} from '@coreui/icons'

import useMiCuenta
  from '../../hooks/useMiCuenta'

import VehiculoFormModal
  from '../../components/VehiculoFormModal'

export default function MisVehiculos() {
  const {
    perfil,
    vehiculos,
    cargando,
    error,
    recargar,
    actualizarMiVehiculo,
  } = useMiCuenta()


  const [
    seleccionado,
    setSeleccionado,
  ] =
    useState(null)


  const [
    mensaje,
    setMensaje,
  ] =
    useState(null)


  /*
   * Oculta mensajes automáticamente.
   */
  useEffect(() => {

    if (!mensaje) {
      return
    }


    const temporizador =
      setTimeout(() => {

        setMensaje(null)

      }, 4000)


    return () =>
      clearTimeout(
        temporizador,
      )

  }, [
    mensaje,
  ])


  /*
   * Guardar cambios de un vehículo propio.
   */
  const guardar =
    async (payload) => {

      if (!seleccionado) {

        return {
          ok: false,

          error:
            'No existe un vehículo seleccionado.',
        }

      }


      const resultado =
        await actualizarMiVehiculo(
          seleccionado.id,
          payload,
        )


      if (resultado.ok) {

        setMensaje({

          tipo:
            'success',

          texto:
            'Los datos de tu vehículo fueron actualizados correctamente.',

        })

      } else {

        setMensaje({

          tipo:
            'danger',

          texto:
            resultado.error,

        })

      }


      return resultado
    }


  /*
   * =============================================================
   * CARGANDO
   * =============================================================
   */
  if (cargando) {

    return (

      <div className="text-center py-5">

        <CSpinner
          color="success"
        />

        <p className="mt-3 text-body-secondary">
          Buscando vehículos asociados
          a tu cuenta...
        </p>

      </div>

    )
  }


  return (
    <div>

      {/* ========================================================
          ENCABEZADO
          ======================================================== */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

        <div>

          <small className="text-success fw-semibold">
            MI CUENTA
          </small>

          <h2 className="mt-1 mb-1">
            Mis vehículos
          </h2>

          <p className="text-body-secondary mb-0">
            Vehículos vinculados
            directamente a tu cuenta
            de Smart Parking.
          </p>

        </div>


        <CButton
          color="success"
          variant="outline"
          onClick={recargar}
        >

          <CIcon
            icon={cilReload}
            className="me-2"
          />

          Actualizar

        </CButton>

      </div>


      {/* ========================================================
          ERROR
          ======================================================== */}

      {error && (

        <CAlert color="danger">

          <strong>
            No se pudo cargar tu información.
          </strong>

          <br />

          {error}

        </CAlert>

      )}


      {/* ========================================================
          MENSAJES
          ======================================================== */}

      {mensaje && (

        <CAlert
          color={mensaje.tipo}
        >
          {mensaje.texto}
        </CAlert>

      )}


      {/* ========================================================
          RESUMEN DE LA CUENTA
          ======================================================== */}

      <CCard className="shadow-sm mb-4">

        <CCardBody>

          <CRow className="align-items-center g-4">

            <CCol
              xs={12}
              md="auto"
              className="text-center"
            >

              {perfil.foto ? (

                <CAvatar

                  src={perfil.foto}

                  style={{
                    width: 95,
                    height: 95,
                  }}

                />

              ) : (

                <CAvatar

                  color="success"

                  textColor="white"

                  style={{
                    width: 95,
                    height: 95,
                    fontSize: 30,
                  }}

                >

                  {perfil.nombre
                    ?.charAt(0)
                    ?.toUpperCase()
                    ||
                    'U'}

                </CAvatar>

              )}

            </CCol>


            <CCol>

              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">

                <h4 className="mb-0">
                  {perfil.nombre}
                </h4>


                <CBadge
                  color={
                    perfil.vinculado
                      ? 'success'
                      : 'secondary'
                  }
                >

                  {perfil.vinculado
                    ? 'Cuenta vinculada'
                    : 'Sin vehículo vinculado'}

                </CBadge>

              </div>


              <div className="text-body-secondary mb-2">

                <CIcon
                  icon={cilEnvelopeClosed}
                  className="me-2"
                />

                Cuenta de acceso:

                {' '}

                <strong>
                  {perfil.correoCuenta}
                </strong>

              </div>


              {perfil.correo && (

                <div className="text-body-secondary mb-2">

                  <CIcon
                    icon={cilUser}
                    className="me-2"
                  />

                  Correo institucional:

                  {' '}

                  <strong>
                    {perfil.correo}
                  </strong>

                </div>

              )}


              <div className="text-body-secondary">

                <CIcon
                  icon={cilCarAlt}
                  className="me-2"
                />

                Vehículos asociados:

                {' '}

                <strong>
                  {perfil.cantidadVehiculos}
                </strong>

              </div>

            </CCol>

          </CRow>

        </CCardBody>

      </CCard>


      {/* ========================================================
          SIN VEHÍCULOS
          ======================================================== */}

      {!error &&
        vehiculos.length === 0 && (

          <CAlert color="info">

            <h5>
              No encontramos vehículos
              vinculados a tu cuenta.
            </h5>


            <p className="mb-2">

              El sistema intenta relacionar
              automáticamente tu cuenta con
              los registros existentes mediante
              tu correo institucional o correo
              Microsoft.

            </p>


            <p className="mb-0">

              Cuenta actualmente iniciada:

              {' '}

              <strong>
                {perfil.correoCuenta}
              </strong>

            </p>

          </CAlert>

        )}


      {/* ========================================================
          VEHÍCULOS
          ======================================================== */}

      {vehiculos.length > 0 && (

        <CRow className="g-4">

          {vehiculos.map(
            (
              vehiculo,
            ) => (

              <CCol
                xs={12}
                md={6}
                xl={4}
                key={vehiculo.id}
              >

                <CCard className="h-100 shadow-sm overflow-hidden">

                  {/* FOTO */}

                  <div
                    style={{
                      height: 220,
                      background:
                        '#f3f4f6',
                    }}
                  >

                    <img

                      src={
                        vehiculo.foto_url
                      }

                      alt={`${vehiculo.marca} ${vehiculo.modelo}`}

                      loading="lazy"

                      style={{
                        height:
                          '100%',

                        width:
                          '100%',

                        objectFit:
                          'cover',
                      }}

                    />

                  </div>


                  {/* CABECERA */}

                  <CCardHeader>

                    <div className="d-flex justify-content-between align-items-start gap-2">

                      <div>

                        <h5 className="mb-1">

                          {vehiculo.marca}

                          {' '}

                          {vehiculo.modelo}

                        </h5>


                        <CBadge color="dark">

                          {vehiculo.placa}

                        </CBadge>

                      </div>


                      <CBadge
                        color={
                          vehiculo.autorizado
                            ? 'success'
                            : 'danger'
                        }
                      >

                        {vehiculo.autorizado
                          ? 'Autorizado'
                          : 'No autorizado'}

                      </CBadge>

                    </div>

                  </CCardHeader>


                  {/* DATOS */}

                  <CCardBody className="d-flex flex-column">

                    <div className="mb-3">

                      <div className="mb-2">

                        <span className="text-body-secondary">
                          Propietario
                        </span>

                        <div className="fw-semibold">

                          {
                            vehiculo.propietario_nombre
                          }

                        </div>

                      </div>


                      <div className="mb-2">

                        <span className="text-body-secondary">
                          Año
                        </span>

                        <div className="fw-semibold">

                          {
                            vehiculo.anio
                          }

                        </div>

                      </div>


                      <div className="mb-2">

                        <span className="text-body-secondary">
                          Color
                        </span>

                        <div className="fw-semibold">

                          {
                            vehiculo.color
                          }

                        </div>

                      </div>


                      <div className="mb-2">

                        <span className="text-body-secondary">
                          Tipo
                        </span>

                        <div className="fw-semibold">

                          {
                            vehiculo.tipo
                          }

                        </div>

                      </div>


                      <div>

                        <span className="text-body-secondary">
                          Cédula
                        </span>

                        <div className="fw-semibold">

                          {
                            vehiculo.cedula_enmascarada
                          }

                        </div>

                      </div>

                    </div>


                    <div className="mt-auto">

                      <CButton

                        color="success"

                        className="w-100"

                        onClick={() =>
                          setSeleccionado(
                            vehiculo,
                          )
                        }

                      >

                        Editar mi vehículo

                      </CButton>

                    </div>

                  </CCardBody>

                </CCard>

              </CCol>

            ),

          )}

        </CRow>

      )}


      {/* ========================================================
          MODAL
          ======================================================== */}

      <VehiculoFormModal

        visible={
          !!seleccionado
        }

        modo="editar-propio"

        vehiculoInicial={
          seleccionado
        }

        onClose={() =>
          setSeleccionado(
            null,
          )
        }

        onGuardar={
          guardar
        }

      />

    </div>
  )
}