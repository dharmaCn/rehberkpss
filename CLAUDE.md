# KpssMobil — Proje Talimatları

**KpssMobil (App Store'da "KPSS AGS Quiz")** — KPSS/AGS sınav hazırlığı için Türkçe React Native + Expo mobil uygulaması. Ücretsiz, reklamsız, misafir/Google/Apple girişli.

- Repo: github.com/dharmaCn/rehberkpss (main branch)
- Geliştirici: Can Özdar (canozdar@gmail.com, GitHub: dharmaCn)
- Bundle id / package: `com.rehberkpss.app`
- Apple Team ID: 7NDJ59U73L · App Store Connect ID: 6774950987 · Google Play developer ID: 8074651722042556511
- Gizlilik politikası: `https://dharmacn.github.io/rehberkpss/privacy-policy.html`

## Ortam

- **Expo SDK 54** — kod yazmadan önce https://docs.expo.dev/versions/v56.0.0/ adresindeki versiyona özel dokümanı kullan, eski/deprecated API build'i bozar.
- TypeScript + Expo Router (dosya bazlı yönlendirme)
- Firebase Firestore + Auth (Google, Apple, misafir/anonim)
- EAS Build (`eas.json`: `appVersionSource: "remote"`, iOS production `autoIncrement: true`)
- iOS simülatör UDID: `BF4715BD-61A3-4115-B27F-CE79BD7776D9` (iPhone 16 Pro Max)

## Mimari

```
app/
├── _layout.tsx              Kök layout + auth yönlendirmesi
├── (auth)/login.tsx         Giriş ekranı
├── (tabs)/index.tsx         Ana ekran (günlük soru, kültür kartı, seviye, konu anlatımı)
├── (tabs)/leaderboard.tsx   Sıralama
├── (tabs)/profile.tsx       Profil (seviye kartı, streak, badges)
├── quiz/session.tsx         Aktif quiz (30sn timer, hız bonusu)
├── quiz/category.tsx        Ders bazlı quiz seçim
├── topic/[id].tsx           Hap bilgi kartları + mini quiz
├── art/                     Günün Genel Kültür Sorusu
└── wrong/                   Yanlış tekrarı (aralıklı tekrar, 2 gün bekleme)

components/  DailyCultureModal, ExamGoalModal, SeasonResetModal
constants/   questions.ts (501 soru), artworks.ts (50), facts.ts (42), topics.ts (17 ünite), exams.ts, season.ts
lib/         firestore.ts (veri katmanı), badges.ts, levels.ts (XP/seviye), notifications.ts, share.ts, demoMode.ts
```

## Kritik Kurallar

1. `lib/demoMode.ts` içinde **`_demo = false`** olmalı — production build şartı.
2. Expo SDK 54 API'sine sadık kal, deprecated şey yazma.
3. Tüm UI dili **Türkçe**.
4. Firestore rules/indexes değişirse: `firebase deploy --only firestore:rules,firestore:indexes`
5. Değişiklik commit ederken anlamlı mesaj yaz; büyük yayın öncesi `git tag vX.Y.Z-stable` at.
6. Android build cihazsız test edilir: Play Console → "Lansman öncesi rapor" otomatik tarar.
7. Codex ile paralel çalışma ihtimaline karşı: main branch üstünde başkası da değişiklik yapıyor olabilir, işe başlamadan `git log` kontrol et.

## Build & Yayın Komutları

```bash
npm start                                 # Metro dev server
npx expo start --clear                    # Cache temizleyip başlat
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios --latest
firebase deploy --only firestore:rules,firestore:indexes
```

## Güncel Durum (2026-07-04)

| Şey | Durum |
|---|---|
| Versiyon | v1.2.1 (build 24) |
| App Store | Submit edildi, "Waiting for Review" (2 Tem) |
| Google Play | Kapalı test (Alpha); 12 test kullanıcısı; ~16 Tem'de üretim başvurusu açılır (12'nin altına düşerse sayaç sıfırlanır) |
| Stabil snapshot | `git tag v1.2.1-stable`, `git branch backup/v1.2.1-stable` — bozulursa `git reset --hard v1.2.1-stable` |

Son oturumda ([app/(tabs)/index.tsx](app/(tabs)/index.tsx)) ana ekran yenilendi: iki büyük feature kartı (Günlük 10 Soru + Genel Kültür Soruları), kompakt header, canlı 2x2 ders grid'i. Detay için `git log` ve commit mesajlarına bak — ayrı devir notu dosyası tutulmuyor artık.

## v1.3.0 Yol Haritası

**Özellikler (henüz yapılmadı):**
- [ ] Haftalık Deneme Sınavı (pazar 30 soru, yüzdelik dilim, gerçek sınav formatı)
- [ ] Aralıklı yanlış tekrarı cilası (`app/wrong/` iskeleti hazır)
- [ ] Arkadaşla Düello (link paylaşımı + 5 soru, kazanan rozet)
- [ ] Seviye/XP unvanları genişlet (Çaylak → Kâtip → Uzman → Şampiyon → …)

**İçerik büyütme:**
- [ ] Vatandaşlık: 75 → 150 (öncelikli, en zayıf ders)
- [ ] Güncel: 50 → 100 (2026 olayları)
- [ ] Coğrafya: 150 → 200
- [ ] Tarih: 226 → 275
- [ ] Kültür (artworks): 50 → 80
- [ ] Günlük bilgi (facts): 42 → 100

## Yayın Sürecinde Kalan İşler

- **iOS:** review sonucu bekleniyor, onay gelirse otomatik yayına düşer.
- **Android:** ~16 Tem sayaç dolunca Play Console → Kontrol paneli'nden "Üretime başvur".

## Dosya Referansları

| Dosya | Ne için |
|---|---|
| `README.md` | Genel proje tanıtımı |
| `aso/app-store-metadata.md` | App Store metinleri (isim, açıklama, keywords) |
| `aso/screenshots/iphone-6.9/` | App Store ham ekran görüntüleri |
| `firestore.rules` / `firestore.indexes.json` | Firestore kuralları / indeksleri |
| `eas.json` / `app.json` | EAS + Expo konfigürasyonu |
