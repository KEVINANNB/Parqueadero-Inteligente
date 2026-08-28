import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  CAlert,
  CButton,
  CForm,
  CFormInput,
  CSpinner,
} from '@coreui/react'

import {
  useAuth,
} from '../context/AuthContext'

import Logo
  from '../components/Logo'

import PantallaCarga
  from '../components/PantallaCarga'


export default function Login() {
  const {
    iniciarSesion,
    iniciarSesionConGoogle,
    autenticado,
  } = useAuth()


  const navigate =
    useNavigate()


  const [
    email,
    setEmail,
  ] =
    useState('')


  const [
    password,
    setPassword,
  ] =
    useState('')


  const [
    mostrarPassword,
    setMostrarPassword,
  ] =
    useState(false)


  const [
    error,
    setError,
  ] =
    useState('')


  const [
    cargando,
    setCargando,
  ] =
    useState(false)


  const [
    cargandoGoogle,
    setCargandoGoogle,
  ] =
    useState(false)


  /* =========================================================
     SI YA TIENE SESIÓN
     =========================================================

     Si alguien autenticado intenta entrar nuevamente
     a /login, regresamos al menú principal.
     ========================================================= */

  useEffect(() => {
    if (autenticado) {
      navigate(
        '/',
        {
          replace: true,
        },
      )
    }
  }, [
    autenticado,
    navigate,
  ])


  /* =========================================================
     LOGIN CORREO + CONTRASEÑA
     ========================================================= */

  const manejarSubmit =
    async (evento) => {
      evento.preventDefault()

      setError('')

      setCargando(true)


      const {
        error:
          errorSupabase,
      } =
        await iniciarSesion(
          email,
          password,
        )


      if (
        errorSupabase
      ) {
        setCargando(false)

        setError(
          traducirError(
            errorSupabase.message,
          ),
        )

        return
      }


      /*
       * Siempre entramos al MENÚ PRINCIPAL.
       */

      setTimeout(() => {
        navigate(
          '/',
          {
            replace: true,
          },
        )
      }, 600)
    }


  /* =========================================================
     GOOGLE
     ========================================================= */

  const manejarGoogle =
    async () => {
      setError('')

      setCargandoGoogle(
        true,
      )


      const {
        error:
          errorGoogle,
      } =
        await iniciarSesionConGoogle()


      if (
        errorGoogle
      ) {
        setCargandoGoogle(
          false,
        )

        setError(
          traducirError(
            errorGoogle.message,
          ),
        )
      }
    }


  /* =========================================================
     PANTALLA DE TRANSICIÓN
     ========================================================= */

  if (
    cargando ||
    cargandoGoogle
  ) {
    return (
      <PantallaCarga
        texto={
          cargandoGoogle
            ? 'Conectando con Google...'
            : 'Verificando tus credenciales...'
        }
      />
    )
  }


  return (
    <div className="sga-login-page">

      {/* =====================================================
          BARRA PROPIA DEL LOGIN
          ===================================================== */}

      <div className="sga-topbar">

        <div className="sga-topbar-inner">

          <div className="sga-brand">

            <strong>
              SGA
            </strong>

            <span>
              | Smart Parking UTEQ
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          FONDO
          ===================================================== */}

      <div className="sga-login-bg">

        <div className="sga-login-overlay">

          {/* =================================================
              TARJETA LOGIN
              ================================================= */}

          <div className="sga-login-card">

            <div className="sga-logo-wrap">

              <Logo
                width={220}
                height={50}
              />

            </div>


            <h2 className="sga-login-title">
              Entrada al sistema
            </h2>


            <p className="sga-login-subtitle">
              Inicia sesión para acceder
              al Smart Parking UTEQ
            </p>


            {/* ERROR */}

            {error && (
              <CAlert
                color="danger"
                className="sga-login-error"
              >
                {error}
              </CAlert>
            )}


            <CForm
              onSubmit={
                manejarSubmit
              }
            >

              {/* ===============================================
                  CORREO
                  =============================================== */}

              <div className="sga-field">

                <label
                  htmlFor="login-email"
                >
                  Correo electrónico
                </label>


                <CFormInput
                  id="login-email"

                  type="email"

                  placeholder="usuario@uteq.edu.ec"

                  value={
                    email
                  }

                  onChange={(
                    evento,
                  ) =>
                    setEmail(
                      evento.target.value,
                    )
                  }

                  autoComplete="email"

                  required
                />

              </div>


              {/* ===============================================
                  CONTRASEÑA
                  =============================================== */}

              <div className="sga-field">

                <label
                  htmlFor="login-password"
                >
                  Contraseña
                </label>


                <div className="sga-password-wrap">

                  <CFormInput
                    id="login-password"

                    type={
                      mostrarPassword
                        ? 'text'
                        : 'password'
                    }

                    placeholder="••••••••"

                    value={
                      password
                    }

                    onChange={(
                      evento,
                    ) =>
                      setPassword(
                        evento.target.value,
                      )
                    }

                    autoComplete="current-password"

                    required
                  />


                  <button
                    type="button"

                    className="sga-password-toggle"

                    onClick={() =>
                      setMostrarPassword(
                        !mostrarPassword,
                      )
                    }

                    title={
                      mostrarPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >

                    {mostrarPassword
                      ? '🙈'
                      : '👁'}

                  </button>

                </div>

              </div>


              {/* ===============================================
                  ENTRAR
                  =============================================== */}

              <CButton
                type="submit"

                className="sga-login-btn"

                disabled={
                  cargando ||
                  cargandoGoogle
                }
              >

                {cargando ? (
                  <>

                    <CSpinner
                      size="sm"
                      className="me-2"
                    />

                    Ingresando...

                  </>
                ) : (
                  'Entrar'
                )}

              </CButton>


              {/* ===============================================
                  GOOGLE
                  =============================================== */}

              <div className="sga-divider">
                o continúa con
              </div>


              <CButton
                type="button"

                className="sga-google-btn"

                disabled={
                  cargando ||
                  cargandoGoogle
                }

                onClick={
                  manejarGoogle
                }
              >

                {cargandoGoogle ? (

                  <CSpinner
                    size="sm"
                  />

                ) : (

                  <>
                    <span className="sga-google-icon">
                      G
                    </span>

                    Continuar con Google
                  </>

                )}

              </CButton>

            </CForm>


            {/* =================================================
                REGISTRO
                ================================================= */}

            <div className="sga-login-links">

              <Link to="/registro">
                Crear cuenta
              </Link>

            </div>


            <div className="sga-login-footer">

              Universidad Técnica Estatal
              de Quevedo

              <br />

              Smart Parking UTEQ

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   ERRORES SUPABASE
   ========================================================= */

function traducirError(
  mensaje,
) {
  const texto =
    String(
      mensaje ||
      '',
    )
      .toLowerCase()


  if (
    texto.includes(
      'invalid login credentials',
    )
  ) {
    return (
      'Correo o contraseña incorrectos.'
    )
  }


  if (
    texto.includes(
      'email not confirmed',
    )
  ) {
    return (
      'Debes confirmar tu correo electrónico antes de iniciar sesión.'
    )
  }


  if (
    texto.includes(
      'user not found',
    )
  ) {
    return (
      'No existe una cuenta asociada a este correo.'
    )
  }


  if (
    texto.includes(
      'provider is not enabled',
    )
  ) {
    return (
      'El inicio de sesión con Google no está habilitado todavía.'
    )
  }


  return (
    mensaje ||
    'No fue posible iniciar sesión.'
  )
}