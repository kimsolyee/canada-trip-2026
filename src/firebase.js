import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyB8-i6B53Ozqtmb-3g44pDmYoy4waYNGuo",
  authDomain: "canada-trip-2026-dacb3.firebaseapp.com",
  projectId: "canada-trip-2026-dacb3",
  storageBucket: "canada-trip-2026-dacb3.firebasestorage.app",
  messagingSenderId: "147302476147",
  appId: "1:147302476147:web:178d9de90fd76104df7d06",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
