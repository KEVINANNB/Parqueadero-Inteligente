import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const COLUMNAS_MI_CUENTA = `
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

export default function useMiCuenta() {
  const { usuario } = useAuth()

  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    if (!usuario?.email) {
      setVehiculos([])
      setCargando(false)
      return
    }

    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('vehiculos')
      .select(COLUMNAS_MI_CUENTA)
      .eq('correo_institucional', usuario.email)
      .order('id', { ascending: true })

    if (errorSupabase) {
      setVehiculos([])
      setError(errorSupabase.message)
    } else {
      setVehiculos(data ?? [])
    }

    setCargando(false)
  }, [usuario?.email])

  useEffect(() => {
    cargar()
  }, [cargar])

  const perfil = useMemo(() => {
    const primerVehiculo = vehiculos[0]

    return {
      nombre:
        primerVehiculo?.propietario_nombre ||
        usuario?.user_metadata?.full_name ||
        usuario?.email?.split('@')[0] ||
        'Usuario',

      correo:
        primerVehiculo?.correo_institucional ||
        usuario?.email ||
        '',

      cedula:
        primerVehiculo?.cedula_enmascarada ||
        'No registrada',

      foto:
        primerVehiculo?.foto_propietario_url ||
        usuario?.user_metadata?.avatar_url ||
        usuario?.user_metadata?.picture ||
        '',
    }
  }, [vehiculos, usuario])

  const actualizarPerfil = useCallback(
    async ({ propietario_nombre, foto_propietario_url }) => {
      if (!usuario?.email) {
        return {
          ok: false,
          error: 'No existe una sesión activa.',
        }
      }

      const cambios = {
        propietario_nombre: propietario_nombre.trim().toUpperCase(),
        foto_propietario_url: foto_propietario_url.trim(),
      }

      const { error: errorSupabase } = await supabase
        .from('vehiculos')
        .update(cambios)
        .eq('correo_institucional', usuario.email)

      if (errorSupabase) {
        return {
          ok: false,
          error: errorSupabase.message,
        }
      }

      await cargar()

      return {
        ok: true,
      }
    },
    [usuario?.email, cargar],
  )

  const actualizarMiVehiculo = useCallback(
    async (id, cambios) => {
      if (!usuario?.email) {
        return {
          ok: false,
          error: 'No existe una sesión activa.',
        }
      }

      const { data, error: errorSupabase } = await supabase
        .from('vehiculos')
        .update(cambios)
        .eq('id', id)
        .eq('correo_institucional', usuario.email)
        .select(COLUMNAS_MI_CUENTA)
        .single()

      if (errorSupabase) {
        return {
          ok: false,
          error: errorSupabase.message,
        }
      }

      setVehiculos((actual) =>
        actual.map((vehiculo) =>
          vehiculo.id === id ? data : vehiculo,
        ),
      )

      return {
        ok: true,
        data,
      }
    },
    [usuario?.email],
  )

  return {
    perfil,
    vehiculos,
    cargando,
    error,
    recargar: cargar,
    actualizarPerfil,
    actualizarMiVehiculo,
  }
}