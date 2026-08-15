import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../services/firebase'

// Se suscribe en tiempo real al nodo "espacios" de Firebase RTDB
// y devuelve la lista de espacios junto con estadísticas calculadas.
export default function useEspacios() {
  const [espacios, setEspacios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const espaciosRef = ref(db, 'espacios')

    const unsubscribe = onValue(
      espaciosRef,
      (snapshot) => {
        const data = snapshot.val() || {}
        const lista = Object.values(data).sort((a, b) => {
          if (a.columna !== b.columna) return a.columna - b.columna
          return a.numero - b.numero
        })
        setEspacios(lista)
        setCargando(false)
      },
      (err) => {
        setError(err)
        setCargando(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const total = espacios.length
  const libres = espacios.filter((e) => e.estado === 'libre').length
  const ocupados = espacios.filter((e) => e.estado === 'ocupado').length
  const porcentajeDisponible = total > 0 ? (libres / total) * 100 : 0

  return {
    espacios,
    cargando,
    error,
    estadisticas: { total, libres, ocupados, porcentajeDisponible },
  }
}
