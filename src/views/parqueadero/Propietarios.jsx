import {
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
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

import {
  useAuth,
} from '../../context/AuthContext'

import usePerfiles
  from '../../hooks/usePerfiles'


/* ================================================================
   FOTO
   ================================================================ */

function FotoPerfil({
  perfil,
}) {
  const [
    fallo,
    setFallo,
  ] =
    useState(false)


  if (
    perfil.foto_url &&
    !fallo
  ) {
    return (
      <img
        src={
          perfil.foto_url
        }

        alt={
          perfil.nombre
        }

        onError={() =>
          setFallo(
            true,
          )
        }

        style={{
          width:
            48,

          height:
            48,

          objectFit:
            'cover',

          borderRadius:
            '50%',

          border:
            '2px solid #d1e7dd',

          background:
            '#ffffff',
        }}
      />
    )
  }


  return (
    <div
      style={{
        width:
          48,

        height:
          48,

        display:
          'grid',

        placeItems:
          'center',

        borderRadius:
          '50%',

        background:
          '#e8f5ed',

        color:
          '#087b26',

        border:
          '2px solid #d1e7dd',

        fontWeight:
          800,
      }}
    >

      {
        perfil.nombre
          ?.charAt(0)
          ?.toUpperCase()
        ||
        'U'
      }

    </div>
  )
}


/* ================================================================
   COMPONENTE
   ================================================================ */

export default function Propietarios() {
  const {
    puedeAdministrar,
  } =
    useAuth()


  const {
    perfiles,
    cargando,
    error,
    recargar,
    cambiarActivo,
  } =
    usePerfiles()


  const [
    busqueda,
    setBusqueda,
  ] =
    useState('')


  const [
    filtroCuenta,
    setFiltroCuenta,
  ] =
    useState('todos')


  const [
    mensaje,
    setMensaje,
  ] =
    useState(null)


  /* ==============================================================
     FILTRADO
     ============================================================== */

  const filtrados =
    useMemo(
      () => {

        const texto =
          busqueda
            .trim()
            .toLowerCase()


        return perfiles.filter(
          (
            perfil,
          ) => {

            /* --------------------------------------------------
               FILTRO CUENTA
               -------------------------------------------------- */

            if (
              filtroCuenta ===
                'con-cuenta' &&
              !perfil.tieneCuenta
            ) {
              return false
            }


            if (
              filtroCuenta ===
                'sin-cuenta' &&
              perfil.tieneCuenta
            ) {
              return false
            }


            /* --------------------------------------------------
               BÚSQUEDA
               -------------------------------------------------- */

            if (
              !texto
            ) {
              return true
            }


            const placas =
              perfil
                .vehiculos
                .map(
                  (
                    vehiculo,
                  ) =>
                    vehiculo.placa,
                )
                .join(' ')


            const autos =
              perfil
                .vehiculos
                .map(
                  (
                    vehiculo,
                  ) =>
                    `${vehiculo.marca} ${vehiculo.modelo}`,
                )
                .join(' ')


            return [
              perfil.nombre,
              perfil.correo,
              perfil.cedula,
              perfil.cedula_enmascarada,
              placas,
              autos,
            ]
              .map(
                (
                  valor,
                ) =>
                  String(
                    valor ||
                    '',
                  )
                    .toLowerCase(),
              )
              .some(
                (
                  valor,
                ) =>
                  valor.includes(
                    texto,
                  ),
              )

          },
        )

      },
      [
        perfiles,
        busqueda,
        filtroCuenta,
      ],
    )


  /* ==============================================================
     ESTADÍSTICAS
     ============================================================== */

  const conCuenta =
    perfiles.filter(
      (
        perfil,
      ) =>
        perfil.tieneCuenta,
    ).length


  const sinCuenta =
    perfiles.filter(
      (
        perfil,
      ) =>
        !perfil.tieneCuenta,
    ).length


  const propietariosConVehiculo =
    perfiles.filter(
      (
        perfil,
      ) =>
        perfil
          .cantidadVehiculos >
        0,
    ).length


  const vehiculosPendientes =
    perfiles.reduce(
      (
        total,
        perfil,
      ) =>
        total +
        perfil.pendientes,
      0,
    )


  /* ==============================================================
     CAMBIAR ESTADO
     ============================================================== */

  const cambiarEstado =
    async (
      perfil,
    ) => {

      if (
        !perfil.tieneCuenta
      ) {
        return
      }


      setMensaje(null)


      const resultado =
        await cambiarActivo(
          perfil.usuario_id,
          !perfil.activo,
        )


      if (
        resultado.ok
      ) {
        setMensaje({

          tipo:
            'success',

          texto:
            perfil.activo
              ? 'Cuenta desactivada correctamente.'
              : 'Cuenta activada correctamente.',

        })
      } else {
        setMensaje({

          tipo:
            'danger',

          texto:
            resultado.error,

        })
      }

    }


  /* ==============================================================
     SIN PERMISOS
     ============================================================== */

  if (
    !puedeAdministrar
  ) {
    return (
      <CAlert color="info">

        <strong>
          Vista de propietarios.
        </strong>

        <br />

        La administración completa
        de propietarios y cuentas
        está disponible únicamente
        en la Vista administrador.

      </CAlert>
    )
  }


  /* ==============================================================
     RENDER
     ============================================================== */

  return (
    <CCard className="shadow-sm border-0">

      {/* ========================================================
          HEADER
          ======================================================== */}

      <CCardHeader
        className="d-flex flex-wrap justify-content-between align-items-center gap-3"
      >

        <div>

          <strong>
            Propietarios y cuentas
          </strong>


          <div className="small text-body-secondary mt-1">

            Todos los propietarios
            registrados en vehículos y
            todas las cuentas del sistema.

          </div>

        </div>


        <CButton
          color="success"
          variant="outline"

          disabled={
            cargando
          }

          onClick={
            recargar
          }
        >
          Actualizar
        </CButton>

      </CCardHeader>


      <CCardBody>

        {/* ======================================================
            MENSAJES
            ====================================================== */}

        {mensaje && (

          <CAlert
            color={
              mensaje.tipo
            }
          >
            {
              mensaje.texto
            }
          </CAlert>

        )}


        {/* ======================================================
            RESUMEN
            ====================================================== */}

        <div
          style={{
            display:
              'grid',

            gridTemplateColumns:
              'repeat(auto-fit, minmax(170px, 1fr))',

            gap:
              12,

            marginBottom:
              20,
          }}
        >

          {/* TOTAL PROPIETARIOS */}

          <div
            className="rounded p-3"

            style={{
              border:
                '1px solid #dfe3e8',

              background:
                '#ffffff',
            }}
          >

            <small className="text-body-secondary">
              Propietarios
            </small>


            <div className="fs-3 fw-bold">

              {
                perfiles.length
              }

            </div>

          </div>


          {/* CON CUENTA */}

          <div
            className="rounded p-3"

            style={{
              border:
                '1px solid #bbf7d0',

              background:
                '#ecfdf5',
            }}
          >

            <small
              style={{
                color:
                  '#166534',
              }}
            >
              Con cuenta
            </small>


            <div
              className="fs-3 fw-bold"

              style={{
                color:
                  '#166534',
              }}
            >

              {
                conCuenta
              }

            </div>

          </div>


          {/* SIN CUENTA */}

          <div
            className="rounded p-3"

            style={{
              border:
                '1px solid #bfdbfe',

              background:
                '#eff6ff',
            }}
          >

            <small
              style={{
                color:
                  '#1d4ed8',
              }}
            >
              Sin cuenta
            </small>


            <div
              className="fs-3 fw-bold"

              style={{
                color:
                  '#1d4ed8',
              }}
            >

              {
                sinCuenta
              }

            </div>

          </div>


          {/* PENDIENTES */}

          <div
            className="rounded p-3"

            style={{
              border:
                '1px solid #fed7aa',

              background:
                '#fff7ed',
            }}
          >

            <small
              style={{
                color:
                  '#9a3412',
              }}
            >
              Vehículos pendientes
            </small>


            <div
              className="fs-3 fw-bold"

              style={{
                color:
                  '#9a3412',
              }}
            >

              {
                vehiculosPendientes
              }

            </div>

          </div>

        </div>


        {/* ======================================================
            INFORMACIÓN SECUNDARIA
            ====================================================== */}

        <div
          className="small text-body-secondary mb-3"
        >

          Propietarios con al menos
          un vehículo:{' '}

          <strong>
            {
              propietariosConVehiculo
            }
          </strong>

        </div>


        {/* ======================================================
            BUSCADOR + FILTROS
            ====================================================== */}

        <div
          className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3"
        >

          <CFormInput
            type="search"

            placeholder="Buscar nombre, correo, cédula, placa o vehículo..."

            value={
              busqueda
            }

            onChange={(
              evento,
            ) =>
              setBusqueda(
                evento
                  .target
                  .value,
              )
            }

            style={{
              maxWidth:
                450,
            }}
          />


          <div
            className="d-flex flex-wrap gap-2"
          >

            <CButton
              size="sm"

              color={
                filtroCuenta ===
                'todos'
                  ? 'primary'
                  : 'secondary'
              }

              variant={
                filtroCuenta ===
                'todos'
                  ? undefined
                  : 'outline'
              }

              onClick={() =>
                setFiltroCuenta(
                  'todos',
                )
              }
            >
              Todos
            </CButton>


            <CButton
              size="sm"

              color="success"

              variant={
                filtroCuenta ===
                'con-cuenta'
                  ? undefined
                  : 'outline'
              }

              onClick={() =>
                setFiltroCuenta(
                  'con-cuenta',
                )
              }
            >
              Con cuenta
            </CButton>


            <CButton
              size="sm"

              color="primary"

              variant={
                filtroCuenta ===
                'sin-cuenta'
                  ? undefined
                  : 'outline'
              }

              onClick={() =>
                setFiltroCuenta(
                  'sin-cuenta',
                )
              }
            >
              Sin cuenta
            </CButton>

          </div>

        </div>


        <div className="text-body-secondary small mb-3">

          Mostrando{' '}

          <strong>
            {
              filtrados.length
            }
          </strong>

          {' '}de{' '}

          <strong>
            {
              perfiles.length
            }
          </strong>

          {' '}propietarios.

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
              Cargando propietarios...
            </p>

          </div>

        )}


        {/* ======================================================
            ERROR
            ====================================================== */}

        {error && (

          <CAlert color="danger">

            <strong>
              No se pudieron cargar
              los propietarios.
            </strong>

            <br />

            {error}

          </CAlert>

        )}


        {/* ======================================================
            TABLA
            ====================================================== */}

        {!cargando &&
          !error && (

          <CTable
            responsive
            hover
            bordered
            align="middle"
          >

            <CTableHead color="light">

              <CTableRow>

                <CTableHeaderCell>
                  Foto
                </CTableHeaderCell>


                <CTableHeaderCell>
                  Propietario
                </CTableHeaderCell>


                <CTableHeaderCell>
                  Correo
                </CTableHeaderCell>


                <CTableHeaderCell>
                  Cédula
                </CTableHeaderCell>


                <CTableHeaderCell>
                  Vehículos
                </CTableHeaderCell>


                <CTableHeaderCell>
                  Placas
                </CTableHeaderCell>


                <CTableHeaderCell>
                  Pendientes
                </CTableHeaderCell>


                <CTableHeaderCell>
                  Cuenta
                </CTableHeaderCell>


                <CTableHeaderCell>
                  Acción
                </CTableHeaderCell>

              </CTableRow>

            </CTableHead>


            <CTableBody>

              {filtrados.map(
                (
                  perfil,
                  indice,
                ) => (

                  <CTableRow
                    key={
                      perfil.usuario_id
                      ||
                      `${perfil.correo}-${perfil.nombre}-${indice}`
                    }
                  >

                    {/* FOTO */}

                    <CTableDataCell>

                      <FotoPerfil
                        perfil={
                          perfil
                        }
                      />

                    </CTableDataCell>


                    {/* PROPIETARIO */}

                    <CTableDataCell>

                      <strong>
                        {
                          perfil.nombre
                        }
                      </strong>


                      <div className="mt-1">

                        {perfil.tieneCuenta ? (

                          <CBadge
                            color="success"
                          >
                            Cuenta registrada
                          </CBadge>

                        ) : (

                          <CBadge
                            color="secondary"
                          >
                            Propietario histórico
                          </CBadge>

                        )}

                      </div>

                    </CTableDataCell>


                    {/* CORREO */}

                    <CTableDataCell>

                      {perfil.correo ? (

                        <a
                          href={
                            `mailto:${perfil.correo}`
                          }

                          style={{
                            color:
                              '#087b26',

                            textDecoration:
                              'none',
                          }}
                        >

                          {
                            perfil.correo
                          }

                        </a>

                      ) : (

                        <span className="text-body-secondary">
                          No registrado
                        </span>

                      )}

                    </CTableDataCell>


                    {/* CÉDULA */}

                    <CTableDataCell>

                      {
                        perfil
                          .cedula_enmascarada
                        ||
                        'No registrada'
                      }

                    </CTableDataCell>


                    {/* VEHÍCULOS */}

                    <CTableDataCell>

                      <CBadge
                        color={
                          perfil
                            .cantidadVehiculos >
                          0
                            ? 'info'
                            : 'secondary'
                        }
                      >

                        {
                          perfil
                            .cantidadVehiculos
                        }

                      </CBadge>

                    </CTableDataCell>


                    {/* PLACAS */}

                    <CTableDataCell>

                      <div
                        className="d-flex flex-wrap gap-1"
                      >

                        {
                          perfil
                            .vehiculos
                            .map(
                              (
                                vehiculo,
                              ) => (

                                <CBadge
                                  color="dark"

                                  key={
                                    vehiculo.id
                                  }
                                >

                                  {
                                    vehiculo.placa
                                  }

                                </CBadge>

                              ),
                            )
                        }


                        {perfil
                          .vehiculos
                          .length ===
                          0 && (

                          <span className="text-body-secondary">
                            —
                          </span>

                        )}

                      </div>

                    </CTableDataCell>


                    {/* PENDIENTES */}

                    <CTableDataCell>

                      {perfil.pendientes >
                        0 ? (

                        <CBadge
                          color="warning"
                          textColor="dark"
                        >

                          {
                            perfil.pendientes
                          }

                        </CBadge>

                      ) : (

                        <span className="text-body-secondary">
                          0
                        </span>

                      )}

                    </CTableDataCell>


                    {/* CUENTA */}

                    <CTableDataCell>

                      {perfil.tieneCuenta ? (

                        <CBadge
                          color={
                            perfil.activo
                              ? 'success'
                              : 'danger'
                          }
                        >

                          {
                            perfil.activo
                              ? 'Activa'
                              : 'Inactiva'
                          }

                        </CBadge>

                      ) : (

                        <CBadge
                          color="secondary"
                        >
                          Sin cuenta
                        </CBadge>

                      )}

                    </CTableDataCell>


                    {/* ACCIÓN */}

                    <CTableDataCell>

                      {perfil.tieneCuenta ? (

                        <CButton
                          size="sm"

                          color={
                            perfil.activo
                              ? 'danger'
                              : 'success'
                          }

                          variant="outline"

                          onClick={() =>
                            cambiarEstado(
                              perfil,
                            )
                          }
                        >

                          {
                            perfil.activo
                              ? 'Desactivar'
                              : 'Activar'
                          }

                        </CButton>

                      ) : (

                        <span
                          className="small text-body-secondary"
                        >
                          Sin cuenta
                        </span>

                      )}

                    </CTableDataCell>

                  </CTableRow>

                ),
              )}


              {filtrados.length ===
                0 && (

                <CTableRow>

                  <CTableDataCell
                    colSpan={9}
                    className="text-center py-5 text-body-secondary"
                  >

                    No se encontraron
                    propietarios.

                  </CTableDataCell>

                </CTableRow>

              )}

            </CTableBody>

          </CTable>

        )}

      </CCardBody>

    </CCard>
  )
}