// Script para poblar Firebase Realtime Database con los 80 espacios iniciales.
// Uso: npm run seed   (requiere tener el archivo .env configurado)
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set } from 'firebase/database'
import { generarEspaciosIniciales } from '../src/services/generarEspacios.js'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

async function seed() {
  const espacios = generarEspaciosIniciales()
  const espaciosPorId = {}
  const historialPorId = {}

  for (const espacio of espacios) {
    espaciosPorId[espacio.id] = espacio
    historialPorId[espacio.id] = {
      [espacio.fechaHora]: {
        distanciaDetectada: espacio.distanciaDetectada,
        estado: espacio.estado,
        fechaHora: espacio.fechaHora,
      },
    }
  }

  await set(ref(db, 'espacios'), espaciosPorId)
  await set(ref(db, 'historial'), historialPorId)

  console.log(`Se sembraron ${espacios.length} espacios en Firebase RTDB.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Error al sembrar datos:', err)
  process.exit(1)
})
