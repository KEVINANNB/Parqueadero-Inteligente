/* ================================================================
   UTEQ SMART PARKING
   SERVICIO OCR DE PLACAS

   La URL NO se escribe aquí.
   Se obtiene desde:

   VITE_OCR_ENDPOINT
   ================================================================ */


/* ================================================================
   ERROR PERSONALIZADO
   ================================================================ */

export class OcrHttpError extends Error {
  constructor(
    message,
    status = 0,
    payload = null,
  ) {
    super(message)

    this.name =
      'OcrHttpError'

    this.status =
      status

    this.payload =
      payload
  }
}


/* ================================================================
   MENSAJE SEGÚN HTTP
   ================================================================ */

function mensajeHttp(
  status,
  data,
) {
  /*
   * Si la API proporciona un mensaje,
   * podemos conservarlo cuando sea útil.
   */

  const mensajeApi =
    data?.mensaje ||
    data?.message ||
    data?.error ||
    ''


  switch (
    status
  ) {
    case 400:
      return (
        mensajeApi ||
        'La imagen está vacía, es inválida o tiene dimensiones no permitidas.'
      )

    case 413:
      return (
        'La imagen supera el tamaño máximo permitido de 4 MiB.'
      )

    case 415:
      return (
        'El formato de la imagen no es admitido. Utiliza JPG, JPEG o PNG.'
      )

    case 502:
      return (
        mensajeApi ||
        'El servicio OCR o la consulta de Supabase no se encuentran disponibles temporalmente.'
      )

    case 504:
      return (
        'El servicio tardó demasiado tiempo en responder. Intenta nuevamente.'
      )

    default:
      return (
        mensajeApi ||
        `El servicio respondió con el código HTTP ${status}.`
      )
  }
}


/* ================================================================
   OBTENER ENDPOINT
   ================================================================ */

function obtenerEndpoint() {
  const endpoint =
    import.meta.env
      .VITE_OCR_ENDPOINT
      ?.trim()


  if (
    !endpoint
  ) {
    throw new OcrHttpError(
      'No se encontró VITE_OCR_ENDPOINT. Configura la variable de entorno antes de utilizar el reconocimiento.',
    )
  }


  return endpoint
}


/* ================================================================
   PROCESAR RESPUESTA
   ================================================================ */

async function obtenerRespuestaJson(
  response,
) {
  const texto =
    await response.text()


  if (
    !texto
  ) {
    return null
  }


  try {
    return JSON.parse(
      texto,
    )
  } catch {
    throw new OcrHttpError(
      'El servicio OCR respondió con un formato que no es JSON.',
      response.status,
      texto,
    )
  }
}


/* ================================================================
   DETECTAR PLACA

   Recibe:
   File o Blob

   Envía:
   cuerpo binario

   NO Base64
   NO JSON
   ================================================================ */

export async function detectarPlaca(
  archivo,
  {
    signal,
  } = {},
) {
  if (
    !archivo ||
    !(archivo instanceof Blob)
  ) {
    throw new OcrHttpError(
      'No existe una imagen válida para procesar.',
    )
  }


  const endpoint =
    obtenerEndpoint()


  const contentType =
    archivo.type ||
    'application/octet-stream'


  let response


  try {
    response =
      await fetch(
        endpoint,
        {
          method:
            'POST',

          headers: {
            'Content-Type':
              contentType,
          },

          body:
            archivo,

          signal,
        },
      )
  } catch (
    error
  ) {
    if (
      error?.name ===
      'AbortError'
    ) {
      throw error
    }


    throw new OcrHttpError(
      'No fue posible conectarse con el servicio OCR. Comprueba la conexión, el endpoint y la configuración CORS.',
    )
  }


  const data =
    await obtenerRespuestaJson(
      response,
    )


  if (
    !response.ok
  ) {
    throw new OcrHttpError(
      mensajeHttp(
        response.status,
        data,
      ),
      response.status,
      data,
    )
  }


  if (
    !data ||
    typeof data !==
      'object'
  ) {
    throw new OcrHttpError(
      'El servicio OCR no devolvió información válida.',
      response.status,
      data,
    )
  }


  return data
}