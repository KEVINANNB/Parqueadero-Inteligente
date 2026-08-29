import {
  useEffect,
  useState,
} from 'react'

import {
  CAlert,
  CAvatar,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner,
} from '@coreui/react'

import useMiCuenta
  from '../../hooks/useMiCuenta'


export default function MiPerfil() {
  const {
    perfil,
    cargando,
    error,
    actualizarPerfil,
  } =
    useMiCuenta()


  const [
    nombre,
    setNombre,
  ] =
    useState('')


  const [
    cedula,
    setCedula,
  ] =
    useState('')


  const [
    foto,
    setFoto,
  ] =
    useState('')


  const [
    guardando,
    setGuardando,
  ] =
    useState(false)


  const [
    mensaje,
    setMensaje,
  ] =
    useState(null)


  useEffect(
    () => {

      setNombre(
        perfil.nombre ||
        '',
      )


      setCedula(
        perfil.cedula ||
        '',
      )


      setFoto(
        perfil.foto ||
        '',
      )

    },
    [
      perfil,
    ],
  )


  const guardar =
    async (
      evento,
    ) => {

      evento.preventDefault()

      setMensaje(null)


      if (
        !nombre.trim()
      ) {
        setMensaje({
          tipo:
            'danger',

          texto:
            'Ingresa tu nombre completo.',
        })

        return
      }


      if (
        cedula &&
        !/^\d{10}$/.test(
          cedula,
        )
      ) {
        setMensaje({
          tipo:
            'danger',

          texto:
            'La cédula debe contener exactamente 10 números.',
        })

        return
      }


      if (
        foto &&
        !/^https?:\/\/\S+$/i.test(
          foto,
        )
      ) {
        setMensaje({
          tipo:
            'danger',

          texto:
            'La fotografía debe ser una URL válida.',
        })

        return
      }


      setGuardando(true)


      const resultado =
        await actualizarPerfil({

          nombre,

          cedula,

          foto_url:
            foto,

        })


      setGuardando(false)


      if (
        resultado.ok
      ) {
        setMensaje({
          tipo:
            'success',

          texto:
            'Tus datos fueron actualizados correctamente.',
        })
      } else {
        setMensaje({
          tipo:
            'danger',

          texto:
            resultado.error,
        })
      }

    }


  if (
    cargando
  ) {
    return (
      <div className="text-center py-5">

        <CSpinner
          color="success"
        />

        <p className="mt-3">
          Cargando perfil...
        </p>

      </div>
    )
  }


  return (
    <>

      {/* =====================================================
          ENCABEZADO
          ===================================================== */}

      <div className="mb-4">

        <small className="text-success fw-semibold">
          MI CUENTA
        </small>


        <h2 className="mt-1 mb-2">
          Mi perfil
        </h2>


        <p className="text-body-secondary">

          Consulta y actualiza
          tus datos personales.

        </p>

      </div>


      {/* =====================================================
          ERRORES
          ===================================================== */}

      {error && (

        <CAlert color="danger">
          {error}
        </CAlert>

      )}


      {mensaje && (

        <CAlert
          color={
            mensaje.tipo
          }
        >
          {
            mensaje.texto
          }
        </CAlert>

      )}


      {!perfil.cedula && (

        <CAlert color="warning">

          <strong>
            Completa tu cédula.
          </strong>

          {' '}

          Necesitas registrar tu cédula
          antes de poder agregar tu
          primer vehículo.

        </CAlert>

      )}


      {/* =====================================================
          CONTENIDO
          ===================================================== */}

      <CRow className="g-4">

        {/* ===================================================
            TARJETA PERFIL
            =================================================== */}

        <CCol lg={4}>

          <CCard className="h-100 shadow-sm">

            <CCardBody className="text-center py-5">

              {perfil.foto ? (

                <CAvatar
                  src={
                    perfil.foto
                  }

                  style={{
                    width:
                      130,

                    height:
                      130,
                  }}
                />

              ) : (

                <CAvatar

                  color="success"

                  textColor="white"

                  style={{
                    width:
                      130,

                    height:
                      130,

                    fontSize:
                      36,
                  }}
                >

                  {
                    perfil.nombre
                      ?.charAt(0)
                      ?.toUpperCase()
                    ||
                    'U'
                  }

                </CAvatar>

              )}


              <h4 className="mt-3 mb-1">

                {
                  perfil.nombre
                }

              </h4>


              <p className="text-body-secondary mb-1">

                {
                  perfil.correo
                }

              </p>


              <small className="text-body-secondary">

                Cédula:{' '}

                {
                  perfil
                    .cedulaEnmascarada
                }

              </small>


              <div className="mt-3">

                <span
                  className={
                    perfil.activo
                      ? 'badge bg-success'
                      : 'badge bg-danger'
                  }
                >

                  {
                    perfil.activo
                      ? 'Cuenta activa'
                      : 'Cuenta inactiva'
                  }

                </span>

              </div>

            </CCardBody>

          </CCard>

        </CCol>


        {/* ===================================================
            FORMULARIO
            =================================================== */}

        <CCol lg={8}>

          <CCard className="shadow-sm">

            <CCardHeader>
              <strong>
                Editar mis datos
              </strong>
            </CCardHeader>


            <CCardBody>

              <CForm
                onSubmit={
                  guardar
                }
              >

                {/* NOMBRE */}

                <div className="mb-3">

                  <CFormLabel>
                    Nombre completo
                  </CFormLabel>


                  <CFormInput

                    value={
                      nombre
                    }

                    onChange={(
                      evento,
                    ) =>
                      setNombre(
                        evento
                          .target
                          .value,
                      )
                    }

                    required

                  />

                </div>


                {/* CORREO */}

                <div className="mb-3">

                  <CFormLabel>
                    Correo de la cuenta
                  </CFormLabel>


                  <CFormInput

                    value={
                      perfil.correo
                    }

                    disabled

                  />


                  <div className="form-text">

                    El correo proviene
                    de tu cuenta de
                    autenticación y no
                    se modifica desde
                    esta pantalla.

                  </div>

                </div>


                {/* CÉDULA */}

                <div className="mb-3">

                  <CFormLabel>
                    Cédula
                  </CFormLabel>


                  <CFormInput

                    value={
                      cedula
                    }

                    placeholder="10 dígitos"

                    maxLength={10}

                    onChange={(
                      evento,
                    ) =>

                      setCedula(
                        evento
                          .target
                          .value
                          .replace(
                            /\D/g,
                            '',
                          ),
                      )

                    }

                  />


                  <div className="form-text">

                    La cédula se utiliza
                    para identificar al
                    propietario de tus
                    vehículos.

                  </div>

                </div>


                {/* FOTO */}

                <div className="mb-4">

                  <CFormLabel>
                    Fotografía de perfil
                  </CFormLabel>


                  <CFormInput

                    type="url"

                    value={
                      foto
                    }

                    placeholder="https://..."

                    onChange={(
                      evento,
                    ) =>
                      setFoto(
                        evento
                          .target
                          .value,
                      )
                    }

                  />

                </div>


                <CButton

                  type="submit"

                  color="success"

                  disabled={
                    guardando
                  }

                >

                  {guardando ? (

                    <>

                      <CSpinner
                        size="sm"
                        className="me-2"
                      />

                      Guardando...

                    </>

                  ) : (

                    'Guardar cambios'

                  )}

                </CButton>

              </CForm>

            </CCardBody>

          </CCard>

        </CCol>

      </CRow>

    </>
  )
}