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
    mensaje,
    setMensaje,
  ] =
    useState(null)


  const filtrados =
    useMemo(
      () => {

        const texto =
          busqueda
            .trim()
            .toLowerCase()


        if (
          !texto
        ) {
          return perfiles
        }


        return perfiles.filter(
          (
            perfil,
          ) => {

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


            return [
              perfil.nombre,
              perfil.correo,
              perfil.cedula,
              placas,
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
      ],
    )


  const cambiarEstado =
    async (
      perfil,
    ) => {

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
              ? 'Cuenta desactivada.'
              : 'Cuenta activada.',

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
        de cuentas está disponible
        únicamente en la Vista
        administrador.

        Los usuarios normales pueden
        consultar los propietarios
        asociados desde Vehículos.

      </CAlert>
    )
  }


  return (
    <CCard className="shadow-sm border-0">

      <CCardHeader
        className="d-flex flex-wrap justify-content-between align-items-center gap-3"
      >

        <div>

          <strong>
            Propietarios y cuentas
          </strong>


          <div className="small text-body-secondary mt-1">

            Todas las cuentas registradas,
            tengan o no vehículos asociados.

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


        {/* ===================================================
            RESUMEN
            =================================================== */}

        <div
          style={{
            display:
              'grid',

            gridTemplateColumns:
              'repeat(auto-fit,minmax(180px,1fr))',

            gap:
              12,

            marginBottom:
              20,
          }}
        >

          <div className="border rounded p-3">

            <small className="text-body-secondary">
              Cuentas registradas
            </small>

            <div className="fs-3 fw-bold">
              {
                perfiles.length
              }
            </div>

          </div>


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
              Con vehículo
            </small>

            <div
              className="fs-3 fw-bold"
              style={{
                color:
                  '#166534',
              }}
            >

              {
                perfiles.filter(
                  (
                    perfil,
                  ) =>
                    perfil
                      .cantidadVehiculos >
                    0,
                ).length
              }

            </div>

          </div>


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
              Sin vehículos
            </small>

            <div
              className="fs-3 fw-bold"
              style={{
                color:
                  '#1d4ed8',
              }}
            >

              {
                perfiles.filter(
                  (
                    perfil,
                  ) =>
                    perfil
                      .cantidadVehiculos ===
                    0,
                ).length
              }

            </div>

          </div>


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
                perfiles.reduce(
                  (
                    total,
                    perfil,
                  ) =>
                    total +
                    perfil.pendientes,
                  0,
                )
              }

            </div>

          </div>

        </div>


        {/* ===================================================
            BUSCADOR
            =================================================== */}

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">

          <CFormInput

            type="search"

            placeholder="Buscar nombre, correo, cédula o placa..."

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


          <span className="text-body-secondary">

            {
              filtrados.length
            }

            {' '}cuentas

          </span>

        </div>


        {cargando && (

          <div className="text-center py-5">

            <CSpinner
              color="success"
            />

            <p className="mt-3">
              Cargando cuentas...
            </p>

          </div>

        )}


        {error && (

          <CAlert color="danger">
            {error}
          </CAlert>

        )}


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
                ) => (

                  <CTableRow
                    key={
                      perfil.usuario_id
                    }
                  >

                    <CTableDataCell>

                      <FotoPerfil
                        perfil={
                          perfil
                        }
                      />

                    </CTableDataCell>


                    <CTableDataCell>

                      <strong>
                        {
                          perfil.nombre
                        }
                      </strong>


                      {perfil
                        .cantidadVehiculos ===
                        0 && (

                        <div>

                          <CBadge
                            color="secondary"
                            className="mt-1"
                          >
                            Sin vehículos
                          </CBadge>

                        </div>

                      )}

                    </CTableDataCell>


                    <CTableDataCell>

                      <a
                        href={
                          `mailto:${perfil.correo}`
                        }
                      >
                        {
                          perfil.correo
                        }
                      </a>

                    </CTableDataCell>


                    <CTableDataCell>

                      {
                        perfil
                          .cedula_enmascarada
                      }

                    </CTableDataCell>


                    <CTableDataCell>

                      <CBadge color="info">

                        {
                          perfil
                            .cantidadVehiculos
                        }

                      </CBadge>

                    </CTableDataCell>


                    <CTableDataCell>

                      <div className="d-flex flex-wrap gap-1">

                        {
                          perfil.vehiculos.map(
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
                          '—'
                        )}

                      </div>

                    </CTableDataCell>


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


                    <CTableDataCell>

                      <CBadge
                        color={
                          perfil.activo
                            ? 'success'
                            : 'danger'
                        }
                      >

                        {
                          perfil.activo
                            ? 'Activo'
                            : 'Inactivo'
                        }

                      </CBadge>

                    </CTableDataCell>


                    <CTableDataCell>

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

                    </CTableDataCell>

                  </CTableRow>

                ),
              )}

            </CTableBody>

          </CTable>

        )}

      </CCardBody>

    </CCard>
  )
}