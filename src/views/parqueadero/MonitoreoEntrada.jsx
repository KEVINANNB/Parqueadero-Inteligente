import {
  Navigate,
} from 'react-router-dom'

import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'

import CIcon
  from '@coreui/icons-react'

import {
  cilCamera,
} from '@coreui/icons'

import {
  useAuth,
} from '../../context/AuthContext'


export default function MonitoreoEntrada() {
  const {
    puedeAdministrar,
  } =
    useAuth()


  /* ==============================================================
     SEGURIDAD

     La actividad solicita que esta vista pertenezca
     al panel administrativo.

     Un usuario normal no debe poder entrar escribiendo
     manualmente la URL.
     ============================================================== */

  if (
    !puedeAdministrar
  ) {
    return (
      <Navigate
        to="/parqueadero/vehiculos"
        replace
      />
    )
  }


  return (
    <>

      <style>{`

        /* =====================================================
           PÁGINA
           ===================================================== */

        .monitoreo-entrada {
          width: 100%;
        }


        /* =====================================================
           CABECERA
           ===================================================== */

        .monitoreo-entrada-encabezado {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          gap: 18px;

          margin-bottom: 18px;
        }


        .monitoreo-entrada-kicker {
          margin-bottom: 4px;

          color: #159447;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: .06em;
        }


        .monitoreo-entrada-titulo {
          margin: 0;

          color: #172033;

          font-size: 27px;
          font-weight: 700;
        }


        .monitoreo-entrada-descripcion {
          max-width: 700px;

          margin-top: 7px;
          margin-bottom: 0;

          color: #687386;

          font-size: 13px;

          line-height: 1.5;
        }


        /* =====================================================
           DOS COLUMNAS
           ===================================================== */

        .monitoreo-entrada-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.05fr)
            minmax(0, .95fr);

          gap: 18px;

          align-items: stretch;
        }


        .monitoreo-entrada-card {
          height: 100%;

          overflow: hidden;

          border:
            1px solid #dfe5eb;

          box-shadow:
            0 4px 14px
            rgba(15, 23, 42, .05);
        }


        .monitoreo-entrada-card
        .card-header {
          padding:
            13px 16px;

          background:
            #f7f9fb;

          border-bottom:
            1px solid #dfe5eb;
        }


        .monitoreo-entrada-card-titulo {
          margin: 0;

          color: #172033;

          font-size: 14px;
          font-weight: 700;
        }


        .monitoreo-entrada-card-subtitulo {
          margin-top: 3px;

          color: #7a8594;

          font-size: 11px;
        }


        /* =====================================================
           ZONA DE CÁMARA
           ===================================================== */

        .monitoreo-camara-marco {
          width: 100%;

          aspect-ratio: 16 / 9;

          min-height: 320px;

          display: grid;
          place-items: center;

          overflow: hidden;

          border:
            2px dashed #cdd7df;

          border-radius:
            10px;

          background:
            linear-gradient(
              135deg,
              #f8fafc,
              #eef4f1
            );

          text-align: center;
        }


        .monitoreo-camara-placeholder {
          max-width: 330px;

          padding: 25px;
        }


        .monitoreo-camara-icono {
          width: 62px;
          height: 62px;

          display: grid;
          place-items: center;

          margin:
            0 auto 14px;

          border-radius:
            50%;

          background:
            #e1f4e7;

          color:
            #159447;
        }


        .monitoreo-camara-icono svg {
          width: 29px;
          height: 29px;
        }


        .monitoreo-camara-placeholder h4 {
          margin-bottom: 7px;

          color: #172033;

          font-size: 17px;
        }


        .monitoreo-camara-placeholder p {
          margin: 0;

          color: #718096;

          font-size: 12px;

          line-height: 1.5;
        }


        /* =====================================================
           BOTONES
           ===================================================== */

        .monitoreo-controles {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 10px;

          margin-top: 14px;
        }


        .monitoreo-detectar {
          grid-column:
            1 / -1;
        }


        /* =====================================================
           RESULTADO VACÍO
           ===================================================== */

        .monitoreo-resultado-vacio {
          min-height: 280px;

          display: flex;
          flex-direction: column;

          justify-content: center;
          align-items: center;

          padding: 30px;

          text-align: center;
        }


        .monitoreo-resultado-vacio-icono {
          width: 60px;
          height: 60px;

          display: grid;
          place-items: center;

          margin-bottom: 14px;

          border-radius: 50%;

          background:
            #eef2f6;

          color:
            #708090;
        }


        .monitoreo-resultado-vacio-icono svg {
          width: 27px;
          height: 27px;
        }


        .monitoreo-resultado-vacio h4 {
          margin-bottom: 7px;

          color: #172033;

          font-size: 18px;
        }


        .monitoreo-resultado-vacio p {
          max-width: 350px;

          margin-bottom: 0;

          color: #718096;

          font-size: 12px;

          line-height: 1.55;
        }


        /* =====================================================
           DATOS VACÍOS DEL RESULTADO
           ===================================================== */

        .monitoreo-datos-espera {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 10px;

          margin-top: 15px;
        }


        .monitoreo-dato {
          padding: 12px;

          border:
            1px solid #e0e6eb;

          border-radius:
            8px;

          background:
            #fafbfc;
        }


        .monitoreo-dato-label {
          display: block;

          margin-bottom: 5px;

          color:
            #7a8594;

          font-size: 10px;

          text-transform: uppercase;

          letter-spacing: .04em;
        }


        .monitoreo-dato-valor {
          color:
            #172033;

          font-size: 13px;
          font-weight: 700;
        }


        /* =====================================================
           TABLET
           ===================================================== */

        @media (
          max-width: 1000px
        ) {

          .monitoreo-entrada-grid {
            grid-template-columns:
              1fr;
          }


          .monitoreo-camara-marco {
            min-height:
              280px;
          }

        }


        /* =====================================================
           MÓVIL
           ===================================================== */

        @media (
          max-width: 600px
        ) {

          .monitoreo-entrada-encabezado {
            flex-direction:
              column;
          }


          .monitoreo-entrada-titulo {
            font-size:
              23px;
          }


          .monitoreo-camara-marco {
            min-height:
              220px;
          }


          .monitoreo-controles {
            grid-template-columns:
              1fr;
          }


          .monitoreo-detectar {
            grid-column:
              auto;
          }


          .monitoreo-datos-espera {
            grid-template-columns:
              1fr;
          }

        }

      `}</style>


      <div className="monitoreo-entrada">

        {/* =====================================================
            CABECERA
            ===================================================== */}

        <div className="monitoreo-entrada-encabezado">

          <div>

            <div className="monitoreo-entrada-kicker">
              CONTROL DE ACCESO
            </div>


            <h2 className="monitoreo-entrada-titulo">
              Monitoreo de entrada
            </h2>


            <p className="monitoreo-entrada-descripcion">

              Reconocimiento automático de placas
              para controlar el ingreso de vehículos
              registrados en UTEQ Smart Parking.

            </p>

          </div>


          <CBadge
            color="warning"
            textColor="dark"
            className="px-3 py-2"
          >
            Administrador
          </CBadge>

        </div>


        {/* =====================================================
            AVISO DEL PASO ACTUAL
            ===================================================== */}

        <CAlert
          color="info"
          className="mb-3"
        >

          <strong>
            Módulo preparado.
          </strong>

          {' '}

          En los siguientes pasos se habilitarán
          la cámara, la selección de imágenes y
          el reconocimiento de placas mediante
          el servicio OCR.

        </CAlert>


        {/* =====================================================
            DOS COLUMNAS
            ===================================================== */}

        <div className="monitoreo-entrada-grid">

          {/* ===================================================
              IZQUIERDA
              =================================================== */}

          <CCard className="monitoreo-entrada-card">

            <CCardHeader>

              <h3 className="monitoreo-entrada-card-titulo">
                Captura del vehículo
              </h3>


              <div className="monitoreo-entrada-card-subtitulo">

                Cámara en tiempo real o imagen
                seleccionada desde el dispositivo.

              </div>

            </CCardHeader>


            <CCardBody>

              <div className="monitoreo-camara-marco">

                <div className="monitoreo-camara-placeholder">

                  <div className="monitoreo-camara-icono">

                    <CIcon
                      icon={
                        cilCamera
                      }
                    />

                  </div>


                  <h4>
                    Cámara preparada
                  </h4>


                  <p>

                    Aquí aparecerá la vista previa
                    de la cámara o la fotografía
                    seleccionada para realizar
                    el reconocimiento.

                  </p>

                </div>

              </div>


              <div className="monitoreo-controles">

                <CButton
                  color="success"
                  disabled
                >
                  Activar cámara
                </CButton>


                <CButton
                  color="secondary"
                  variant="outline"
                  disabled
                >
                  Seleccionar imagen
                </CButton>


                <CButton
                  color="success"
                  className="monitoreo-detectar"
                  disabled
                >
                  Detectar placa
                </CButton>

              </div>

            </CCardBody>

          </CCard>


          {/* ===================================================
              DERECHA
              =================================================== */}

          <CCard className="monitoreo-entrada-card">

            <CCardHeader>

              <h3 className="monitoreo-entrada-card-titulo">
                Resultado del reconocimiento
              </h3>


              <div className="monitoreo-entrada-card-subtitulo">

                Información obtenida mediante
                el servicio OCR y Supabase.

              </div>

            </CCardHeader>


            <CCardBody>

              <div className="monitoreo-resultado-vacio">

                <div className="monitoreo-resultado-vacio-icono">

                  <CIcon
                    icon={
                      cilCamera
                    }
                  />

                </div>


                <h4>
                  Esperando una imagen
                </h4>


                <p>

                  Captura una fotografía o
                  selecciona una imagen del
                  vehículo. Después podrás
                  procesarla para reconocer
                  automáticamente la placa.

                </p>

              </div>


              <div className="monitoreo-datos-espera">

                <div className="monitoreo-dato">

                  <span className="monitoreo-dato-label">
                    Estado
                  </span>

                  <span className="monitoreo-dato-valor">
                    —
                  </span>

                </div>


                <div className="monitoreo-dato">

                  <span className="monitoreo-dato-label">
                    Placa detectada
                  </span>

                  <span className="monitoreo-dato-valor">
                    —
                  </span>

                </div>


                <div className="monitoreo-dato">

                  <span className="monitoreo-dato-label">
                    Confianza OCR
                  </span>

                  <span className="monitoreo-dato-valor">
                    —
                  </span>

                </div>


                <div className="monitoreo-dato">

                  <span className="monitoreo-dato-label">
                    Vehículo
                  </span>

                  <span className="monitoreo-dato-valor">
                    —
                  </span>

                </div>

              </div>

            </CCardBody>

          </CCard>

        </div>

      </div>

    </>
  )
}