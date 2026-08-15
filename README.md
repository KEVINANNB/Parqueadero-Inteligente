# UTEQ Smart Parking — Estacionamiento inteligente con React y Firebase RTDB

Aplicación web que simula el funcionamiento de un estacionamiento inteligente
de **80 espacios** (4 columnas × 20 espacios) ubicado en el campus UTEQ –
Quevedo. Cada espacio está asociado a un sensor simulado que envía
información en tiempo real a **Firebase Realtime Database**, y la aplicación
(desarrollada en **React + Vite**) muestra gráficamente cuáles espacios
están libres u ocupados.

> Práctica experimental — Aplicaciones Telemáticas Basadas en Web — UTEQ, 8vo nivel IT.

## Demo / capturas

Ver el informe PDF entregado (`docs/informe-parqueadero-inteligente.pdf`) para
las capturas de pantalla de cada pantalla de la aplicación.

## Tecnologías

- React 18 + Vite
- React Router DOM (rutas: `/`, `/estacionamiento`, `/espacios/:id`)
- Firebase Realtime Database (SDK modular v10)
- React-Leaflet + OpenStreetMap (mapa del parqueadero)

## Estructura del proyecto

```
src/
├── components/
│   ├── ResumenEstacionamiento.jsx   # Tarjetas de estadísticas (total/libres/ocupados/%)
│   ├── CuadriculaEstacionamiento.jsx# Cuadrícula de 80 espacios en 4 columnas
│   ├── EspacioCard.jsx              # Tarjeta individual de un espacio
│   ├── FiltrosEspacios.jsx          # Filtros por columna y por estado
│   ├── HistorialEspacio.jsx         # Lista del historial de un espacio
│   └── MapaEstacionamiento.jsx      # Mapa Leaflet con la ubicación real
├── hooks/
│   ├── useEspacios.jsx              # Suscripción en tiempo real a "espacios"
│   ├── useEspacio.jsx               # Suscripción a un solo espacio
│   └── useHistorialEspacio.jsx      # Suscripción al historial de un espacio
├── pages/
│   ├── Inicio.jsx                   # Descripción del proyecto + acceso
│   ├── Estacionamiento.jsx          # Estadísticas + cuadrícula + filtros + mapa
│   └── DetalleEspacio.jsx           # Ruta /espacios/:id con historial
├── services/
│   ├── firebase.js                  # Inicialización del SDK de Firebase
│   ├── geometria.js                 # Cálculo del terreno y coordenadas por celda
│   ├── generarEspacios.js           # Generación de los 80 espacios iniciales
│   └── simulacion.js                # Ciclo periódico que simula cambios de sensores
├── App.jsx
├── App.css
└── main.jsx
scripts/
└── seed.js                          # Script para poblar Firebase con los 80 espacios
```

## 1. Requisitos previos

- Node.js 18 o superior
- Una cuenta de Google/Firebase (gratuita)

## 2. Crear el proyecto de Firebase

1. Entra a [https://console.firebase.google.com](https://console.firebase.google.com) e inicia sesión.
2. Clic en **Agregar proyecto**, ponle un nombre (por ejemplo `parqueadero-uteq`) y créalo.
3. En el menú lateral entra a **Compilación → Realtime Database** y clic en
   **Crear base de datos**. Elige la ubicación y, para la práctica, inicia en
   **modo de prueba** (reglas abiertas de lectura/escritura mientras
   desarrollas — recuerda restringirlas después si vas a producción).
4. Ve a **Configuración del proyecto → Tus apps → </> (Web)**, registra la
   app (por ejemplo `parqueadero-web`) y copia el objeto `firebaseConfig`
   que te muestra: lo necesitarás en el paso 4.

## 3. Instalar el proyecto localmente

```bash
git clone <URL-DE-TU-REPOSITORIO>
cd parqueadero-inteligente
npm install
```

## 4. Configurar las variables de entorno

Copia `.env.example` como `.env` y reemplaza cada valor con los datos que
copiaste de Firebase:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

El archivo `.env` **no se sube a GitHub** (está en `.gitignore`).

## 5. Sembrar los 80 espacios en Firebase (una sola vez)

```bash
npm run seed
```

Esto genera los 80 espacios (con coordenadas calculadas a partir del terreno
real del campus) y los escribe en los nodos `espacios/` e `historial/` de tu
Realtime Database.

## 6. Ejecutar la aplicación en desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173`. Al entrar a **Parqueadero** verás la cuadrícula
de 80 espacios; cada 15 segundos la simulación actualiza aleatoriamente
algunos sensores (distancia, estado y registro histórico).

## 7. Generar el build de producción

```bash
npm run build
npm run preview   # para probar el build localmente
```

## Reglas de negocio

- **Estado del sensor**: `distanciaDetectada <= 50 cm` → `ocupado`;
  en caso contrario → `libre`.
- **Distribución**: 4 columnas (A, B, C, D) × 20 espacios cada una = 80 espacios.
- **Ubicación**: las coordenadas de cada espacio se calculan por
  interpolación dentro del bounding box real del terreno (ver
  `src/services/geometria.js` y el informe PDF para el detalle del cálculo).

## Autor

Zambrano Vega Cristian Gabriel — Ingeniería en Telemática, UTEQ.
