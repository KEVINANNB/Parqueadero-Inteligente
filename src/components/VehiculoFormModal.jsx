import {
  useEffect,
  useState,
} from 'react'

import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'

const VACIO = {
  placa: '',

  marca: '',

  modelo: '',

  anio:
    new Date().getFullYear(),

  color: '',

  tipo: 'AUTOMOVIL',

  foto_url: '',

  foto_fuente_url: '',

  foto_propietario_url: '',

  cedula_propietario: '',

  cedula_enmascarada: '',

  propietario_nombre: '',

  correo_institucional: '',

  autorizado: true,
}

const PLACA_REGEX =
  /^[A-Z]{3}-\d{4}$/

const CEDULA_REGEX =
  /^\d{10}$/

const CORREO_REGEX =
  /^\S+@\S+\.\S+$/

const URL_REGEX =
  /^https?:\/\/\S+$/i

export default function VehiculoFormModal({
  visible,
  modo,
  vehiculoInicial,
  onClose,
  onGuardar,
}) {
  const [
    form,
    setForm,
  ] = useState(VACIO)

  const [
    errores,
    setErrores,
  ] = useState({})

  const [
    guardando,
    setGuardando,
  ] = useState(false)

  const [
    errorGeneral,
    setErrorGeneral,
  ] = useState('')

  const esCrear =
    modo === 'crear'

  const esEditarAdmin =
    modo === 'editar-admin'

  const esEditarPropio =
    modo === 'editar-propio'

  const esModoAdmin =
    esCrear ||
    esEditarAdmin

  useEffect(() => {
    if (!visible) {
      return
    }

    if (vehiculoInicial) {
      const datos = {
        ...VACIO,
        ...vehiculoInicial,
      }

      /*
       * La consulta pública no expone la
       * cédula completa.
       *
       * En edición admin dejamos este campo
       * vacío. Si queda vacío, se conserva
       * la cédula anterior.
       */
      if (esEditarAdmin) {
        datos.cedula_propietario =
          ''
      }

      setForm(datos)
    } else {
      setForm({
        ...VACIO,
        anio:
          new Date().getFullYear(),
      })
    }

    setErrores({})
    setErrorGeneral('')
  }, [
    visible,
    vehiculoInicial,
    esEditarAdmin,
  ])

  const actualizarCampo = (
    campo,
    valor,
  ) => {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  const validar = () => {
    const nuevosErrores = {}

    if (esModoAdmin) {
      if (
        !PLACA_REGEX.test(
          form.placa || '',
        )
      ) {
        nuevosErrores.placa =
          'Formato esperado: ABC-1234'
      }

      /*
       * En crear es obligatoria.
       * En editar admin es opcional:
       * vacío = conservar actual.
       */
      if (esCrear) {
        if (
          !CEDULA_REGEX.test(
            form.cedula_propietario ||
              '',
          )
        ) {
          nuevosErrores.cedula_propietario =
            'Debe contener exactamente 10 dígitos'
        }
      } else if (
        form.cedula_propietario &&
        !CEDULA_REGEX.test(
          form.cedula_propietario,
        )
      ) {
        nuevosErrores.cedula_propietario =
          'Debe contener exactamente 10 dígitos'
      }

      if (
        !form.propietario_nombre?.trim()
      ) {
        nuevosErrores.propietario_nombre =
          'Campo requerido'
      }

      if (
        !CORREO_REGEX.test(
          form.correo_institucional ||
            '',
        )
      ) {
        nuevosErrores.correo_institucional =
          'Correo inválido'
      }

      const anio =
        Number(form.anio)

      if (
        !anio ||
        anio < 1990 ||
        anio > 2035
      ) {
        nuevosErrores.anio =
          'El año debe estar entre 1990 y 2035'
      }
    }

    if (!form.marca?.trim()) {
      nuevosErrores.marca =
        'Campo requerido'
    }

    if (!form.modelo?.trim()) {
      nuevosErrores.modelo =
        'Campo requerido'
    }

    if (!form.color?.trim()) {
      nuevosErrores.color =
        'Campo requerido'
    }

    if (
      !URL_REGEX.test(
        form.foto_url || '',
      )
    ) {
      nuevosErrores.foto_url =
        'Introduce una URL válida que empiece con http:// o https://'
    }

    if (
      !URL_REGEX.test(
        form.foto_propietario_url ||
          '',
      )
    ) {
      nuevosErrores.foto_propietario_url =
        'Introduce una URL válida que empiece con http:// o https://'
    }

    setErrores(
      nuevosErrores,
    )

    return (
      Object.keys(
        nuevosErrores,
      ).length === 0
    )
  }

  const manejarGuardar =
    async () => {
      setErrorGeneral('')

      if (!validar()) {
        return
      }

      setGuardando(true)

      let payload

      if (esEditarPropio) {
        /*
         * CAMPOS PERMITIDOS PARA
         * USUARIO NORMAL.
         */
        payload = {
          marca:
            form.marca.trim(),

          modelo:
            form.modelo.trim(),

          color:
            form.color.trim(),

          tipo:
            form.tipo,

          foto_url:
            form.foto_url.trim(),

          foto_propietario_url:
            form.foto_propietario_url.trim(),
        }
      } else {
        /*
         * CAMPOS ADMINISTRATIVOS.
         */
        payload = {
          placa:
            form.placa
              .trim()
              .toUpperCase(),

          marca:
            form.marca.trim(),

          modelo:
            form.modelo.trim(),

          anio:
            Number(form.anio),

          color:
            form.color.trim(),

          tipo:
            form.tipo,

          foto_url:
            form.foto_url.trim(),

          foto_fuente_url:
            (
              form.foto_fuente_url ||
              form.foto_url
            ).trim(),

          foto_propietario_url:
            form.foto_propietario_url.trim(),

          propietario_nombre:
            form.propietario_nombre
              .trim()
              .toUpperCase(),

          correo_institucional:
            form.correo_institucional
              .trim()
              .toLowerCase(),

          autorizado:
            Boolean(
              form.autorizado,
            ),
        }

        if (
          esCrear ||
          form.cedula_propietario
            ?.trim()
        ) {
          payload.cedula_propietario =
            form.cedula_propietario.trim()
        }
      }

      const resultado =
        await onGuardar(payload)

      setGuardando(false)

      if (!resultado.ok) {
        setErrorGeneral(
          resultado.error ||
            'No se pudo guardar el registro.',
        )

        return
      }

      onClose()
    }

  return (
    <CModal
      visible={visible}

      onClose={onClose}

      backdrop="static"

      alignment="center"

      size="lg"
    >
      <CModalHeader>
        <CModalTitle>
          {esCrear
            ? 'Agregar vehículo'
            : esEditarAdmin
              ? 'Editar vehículo - Administrador'
              : 'Editar mi vehículo'}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {errorGeneral && (
          <CAlert color="danger">
            {errorGeneral}
          </CAlert>
        )}

        {esEditarPropio && (
          <CAlert color="info">
            Puedes modificar únicamente
            los datos permitidos de tu
            vehículo. La placa, cédula,
            año, correo y autorización
            están protegidos.
          </CAlert>
        )}

        <CForm>
          {esModoAdmin && (
            <>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>
                    Placa
                  </CFormLabel>

                  <CFormInput
                    placeholder="ABC-1234"

                    value={
                      form.placa
                    }

                    invalid={
                      !!errores.placa
                    }

                    feedbackInvalid={
                      errores.placa
                    }

                    onChange={(
                      evento,
                    ) =>
                      actualizarCampo(
                        'placa',

                        evento.target.value
                          .toUpperCase(),
                      )
                    }
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>
                    Cédula del propietario
                  </CFormLabel>

                  <CFormInput
                    placeholder={
                      esEditarAdmin
                        ? `Actual: ${
                            form.cedula_enmascarada ||
                            'protegida'
                          } — deja vacío para conservar`
                        : '10 dígitos'
                    }

                    value={
                      form.cedula_propietario
                    }

                    invalid={
                      !!errores.cedula_propietario
                    }

                    feedbackInvalid={
                      errores.cedula_propietario
                    }

                    onChange={(
                      evento,
                    ) =>
                      actualizarCampo(
                        'cedula_propietario',

                        evento.target.value.replace(
                          /\D/g,
                          '',
                        ),
                      )
                    }

                    maxLength={10}
                  />
                </CCol>
              </CRow>
            </>
          )}

          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>
                Marca
              </CFormLabel>

              <CFormInput
                value={form.marca}

                invalid={
                  !!errores.marca
                }

                feedbackInvalid={
                  errores.marca
                }

                onChange={(
                  evento,
                ) =>
                  actualizarCampo(
                    'marca',

                    evento.target.value,
                  )
                }
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>
                Modelo
              </CFormLabel>

              <CFormInput
                value={form.modelo}

                invalid={
                  !!errores.modelo
                }

                feedbackInvalid={
                  errores.modelo
                }

                onChange={(
                  evento,
                ) =>
                  actualizarCampo(
                    'modelo',

                    evento.target.value,
                  )
                }
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>
                Tipo
              </CFormLabel>

              <CFormSelect
                value={form.tipo}

                onChange={(
                  evento,
                ) =>
                  actualizarCampo(
                    'tipo',

                    evento.target.value,
                  )
                }
              >
                <option value="AUTOMOVIL">
                  Automóvil
                </option>

                <option value="CAMIONETA">
                  Camioneta
                </option>

                <option value="SUV">
                  SUV
                </option>

                <option value="MOTOCICLETA">
                  Motocicleta
                </option>
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            {esModoAdmin && (
              <CCol md={4}>
                <CFormLabel>
                  Año
                </CFormLabel>

                <CFormInput
                  type="number"

                  min="1990"

                  max="2035"

                  value={form.anio}

                  invalid={
                    !!errores.anio
                  }

                  feedbackInvalid={
                    errores.anio
                  }

                  onChange={(
                    evento,
                  ) =>
                    actualizarCampo(
                      'anio',

                      evento.target.value,
                    )
                  }
                />
              </CCol>
            )}

            <CCol
              md={
                esModoAdmin
                  ? 8
                  : 12
              }
            >
              <CFormLabel>
                Color
              </CFormLabel>

              <CFormInput
                value={form.color}

                invalid={
                  !!errores.color
                }

                feedbackInvalid={
                  errores.color
                }

                onChange={(
                  evento,
                ) =>
                  actualizarCampo(
                    'color',

                    evento.target.value,
                  )
                }
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>
                Foto del vehículo
              </CFormLabel>

              <CFormInput
                type="url"

                placeholder="https://..."

                value={
                  form.foto_url
                }

                invalid={
                  !!errores.foto_url
                }

                feedbackInvalid={
                  errores.foto_url
                }

                onChange={(
                  evento,
                ) =>
                  actualizarCampo(
                    'foto_url',

                    evento.target.value,
                  )
                }
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>
                Foto del propietario
              </CFormLabel>

              <CFormInput
                type="url"

                placeholder="https://..."

                value={
                  form.foto_propietario_url
                }

                invalid={
                  !!errores.foto_propietario_url
                }

                feedbackInvalid={
                  errores.foto_propietario_url
                }

                onChange={(
                  evento,
                ) =>
                  actualizarCampo(
                    'foto_propietario_url',

                    evento.target.value,
                  )
                }
              />
            </CCol>
          </CRow>

          {esModoAdmin && (
            <>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>
                    Nombre del propietario
                  </CFormLabel>

                  <CFormInput
                    value={
                      form.propietario_nombre
                    }

                    invalid={
                      !!errores.propietario_nombre
                    }

                    feedbackInvalid={
                      errores.propietario_nombre
                    }

                    onChange={(
                      evento,
                    ) =>
                      actualizarCampo(
                        'propietario_nombre',

                        evento.target.value,
                      )
                    }
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>
                    Correo institucional
                  </CFormLabel>

                  <CFormInput
                    type="email"

                    value={
                      form.correo_institucional
                    }

                    invalid={
                      !!errores.correo_institucional
                    }

                    feedbackInvalid={
                      errores.correo_institucional
                    }

                    onChange={(
                      evento,
                    ) =>
                      actualizarCampo(
                        'correo_institucional',

                        evento.target.value,
                      )
                    }
                  />
                </CCol>
              </CRow>

              <div className="border rounded p-3 bg-body-tertiary">
                <CFormCheck
                  id="vehiculo-autorizado"

                  label="Vehículo autorizado para ingresar al parqueadero"

                  checked={
                    Boolean(
                      form.autorizado,
                    )
                  }

                  onChange={(
                    evento,
                  ) =>
                    actualizarCampo(
                      'autorizado',

                      evento.target.checked,
                    )
                  }
                />
              </div>
            </>
          )}
        </CForm>
      </CModalBody>

      <CModalFooter>
        <CButton
          color="secondary"

          variant="outline"

          onClick={onClose}

          disabled={guardando}
        >
          Cancelar
        </CButton>

        <CButton
          color="success"

          onClick={
            manejarGuardar
          }

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
      </CModalFooter>
    </CModal>
  )
}