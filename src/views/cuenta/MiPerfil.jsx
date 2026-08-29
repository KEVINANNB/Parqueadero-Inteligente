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

import ImageUploadField
  from '../../components/ImageUploadField'


export default function MiPerfil() {
  const {
    perfil,
    cargando,
    error,
    actualizarPerfil,
  } =
    useMiCuenta()


  /* ==============================================================
     FORMULARIO
     ============================================================== */

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


  /* ==============================================================
     CARGAR DATOS
     ============================================================== */

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


  /* ==============================================================
     GUARDAR
     ============================================================== */

  const guardar =
    async (
      evento,
    ) => {

      evento.preventDefault()


      setMensaje(null)


      /* ----------------------------------------------------------
         NOMBRE
         ---------------------------------------------------------- */

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


      /* ----------------------------------------------------------
         CÉDULA
         ---------------------------------------------------------- */

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


      /* ----------------------------------------------------------
         GUARDAR
         ---------------------------------------------------------- */

      setGuardando(true)


      try {

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

      } catch (
        errorGuardar
      ) {

        console.error(
          'Error guardando perfil:',
          errorGuardar,
        )


        setGuardando(false)


        setMensaje({

          tipo:
            'danger',

          texto:
            errorGuardar?.message ||
            'Ocurrió un error inesperado al guardar.',

        })

      }

    }


  /* ==============================================================
     CARGANDO
     ============================================================== */

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


  /* ==============================================================
     RENDER
     ============================================================== */

  return (
    <>

      {/* ==========================================================
          ENCABEZADO
          ========================================================== */}

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


      {/* ==========================================================
          ERROR
          ========================================================== */}

      {error && (

        <CAlert color="danger">

          {
            error
          }

        </CAlert>

      )}


      {/* ==========================================================
          MENSAJE
          ========================================================== */}

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


      {/* ==========================================================
          PERFIL INCOMPLETO
          ========================================================== */}

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


      {/* ==========================================================
          CONTENIDO
          ========================================================== */}

      <CRow className="g-4">

        {/* ========================================================
            INFORMACIÓN DEL USUARIO
            ======================================================== */}

        <CCol lg={4}>

          <CCard className="h-100 shadow-sm">

            <CCardBody className="text-center py-5">

              {/* FOTO */}

              {foto ? (

                <CAvatar

                  src={
                    foto
                  }

                  style={{
                    width:
                      130,

                    height:
                      130,

                    objectFit:
                      'cover',
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
                    nombre
                      ?.charAt(0)
                      ?.toUpperCase()
                    ||
                    perfil.nombre
                      ?.charAt(0)
                      ?.toUpperCase()
                    ||
                    'U'
                  }

                </CAvatar>

              )}


              {/* NOMBRE */}

              <h4 className="mt-3 mb-1">

                {
                  nombre ||
                  perfil.nombre
                }

              </h4>


              {/* CORREO */}

              <p className="text-body-secondary mb-1">

                {
                  perfil.correo
                }

              </p>


              {/* CÉDULA */}

              <small className="text-body-secondary">

                Cédula:{' '}

                {
                  cedula

                    ? `******${
                        cedula.slice(
                          -4,
                        )
                      }`

                    : 'No registrada'
                }

              </small>


              {/* ESTADO */}

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


        {/* ========================================================
            EDITAR
            ======================================================== */}

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

                {/* =================================================
                    NOMBRE
                    ================================================= */}

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

                    disabled={
                      guardando
                    }

                    required

                  />

                </div>


                {/* =================================================
                    CORREO
                    ================================================= */}

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


                {/* =================================================
                    CÉDULA
                    ================================================= */}

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

                    disabled={
                      guardando
                    }

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


                {/* =================================================
                    FOTO
                    ================================================= */}

                <div className="mb-4">

                  <ImageUploadField

                    label="Fotografía de perfil"

                    value={
                      foto
                    }

                    carpeta="perfiles"

                    disabled={
                      guardando
                    }

                    onChange={(
                      url,
                    ) =>
                      setFoto(
                        url,
                      )
                    }

                  />

                </div>


                {/* =================================================
                    GUARDAR
                    ================================================= */}

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