import {
  useEffect,
  useState,
} from 'react'

import {
  CAlert,
  CButton,
  CCol,
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
  CSpinner,
} from '@coreui/react'

import ImageUploadField
  from './ImageUploadField'


const VACIO = {

  placa:
    '',

  marca:
    '',

  modelo:
    '',

  anio:
    new Date()
      .getFullYear(),

  color:
    '',

  tipo:
    'AUTOMOVIL',

  foto_url:
    '',

}


const PLACA_REGEX =
  /^[A-Z]{3}-\d{4}$/


export default function MiVehiculoFormModal({
  visible,
  onClose,
  onGuardar,
}) {
  const [
    form,
    setForm,
  ] =
    useState(VACIO)


  const [
    errores,
    setErrores,
  ] =
    useState({})


  const [
    errorGeneral,
    setErrorGeneral,
  ] =
    useState('')


  const [
    guardando,
    setGuardando,
  ] =
    useState(false)


  useEffect(
    () => {

      if (
        !visible
      ) {
        return
      }


      setForm({
        ...VACIO,

        anio:
          new Date()
            .getFullYear(),
      })


      setErrores({})

      setErrorGeneral('')

    },
    [
      visible,
    ],
  )


  const actualizar =
    (
      campo,
      valor,
    ) => {

      setForm(
        (
          actual,
        ) => ({
          ...actual,

          [campo]:
            valor,
        }),
      )

    }


  const validar =
    () => {

      const nuevos = {}


      if (
        !PLACA_REGEX.test(
          form.placa,
        )
      ) {
        nuevos.placa =
          'Formato esperado: ABC-1234'
      }


      if (
        !form.marca.trim()
      ) {
        nuevos.marca =
          'Campo requerido'
      }


      if (
        !form.modelo.trim()
      ) {
        nuevos.modelo =
          'Campo requerido'
      }


      const anio =
        Number(
          form.anio,
        )


      if (
        !anio ||
        anio < 1990 ||
        anio > 2035
      ) {
        nuevos.anio =
          'Año inválido'
      }


      if (
        !form.color.trim()
      ) {
        nuevos.color =
          'Campo requerido'
      }


      if (
        !form.foto_url
      ) {
        nuevos.foto_url =
          'Selecciona una fotografía del vehículo.'
      }


      setErrores(
        nuevos,
      )


      return (
        Object.keys(
          nuevos,
        ).length ===
        0
      )

    }


  const guardar =
    async () => {

      setErrorGeneral('')


      if (
        !validar()
      ) {
        return
      }


      setGuardando(true)


      const resultado =
        await onGuardar({

          placa:
            form.placa
              .trim()
              .toUpperCase(),

          marca:
            form.marca
              .trim(),

          modelo:
            form.modelo
              .trim(),

          anio:
            Number(
              form.anio,
            ),

          color:
            form.color
              .trim(),

          tipo:
            form.tipo,

          foto_url:
            form.foto_url,

        })


      setGuardando(false)


      if (
        !resultado.ok
      ) {
        setErrorGeneral(
          resultado.error ||
          'No se pudo registrar el vehículo.',
        )

        return
      }


      onClose()

    }


  return (
    <CModal

      visible={
        visible
      }

      onClose={
        onClose
      }

      backdrop="static"

      alignment="center"

      size="lg"

    >

      <CModalHeader>

        <CModalTitle>
          Registrar mi vehículo
        </CModalTitle>

      </CModalHeader>


      <CModalBody>

        <CAlert color="info">

          El vehículo será registrado
          como{' '}

          <strong>
            Pendiente de autorización
          </strong>

          . Un administrador deberá
          aprobarlo antes de habilitarlo
          para el parqueadero.

        </CAlert>


        {errorGeneral && (

          <CAlert color="danger">
            {errorGeneral}
          </CAlert>

        )}


        <CForm>

          {/* PLACA + AÑO */}

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
                  actualizar(
                    'placa',

                    evento
                      .target
                      .value
                      .toUpperCase(),
                  )
                }

              />

            </CCol>


            <CCol md={6}>

              <CFormLabel>
                Año
              </CFormLabel>


              <CFormInput

                type="number"

                min={1990}

                max={2035}

                value={
                  form.anio
                }

                invalid={
                  !!errores.anio
                }

                feedbackInvalid={
                  errores.anio
                }

                onChange={(
                  evento,
                ) =>
                  actualizar(
                    'anio',

                    evento
                      .target
                      .value,
                  )
                }

              />

            </CCol>

          </CRow>


          {/* MARCA + MODELO */}

          <CRow className="mb-3">

            <CCol md={6}>

              <CFormLabel>
                Marca
              </CFormLabel>


              <CFormInput

                value={
                  form.marca
                }

                invalid={
                  !!errores.marca
                }

                feedbackInvalid={
                  errores.marca
                }

                onChange={(
                  evento,
                ) =>
                  actualizar(
                    'marca',

                    evento
                      .target
                      .value,
                  )
                }

              />

            </CCol>


            <CCol md={6}>

              <CFormLabel>
                Modelo
              </CFormLabel>


              <CFormInput

                value={
                  form.modelo
                }

                invalid={
                  !!errores.modelo
                }

                feedbackInvalid={
                  errores.modelo
                }

                onChange={(
                  evento,
                ) =>
                  actualizar(
                    'modelo',

                    evento
                      .target
                      .value,
                  )
                }

              />

            </CCol>

          </CRow>


          {/* COLOR + TIPO */}

          <CRow className="mb-3">

            <CCol md={6}>

              <CFormLabel>
                Color
              </CFormLabel>


              <CFormInput

                value={
                  form.color
                }

                invalid={
                  !!errores.color
                }

                feedbackInvalid={
                  errores.color
                }

                onChange={(
                  evento,
                ) =>
                  actualizar(
                    'color',

                    evento
                      .target
                      .value,
                  )
                }

              />

            </CCol>


            <CCol md={6}>

              <CFormLabel>
                Tipo
              </CFormLabel>


              <CFormSelect

                value={
                  form.tipo
                }

                onChange={(
                  evento,
                ) =>
                  actualizar(
                    'tipo',

                    evento
                      .target
                      .value,
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


          {/* FOTO */}

          <div className="mb-3">

            <ImageUploadField

              label="Fotografía del vehículo"

              value={
                form.foto_url
              }

              carpeta="vehiculos"

              onChange={(
                url,
              ) =>
                actualizar(
                  'foto_url',
                  url,
                )
              }

            />


            {errores.foto_url && (

              <div
                className="text-danger small mt-1"
              >
                {
                  errores.foto_url
                }
              </div>

            )}

          </div>

        </CForm>

      </CModalBody>


      <CModalFooter>

        <CButton

          color="secondary"

          variant="outline"

          disabled={
            guardando
          }

          onClick={
            onClose
          }
        >
          Cancelar
        </CButton>


        <CButton

          color="success"

          disabled={
            guardando
          }

          onClick={
            guardar
          }
        >

          {guardando ? (

            <>

              <CSpinner
                size="sm"
                className="me-2"
              />

              Registrando...

            </>

          ) : (

            'Registrar vehículo'

          )}

        </CButton>

      </CModalFooter>

    </CModal>
  )
}