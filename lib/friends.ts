// Arkadaşlık sistemi — v1.3.0
// Veri modeli:
//   friendRequests/{fromUid_toUid}  → { from, to, fromName, fromPhoto, status: 'pending', createdAt }
//   users/{uid}/friends/{friendUid} → { uid: friendUid, addedAt }
// Kabul edilince istek silinir ve iki tarafa da friends dokümanı yazılır.

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { guestDisplayName, isGuestDisplayName } from './guestName';
import { UserProfile } from './firestore';

export type FriendStatus = 'none' | 'outgoing' | 'incoming' | 'friends';

export interface FriendRequest {
  from: string;
  to: string;
  fromName: string;
  fromPhoto: string;
}

export interface FriendEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  seasonScore: number;
  currentStreak: number;
}

function requestId(from: string, to: string): string {
  return `${from}_${to}`;
}

export function publicDisplayName(uid: string, rawName?: string | null): string {
  return isGuestDisplayName(rawName ?? undefined) ? guestDisplayName(uid) : (rawName ?? 'Anonim');
}

export async function getFriendStatus(myUid: string, otherUid: string): Promise<FriendStatus> {
  const friendSnap = await getDoc(doc(db, 'users', myUid, 'friends', otherUid));
  if (friendSnap.exists()) return 'friends';
  const outSnap = await getDoc(doc(db, 'friendRequests', requestId(myUid, otherUid)));
  if (outSnap.exists()) return 'outgoing';
  const inSnap = await getDoc(doc(db, 'friendRequests', requestId(otherUid, myUid)));
  if (inSnap.exists()) return 'incoming';
  return 'none';
}

export async function sendFriendRequest(
  me: { uid: string; displayName: string | null; photoURL: string | null },
  toUid: string
): Promise<void> {
  await setDoc(doc(db, 'friendRequests', requestId(me.uid, toUid)), {
    from: me.uid,
    to: toUid,
    fromName: publicDisplayName(me.uid, me.displayName),
    fromPhoto: me.photoURL ?? '',
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function cancelFriendRequest(myUid: string, toUid: string): Promise<void> {
  await deleteDoc(doc(db, 'friendRequests', requestId(myUid, toUid)));
}

export async function acceptFriendRequest(myUid: string, fromUid: string): Promise<void> {
  // Önce iki tarafa da arkadaşlık yaz, sonra isteği sil — yarıda kesilirse
  // istek durur ve tekrar kabul edilebilir.
  await setDoc(doc(db, 'users', myUid, 'friends', fromUid), {
    uid: fromUid,
    addedAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'users', fromUid, 'friends', myUid), {
    uid: myUid,
    addedAt: serverTimestamp(),
  });
  await deleteDoc(doc(db, 'friendRequests', requestId(fromUid, myUid)));
}

export async function declineFriendRequest(myUid: string, fromUid: string): Promise<void> {
  await deleteDoc(doc(db, 'friendRequests', requestId(fromUid, myUid)));
}

export async function removeFriend(myUid: string, friendUid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', myUid, 'friends', friendUid));
  await deleteDoc(doc(db, 'users', friendUid, 'friends', myUid));
}

export async function fetchIncomingRequests(myUid: string, max = 20): Promise<FriendRequest[]> {
  const q = query(collection(db, 'friendRequests'), where('to', '==', myUid), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as FriendRequest;
    return {
      from: data.from,
      to: data.to,
      fromName: publicDisplayName(data.from, data.fromName),
      fromPhoto: data.fromPhoto ?? '',
    };
  });
}

export async function fetchFriends(myUid: string, max = 50): Promise<FriendEntry[]> {
  const q = query(collection(db, 'users', myUid, 'friends'), limit(max));
  const snap = await getDocs(q);
  const uids = snap.docs.map((d) => d.id);
  const entries = await Promise.all(
    uids.map(async (uid): Promise<FriendEntry | null> => {
      try {
        const profSnap = await getDoc(doc(db, 'users', uid));
        if (!profSnap.exists()) return null;
        const p = profSnap.data() as Partial<UserProfile>;
        return {
          uid,
          displayName: publicDisplayName(uid, p.displayName),
          photoURL: p.photoURL ?? '',
          seasonScore: p.seasonScore ?? 0,
          currentStreak: p.currentStreak ?? 0,
        };
      } catch {
        return null;
      }
    })
  );
  return entries
    .filter((e): e is FriendEntry => e !== null)
    .sort((a, b) => b.seasonScore - a.seasonScore);
}
