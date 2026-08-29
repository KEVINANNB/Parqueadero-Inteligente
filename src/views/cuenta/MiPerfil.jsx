import { useEffect, useState } from 'react'

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

import useMiCuenta from '../../hooks/useMiCuenta'
import PageSectionHeader from '../../components/PageSectionHeader'

<PageSectionHeader
  breadcrumb={['Inicio', 'Mi perfil']}
  title="Mi perfil"
  subtitle="Consulta y actualiza tu información personal, fotografía y datos asociados a tu cuenta."
/>
export default function MiPerfil() {
  const {
    perfil,
    cargando,
    error,
    actualizarPerfil,
  } = useMiCuenta()

  const [nombre, setNombre] = useState('')
  const [foto, setFoto] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    setNombre(perfil.nombre || '')
    setFoto(perfil.foto || '')
  }, [perfil])

  const guardar = async (evento) => {
    evento.preventDefault()

    setMensaje(null)
    setGuardando(true)

    const resultado = await actualizarPerfil({
      propietario_nombre: nombre,
      foto_propietario_url: foto,
    })

    setGuardando(false)

    if (resultado.ok) {
      setMensaje({
        tipo: 'success',
        texto: 'Tus datos fueron actualizados correctamente.',
      })
    } else {
      setMensaje({
        tipo: 'danger',
        texto: resultado.error,
      })
    }
  }

  if (cargando) {
    return (
      <div className="text-center py-5">
        <CSpinner color="success" />
        <p className="mt-3">
          Cargando perfil...
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <h2>Mi perfil</h2>
        <p className="text-body-secondary">
          Consulta y actualiza tus datos personales.
        </p>
      </div>

      {error && (
        <CAlert color="danger">
          {error}
        </CAlert>
      )}

      {mensaje && (
        <CAlert color={mensaje.tipo}>
          {mensaje.texto}
        </CAlert>
      )}

      <CRow className="g-4">
        <CCol lg={4}>
          <CCard className="h-100 shadow-sm">
            <CCardBody className="text-center py-5">
              {perfil.foto ? (
                <CAvatar
                  src={perfil.foto}
                  style={{
                    width: 130,
                    height: 130,
                  }}
                />
              ) : (
                <CAvatar
                  color="success"
                  textColor="white"
                  style={{
                    width: 130,
                    height: 130,
                    fontSize: 36,
                  }}
                >
                  {perfil.nombre?.charAt(0) || 'U'}
                </CAvatar>
              )}

              <h4 className="mt-3 mb-1">
                {perfil.nombre}
              </h4>

              <p className="text-body-secondary mb-1">
                {perfil.correo}
              </p>

              <small className="text-body-secondary">
                Cédula: {perfil.cedula}
              </small>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={8}>
          <CCard className="shadow-sm">
            <CCardHeader>
              <strong>Editar mis datos</strong>
            </CCardHeader>

            <CCardBody>
              <CForm onSubmit={guardar}>
                <div className="mb-3">
                  <CFormLabel>
                    Nombre completo
                  </CFormLabel>

                  <CFormInput
                    value={nombre}
                    onChange={(evento) =>
                      setNombre(evento.target.value)
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <CFormLabel>
                    Correo institucional
                  </CFormLabel>

                  <CFormInput
                    value={perfil.correo}
                    disabled
                  />

                  <div className="form-text">
                    El correo está asociado a tu cuenta
                    y por ahora no se puede modificar.
                  </div>
                </div>

                <div className="mb-3">
                  <CFormLabel>
                    Cédula
                  </CFormLabel>

                  <CFormInput
                    value={perfil.cedula}
                    disabled
                  />
                </div>

                <div className="mb-4">
                  <CFormLabel>
                    Fotografía de perfil
                  </CFormLabel>

                  <CFormInput
                    value={foto}
                    placeholder="https://..."
                    onChange={(evento) =>
                      setFoto(evento.target.value)
                    }
                    required
                  />
                </div>

                <CButton
                  type="submit"
                  color="success"
                  disabled={guardando}
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