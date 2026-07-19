import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase';
import { initBootCanary } from '../lib/bootRecovery';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;
    // Firebase auth persistence AsyncStorage okur — canary'nin (gerekirse)
    // bozuk depoyu temizlemesini bekle, yoksa Hermes JS boot'ta yine çökebilir.
    initBootCanary().then(() => {
      if (cancelled) return;
      const auth = getFirebaseAuth();
      if (!auth) {
        setLoading(false);
        return;
      }
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    });
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, []);

  return { user, loading };
}
