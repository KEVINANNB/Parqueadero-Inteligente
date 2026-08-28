import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      setCargando(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const usuario = sesion?.user ?? null
  const rol = usuario?.app_metadata?.role === 'admin' ? 'admin' : usuario ? 'usuario' : null

  const iniciarSesion = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const registrarse = (email, password) =>
    supabase.auth.signUp({ email, password })

  const iniciarSesionConGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

  const cerrarSesion = () => supabase.auth.signOut()

  const valor = {
    usuario,
    rol,
    cargando,
    autenticado: !!usuario,
    esAdmin: rol === 'admin',
    iniciarSesion,
    registrarse,
    iniciarSesionConGoogle,
    cerrarSesion,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
