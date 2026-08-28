import { useState } from 'react'

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

import useMiCuenta from '../../hooks/useMiCuenta'
import VehiculoFormModal from '../../components/VehiculoFormModal'

export default function MisVehiculos() {
  const {
    vehiculos,
    cargando,
    error,
    actualizarMiVehiculo,
  } = useMiCuenta()

  const [seleccionado, setSeleccionado] =
    useState(null)

  const [mensaje, setMensaje] =
    useState(null)

  const guardar = async (payload) => {
    const resultado =
      await actualizarMiVehiculo(
        seleccionado.id,
        payload,
      )

    if (resultado.ok) {
      setMensaje({
        tipo: 'success',
        texto: 'Vehículo actualizado correctamente.',
      })
    } else {
      setMensaje({
        tipo: 'danger',
        texto: resultado.error,
      })
    }

    return resultado
  }

  if (cargando) {
    return (
      <div className="text-center py-5">
        <CSpinner color="success" />

        <p className="mt-3">
          Cargando tus vehículos...
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <h2>Mis vehículos</h2>

        <p className="text-body-secondary">
          Vehículos asociados a tu cuenta.
        </p>
      </div>

      {error && (
        <CAlert color="danger">
          {error}
        </CAlert>
      )}

      {mensaje && (
        <CAlert color={mensaje.tipo}>
          {mensaje.texto}
        </CAlert>
      )}

      {vehiculos.length === 0 ? (
        <CAlert color="info">
          No existe ningún vehículo asociado
          a tu correo institucional.
        </CAlert>
      ) : (
        <CRow className="g-4">
          {vehiculos.map((vehiculo) => (
            <CCol
              md={6}
              xl={4}
              key={vehiculo.id}
            >
              <CCard className="h-100 shadow-sm">
                <img
                  src={vehiculo.foto_url}
                  alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                  style={{
                    height: 200,
                    width: '100%',
                    objectFit: 'cover',
                  }}
                />

                <CCardBody>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4 className="mb-1">
                        {vehiculo.marca}{' '}
                        {vehiculo.modelo}
                      </h4>

                      <CBadge color="dark">
                        {vehiculo.placa}
                      </CBadge>
                    </div>

                    <CBadge
                      color={
                        vehiculo.autorizado
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {vehiculo.autorizado
                        ? 'Autorizado'
                        : 'No autorizado'}
                    </CBadge>
                  </div>

                  <div className="mb-2">
                    <strong>Año:</strong>{' '}
                    {vehiculo.anio}
                  </div>

                  <div className="mb-2">
                    <strong>Color:</strong>{' '}
                    {vehiculo.color}
                  </div>

                  <div className="mb-3">
                    <strong>Tipo:</strong>{' '}
                    {vehiculo.tipo}
                  </div>

                  <CButton
                    color="success"
                    variant="outline"
                    className="w-100"
                    onClick={() =>
                      setSeleccionado(vehiculo)
                    }
                  >
                    Editar mi vehículo
                  </CButton>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      )}

      <VehiculoFormModal
        visible={!!seleccionado}
        modo="editar-propio"
        vehiculoInicial={seleccionado}
        onClose={() =>
          setSeleccionado(null)
        }
        onGuardar={guardar}
      />
    </>
  )
}