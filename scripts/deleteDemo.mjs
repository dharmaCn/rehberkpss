import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf8');
const get = (key) => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim();

const app = initializeApp({
  apiKey: get('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: get('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: get('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: get('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: get('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: get('EXPO_PUBLIC_FIREBASE_APP_ID'),
});

const db = getFirestore(app);

const today = new Date();
const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

const demoUids = ['demo_01','demo_02','demo_03','demo_04','demo_05','demo_06','demo_07','demo_08','demo_09','demo_10'];

for (const uid of demoUids) {
  await deleteDoc(doc(db, 'users', uid));
  await deleteDoc(doc(db, 'results', `${uid}_${todayKey}`));
  console.log(`✓ ${uid} silindi`);
}

console.log('\nDemo veriler temizlendi!');
process.exit(0);
