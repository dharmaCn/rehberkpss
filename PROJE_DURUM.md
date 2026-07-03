# KPSS Quiz — Proje Durum & Devir Raporu

> Bu dosya, yeni bir oturumun projeyi tek bakışta anlaması için yazıldı. En güncel durum burada.
> Son güncelleme: 2026-06-20 (v1.1.0 App Store review'da, Android kuruluyor)

---

## 1. UYGULAMA NEDİR

**KPSS Quiz: Soru Bankası 2026** — Türkiye KPSS Genel Kültür sınavına hazırlık uygulaması.
- Her gün herkese aynı 10 soru (tarih bazlı deterministik seçim)
- Ders quizleri (Tarih/Coğrafya/Vatandaşlık/Güncel, 5'er soru, %20 puan)
- Konu anlatımı (hap bilgi kartları + mini quiz, Kolay/Orta/Zor)
- Canlı sıralama (günlük/haftalık/sezon), profil, rozetler, streak
- Ücretsiz, reklamsız. Giriş: Misafir / Google / Apple

**Kimlikler:**
- iOS bundle / Android package: `com.rehberkpss.app`
- Expo slug: `rehberkpss`, EAS projectId: `6324be1c-25c7-412e-af56-d3c778aab7d7`
- App Store Connect App ID (ascAppId): `6774950987` — App ID (URL'de): `6753145867`
- Firebase projesi: `rehberkpss` (europe-west)
- EAS hesabı: `dharmacn` (canozdar@gmail.com), Apple Team: `7NDJ59U73L` (Can Ozdar, Individual)

---

## 2. ŞU ANKİ DURUM (NEREDE KALDIK)

### iOS — v1.1.0
- **Build 19** production olarak derlendi + App Store Connect'e submit edildi.
- App Store'da **"Waiting for Review"** durumunda (manuel release seçili).
- Onaylanınca App Store Connect'ten "Release this Version" ile yayınlanacak.
- Mevcut canlı sürüm: v1.0.1 (Build 15).

### Android — İLK KEZ yayınlanacak (henüz Play'de YOK)
- Google Play Console hesabı açıldı ama **kurulum doğrulamaları sürüyor**:
  1. Android cihaz doğrulama (Play Console mobil app ile giriş)
  2. Telefon numarası doğrulama
  3. Kimlik belgesi onayı (Google manuel inceler, 1-3 gün)
- ⚠️ **Bireysel hesapta yeni uygulama için Google'ın 20 tester + 14 gün test zorunluluğu var** (production'dan önce). Kurumsal hesapta bu yok.
- Henüz hiç Android build alınmadı. `eas.json`'a APK (preview) ve AAB (production) profili eklenmesi planlandı ama HENÜZ UYGULANMADI (kullanıcı araya girdi).

---

## 3. v1.1.0'DA NE YAPILDI (özet)

**Retention:** Streak (gün serisi) + Streak Freeze, günlük 20:00 + haftalık (Pazar 19:30) + 3/5/7 günlük geri çağırma yerel bildirimleri, streak kırılma banner'ı.
**Rozetler:** 9 rozet (streak_3/7/30/100, perfect_score, quiz_10/50/100, first_week), quiz sonu kutlama modalı.
**Sezon:** Sezon 2 başlatıldı, sıralamalar `seasonScore` ile sıfırlandı (eski `totalScore` "Tüm Zamanlar"da korunuyor). İlk açılışta tek seferlik modal.
**Onboarding:** İlk açılışta sınav tarihi (Lisans 6 Eylül / Önlisans 4 Ekim / Ortaöğretim 25 Ekim 2026 / Belirsiz) + hedef puan (70-95+) wizard'ı. Ana ekranda "Sınava X gün kaldı".
**Welcome missions:** 4 görevli ilk hafta checklist'i.
**Yanlışlarım Defteri:** Yanlış sorular `users/{uid}/wrongQuestions` altına kaydedilir, tekrar çözülür, "Bunu Unutma" kartı.
**Viral:** Sonuç görseli paylaşımı (view-shot) + meydan okuma deeplink, arkadaş daveti.
**UX:** Haptic feedback, sonuçta "%X'inden iyisin" sosyal kıyas, konu listesinde 3 sekme (Tarih/Coğrafya/Vatandaşlık), profilde haftalık bar grafiği, bildirim toggle.

**İçerik:** Tarih 13/13 ünite tam dolu (önceden 4'tü). Coğrafya 2 ünite (c01, c02), Vatandaşlık 2 ünite (v01, v02) yeni eklendi. ~150 kart + ~120 soru.

**Düzeltilen buglar (TestFlight testlerinde bulundu):**
- Kategori (5'lik) quizi günlük 10'luk quizi yanlışlıkla "tamamlandı" yapıyordu → `mainCompleted` flag'i ile ayrıştırıldı.
- Quiz/davet sonrası ana sayfa & profil cache gösteriyordu → `useFocusEffect` ile her odakta yenileme.
- Davet butonuna basıp Cancel'da görev tamamlanıyordu → `Share.share` `activityType` kontrolü.
- Streak Freeze tüm gap'leri kurtarıyordu → sadece tam 1 günü kurtaracak şekilde düzeltildi.

---

## 4. MİMARİ & DOSYA HARİTASI

```
app/
  _layout.tsx          ← kök, auth yönlendirme, SeasonResetModal, comeback push refresh
  (auth)/login.tsx     ← Google/Apple/Misafir giriş
  (tabs)/
    index.tsx          ← ANA EKRAN: streak çipi, sınav sayacı, missions, quiz kartı, konu kartları, yanlışlarım kartı
    leaderboard.tsx    ← sıralama (seasonScore ile)
    profile.tsx        ← sezon kartı, streak, rozetler, haftalık grafik, bildirim toggle, davet
  quiz/
    session.tsx        ← günlük 10 soruluk quiz (haptic, paylaş, rozet modal, sosyal kıyas)
    category.tsx       ← ders quizi (5 soru)  [dosya adı tahmini, /quiz/category route'u]
  topic/
    index.tsx          ← konu listesi, 3 sekmeli (subject param ile)
    [id].tsx           ← konu detayı: seviye seç → kartlar → mini quiz → sonuç (+ Ana Sayfa butonu)
  wrong/
    index.tsx          ← Yanlışlarım Defteri (liste + tekrar quiz + "Bunu Unutma" kartı)

lib/
  firebase.ts          ← Firebase init (lazy), getAuthSync, deleteAccountAsync
  firestore.ts         ← TÜM veri işlemleri (kullanıcı, sonuç, sıralama, streak, rozet, missions, wrongQuestions)
  quiz.ts              ← getDailyQuestions, getDailyCategoryQuestions, calculateScore, getTodayKey
  badges.ts            ← BADGES tanımları + evaluateNewBadges()
  notifications.ts     ← yerel bildirim planlama (enableAll/disableAll/refreshComebackSchedule)
  share.ts             ← captureAndShare, shareInvite, buildChallengeUrl
  review.ts            ← in-app rating prompt
  demoMode.ts          ← auth'suz test flag

constants/
  questions.ts         ← 501 soruluk ana havuz (Question tipi)
  topics.ts            ← konu anlatımı (Topic[], TARİH t01-t13, COĞRAFYA c01-c02, VATANDAŞLIK v01-v02)
  colors.ts            ← renk sistemi (primary #4F46E5)
  season.ts            ← SEASON_ID='s2', SEASON_END_AT='2026-09-20', daysUntil()
  exams.ts             ← KPSS_EXAMS (sınav tarihleri), TARGET_SCORES

components/
  SeasonResetModal.tsx ← "Sezon 2 Başladı" tek seferlik modal (AsyncStorage flag)
  ExamGoalModal.tsx    ← sınav tarihi + hedef puan wizard'ı

hooks/useAuth.ts       ← Firebase auth durumu
```

### Firestore şeması
```
users/{uid}: displayName, email, photoURL, totalScore, quizCount, bestDayScore,
             seasonId, seasonScore, currentStreak, longestStreak, lastQuizDate,
             badges[], profileMeta{examDate,targetScore}, missions{...}, streakFreeze{available,autoUsedAt}
users/{uid}/wrongQuestions/{questionId}: questionId, lastWrongAt, wrongCount, mastered
results/{uid}_{YYYY-MM-DD}: score, mainScore, mainCompleted, correct, date, week, seasonId
categoryResults/{uid}_{YYYY-MM-DD}_{category}: score, correct, category, date

Composite index (firestore.indexes.json):
  results(date asc, score desc), results(week asc, score desc),
  users(seasonId asc, seasonScore desc)
```
⚠️ Index'lerin Firebase'e deploy edilmesi gerekebilir: `firebase deploy --only firestore:indexes`
(Sıralama "alltime/sezon" boş geliyorsa index eksiktir.)

---

## 5. TEKNİK STACK & SÜRÜMLER

- Expo SDK **54** (docs: https://docs.expo.dev/versions/v56.0.0/ — AGENTS.md eski, gerçekte 54.0.35), React Native + TypeScript, Expo Router (dosya tabanlı), typedRoutes açık
- Firebase JS SDK (Firestore + Auth), @react-native-google-signin, expo-apple-authentication
- v1.1'de eklenen: expo-notifications, expo-haptics, expo-sharing, react-native-view-shot, @react-native-async-storage/async-storage
- `ios/` klasörü prebuild edilmiş halde repo'da var (CNG değil, bare-ish). app.json plugin değişiklikleri için `npx expo prebuild` gerekebilir.

---

## 6. SIK YAPILAN İŞLER (KOMUTLAR)

```bash
# Geliştirme
npx expo start --clear            # Metro (env: .env.local otomatik yüklenir)
npx tsc --noEmit                  # tip kontrolü (commit öncesi şart)

# iOS build & submit
eas build --platform ios --profile production --auto-submit --non-interactive --no-wait
eas build:list --platform ios --limit 1 --json    # son build id
eas build:view <BUILD_ID> --json                  # durum/hata

# Android (HENÜZ YAPILMADI - eas.json'a profil eklenmeli)
eas build --platform android --profile preview --no-wait      # APK (test için)
eas build --platform android --profile production --no-wait    # AAB (Play Store)

# Kimlik bilgileri (capability sorunlarında)
eas credentials --platform ios
```

### ⚠️ KRİTİK GOTCHA — iOS provisioning
İlk preview build'leri **"provisioning profile doesn't support Push Notifications and Sign in with Apple"** hatası verdi.
Çözüm: `eas credentials` → Build Credentials → **All: Set up all required credentials** ile profil yenilendi (Push capability eklendi).
Bu sırada Apple **"PLA Update available"** (403) hatası verdi → developer.apple.com'da yeni Program License Agreement imzalanınca düzeldi.
**Production profile için de aynı capability sync gerekti** (build sırasında "Set up Push Notifications? Yes" + "Generate APN key? Yes" denildi).

### Sürüm artırma
- `app.json` `version` elle artırılır (şu an "1.1.0").
- iOS buildNumber `eas.json` production'da `autoIncrement: true` → otomatik (şu an 19).
- `appVersionSource: remote` → versiyon EAS'tan yönetiliyor.

### OTA Update
- ⚠️ `expo-updates` paketi KURULU DEĞİL. Yani JS-only değişiklikler için OTA yapılamaz; her değişiklik yeni build gerektirir.
- İleride hızlı düzeltme istenirse: `npx expo install expo-updates` + `eas update:configure` kurulabilir.

---

## 7. SIRADAKİ ADIMLAR (TODO)

### Android yayını (aktif iş)
1. Google Play Console hesap doğrulamalarını bitir (cihaz + telefon + kimlik — Google 1-3 gün inceler).
2. `eas.json`'a Android profillerini ekle:
   - preview → `"android": {"buildType": "apk"}` (test için APK)
   - production → `"android": {"buildType": "app-bundle"}` (AAB)
3. Test için APK build al, arkadaşın Android telefonuna kur (Play onayı gerekmez).
4. Play Console'da uygulama oluştur: store listing (ekran görüntüleri, ikon, açıklama — iOS'takiler uyarlanabilir), içerik derecesi anketi, hedef kitle, gizlilik politikası URL'i (https://github.com/dharmaCn/rehberkpss veya privacy-policy.html).
5. ⚠️ Bireysel hesapsa: 20 tester + 14 gün kapalı test zorunluluğunu tamamla.
6. AAB üret → Internal testing → sonra Production track → Google review (24-48 saat).
7. `eas.json` submit bölümüne Android ekle (service account json gerekir) veya AAB'yi elle Play Console'a yükle.

### iOS
- App Review onayını bekle → "Release this Version" ile yayınla (manuel seçili).
- Reddedilirse genelde küçük şey (privacy, demo hesap) — düzeltip tekrar gönder.

### İçerik (gelecek sürümler için)
- Coğrafya/Vatandaşlık ünitelerini çoğalt (şu an 2'şer). Tarih 13/13 tam.
- Soru havuzu 501'de, isteğe göre genişletilebilir.

### Teknik borç / iyileştirme fikirleri
- `expo-updates` kurup OTA aç (hızlı bugfix için).
- Sezon sonu (2026-09-20) Şampiyon rozeti dağıtımı henüz otomatik değil → scheduled cloud function veya admin script gerekir.
- Geri çağırma push'ları sadece yerel (uygulama açılınca yeniden planlanıyor); gerçek server push için FCM + Cloud Function gerekir.

---

## 8. ÖNEMLİ NOTLAR / TUZAKLAR

- **AGENTS.md yanıltıcı:** "Expo v56 docs oku" diyor ama proje gerçekte SDK 54. Sürüm doğrulamak için `package.json`'a bak.
- **.env.local** Firebase credentials içerir, git'e EKLENMEZ. EAS build sırasında otomatik yüklenir.
- **Demo mode** (`lib/demoMode.ts`): auth olmadan UI testi için; gerçek Firestore yazmaz.
- **Sezon mantığı:** Yeni sezon başlatmak istenirse `constants/season.ts`'te `SEASON_ID` değiştir → modal flag sıfırlanır, leaderboard yeni seasonScore'la başlar. Eski puanlar korunur.
- **Bildirimler tamamen yerel** (no FCM/server). expo-notifications plugin app.json'da, color #4F46E5.
- **Apple Sign-In + Push** entitlement'ları provisioning profile'da olmalı (yukarıdaki gotcha).
- Test cihazı UDID (EAS provisioned): `00008101-00144C1914E3001E` (iPhone).

---

## 9. HIZLI REFERANS — "X nasıl yapılır?"

| İstek | Nereye bak / ne yap |
|-------|--------------------|
| Yeni soru ekle | `constants/questions.ts` (Question tipi) |
| Konu anlatımı ekle/düzenle | `constants/topics.ts` (Topic, t/c/v prefixli id) |
| Rozet ekle | `lib/badges.ts` (BADGES + evaluateNewBadges) |
| Sınav tarihi güncelle | `constants/exams.ts` (KPSS_EXAMS) |
| Yeni sezon başlat | `constants/season.ts` (SEASON_ID değiştir) |
| Bildirim mesajı/saati | `lib/notifications.ts` |
| Streak/puan mantığı | `lib/firestore.ts` (saveQuizResult, computeStreakUpdate) |
| Yeni iOS sürüm yayınla | version artır → eas build production --auto-submit → App Store Connect'te build seç + submit |
| Android'e başla | bkz. Bölüm 7 |
| Sıralama boş geliyor | firestore.indexes.json deploy et |
```
