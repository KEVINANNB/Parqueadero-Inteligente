import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CForm, CFormInput, CFormLabel, CSpinner } from '@coreui/react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function Login() {
  const { iniciarSesion, iniciarSesionConGoogle } = useAuth()
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const destino = ubicacion.state?.from || '/parqueadero/vehiculos'

  const manejarSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    const { error: errorSupabase } = await iniciarSesion(email, password)
    setCargando(false)
    if (errorSupabase) {
      setError(errorSupabase.message)
      return
    }
    navigate(destino, { replace: true })
  }

  return (
    <div className="auth-shell">
      <CCard style={{ maxWidth: 420, width: '100%' }}>
        <CCardBody>
          <div className="text-center mb-4">
            <Logo
              width={230}
              height={60}
            />
          </div>
          <h4 className="mb-3">Iniciar sesión</h4>

          {error && <CAlert color="danger">{error}</CAlert>}

          <CForm onSubmit={manejarSubmit}>
            <div className="mb-3">
              <CFormLabel>Correo</CFormLabel>
              <CFormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <CFormLabel>Contraseña</CFormLabel>
              <CFormInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <CButton type="submit" color="success" className="w-100 mb-2" disabled={cargando}>
              {cargando ? <CSpinner size="sm" /> : 'Ingresar'}
            </CButton>
            <CButton
              type="button"
              color="light"
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => iniciarSesionConGoogle()}
            >
              Continuar con Google
            </CButton>
          </CForm>

          <p className="text-center mt-3 mb-0 small">
            ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
          </p>
        </CCardBody>
      </CCard>
    </div>
  )
}
