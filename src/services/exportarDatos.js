import { ref, get } from 'firebase/database'
import { db } from './firebase'

export async function descargarJsonRTDB() {
  const [snapEspacios, snapHistorial] = await Promise.all([
    get(ref(db, 'espacios')),
    get(ref(db, 'historial')),
  ])

  const data = {
    espacios: snapEspacios.val() || {},
    historial: snapHistorial.val() || {},
  }

  const contenido = JSON.stringify(data, null, 2)
  const blob = new Blob([contenido], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const fecha = new Date().toISOString().slice(0, 10)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `parqueadero-uteq-rtdb-${fecha}.json`
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}