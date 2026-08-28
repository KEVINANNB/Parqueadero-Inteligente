import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const COLUMNAS_PUBLICAS = `
  id,
  placa,
  marca,
  modelo,
  anio,
  color,
  tipo,
  foto_url,
  foto_fuente_url,
  foto_propietario_url,
  cedula_enmascarada,
  propietario_nombre,
  correo_institucional,
  autorizado
`

export const useVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarVehiculos = useCallback(async () => {
    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('vehiculos')
      .select(COLUMNAS_PUBLICAS)
      .order('propietario_nombre', { ascending: true })

    if (errorSupabase) {
      setVehiculos([])
      setError(errorSupabase.message)
    } else {
      setVehiculos(data ?? [])
    }

    setCargando(false)
  }, [])

  useEffect(() => {
    cargarVehiculos()
  }, [cargarVehiculos])

  // Solo el administrador tiene permiso (según RLS) para crear un vehículo.
  const crearVehiculo = useCallback(async (datos) => {
    const { data, error: errorSupabase } = await supabase
      .from('vehiculos')
      .insert(datos)
      .select(COLUMNAS_PUBLICAS)
      .single()

    if (errorSupabase) return { ok: false, error: errorSupabase.message }
    setVehiculos((actual) =>
      [...actual, data].sort((a, b) => a.propietario_nombre.localeCompare(b.propietario_nombre)),
    )
    return { ok: true, data }
  }, [])

  // Admin puede editar cualquier vehículo; un usuario normal solo el suyo
  // (columnas limitadas). La base de datos (RLS) es la que realmente
  // decide qué se permite; aquí solo se envía la solicitud.
  const actualizarVehiculo = useCallback(async (id, cambios) => {
    const { data, error: errorSupabase } = await supabase
      .from('vehiculos')
      .update(cambios)
      .eq('id', id)
      .select(COLUMNAS_PUBLICAS)
      .single()

    if (errorSupabase) return { ok: false, error: errorSupabase.message }
    setVehiculos((actual) => actual.map((v) => (v.id === id ? data : v)))
    return { ok: true, data }
  }, [])

  const eliminarVehiculo = useCallback(async (id) => {
    const { error: errorSupabase } = await supabase.from('vehiculos').delete().eq('id', id)

    if (errorSupabase) return { ok: false, error: errorSupabase.message }
    setVehiculos((actual) => actual.filter((v) => v.id !== id))
    return { ok: true }
  }, [])

  return {
    vehiculos,
    cargando,
    error,
    recargar: cargarVehiculos,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo,
  }
}
