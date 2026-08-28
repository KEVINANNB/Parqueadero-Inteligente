import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)

  /*
   * null significa que todavía no se ha elegido manualmente
   * una vista.
   *
   * Un administrador sin preferencia previa entra inicialmente
   * en Vista administrador.
   */
  const [modoVista, setModoVista] = useState(() => {
    return localStorage.getItem('smartparking_modo_vista') || null
  })

  useEffect(() => {
    const cargarSesion = async () => {
      const { data, error } =
        await supabase.auth.getSession()

      if (error) {
        console.error(
          'Error recuperando sesión:',
          error,
        )
      }

      setSesion(data?.session ?? null)
      setCargando(false)
    }

    cargarSesion()

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        (_evento, nuevaSesion) => {
          setSesion(nuevaSesion)
          setCargando(false)
        },
      )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const usuario = sesion?.user ?? null

  /*
   * El rol REAL viene del JWT de Supabase.
   * Nunca se obtiene de localStorage.
   */
  const rol =
    usuario?.app_metadata?.role === 'admin'
      ? 'admin'
      : usuario
        ? 'usuario'
        : null

  const esAdmin = rol === 'admin'

  /*
   * Vista visual:
   *
   * usuario normal -> siempre normal
   * admin -> admin o normal
   */
  const vistaActiva = esAdmin
    ? modoVista || 'admin'
    : 'normal'

  /*
   * Esta variable se usa para mostrar los controles
   * administrativos.
   */
  const puedeAdministrar =
    esAdmin && vistaActiva === 'admin'

  /*
   * Un usuario normal jamás puede activar esta función.
   */
  const cambiarModoVista = (nuevoModo) => {
    if (!esAdmin) {
      return
    }

    const modo =
      nuevoModo === 'admin'
        ? 'admin'
        : 'normal'

    setModoVista(modo)

    localStorage.setItem(
      'smartparking_modo_vista',
      modo,
    )
  }

  const iniciarSesion = (
    email,
    password,
  ) => {
    return supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
  }

  const registrarse = (
    email,
    password,
  ) => {
    return supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    })
  }

  const iniciarSesionConGoogle = () => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',

      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  const cerrarSesion = async () => {
    const resultado =
      await supabase.auth.signOut()

    setModoVista(null)

    localStorage.removeItem(
      'smartparking_modo_vista',
    )

    return resultado
  }

  const valor = {
    sesion,
    usuario,

    rol,

    cargando,

    autenticado: !!usuario,

    esAdmin,

    modoVista,
    vistaActiva,
    puedeAdministrar,

    cambiarModoVista,

    iniciarSesion,
    registrarse,
    iniciarSesionConGoogle,
    cerrarSesion,
  }

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto =
    useContext(AuthContext)

  if (!contexto) {
    throw new Error(
      'useAuth debe usarse dentro de <AuthProvider>',
    )
  }

  return contexto
}