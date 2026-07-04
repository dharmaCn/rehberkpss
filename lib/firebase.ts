import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
// Static import — modül yüklenirken auth component'i kaydeder
import { initializeAuth, getAuth, GoogleAuthProvider, OAuthProvider, signInWithCredential, signInAnonymously, updateProfile, deleteUser } from 'firebase/auth';
// getReactNativePersistence yalnızca RN build'inde mevcut; tipi 'firebase/auth' altında bildirilmemiş.
// @ts-expect-error - RN-only export, type tanımı eksik
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { guestDisplayName } from './guestName';

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

export async function updateDisplayNameAsync(displayName: string): Promise<void> {
  const user = getAuthSync()?.currentUser;
  if (!user) throw new Error('Oturum açık değil');
  await updateProfile(user, { displayName });
}

export async function signInGuestAsync(): Promise<import('firebase/auth').User | null> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth başlatılamadı');
  const result = await signInAnonymously(auth);
  const user = result.user;
  try {
    await updateProfile(user, { displayName: guestDisplayName(user.uid) });
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

async function makeRawNonce(byteLength = 32): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(byteLength);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function signInWithAppleAsync(): Promise<import('firebase/auth').User | null> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth başlatılamadı');

  // Firebase, Apple idToken'ı hashlenmiş nonce ile ister; ham nonce'u credential'a veririz.
  const rawNonce = await makeRawNonce();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  const appleCred = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!appleCred.identityToken) return null;

  const provider = new OAuthProvider('apple.com');
  const firebaseCred = provider.credential({
    idToken: appleCred.identityToken,
    rawNonce,
  });
  const result = await signInWithCredential(auth, firebaseCred);
  const user = result.user;

  // Apple ad-soyadı yalnızca İLK girişte döner.
  // Sıralı fallback: Apple full name > email kullanıcı adı (private relay değilse) > "Kullanıcı #UID5"
  if (!user.displayName) {
    const fullName = `${appleCred.fullName?.givenName ?? ''} ${appleCred.fullName?.familyName ?? ''}`.trim();
    let candidate = fullName;
    if (!candidate && user.email && !user.email.toLowerCase().includes('privaterelay.appleid.com')) {
      candidate = user.email.split('@')[0];
    }
    if (!candidate) {
      candidate = `Kullanıcı #${user.uid.slice(-5).toUpperCase()}`;
    }
    try { await updateProfile(user, { displayName: candidate }); } catch {}
  }
  return user;
}

// Hesabı kalıcı olarak siler: Firestore verisi (profil + tüm sonuçlar) + Auth hesabı
export async function deleteAccountAsync(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user) throw new Error('Oturum bulunamadı');

  // 1) Kullanıcının tüm quiz sonuçlarını sil
  const resultsSnap = await getDocs(query(collection(db, 'results'), where('uid', '==', user.uid)));
  await Promise.all(resultsSnap.docs.map((d) => deleteDoc(d.ref)));

  // 2) Profil belgesini sil
  await deleteDoc(doc(db, 'users', user.uid));

  // 3) Google oturumu varsa yerel olarak da çıkış yap
  try {
    if (!user.isAnonymous) {
      await GoogleSignin.signOut();
    }
  } catch {
    // önemli değil
  }

  // 4) Firebase Auth hesabını kalıcı olarak sil
  await deleteUser(user);
}
