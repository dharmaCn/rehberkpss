// Misafir kullanıcılar için "Misafir #XXXXX" yerine daha doğal, sınav temalı
// takma isimler üretir — sıralamada "az kullanıcı var" hissini azaltmak için.

const GUEST_NICKNAME_PREFIXES = [
  'Aday',
  'Öğrenci',
  'Çalışkan',
  'Azimli',
  'Sabırlı',
  'Kararlı',
  'Gayretli',
  'Umutlu',
  'Meraklı',
  'Disiplinli',
];

function hashToInt(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** uid'den deterministik, doğal görünen bir misafir takma adı üretir (aynı uid → hep aynı isim). */
export function guestDisplayName(uid: string): string {
  const h = hashToInt(uid);
  const prefix = GUEST_NICKNAME_PREFIXES[h % GUEST_NICKNAME_PREFIXES.length];
  const num = 100 + (h % 900); // 3 haneli, 100-999
  return `${prefix}${num}`;
}

/** Eski "Misafir #XXXXX" veya sade "Misafir" formatındaki isimleri de kapsar. */
export function isGuestDisplayName(name: string | null | undefined): boolean {
  if (!name) return true;
  return /^misafir\b/i.test(name.trim());
}
