import { Link } from 'react-router-dom'
import { calcularDistribucion } from '../services/geometria'

export default function Inicio() {
  const distribucion = calcularDistribucion()

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">Campus UTEQ · Quevedo</span>
          <h1>Parqueadero inteligente</h1>
          <p>
            Simulación de 80 sensores ultrasónicos organizados en cuatro
            columnas. Cada espacio se actualiza como si recibiera eventos en
            tiempo real desde Firebase Realtime Database.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to="/estacionamiento" className="btn btn-primary">
              Ver estacionamiento →
            </Link>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              Repositorio en GitHub
            </a>
          </div>
        </div>

        <div className="stub-card">
          <div className="stub-row">
            <span>TICKET</span>
            <span>UTEQ-PARK</span>
          </div>
          <div className="stub-row">
            <span>Espacios totales</span>
            <span>80</span>
          </div>
          <div className="stub-row">
            <span>Distribución</span>
            <span>4 col × 20</span>
          </div>
          <div className="stub-row">
            <span>Área aprox.</span>
            <span>{distribucion.areaAproximada.toFixed(0)} m²</span>
          </div>
          <div className="stub-row">
            <span>Celda aprox.</span>
            <span>{distribucion.superficiePorCelda.toFixed(1)} m²</span>
          </div>
          <div className="stub-row">
            <span>Umbral sensor</span>
            <span>≤ 50 cm = ocupado</span>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <div className="feature-card">
          <span className="eyebrow">01</span>
          <h3>Datos en tiempo real</h3>
          <p>
            Cada espacio consulta Firebase Realtime Database mediante el SDK
            oficial de Firebase, sin recargar la página.
          </p>
        </div>
        <div className="feature-card">
          <span className="eyebrow">02</span>
          <h3>Simulación de sensores</h3>
          <p>
            Un ciclo periódico modifica la distancia detectada de algunos
            sensores y registra el cambio en el historial.
          </p>
        </div>
        <div className="feature-card">
          <span className="eyebrow">03</span>
          <h3>Ubicación geográfica</h3>
          <p>
            El parqueadero se posiciona en un mapa a partir de las
            coordenadas reales del terreno en el campus.
          </p>
        </div>
      </section>
    </>
  )
}
