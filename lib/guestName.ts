// Misafir kullanıcılar için "Misafir #XXXXX" takma adı üretir.

// Bu oturumda denenip vazgeçilen ara şemaların önekleri/örüntüleri — yalnızca
// geriye dönük tespit için (isGuestDisplayName), artık üretilmiyorlar.
const LEGACY_GUEST_PREFIXES = [
  'Aday', 'Öğrenci', 'Çalışkan', 'Azimli', 'Sabırlı', 'Kararlı', 'Gayretli',
  'Umutlu', 'Meraklı', 'Disiplinli',
];
const LEGACY_FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hasan', 'Hüseyin', 'İbrahim', 'Emre',
  'Burak', 'Cem', 'Kerem', 'Mert', 'Onur', 'Yusuf', 'Kaan', 'Deniz', 'Berk',
  'Furkan', 'Serkan', 'Tolga', 'Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep',
  'Elif', 'Merve', 'Büşra', 'Esra', 'Gizem', 'Ece', 'Selin', 'Pınar', 'Zehra',
  'Cansu', 'Duygu', 'İrem', 'Nazlı', 'Sevgi', 'Yasemin', 'Aylin',
];

/** uid'den deterministik "Misafir #XXXXX" takma adı üretir (aynı uid → hep aynı isim). */
export function guestDisplayName(uid: string): string {
  return `Misafir #${uid.slice(-5).toUpperCase()}`;
}

const LEGACY_PREFIX_RE = new RegExp(`^(${LEGACY_GUEST_PREFIXES.join('|')})\\d{2,3}$`);
const LEGACY_FIRST_NAME_RE = new RegExp(`^(${LEGACY_FIRST_NAMES.join('|')}) [A-ZÇĞİÖŞÜ]\\.$`);
const LEGACY_INITIAL_SURNAME_RE = /^[A-ZÇĞİÖŞÜ]\. [A-ZÇĞİÖŞÜ][a-zçğıöşü]+$/;

/** "Misafir #XXXXX" veya bu oturumda denenip vazgeçilen ara şemaları (örn. "Aday482", "Ahmet Y.", "A. Yılmaz") kapsar. */
export function isGuestDisplayName(name: string | null | undefined): boolean {
  if (!name) return true;
  const trimmed = name.trim();
  return (
    /^misafir\b/i.test(trimmed) ||
    LEGACY_PREFIX_RE.test(trimmed) ||
    LEGACY_FIRST_NAME_RE.test(trimmed) ||
    LEGACY_INITIAL_SURNAME_RE.test(trimmed)
  );
}
