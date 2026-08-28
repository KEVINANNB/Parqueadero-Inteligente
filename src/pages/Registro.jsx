import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CForm, CFormInput, CFormLabel, CSpinner } from '@coreui/react'
import { useAuth } from '../context/AuthContext'

export default function Registro() {
  const { registrarse, iniciarSesionConGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [cargando, setCargando] = useState(false)

  const manejarSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    const { error: errorSupabase } = await registrarse(email, password)
    setCargando(false)
    if (errorSupabase) {
      setError(errorSupabase.message)
      return
    }
    setExito(true)
    setTimeout(() => navigate('/login'), 2500)
  }

  return (
    <div className="auth-shell">
      <CCard style={{ maxWidth: 420, width: '100%' }}>
        <CCardBody>
          <h4 className="mb-3">Crear cuenta</h4>

          {error && <CAlert color="danger">{error}</CAlert>}
          {exito && (
            <CAlert color="success">
              Cuenta creada. Revisa tu correo para confirmar (si aplica) y luego inicia sesión.
            </CAlert>
          )}

          <CForm onSubmit={manejarSubmit}>
            <div className="mb-3">
              <CFormLabel>Correo institucional</CFormLabel>
              <CFormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <CFormLabel>Contraseña</CFormLabel>
              <CFormInput
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <CButton type="submit" color="success" className="w-100 mb-2" disabled={cargando}>
              {cargando ? <CSpinner size="sm" /> : 'Registrarme'}
            </CButton>
            <CButton
              type="button"
              color="light"
              className="w-100"
              onClick={() => iniciarSesionConGoogle()}
            >
              Continuar con Google
            </CButton>
          </CForm>

          <p className="text-center mt-3 mb-0 small">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </CCardBody>
      </CCard>
    </div>
  )
}
