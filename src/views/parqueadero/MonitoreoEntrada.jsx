import {
  useEffect,
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

import CIcon from '@coreui/icons-react'

import {
  cilCamera,
  cilFolderOpen,
  cilMediaStop,
} from '@coreui/icons'

import {
  useAuth,
} from '../../context/AuthContext'


/* ================================================================
   CONFIGURACIÓN
   ================================================================ */

const TAMANO_MAXIMO =
  4 * 1024 * 1024

const TIPOS_PERMITIDOS = [
  'image/jpeg',
  'image/png',
]


/* ================================================================
   COMPONENTE
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


  /* ==============================================================
     ESTADOS
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
     LIBERAR URL TEMPORAL
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
     CONECTAR STREAM AL ELEMENTO <VIDEO>

     IMPORTANTE:

     React primero necesita renderizar el <video>.
     Después de eso podemos asignar streamRef.current
     al srcObject.

     Esta es la corrección del problema donde solamente
     aparecía el fondo oscuro sin imagen en vivo.
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
              'La cámara fue activada, pero el navegador no pudo mostrar la imagen en vivo.',
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
     LIMPIEZA AL SALIR DEL COMPONENTE
     ============================================================== */

  useEffect(
    () => {

      return () => {

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
          urlTemporalRef.current
        ) {

          URL.revokeObjectURL(
            urlTemporalRef.current,
          )

          urlTemporalRef.current =
            null

        }

      }

    },
    [],
  )


  /* ==============================================================
     CREAR VISTA PREVIA
     ============================================================== */

  const establecerImagen =
    (
      archivo,
      origen,
      nombre,
    ) => {

      liberarUrlTemporal()


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

      setError(
        '',
      )

      setMensaje(
        '',
      )

      setIniciandoCamara(
        true,
      )


      try {

        /* ========================================================
           COMPROBAR SOPORTE
           ======================================================== */

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {

          throw new Error(
            'Tu navegador no permite acceder a la cámara.',
          )

        }


        /* ========================================================
           CERRAR STREAM ANTERIOR
           ======================================================== */

        detenerCamara()


        /* ========================================================
           SOLICITAR CÁMARA

           environment = preferencia por cámara posterior
           en teléfonos y tablets.
           ======================================================== */

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


        /*
         * Guardamos primero el stream.
         */

        streamRef.current =
          stream


        /*
         * Ahora hacemos que React renderice
         * el elemento <video>.
         *
         * El useEffect anterior será quien
         * conecte el stream al video.
         */

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
          'Error al activar cámara:',
          err,
        )


        let texto =
          'No fue posible iniciar la cámara.'


        if (
          err?.name ===
          'NotAllowedError'
        ) {

          texto =
            'El navegador no tiene permiso para utilizar la cámara. Permite el acceso y vuelve a intentarlo.'

        } else if (
          err?.name ===
          'NotFoundError'
        ) {

          texto =
            'No se encontró ninguna cámara disponible en este dispositivo.'

        } else if (
          err?.name ===
          'NotReadableError'
        ) {

          texto =
            'La cámara está siendo utilizada por otra aplicación o no se encuentra disponible.'

        } else if (
          err?.name ===
          'OverconstrainedError'
        ) {

          texto =
            'La cámara encontrada no admite la configuración solicitada.'

        } else if (
          err?.name ===
          'SecurityError'
        ) {

          texto =
            'El navegador bloqueó el acceso a la cámara por motivos de seguridad.'

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

      setError(
        '',
      )

      setMensaje(
        '',
      )


      const video =
        videoRef.current

      const canvas =
        canvasRef.current


      if (
        !video ||
        !canvas
      ) {

        setError(
          'No fue posible acceder a la cámara.',
        )

        return

      }


      if (
        !video.videoWidth ||
        !video.videoHeight
      ) {

        setError(
          'La cámara todavía se está preparando. Espera un momento y vuelve a capturar.',
        )

        return

      }


      try {

        /* ========================================================
           AJUSTAR CANVAS
           ======================================================== */

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


        /* ========================================================
           COPIAR FOTOGRAMA
           ======================================================== */

        contexto.drawImage(
          video,
          0,
          0,
          canvas.width,
          canvas.height,
        )


        /* ========================================================
           CANVAS -> BLOB JPEG
           ======================================================== */

        const blob =
          await new Promise(
            (
              resolve,
              reject,
            ) => {

              canvas.toBlob(

                (
                  resultado,
                ) => {

                  if (
                    resultado
                  ) {

                    resolve(
                      resultado,
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


        /* ========================================================
           VALIDAR TAMAÑO
           ======================================================== */

        if (
          blob.size >
          TAMANO_MAXIMO
        ) {

          setError(
            'La fotografía supera el tamaño máximo permitido de 4 MiB.',
          )

          return

        }


        /* ========================================================
           GENERAR NOMBRE
           ======================================================== */

        const fecha =
          new Date()


        const nombre =
          `captura-vehiculo-${fecha.getTime()}.jpg`


        /*
         * Después de capturar la fotografía
         * apagamos la cámara.
         */

        detenerCamara()


        establecerImagen(
          blob,
          'camara',
          nombre,
        )


        setMensaje(
          'Fotografía capturada correctamente. Ya está lista para el reconocimiento.',
        )

      } catch (
        err
      ) {

        console.error(
          'Error capturando fotografía:',
          err,
        )


        setError(
          err?.message ||
          'No fue posible capturar la fotografía.',
        )

      }

    }


  /* ==============================================================
     ABRIR SELECTOR DE ARCHIVOS
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

      setError(
        '',
      )

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


      /* ========================================================
         VALIDAR FORMATO
         ======================================================== */

      if (
        !TIPOS_PERMITIDOS.includes(
          archivo.type,
        )
      ) {

        setError(
          'Formato no permitido. Selecciona únicamente una imagen JPG, JPEG o PNG.',
        )


        evento.target.value =
          ''

        return

      }


      /* ========================================================
         VALIDAR TAMAÑO
         ======================================================== */

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


      /* ========================================================
         CERRAR CÁMARA
         ======================================================== */

      detenerCamara()


      /* ========================================================
         GUARDAR IMAGEN
         ======================================================== */

      establecerImagen(
        archivo,
        'archivo',
        archivo.name,
      )


      setMensaje(
        'Imagen seleccionada correctamente. Ya está lista para el reconocimiento.',
      )


      /*
       * Permite seleccionar nuevamente
       * el mismo archivo.
       */

      evento.target.value =
        ''

    }


  /* ==============================================================
     DESCARTAR IMAGEN
     ============================================================== */

  const descartarImagen =
    () => {

      liberarUrlTemporal()


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


      setError(
        '',
      )

    }


  /* ==============================================================
     NUEVA CAPTURA
     ============================================================== */

  const nuevaCaptura =
    () => {

      descartarImagen()


      /*
       * Esperamos a que React retire
       * la vista previa antes de iniciar
       * nuevamente la cámara.
       */

      setTimeout(
        () => {

          activarCamara()

        },
        50,
      )

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
     SEGURIDAD DE LA VISTA

     Se coloca después de los hooks para no romper
     las reglas de hooks de React.
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
           PÁGINA
           ===================================================== */

        .monitoreo-entrada {
          width: 100%;
        }


        /* =====================================================
           CABECERA
           ===================================================== */

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
          max-width: 700px;
          margin-top: 7px;
          margin-bottom: 0;
          color: #687386;
          font-size: 13px;
          line-height: 1.5;
        }


        /* =====================================================
           GRID
           ===================================================== */

        .monitoreo-entrada-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.05fr)
            minmax(0, .95fr);

          gap: 18px;
          align-items: stretch;
        }


        .monitoreo-entrada-card {
          height: 100%;
          overflow: hidden;

          border:
            1px solid #dfe5eb;

          box-shadow:
            0 4px 14px
            rgba(15, 23, 42, .05);
        }


        .monitoreo-entrada-card .card-header {
          padding: 13px 16px;

          background:
            #f7f9fb;

          border-bottom:
            1px solid #dfe5eb;
        }


        .monitoreo-entrada-card-titulo {
          margin: 0;

          color:
            #172033;

          font-size:
            14px;

          font-weight:
            700;
        }


        .monitoreo-entrada-card-subtitulo {
          margin-top: 3px;

          color:
            #7a8594;

          font-size:
            11px;
        }


        /* =====================================================
           VISOR
           ===================================================== */

        .monitoreo-camara-marco {
          position: relative;

          width: 100%;

          aspect-ratio:
            16 / 9;

          min-height:
            320px;

          display:
            grid;

          place-items:
            center;

          overflow:
            hidden;

          border:
            1px solid #d6dee5;

          border-radius:
            10px;

          background:
            #111827;

          text-align:
            center;
        }


        /* =====================================================
           VIDEO
           ===================================================== */

        .monitoreo-video {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit:
            cover;

          background:
            #111827;
        }


        /* =====================================================
           PREVIEW
           ===================================================== */

        .monitoreo-preview {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit:
            contain;

          background:
            #111827;
        }


        /* =====================================================
           PLACEHOLDER
           ===================================================== */

        .monitoreo-camara-placeholder {
          max-width:
            340px;

          padding:
            25px;

          color:
            #ffffff;
        }


        .monitoreo-camara-icono {
          width:
            62px;

          height:
            62px;

          display:
            grid;

          place-items:
            center;

          margin:
            0 auto 14px;

          border-radius:
            50%;

          background:
            rgba(
              34,
              197,
              94,
              .16
            );

          color:
            #4ade80;
        }


        .monitoreo-camara-icono svg {
          width:
            29px;

          height:
            29px;
        }


        .monitoreo-camara-placeholder h4 {
          margin-bottom:
            7px;

          color:
            #ffffff;

          font-size:
            17px;
        }


        .monitoreo-camara-placeholder p {
          margin:
            0;

          color:
            #cbd5e1;

          font-size:
            12px;

          line-height:
            1.5;
        }


        /* =====================================================
           LIVE
           ===================================================== */

        .monitoreo-live-badge {
          position:
            absolute;

          z-index:
            5;

          top:
            12px;

          left:
            12px;

          display:
            flex;

          align-items:
            center;

          gap:
            6px;

          padding:
            6px 10px;

          border-radius:
            999px;

          background:
            rgba(
              17,
              24,
              39,
              .82
            );

          color:
            #ffffff;

          font-size:
            10px;

          font-weight:
            700;
        }


        .monitoreo-live-punto {
          width:
            8px;

          height:
            8px;

          border-radius:
            50%;

          background:
            #ef4444;

          box-shadow:
            0 0 0
            4px
            rgba(
              239,
              68,
              68,
              .16
            );
        }


        /* =====================================================
           ARCHIVO
           ===================================================== */

        .monitoreo-archivo {
          display:
            flex;

          justify-content:
            space-between;

          align-items:
            center;

          gap:
            12px;

          margin-top:
            12px;

          padding:
            10px 12px;

          border:
            1px solid #dfe5eb;

          border-radius:
            8px;

          background:
            #f8fafc;
        }


        .monitoreo-archivo-info {
          min-width:
            0;
        }


        .monitoreo-archivo-nombre {
          display:
            block;

          max-width:
            420px;

          overflow:
            hidden;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;

          color:
            #172033;

          font-size:
            11px;

          font-weight:
            700;
        }


        .monitoreo-archivo-meta {
          display:
            block;

          margin-top:
            3px;

          color:
            #7a8594;

          font-size:
            10px;
        }


        /* =====================================================
           CONTROLES
           ===================================================== */

        .monitoreo-controles {
          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap:
            10px;

          margin-top:
            14px;
        }


        .monitoreo-controles-camara {
          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap:
            10px;

          margin-top:
            14px;
        }


        /* =====================================================
           SEPARADOR
           ===================================================== */

        .monitoreo-separador {
          display:
            flex;

          align-items:
            center;

          gap:
            12px;

          margin:
            16px 0 12px;

          color:
            #94a3b8;

          font-size:
            10px;
        }


        .monitoreo-separador::before,
        .monitoreo-separador::after {
          content:
            '';

          flex:
            1;

          height:
            1px;

          background:
            #e2e8f0;
        }


        /* =====================================================
           RESULTADO
           ===================================================== */

        .monitoreo-resultado-vacio {
          min-height:
            280px;

          display:
            flex;

          flex-direction:
            column;

          justify-content:
            center;

          align-items:
            center;

          padding:
            30px;

          text-align:
            center;
        }


        .monitoreo-resultado-vacio-icono {
          width:
            60px;

          height:
            60px;

          display:
            grid;

          place-items:
            center;

          margin-bottom:
            14px;

          border-radius:
            50%;

          background:
            #eef2f6;

          color:
            #708090;
        }


        .monitoreo-resultado-vacio-icono svg {
          width:
            27px;

          height:
            27px;
        }


        .monitoreo-resultado-vacio h4 {
          margin-bottom:
            7px;

          color:
            #172033;

          font-size:
            18px;
        }


        .monitoreo-resultado-vacio p {
          max-width:
            350px;

          margin-bottom:
            0;

          color:
            #718096;

          font-size:
            12px;

          line-height:
            1.55;
        }


        /* =====================================================
           DATOS
           ===================================================== */

        .monitoreo-datos-espera {
          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap:
            10px;

          margin-top:
            15px;
        }


        .monitoreo-dato {
          padding:
            12px;

          border:
            1px solid #e0e6eb;

          border-radius:
            8px;

          background:
            #fafbfc;
        }


        .monitoreo-dato-label {
          display:
            block;

          margin-bottom:
            5px;

          color:
            #7a8594;

          font-size:
            10px;

          text-transform:
            uppercase;

          letter-spacing:
            .04em;
        }


        .monitoreo-dato-valor {
          color:
            #172033;

          font-size:
            13px;

          font-weight:
            700;
        }


        /* =====================================================
           TABLET
           ===================================================== */

        @media (
          max-width: 1000px
        ) {

          .monitoreo-entrada-grid {
            grid-template-columns:
              1fr;
          }


          .monitoreo-camara-marco {
            min-height:
              280px;
          }

        }


        /* =====================================================
           MÓVIL
           ===================================================== */

        @media (
          max-width: 600px
        ) {

          .monitoreo-entrada-encabezado {
            flex-direction:
              column;
          }


          .monitoreo-entrada-titulo {
            font-size:
              23px;
          }


          .monitoreo-camara-marco {
            min-height:
              220px;
          }


          .monitoreo-controles,
          .monitoreo-controles-camara {
            grid-template-columns:
              1fr;
          }


          .monitoreo-datos-espera {
            grid-template-columns:
              1fr;
          }


          .monitoreo-archivo {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

        }

      `}</style>


      <div className="monitoreo-entrada">

        {/* =====================================================
            CABECERA
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

              Captura o selecciona una fotografía
              del vehículo para realizar posteriormente
              el reconocimiento automático de su placa.

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

          <CAlert
            color="danger"
            dismissible
            onClose={
              () =>
                setError('')
            }
          >

            {error}

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


        {/* =====================================================
            COLUMNAS
            ===================================================== */}

        <div className="monitoreo-entrada-grid">

          {/* ===================================================
              CAPTURA
              =================================================== */}

          <CCard className="monitoreo-entrada-card">

            <CCardHeader>

              <h3 className="monitoreo-entrada-card-titulo">
                Captura del vehículo
              </h3>


              <div className="monitoreo-entrada-card-subtitulo">

                Utiliza la cámara en tiempo real
                o selecciona una imagen JPG/PNG.

              </div>

            </CCardHeader>


            <CCardBody>

              {/* =================================================
                  VISOR
                  ================================================= */}

              <div className="monitoreo-camara-marco">

                {vistaPrevia ? (

                  <img

                    src={
                      vistaPrevia
                    }

                    alt="Vehículo seleccionado"

                    className="monitoreo-preview"

                  />

                ) : camaraActiva ? (

                  <>

                    <video

                      ref={
                        videoRef
                      }

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
                        icon={
                          cilCamera
                        }
                      />

                    </div>


                    <h4>
                      Cámara desactivada
                    </h4>


                    <p>

                      Activa la cámara para capturar
                      una fotografía del vehículo
                      o selecciona una imagen almacenada
                      en el dispositivo.

                    </p>

                  </div>

                )}

              </div>


              {/* CANVAS OCULTO */}

              <canvas

                ref={
                  canvasRef
                }

                style={{
                  display:
                    'none',
                }}

              />


              {/* INPUT ARCHIVO */}

              <input

                ref={
                  inputArchivoRef
                }

                type="file"

                accept="image/jpeg,image/png"

                onChange={
                  seleccionarImagen
                }

                style={{
                  display:
                    'none',
                }}

              />


              {/* =================================================
                  INFO IMAGEN
                  ================================================= */}

              {imagen && (

                <div className="monitoreo-archivo">

                  <div className="monitoreo-archivo-info">

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

                    onClick={
                      descartarImagen
                    }

                  >

                    Descartar

                  </CButton>

                </div>

              )}


              {/* =================================================
                  SIN CÁMARA / SIN FOTO
                  ================================================= */}

              {!camaraActiva &&
              !vistaPrevia && (

                <div className="monitoreo-controles">

                  <CButton

                    color="success"

                    onClick={
                      activarCamara
                    }

                    disabled={
                      iniciandoCamara
                    }

                  >

                    {iniciandoCamara ? (

                      <>

                        <CSpinner
                          size="sm"
                          className="me-2"
                        />

                        Iniciando cámara...

                      </>

                    ) : (

                      <>

                        <CIcon
                          icon={
                            cilCamera
                          }
                          className="me-2"
                        />

                        Activar cámara

                      </>

                    )}

                  </CButton>


                  <CButton

                    color="secondary"

                    variant="outline"

                    onClick={
                      abrirSelector
                    }

                  >

                    <CIcon
                      icon={
                        cilFolderOpen
                      }
                      className="me-2"
                    />

                    Seleccionar imagen

                  </CButton>

                </div>

              )}


              {/* =================================================
                  CÁMARA EN VIVO
                  ================================================= */}

              {camaraActiva &&
              !vistaPrevia && (

                <div className="monitoreo-controles-camara">

                  <CButton

                    color="success"

                    onClick={
                      capturarFoto
                    }

                  >

                    <CIcon
                      icon={
                        cilCamera
                      }
                      className="me-2"
                    />

                    Capturar foto

                  </CButton>


                  <CButton

                    color="danger"

                    variant="outline"

                    onClick={
                      detenerCamara
                    }

                  >

                    <CIcon
                      icon={
                        cilMediaStop
                      }
                      className="me-2"
                    />

                    Detener cámara

                  </CButton>

                </div>

              )}


              {/* =================================================
                  FOTO CAPTURADA
                  ================================================= */}

              {vistaPrevia && (

                <>

                  <div className="monitoreo-separador">
                    cambiar fotografía
                  </div>


                  <div className="monitoreo-controles-camara">

                    <CButton

                      color="secondary"

                      variant="outline"

                      onClick={
                        nuevaCaptura
                      }

                    >

                      <CIcon
                        icon={
                          cilCamera
                        }
                        className="me-2"
                      />

                      Nueva captura

                    </CButton>


                    <CButton

                      color="secondary"

                      variant="outline"

                      onClick={
                        abrirSelector
                      }

                    >

                      <CIcon
                        icon={
                          cilFolderOpen
                        }
                        className="me-2"
                      />

                      Otra imagen

                    </CButton>

                  </div>


                  <CButton

                    color="success"

                    className="w-100 mt-2"

                    disabled

                  >

                    Detectar placa

                  </CButton>


                  <div

                    className="
                      text-center
                      text-body-secondary
                      mt-2
                    "

                    style={{
                      fontSize:
                        10,
                    }}

                  >

                    El reconocimiento OCR
                    se habilitará en el siguiente paso.

                  </div>

                </>

              )}

            </CCardBody>

          </CCard>


          {/* ===================================================
              RESULTADO
              =================================================== */}

          <CCard className="monitoreo-entrada-card">

            <CCardHeader>

              <h3 className="monitoreo-entrada-card-titulo">
                Resultado del reconocimiento
              </h3>


              <div className="monitoreo-entrada-card-subtitulo">

                Resultado de la detección OCR
                y consulta de vehículo registrado.

              </div>

            </CCardHeader>


            <CCardBody>

              <div className="monitoreo-resultado-vacio">

                <div className="monitoreo-resultado-vacio-icono">

                  <CIcon
                    icon={
                      cilCamera
                    }
                  />

                </div>


                <h4>

                  {
                    imagen
                      ? 'Imagen preparada'
                      : 'Esperando una imagen'
                  }

                </h4>


                <p>

                  {
                    imagen
                      ? 'La fotografía está lista para ser enviada al sistema de reconocimiento de placas.'
                      : 'Captura una fotografía o selecciona una imagen del vehículo para continuar.'
                  }

                </p>

              </div>


              <div className="monitoreo-datos-espera">

                <div className="monitoreo-dato">

                  <span className="monitoreo-dato-label">
                    Estado
                  </span>

                  <span className="monitoreo-dato-valor">

                    {
                      imagen
                        ? 'Imagen lista'
                        : '—'
                    }

                  </span>

                </div>


                <div className="monitoreo-dato">

                  <span className="monitoreo-dato-label">
                    Placa detectada
                  </span>

                  <span className="monitoreo-dato-valor">
                    —
                  </span>

                </div>


                <div className="monitoreo-dato">

                  <span className="monitoreo-dato-label">
                    Confianza OCR
                  </span>

                  <span className="monitoreo-dato-valor">
                    —
                  </span>

                </div>


                <div className="monitoreo-dato">

                  <span className="monitoreo-dato-label">
                    Vehículo
                  </span>

                  <span className="monitoreo-dato-valor">
                    —
                  </span>

                </div>

              </div>

            </CCardBody>

          </CCard>

        </div>

      </div>

    </>
  )
}