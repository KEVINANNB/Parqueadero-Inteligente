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


/* ================================================================
   FOTO DEL PROPIETARIO
   ================================================================

   - Muestra la fotografía circular.
   - Si no existe URL, muestra iniciales.
   - Si la URL está rota, también muestra iniciales.
   ================================================================ */

function FotoPropietario({
  nombre,
  foto,
  size = 52,
}) {
  const [
    errorImagen,
    setErrorImagen,
  ] = useState(false)

  useEffect(() => {
    setErrorImagen(false)
  }, [foto])

  const iniciales = String(
    nombre || 'Usuario',
  )
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) =>
      palabra.charAt(0).toUpperCase(),
    )
    .join('')

  if (!foto || errorImagen) {
    return (
      <div
        title={nombre}
        style={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: '#e8f5ed',
          color: '#087b26',
          border: '2px solid #d1e7dd',
          fontWeight: 700,
          fontSize: size * 0.3,
          userSelect: 'none',
        }}
      >
        {iniciales || 'U'}
      </div>
    )
  }

  return (
    <img
      src={foto}
      alt={`Fotografía de ${nombre}`}
      title={nombre}
      width={size}
      height={size}
      loading="lazy"
      onError={() =>
        setErrorImagen(true)
      }
      style={{
        width: size,
        height: size,
        minWidth: size,
        objectFit: 'cover',
        objectPosition: 'center',
        borderRadius: '50%',
        border: '2px solid #d1e7dd',
        background: '#f3f4f6',
      }}
    />
  )
}


/* ================================================================
   FOTO DEL VEHÍCULO
   ================================================================ */

function FotoVehiculo({
  vehiculo,
}) {
  const [
    errorImagen,
    setErrorImagen,
  ] = useState(false)

  useEffect(() => {
    setErrorImagen(false)
  }, [vehiculo.foto_url])

  if (
    !vehiculo.foto_url ||
    errorImagen
  ) {
    return (
      <div
        style={{
          width: 90,
          height: 60,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 8,
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
          color: '#6b7280',
          fontSize: 12,
          textAlign: 'center',
        }}
      >
        Sin foto
      </div>
    )
  }

  return (
    <img
      src={vehiculo.foto_url}
      alt={`${vehiculo.marca} ${vehiculo.modelo}`}
      width="90"
      height="60"
      loading="lazy"
      onError={() =>
        setErrorImagen(true)
      }
      style={{
        width: 90,
        height: 60,
        objectFit: 'cover',
        borderRadius: 8,
        border:
          '1px solid #e5e7eb',
      }}
    />
  )
}


/* ================================================================
   VISTA PRINCIPAL
   ================================================================ */

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

  const [
    busqueda,
    setBusqueda,
  ] = useState('')

  const [
    pagina,
    setPagina,
  ] = useState(1)

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


  /* =============================================================
     REINICIAR PÁGINA AL BUSCAR
     ============================================================= */

  useEffect(() => {
    setPagina(1)
  }, [busqueda])


  /* =============================================================
     OCULTAR MENSAJES AUTOMÁTICAMENTE
     ============================================================= */

  useEffect(() => {
    if (!mensaje) {
      return
    }

    const temporizador =
      setTimeout(() => {
        setMensaje(null)
      }, 4000)

    return () =>
      clearTimeout(
        temporizador,
      )
  }, [mensaje])


  /* =============================================================
     VEHÍCULOS VISIBLES SEGÚN ROL
     ============================================================= */

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


  /* =============================================================
     BUSCADOR
     ============================================================= */

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
            vehiculo.tipo,
            vehiculo.propietario_nombre,
            vehiculo.correo_institucional,
            vehiculo.cedula_enmascarada,
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


  /* =============================================================
     PAGINACIÓN
     ============================================================= */

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        vehiculosFiltrados.length /
          vehiculosPorPagina,
      ),
    )

  const paginaActual =
    Math.min(
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


  /* =============================================================
     AGREGAR
     ============================================================= */

  const abrirAgregar = () => {
    if (!puedeAdministrar) {
      return
    }

    setModoModal('crear')

    setVehiculoSeleccionado(
      null,
    )

    setModalAbierto(true)
  }


  /* =============================================================
     EDITAR
     ============================================================= */

  const abrirEditar = (
    vehiculo,
  ) => {
    if (!puedeAdministrar) {
      return
    }

    setModoModal(
      'editar-admin',
    )

    setVehiculoSeleccionado(
      vehiculo,
    )

    setModalAbierto(true)
  }


  /* =============================================================
     GUARDAR
     ============================================================= */

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
              tipo:
                'success',

              texto:
                modoModal ===
                'crear'
                  ? 'Vehículo agregado correctamente.'
                  : 'Vehículo actualizado correctamente.',
            }
          : {
              tipo:
                'danger',

              texto:
                resultado.error,
            },
      )

      return resultado
    }


  /* =============================================================
     ELIMINAR
     ============================================================= */

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
              tipo:
                'success',

              texto:
                'Vehículo eliminado correctamente.',
            }
          : {
              tipo:
                'danger',

              texto:
                resultado.error,
            },
      )
    }


  return (
    <CCard className="mb-4 shadow-sm">

      {/* ========================================================
          CABECERA
          ======================================================== */}

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

        {/* ======================================================
            MENSAJES
            ====================================================== */}

        {mensaje && (
          <CAlert
            color={mensaje.tipo}
          >
            {mensaje.texto}
          </CAlert>
        )}


        {/* ======================================================
            SOLO LECTURA
            ====================================================== */}

        {!puedeAdministrar && (
          <CAlert color="info">

            Este apartado se encuentra
            en modo de{' '}

            <strong>
              solo lectura
            </strong>
            .

            {' '}

            Para modificar tu
            información utiliza{' '}

            <strong>
              Mi perfil
            </strong>

            {' '}

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
                  Tu cuenta tiene
                  permisos administrativos,
                  pero actualmente estás
                  usando la Vista usuario.
                </>
              )}

          </CAlert>
        )}


        {/* ======================================================
            BUSCADOR
            ====================================================== */}

        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">

          <CFormInput
            type="search"
            placeholder="Buscar placa, vehículo o propietario..."
            value={busqueda}
            onChange={(
              evento,
            ) =>
              setBusqueda(
                evento.target.value,
              )
            }
            style={{
              maxWidth: 440,
            }}
          />

          <span className="text-body-secondary">
            {
              vehiculosFiltrados.length
            }{' '}
            vehículos
          </span>

        </div>


        {/* ======================================================
            CARGANDO
            ====================================================== */}

        {cargando && (
          <div className="text-center py-5">

            <CSpinner
              color="success"
            />

            <p className="mt-3">
              Cargando vehículos
              y propietarios...
            </p>

          </div>
        )}


        {/* ======================================================
            ERROR
            ====================================================== */}

        {!cargando &&
          error && (
            <CAlert color="danger">

              No se pudieron cargar
              los vehículos:

              {' '}

              {error}

            </CAlert>
          )}


        {/* ======================================================
            TABLA
            ====================================================== */}

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
                      Foto vehículo
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

                    <CTableHeaderCell
                      style={{
                        minWidth: 260,
                      }}
                    >
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

                  {vehiculosPaginados
                    .length === 0 ? (

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

                          {/* ================================
                              FOTO VEHÍCULO
                              ================================ */}

                          <CTableDataCell>

                            <FotoVehiculo
                              vehiculo={
                                vehiculo
                              }
                            />

                          </CTableDataCell>


                          {/* ================================
                              PLACA
                              ================================ */}

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


                          {/* ================================
                              VEHÍCULO
                              ================================ */}

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

                            <div className="small text-body-secondary">
                              {
                                vehiculo.tipo
                              }
                            </div>

                          </CTableDataCell>


                          {/* ================================
                              AÑO / COLOR
                              ================================ */}

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


                          {/* ================================
                              PROPIETARIO + FOTO
                              ================================ */}

                          <CTableDataCell>

                            <div className="d-flex align-items-center gap-3">

                              <FotoPropietario
                                nombre={
                                  vehiculo.propietario_nombre
                                }
                                foto={
                                  vehiculo.foto_propietario_url
                                }
                                size={54}
                              />

                              <div>

                                <div className="fw-semibold">
                                  {
                                    vehiculo.propietario_nombre
                                  }
                                </div>

                                <div className="small text-body-secondary">
                                  Propietario
                                </div>

                              </div>

                            </div>

                          </CTableDataCell>


                          {/* ================================
                              CÉDULA
                              ================================ */}

                          <CTableDataCell>

                            {
                              vehiculo.cedula_enmascarada
                            }

                          </CTableDataCell>


                          {/* ================================
                              CORREO
                              ================================ */}

                          <CTableDataCell>

                            <a
                              href={`mailto:${vehiculo.correo_institucional}`}
                            >
                              {
                                vehiculo.correo_institucional
                              }
                            </a>

                          </CTableDataCell>


                          {/* ================================
                              ESTADO
                              ================================ */}

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


                          {/* ================================
                              ACCIONES
                              ================================ */}

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


              {/* ==================================================
                  PAGINACIÓN
                  ================================================== */}

              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">

                <small className="text-body-secondary">

                  Página{' '}
                  {paginaActual}{' '}
                  de{' '}
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
                        (
                          valor,
                        ) =>
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
                        (
                          valor,
                        ) =>
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


      {/* ========================================================
          FORMULARIO ADMIN
          ======================================================== */}

      {puedeAdministrar && (
        <VehiculoFormModal
          visible={
            modalAbierto
          }
          modo={
            modoModal
          }
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


      {/* ========================================================
          CONFIRMAR ELIMINACIÓN
          ======================================================== */}

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

          <div className="d-flex align-items-center gap-3 mb-3">

            {vehiculoAEliminar && (

              <FotoPropietario
                nombre={
                  vehiculoAEliminar
                    .propietario_nombre
                }
                foto={
                  vehiculoAEliminar
                    .foto_propietario_url
                }
                size={60}
              />

            )}

            <div>

              <strong>
                {
                  vehiculoAEliminar
                    ?.propietario_nombre
                }
              </strong>

              <div className="text-body-secondary">

                {
                  vehiculoAEliminar
                    ?.placa
                }

              </div>

            </div>

          </div>


          ¿Seguro que deseas eliminar
          este vehículo?

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
            disabled={
              eliminando
            }
          >
            Cancelar
          </CButton>


          <CButton
            color="danger"
            onClick={
              confirmarEliminar
            }
            disabled={
              eliminando
            }
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