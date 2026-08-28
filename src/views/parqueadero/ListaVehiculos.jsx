import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

import {
  useVehiculos,
} from '../../hooks/useVehiculos'

import {
  useAuth,
} from '../../context/AuthContext'

import VehiculoFormModal
  from '../../components/VehiculoFormModal'

const ListaVehiculos = () => {
  const {
    vehiculos,
    cargando,
    error,
    recargar,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo,
  } = useVehiculos()

  const {
    esAdmin,
    vistaActiva,
    puedeAdministrar,
  } = useAuth()

  const [busqueda, setBusqueda] =
    useState('')

  const [pagina, setPagina] =
    useState(1)

  const vehiculosPorPagina = 10

  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false)

  const [
    modoModal,
    setModoModal,
  ] = useState('crear')

  const [
    vehiculoSeleccionado,
    setVehiculoSeleccionado,
  ] = useState(null)

  const [
    vehiculoAEliminar,
    setVehiculoAEliminar,
  ] = useState(null)

  const [
    eliminando,
    setEliminando,
  ] = useState(false)

  const [
    mensaje,
    setMensaje,
  ] = useState(null)

  useEffect(() => {
    setPagina(1)
  }, [busqueda])

  useEffect(() => {
    if (!mensaje) {
      return
    }

    const temporizador =
      setTimeout(() => {
        setMensaje(null)
      }, 4000)

    return () =>
      clearTimeout(temporizador)
  }, [mensaje])

  /*
   * Un administrador en Vista usuario
   * debe visualmente comportarse como
   * usuario normal.
   *
   * Por eso ocultamos los no autorizados
   * mientras no esté en vista admin.
   */
  const vehiculosVisibles =
    useMemo(() => {
      if (puedeAdministrar) {
        return vehiculos
      }

      return vehiculos.filter(
        (vehiculo) =>
          vehiculo.autorizado,
      )
    }, [
      vehiculos,
      puedeAdministrar,
    ])

  const vehiculosFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase()

      if (!texto) {
        return vehiculosVisibles
      }

      return vehiculosVisibles.filter(
        (vehiculo) =>
          [
            vehiculo.placa,
            vehiculo.marca,
            vehiculo.modelo,
            vehiculo.color,
            vehiculo.propietario_nombre,
            vehiculo.correo_institucional,
          ].some((valor) =>
            String(valor ?? '')
              .toLowerCase()
              .includes(texto),
          ),
      )
    }, [
      vehiculosVisibles,
      busqueda,
    ])

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      vehiculosFiltrados.length /
        vehiculosPorPagina,
    ),
  )

  const paginaActual = Math.min(
    pagina,
    totalPaginas,
  )

  const vehiculosPaginados =
    useMemo(() => {
      const inicio =
        (paginaActual - 1) *
        vehiculosPorPagina

      return vehiculosFiltrados.slice(
        inicio,
        inicio +
          vehiculosPorPagina,
      )
    }, [
      vehiculosFiltrados,
      paginaActual,
    ])

  const abrirAgregar = () => {
    if (!puedeAdministrar) {
      return
    }

    setModoModal('crear')

    setVehiculoSeleccionado(null)

    setModalAbierto(true)
  }

  const abrirEditar = (
    vehiculo,
  ) => {
    if (!puedeAdministrar) {
      return
    }

    setModoModal('editar-admin')

    setVehiculoSeleccionado(
      vehiculo,
    )

    setModalAbierto(true)
  }

  const manejarGuardar =
    async (payload) => {
      if (!puedeAdministrar) {
        return {
          ok: false,
          error:
            'No tienes permisos de administrador.',
        }
      }

      const resultado =
        modoModal === 'crear'
          ? await crearVehiculo(
              payload,
            )
          : await actualizarVehiculo(
              vehiculoSeleccionado.id,
              payload,
            )

      setMensaje(
        resultado.ok
          ? {
              tipo: 'success',

              texto:
                modoModal === 'crear'
                  ? 'Vehículo agregado correctamente.'
                  : 'Vehículo actualizado correctamente.',
            }
          : {
              tipo: 'danger',
              texto:
                resultado.error,
            },
      )

      return resultado
    }

  const confirmarEliminar =
    async () => {
      if (
        !vehiculoAEliminar ||
        !puedeAdministrar
      ) {
        return
      }

      setEliminando(true)

      const resultado =
        await eliminarVehiculo(
          vehiculoAEliminar.id,
        )

      setEliminando(false)

      setVehiculoAEliminar(
        null,
      )

      setMensaje(
        resultado.ok
          ? {
              tipo: 'success',
              texto:
                'Vehículo eliminado correctamente.',
            }
          : {
              tipo: 'danger',
              texto:
                resultado.error,
            },
      )
    }

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <strong>
              Vehículos y propietarios
            </strong>

            {puedeAdministrar && (
              <CBadge color="warning">
                Administración
              </CBadge>
            )}
          </div>

          <div className="small text-body-secondary mt-1">
            Vehículos registrados en
            UTEQ Smart Parking
          </div>
        </div>

        <div className="d-flex gap-2">
          {puedeAdministrar && (
            <CButton
              color="primary"
              onClick={
                abrirAgregar
              }
            >
              + Agregar vehículo
            </CButton>
          )}

          <CButton
            color="success"
            onClick={recargar}
            disabled={cargando}
          >
            Actualizar
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        {mensaje && (
          <CAlert
            color={mensaje.tipo}
          >
            {mensaje.texto}
          </CAlert>
        )}

        {!puedeAdministrar && (
          <CAlert color="info">
            Este apartado se encuentra
            en modo de{' '}
            <strong>
              solo lectura
            </strong>
            . Para modificar tu
            información utiliza{' '}
            <strong>
              Mi perfil
            </strong>{' '}
            o{' '}
            <strong>
              Mis vehículos
            </strong>
            .

            {esAdmin &&
              vistaActiva ===
                'normal' && (
                <>
                  {' '}
                  Tu cuenta tiene permisos
                  administrativos, pero
                  actualmente estás usando
                  la Vista usuario.
                </>
              )}
          </CAlert>
        )}

        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <CFormInput
            type="search"

            placeholder="Buscar placa, vehículo o propietario..."

            value={busqueda}

            onChange={(evento) =>
              setBusqueda(
                evento.target.value,
              )
            }

            style={{
              maxWidth: 420,
            }}
          />

          <span className="text-body-secondary">
            {
              vehiculosFiltrados.length
            }{' '}
            vehículos
          </span>
        </div>

        {cargando && (
          <div className="text-center py-5">
            <CSpinner color="success" />

            <p className="mt-3">
              Cargando vehículos...
            </p>
          </div>
        )}

        {!cargando && error && (
          <CAlert color="danger">
            No se pudieron cargar los
            vehículos: {error}
          </CAlert>
        )}

        {!cargando &&
          !error && (
            <>
              <CTable
                align="middle"
                bordered
                hover
                responsive
                striped
              >
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>
                      Foto
                    </CTableHeaderCell>

                    <CTableHeaderCell>
                      Placa
                    </CTableHeaderCell>

                    <CTableHeaderCell>
                      Vehículo
                    </CTableHeaderCell>

                    <CTableHeaderCell>
                      Año / color
                    </CTableHeaderCell>

                    <CTableHeaderCell>
                      Propietario
                    </CTableHeaderCell>

                    <CTableHeaderCell>
                      Cédula
                    </CTableHeaderCell>

                    <CTableHeaderCell>
                      Correo
                    </CTableHeaderCell>

                    <CTableHeaderCell>
                      Estado
                    </CTableHeaderCell>

                    <CTableHeaderCell>
                      Acciones
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {vehiculosPaginados.length ===
                  0 ? (
                    <CTableRow>
                      <CTableDataCell
                        colSpan={9}
                        className="text-center py-4"
                      >
                        No se encontraron
                        vehículos.
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    vehiculosPaginados.map(
                      (
                        vehiculo,
                      ) => (
                        <CTableRow
                          key={
                            vehiculo.id
                          }
                        >
                          <CTableDataCell>
                            <img
                              src={
                                vehiculo.foto_url
                              }

                              alt={`${vehiculo.marca} ${vehiculo.modelo}`}

                              width="90"

                              height="60"

                              loading="lazy"

                              style={{
                                objectFit:
                                  'cover',

                                borderRadius:
                                  8,
                              }}
                            />
                          </CTableDataCell>

                          <CTableDataCell>
                            <CBadge
                              color="dark"
                              className="fs-6"
                            >
                              {
                                vehiculo.placa
                              }
                            </CBadge>
                          </CTableDataCell>

                          <CTableDataCell>
                            <strong>
                              {
                                vehiculo.marca
                              }
                            </strong>

                            <div className="small text-body-secondary">
                              {
                                vehiculo.modelo
                              }
                            </div>
                          </CTableDataCell>

                          <CTableDataCell>
                            {
                              vehiculo.anio
                            }

                            <div className="small text-body-secondary">
                              {
                                vehiculo.color
                              }
                            </div>
                          </CTableDataCell>

                          <CTableDataCell>
                            {
                              vehiculo.propietario_nombre
                            }
                          </CTableDataCell>

                          <CTableDataCell>
                            {
                              vehiculo.cedula_enmascarada
                            }
                          </CTableDataCell>

                          <CTableDataCell>
                            <a
                              href={`mailto:${vehiculo.correo_institucional}`}
                            >
                              {
                                vehiculo.correo_institucional
                              }
                            </a>
                          </CTableDataCell>

                          <CTableDataCell>
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
                          </CTableDataCell>

                          <CTableDataCell>
                            {puedeAdministrar ? (
                              <div className="d-flex gap-2">
                                <CButton
                                  size="sm"
                                  color="warning"

                                  onClick={() =>
                                    abrirEditar(
                                      vehiculo,
                                    )
                                  }
                                >
                                  Editar
                                </CButton>

                                <CButton
                                  size="sm"
                                  color="danger"

                                  onClick={() =>
                                    setVehiculoAEliminar(
                                      vehiculo,
                                    )
                                  }
                                >
                                  Eliminar
                                </CButton>
                              </div>
                            ) : (
                              <span className="text-body-secondary small">
                                Solo lectura
                              </span>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ),
                    )
                  )}
                </CTableBody>
              </CTable>

              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <small className="text-body-secondary">
                  Página{' '}
                  {paginaActual} de{' '}
                  {totalPaginas}
                </small>

                <div className="d-flex gap-2">
                  <CButton
                    color="secondary"

                    variant="outline"

                    disabled={
                      paginaActual === 1
                    }

                    onClick={() =>
                      setPagina(
                        (valor) =>
                          Math.max(
                            1,
                            valor - 1,
                          ),
                      )
                    }
                  >
                    Anterior
                  </CButton>

                  <CButton
                    color="success"

                    variant="outline"

                    disabled={
                      paginaActual ===
                      totalPaginas
                    }

                    onClick={() =>
                      setPagina(
                        (valor) =>
                          Math.min(
                            totalPaginas,
                            valor + 1,
                          ),
                      )
                    }
                  >
                    Siguiente
                  </CButton>
                </div>
              </div>
            </>
          )}
      </CCardBody>

      {puedeAdministrar && (
        <VehiculoFormModal
          visible={modalAbierto}

          modo={modoModal}

          vehiculoInicial={
            vehiculoSeleccionado
          }

          onClose={() => {
            setModalAbierto(false)

            setVehiculoSeleccionado(
              null,
            )
          }}

          onGuardar={
            manejarGuardar
          }
        />
      )}

      <CModal
        visible={
          !!vehiculoAEliminar &&
          puedeAdministrar
        }

        onClose={() =>
          setVehiculoAEliminar(
            null,
          )
        }

        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>
            Confirmar eliminación
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          ¿Seguro que deseas eliminar
          el vehículo{' '}

          <strong>
            {
              vehiculoAEliminar?.placa
            }
          </strong>{' '}

          de{' '}

          <strong>
            {
              vehiculoAEliminar?.propietario_nombre
            }
          </strong>
          ?

          <br />
          <br />

          Esta acción no se puede
          deshacer.
        </CModalBody>

        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"

            onClick={() =>
              setVehiculoAEliminar(
                null,
              )
            }

            disabled={eliminando}
          >
            Cancelar
          </CButton>

          <CButton
            color="danger"

            onClick={
              confirmarEliminar
            }

            disabled={eliminando}
          >
            {eliminando ? (
              <CSpinner size="sm" />
            ) : (
              'Sí, eliminar'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default ListaVehiculos