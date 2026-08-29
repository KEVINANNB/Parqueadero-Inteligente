# UTEQ Smart Parking — CRUD de Vehículos y Propietarios

![UTEQ Smart Parking](https://github.com/user-attachments/assets/2bc8fd87-3ad2-4087-85fd-6b4b0c960498)

Aplicación web para la gestión de un **parqueadero inteligente de 80 espacios** en la Universidad Técnica Estatal de Quevedo (UTEQ). El proyecto integra una interfaz desarrollada con **React + Vite + CoreUI**, autenticación y base de datos con **Supabase**, lectura de sensores en **Firebase Realtime Database** y despliegue mediante **Azure Static Web Apps**.

La ampliación principal incorpora un módulo CRUD de **vehículos y propietarios**, con búsqueda, paginación, validaciones, carga de fotografías, mensajes de éxito/error, control de acceso por roles y políticas **Row Level Security (RLS)**.

---

## Repositorio

**GitHub:**  
https://github.com/KEVINANNB/Parqueadero-Inteligente

---

## Objetivo

Desarrollar una aplicación web que permita administrar los vehículos y propietarios registrados en el Smart Parking UTEQ, manteniendo la información organizada, validada y protegida mediante políticas de seguridad en Supabase.

El sistema permite diferenciar las acciones disponibles para un **usuario normal** y un **administrador**, además de relacionar los vehículos con los espacios del parqueadero y con las cuentas registradas.

---

## Funcionalidades principales

### CRUD de vehículos y propietarios

- Listado de vehículos y propietarios registrados.
- Visualización de fotografía del vehículo.
- Visualización de fotografía del propietario.
- Búsqueda por placa, marca, modelo, color, propietario, correo o cédula.
- Paginación de los registros.
- Registro de nuevos vehículos y propietarios.
- Edición de información existente.
- Eliminación con confirmación previa.
- Actualización automática de la tabla después de agregar, editar o eliminar.
- Indicadores de carga durante las operaciones.
- Mensajes de éxito y error.
- Diseño responsivo mediante componentes CoreUI.

### Validaciones

El formulario valida, entre otros aspectos:

- Placa con formato `ABC-1234`.
- Cédula de 10 dígitos.
- Correo electrónico válido.
- Año del vehículo dentro del rango permitido.
- Marca obligatoria.
- Modelo obligatorio.
- Color obligatorio.
- Fotografía del vehículo.
- Fotografía del propietario en operaciones administrativas.

### Gestión de fotografías

Las fotografías pueden seleccionarse directamente desde el equipo del usuario. Las imágenes se almacenan mediante **Supabase Storage**, evitando la necesidad de ingresar manualmente una URL.

### Autenticación y roles

El sistema diferencia dos tipos principales de acceso:

| Rol | Permisos principales |
|---|---|
| **Administrador** | Puede agregar, editar, autorizar y eliminar vehículos; administrar propietarios, cuentas, puestos e historial. |
| **Usuario normal** | Puede consultar información pública autorizada, editar su perfil, administrar sus vehículos permitidos y realizar reservas según las reglas del sistema. |

---

## Seguridad con Supabase RLS

La aplicación utiliza **Row Level Security (RLS)** para proteger las operaciones realizadas sobre la base de datos.

Las políticas permiten controlar:

- Lectura de registros.
- Creación de vehículos.
- Edición por administrador.
- Edición limitada de registros propios.
- Eliminación administrativa.
- Acceso a perfiles.
- Relación entre cuentas y vehículos.
- Reservas de espacios.
- Consulta del historial según el rol del usuario.

Los scripts SQL correspondientes se encuentran dentro de la carpeta:

```text
sql/
```

Actualmente el proyecto contiene:

```text
002_crud_vehiculos_rls.sql
003_roles_admin_usuario.sql
004_vincular_cuentas_vehiculos.sql
005_conectar_puestos_vehiculos.sql
006_perfiles_y_registro_usuario.sql
007_reservas_puestos.sql
008_historial_reservas.sql
009_seguridad_historial.sql
```

---

## Parqueadero inteligente

El sistema representa **80 espacios**, distribuidos en:

```text
4 columnas × 20 espacios = 80 espacios
```

Las columnas se identifican como:

```text
A
B
C
D
```

Firebase Realtime Database conserva la información proveniente de los sensores, mientras que Supabase gestiona las relaciones entre:

- cuentas;
- propietarios;
- vehículos;
- puestos;
- reservas;
- historial.

La aplicación diferencia entre la lectura física de un sensor y el estado administrativo de una reserva.

---

## Reservas

Un usuario autenticado puede seleccionar un espacio disponible y relacionarlo con uno de sus vehículos autorizados.

Flujo general:

```text
Usuario
   ↓
Selecciona espacio
   ↓
Selecciona vehículo autorizado
   ↓
Reserva
   ↓
Supabase registra la reserva
   ↓
El espacio deja de mostrarse disponible
```

Las reservas y cancelaciones pueden almacenarse en el historial del sistema.

---

## Historial

El historial se presenta de forma diferente según el rol:

### Administrador

Puede consultar:

- eventos recientes de los sensores;
- estado de los 80 espacios;
- reservas;
- cancelaciones;
- vehículos asociados;
- información operativa general.

### Usuario normal

Puede consultar únicamente los eventos relacionados con su propia cuenta y sus vehículos, respetando las restricciones implementadas mediante RLS.

---

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| React 18 | Desarrollo de la interfaz |
| Vite 5 | Entorno de desarrollo y compilación |
| CoreUI | Componentes visuales y diseño responsivo |
| React Router DOM | Navegación entre vistas |
| Supabase | Base de datos, autenticación, RLS y Storage |
| Firebase Realtime Database | Lecturas y estados de sensores |
| Azure Static Web Apps | Despliegue de la aplicación |
| GitHub Actions | Integración y despliegue continuo |
| JavaScript / JSX | Lógica de la aplicación |

Las dependencias principales se encuentran definidas en `package.json`.

---

## Estructura general del proyecto

```text
Parqueadero-Inteligente/
│
├── .github/
│   └── workflows/
│
├── public/
│
├── scripts/
│   └── seed.js
│
├── sql/
│   ├── 002_crud_vehiculos_rls.sql
│   ├── 003_roles_admin_usuario.sql
│   ├── 004_vincular_cuentas_vehiculos.sql
│   ├── 005_conectar_puestos_vehiculos.sql
│   ├── 006_perfiles_y_registro_usuario.sql
│   ├── 007_reservas_puestos.sql
│   ├── 008_historial_reservas.sql
│   └── 009_seguridad_historial.sql
│
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── views/
│   │   ├── cuenta/
│   │   └── parqueadero/
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── login.css
│   ├── main.jsx
│   └── tema-claro.css
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

---

## Componentes importantes del CRUD

### `src/views/parqueadero/ListaVehiculos.jsx`

Vista principal del CRUD. Incluye:

- tabla de vehículos y propietarios;
- buscador;
- paginación;
- fotografía del vehículo;
- fotografía del propietario;
- estado de autorización;
- acciones Editar y Eliminar;
- confirmación de eliminación;
- mensajes de resultado.

### `src/components/VehiculoFormModal.jsx`

Formulario reutilizable para:

- agregar vehículos;
- editar vehículos;
- validar datos;
- seleccionar imágenes;
- deshabilitar botones mientras se guarda;
- mostrar mensajes de error.

### `src/hooks/useVehiculos.js`

Centraliza las operaciones con Supabase:

```text
SELECT
INSERT
UPDATE
DELETE
```

Después de cada operación actualiza el estado de React para reflejar inmediatamente los cambios en la tabla.

---

## Cumplimiento de las actividades obligatorias

### 1. Enlistar vehículos y propietarios

✅ Implementado mediante una tabla CoreUI con fotografías, placa, vehículo, propietario, cédula enmascarada, correo, estado y acciones.

### 2. Agregar vehículo y propietario

✅ Implementado mediante un formulario modal con validaciones y almacenamiento en Supabase.

### 3. Editar

✅ El botón **Editar** carga los datos actuales, permite modificarlos, guarda los cambios en Supabase y actualiza la tabla.

### 4. Eliminar

✅ El botón **Eliminar** presenta una confirmación antes de borrar el registro.

### 5. Interfaz

✅ La aplicación utiliza CoreUI e incluye:

- mensajes de éxito y error;
- indicadores de carga;
- botones deshabilitados durante operaciones;
- diseño responsivo;
- tablas;
- modales;
- alertas;
- formularios.

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/KEVINANNB/Parqueadero-Inteligente.git
cd Parqueadero-Inteligente
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las credenciales correspondientes.

Ejemplo:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> No se deben publicar claves privadas ni credenciales sensibles dentro del repositorio.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

### 5. Generar versión de producción

```bash
npm run build
```

### 6. Vista previa del build

```bash
npm run preview
```

---

## Supabase

Para preparar la base de datos se deben ejecutar los scripts SQL requeridos desde el **SQL Editor** de Supabase y comprobar que las políticas RLS se encuentren habilitadas.

La aplicación utiliza Supabase para:

```text
Authentication
Database
Row Level Security
Storage
Realtime
```

---

## Firebase

Firebase Realtime Database se utiliza para gestionar las lecturas provenientes de los sensores simulados del parqueadero.

Los registros incluyen información como:

- identificador del sensor;
- número del espacio;
- columna;
- distancia detectada;
- estado;
- última actualización;
- historial de lecturas.

---

## Despliegue

El proyecto está preparado para desplegarse mediante **Azure Static Web Apps** y GitHub Actions.

Flujo:

```text
Código local
   ↓
GitHub
   ↓
GitHub Actions
   ↓
Build de Vite
   ↓
Azure Static Web Apps
```

---

## Evidencias de la aplicación

> Para la entrega académica se recomienda reemplazar o complementar las imágenes siguientes con capturas actualizadas del CRUD final.

### Vista general

<img width="1366" alt="UTEQ Smart Parking" src="https://github.com/user-attachments/assets/2bc8fd87-3ad2-4087-85fd-6b4b0c960498" />

### Vista del sistema

<img width="615" alt="Smart Parking UTEQ" src="https://github.com/user-attachments/assets/197a3d94-4ebc-41f8-be4b-1292a7727389" />

### Aplicación web

<img width="1361" alt="Aplicación Smart Parking" src="https://github.com/user-attachments/assets/d92383a1-ca6c-4be6-bd53-ea19e5171a73" />

---

## Evidencias recomendadas para el PDF de entrega

El documento final puede incluir:

1. Enlace del repositorio GitHub.
2. Captura de Supabase y las políticas RLS.
3. Captura del listado de vehículos y propietarios.
4. Captura de la búsqueda y paginación.
5. Captura del formulario para agregar.
6. Captura del nuevo registro creado.
7. Captura de la opción Editar.
8. Captura del registro actualizado.
9. Captura de la confirmación de eliminación.
10. Captura donde se comprueba la eliminación.
11. Captura de las validaciones y mensajes.
12. Captura de la estructura del proyecto.
13. Captura de este README en GitHub mostrando una imagen de la aplicación.

---

## Créditos

Proyecto base de Smart Parking desarrollado para la asignatura **Aplicaciones Telemáticas Basadas en Web** de la Universidad Técnica Estatal de Quevedo.

La ampliación incorpora el módulo CRUD de vehículos y propietarios, autenticación, roles, Supabase, RLS, gestión de cuentas, carga de fotografías, relación de puestos, reservas e historial.

---

## Licencia y uso académico

Este repositorio fue desarrollado con fines académicos y educativos dentro de la Universidad Técnica Estatal de Quevedo.
