import {
  supabase,
} from '../lib/supabase'


const BUCKET =
  'smart-parking-media'


const MAX_BYTES =
  5 * 1024 * 1024


const TIPOS_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
]


function obtenerExtension(
  archivo,
) {
  switch (
    archivo.type
  ) {
    case 'image/png':
      return 'png'

    case 'image/webp':
      return 'webp'

    case 'image/jpeg':
    default:
      return 'jpg'
  }
}


export async function subirImagen({
  archivo,
  carpeta = 'general',
}) {
  /* =========================================================
     VALIDACIONES
     ========================================================= */

  if (
    !archivo
  ) {
    return {
      ok: false,
      error:
        'Selecciona una imagen.',
    }
  }


  if (
    !TIPOS_PERMITIDOS.includes(
      archivo.type,
    )
  ) {
    return {
      ok: false,
      error:
        'Solo se permiten imágenes JPG, PNG o WEBP.',
    }
  }


  if (
    archivo.size >
    MAX_BYTES
  ) {
    return {
      ok: false,
      error:
        'La imagen no puede superar los 5 MB.',
    }
  }


  /* =========================================================
     USUARIO
     ========================================================= */

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


  /* =========================================================
     NOMBRE ÚNICO
     ========================================================= */

  const extension =
    obtenerExtension(
      archivo,
    )


  const identificador =
    crypto.randomUUID()


  const ruta =
    `${user.id}/${carpeta}/${Date.now()}-${identificador}.${extension}`


  /* =========================================================
     SUBIR
     ========================================================= */

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
        archivo,
        {
          cacheControl:
            '3600',

          upsert:
            false,

          contentType:
            archivo.type,
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


  /* =========================================================
     URL PÚBLICA
     ========================================================= */

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
    data
      ?.publicUrl


  if (
    !url
  ) {
    return {
      ok: false,
      error:
        'La imagen se subió, pero no se pudo obtener su URL.',
    }
  }


  return {
    ok: true,

    url,

    ruta,
  }
}