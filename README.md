# UTEQ Smart Parking — Estacionamiento inteligente con React y Firebase RTDB
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/2bc8fd87-3ad2-4087-85fd-6b4b0c960498" />
<img width="615" height="546" alt="image" src="https://github.com/user-attachments/assets/197a3d94-4ebc-41f8-be4b-1292a7727389" />
<img width="1361" height="631" alt="image" src="https://github.com/user-attachments/assets/d92383a1-ca6c-4be6-bd53-ea19e5171a73" />


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

---

# Ampliación: Panel de Administración del Smart Parking UTEQ (Grupo 5)

Sobre la base del proyecto anterior se agregó un **panel de vehículos y
propietarios** con React, **CoreUI** y **Supabase**, con inicio de sesión
(correo/contraseña y Google) y dos roles de usuario.

## Qué se agregó

- `src/lib/supabase.js` — cliente de Supabase.
- `src/context/AuthContext.jsx` — sesión, rol (`admin` / `usuario`), login, registro, login con Google, logout.
- `src/hooks/useVehiculos.js` — listar, crear, actualizar y eliminar vehículos.
- `src/components/VehiculoFormModal.jsx` — formulario (modal CoreUI) para agregar/editar, con validaciones.
- `src/components/RutaProtegida.jsx` — exige sesión iniciada para entrar al panel.
- `src/views/parqueadero/ListaVehiculos.jsx` — tabla CoreUI con búsqueda, paginación y botones de Agregar / Editar / Eliminar según el rol.
- `src/pages/Login.jsx`, `src/pages/Registro.jsx` — autenticación.
- `src/components/Logo.jsx` — logo del proyecto (siglas + nombre), usado en el encabezado.
- `sql/002_crud_vehiculos_rls.sql` — políticas RLS para permitir el CRUD de forma segura.

## Roles

| Rol | Puede |
|---|---|
| **Administrador** | Agregar, editar y eliminar cualquier vehículo/propietario. |
| **Usuario normal** (con sesión iniciada) | Ver el listado completo; editar únicamente **su propio vehículo** (marca, modelo, color, tipo y fotos), si su correo de sesión coincide con `correo_institucional` del registro. No puede agregar ni eliminar. |
| Visitante sin sesión | Debe iniciar sesión para entrar a `/parqueadero/vehiculos`. |

El rol se guarda en `raw_app_meta_data` del usuario en Supabase Auth (no en
`user_metadata`, que el propio usuario podría modificar). Todas las cuentas
nuevas son `usuario` normal por defecto.

### Cómo convertir una cuenta en administrador

1. Supabase → **Authentication → Users**.
2. Selecciona el usuario → **Edit user** → campo **Raw App Meta Data**.
3. Escribe: `{ "role": "admin" }` y guarda.

## Configurar el proyecto

1. Ejecuta en el **SQL Editor** de Supabase, en este orden:
   - `supabase_parqueadero_uteq.sql` (si no lo habías ejecutado en la práctica anterior).
   - `sql/002_crud_vehiculos_rls.sql` (nuevo, habilita insert/update/delete).
2. Copia `.env.example` a `.env` y completa además:
   ```
   VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_TU_CLAVE
   ```
3. (Opcional) Habilitar login con Google:
   - Google Cloud Console → crear credenciales OAuth 2.0 (tipo "Aplicación web").
   - Como *Authorized redirect URI* usa la que te muestra Supabase en
     **Authentication → Providers → Google**.
   - Copia el Client ID y Client Secret a Supabase en ese mismo panel y activa el proveedor.
   - Si no configuras Google, el botón "Continuar con Google" mostrará un
     error de Supabase; el login con correo/contraseña funciona sin este paso.
4. `npm install && npm run dev`, abre `http://localhost:5173/parqueadero/vehiculos`.

## Despliegue en Azure Static Web Apps

Igual que en la práctica individual: crear el secreto de GitHub
`VITE_SUPABASE_PUBLISHABLE_KEY` (además de `VITE_SUPABASE_URL`), y en el
workflow YAML exponerlo bajo el nombre que usa el código:

```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
```
