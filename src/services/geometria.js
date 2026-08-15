// Geometría del terreno del parqueadero (UTEQ - Campus Quevedo)
// Puntos originales tomados de Google Maps (ver informe PDF para el detalle del cálculo)
export const PUNTOS_TERRENO = {
  P1: { lat: -1.0122617572453996, lng: -79.4682858877737 },
  P2: { lat: -1.0125032549290254, lng: -79.4682998912032 },
  P3: { lat: -1.012570971500396, lng: -79.46748620024898 },
  P4: { lat: -1.0123403901396444, lng: -79.46746240847104 },
}

// Bounding box aproximado (rectángulo que envuelve el terreno)
export const BOUNDING_BOX = {
  norte: -1.0122617572453996,
  sur: -1.012570971500396,
  oeste: -79.4682998912032,
  este: -79.46746240847104,
}

export const COLUMNAS = 4
export const ESPACIOS_POR_COLUMNA = 20
export const TOTAL_ESPACIOS = COLUMNAS * ESPACIOS_POR_COLUMNA // 80
export const UMBRAL_OCUPADO_CM = 50

// Distancia aproximada entre dos coordenadas geográficas (fórmula de Haversine, en metros)
function distanciaMetros(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const rad = (x) => (x * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Cálculo aproximado de dimensiones del terreno y de cada celda de la cuadrícula
export function calcularDistribucion() {
  const { norte, sur, oeste, este } = BOUNDING_BOX

  const largoPromedio = distanciaMetros(norte, oeste, sur, oeste) // eje N-S
  const anchoPromedio = distanciaMetros(norte, oeste, norte, este) // eje O-E
  const areaAproximada = largoPromedio * anchoPromedio

  const anchoPorColumna = anchoPromedio / COLUMNAS
  const largoPorEspacio = largoPromedio / ESPACIOS_POR_COLUMNA
  const superficiePorCelda = anchoPorColumna * largoPorEspacio

  return {
    largoPromedio,
    anchoPromedio,
    areaAproximada,
    anchoPorColumna,
    largoPorEspacio,
    superficiePorCelda,
  }
}

// Calcula el centro y el bounding box de un espacio (columna 1-4, numero 1-20)
// mediante interpolación lineal dentro del bounding box general del terreno
export function calcularCeldaEspacio(columna, numero) {
  const { norte, sur, oeste, este } = BOUNDING_BOX

  const pasoLat = (norte - sur) / ESPACIOS_POR_COLUMNA
  const pasoLng = (este - oeste) / COLUMNAS

  const celdaNorte = norte - (numero - 1) * pasoLat
  const celdaSur = celdaNorte - pasoLat
  const celdaOeste = oeste + (columna - 1) * pasoLng
  const celdaEste = celdaOeste + pasoLng

  const latitud = (celdaNorte + celdaSur) / 2
  const longitud = (celdaOeste + celdaEste) / 2

  return {
    latitud,
    longitud,
    boundingBox: {
      norte: celdaNorte,
      sur: celdaSur,
      oeste: celdaOeste,
      este: celdaEste,
    },
  }
}

export function determinarEstado(distanciaDetectada) {
  return distanciaDetectada <= UMBRAL_OCUPADO_CM ? 'ocupado' : 'libre'
}
