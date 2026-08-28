import { Navigate, useLocation } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ children }) {
  const { autenticado, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) {
    return (
      <div className="text-center py-5">
        <CSpinner color="success" />
      </div>
    )
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ from: ubicacion.pathname }} replace />
  }

  return children
}
