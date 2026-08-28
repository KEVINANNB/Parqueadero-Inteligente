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


export default function Registro() {
  const {
    registrarse,
    iniciarSesionConGoogle,
    cerrarSesion,
    autenticado,
  } =
    useAuth()


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
    confirmarPassword,
    setConfirmarPassword,
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
    exito,
    setExito,
  ] =
    useState(false)


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
     SI YA ESTÁ AUTENTICADO
     ========================================================= */

  useEffect(() => {
    if (
      autenticado &&
      !cargando &&
      !cargandoGoogle &&
      !exito
    ) {
      navigate(
        '/',
        {
          replace: true,
        },
      )
    }
  }, [
    autenticado,
    cargando,
    cargandoGoogle,
    exito,
    navigate,
  ])


  /* =========================================================
     REGISTRO
     ========================================================= */

  const manejarSubmit =
    async (evento) => {
      evento.preventDefault()

      setError('')


      if (
        password !==
        confirmarPassword
      ) {
        setError(
          'Las contraseñas no coinciden.',
        )

        return
      }


      if (
        password.length < 6
      ) {
        setError(
          'La contraseña debe tener al menos 6 caracteres.',
        )

        return
      }


      setCargando(true)


      const {
        error:
        errorSupabase,
      } =
        await registrarse(
          email,
          password,
        )


      if (
        errorSupabase
      ) {
        setCargando(false)

        setError(
          traducirErrorRegistro(
            errorSupabase.message,
          ),
        )

        return
      }


      /*
       * Si Supabase creó automáticamente
       * una sesión al registrarse,
       * la cerramos.
       *
       * Queremos mantener:
       *
       * REGISTRO
       *    ↓
       * LOGIN
       *    ↓
       * ENTRAR
       */

      try {
        await cerrarSesion()
      } catch {
        // No pasa nada si no existía sesión.
      }


      setExito(true)


      setTimeout(() => {
        navigate(
          '/login',
          {
            replace: true,
          },
        )
      }, 1800)
    }


  /* =========================================================
     GOOGLE
     ========================================================= */

  const manejarGoogle =
    async () => {
      setError('')

      setCargandoGoogle(true)


      const {
        error:
        errorGoogle,
      } =
        await iniciarSesionConGoogle()


      if (
        errorGoogle
      ) {
        setCargandoGoogle(false)

        setError(
          errorGoogle.message,
        )
      }
    }


  /* =========================================================
     CARGANDO
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
            : 'Creando tu cuenta...'
        }
      />
    )
  }


  /* =========================================================
     REGISTRO
     ========================================================= */

  return (
    <div className="sga-login-page">

      {/* =====================================================
          BARRA
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
              TARJETA
              ================================================= */}

          <div className="sga-login-card sga-register-card">

            <div className="sga-logo-wrap">

              <Logo
                width={220}
                height={50}
              />

            </div>


            <h2 className="sga-login-title">
              Crear cuenta
            </h2>


            <p className="sga-login-subtitle">
              Registra tu cuenta para
              acceder al Smart Parking UTEQ.
            </p>


            {/* =================================================
                ERROR
                ================================================= */}

            {error && (

              <CAlert
                color="danger"
                className="sga-login-error"
              >
                {error}
              </CAlert>

            )}


            {/* =================================================
                ÉXITO
                ================================================= */}

            {exito && (

              <CAlert
                color="success"
                className="sga-register-success"
              >

                <strong>
                  Cuenta creada correctamente.
                </strong>

                <br />

                Serás enviado al inicio de
                sesión.

              </CAlert>

            )}


            {!exito && (

              <CForm
                onSubmit={
                  manejarSubmit
                }
              >

                {/* =============================================
                    CORREO
                    ============================================= */}

                <div className="sga-field">

                  <label
                    htmlFor="registro-email"
                  >
                    Correo institucional
                  </label>


                  <CFormInput
                    id="registro-email"

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

                    required
                  />

                </div>


                {/* =============================================
                    CONTRASEÑA
                    ============================================= */}

                <div className="sga-field">

                  <label
                    htmlFor="registro-password"
                  >
                    Contraseña
                  </label>


                  <div className="sga-password-wrap">

                    <CFormInput
                      id="registro-password"

                      type={
                        mostrarPassword
                          ? 'text'
                          : 'password'
                      }

                      placeholder="Mínimo 6 caracteres"

                      minLength={6}

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

                      required
                    />


                    <button
                      type="button"

                      className="sga-password-toggle"

                      onClick={() =>
                        setMostrarPassword(
                          (
                            actual,
                          ) =>
                            !actual,
                        )
                      }
                    >

                      {mostrarPassword
                        ? '🙈'
                        : '👁'}

                    </button>

                  </div>

                </div>


                {/* =============================================
                    CONFIRMAR
                    ============================================= */}

                <div className="sga-field">

                  <label
                    htmlFor="registro-confirmar"
                  >
                    Confirmar contraseña
                  </label>


                  <CFormInput
                    id="registro-confirmar"

                    type={
                      mostrarPassword
                        ? 'text'
                        : 'password'
                    }

                    placeholder="Repite tu contraseña"

                    minLength={6}

                    value={
                      confirmarPassword
                    }

                    onChange={(
                      evento,
                    ) =>
                      setConfirmarPassword(
                        evento.target.value,
                      )
                    }

                    required
                  />

                </div>


                {/* =============================================
                    REGISTRAR
                    ============================================= */}

                <CButton
                  type="submit"

                  className="sga-login-btn"

                  disabled={
                    cargando ||
                    cargandoGoogle
                  }
                >
                  Crear mi cuenta
                </CButton>


                {/* =============================================
                    GOOGLE
                    ============================================= */}

                <div className="sga-divider">
                  o continúa con
                </div>


                <CButton
                  type="button"

                  className="sga-google-btn"

                  onClick={
                    manejarGoogle
                  }
                >

                  <span className="sga-google-icon">
                    G
                  </span>

                  Continuar con Google

                </CButton>

              </CForm>

            )}


            {/* =================================================
                LOGIN
                ================================================= */}

            <div className="sga-login-links text-center">

              ¿Ya tienes una cuenta?

              {' '}

              <Link to="/login">
                Inicia sesión
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


function traducirErrorRegistro(
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
      'user already registered',
    )
  ) {
    return (
      'Este correo ya tiene una cuenta registrada.'
    )
  }


  if (
    texto.includes(
      'password should be at least',
    )
  ) {
    return (
      'La contraseña debe tener al menos 6 caracteres.'
    )
  }


  if (
    texto.includes(
      'invalid email',
    )
  ) {
    return (
      'Ingresa un correo electrónico válido.'
    )
  }


  return (
    mensaje ||
    'No fue posible crear la cuenta.'
  )
}