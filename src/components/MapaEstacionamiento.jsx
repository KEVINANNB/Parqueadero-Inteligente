import { MapContainer, TileLayer, Marker, Popup, Rectangle } from 'react-leaflet'
import L from 'leaflet'
import { BOUNDING_BOX } from '../services/geometria'

// Corrige el ícono por defecto de Leaflet (problema conocido con bundlers)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function MapaEstacionamiento({ espacioSeleccionado }) {
  const centro = [
    (BOUNDING_BOX.norte + BOUNDING_BOX.sur) / 2,
    (BOUNDING_BOX.oeste + BOUNDING_BOX.este) / 2,
  ]

  const rectangulo = [
    [BOUNDING_BOX.norte, BOUNDING_BOX.oeste],
    [BOUNDING_BOX.sur, BOUNDING_BOX.este],
  ]

  return (
    <div className="mapa-contenedor">
      <MapContainer
        center={centro}
        zoom={19}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Rectangle bounds={rectangulo} pathOptions={{ color: '#4ade80' }} />
        {!espacioSeleccionado && (
          <Marker position={centro}>
            <Popup>Parqueadero UTEQ - Campus Quevedo</Popup>
          </Marker>
        )}
        {espacioSeleccionado && (
          <Marker
            position={[
              espacioSeleccionado.ubicacion.latitud,
              espacioSeleccionado.ubicacion.longitud,
            ]}
          >
            <Popup>{espacioSeleccionado.id}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}