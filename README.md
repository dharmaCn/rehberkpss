# KPSS Quiz (rehberkpss)

KPSS Genel Kültür hazırlık uygulaması. Her gün 10 soruluk ana quiz + 4 ders (Tarih, Coğrafya,
Vatandaşlık, Güncel) için 5'er soruluk quizler. Hız bonuslu puanlama, günlük/haftalık/tüm zamanlar
sıralaması, cevap inceleme. Giriş: Google veya **Misafir** (anonim).

## Teknoloji
Expo SDK 54 · React Native 0.81 · expo-router · TypeScript · Firebase (Firestore + Auth, **JS SDK**) ·
EAS Build/Submit. Bundle ID: `com.rehberkpss.app` · Apple ID: 6774950987 · Expo: `@dharmacn/rehberkpss`.

## ⭐ Sürüm & branch durumu
| Branch | Sürüm | Ne | Durum |
|--------|-------|-----|-------|
| `main` | 1.0.0 (build 8) | Sadece crash düzeltmesi | App Store **incelemesinde** — dokunma |
| `v1.1-engagement` | 1.1.0 | 7 engagement özelliği | Geliştirme — 1.0.0 onaylanınca yüklenecek |

## Özellikler
**1.0:** günlük quiz, ders quizleri, sıralama, profil, cevap inceleme + açıklama, dark/light.
**1.1 (yeni):** 🔥 gün serisi (streak) · 📑 Yanlışlarım (tekrar-çöz) · 🏅 12 rozet · 📊 zayıf konu analizi ·
🎉 konfeti + titreşim · 🥇 lig (Bronz→Elmas) · ⏳ KPSS geri sayım + günlük hedef.

## Komutlar
```bash
# Test — simülatörde dev build (Expo Go ÇALIŞMAZ, native modüller var)
npx expo run:ios
# Canlı JS (dev build açıkken kod değişikliği anında yansır)
npx expo start
# Production build + App Store'a gönder
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest   # ASC API key EAS'te kurulu, 2FA yok
```

## Firestore yapısı
- `users/{uid}` — profil + **engagement verisi map olarak**: `currentStreak`, `longestStreak`,
  `lastActiveDate`, `perfectCount`, `categoryStats.{ders}.{correct,total}`, `wrongQuestions.{soruId}`
- `results/{uid}_{YYYY-MM-DD}` — günlük sonuç (sıralama) · `categoryResults/{uid}_{tarih}_{ders}`
- Kurallar: `firestore.rules`. Engagement verisi neden profil dokümanında? Çünkü kurallar alt
  koleksiyonlara izin vermiyor; profil update'i ekstra alanlara izin veriyor → kural değişmeden çalışır.

## ⚠️ Bilinmesi gerekenler (bizi yakan tuzaklar)
- **Expo Go'da çalışmaz** → dev build (`run:ios`) veya TestFlight ile test et.
- **EAS production env**: Firebase/Google anahtarları `.env.local`'de (git-ignore). EAS bunları görmez;
  `eas env` ile ayrıca eklendi. Eksikse production'da Firebase boş kalır.
- **reanimated SDK ile eşleşmeli**: SDK 54 → `react-native-reanimated@4.1.x` + `react-native-worklets`.
  Yanlış sürüm = **iPad'de açılışta crash** (ilk App Store reddinin sebebi buydu).
- **metro.config.js**: `unstable_enablePackageExports=false` — Firebase auth "Component auth not
  registered" hatasını çözmek için. Kaldırma.
- **expo-haptics** yeni native modül → titreşimin çalışması için **yeni build** gerekir (build 8'de yok,
  guard'lı yazıldı, o build'de sessizce devre dışı).
- **npm install bazen eksik kuruyor** (module-not-found tuhaflıkları). Çözüm:
  `npm cache clean --force && rm -rf node_modules && npm install`.
- `ios/`, `android/`, `dist/`, `.expo/` git-ignore'lu, üretilir; commit etme.

## Kısa geçmiş (ne yaptık)
1. **App Store 1.0 reddi** (Guideline 2.1 — iPad'de açılışta crash). Crash log'undan teşhis: native
   TurboModule exception → **reanimated sürüm uyumsuzluğu**. Ayrıca EAS env eksikti.
2. **Düzeltme**: reanimated 4 + worklets, `babel.config.js`, EAS env değişkenleri. Build 8 alındı,
   EAS submit kuyruğu takılınca `.ipa` doğrudan App Store Connect'e yüklendi (altool), TestFlight'ta
   doğrulandı (crash gitti), **review'a gönderildi**.
3. **v1.1**: `main`'i bozmadan `v1.1-engagement` dalında 7 engagement özelliği eklendi (bu README dahil).

> Sınav tarihi `constants/exam.ts`'te — resmî takvim açıklanınca güncelle.
