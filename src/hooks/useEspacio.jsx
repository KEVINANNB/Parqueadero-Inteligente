import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../services/firebase'

// Se suscribe en tiempo real a un solo espacio: espacios/{id}
export default function useEspacio(id) {
  const [espacio, setEspacio] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!id) return
    setCargando(true)
    const espacioRef = ref(db, `espacios/${id}`)

    const unsubscribe = onValue(espacioRef, (snapshot) => {
      setEspacio(snapshot.val())
      setCargando(false)
    })

    return () => unsubscribe()
  }, [id])

  return { espacio, cargando }
}
