# Codex / AI Asistan Devir Notu

Bu dosya, projeye yeni giren AI asistanının (Codex, Claude, vb.) hızlıca bağlam alması için yazıldı. **Her yeni oturumda önce bunu oku.**

---

## Proje Kısaca

**KpssMobil (App Store'da "KPSS AGS Quiz")** — KPSS ve AGS sınav hazırlığı için Türkçe React Native + Expo mobil uygulaması. Ücretsiz, reklamsız, misafir/Google/Apple girişli.

- Repo: github.com/dharmaCn/rehberkpss (main branch)
- Geliştirici: Can Özdar (canozdar@gmail.com, GitHub: dharmaCn)
- iOS bundle id / Android package: `com.rehberkpss.app`

---

## Yayın Durumu (2 Tem 2026)

| Platform | Durum |
|---|---|
| iOS | v1.2.1 (build 24) App Store Connect'e submit edildi, "Waiting for Review" |
| Android | Play Console kapalı test (Alpha) kanalında v1.2.1 aktif, 12 test kullanıcısı kayıtlı, 14 gün sayacı işliyor (~16 Tem'de üretime başvuru açılır) |

**Stabil snapshot:** `git tag v1.2.1-stable`, branch `backup/v1.2.1-stable`.
Bir şey bozulursa: `git reset --hard v1.2.1-stable` veya `git checkout backup/v1.2.1-stable`.

---

## Ortam

- **Expo SDK 54** — versiyona özel dokümanlar: https://docs.expo.dev/versions/v56.0.0/ (BUNU OKU, eski API kullanma)
- TypeScript + Expo Router (dosya bazlı yönlendirme)
- Firebase Firestore + Auth (Google, Apple, misafir/anonim)
- EAS Build (eas.json: `appVersionSource: "remote"`, iOS production `autoIncrement: true`)
- iOS simülatör UDID: `BF4715BD-61A3-4115-B27F-CE79BD7776D9` (iPhone 16 Pro Max)

---

## Mimari

```
app/
├── _layout.tsx              Kök layout + auth yönlendirmesi
├── (auth)/login.tsx         Giriş ekranı (Google/Apple/misafir)
├── (tabs)/
│   ├── index.tsx            Ana ekran (günlük soru, kültür kartı, seviye, konu anlatımı)
│   ├── leaderboard.tsx      Sıralama
│   └── profile.tsx          Profil (seviye kartı, streak, badges)
├── quiz/
│   ├── session.tsx          Aktif quiz (30sn timer, hız bonusu)
│   └── category.tsx         Ders bazlı quiz seçim
├── topic/
│   ├── index.tsx            Konu listesi
│   └── [id].tsx             Hap bilgi kartları + mini quiz
├── art/                     Günün Genel Kültür Sorusu
└── wrong/                   Yanlış tekrarı (aralıklı tekrar, 2 gün bekleme)

components/
├── DailyCultureModal.tsx    Günün genel kültür sorusu modalı
├── ExamGoalModal.tsx        Sınav hedefi seçim modalı
└── SeasonResetModal.tsx     Sezon başlangıç uyarısı

constants/
├── questions.ts             501 KPSS sorusu (Tarih 226 / Coğrafya 150 / Vatandaşlık 75 / Güncel 50)
├── artworks.ts              50 genel kültür sorusu (25 görselli + 25 görselsiz)
├── facts.ts                 42 günlük bilgi kartı
├── topics.ts                17 konu anlatımı ünitesi
├── exams.ts                 KPSS sınav tarihleri
└── season.ts                Sezon 2 tanımı + rozetler

lib/
├── firestore.ts             Tüm Firebase veri katmanı
├── badges.ts                Rozet mantığı
├── levels.ts                XP / seviye hesaplama (Çaylak → ...)
├── notifications.ts         Lokal bildirimler (günlük hatırlatma)
├── share.ts                 Native paylaşım (invite, fact share)
└── demoMode.ts              ⚠️ _demo = false OLARAK KALMALI (build için)
```

---

## Kritik Kurallar

1. **`lib/demoMode.ts` içinde `_demo = false` olmalı** — production build'lerin çalışması için şart.
2. **Expo SDK 54 API'sine sadık kal.** Eski Expo veya RN API'si yazma; deprecated şeyler build'i bozar.
3. **Tüm UI dili Türkçe.** İngilizce yazı hiçbir kullanıcı yüzeyinde olmasın.
4. **Firestore rules/indexes değişirse** `firebase deploy --only firestore:rules,firestore:indexes` çalıştır.
5. **Gizlilik politikası URL'i:** `https://dharmacn.github.io/rehberkpss/privacy-policy.html` (App/Play Store'a bu yazılı).
6. **App Store Connect ID:** 6774950987 (eas.json'da submit için).
7. **Değişiklik commit ederken** anlamlı mesaj yaz; büyük yayın öncesi `git tag vX.Y.Z-stable` at.
8. **Test cihazsız Android build test edilir:** Play Console → "Lansman öncesi rapor" gerçek cihazlarda otomatik tarama yapar, ayrı cihaza gerek yok.

---

## Planlanmış Ama Yapılmamış Özellikler

Kullanıcı bunları istedi, henüz uygulanmadı:

- **Haftalık Deneme Sınavı** — her pazar 30 soru, gerçek sınav formatı, sonunda Türkiye geneli yüzdelik dilim
- **Yanlış tekrarı (aralıklı tekrar)** — temel iskelet `app/wrong/` altında var, `lib/firestore.ts`'te fonksiyonlar hazır olabilir; aralıklar (2/5/10 gün) ve UI parlatılmalı
- **Arkadaşla Düello** — link paylaşımıyla eş zamanlı 5 soru, kazanan rozet
- **Seviye/XP sistemi** — `lib/levels.ts` var, profil kartı çalışıyor; unvanlar genişletilmeli (Çaylak → Kâtip → Uzman → Şampiyon)

**Soru havuzu büyütme hedefi:**
- Vatandaşlık: 75 → 150 (öncelikli, en zayıf ders)
- Güncel: 50 → 100 (2026 güncel olayları eksik)
- Coğrafya: 150 → 200 (ekonomik coğrafya derinleştir)
- Tarih: 226 → 275 (Cumhuriyet dönemi ağırlıklı)
- Kültür (artworks): 50 → 80
- Günlük bilgi (facts): 42 → 100

---

## Build & Yayın Komutları

```bash
# Development
npm start                                 # Metro dev server
npx expo start --clear                    # Cache temizleyip başlat

# Production build
eas build --platform ios --profile production
eas build --platform android --profile production

# TestFlight/App Store gönderim
eas submit --platform ios --latest

# Firestore
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Detaylı Durum

Güncel proje durumu, ASO metinleri, ekran görüntüleri, submit geçmişi için:
- `PROJE_DURUM.md` — genel durum ve TODO
- `aso/app-store-metadata.md` — App Store için tüm metinler (hazır)
- `aso/whats-new-v1.2.0.md` — v1.2.0 sürüm notları
- `aso/screenshots/iphone-6.9/` — App Store için ham ekran görüntüleri

---

## Expo Değişti — Dokümantasyonu Oku

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.
