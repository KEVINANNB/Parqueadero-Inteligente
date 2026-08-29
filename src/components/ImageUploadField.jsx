import {
  useRef,
  useState,
} from 'react'

import {
  CAlert,
  CButton,
  CSpinner,
} from '@coreui/react'

import {
  subirImagen,
} from '../services/imagenesStorage'


export default function ImageUploadField({
  label = 'Fotografía',
  value = '',
  onChange,
  carpeta = 'general',
  disabled = false,
}) {
  const inputRef =
    useRef(null)


  const [
    subiendo,
    setSubiendo,
  ] =
    useState(false)


  const [
    error,
    setError,
  ] =
    useState('')


  const [
    nombreArchivo,
    setNombreArchivo,
  ] =
    useState('')


  const seleccionarArchivo =
    () => {

      if (
        disabled ||
        subiendo
      ) {
        return
      }


      inputRef.current
        ?.click()

    }


  const manejarArchivo =
    async (
      evento,
    ) => {

      const archivo =
        evento
          .target
          .files
          ?.[0]


      if (
        !archivo
      ) {
        return
      }


      setNombreArchivo(
        archivo.name,
      )


      setError('')

      setSubiendo(true)


      const resultado =
        await subirImagen({
          archivo,
          carpeta,
        })


      setSubiendo(false)


      if (
        !resultado.ok
      ) {
        setError(
          resultado.error,
        )

        return
      }


      onChange?.(
        resultado.url,
      )

    }


  return (
    <div>

      <label
        className="form-label"
      >
        {label}
      </label>


      {/* ================================================
          INPUT REAL OCULTO
          ================================================ */}

      <input

        ref={
          inputRef
        }

        type="file"

        accept="image/jpeg,image/png,image/webp"

        style={{
          display:
            'none',
        }}

        disabled={
          disabled ||
          subiendo
        }

        onChange={
          manejarArchivo
        }

      />


      {/* ================================================
          ÁREA DE FOTO
          ================================================ */}

      <div
        style={{
          display:
            'flex',

          flexWrap:
            'wrap',

          alignItems:
            'center',

          gap:
            16,

          padding:
            14,

          border:
            '1px solid #d1d5db',

          borderRadius:
            8,

          background:
            '#f8fafc',
        }}
      >

        {/* PREVIEW */}

        <div
          style={{
            width:
              110,

            height:
              85,

            borderRadius:
              8,

            overflow:
              'hidden',

            background:
              '#e5e7eb',

            display:
              'grid',

            placeItems:
              'center',

            flexShrink:
              0,
          }}
        >

          {value ? (

            <img

              src={
                value
              }

              alt="Vista previa"

              style={{
                width:
                  '100%',

                height:
                  '100%',

                objectFit:
                  'cover',
              }}

            />

          ) : (

            <span
              className="text-body-secondary"
              style={{
                fontSize:
                  11,
              }}
            >
              Sin imagen
            </span>

          )}

        </div>


        {/* CONTROLES */}

        <div
          style={{
            flex:
              '1 1 220px',
          }}
        >

          <CButton

            type="button"

            color="success"

            variant="outline"

            disabled={
              disabled ||
              subiendo
            }

            onClick={
              seleccionarArchivo
            }
          >

            {subiendo ? (

              <>

                <CSpinner
                  size="sm"
                  className="me-2"
                />

                Subiendo...

              </>

            ) : value ? (

              'Cambiar imagen'

            ) : (

              'Seleccionar imagen'

            )}

          </CButton>


          <div
            className="small text-body-secondary mt-2"
          >

            JPG, PNG o WEBP · Máximo 5 MB

          </div>


          {nombreArchivo && (

            <div
              className="small mt-1"
            >
              Archivo:{' '}

              <strong>
                {nombreArchivo}
              </strong>
            </div>

          )}

        </div>

      </div>


      {error && (

        <CAlert
          color="danger"
          className="mt-2 mb-0 py-2"
        >
          {error}
        </CAlert>

      )}

    </div>
  )
}