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

components/  DailyCultureModal, ExamGoalModal, SeasonResetModal, ReportQuestionButton
constants/   questions.ts (902 soru), artworks.ts (81), facts.ts (101), topics.ts (30 ünite: 13 tarih + 10 coğrafya + 7 vatandaşlık), exams.ts, season.ts
lib/         firestore.ts (veri katmanı), badges.ts, levels.ts (XP/seviye), notifications.ts, share.ts, demoMode.ts, guestName.ts
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

Son oturumda eklenenler (detay için `git log`):
- **Soru bildirme özelliği**: `ReportQuestionButton` bileşeni + `questionReports` Firestore koleksiyonu. Günlük quiz, ders bazlı quiz ve yanlışlarım ekranlarındaki sonuç/inceleme görünümlerinde "🚩 Bu soruyu bildir" (ampul ikonlu chip) var. Raporları görmek için Firebase Console → Firestore → `questionReports`. Firestore rules deploy edildi.
- **Sıralama ekranı**: `fetchLeaderboard` varsayılan limiti 50→10 düşürüldü (sadece ilk 10 gösteriliyor).
- **Misafir isimleri**: `lib/guestName.ts` — "Misafir #XXXXX" yerine uid'den deterministik, sınav temalı takma isim üretiliyor (Aday482 gibi); eski kayıtlar da sıralamada geriye dönük düzeltiliyor.
- **Kullanıcı nickname değiştirme**: Profil ekranında isim yanındaki ✏️ ikonuyla herkes (misafir dahil) 2-24 karakter nickname belirleyebiliyor.
- **Yanlışlarım ekranı**: Listedeki bir soruya tıklayınca artık tek soruluk pratik açılıyor (ayrı `quizQueue` state'i); yanlış cevapta soru otomatik kaybolmuyor, "Listeye Dön" ile kullanıcı kendi kararıyla kapatıyor.
- **Konu anlatımı büyütmesi TAMAMLANDI**: Coğrafya ve Vatandaşlık, Tarih'teki gibi tam ünite setine ulaştı (aşağıya bak).
- **Ana ekran sadeleştirme**: Header'da tarih / "bugünkü odağın hazır" / quiz hazır metinleri kaldırıldı; sınava kalan gün küçük chip olarak bırakıldı. "Bugünkü plan" kartı kaldırıldı.
- **Pratik sekmesi**: Ders quizleri, konu anlatımı ve yanlışlar defteri ana ekrandan alınıp yeni `app/(tabs)/practice.tsx` tab ekranına taşındı. Alt tab sırası: Anasayfa → Pratik → Sıralama → Profil.
- **Pratik kart görselleri**: Ders quiz kartlarına konuya özel silik ikon dokusu eklendi (Tarih, Coğrafya, Vatandaşlık, Güncel).
- **Yeni güncelleme ekran görüntüleri**: iPhone 16 Pro Max simülatörde 6 adet PNG alındı ve `aso/screenshots/new-update-2026-07-04/` içine kaydedildi: `01-home-top.png`, `02-home-daily-info.png`, `03-practice-quizzes.png`, `04-practice-topics-repeat.png`, `05-leaderboard.png`, `06-profile.png`. Hepsi 1320×2868.

## v1.3.0 Yol Haritası

**Özellikler (henüz yapılmadı):**
- [ ] Haftalık Deneme Sınavı (pazar 30 soru, yüzdelik dilim, gerçek sınav formatı)
- [ ] Aralıklı yanlış tekrarı cilası (`app/wrong/` iskeleti hazır)
- [ ] Arkadaşla Düello (link paylaşımı + 5 soru, kazanan rozet)
- [ ] Seviye/XP unvanları genişlet (Çaylak → Kâtip → Uzman → Şampiyon → …)

**İçerik büyütme — tamamlandı (2026-07-04 itibarıyla mevcut sayılar):**
- [x] Vatandaşlık: 199 soru (+49, web onay masasından geçirilerek eklendi)
- [x] Güncel: 149 soru (+49, web onay masasından geçirilerek eklendi)
- [x] Coğrafya: 235 soru (+35, web onay masasından geçirilerek eklendi)
- [x] Tarih: 319 soru (+44, web onay masasından geçirilerek eklendi)
- [x] Kültür (artworks): 81
- [x] Günlük bilgi (facts): 101

**Konu anlatımı büyütme — TAMAMLANDI (`constants/topics.ts`, format: her ünite kolay/orta/zor × ~15 kart + ~10 soru):**
- [x] Tarih: 13 ünite (t01-t13) — İslamiyet öncesi'nden Cumhuriyet'e kadar
- [x] Coğrafya: 10 ünite (c01-c10: Konum, İklim, Yerşekilleri, Su Kaynakları, Nüfus-Yerleşme, Tarım, Sanayi, Madenler-Enerji, Ulaşım, Bölgeler)
- [x] Vatandaşlık: 7 ünite (v01-v07: Devlet-Anayasa, Temel Haklar, Yasama-TBMM, Yürütme-Cumhurbaşkanı, Yargı, Yerel Yönetimler, Uluslararası Kuruluşlar)
- Yeni ünite eklenirse `app/(tabs)/index.tsx`'teki "N ünite" etiketini de güncelle.
- Sıradaki büyütme fikri: mevcut ünitelere ek zorluk katmanı, ya da yeni bir ders (örn. Genel Yetenek/Matematik) eklenmesi — henüz karar verilmedi.

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
