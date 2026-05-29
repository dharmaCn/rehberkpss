import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Static import — modül yüklenirken auth component'i kaydeder
import { initializeAuth, getAuth, GoogleAuthProvider, signInWithCredential, signInAnonymously, updateProfile } from 'firebase/auth';
// getReactNativePersistence yalnızca RN build'inde mevcut; tipi 'firebase/auth' altında bildirilmemiş.
// @ts-expect-error - RN-only export, type tanımı eksik
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export default app;

let _auth: ReturnType<typeof initializeAuth> | null = null;

// initializeAuth module load'da değil, ilk çağrıda yapılır
export function getFirebaseAuth() {
  if (_auth) return _auth;
  try {
    _auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // initializeAuth zaten çağrıldıysa (ör. fast refresh) mevcut instance'ı al
    _auth = getAuth(app) as ReturnType<typeof initializeAuth>;
  }
  return _auth;
}

export function getAuthSync() {
  return _auth;
}

export async function signInGuestAsync(): Promise<import('firebase/auth').User | null> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth başlatılamadı');
  const result = await signInAnonymously(auth);
  const user = result.user;
  const guestSuffix = user.uid.slice(-5).toUpperCase();
  try {
    await updateProfile(user, { displayName: `Misafir #${guestSuffix}` });
  } catch {
    // devam et
  }
  return user;
}

export async function signInWithGoogleAsync(): Promise<import('firebase/auth').User | null> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth başlatılamadı');

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  });

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = await GoogleSignin.signIn();
  if (response.type !== 'success' || !response.data?.idToken) return null;

  const credential = GoogleAuthProvider.credential(response.data.idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}
