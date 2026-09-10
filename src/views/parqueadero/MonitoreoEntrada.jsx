import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  Navigate,
} from 'react-router-dom'

import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
} from '@coreui/react'

import CIcon
  from '@coreui/icons-react'

import {
  cilCamera,
  cilCarAlt,
  cilCheckCircle,
  cilFolderOpen,
  cilMediaStop,
  cilReload,
  cilSearch,
  cilUser,
  cilWarning,
  cilXCircle,
} from '@coreui/icons'

import {
  useAuth,
} from '../../context/AuthContext'

import {
  detectarPlaca,
} from '../../services/ocr'


/* ================================================================
   CONFIGURACIÓN
   ================================================================ */

const TAMANO_MAXIMO =
  4 * 1024 * 1024


const TIPOS_PERMITIDOS = [
  'image/jpeg',
  'image/png',
]


const TIMEOUT_OCR_MS =
  60000


/* ================================================================
   UTILIDAD
   ================================================================ */

function primeroValido(
  ...valores
) {
  return valores.find(
    (
      valor,
    ) =>
      valor !== undefined &&
      valor !== null &&
      valor !== '',
  ) ?? null
}


/* ================================================================
   NORMALIZAR PLACA
   ================================================================ */

function obtenerPlaca(
  resultado,
) {
  return primeroValido(

    resultado?.placa,

    resultado?.placa_detectada,

    resultado?.ocr?.placa,

    resultado?.vehiculo?.placa,

  )
}


/* ================================================================
   CONFIANZA
   ================================================================ */

function obtenerConfianzaNumerica(
  resultado,
) {
  const valor =
    primeroValido(

      resultado?.confianza,

      resultado?.confianza_ocr,

      resultado?.ocr?.confianza,

      resultado?.confidence,

    )


  if (
    valor === null
  ) {
    return null
  }


  const numero =
    Number(
      valor,
    )


  if (
    !Number.isFinite(
      numero,
    )
  ) {
    return null
  }


  return numero <= 1
    ? numero * 100
    : numero
}


function formatearConfianza(
  resultado,
) {
  const numero =
    obtenerConfianzaNumerica(
      resultado,
    )


  if (
    numero === null
  ) {
    return '—'
  }


  return (
    `${numero.toFixed(1)} %`
  )
}


/* ================================================================
   IMAGEN MARCADA
   ================================================================ */

function construirImagenMarcada(
  resultado,
) {
  const base64 =
    resultado
      ?.imagen_marcada
      ?.base64


  if (
    !base64
  ) {
    return ''
  }


  const mime =
    resultado
      ?.imagen_marcada
      ?.mime_type

    ||

    'image/jpeg'


  return (
    `data:${mime};base64,${base64}`
  )
}


/* ================================================================
   NORMALIZAR VEHÍCULO

   Se utilizan únicamente valores realmente
   presentes en la respuesta del endpoint.

   El objeto vehiculo puede venir anidado
   dentro de resultado.vehiculo.
   ================================================================ */

function obtenerVehiculo(
  resultado,
) {
  if (
    !resultado ||
    resultado?.vehiculo_encontrado !== true
  ) {
    return null
  }


  const fuente =
    resultado?.vehiculo &&
    typeof resultado.vehiculo === 'object'
      ? resultado.vehiculo
      : resultado


  return {

    placa:
      primeroValido(
        fuente?.placa,
        resultado?.placa,
        resultado?.placa_detectada,
      ),


    marca:
      primeroValido(
        fuente?.marca,
      ),


    modelo:
      primeroValido(
        fuente?.modelo,
      ),


    anio:
      primeroValido(
        fuente?.anio,
        fuente?.año,
      ),


    color:
      primeroValido(
        fuente?.color,
      ),


    tipo:
      primeroValido(
        fuente?.tipo,
        fuente?.tipo_vehiculo,
      ),


    foto_url:
      primeroValido(
        fuente?.foto_url,
        fuente?.foto_vehiculo_url,
        fuente?.fotografia_vehiculo,
      ),


    foto_propietario_url:
      primeroValido(
        fuente?.foto_propietario_url,
        fuente?.fotografia_propietario,
      ),


    propietario_nombre:
      primeroValido(
        fuente?.propietario_nombre,
        fuente?.propietario,
        fuente?.nombre_propietario,
      ),


    cedula_enmascarada:
      primeroValido(
        fuente?.cedula_enmascarada,
        fuente?.cedula,
      ),


    autorizado:
      primeroValido(
        fuente?.autorizado,
        fuente?.autorizacion,
      ),

  }
}


/* ================================================================
   AUTORIZACIÓN
   ================================================================ */

function estaAutorizado(
  valor,
) {
  if (
    valor === true
  ) {
    return true
  }


  if (
    valor === false
  ) {
    return false
  }


  const texto =
    String(
      valor ?? '',
    )
      .trim()
      .toLowerCase()


  return [
    'true',
    '1',
    'si',
    'sí',
    'autorizado',
    'activo',
  ].includes(
    texto,
  )
}


/* ================================================================
   FOTO FALLBACK
   ================================================================ */

function FotoVehiculo({
  src,
  marca,
  modelo,
}) {
  const [
    errorImagen,
    setErrorImagen,
  ] =
    useState(false)


  useEffect(
    () => {
      setErrorImagen(false)
    },
    [
      src,
    ],
  )


  if (
    !src ||
    errorImagen
  ) {
    return (

      <div className="ocr-sin-foto">

        <CIcon
          icon={cilCarAlt}
          size="3xl"
        />

        <span>
          Sin fotografía
        </span>

      </div>

    )
  }


  return (

    <img
      src={src}
      alt={
        `${marca || 'Vehículo'} ${
          modelo || ''
        }`
      }
      className="ocr-foto-vehiculo"
      onError={
        () =>
          setErrorImagen(true)
      }
    />

  )
}


/* ================================================================
   FOTO PROPIETARIO
   ================================================================ */

function FotoPropietario({
  src,
  nombre,
}) {
  const [
    errorImagen,
    setErrorImagen,
  ] =
    useState(false)


  useEffect(
    () => {
      setErrorImagen(false)
    },
    [
      src,
    ],
  )


  const iniciales =
    String(
      nombre ||
      'Usuario',
    )
      .trim()
      .split(
        /\s+/,
      )
      .filter(
        Boolean,
      )
      .slice(
        0,
        2,
      )
      .map(
        (
          palabra,
        ) =>
          palabra
            .charAt(0)
            .toUpperCase(),
      )
      .join('')


  if (
    !src ||
    errorImagen
  ) {
    return (

      <div className="ocr-avatar-fallback">
        {iniciales || 'U'}
      </div>

    )
  }


  return (

    <img
      src={src}
      alt={
        `Fotografía de ${
          nombre ||
          'propietario'
        }`
      }
      className="ocr-foto-propietario"
      onError={
        () =>
          setErrorImagen(true)
      }
    />

  )
}


/* ================================================================
   COMPONENTE PRINCIPAL
   ================================================================ */

export default function MonitoreoEntrada() {
  const {
    puedeAdministrar,
  } =
    useAuth()


  /* ==============================================================
     REFERENCIAS
     ============================================================== */

  const videoRef =
    useRef(null)


  const canvasRef =
    useRef(null)


  const inputArchivoRef =
    useRef(null)


  const streamRef =
    useRef(null)


  const urlTemporalRef =
    useRef(null)


  const abortControllerRef =
    useRef(null)


  /* ==============================================================
     ESTADOS CÁMARA
     ============================================================== */

  const [
    camaraActiva,
    setCamaraActiva,
  ] =
    useState(false)


  const [
    iniciandoCamara,
    setIniciandoCamara,
  ] =
    useState(false)


  const [
    imagen,
    setImagen,
  ] =
    useState(null)


  const [
    vistaPrevia,
    setVistaPrevia,
  ] =
    useState('')


  const [
    nombreImagen,
    setNombreImagen,
  ] =
    useState('')


  const [
    origenImagen,
    setOrigenImagen,
  ] =
    useState('')


  /* ==============================================================
     OCR
     ============================================================== */

  const [
    procesando,
    setProcesando,
  ] =
    useState(false)


  const [
    resultado,
    setResultado,
  ] =
    useState(null)


  /* ==============================================================
     MENSAJES
     ============================================================== */

  const [
    error,
    setError,
  ] =
    useState('')


  const [
    mensaje,
    setMensaje,
  ] =
    useState('')


  /* ==============================================================
     DATOS CALCULADOS
     ============================================================== */

  const estado =
    resultado?.estado ||
    null


  const placa =
    useMemo(
      () =>
        obtenerPlaca(
          resultado,
        ),
      [
        resultado,
      ],
    )


  const confianza =
    useMemo(
      () =>
        formatearConfianza(
          resultado,
        ),
      [
        resultado,
      ],
    )


  const imagenMarcada =
    useMemo(
      () =>
        construirImagenMarcada(
          resultado,
        ),
      [
        resultado,
      ],
    )


  const vehiculo =
    useMemo(
      () =>
        obtenerVehiculo(
          resultado,
        ),
      [
        resultado,
      ],
    )


  const autorizado =
    vehiculo
      ? estaAutorizado(
          vehiculo.autorizado,
        )
      : false


  /* ==============================================================
     URL TEMPORAL
     ============================================================== */

  const liberarUrlTemporal =
    () => {

      if (
        urlTemporalRef.current
      ) {

        URL.revokeObjectURL(
          urlTemporalRef.current,
        )


        urlTemporalRef.current =
          null

      }

    }


  /* ==============================================================
     DETENER CÁMARA
     ============================================================== */

  const detenerCamara =
    () => {

      const stream =
        streamRef.current


      if (
        stream
      ) {

        stream
          .getTracks()
          .forEach(
            (
              track,
            ) => {

              track.stop()

            },
          )

      }


      streamRef.current =
        null


      if (
        videoRef.current
      ) {

        videoRef.current.srcObject =
          null

      }


      setCamaraActiva(
        false,
      )

    }


  /* ==============================================================
     CONECTAR VIDEO
     ============================================================== */

  useEffect(
    () => {

      if (
        !camaraActiva
      ) {
        return undefined
      }


      const video =
        videoRef.current


      const stream =
        streamRef.current


      if (
        !video ||
        !stream
      ) {
        return undefined
      }


      video.srcObject =
        stream


      const reproducir =
        async () => {

          try {

            await video.play()

          } catch (
            err
          ) {

            console.error(
              'Error reproduciendo cámara:',
              err,
            )


            setError(
              'La cámara fue activada, pero no fue posible mostrar la imagen.',
            )

          }

        }


      reproducir()


      return () => {

        if (
          video.srcObject ===
          stream
        ) {

          video.srcObject =
            null

        }

      }

    },
    [
      camaraActiva,
    ],
  )


  /* ==============================================================
     LIMPIEZA
     ============================================================== */

  useEffect(
    () => {

      return () => {

        if (
          abortControllerRef.current
        ) {

          abortControllerRef
            .current
            .abort()

        }


        const stream =
          streamRef.current


        if (
          stream
        ) {

          stream
            .getTracks()
            .forEach(
              (
                track,
              ) => {

                track.stop()

              },
            )

        }


        if (
          urlTemporalRef.current
        ) {

          URL.revokeObjectURL(
            urlTemporalRef.current,
          )

        }

      }

    },
    [],
  )


  /* ==============================================================
     LIMPIAR RESULTADO
     ============================================================== */

  const limpiarResultado =
    () => {

      setResultado(
        null,
      )


      setError(
        '',
      )

    }


  /* ==============================================================
     ESTABLECER IMAGEN
     ============================================================== */

  const establecerImagen =
    (
      archivo,
      origen,
      nombre,
    ) => {

      liberarUrlTemporal()


      limpiarResultado()


      const nuevaUrl =
        URL.createObjectURL(
          archivo,
        )


      urlTemporalRef.current =
        nuevaUrl


      setImagen(
        archivo,
      )


      setVistaPrevia(
        nuevaUrl,
      )


      setOrigenImagen(
        origen,
      )


      setNombreImagen(
        nombre,
      )


      setError(
        '',
      )

    }


  /* ==============================================================
     ACTIVAR CÁMARA
     ============================================================== */

  const activarCamara =
    async () => {

      limpiarResultado()


      setMensaje(
        '',
      )


      setIniciandoCamara(
        true,
      )


      try {

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {

          throw new Error(
            'Tu navegador no permite acceder a la cámara.',
          )

        }


        detenerCamara()


        const stream =
          await navigator
            .mediaDevices
            .getUserMedia({

              audio:
                false,

              video: {

                facingMode: {
                  ideal:
                    'environment',
                },

                width: {
                  ideal:
                    1280,
                },

                height: {
                  ideal:
                    720,
                },

              },

            })


        streamRef.current =
          stream


        setCamaraActiva(
          true,
        )


        setMensaje(
          'Cámara activada correctamente.',
        )

      } catch (
        err
      ) {

        console.error(
          'Error cámara:',
          err,
        )


        let texto =
          'No fue posible iniciar la cámara.'


        if (
          err?.name ===
          'NotAllowedError'
        ) {

          texto =
            'El navegador no tiene permiso para utilizar la cámara.'

        } else if (
          err?.name ===
          'NotFoundError'
        ) {

          texto =
            'No se encontró ninguna cámara disponible.'

        } else if (
          err?.name ===
          'NotReadableError'
        ) {

          texto =
            'La cámara está siendo utilizada por otra aplicación.'

        } else if (
          err?.message
        ) {

          texto =
            err.message

        }


        setError(
          texto,
        )


        setCamaraActiva(
          false,
        )

      } finally {

        setIniciandoCamara(
          false,
        )

      }

    }


  /* ==============================================================
     CAPTURAR FOTO
     ============================================================== */

  const capturarFoto =
    async () => {

      limpiarResultado()


      setMensaje(
        '',
      )


      const video =
        videoRef.current


      const canvas =
        canvasRef.current


      if (
        !video ||
        !canvas ||
        !video.videoWidth ||
        !video.videoHeight
      ) {

        setError(
          'La cámara todavía no está preparada.',
        )

        return

      }


      try {

        canvas.width =
          video.videoWidth


        canvas.height =
          video.videoHeight


        const contexto =
          canvas.getContext(
            '2d',
          )


        if (
          !contexto
        ) {

          throw new Error(
            'No fue posible preparar la captura.',
          )

        }


        contexto.drawImage(
          video,
          0,
          0,
          canvas.width,
          canvas.height,
        )


        const blob =
          await new Promise(
            (
              resolve,
              reject,
            ) => {

              canvas.toBlob(

                (
                  resultadoBlob,
                ) => {

                  if (
                    resultadoBlob
                  ) {

                    resolve(
                      resultadoBlob,
                    )

                  } else {

                    reject(
                      new Error(
                        'No fue posible generar la fotografía.',
                      ),
                    )

                  }

                },

                'image/jpeg',

                0.92,

              )

            },
          )


        if (
          blob.size >
          TAMANO_MAXIMO
        ) {

          setError(
            'La fotografía supera el máximo permitido de 4 MiB.',
          )

          return

        }


        detenerCamara()


        establecerImagen(

          blob,

          'camara',

          `captura-vehiculo-${Date.now()}.jpg`,

        )


        setMensaje(
          'Fotografía capturada correctamente.',
        )

      } catch (
        err
      ) {

        setError(
          err?.message ||
          'No fue posible capturar la fotografía.',
        )

      }

    }


  /* ==============================================================
     ABRIR SELECTOR
     ============================================================== */

  const abrirSelector =
    () => {

      setError(
        '',
      )


      setMensaje(
        '',
      )


      inputArchivoRef
        .current
        ?.click()

    }


  /* ==============================================================
     SELECCIONAR IMAGEN
     ============================================================== */

  const seleccionarImagen =
    (
      evento,
    ) => {

      limpiarResultado()


      setMensaje(
        '',
      )


      const archivo =
        evento
          .target
          .files?.[0]


      if (
        !archivo
      ) {
        return
      }


      if (
        !TIPOS_PERMITIDOS.includes(
          archivo.type,
        )
      ) {

        setError(
          'Formato no permitido. Utiliza JPG, JPEG o PNG.',
        )


        evento.target.value =
          ''

        return

      }


      if (
        archivo.size >
        TAMANO_MAXIMO
      ) {

        setError(
          'La imagen supera el tamaño máximo permitido de 4 MiB.',
        )


        evento.target.value =
          ''

        return

      }


      detenerCamara()


      establecerImagen(

        archivo,

        'archivo',

        archivo.name,

      )


      setMensaje(
        'Imagen seleccionada correctamente.',
      )


      evento.target.value =
        ''

    }


  /* ==============================================================
     DESCARTAR IMAGEN
     ============================================================== */

  const descartarImagen =
    () => {

      liberarUrlTemporal()


      limpiarResultado()


      setImagen(
        null,
      )


      setVistaPrevia(
        '',
      )


      setNombreImagen(
        '',
      )


      setOrigenImagen(
        '',
      )


      setMensaje(
        '',
      )

    }


  /* ==============================================================
     NUEVA CAPTURA
     ============================================================== */

  const nuevaCaptura =
    () => {

      descartarImagen()


      setTimeout(
        activarCamara,
        50,
      )

    }


  /* ==============================================================
     PROCESAR OCR
     ============================================================== */

  const procesarImagen =
    async () => {

      if (
        !imagen ||
        procesando
      ) {
        return
      }


      setProcesando(
        true,
      )


      setResultado(
        null,
      )


      setError(
        '',
      )


      setMensaje(
        '',
      )


      const controller =
        new AbortController()


      abortControllerRef.current =
        controller


      const timeout =
        setTimeout(
          () => {

            controller.abort()

          },
          TIMEOUT_OCR_MS,
        )


      try {

        const respuesta =
          await detectarPlaca(

            imagen,

            {
              signal:
                controller.signal,
            },

          )


        console.log(
          'Respuesta OCR:',
          respuesta,
        )


        setResultado(
          respuesta,
        )

      } catch (
        err
      ) {

        console.error(
          'Error OCR:',
          err,
        )


        if (
          err?.name ===
          'AbortError'
        ) {

          setError(
            'El reconocimiento tardó demasiado tiempo. Intenta nuevamente.',
          )

        } else {

          setError(
            err?.message ||
            'No fue posible procesar la imagen.',
          )

        }

      } finally {

        clearTimeout(
          timeout,
        )


        abortControllerRef.current =
          null


        setProcesando(
          false,
        )

      }

    }


  /* ==============================================================
     FORMATEAR TAMAÑO
     ============================================================== */

  const obtenerTamano =
    () => {

      if (
        !imagen?.size
      ) {
        return ''
      }


      const kb =
        imagen.size /
        1024


      if (
        kb <
        1024
      ) {

        return (
          `${kb.toFixed(1)} KB`
        )

      }


      return (
        `${(
          kb /
          1024
        ).toFixed(2)} MB`
      )

    }


  /* ==============================================================
     COLOR DEL ESTADO
     ============================================================== */

  const obtenerColorEstado =
    () => {

      switch (
        estado
      ) {

        case 'encontrado':
          return 'success'


        case 'no_registrado':
          return 'danger'


        case 'sin_placa':
        case 'baja_confianza':
        case 'multiples_placas':
          return 'warning'


        default:
          return 'secondary'

      }

    }


  /* ==============================================================
     ICONO RESULTADO
     ============================================================== */

  const obtenerIconoEstado =
    () => {

      switch (
        estado
      ) {

        case 'encontrado':
          return cilCheckCircle


        case 'no_registrado':
          return cilXCircle


        case 'sin_placa':
        case 'baja_confianza':
        case 'multiples_placas':
          return cilWarning


        default:
          return cilSearch

      }

    }


  /* ==============================================================
     TÍTULO
     ============================================================== */

  const obtenerTituloEstado =
    () => {

      switch (
        estado
      ) {

        case 'encontrado':
          return 'Vehículo registrado'


        case 'no_registrado':
          return 'Vehículo no registrado'


        case 'sin_placa':
          return 'No se detectó una placa'


        case 'baja_confianza':
          return 'Baja confianza'


        case 'multiples_placas':
          return 'Varias placas detectadas'


        default:
          return 'Resultado recibido'

      }

    }


  /* ==============================================================
     DESCRIPCIÓN
     ============================================================== */

  const obtenerDescripcionEstado =
    () => {

      switch (
        estado
      ) {

        case 'encontrado':

          return autorizado
            ? 'El vehículo se encuentra registrado y autorizado para ingresar.'
            : 'El vehículo se encuentra registrado, pero actualmente no está autorizado para ingresar.'


        case 'no_registrado':

          return (
            'La placa fue reconocida, pero no existe un vehículo registrado asociado.'
          )


        case 'sin_placa':

          return (
            'No fue posible localizar una placa en la fotografía. Captura una nueva imagen.'
          )


        case 'baja_confianza':

          return (
            'La lectura obtenida no posee suficiente confianza. Intenta tomar una fotografía más clara.'
          )


        case 'multiples_placas':

          return (
            'La imagen contiene varias placas. Utiliza una fotografía donde aparezca un solo vehículo.'
          )


        default:

          return (
            'El servicio devolvió una respuesta que no corresponde a uno de los estados conocidos.'
          )

      }

    }


  /* ==============================================================
     SEGURIDAD
     ============================================================== */

  if (
    !puedeAdministrar
  ) {

    return (
      <Navigate
        to="/parqueadero/vehiculos"
        replace
      />
    )

  }


  /* ==============================================================
     RENDER
     ============================================================== */

  return (
    <>

      <style>{`

        /* =====================================================
           BASE
           ===================================================== */

        .monitoreo-entrada {
          width: 100%;
        }


        .monitoreo-entrada-encabezado {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 18px;
        }


        .monitoreo-entrada-kicker {
          margin-bottom: 4px;
          color: #159447;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .06em;
        }


        .monitoreo-entrada-titulo {
          margin: 0;
          color: #172033;
          font-size: 27px;
          font-weight: 700;
        }


        .monitoreo-entrada-descripcion {
          max-width: 720px;
          margin-top: 7px;
          margin-bottom: 0;
          color: #687386;
          font-size: 13px;
          line-height: 1.5;
        }


        /* =====================================================
           COLUMNAS
           ===================================================== */

        .monitoreo-entrada-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.02fr)
            minmax(0, .98fr);
          gap: 18px;
          align-items: start;
        }


        .monitoreo-entrada-card {
          overflow: hidden;
          border: 1px solid #dfe5eb;
          box-shadow:
            0 4px 14px
            rgba(15, 23, 42, .05);
        }


        .monitoreo-entrada-card .card-header {
          padding: 13px 16px;
          background: #f7f9fb;
          border-bottom: 1px solid #dfe5eb;
        }


        .monitoreo-entrada-card-titulo {
          margin: 0;
          color: #172033;
          font-size: 14px;
          font-weight: 700;
        }


        .monitoreo-entrada-card-subtitulo {
          margin-top: 3px;
          color: #7a8594;
          font-size: 11px;
        }


        /* =====================================================
           VISOR
           ===================================================== */

        .monitoreo-camara-marco {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          min-height: 305px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 1px solid #d6dee5;
          border-radius: 10px;
          background: #111827;
        }


        .monitoreo-video,
        .monitoreo-preview {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #111827;
        }


        .monitoreo-camara-placeholder {
          max-width: 340px;
          padding: 25px;
          color: #ffffff;
          text-align: center;
        }


        .monitoreo-camara-icono {
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          margin: 0 auto 14px;
          border-radius: 50%;
          background: rgba(34,197,94,.16);
          color: #4ade80;
        }


        .monitoreo-camara-icono svg {
          width: 29px;
          height: 29px;
        }


        .monitoreo-camara-placeholder h4 {
          margin-bottom: 7px;
          color: white;
          font-size: 17px;
        }


        .monitoreo-camara-placeholder p {
          margin: 0;
          color: #cbd5e1;
          font-size: 12px;
          line-height: 1.5;
        }


        .monitoreo-live-badge {
          position: absolute;
          z-index: 5;
          top: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(17,24,39,.82);
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
        }


        .monitoreo-live-punto {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
        }


        /* =====================================================
           ARCHIVO
           ===================================================== */

        .monitoreo-archivo {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          padding: 10px 12px;
          border: 1px solid #dfe5eb;
          border-radius: 8px;
          background: #f8fafc;
        }


        .monitoreo-archivo-nombre {
          display: block;
          max-width: 390px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #172033;
          font-size: 11px;
          font-weight: 700;
        }


        .monitoreo-archivo-meta {
          display: block;
          margin-top: 3px;
          color: #7a8594;
          font-size: 10px;
        }


        /* =====================================================
           BOTONES
           ===================================================== */

        .monitoreo-controles {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 10px;
          margin-top: 14px;
        }


        .monitoreo-separador {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0 12px;
          color: #94a3b8;
          font-size: 10px;
        }


        .monitoreo-separador::before,
        .monitoreo-separador::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }


        /* =====================================================
           ESPERA
           ===================================================== */

        .resultado-espera {
          min-height: 470px;
          display: grid;
          place-items: center;
          padding: 30px;
          text-align: center;
        }


        .resultado-espera-icono {
          width: 70px;
          height: 70px;
          display: grid;
          place-items: center;
          margin: 0 auto 15px;
          border-radius: 50%;
          background: #eef2f6;
          color: #718096;
        }


        .resultado-espera h4 {
          color: #172033;
          font-size: 18px;
        }


        .resultado-espera p {
          max-width: 360px;
          color: #718096;
          font-size: 12px;
          line-height: 1.55;
        }


        /* =====================================================
           PROCESANDO
           ===================================================== */

        .ocr-procesando {
          min-height: 470px;
          display: grid;
          place-items: center;
          padding: 30px;
          text-align: center;
        }


        /* =====================================================
           RESULTADO
           ===================================================== */

        .ocr-resultado-superior {
          padding: 16px;
          margin-bottom: 14px;
          border: 1px solid #e0e6eb;
          border-radius: 10px;
          background: #fafbfc;
        }


        .ocr-estado-linea {
          display: flex;
          align-items: center;
          gap: 12px;
        }


        .ocr-estado-icono {
          width: 44px;
          height: 44px;
          min-width: 44px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #eef2f6;
        }


        .ocr-resultado-superior h3 {
          margin: 5px 0 3px;
          color: #172033;
          font-size: 19px;
        }


        .ocr-resultado-superior p {
          margin: 0;
          color: #697586;
          font-size: 11px;
          line-height: 1.5;
        }


        /* =====================================================
           PLACA PRINCIPAL
           ===================================================== */

        .ocr-placa-principal {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }


        .ocr-placa-box {
          padding: 14px;
          border: 1px solid #dfe5eb;
          border-radius: 10px;
          background: white;
        }


        .ocr-label {
          display: block;
          margin-bottom: 5px;
          color: #7a8594;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .05em;
        }


        .ocr-placa-valor {
          color: #172033;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: .05em;
        }


        .ocr-confianza-valor {
          color: #159447;
          font-size: 23px;
          font-weight: 800;
        }


        /* =====================================================
           IMAGEN MARCADA
           ===================================================== */

        .ocr-imagen-marcada-contenedor {
          overflow: hidden;
          margin-bottom: 14px;
          border: 1px solid #dfe5eb;
          border-radius: 10px;
          background: #111827;
        }


        .ocr-imagen-marcada-cabecera {
          padding: 9px 12px;
          background: #f7f9fb;
          color: #172033;
          font-size: 11px;
          font-weight: 700;
          border-bottom: 1px solid #dfe5eb;
        }


        .ocr-imagen-marcada {
          display: block;
          width: 100%;
          max-height: 310px;
          object-fit: contain;
          background: #111827;
        }


        /* =====================================================
           VEHÍCULO
           ===================================================== */

        .ocr-seccion {
          overflow: hidden;
          margin-top: 14px;
          border: 1px solid #dfe5eb;
          border-radius: 10px;
          background: #ffffff;
        }


        .ocr-seccion-titulo {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 13px;
          background: #f7f9fb;
          border-bottom: 1px solid #dfe5eb;
          color: #172033;
          font-size: 11px;
          font-weight: 800;
        }


        .ocr-vehiculo-contenido {
          display: grid;
          grid-template-columns:
            145px minmax(0,1fr);
          gap: 14px;
          padding: 13px;
        }


        .ocr-foto-vehiculo,
        .ocr-sin-foto {
          width: 145px;
          height: 105px;
          border-radius: 9px;
        }


        .ocr-foto-vehiculo {
          object-fit: cover;
          border: 1px solid #e2e8f0;
        }


        .ocr-sin-foto {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 7px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 10px;
        }


        .ocr-datos-grid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );
          gap: 8px;
        }


        .ocr-dato {
          padding: 9px 10px;
          border: 1px solid #e5e9ed;
          border-radius: 7px;
          background: #fafbfc;
        }


        .ocr-dato-valor {
          color: #172033;
          font-size: 12px;
          font-weight: 700;
        }


        /* =====================================================
           PROPIETARIO
           ===================================================== */

        .ocr-propietario-contenido {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
        }


        .ocr-foto-propietario,
        .ocr-avatar-fallback {
          width: 68px;
          height: 68px;
          min-width: 68px;
          border-radius: 50%;
        }


        .ocr-foto-propietario {
          object-fit: cover;
          border: 2px solid #d1e7dd;
        }


        .ocr-avatar-fallback {
          display: grid;
          place-items: center;
          background: #e8f5ed;
          color: #087b26;
          border: 2px solid #d1e7dd;
          font-weight: 800;
          font-size: 19px;
        }


        .ocr-propietario-nombre {
          margin-bottom: 5px;
          color: #172033;
          font-size: 14px;
          font-weight: 800;
        }


        .ocr-propietario-cedula {
          color: #697586;
          font-size: 11px;
        }


        /* =====================================================
           AUTORIZACIÓN
           ===================================================== */

        .ocr-autorizacion {
          margin-top: 14px;
          padding: 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
        }


        .ocr-autorizacion-ok {
          background: #dff5e7;
          border: 1px solid #a7e4bb;
          color: #106b32;
        }


        .ocr-autorizacion-no {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #a71919;
        }


        /* =====================================================
           NO REGISTRADO
           ===================================================== */

        .ocr-no-registrado {
          padding: 25px 18px;
          text-align: center;
        }


        .ocr-no-registrado-icono {
          width: 70px;
          height: 70px;
          display: grid;
          place-items: center;
          margin: 0 auto 14px;
          border-radius: 50%;
          background: #fee2e2;
          color: #dc2626;
        }


        .ocr-no-registrado h3 {
          margin-bottom: 8px;
          color: #b91c1c;
          font-size: 20px;
        }


        .ocr-no-registrado p {
          color: #697586;
          font-size: 12px;
          line-height: 1.5;
        }


        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (
          max-width: 1000px
        ) {

          .monitoreo-entrada-grid {
            grid-template-columns: 1fr;
          }

        }


        @media (
          max-width: 600px
        ) {

          .monitoreo-entrada-encabezado {
            flex-direction: column;
          }


          .monitoreo-controles,
          .ocr-placa-principal,
          .ocr-datos-grid {
            grid-template-columns: 1fr;
          }


          .ocr-vehiculo-contenido {
            grid-template-columns: 1fr;
          }


          .ocr-foto-vehiculo,
          .ocr-sin-foto {
            width: 100%;
            height: 190px;
          }


          .monitoreo-camara-marco {
            min-height: 220px;
          }

        }

      `}</style>


      <div className="monitoreo-entrada">

        {/* =====================================================
            ENCABEZADO
            ===================================================== */}

        <div className="monitoreo-entrada-encabezado">

          <div>

            <div className="monitoreo-entrada-kicker">
              CONTROL DE ACCESO
            </div>


            <h2 className="monitoreo-entrada-titulo">
              Monitoreo de entrada
            </h2>


            <p className="monitoreo-entrada-descripcion">

              Captura o selecciona una fotografía del
              vehículo para reconocer automáticamente
              su placa y comprobar su registro y
              autorización en Smart Parking UTEQ.

            </p>

          </div>


          <CBadge
            color="warning"
            textColor="dark"
            className="px-3 py-2"
          >
            Administrador
          </CBadge>

        </div>


        {/* =====================================================
            MENSAJES
            ===================================================== */}

        {error && (

          <CAlert color="danger">

            <strong>
              No se pudo completar el reconocimiento.
            </strong>


            <div className="mt-1">
              {error}
            </div>


            {imagen && (

              <CButton
                color="danger"
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={procesando}
                onClick={procesarImagen}
              >
                Reintentar
              </CButton>

            )}

          </CAlert>

        )}


        {mensaje && (

          <CAlert
            color="success"
            dismissible
            onClose={
              () =>
                setMensaje('')
            }
          >
            {mensaje}
          </CAlert>

        )}


        <div className="monitoreo-entrada-grid">

          {/* ===================================================
              IZQUIERDA
              =================================================== */}

          <CCard className="monitoreo-entrada-card">

            <CCardHeader>

              <h3 className="monitoreo-entrada-card-titulo">
                Captura del vehículo
              </h3>


              <div className="monitoreo-entrada-card-subtitulo">
                Cámara en tiempo real o imagen JPG/PNG.
              </div>

            </CCardHeader>


            <CCardBody>

              <div className="monitoreo-camara-marco">

                {vistaPrevia ? (

                  <img
                    src={vistaPrevia}
                    alt="Vehículo seleccionado"
                    className="monitoreo-preview"
                  />

                ) : camaraActiva ? (

                  <>

                    <video
                      ref={videoRef}
                      className="monitoreo-video"
                      autoPlay
                      playsInline
                      muted
                    />


                    <div className="monitoreo-live-badge">

                      <span className="monitoreo-live-punto" />

                      CÁMARA EN VIVO

                    </div>

                  </>

                ) : (

                  <div className="monitoreo-camara-placeholder">

                    <div className="monitoreo-camara-icono">

                      <CIcon
                        icon={cilCamera}
                      />

                    </div>


                    <h4>
                      Cámara desactivada
                    </h4>


                    <p>

                      Activa la cámara o selecciona
                      una fotografía almacenada.

                    </p>

                  </div>

                )}

              </div>


              <canvas
                ref={canvasRef}
                style={{
                  display: 'none',
                }}
              />


              <input
                ref={inputArchivoRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={seleccionarImagen}
                style={{
                  display: 'none',
                }}
              />


              {imagen && (

                <div className="monitoreo-archivo">

                  <div>

                    <span className="monitoreo-archivo-nombre">
                      {nombreImagen}
                    </span>


                    <span className="monitoreo-archivo-meta">

                      {
                        origenImagen ===
                        'camara'
                          ? 'Fotografía capturada'
                          : 'Imagen seleccionada'
                      }

                      {' · '}

                      {obtenerTamano()}

                    </span>

                  </div>


                  <CButton
                    color="danger"
                    variant="ghost"
                    size="sm"
                    disabled={procesando}
                    onClick={descartarImagen}
                  >
                    Descartar
                  </CButton>

                </div>

              )}


              {!camaraActiva &&
              !vistaPrevia && (

                <div className="monitoreo-controles">

                  <CButton
                    color="success"
                    disabled={iniciandoCamara}
                    onClick={activarCamara}
                  >

                    {iniciandoCamara ? (

                      <>
                        <CSpinner
                          size="sm"
                          className="me-2"
                        />

                        Iniciando...
                      </>

                    ) : (

                      <>
                        <CIcon
                          icon={cilCamera}
                          className="me-2"
                        />

                        Activar cámara
                      </>

                    )}

                  </CButton>


                  <CButton
                    color="secondary"
                    variant="outline"
                    onClick={abrirSelector}
                  >

                    <CIcon
                      icon={cilFolderOpen}
                      className="me-2"
                    />

                    Seleccionar imagen
                  </CButton>

                </div>

              )}


              {camaraActiva &&
              !vistaPrevia && (

                <div className="monitoreo-controles">

                  <CButton
                    color="success"
                    onClick={capturarFoto}
                  >

                    <CIcon
                      icon={cilCamera}
                      className="me-2"
                    />

                    Capturar foto
                  </CButton>


                  <CButton
                    color="danger"
                    variant="outline"
                    onClick={detenerCamara}
                  >

                    <CIcon
                      icon={cilMediaStop}
                      className="me-2"
                    />

                    Detener cámara
                  </CButton>

                </div>

              )}


              {vistaPrevia && (

                <>

                  <div className="monitoreo-separador">
                    acciones
                  </div>


                  <div className="monitoreo-controles">

                    <CButton
                      color="secondary"
                      variant="outline"
                      disabled={procesando}
                      onClick={nuevaCaptura}
                    >

                      <CIcon
                        icon={cilCamera}
                        className="me-2"
                      />

                      Nueva captura
                    </CButton>


                    <CButton
                      color="secondary"
                      variant="outline"
                      disabled={procesando}
                      onClick={abrirSelector}
                    >

                      <CIcon
                        icon={cilFolderOpen}
                        className="me-2"
                      />

                      Otra imagen
                    </CButton>

                  </div>


                  <CButton
                    color="success"
                    className="w-100 mt-2"
                    disabled={
                      !imagen ||
                      procesando
                    }
                    onClick={procesarImagen}
                  >

                    {procesando ? (

                      <>
                        <CSpinner
                          size="sm"
                          className="me-2"
                        />

                        Analizando imagen...
                      </>

                    ) : (

                      <>
                        <CIcon
                          icon={cilSearch}
                          className="me-2"
                        />

                        Detectar placa
                      </>

                    )}

                  </CButton>

                </>

              )}

            </CCardBody>

          </CCard>


          {/* ===================================================
              DERECHA
              =================================================== */}

          <CCard className="monitoreo-entrada-card">

            <CCardHeader>

              <h3 className="monitoreo-entrada-card-titulo">
                Resultado del reconocimiento
              </h3>


              <div className="monitoreo-entrada-card-subtitulo">
                OCR, vehículo, propietario y autorización.
              </div>

            </CCardHeader>


            <CCardBody>

              {/* =================================================
                  PROCESANDO
                  ================================================= */}

              {procesando && (

                <div className="ocr-procesando">

                  <div>

                    <CSpinner
                      color="success"
                    />


                    <h4 className="mt-3">
                      Analizando vehículo...
                    </h4>


                    <p className="text-body-secondary">

                      Reconociendo la placa y
                      verificando la información
                      registrada.

                    </p>

                  </div>

                </div>

              )}


              {/* =================================================
                  ESPERA
                  ================================================= */}

              {!procesando &&
              !resultado && (

                <div className="resultado-espera">

                  <div>

                    <div className="resultado-espera-icono">

                      <CIcon
                        icon={cilCamera}
                        size="xxl"
                      />

                    </div>


                    <h4>

                      {
                        imagen
                          ? 'Imagen lista para analizar'
                          : 'Esperando una imagen'
                      }

                    </h4>


                    <p>

                      {
                        imagen

                          ? 'Presiona Detectar placa para iniciar el reconocimiento.'

                          : 'Captura una fotografía o selecciona una imagen para comenzar.'
                      }

                    </p>

                  </div>

                </div>

              )}


              {/* =================================================
                  RESULTADO
                  ================================================= */}

              {!procesando &&
              resultado && (

                <>

                  {/* =============================================
                      ESTADO SUPERIOR
                      ============================================= */}

                  <div className="ocr-resultado-superior">

                    <div className="ocr-estado-linea">

                      <div className="ocr-estado-icono">

                        <CIcon
                          icon={
                            obtenerIconoEstado()
                          }
                          size="xl"
                        />

                      </div>


                      <div>

                        <CBadge
                          color={
                            obtenerColorEstado()
                          }
                          textColor={
                            obtenerColorEstado() ===
                            'warning'
                              ? 'dark'
                              : undefined
                          }
                        >
                          {
                            estado ||
                            'Sin estado'
                          }
                        </CBadge>


                        <h3>
                          {obtenerTituloEstado()}
                        </h3>

                      </div>

                    </div>


                    <p className="mt-2">

                      {obtenerDescripcionEstado()}

                    </p>

                  </div>


                  {/* =============================================
                      PLACA + CONFIANZA
                      ============================================= */}

                  <div className="ocr-placa-principal">

                    <div className="ocr-placa-box">

                      <span className="ocr-label">
                        Placa detectada
                      </span>


                      <div className="ocr-placa-valor">
                        {placa || '—'}
                      </div>

                    </div>


                    <div className="ocr-placa-box">

                      <span className="ocr-label">
                        Confianza OCR
                      </span>


                      <div className="ocr-confianza-valor">
                        {confianza}
                      </div>

                    </div>

                  </div>


                  {/* =============================================
                      IMAGEN MARCADA
                      ============================================= */}

                  {imagenMarcada && (

                    <div className="ocr-imagen-marcada-contenedor">

                      <div className="ocr-imagen-marcada-cabecera">
                        Placa localizada por el sistema
                      </div>


                      <img
                        src={imagenMarcada}
                        alt="Vehículo con placa detectada"
                        className="ocr-imagen-marcada"
                      />

                    </div>

                  )}


                  {/* =============================================
                      VEHÍCULO ENCONTRADO
                      ============================================= */}

                  {estado ===
                    'encontrado' &&
                  vehiculo && (

                    <>

                      <div className="ocr-seccion">

                        <div className="ocr-seccion-titulo">

                          <CIcon
                            icon={cilCarAlt}
                          />

                          VEHÍCULO REGISTRADO

                        </div>


                        <div className="ocr-vehiculo-contenido">

                          <FotoVehiculo

                            src={
                              vehiculo.foto_url
                            }

                            marca={
                              vehiculo.marca
                            }

                            modelo={
                              vehiculo.modelo
                            }

                          />


                          <div className="ocr-datos-grid">

                            <div className="ocr-dato">

                              <span className="ocr-label">
                                Marca
                              </span>

                              <div className="ocr-dato-valor">
                                {vehiculo.marca || '—'}
                              </div>

                            </div>


                            <div className="ocr-dato">

                              <span className="ocr-label">
                                Modelo
                              </span>

                              <div className="ocr-dato-valor">
                                {vehiculo.modelo || '—'}
                              </div>

                            </div>


                            <div className="ocr-dato">

                              <span className="ocr-label">
                                Año
                              </span>

                              <div className="ocr-dato-valor">
                                {vehiculo.anio || '—'}
                              </div>

                            </div>


                            <div className="ocr-dato">

                              <span className="ocr-label">
                                Color
                              </span>

                              <div className="ocr-dato-valor">
                                {vehiculo.color || '—'}
                              </div>

                            </div>


                            <div className="ocr-dato">

                              <span className="ocr-label">
                                Tipo
                              </span>

                              <div className="ocr-dato-valor">
                                {vehiculo.tipo || '—'}
                              </div>

                            </div>


                            <div className="ocr-dato">

                              <span className="ocr-label">
                                Placa
                              </span>

                              <div className="ocr-dato-valor">
                                {
                                  vehiculo.placa ||
                                  placa ||
                                  '—'
                                }
                              </div>

                            </div>

                          </div>

                        </div>

                      </div>


                      {/* =========================================
                          PROPIETARIO
                          ========================================= */}

                      <div className="ocr-seccion">

                        <div className="ocr-seccion-titulo">

                          <CIcon
                            icon={cilUser}
                          />

                          PROPIETARIO

                        </div>


                        <div className="ocr-propietario-contenido">

                          <FotoPropietario

                            src={
                              vehiculo
                                .foto_propietario_url
                            }

                            nombre={
                              vehiculo
                                .propietario_nombre
                            }

                          />


                          <div>

                            <div className="ocr-propietario-nombre">

                              {
                                vehiculo
                                  .propietario_nombre
                                ||
                                'Sin información'
                              }

                            </div>


                            <div className="ocr-propietario-cedula">

                              Cédula:{' '}

                              {
                                vehiculo
                                  .cedula_enmascarada
                                ||
                                '—'
                              }

                            </div>

                          </div>

                        </div>

                      </div>


                      {/* =========================================
                          AUTORIZACIÓN
                          ========================================= */}

                      <div

                        className={

                          autorizado

                            ? 'ocr-autorizacion ocr-autorizacion-ok'

                            : 'ocr-autorizacion ocr-autorizacion-no'

                        }

                      >

                        <CIcon

                          icon={
                            autorizado
                              ? cilCheckCircle
                              : cilXCircle
                          }

                          className="me-2"

                        />


                        {
                          autorizado
                            ? 'INGRESO AUTORIZADO — El vehículo puede ingresar al parqueadero.'
                            : 'INGRESO NO AUTORIZADO — El vehículo está registrado, pero no posee autorización vigente.'
                        }

                      </div>

                    </>

                  )}


                  {/* =============================================
                      NO REGISTRADO
                      ============================================= */}

                  {estado ===
                    'no_registrado' && (

                    <div className="ocr-no-registrado">

                      <div className="ocr-no-registrado-icono">

                        <CIcon
                          icon={cilXCircle}
                          size="xxl"
                        />

                      </div>


                      <h3>
                        VEHÍCULO NO REGISTRADO
                      </h3>


                      <p>

                        La placa fue reconocida
                        correctamente, pero no existe
                        un vehículo asociado en la
                        base de datos.

                      </p>


                      <CAlert
                        color="danger"
                        className="mt-3 mb-0"
                      >

                        <strong>
                          Ingreso no autorizado.
                        </strong>

                        {' '}

                        El vehículo deberá ser
                        registrado y autorizado antes
                        de utilizar el parqueadero.

                      </CAlert>

                    </div>

                  )}


                  {/* =============================================
                      SIN PLACA
                      ============================================= */}

                  {estado ===
                    'sin_placa' && (

                    <CAlert color="warning">

                      No se detectó una placa en la
                      fotografía. Intenta acercar la
                      cámara, mejorar la iluminación
                      o utilizar otra imagen.

                    </CAlert>

                  )}


                  {/* =============================================
                      BAJA CONFIANZA
                      ============================================= */}

                  {estado ===
                    'baja_confianza' && (

                    <CAlert color="warning">

                      La placa fue localizada, pero
                      la confianza del reconocimiento
                      es insuficiente. Captura una
                      fotografía más clara.

                    </CAlert>

                  )}


                  {/* =============================================
                      MÚLTIPLES PLACAS
                      ============================================= */}

                  {estado ===
                    'multiples_placas' && (

                    <CAlert color="warning">

                      Se detectaron varias placas.
                      Utiliza una imagen donde aparezca
                      únicamente el vehículo que deseas
                      comprobar.

                    </CAlert>

                  )}


                  {/* =============================================
                      OTRA IMAGEN
                      ============================================= */}

                  <CButton

                    color="secondary"

                    variant="outline"

                    className="w-100 mt-3"

                    onClick={
                      descartarImagen
                    }

                  >

                    <CIcon
                      icon={cilReload}
                      className="me-2"
                    />

                    Procesar otra imagen

                  </CButton>

                </>

              )}

            </CCardBody>

          </CCard>

        </div>

      </div>

    </>
  )
}