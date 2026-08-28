import { Link } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import {
  cilCarAlt,
  cilList,
  cilMap,
  cilUser,
  cilUserPlus,
  cilSpeedometer,
  cilAccountLogout,
} from '@coreui/icons'
import { useAuth } from '../context/AuthContext'
import { calcularDistribucion } from '../services/geometria'

const TARJETAS_BASE = [
  {
    to: '/estacionamiento',
    icon: cilSpeedometer,
    color: '#00843D',
    titulo: 'Parqueadero',
    descripcion: 'Estado en tiempo real de los 80 espacios (cuadrícula, filtros y mapa).',
  },
  {
    to: '/parqueadero/vehiculos',
    icon: cilCarAlt,
    color: '#0d6efd',
    titulo: 'Vehículos y propietarios',
    descripcion: 'Listado, búsqueda y administración de los vehículos autorizados.',
  },
  {
    to: '/estacionamiento',
    icon: cilMap,
    color: '#80D0FF',
    titulo: 'Mapa del campus',
    descripcion: 'Ubicación real del parqueadero dentro del campus UTEQ Quevedo.',
  },
]

export default function Inicio() {
  const { autenticado, esAdmin, usuario, cerrarSesion } = useAuth()
  const distribucion = calcularDistribucion()

  const tarjetaCuenta = !autenticado
    ? {
        to: '/login',
        icon: cilUser,
        color: '#7EE2A8',
        titulo: 'Iniciar sesión',
        descripcion: 'Accede para administrar tu vehículo en el sistema.',
      }
    : {
        to: '/parqueadero/vehiculos',
        icon: cilUser,
        color: '#7EE2A8',
        titulo: esAdmin ? 'Panel de administrador' : 'Mi vehículo',
        descripcion: esAdmin
          ? 'Agrega, edita o elimina cualquier vehículo del sistema.'
          : `Sesión iniciada como ${usuario.email}. Edita los datos de tu auto.`,
      }

  const tarjetas = autenticado
    ? [...TARJETAS_BASE, tarjetaCuenta]
    : [
        ...TARJETAS_BASE,
        tarjetaCuenta,
        {
          to: '/registro',
          icon: cilUserPlus,
          color: '#ffb454',
          titulo: 'Registrarme',
          descripcion: 'Crea una cuenta para gestionar tu propio vehículo.',
        },
      ]

  return (
    <>
      <section className="inicio-banner">
        <span className="eyebrow">Campus UTEQ · Quevedo</span>
        <h1>Panel de Smart Parking UTEQ</h1>
        <p>
          Selecciona una opción para consultar el estacionamiento, administrar vehículos o
          gestionar tu cuenta.
        </p>
      </section>

      <section className="dashboard-grid">
        {tarjetas.map((tarjeta) => (
          <Link to={tarjeta.to} key={tarjeta.titulo} className="dashboard-card">
            <span className="dashboard-card-icon" style={{ '--card-color': tarjeta.color }}>
              <CIcon icon={tarjeta.icon} size="xl" />
            </span>
            <h3>{tarjeta.titulo}</h3>
            <p>{tarjeta.descripcion}</p>
          </Link>
        ))}

        {autenticado && (
          <button type="button" className="dashboard-card dashboard-card-button" onClick={cerrarSesion}>
            <span className="dashboard-card-icon" style={{ '--card-color': '#fb7185' }}>
              <CIcon icon={cilAccountLogout} size="xl" />
            </span>
            <h3>Cerrar sesión</h3>
            <p>Salir de la cuenta {usuario?.email}.</p>
          </button>
        )}
      </section>

      <section className="stats-strip">
        <div className="stats-item">
          <span className="stats-value">80</span>
          <span className="stats-label">Espacios totales</span>
        </div>
        <div className="stats-item">
          <span className="stats-value">4 × 20</span>
          <span className="stats-label">Distribución</span>
        </div>
        <div className="stats-item">
          <span className="stats-value">{distribucion.areaAproximada.toFixed(0)} m²</span>
          <span className="stats-label">Área aproximada</span>
        </div>
        <div className="stats-item">
          <span className="stats-value">≤ 50 cm</span>
          <span className="stats-label">Umbral ocupado</span>
        </div>
      </section>

      <section className="feature-grid">
        <div className="feature-card">
          <span className="eyebrow">01</span>
          <h3>Datos en tiempo real</h3>
          <p>
            Cada espacio consulta Firebase Realtime Database mediante el SDK oficial de Firebase,
            sin recargar la página.
          </p>
        </div>
        <div className="feature-card">
          <span className="eyebrow">02</span>
          <h3>Vehículos y propietarios</h3>
          <p>
            El panel de administración consulta Supabase para listar, agregar, editar y eliminar
            vehículos autorizados.
          </p>
        </div>
        <div className="feature-card">
          <span className="eyebrow">03</span>
          <h3>Roles de acceso</h3>
          <p>
            Los administradores gestionan todo el parqueadero; cada usuario puede actualizar los
            datos de su propio vehículo.
          </p>
        </div>
      </section>

      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <a
          href="https://github.com/KEVINANNB/Parqueadero-Inteligente"
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost"
        >
          Repositorio en GitHub
        </a>
      </div>
    </>
  )
}
