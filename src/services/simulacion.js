import { ref, update, get } from 'firebase/database'
import { db } from './firebase'
import { determinarEstado } from './geometria'

// Cuántos sensores se actualizan en cada "tick" de la simulación
const SENSORES_POR_CICLO = 6

function distanciaAleatoria() {
  const ocupado = Math.random() < 0.5
  return ocupado
    ? Number((Math.random() * (48 - 15) + 15).toFixed(1))
    : Number((Math.random() * (260 - 60) + 60).toFixed(1))
}

// Elige N ids al azar sin repetir, de la lista de ids disponibles
function elegirAlAzar(ids, cantidad) {
  const copia = [...ids]
  const elegidos = []
  for (let i = 0; i < cantidad && copia.length > 0; i++) {
    const indice = Math.floor(Math.random() * copia.length)
    elegidos.push(copia.splice(indice, 1)[0])
  }
  return elegidos
}

// Ejecuta un ciclo de simulación: toma algunos sensores al azar,
// les asigna una nueva distancia/estado y registra el cambio en el historial.
export async function ejecutarCicloSimulacion() {
  const snapshot = await get(ref(db, 'espacios'))
  if (!snapshot.exists()) return

  const espacios = snapshot.val()
  const ids = Object.keys(espacios)
  const seleccionados = elegirAlAzar(ids, SENSORES_POR_CICLO)

  const actualizaciones = {}
  const ahora = Date.now()

  seleccionados.forEach((id) => {
    const distanciaDetectada = distanciaAleatoria()
    const estado = determinarEstado(distanciaDetectada)

    actualizaciones[`espacios/${id}/distanciaDetectada`] = distanciaDetectada
    actualizaciones[`espacios/${id}/estado`] = estado
    actualizaciones[`espacios/${id}/fechaHora`] = ahora
    actualizaciones[`historial/${id}/${ahora}`] = {
      distanciaDetectada,
      estado,
      fechaHora: ahora,
    }
  })

  await update(ref(db), actualizaciones)
}

// Inicia la simulación periódica. Devuelve una función para detenerla.
export function iniciarSimulacion(intervaloMs = 15000) {
  const id = setInterval(() => {
    ejecutarCicloSimulacion().catch((err) =>
      console.error('Error en ciclo de simulación:', err)
    )
  }, intervaloMs)
  return () => clearInterval(id)
}
