import {
  useMemo,
  useState,
} from 'react'

import {
  CAlert,
  CBadge,
  CButton,
} from '@coreui/react'

import usePuestos
  from '../hooks/usePuestos'

import ResumenEstacionamiento
  from '../components/ResumenEstacionamiento'

import FiltrosEspacios
  from '../components/FiltrosEspacios'

import CuadriculaEstacionamiento
  from '../components/CuadriculaEstacionamiento'

import MapaEstacionamiento
  from '../components/MapaEstacionamiento'

import {
  descargarJsonRTDB,
} from '../services/exportarDatos'


export default function Estacionamiento() {
  const {

    espacios,

    cargando,

    error,

    estadisticas,

    recargarRelaciones,

  } = usePuestos()


  const [
    filtros,
    setFiltros,
  ] =
    useState({

      estado:
        'todos',

      columna:
        'todas',

    })


  const [
    descargando,
    setDescargando,
  ] =
    useState(false)


  /* =============================================================
     DESCARGAR FIREBASE
     ============================================================= */

  const handleDescargarJson =
    async () => {

      try {

        setDescargando(
          true,
        )


        await descargarJsonRTDB()

      } catch (
        errorDescarga
      ) {

        console.error(
          'Error descargando JSON:',
          errorDescarga,
        )

      } finally {

        setDescargando(
          false,
        )

      }

    }


  /* =============================================================
     FILTROS
     ============================================================= */

  const espaciosFiltrados =
    useMemo(() => {

      return espacios.filter(
        (
          espacio,
        ) => {

          const coincideEstado =

            filtros.estado ===
              'todos'

            ||

            espacio.estado ===
              filtros.estado


          const coincideColumna =

            filtros.columna ===
              'todas'

            ||

            espacio.columna ===
              filtros.columna


          return (

            coincideEstado

            &&

            coincideColumna

          )

        },
      )

    }, [
      espacios,
      filtros,
    ])


  return (
    <>

      {/* ========================================================
          HEADER
          ======================================================== */}

      <div className="page-header">

        <div>

          <span className="eyebrow">
            Campus UTEQ · Quevedo
          </span>

          <h1>
            Parqueadero inteligente
          </h1>

          <p>
            Los 80 sensores de Firebase
            están vinculados con los
            puestos y vehículos registrados
            en Supabase.
          </p>

        </div>


        <div
          style={{
            display:
              'flex',

            flexWrap:
              'wrap',

            alignItems:
              'center',

            gap:
              '0.75rem',
          }}
        >

          <CButton
            color="success"
            variant="outline"
            onClick={
              recargarRelaciones
            }
          >
            Actualizar relaciones
          </CButton>


          <CButton
            color="primary"
            onClick={
              handleDescargarJson
            }
            disabled={
              descargando
            }
          >

            {descargando
              ? 'Generando…'
              : 'Descargar JSON RTDB'}

          </CButton>


          <CBadge
            color="success"
            className="p-2"
          >
            ● Firebase en vivo
          </CBadge>

        </div>

      </div>


      {/* ========================================================
          ERROR
          ======================================================== */}

      {error && (

        <CAlert color="danger">

          No se pudo completar la
          integración Firebase /
          Supabase.

          <br />

          {error.message ||
            String(error)}

        </CAlert>

      )}


      {/* ========================================================
          RESUMEN EXISTENTE
          ======================================================== */}

      <ResumenEstacionamiento
        estadisticas={
          estadisticas
        }
      />


      {/* ========================================================
          ESTADÍSTICAS DE IDENTIFICACIÓN
          ======================================================== */}

      <div
        style={{
          display:
            'grid',

          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',

          gap:
            '1rem',

          marginBottom:
            '1.5rem',
        }}
      >

        <div className="card shadow-sm">

          <div className="card-body">

            <small className="text-body-secondary">
              Ocupados identificados
            </small>

            <h3 className="mb-0 text-success">

              {
                estadisticas
                  .identificados
              }

            </h3>

          </div>

        </div>


        <div className="card shadow-sm">

          <div className="card-body">

            <small className="text-body-secondary">
              Ocupados sin vehículo
            </small>

            <h3 className="mb-0 text-danger">

              {
                estadisticas
                  .sinIdentificar
              }

            </h3>

          </div>

        </div>

      </div>


      {/* ========================================================
          ESPACIOS + MAPA
          ======================================================== */}

      <div className="layout-split">

        <div className="panel">

          <div className="panel-title">

            <h2>
              Disponibilidad por espacio
            </h2>


            <div className="legend">

              <span>
                <i className="i-libre" />
                {' '}
                Libre
              </span>


              <span>
                <i className="i-ocupado" />
                {' '}
                Ocupado
              </span>


              <span>
                <i className="i-gris" />
                {' '}
                Sin datos
              </span>

            </div>

          </div>


          <FiltrosEspacios

            filtros={
              filtros
            }

            onCambiarFiltros={
              setFiltros
            }

          />


          {cargando && (

            <p className="estado-cargando">

              Cargando sensores y
              relaciones...

            </p>

          )}


          {!cargando &&
            !error && (

              <CuadriculaEstacionamiento

                espacios={
                  espaciosFiltrados
                }

              />

            )}

        </div>


        <div className="panel">

          <div className="panel-title">

            <h2>
              Ubicación del parqueadero
            </h2>

          </div>


          <MapaEstacionamiento />

        </div>

      </div>

    </>
  )
}