import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../services/firebase'

// Se suscribe al historial de un espacio específico: historial/{id}
export default function useHistorialEspacio(id) {
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!id) return
    setCargando(true)
    const historialRef = ref(db, `historial/${id}`)

    const unsubscribe = onValue(historialRef, (snapshot) => {
      const data = snapshot.val() || {}
      const lista = Object.values(data).sort((a, b) => b.fechaHora - a.fechaHora)
      setHistorial(lista)
      setCargando(false)
    })

    return () => unsubscribe()
  }, [id])

  return { historial, cargando }
}
