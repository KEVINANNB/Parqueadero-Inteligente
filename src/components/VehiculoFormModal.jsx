import { useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react'

const VACIO = {
  placa: '',
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  color: '',
  tipo: 'AUTOMOVIL',
  foto_url: '',
  foto_fuente_url: '',
  foto_propietario_url: '',
  cedula_propietario: '',
  propietario_nombre: '',
  correo_institucional: '',
  autorizado: true,
}

const PLACA_REGEX = /^[A-Z]{3}-\d{4}$/
const CEDULA_REGEX = /^\d{10}$/

/**
 * modo: 'crear' (admin, todos los campos) | 'editar-admin' (admin, todos
 * los campos) | 'editar-propio' (usuario normal, solo datos y fotos)
 */
export default function VehiculoFormModal({ visible, modo, vehiculoInicial, onClose, onGuardar }) {
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  const soloDatosYFotos = modo === 'editar-propio'

  useEffect(() => {
    if (visible) {
      setForm(vehiculoInicial ? { ...VACIO, ...vehiculoInicial } : VACIO)
      setErrores({})
      setErrorGeneral('')
    }
  }, [visible, vehiculoInicial])

  const actualizarCampo = (campo, valor) => setForm((actual) => ({ ...actual, [campo]: valor }))

  const validar = () => {
    const nuevosErrores = {}
    if (!soloDatosYFotos) {
      if (!PLACA_REGEX.test(form.placa || '')) nuevosErrores.placa = 'Formato esperado: ABC-1234'
      if (!CEDULA_REGEX.test(form.cedula_propietario || ''))
        nuevosErrores.cedula_propietario = 'Debe tener 10 dígitos'
      if (!form.propietario_nombre?.trim()) nuevosErrores.propietario_nombre = 'Requerido'
      if (!/^\S+@\S+\.\S+$/.test(form.correo_institucional || ''))
        nuevosErrores.correo_institucional = 'Correo inválido'
    }
    if (!form.marca?.trim()) nuevosErrores.marca = 'Requerido'
    if (!form.modelo?.trim()) nuevosErrores.modelo = 'Requerido'
    if (!form.color?.trim()) nuevosErrores.color = 'Requerido'
    const anio = Number(form.anio)
    if (!anio || anio < 1990 || anio > 2035) nuevosErrores.anio = 'Entre 1990 y 2035'
    if (!/^https?:\/\//.test(form.foto_url || '')) nuevosErrores.foto_url = 'URL de imagen inválida'
    if (!/^https?:\/\//.test(form.foto_propietario_url || ''))
      nuevosErrores.foto_propietario_url = 'URL de imagen inválida'

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarGuardar = async () => {
    setErrorGeneral('')
    if (!validar()) return

    setGuardando(true)
    const payload = soloDatosYFotos
      ? {
          marca: form.marca,
          modelo: form.modelo,
          color: form.color,
          tipo: form.tipo,
          foto_url: form.foto_url,
          foto_propietario_url: form.foto_propietario_url,
        }
      : {
          placa: form.placa.toUpperCase(),
          marca: form.marca,
          modelo: form.modelo,
          anio: Number(form.anio),
          color: form.color,
          tipo: form.tipo,
          foto_url: form.foto_url,
          foto_fuente_url: form.foto_fuente_url || form.foto_url,
          foto_propietario_url: form.foto_propietario_url,
          cedula_propietario: form.cedula_propietario,
          propietario_nombre: form.propietario_nombre.toUpperCase(),
          correo_institucional: form.correo_institucional,
          autorizado: !!form.autorizado,
        }

    const resultado = await onGuardar(payload)
    setGuardando(false)

    if (!resultado.ok) {
      setErrorGeneral(resultado.error || 'No se pudo guardar el registro.')
      return
    }
    onClose()
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" alignment="center">
      <CModalHeader>
        <CModalTitle>
          {modo === 'crear' ? 'Agregar vehículo' : 'Editar vehículo'}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {errorGeneral && <CAlert color="danger">{errorGeneral}</CAlert>}

        <CForm>
          {!soloDatosYFotos && (
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Placa</CFormLabel>
                <CFormInput
                  placeholder="ABC-1234"
                  value={form.placa}
                  invalid={!!errores.placa}
                  feedbackInvalid={errores.placa}
                  onChange={(e) => actualizarCampo('placa', e.target.value.toUpperCase())}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Cédula del propietario</CFormLabel>
                <CFormInput
                  placeholder="10 dígitos"
                  value={form.cedula_propietario}
                  invalid={!!errores.cedula_propietario}
                  feedbackInvalid={errores.cedula_propietario}
                  onChange={(e) => actualizarCampo('cedula_propietario', e.target.value)}
                />
              </CCol>
            </CRow>
          )}

          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>Marca</CFormLabel>
              <CFormInput
                value={form.marca}
                invalid={!!errores.marca}
                feedbackInvalid={errores.marca}
                onChange={(e) => actualizarCampo('marca', e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Modelo</CFormLabel>
              <CFormInput
                value={form.modelo}
                invalid={!!errores.modelo}
                feedbackInvalid={errores.modelo}
                onChange={(e) => actualizarCampo('modelo', e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Tipo</CFormLabel>
              <CFormSelect
                value={form.tipo}
                onChange={(e) => actualizarCampo('tipo', e.target.value)}
              >
                <option value="AUTOMOVIL">Automóvil</option>
                <option value="CAMIONETA">Camioneta</option>
                <option value="SUV">SUV</option>
                <option value="MOTOCICLETA">Motocicleta</option>
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            {!soloDatosYFotos && (
              <CCol md={4}>
                <CFormLabel>Año</CFormLabel>
                <CFormInput
                  type="number"
                  value={form.anio}
                  invalid={!!errores.anio}
                  feedbackInvalid={errores.anio}
                  onChange={(e) => actualizarCampo('anio', e.target.value)}
                />
              </CCol>
            )}
            <CCol md={soloDatosYFotos ? 12 : 8}>
              <CFormLabel>Color</CFormLabel>
              <CFormInput
                value={form.color}
                invalid={!!errores.color}
                feedbackInvalid={errores.color}
                onChange={(e) => actualizarCampo('color', e.target.value)}
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Foto del vehículo (URL)</CFormLabel>
              <CFormInput
                value={form.foto_url}
                invalid={!!errores.foto_url}
                feedbackInvalid={errores.foto_url}
                onChange={(e) => actualizarCampo('foto_url', e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Foto del propietario (URL)</CFormLabel>
              <CFormInput
                value={form.foto_propietario_url}
                invalid={!!errores.foto_propietario_url}
                feedbackInvalid={errores.foto_propietario_url}
                onChange={(e) => actualizarCampo('foto_propietario_url', e.target.value)}
              />
            </CCol>
          </CRow>

          {!soloDatosYFotos && (
            <CRow>
              <CCol md={6}>
                <CFormLabel>Nombre del propietario</CFormLabel>
                <CFormInput
                  value={form.propietario_nombre}
                  invalid={!!errores.propietario_nombre}
                  feedbackInvalid={errores.propietario_nombre}
                  onChange={(e) => actualizarCampo('propietario_nombre', e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Correo institucional</CFormLabel>
                <CFormInput
                  value={form.correo_institucional}
                  invalid={!!errores.correo_institucional}
                  feedbackInvalid={errores.correo_institucional}
                  onChange={(e) => actualizarCampo('correo_institucional', e.target.value)}
                />
              </CCol>
            </CRow>
          )}
        </CForm>
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" variant="outline" onClick={onClose} disabled={guardando}>
          Cancelar
        </CButton>
        <CButton color="success" onClick={manejarGuardar} disabled={guardando}>
          {guardando ? <CSpinner size="sm" /> : 'Guardar'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
