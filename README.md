# RehberKPSS — Geliştirici Notu

KPSS Genel Kültür sınav hazırlık uygulaması. Her gün 10 soru, günlük/haftalık/tüm zamanlar sıralaması.

---

## Uygulama Ne Yapıyor?

- Kullanıcılar **Google ile giriş** yapar
- Her gün aynı 10 soru herkese gelir (tarih bazlı deterministik seçim)
**- Sorular: **Tarih, Coğrafya, Vatandaşlık** konularından
**- Puan sistemi: doğru cevap (100 puan) + hız bonusu (max 50 puan) = max 150/soru, **1500 puan/gün**
- **Günlük / Haftalık / Tüm zamanlar** sıralaması
- Profil ekranında toplam puan, sıralama ve seviye (Başlangıç → Uzman)

---

## Teknik Stack

| Katman | Teknoloji |
|--------|-----------|
| Mobil uygulama | Expo (React Native) + TypeScript |
| Navigasyon | Expo Router (dosya tabanlı) |
| Auth | Firebase Google Sign-In + expo-auth-session |
| Veritabanı | Firebase Firestore |
| İkonlar | @expo/vector-icons (Ionicons) |
| Build | EAS Build (Expo Application Services) |

---

## Proje Dosya Yapısı

```
KpssMobil/
├── app/
│   ├── _layout.tsx          ← Kök layout, auth yönlendirmesi
│   ├── index.tsx            ← Giriş noktası (login'e yönlendirir)
│   ├── (auth)/
│   │   └── login.tsx        ← Google giriş ekranı
│   ├── (tabs)/
│   │   ├── _layout.tsx      ← Alt tab bar (Quiz / Sıralama / Profil)
│   │   ├── index.tsx        ← Ana ekran (günlük quiz kartı)
│   │   ├── leaderboard.tsx  ← Sıralama ekranı
│   │   └── profile.tsx      ← Profil ekranı
│   └── quiz/
│       └── session.tsx      ← Aktif quiz (timer, puanlama, sonuç)
│
├── lib/
│   ├── firebase.ts          ← Firebase başlatma (lazy init)
│   ├── firestore.ts         ← Veritabanı işlemleri (kullanıcı, sonuç, sıralama)
│   ├── quiz.ts              ← Günlük soru seçimi, puan hesabı
│   └── demoMode.ts          ← Auth olmadan test için demo flag
│
├── constants/
│   ├── questions.ts         ← 36 soruluk soru havuzu
│   └── colors.ts            ← Renk sistemi (primary: #4F46E5)
│
├── hooks/
│   ├── useAuth.ts           ← Firebase auth durumu
│   └── useColorScheme.ts    ← Dark/Light tema
│
├── .env.local               ← Firebase credentials (gizli, paylaşma)
├── app.json                 ← Expo uygulama konfigürasyonu
├── eas.json                 ← EAS Build konfigürasyonu
└── firestore.rules          ← Firestore güvenlik kuralları
```

---

## Firebase Kurulumu

**Proje:** `rehberkpss` — [console.firebase.google.com](https://console.firebase.google.com)

| Servis | Durum |
|--------|-------|
| Authentication (Google) | ✅ Aktif |
| Firestore Database | ✅ Aktif (europe-west) |
| Security Rules | ✅ Yayınlandı |

**Firestore Koleksiyonları:**
- `users/{uid}` — kullanıcı profili (displayName, totalScore, quizCount, bestDayScore)
- `results/{uid}_{YYYY-MM-DD}` — günlük quiz sonucu (score, correct, date, week)

**Credentials:** `.env.local` dosyasında. Bu dosyayı kimseyle paylaşmayın, Git'e eklemeyin.

---

## Şu An Çalışan / Çalışmayan

| Özellik | Durum | Not |
|---------|-------|-----|
| Uygulama arayüzü | ✅ Çalışıyor | Web + Expo Go demo modda |
| Quiz akışı | ✅ Çalışıyor | Timer, puan, sonuç ekranı |
| Sıralama ekranı | ✅ Çalışıyor | Firestore bağlı |
| Profil ekranı | ✅ Çalışıyor | |
| Dark/Light mod | ✅ Çalışıyor | Sisteme göre otomatik |
| Google Sign-In | ⚠️ Demo modda | Native build gerekiyor |
| Veri kaydetme | ⚠️ Auth gerekli | Google girişinden sonra çalışır |

---

## Tamamlanan Adımlar

- [x] Expo + TypeScript proje kurulumu
- [x] Tüm ekranlar tasarlandı ve kodlandı
- [x] Firebase projesi oluşturuldu (rehberkpss)
- [x] Firestore Security Rules yazıldı ve yayınlandı
- [x] EAS CLI kuruldu ve Expo hesabına giriş yapıldı
- [x] `eas.json` oluşturuldu (development / preview / production profilleri)

---

## Sıradaki Adımlar

### iOS'a Çıkmak İçin
1. **Xcode indir** — App Store'dan (~12GB) → İndirme başladı ✅
2. Xcode indikten sonra simülatörde test: `npx expo run:ios`
3. **Apple Developer hesabı aç** — [developer.apple.com](https://developer.apple.com) ($99/yıl)
4. Production build: `eas build --platform ios --profile production`
5. App Store'a gönder: `eas submit --platform ios`

### Uygulama Kalitesi İçin
6. **Soru havuzunu genişlet** — `constants/questions.ts` dosyasına ek sorular ekle (şu an 36 soru var, ~2 haftada tekrar eder)
7. **App icon & splash screen** — `assets/` klasörüne 1024×1024 PNG ekle, `app.json` güncelle
8. **Firestore index'leri** — sıralama sorguları için composite index ekle (ilk kullanıcı girişinde Firebase Console uyarı verecek, linke tıkla oluştur)
9. **Gizlilik Politikası** — App Store için zorunlu, basit bir web sayfası yeterli

### Google Sign-In'i Aktif Etmek İçin
10. EAS Build ile native binary oluştur (adım 4 ile birlikte)
11. Apple Developer hesabı sonrası iOS OAuth Client ID al
12. `.env.local` dosyasına `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` ekle

---

## Yerel Geliştirme

```bash
# Bağımlılıkları yükle
npm install --legacy-peer-deps

# Web'de çalıştır (önizleme)
npx expo start --web

# Expo Go ile telefonda çalıştır
npx expo start

# iOS Simulator'da çalıştır (Xcode gerekli)
npx expo run:ios
```

---

## Ortam Değişkenleri (.env.local)

```
EXPO_PUBLIC_FIREBASE_API_KEY=          ← Firebase Console'dan
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=      ← Firebase Console'dan
EXPO_PUBLIC_FIREBASE_PROJECT_ID=       ← rehberkpss
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=   ← Firebase Console'dan
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID= ← Firebase Console'dan
EXPO_PUBLIC_FIREBASE_APP_ID=           ← Firebase Console'dan
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=      ← Firebase Auth > Google > Web SDK configuration
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=      ← Google Cloud Console'dan (henüz eklenmedi)
```
