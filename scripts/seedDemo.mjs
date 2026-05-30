import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
const startOfYear = new Date(today.getFullYear(), 0, 1);
const week = Math.ceil(((today - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
const weekKey = `${today.getFullYear()}-W${String(week).padStart(2,'0')}`;

const users = [
  { uid: 'demo_01', name: 'Ahmet Yılmaz',   score: 1380, correct: 9 },
  { uid: 'demo_02', name: 'Elif Kaya',       score: 1250, correct: 8 },
  { uid: 'demo_03', name: 'Mehmet Demir',    score: 1190, correct: 8 },
  { uid: 'demo_04', name: 'Zeynep Çelik',    score: 1050, correct: 7 },
  { uid: 'demo_05', name: 'Musa Arslan',     score:  980, correct: 7 },
  { uid: 'demo_06', name: 'Fatma Şahin',     score:  870, correct: 6 },
  { uid: 'demo_07', name: 'Emre Doğan',      score:  760, correct: 6 },
  { uid: 'demo_08', name: 'Selin Aydın',     score:  650, correct: 5 },
  { uid: 'demo_09', name: 'Burak Koç',       score:  540, correct: 4 },
  { uid: 'demo_10', name: 'Hande Öztürk',    score:  430, correct: 4 },
];

for (const u of users) {
  await setDoc(doc(db, 'users', u.uid), {
    uid: u.uid,
    displayName: u.name,
    email: `${u.uid}@demo.com`,
    photoURL: '',
    totalScore: u.score * 3,
    quizCount: 3,
    bestDayScore: u.score,
    isGuest: false,
    createdAt: new Date(),
  });

  await setDoc(doc(db, 'results', `${u.uid}_${todayKey}`), {
    uid: u.uid,
    displayName: u.name,
    photoURL: '',
    score: u.score,
    correct: u.correct,
    date: todayKey,
    week: weekKey,
    completedAt: new Date(),
  });

  console.log(`✓ ${u.name} — ${u.score} pt`);
}

console.log('\nDemo data oluşturuldu!');
process.exit(0);
