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
  useVehiculos,
} from '../../hooks/useVehiculos'

import {
  useAuth,
} from '../../context/AuthContext'


/* ================================================================
   FOTO DEL PROPIETARIO
   ================================================================ */

function FotoPropietario({
  propietario,
}) {
  const [
    errorImagen,
    setErrorImagen,
  ] =
    useState(false)


  const iniciales =
    String(
      propietario.nombre ||
      'Usuario',
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (
          palabra,
        ) =>
          palabra[0]
            ?.toUpperCase(),
      )
      .join('')


  if (
    !propietario.foto ||
    errorImagen
  ) {
    return (
      <div
        style={{
          width: 52,
          height: 52,

          display: 'grid',
          placeItems: 'center',

          borderRadius: '50%',

          background:
            '#e8f5ed',

          color:
            '#087b26',

          border:
            '2px solid #cde8d6',

          fontWeight: 800,

          fontSize: 14,
        }}
      >
        {
          iniciales ||
          'U'
        }
      </div>
    )
  }


  return (
    <img
      src={
        propietario.foto
      }

      alt={
        propietario.nombre ||
        'Propietario'
      }

      onError={() =>
        setErrorImagen(
          true,
        )
      }

      style={{
        width: 52,
        height: 52,

        objectFit:
          'cover',

        borderRadius:
          '50%',

        border:
          '2px solid #d1e7dd',

        boxShadow:
          '0 3px 9px rgba(15,23,42,.09)',
      }}
    />
  )
}


/* ================================================================
   COMPONENTE
   ================================================================ */

export default function Propietarios() {
  const {
    vehiculos,
    cargando,
    error,
    recargar,
  } =
    useVehiculos()


  const {
    puedeAdministrar,
  } =
    useAuth()


  const [
    busqueda,
    setBusqueda,
  ] =
    useState('')


  /* ==============================================================
     AGRUPAR VEHÍCULOS POR PROPIETARIO
     ============================================================== */

  const propietarios =
    useMemo(() => {

      const mapa =
        new Map()


      /*
       * En vista administrador:
       * muestra todos.
       *
       * En vista usuario:
       * conservamos únicamente
       * registros autorizados.
       */

      const fuente =
        puedeAdministrar
          ? vehiculos
          : vehiculos.filter(
              (
                vehiculo,
              ) =>
                vehiculo.autorizado,
            )


      fuente.forEach(
        (
          vehiculo,
        ) => {

          /*
           * Idealmente agrupamos por correo,
           * porque suele ser único.
           */

          const llave =
            vehiculo
              .correo_institucional
            ||
            vehiculo
              .propietario_nombre
            ||
            String(
              vehiculo.id,
            )


          if (
            !mapa.has(
              llave,
            )
          ) {

            mapa.set(
              llave,
              {
                id:
                  llave,

                nombre:
                  vehiculo
                    .propietario_nombre
                  ||
                  'Sin nombre',

                correo:
                  vehiculo
                    .correo_institucional
                  ||
                  '',

                cedula:
                  vehiculo
                    .cedula_enmascarada
                  ||
                  '',

                foto:
                  vehiculo
                    .foto_propietario_url
                  ||
                  '',

                vehiculos:
                  [],
              },
            )

          }


          mapa
            .get(llave)
            .vehiculos
            .push(
              vehiculo,
            )

        },
      )


      return Array.from(
        mapa.values(),
      )
        .sort(
          (
            a,
            b,
          ) =>
            a.nombre
              .localeCompare(
                b.nombre,
                'es',
                {
                  sensitivity:
                    'base',
                },
              ),
        )

    }, [
      vehiculos,
      puedeAdministrar,
    ])


  /* ==============================================================
     BÚSQUEDA
     ============================================================== */

  const propietariosFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase()


      if (!texto) {
        return propietarios
      }


      return propietarios.filter(
        (
          propietario,
        ) => {

          const placas =
            propietario
              .vehiculos
              .map(
                (
                  vehiculo,
                ) =>
                  vehiculo.placa,
              )
              .join(' ')


          const vehiculosTexto =
            propietario
              .vehiculos
              .map(
                (
                  vehiculo,
                ) =>
                  `${vehiculo.marca} ${vehiculo.modelo}`,
              )
              .join(' ')


          return [
            propietario.nombre,
            propietario.correo,
            propietario.cedula,
            placas,
            vehiculosTexto,
          ]
            .map(
              (
                valor,
              ) =>
                String(
                  valor ??
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
    }, [
      propietarios,
      busqueda,
    ])


  /* ==============================================================
     ESTADÍSTICAS
     ============================================================== */

  const totalVehiculos =
    propietarios.reduce(
      (
        acumulado,
        propietario,
      ) =>
        acumulado +
        propietario
          .vehiculos
          .length,
      0,
    )


  const propietariosConVarios =
    propietarios.filter(
      (
        propietario,
      ) =>
        propietario
          .vehiculos
          .length >
        1,
    ).length


  return (
    <CCard className="shadow-sm border-0">

      {/* ========================================================
          HEADER
          ======================================================== */}

      <CCardHeader
        className="d-flex flex-wrap justify-content-between align-items-center gap-3"
      >

        <div>

          <div
            className="d-flex align-items-center gap-2"
          >

            <strong
              style={{
                fontSize: 16,
              }}
            >
              Propietarios
            </strong>


            <CBadge color="info">

              {
                propietarios.length
              }

              {' '}registrados

            </CBadge>

          </div>


          <div className="small text-body-secondary mt-1">

            Personas asociadas a los
            vehículos registrados en
            Smart Parking UTEQ.

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

        {/* ========================================================
            ESTADÍSTICAS
            ======================================================== */}

        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',

            gap: 12,

            marginBottom: 20,
          }}
        >

          {/* PROPIETARIOS */}

          <div
            style={{
              padding: 15,

              border:
                '1px solid #e5e7eb',

              borderRadius:
                12,

              background:
                '#ffffff',
            }}
          >

            <small className="text-body-secondary">
              Propietarios
            </small>


            <div className="fs-3 fw-bold">
              {
                propietarios.length
              }
            </div>

          </div>


          {/* VEHÍCULOS */}

          <div
            style={{
              padding: 15,

              border:
                '1px solid #bbf7d0',

              borderRadius:
                12,

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
              Vehículos asociados
            </small>


            <div
              className="fs-3 fw-bold"

              style={{
                color:
                  '#166534',
              }}
            >
              {
                totalVehiculos
              }
            </div>

          </div>


          {/* MÁS DE UNO */}

          <div
            style={{
              padding: 15,

              border:
                '1px solid #bfdbfe',

              borderRadius:
                12,

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
              Con varios vehículos
            </small>


            <div
              className="fs-3 fw-bold"

              style={{
                color:
                  '#1d4ed8',
              }}
            >
              {
                propietariosConVarios
              }
            </div>

          </div>

        </div>


        {/* ========================================================
            BUSCADOR
            ======================================================== */}

        <div
          className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3"
        >

          <CFormInput
            type="search"

            placeholder="Buscar propietario, correo, cédula, placa o vehículo..."

            value={
              busqueda
            }

            onChange={(
              evento,
            ) =>
              setBusqueda(
                evento.target.value,
              )
            }

            style={{
              maxWidth: 480,
            }}
          />


          <span className="text-body-secondary small">

            Mostrando{' '}

            <strong>
              {
                propietariosFiltrados.length
              }
            </strong>

            {' '}de{' '}

            <strong>
              {
                propietarios.length
              }
            </strong>

          </span>

        </div>


        {/* ========================================================
            CARGANDO
            ======================================================== */}

        {cargando && (

          <div className="text-center py-5">

            <CSpinner
              color="success"
            />


            <h5 className="mt-3">
              Cargando propietarios...
            </h5>


            <p className="text-body-secondary">

              Consultando vehículos
              registrados en Supabase.

            </p>

          </div>

        )}


        {/* ========================================================
            ERROR
            ======================================================== */}

        {!cargando &&
          error && (

            <CAlert color="danger">

              <strong>
                No se pudieron cargar
                los propietarios.
              </strong>

              <br />

              {error}

            </CAlert>

          )}


        {/* ========================================================
            TABLA
            ======================================================== */}

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

                  <CTableHeaderCell
                    style={{
                      width: 80,
                    }}
                  >
                    Foto
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
                    Vehículos
                  </CTableHeaderCell>


                  <CTableHeaderCell>
                    Placas
                  </CTableHeaderCell>


                  <CTableHeaderCell>
                    Estado
                  </CTableHeaderCell>

                </CTableRow>

              </CTableHead>


              <CTableBody>

                {propietariosFiltrados.map(
                  (
                    propietario,
                  ) => {

                    const todosAutorizados =
                      propietario
                        .vehiculos
                        .every(
                          (
                            vehiculo,
                          ) =>
                            vehiculo.autorizado,
                        )


                    return (
                      <CTableRow
                        key={
                          propietario.id
                        }
                      >

                        {/* FOTO */}

                        <CTableDataCell>

                          <FotoPropietario
                            propietario={
                              propietario
                            }
                          />

                        </CTableDataCell>


                        {/* NOMBRE */}

                        <CTableDataCell>

                          <strong>
                            {
                              propietario
                                .nombre
                            }
                          </strong>


                          <div className="small text-body-secondary">

                            Propietario

                          </div>

                        </CTableDataCell>


                        {/* CÉDULA */}

                        <CTableDataCell>

                          {
                            propietario
                              .cedula
                            ||
                            '—'
                          }

                        </CTableDataCell>


                        {/* CORREO */}

                        <CTableDataCell>

                          {propietario.correo ? (

                            <a
                              href={
                                `mailto:${propietario.correo}`
                              }

                              style={{
                                color:
                                  '#087b26',

                                textDecoration:
                                  'none',
                              }}
                            >
                              {
                                propietario
                                  .correo
                              }
                            </a>

                          ) : (

                            '—'

                          )}

                        </CTableDataCell>


                        {/* CANTIDAD VEHÍCULOS */}

                        <CTableDataCell>

                          <CBadge color="info">

                            {
                              propietario
                                .vehiculos
                                .length
                            }

                          </CBadge>

                        </CTableDataCell>


                        {/* PLACAS */}

                        <CTableDataCell>

                          <div
                            className="d-flex flex-wrap gap-1"
                          >

                            {
                              propietario
                                .vehiculos
                                .map(
                                  (
                                    vehiculo,
                                  ) => (

                                    <CBadge
                                      key={
                                        vehiculo.id
                                      }

                                      color="dark"
                                    >
                                      {
                                        vehiculo
                                          .placa
                                      }
                                    </CBadge>

                                  ),
                                )
                            }

                          </div>

                        </CTableDataCell>


                        {/* AUTORIZACIÓN */}

                        <CTableDataCell>

                          <CBadge
                            color={
                              todosAutorizados
                                ? 'success'
                                : 'warning'
                            }

                            textColor={
                              todosAutorizados
                                ? undefined
                                : 'dark'
                            }
                          >

                            {
                              todosAutorizados
                                ? 'Autorizado'
                                : 'Revisar'
                            }

                          </CBadge>

                        </CTableDataCell>

                      </CTableRow>
                    )
                  },
                )}


                {propietariosFiltrados.length ===
                  0 && (

                  <CTableRow>

                    <CTableDataCell
                      colSpan={7}
                      className="text-center py-5 text-body-secondary"
                    >

                      No hay propietarios
                      que coincidan con la
                      búsqueda.

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