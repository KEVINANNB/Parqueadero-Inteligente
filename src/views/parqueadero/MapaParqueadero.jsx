import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilMap, cilReload } from '@coreui/icons'

import usePuestos from '../../hooks/usePuestos'
import MapaParqueaderoVisual from '../../components/MapaParqueaderoVisual'

function TarjetaEstado({
  titulo,
  valor,
  descripcion,
  color,
}) {
  return (
    <CCol xs={12} sm={6} lg={3}>
      <CCard className="h-100 shadow-sm border-0">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-start">
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
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: color,
                display: 'inline-block',
              }}
            />
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  )
}

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
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <small className="text-success fw-semibold">
            UTEQ SMART PARKING
          </small>

          <div className="d-flex align-items-center gap-2 mt-1">
            <CIcon icon={cilMap} size="xl" />
            <h2 className="mb-0">Mapa del parqueadero</h2>
          </div>

          <p className="text-body-secondary mt-2 mb-0">
            Vista visual e interactiva de los 80 espacios.
          </p>
        </div>

        <CButton
          color="success"
          variant="outline"
          disabled={cargando}
          onClick={recargarRelaciones}
        >
          <CIcon icon={cilReload} className="me-2" />
          Actualizar información
        </CButton>
      </div>

      {error && (
        <CAlert color="danger">
          <strong>No se pudo cargar el mapa del parqueadero.</strong>
          <br />
          {error.message || String(error)}
        </CAlert>
      )}

      <CRow className="g-3 mb-4">
        <TarjetaEstado
          titulo="Total"
          valor={estadisticas.total}
          descripcion="Espacios registrados"
          color="#64748b"
        />

        <TarjetaEstado
          titulo="Disponibles"
          valor={estadisticas.libres}
          descripcion="Espacios libres"
          color="#22c55e"
        />

        <TarjetaEstado
          titulo="Ocupados"
          valor={estadisticas.ocupados}
          descripcion="Sensores ocupados"
          color="#ef4444"
        />

        <TarjetaEstado
          titulo="Sin identificar"
          valor={estadisticas.sinIdentificar}
          descripcion="Ocupados sin vehículo"
          color="#f59e0b"
        />
      </CRow>

      <CCard className="shadow-sm border-0">
        <CCardBody className="p-3 p-md-4">
          {cargando ? (
            <div
              className="text-center py-5"
              style={{
                minHeight: 500,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <div>
                <CSpinner color="success" />
                <h5 className="mt-3">Cargando los 80 espacios...</h5>
                <p className="text-body-secondary mb-0">
                  Consultando Firebase y Supabase.
                </p>
              </div>
            </div>
          ) : (
            <MapaParqueaderoVisual espacios={espacios} />
          )}
        </CCardBody>
      </CCard>
    </div>
  )
}