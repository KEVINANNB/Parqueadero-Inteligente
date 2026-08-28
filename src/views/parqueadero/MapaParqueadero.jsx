import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'

import CIcon
  from '@coreui/icons-react'

import {
  cilCarAlt,
  cilMap,
  cilReload,
} from '@coreui/icons'

import usePuestos
  from '../../hooks/usePuestos'

import MapaEstacionamiento
  from '../../components/MapaEstacionamiento'


/* ================================================================
   TARJETA DE ESTADÍSTICA
   ================================================================ */

function TarjetaEstado({
  titulo,
  valor,
  descripcion,
  color,
}) {
  return (
    <CCol
      xs={12}
      sm={6}
      lg={3}
    >
      <CCard className="h-100 shadow-sm">
        <CCardBody>
          <div
            className="d-flex justify-content-between align-items-start"
          >
            <div>
              <small className="text-body-secondary">
                {titulo}
              </small>

              <h2 className="mt-1 mb-1">
                {valor}
              </h2>

              <div className="small text-body-secondary">
                {descripcion}
              </div>
            </div>

            <span
              style={{
                width:
                  16,

                height:
                  16,

                borderRadius:
                  '50%',

                background:
                  color,

                display:
                  'inline-block',
              }}
            />
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  )
}


/* ================================================================
   VISTA
   ================================================================ */

export default function MapaParqueadero() {
  const {
    espacios,
    cargando,
    error,
    estadisticas,
    recargarRelaciones,
  } = usePuestos()


  return (
    <div>

      {/* ========================================================
          CABECERA
          ======================================================== */}

      <div
        className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"
      >
        <div>
          <small className="text-success fw-semibold">
            UTEQ SMART PARKING
          </small>

          <div
            className="d-flex align-items-center gap-2 mt-1"
          >
            <CIcon
              icon={cilMap}
              size="xl"
            />

            <h2 className="mb-0">
              Mapa del parqueadero
            </h2>
          </div>

          <p className="text-body-secondary mt-2 mb-0">
            Visualización interactiva
            de los 80 espacios del
            parqueadero del campus UTEQ.
          </p>
        </div>


        <CButton
          color="success"
          variant="outline"
          disabled={cargando}
          onClick={
            recargarRelaciones
          }
        >
          <CIcon
            icon={cilReload}
            className="me-2"
          />

          Actualizar información
        </CButton>
      </div>


      {/* ========================================================
          ERROR
          ======================================================== */}

      {error && (
        <CAlert color="danger">
          <strong>
            No se pudo cargar completamente
            el mapa.
          </strong>

          <br />

          {error.message ||
            String(error)}
        </CAlert>
      )}


      {/* ========================================================
          ESTADÍSTICAS
          ======================================================== */}

      <CRow className="g-3 mb-4">

        <TarjetaEstado
          titulo="Total"
          valor={
            estadisticas.total
          }
          descripcion="Espacios registrados"
          color="#64748b"
        />

        <TarjetaEstado
          titulo="Disponibles"
          valor={
            estadisticas.libres
          }
          descripcion="Espacios libres"
          color="#22c55e"
        />

        <TarjetaEstado
          titulo="Ocupados"
          valor={
            estadisticas.ocupados
          }
          descripcion="Sensores ocupados"
          color="#ef4444"
        />

        <TarjetaEstado
          titulo="Sin identificar"
          valor={
            estadisticas
              .sinIdentificar
          }
          descripcion="Ocupados sin vehículo"
          color="#f59e0b"
        />

      </CRow>


      {/* ========================================================
          LEYENDA
          ======================================================== */}

      <CCard className="shadow-sm mb-3">
        <CCardBody
          className="d-flex flex-wrap justify-content-between align-items-center gap-3 py-3"
        >
          <div
            className="d-flex flex-wrap align-items-center gap-3"
          >
            <strong>
              Estado de los espacios:
            </strong>

            <CBadge
              color="success"
              className="p-2"
            >
              ● Libre
            </CBadge>

            <CBadge
              color="danger"
              className="p-2"
            >
              ● Ocupado
            </CBadge>

            <CBadge
              color="secondary"
              className="p-2"
            >
              ● Sin datos
            </CBadge>
          </div>


          <div className="text-body-secondary small">
            Haz clic sobre cualquier
            espacio para consultar su
            información.
          </div>
        </CCardBody>
      </CCard>


      {/* ========================================================
          MAPA
          ======================================================== */}

      <CCard className="shadow-sm">
        <CCardBody className="p-2">

          {cargando ? (
            <div
              className="text-center py-5"
              style={{
                minHeight:
                  600,

                display:
                  'grid',

                placeItems:
                  'center',
              }}
            >
              <div>
                <CSpinner
                  color="success"
                />

                <h5 className="mt-3">
                  Cargando los 80 espacios...
                </h5>

                <p className="text-body-secondary">
                  Consultando Firebase
                  y Supabase.
                </p>
              </div>
            </div>
          ) : (
            <MapaEstacionamiento
              espacios={
                espacios
              }
              grande
            />
          )}

        </CCardBody>
      </CCard>


      {/* ========================================================
          INFORMACIÓN
          ======================================================== */}

      <CAlert
        color="info"
        className="mt-4"
      >
        <div
          className="d-flex gap-3 align-items-start"
        >
          <CIcon
            icon={cilCarAlt}
            size="xl"
          />

          <div>
            <strong>
              ¿Cómo funciona este mapa?
            </strong>

            <div className="mt-1">
              Firebase determina si el
              sensor está libre u ocupado.
              Supabase relaciona el puesto
              con el vehículo y su
              propietario. Al seleccionar
              un espacio puedes consultar
              ambos conjuntos de
              información.
            </div>
          </div>
        </div>
      </CAlert>

    </div>
  )
}