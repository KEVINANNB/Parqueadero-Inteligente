import {
  COLUMNAS,
  ESPACIOS_POR_COLUMNA,
  calcularCeldaEspacio,
  determinarEstado,
} from './geometria.js'

const LETRA_COLUMNA = ['A', 'B', 'C', 'D']

// Genera una distancia aleatoria "realista": la mayoría de sensores ocupados
// registran entre 15 y 48 cm, y los libres entre 60 y 260 cm.
function distanciaAleatoria(forzarOcupado) {
  const ocupado = forzarOcupado ?? Math.random() < 0.5
  return ocupado
    ? Number((Math.random() * (48 - 15) + 15).toFixed(1))
    : Number((Math.random() * (260 - 60) + 60).toFixed(1))
}

function idEspacio(columna, numero) {
  const col = String(columna).padStart(2, '0')
  const num = String(numero).padStart(2, '0')
  return `ESP-C${col}-${num}`
}

// Crea el objeto completo de un espacio (sensor) individual
export function crearEspacio(columna, numero, opciones = {}) {
  const { latitud, longitud, boundingBox } = calcularCeldaEspacio(
    columna,
    numero
  )
  const distanciaDetectada =
    opciones.distanciaDetectada ?? distanciaAleatoria(opciones.forzarOcupado)
  const estado = determinarEstado(distanciaDetectada)

  return {
    id: idEspacio(columna, numero),
    columna,
    numero,
    etiqueta: `${LETRA_COLUMNA[columna - 1]}${String(numero).padStart(2, '0')}`,
    ubicacion: {
      nombre: 'Parqueadero UTEQ - Campus Quevedo',
      latitud,
      longitud,
      boundingBox,
    },
    distanciaDetectada,
    estado,
    fechaHora: Date.now(),
  }
}

// Genera los 80 espacios (4 columnas x 20 espacios), manteniendo una mezcla
// aproximada de libres/ocupados para que no todos queden en el mismo estado
export function generarEspaciosIniciales() {
  const espacios = []
  for (let columna = 1; columna <= COLUMNAS; columna++) {
    for (let numero = 1; numero <= ESPACIOS_POR_COLUMNA; numero++) {
      espacios.push(crearEspacio(columna, numero))
    }
  }
  return espacios
}
