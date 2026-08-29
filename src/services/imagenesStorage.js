import {
  supabase,
} from '../lib/supabase'


/* ================================================================
   CONFIGURACIÓN
   ================================================================ */

const BUCKET =
  'smart-parking-media'


const MAX_ARCHIVO_ORIGINAL =
  5 * 1024 * 1024


const MAX_DIMENSION =
  1600


const CALIDAD_WEBP =
  0.82


const TIPOS_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
]


/* ================================================================
   VALIDAR
   ================================================================ */

function validarArchivo(
  archivo,
) {
  if (
    !archivo
  ) {
    return (
      'Selecciona una imagen.'
    )
  }


  if (
    !TIPOS_PERMITIDOS.includes(
      archivo.type,
    )
  ) {
    return (
      'Solo se permiten imágenes JPG, PNG o WEBP.'
    )
  }


  if (
    archivo.size >
    MAX_ARCHIVO_ORIGINAL
  ) {
    return (
      'La imagen original no puede superar los 5 MB.'
    )
  }


  return null
}


/* ================================================================
   CARGAR IMAGEN EN MEMORIA
   ================================================================ */

function cargarImagenHtml(
  archivo,
) {
  return new Promise(
    (
      resolve,
      reject,
    ) => {

      const url =
        URL.createObjectURL(
          archivo,
        )


      const imagen =
        new Image()


      imagen.onload =
        () => {

          URL.revokeObjectURL(
            url,
          )


          resolve(
            imagen,
          )

        }


      imagen.onerror =
        () => {

          URL.revokeObjectURL(
            url,
          )


          reject(
            new Error(
              'No se pudo leer la imagen seleccionada.',
            ),
          )

        }


      imagen.src =
        url

    },
  )
}


/* ================================================================
   CANVAS -> BLOB
   ================================================================ */

function canvasABlob(
  canvas,
) {
  return new Promise(
    (
      resolve,
      reject,
    ) => {

      canvas.toBlob(
        (
          blob,
        ) => {

          if (
            !blob
          ) {
            reject(
              new Error(
                'No se pudo comprimir la imagen.',
              ),
            )

            return
          }


          resolve(
            blob,
          )

        },

        'image/webp',

        CALIDAD_WEBP,

      )

    },
  )
}


/* ================================================================
   COMPRIMIR
   ================================================================ */

async function comprimirImagen(
  archivo,
) {
  const imagen =
    await cargarImagenHtml(
      archivo,
    )


  const anchoOriginal =
    imagen.naturalWidth ||
    imagen.width


  const altoOriginal =
    imagen.naturalHeight ||
    imagen.height


  if (
    !anchoOriginal ||
    !altoOriginal
  ) {
    throw new Error(
      'La imagen no tiene dimensiones válidas.',
    )
  }


  /* ==============================================================
     ESCALA
     ============================================================== */

  const dimensionMayor =
    Math.max(
      anchoOriginal,
      altoOriginal,
    )


  const escala =
    dimensionMayor >
    MAX_DIMENSION

      ? MAX_DIMENSION /
        dimensionMayor

      : 1


  const anchoFinal =
    Math.max(
      1,

      Math.round(
        anchoOriginal *
        escala,
      ),
    )


  const altoFinal =
    Math.max(
      1,

      Math.round(
        altoOriginal *
        escala,
      ),
    )


  /* ==============================================================
     CANVAS
     ============================================================== */

  const canvas =
    document.createElement(
      'canvas',
    )


  canvas.width =
    anchoFinal


  canvas.height =
    altoFinal


  const contexto =
    canvas.getContext(
      '2d',
      {
        alpha:
          true,
      },
    )


  if (
    !contexto
  ) {
    throw new Error(
      'El navegador no pudo preparar la imagen.',
    )
  }


  contexto.imageSmoothingEnabled =
    true


  contexto.imageSmoothingQuality =
    'high'


  contexto.drawImage(

    imagen,

    0,
    0,

    anchoFinal,
    altoFinal,

  )


  const blob =
    await canvasABlob(
      canvas,
    )


  /* ==============================================================
     ARCHIVO FINAL
     ============================================================== */

  const nombreBase =
    archivo.name
      .replace(
        /\.[^.]+$/,
        '',
      )
      .replace(
        /[^a-zA-Z0-9_-]/g,
        '-',
      )


  return new File(
    [
      blob,
    ],

    `${nombreBase}.webp`,

    {
      type:
        'image/webp',

      lastModified:
        Date.now(),
    },
  )
}


/* ================================================================
   SUBIR
   ================================================================ */

export async function subirImagen({
  archivo,
  carpeta = 'general',
}) {
  /* ==============================================================
     VALIDACIÓN
     ============================================================== */

  const errorValidacion =
    validarArchivo(
      archivo,
    )


  if (
    errorValidacion
  ) {
    return {
      ok: false,

      error:
        errorValidacion,
    }
  }


  /* ==============================================================
     USUARIO
     ============================================================== */

  const {
    data: {
      user,
    },

    error:
      errorUsuario,
  } =
    await supabase.auth
      .getUser()


  if (
    errorUsuario ||
    !user
  ) {
    return {
      ok: false,

      error:
        'No existe una sesión activa.',
    }
  }


  /* ==============================================================
     COMPRIMIR
     ============================================================== */

  let archivoOptimizado


  try {

    archivoOptimizado =
      await comprimirImagen(
        archivo,
      )

  } catch (
    error
  ) {

    console.error(
      'Error comprimiendo imagen:',
      error,
    )


    return {
      ok: false,

      error:
        error?.message ||
        'No se pudo optimizar la imagen.',
    }

  }


  /* ==============================================================
     GENERAR NOMBRE ÚNICO
     ============================================================== */

  const identificador =
    crypto.randomUUID()


  const ruta =
    [
      user.id,
      carpeta,
      `${Date.now()}-${identificador}.webp`,
    ].join('/')


  /* ==============================================================
     SUBIR A STORAGE
     ============================================================== */

  const {
    error:
      errorSubida,
  } =
    await supabase.storage
      .from(
        BUCKET,
      )
      .upload(
        ruta,
        archivoOptimizado,
        {

          cacheControl:
            '31536000',

          upsert:
            false,

          contentType:
            'image/webp',

        },
      )


  if (
    errorSubida
  ) {
    console.error(
      'Error subiendo imagen:',
      errorSubida,
    )


    return {
      ok: false,

      error:
        errorSubida.message,
    }
  }


  /* ==============================================================
     URL PÚBLICA
     ============================================================== */

  const {
    data,
  } =
    supabase.storage
      .from(
        BUCKET,
      )
      .getPublicUrl(
        ruta,
      )


  const url =
    data?.publicUrl


  if (
    !url
  ) {
    return {
      ok: false,

      error:
        'La imagen se subió, pero no se pudo obtener la URL pública.',
    }
  }


  /* ==============================================================
     RESULTADO
     ============================================================== */

  return {
    ok: true,

    url,

    ruta,

    originalBytes:
      archivo.size,

    optimizadoBytes:
      archivoOptimizado.size,

  }
}