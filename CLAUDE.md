# KpssMobil — Proje Talimatları

**KpssMobil (App Store'da "KPSS AGS Quiz")** — KPSS/AGS sınav hazırlığı için Türkçe React Native + Expo mobil uygulaması. Ücretsiz, reklamsız, misafir/Google/Apple girişli.

- Repo: github.com/dharmaCn/rehberkpss (main branch)
- Geliştirici: Can Özdar (canozdar@gmail.com, GitHub: dharmaCn)
- Bundle id / package: `com.rehberkpss.app`
- Apple Team ID: 7NDJ59U73L · App Store Connect ID: 6774950987 · Google Play developer ID: 8074651722042556511
- Gizlilik politikası: `https://dharmacn.github.io/rehberkpss/privacy-policy.html`
- App Store: `https://apps.apple.com/tr/app/kpss-quiz-soru-bankası-2026/id6774950987`
- Google Play: `https://play.google.com/store/apps/details?id=com.rehberkpss.app`
- Platform algılayan ortak indirme linki (Android→Play Store, iOS→App Store): `https://dharmacn.github.io/rehberkpss/indir.html` (repo kökündeki `indir.html`, GitHub Pages ile aynı yerden yayınlanıyor)

## Ortam

- **Expo SDK 54** — kod yazmadan önce https://docs.expo.dev/versions/v56.0.0/ adresindeki versiyona özel dokümanı kullan, eski/deprecated API build'i bozar.
- TypeScript + Expo Router (dosya bazlı yönlendirme)
- Firebase Firestore + Auth (Google, Apple, misafir/anonim)
- EAS Build (`eas.json`: `appVersionSource: "remote"`, iOS production `autoIncrement: true`)
- iOS simülatör UDID: `BF4715BD-61A3-4115-B27F-CE79BD7776D9` (iPhone 16 Pro Max)
- **Android emülatör bu Mac'te kurulu** (2026-08-03'te kuruldu): Android Studio + SDK `~/Library/Android/sdk`, AVD adı **`Pixel_8`** (önceki not "Pixel_8_API_34" yanlıştı — `emulator -list-avds` ile doğrulanmış gerçek isim bu; Android 14, Google APIs, arm64-v8a). Çalıştırmak için: `export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk" ANDROID_HOME="$HOME/Library/Android/sdk" JAVA_HOME="/opt/homebrew/opt/openjdk@17"`, sonra Android Studio → Device Manager'dan emülatörü başlat (veya `emulator -avd Pixel_8` — `emulator` PATH'e ekli değilse `$ANDROID_SDK_ROOT/emulator/emulator`). **2026-09-02'de bu ortamda emülatör komut satırından tekrar tekrar başlatılıp saniyeler içinde kendiliğinden kapandı** (nohup/disown ile bağımsız süreç yapılsa bile) — kök nedeni belirlenemedi, muhtemelen bu spesifik terminal/oturum ortamına özgü bir kısıt; Android Studio GUI'sinden başlatmak daha güvenilir olabilir. Uygulamayı kurup Metro'ya bağlamak için `npx expo run:android` (native modüller içerdiğinden Expo Go çalışmaz, dev build şart). `adb`/`avdmanager`/`sdkmanager` de `platform-tools`/`cmdline-tools` altında kurulu.

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

components/  DailyCultureModal, ExamGoalModal, SeasonResetModal, ReportQuestionButton, DuelRunner
constants/   questions.ts (genel kültür, 2550 soru — hedefe ulaşıldı: Tarih/Coğrafya/Vatandaşlık/Güncel), agsQuestions.ts (AGS/Eğitim Bilimleri, 1502 soru — hedefe ulaşıldı: 9 alt dal), artworks.ts (81), facts.ts (101), topics.ts (31 ünite: 14 tarih + 10 coğrafya + 7 vatandaşlık), exams.ts, season.ts
lib/         firestore.ts (veri katmanı), badges.ts, levels.ts (XP/seviye), titles.ts (Aday Kimliği unvanları — genel kültür), categoryAnalysis.ts (Zayıf Konu Radarı — genel kültür), agsQuiz.ts (AGS soru seçimi/etiket/renk), agsTitles.ts (AGS unvan seti), agsCategoryAnalysis.ts (AGS Zayıf Konu Radarı), duels.ts, notifications.ts, share.ts, demoMode.ts, guestName.ts, onboarding.ts
app/(tabs)/ags.tsx  AGS sekmesi: 9 konu kartı + Zayıf Konu Radarı + unvan rozeti
app/ags/     AGS quiz akışı (5 soru, 30sn timer) — kendi Firestore alanları (agsCategoryStats/agsTitleId), genel kültür skor/liderlik sistemine dokunmaz
app/duel/    Arkadaşla düello (yeni + [id] sonuç ekranı)
app/evening/ Akşam Sınavı (20:00'de açılan ek 10 soru)
app/weekly/  Haftalık Deneme (Pazar günü açılan 30 soruluk gerçek sınav formatı, yüzdelik dilim)
app/recap/[month].tsx  Atanma Günlüğü (aylık paylaşılabilir özet kartı)
app/onboarding.tsx  Yeni kullanıcı karşılama akışı
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

## Güncel Durum (2026-08-21)

**Kısa özet — "uygulama şu an ne durumda?" sorusunun cevabı:**
- 🍎 **App Store:** v1.3.5 **canlı**, v1.3.6 (build 49 — Haftalık Deneme, Atanma Günlüğü, ~230 yeni soru) **Apple incelemesinde** (2026-08-21'de submit edildi, 48 saate kadar sürebilir).
- 🤖 **Google Play:** v1.3.5 **canlı**, v1.3.6 (versionCode 9, aynı içerik) **Google incelemesine gönderildi** (2026-08-21, submit "COMPLETED" döndü).
- **İki platform da senkron** — aynı gün, aynı içerikle her iki mağazaya da gönderim yapıldı.

| Şey | Durum |
|---|---|
| iOS versiyon | **v1.3.5/build 48 hâlâ canlı; v1.3.6/build 49 Apple incelemesinde.** `eas build --platform ios --profile production` (EAS_SKIP_AUTO_FINGERPRINT=1 ile, fingerprint hesaplama zaman zaman timeout veriyor) + App Store Connect'te elle yeni versiyon (1.3.6) oluşturulup build 49 eklendi, "What's New" ve "Notes" güncellendi, manuel yayın modu korunarak review'a gönderildi (2026-08-21). Apple onayladıktan sonra Can'ın elle "Release This Version" yapması gerekecek. |
| Android versiyon | **v1.3.5 (versionCode 7) hâlâ canlı; v1.3.6 (versionCode 9) Google incelemesinde.** İlk build denemesi fingerprint timeout'uyla başarısız oldu (versionCode 8 boşa gitti), `EAS_SKIP_AUTO_FINGERPRINT=1` ile tekrar denenip versionCode 9 olarak başarıyla build alındı ve `eas submit` ile gönderildi (2026-08-21). |
| Google Play | **Üretim: Etkin** (kapalı test aşaması geride kaldı, hesaba üretim erişimi Google tarafından resmen verildi). `eas.json`'daki `submit.production.android.track` **"alpha"dan "production"a çevrildi** (artık `eas submit` direkt üretime gönderiyor). Mağaza ekran görüntüleri de 1.3.4'e göre güncellendi (AGS sekmesi, Pratik, Sıralama, Profil dahil, `aso/screenshots/android-2026-08-02/`). |
| Age Ratings (iOS) | Apple'ın yeni "Social Media" sorularına (App Information → Age Ratings anketi) cevap verildi — uygulamada içerik yeniden yayma/sosyal besleme özelliği olmadığı için "No" işaretlendi. Hesaplanan derecelendirme hâlâ 4+. |
| EAS build kotası | Ücretsiz aylık kota Temmuz sonunda tükenmişti — `eas build --local` (bu Mac'te, Fastlane ile) kullanıldı; bkz. aşağıdaki oturum notu. Ağustos'ta kota sıfırlandı |
| Stabil snapshot | `git tag v1.2.1-stable`, `git branch backup/v1.2.1-stable` — bozulursa `git reset --hard v1.2.1-stable` |

**⚠️ Crash/hata izleme şu an aktif değil, elle kontrol gerekiyor:** Sentry entegrasyonu daha önce TestFlight'ta çökmeye sebep olduğu için tamamen kaldırıldı (kod tabanında hiç iz kalmadı) — yani ne Android'de ne iOS'ta gerçek zamanlı/bildirimli bir hata izleme yok. Kontrol için elle bakmak gerekiyor: **Android** → Play Console → Kalite → Android vitals (crash/ANR raporları). **iOS** → Xcode → Window → Organizer → Crashes (sadece bu Mac'ten, App Store kullanıcılarının sembolize crash logları). İleride gerçek zamanlı bir çözüm (Sentry'yi doğru yapılandırıp geri eklemek gibi) değerlendirilebilir.

**✅ Sıralama/düello/arkadaşlık iOS-Android arası tamamen ortak:** `lib/firestore.ts`'teki `fetchLeaderboard()` platform bazlı hiçbir filtre içermiyor — tek Firebase projesi, tek `users`/`results` koleksiyonu. iOS'tan ve Android'den gelen kullanıcılar aynı günlük/haftalık/tüm zamanlar sıralamasında, aynı düello/arkadaşlık sisteminde buluşuyor.

**App Store Connect uygulama görünen adı hâlâ "KPSS Quiz: Soru Bankası 2026"** — `app.json`'daki `name`/`CFBundleDisplayName` "KPSS AGS Quiz" olsa da, App Store Connect'in "App Name" alanı (App Information sayfası) bağımsız bir metadata alanı ve manuel güncellenmesi gerekiyor; Apple bunu değiştirmek için yeni versiyon açılmasını şart koşuyor ("To make changes to the app name... create a new app version"). Can'ın kendisinin App Store Connect → App Information'dan güncellemesi gerekiyor, kod tarafında yapılacak bir şey yok.

**✅ GERÇEK KÖK NEDEN BULUNDU (2026-08-08) — bizim kodumuzla ilgisi yok, üst seviyede (Meta/Apple) çözülmesi gereken bilinen bir Hermes motoru hatası:**
iOS 26, fiziksel cihazlarda ARM64 "Pointer Authentication" (PAC) denetimini sertleştirdi. Hermes'in içi (HiddenClass property lookup zinciri) ham pointer aritmetiği yapıyor, bu PAC imzalarını geçersiz kılıyor → `KERN_PROTECTION_FAILURE`/`EXC_BAD_ACCESS`. Sadece **fiziksel cihazlarda** oluyor (simülatörler donanım PAC kontrolü yapmıyor). Hem Hermes V1 hem V2, eski ve yeni mimari etkileniyor, **bilinen bir kod düzeltmesi yok** (facebook/hermes#1966, expo/expo#44356, 2026-08-08 itibarıyla açık/çözümsüz). "Yeterince JS nesne-özelliği erişimi" olunca tetiklendiği belirtiliyor — yani her açılışta değil, olasılıksal; bu da AsyncStorage temizliğinin (veri hacmini/karmaşıklığını azaltarak) neden geçici olarak "düzeliyormuş gibi" göründüğünü açıklıyor, kökü çözmüyor. **Elimizdeki tek pratik önlem `lib/bootRecovery.ts`'teki boot canary** (kullanıcının gördüğü art arda çökme sayısını azaltıyor) — bundan ötesi bizim kod tabanımızda çözülemez, Meta'nın Hermes'i PAC-uyumlu derlemesini beklemek gerekiyor. Yeni bir build bu sorunu çözmez.

**⚠️ AÇIK — v1.3.1/build 34 production crash'i (2026-07-19 tespit edildi):**
Xcode Organizer'daki 2 sembolize log: `EXC_BAD_ACCESS` **Hermes JS engine** içinde, uygulama açıldıktan ~2-3 sn sonra (JS boot sırasında). Cihaz: iPhone 12 (iPhone13,2), iOS 26.5.2. Register'da `x4: 0x656d616e` = ASCII "name" → Hermes bir yerde `.name` property'sini okurken bozuk pointer'a çarpıyor. AsyncStorage NSException değil (build 34 yaması çalışıyor), bu farklı bir yol: muhtemelen v1.3.0'dan güncelleyen kullanıcının Firestore/AsyncStorage'inde eski yazılmış bir objenin şekli, v1.3.1'de eklenen kodun (Aday Kimliği / Zayıf Konu Radarı / duel / evening quiz) beklediğinden farklı → Hermes memory corruption.
- **v1.3.2 (build 35) yaması:** `lib/bootRecovery.ts` — boot canary. Uygulama JS boot'a başlarken AsyncStorage'a sayacı +1 yazar; mount'tan 3sn sonra 0'a resetlenir. Bir sonraki açılışta sayaç ≥ 2 ise **nuclear reset**: onboarding+auth persistence dahil tüm AsyncStorage temizlenir → uygulama fresh install gibi başlar, kullanıcı tekrar giriş yapar, Firestore'daki verisi geri döner. `hooks/useAuth.ts` ve `app/_layout.tsx` bu promise'i bekliyor ki temizlik Firebase auth persistence okumadan önce bitsin.
- **Yumuşak güncelleme banner'ı:** `lib/appVersion.ts` + `components/UpdateBanner.tsx`. Firestore `config/appVersion` dokümanından `{ latestVersion, releaseNotes }` okur; kurulu sürüm eskiyse ana ekranın üstünde chip gösterir → App Store linki. Kapatılınca 7 gün gösterilmez. Rules `config/*` public read açıldı (**deploy gerekli**). Yeni build çıkarınca Firebase Console → Firestore → `config/appVersion` dokümanında `latestVersion` alanını güncelle.
- **v1.3.2 için app.json**: `version: 1.3.2` yapıldı (90062 hatasına düşmemek için). iOS buildNumber EAS'te autoIncrement.
- Elimizdeki v1.3.1 kullanıcıları banner göremez (crash açılışta oluyor); v1.3.2 App Store'a çıkınca ~1-2 gün içinde iOS otomatik güncelleme ile eriyecek. Banner asıl gelecekteki hatalı build'lerde sigorta.

**⚠️ v1.3.2/build 35 yayına girdi ama crash tam kapanmadı (2026-07-21/22):** Gerçek kullanıcı testinde (arkadaş cihazı) 2 kez üst üste açılış crash'i, 3.'de nuclear reset devreye girip düzeldi — yani canary **beklendiği gibi çalıştı**, ama kullanıcı yine de 2 kez crash görüyor. Daha iyisi lazım: kök nedeni önceden önlemek.
- **v1.3.3 (build 40) yaması — versiyon-değişimi süpürmesi:** `lib/bootRecovery.ts`'e `runVersionSweep()` eklendi. Uygulama açılışında son çalıştığı sürümü (`__last_run_version` anahtarı) kontrol eder; `app.json`'daki güncel sürümden farklıysa (yani kullanıcı güncelleme yapmışsa) — Firebase auth persistence (`firebase:` prefixli anahtarlar) ve `onboardingSeen` hariç **tüm AsyncStorage'ı henüz hiçbir kod okumadan siler**. Böylece eski sürümün yazdığı bozuk şekilli veri Hermes'e hiç ulaşmıyor, crash **hiç oluşmuyor** (reaktif canary'nin aksine proaktif).
- **Versiyon çakışması dersi:** İlk denemede aynı `1.3.2` numarasıyla build 39 aldık ama Apple zaten `1.3.2`'yi (build 35) onaylamıştı → hata 90062/90186 ("bundle invalid... previously approved version", "pre-release train closed"). **Aynı versiyon numarası bir kez onaylandıktan sonra tekrar kullanılamaz** — bir sonraki yamada mutlaka `app.json`'daki `version`'ı da artır, sadece buildNumber yetmez.
- App Store Connect'te yeni versiyon eklerken eski versiyonun **Notes** ve **Sign-In Information** alanları yeni versiyona kopyalanıyor (miras kalıyor) — her submit'te Notes'u güncel tutmayı unutma, Sign-in required kutusu boş kalmalı (misafir girişi var, review'cu "Hızlı Başla" ile girer).

**⚠️ v1.3.4/build 46'da aynı crash yine görüldü (2026-08-04 tespit edildi), eşik düşürüldü:** Xcode Organizer'da (Version filtresi 1.3.4'e çevrilip bakıldı) 2 yeni `EXC_BAD_ACCESS` logu bulundu — 2026-08-03 10:49'da, 3 saniye arayla, art arda 2 açılışta. **Aynı cihaz** (iPhone 12/iPhone13,2, iOS 26.5.2), **aynı imza** (Hermes içinde çöküyor, ilk logda register `x5: 0x656d616e` = yine ASCII "name"). Yani `runVersionSweep()` (v1.3.3'te eklenen proaktif süpürme) bu cihazı kurtaramadı — muhtemelen sweep sadece versiyon DEĞİŞTİĞİNDE bir kez çalışıyor, aynı versiyonda tekrar oluşan bozuk veriyi yakalamıyor; canary (reaktif, 2 crash sonrası nuclear reset) devreye girip düzeltmiş olmalı ama kullanıcı yine 2 çökme görmüş.
- **Yapılan düzeltme:** `lib/bootRecovery.ts`'teki `CRASH_THRESHOLD` `2`'den `1`'e düşürüldü — artık tek bir crash sonrası bir sonraki açılışta nuclear reset tetikleniyor, kullanıcı en fazla 1 çökme görüp ikincisini hiç görmeyecek. **Henüz build'e girmedi**, bir sonraki iOS build'inde (App Store'a submit) devreye girecek.
- Cihazın kime ait olduğu bilinmiyor (uzak/gerçek kullanıcı) — kök nedeni (hangi AsyncStorage anahtarının hangi eski şekilde kalıp Hermes'i bozduğu) tam olarak izole edilemedi, semptomatik olarak (canary eşiği düşürülerek) hafifletildi.

**✅ ÇÖZÜLDÜ — TestFlight açılış crash'i (2026-07-10/11, kök neden bulundu ve yamalandı):**
Build 31 ve 33, kurulumdan sonra her açılışta anında çöküyordu. Kök neden: **cihazdaki bozuk AsyncStorage verisi**, açılışta (Firebase auth kalıcılığı + onboarding bayrağı okumaları sırasında) native `NSException` fırlatıyor; RN 0.81'in bu exception'ı JS Error'a çevirme kodu (`convertNSExceptionToJSError`, kendi dispatch kuyruğundan jsi::Runtime'a dokunuyor) Hermes'i bozup `EXC_BAD_ACCESS (SIGSEGV)` veriyor (crash log'larda çöken adresin ASCII metin olması — `0x75646f70` = "podu" — bellek bozulmasını ele veriyordu). Teşhis, cihazda uygulamayı **silip yeniden kurunca** (temiz veri) crash'in kaybolmasıyla doğrulandı; simülatörde temiz veriyle hiç üretilemiyordu.
- **Kalıcı çözüm (build 34+):** `patches/@react-native-async-storage+async-storage+2.2.0.patch` — RNCAsyncStorage.mm'deki 6 dışa açık metod `@try/@catch` ile sarıldı: exception'da çökmek yerine callback'e hata dönüyor + okunamayan depo temizleniyor (self-heal). `package.json`'da `postinstall: patch-package` var; **AsyncStorage sürümü değişirse patch yeniden üretilmeli** (`npx patch-package @react-native-async-storage/async-storage`).
- Bu koruma kritik: App Store'daki v1.3.0 kullanıcıları güncellemede eski verilerini taşır — verisi sorunlu olan kullanıcı yamasız build'de kalıcı crash-loop'a girer.
- Build 32 (Sentry kaldırma) ve 33 (bildirim erteleme) değişiklikleri crash'le ilgisizmiş ama zararsız; Sentry zaten yapılandırılmamıştı, kaldırılmış durumda.
- Yeni bir crash olursa: Xcode → Window → Organizer → crash log'a çift tıkla → sembolize log `~/Library/Developer/Xcode/Products/com.rehberkpss.app/Crashes/Points/.../Logs/*.crash` altına düşer, `Thread N Crashed:` kısmına bak.

**⚠️ Diğer build notları:**
- İlk submit denemesi (build 29, v1.3.0) Apple tarafından **90062 hatasıyla reddedildi**: `app.json`'daki `"version"` (CFBundleShortVersionString) zaten onaylanmış 1.3.0 ile aynıydı, artırılması gerekiyordu → `1.3.1`'e çekildi. Bir sonraki sürümde `app.json`'daki `version`'ı da elle artırmayı unutma (EAS sadece `buildNumber`'ı `autoIncrement` ile otomatik artırıyor, marketing version'ı artırmıyor).
- `eas build:version:set --platform ios` komutu **interaktif** — bu ortamda `expect` ile otomatikleştirildi ama alan öndeki değeri temizlemeden yazarsa değerleri birbirine karıştırabiliyor (`30` yerine yanlışlıkla `1.3.1` yazılmıştı, düzeltildi). Bu komutu tekrar çalıştırırken dikkatli ol, sonucu `eas build:version:get --platform ios` ile doğrula.

### 2026-09-02 oturumu — soru havuzunu 2 katına çıkarma (BAŞLADI, devam edecek) + Android tab bar düzeltmesi

Kullanıcı genel kültür (1275) ve AGS (751) soru havuzlarının kalite kaybetmeden **2 katına** çıkarılmasını istedi. Hacim çok büyük (~1274 + ~751 = ~2025 yeni soru) olduğu için tek oturumda bitmiyor, güvenli parti büyüklüğüyle (kategori/alt dal başına ~6-10) çok partili bir sürece bölündü — kullanıcı bunu onayladı.

**1. parti — 94 soru:**
- Genel kültür +40 (h419-428, c344-353, v294-303, g244-253) → 1275 → 1314
- AGS +54 (9 alt dala 6'şar: gp100-105, op092-097, oy092-097, ov100-105, rh092-097, sy076-081, pg062-067, ot062-067, te084-089) → 751 → 805

**2. parti — yine 94 soru:**
- Genel kültür +40 (h429-438, c354-363, v304-313, g254-263) → 1314 → 1354
- AGS +54 (9 alt dala 6'şar: gp106-111, op098-103, oy098-103, ov106-111, rh098-103, sy082-087, pg068-073, ot068-073, te090-095) → 805 → 859

**3. parti — yine 94 soru:**
- Genel kültür +40 (h439-448, c364-373, v314-323, g264-273) → 1354 → 1394
- AGS +54 (9 alt dala 6'şar: gp112-117, op104-109, oy104-109, ov112-117, rh104-109, sy088-093, pg074-079, ot074-079, te096-101) → 859 → 913

**4. parti — yine 94 soru:**
- Genel kültür +40 (h449-458, c374-383, v324-333, g274-283) → 1394 → 1434
- AGS +54 (9 alt dala 6'şar: gp118-123, op110-115, oy110-115, ov118-123, rh110-115, sy094-099, pg080-085, ot080-085, te102-107) → 913 → 967

**5. parti — yine 94 soru:**
- Genel kültür +40 (h459-468, c384-393, v334-343, g284-293) → 1434 → 1474
- AGS +54 (9 alt dala 6'şar: gp124-129, op116-121, oy116-121, ov124-129, rh116-121, sy100-105, pg086-091, ot086-091, te108-113) → 967 → 1021

**6. parti — yine 94 soru:**
- Genel kültür +40 (h469-478, c394-403, v344-353, g294-303) → 1474 → 1514
- AGS +54 (9 alt dala 6'şar: gp130-135, op122-127, oy122-127, ov130-135, rh122-127, sy106-111, pg092-097, ot092-097, te114-119) → 1021 → 1075

**7. parti — yine 94 soru:**
- Genel kültür +40 (h479-488, c404-413, v354-363, g304-313) → 1514 → 1554
- AGS +54 (9 alt dala 6'şar: gp136-141, op128-133, oy128-133, ov136-141, rh128-133, sy112-117, pg098-103, ot098-103, te120-125) → 1075 → 1129

**8. parti — yine 94 soru:**
- Genel kültür +40 (h489-498, c414-423, v364-373, g314-323) → 1554 → 1594
- AGS +54 (9 alt dala 6'şar: gp142-147, op134-139, oy134-139, ov142-147, rh134-139, sy118-123, pg104-109, ot104-109, te126-131) → 1129 → 1183

**9. parti — yine 94 soru:**
- Genel kültür +40 (h499-508, c424-433, v374-383, g324-333) → 1594 → 1634
- AGS +54 (9 alt dala 6'şar: gp148-153, op140-145, oy140-145, ov148-153, rh140-145, sy124-129, pg110-115, ot110-115, te132-137) → 1183 → 1237

**10. parti — yine 94 soru:**
- Genel kültür +40 (h509-518, c434-443, v384-393, g334-343) → **1634 → 1674** (hedefin sadece bir kısmı, kalan ~876 soru sıradaki oturumlara kalıyor)
- AGS +54 (9 alt dala 6'şar: gp154-159, op146-151, oy146-151, ov154-159, rh146-151, sy130-135, pg116-121, ot116-121, te138-143) → **1237 → 1291** (kalan ~211 soru sıradaki oturumlara kalıyor)

**11. parti — 94 soru:**
- Genel kültür +40 (h519-528, c444-453, v394-403, g344-353) → **1674 → 1714** (kalan ~836 soru sıradaki oturumlara kalıyor)
- AGS +54 (9 alt dala 6'şar: gp160-165, op152-157, oy152-157, ov160-165, rh152-157, sy136-141, pg122-127, ot122-127, te144-149) → **1291 → 1345** (kalan ~157 soru sıradaki oturumlara kalıyor)

**12. parti — 94 soru:**
- Genel kültür +40 (h529-538, c454-463, v404-413, g354-363) → **1714 → 1754** (kalan ~796 soru sıradaki oturumlara kalıyor)
- AGS +54 (9 alt dala 6'şar: gp166-171, op158-163, oy158-163, ov166-171, rh158-163, sy142-147, pg128-133, ot128-133, te150-155) → **1345 → 1399** (kalan ~103 soru sıradaki oturumlara kalıyor)

Her partide her soru eklenmeden önce metnin (tam cümle veya ayırt edici parça) ilgili dosyada zaten var olup olmadığı grep ile tek tek kontrol edildi — bazı adaylar (Nesne sürekliliği, Dil Edinim Aygıtı, Tam öğrenme modeli, Ters yüz edilmiş sınıf, Örnek olay yöntemi, Gösterip yaptırma yöntemi, Süreklilik ilkesi, RAM/BİLSEM tanımı, Gestalt "bütün parçadan farklıdır", Anayasa Mahkemesi/Cumhurbaşkanı görev süresi, Enaktif temsil, program geliştirmede esneklik ilkesi, Hayali seyirci/Kişisel efsane, Yeniçeri Ocağı'nın kaldırılması, "sosyal devlet" ilkesi, Küçük Kaynarca Antlaşması, Kronosistem, "sınıfta görmezden gelerek söndürme", 93 Harbi, analitik/holistik rubrik, bebeklik dönemi Erikson krizi, damgalama/imprinting, açıklık ilkesi, BRICS, fındık üretiminde dünya lideri, 2024 Olimpiyatları, Pamukkale travertenleri, Moskova Antlaşması'nın önemi, Ekzosistem, Erikson okul öncesi/genç yetişkinlik dönemi krizleri, Fatih Kanunnamesi, İbrahim Müteferrika, Kabakçı Mustafa İsyanı, kişiselleştirme ilkesi (personalization), Kommagene Krallığı/Nemrut Dağı, Çingene Kızı mozaiği, Pamphylia bölge adı, Taba (Hilda Taba) program modeli, sarmal/spiral program, dijital vatandaşlık, Milli Eğitim Şurası, Tevhid-i Tedrisat Kanunu, 1739 sayılı Milli Eğitim Temel Kanunu, örgün-yaygın eğitim farkı, 4+4+4 zorunlu eğitim, Islahat/Tanzimat/Sened-i İttifak/Divan-ı Hümayun (tarihte aşırı yoğun), Sakarya Meydan Muharebesi, Büyük Taarruz, Kabotaj/Soyadı Kanunu, Eğirdir/Sapanca/Çıldır/Manyas/Salda gölleri (coğrafyada aşırı yoğun), Cumhurbaşkanlığı kararnamesi, milletvekili dokunulmazlığı, Ayırt edicilik indeksi, Tyler modeli, ihtiyaç analizi, öğretim materyali pilot uygulaması, jeton ekonomisi (token economy), yakınlık kontrolü (proximity control), sakinleşme köşesi, podcast/QR kod (ot'ta), somutlaştırma tekniği (rehberlikte), Fatih Projesi/e-Okul/MEBBİS'in bazı yönleri gibi) zaten yoğun şekilde soruluyor bulunup elenip yerine daha spesifik/ikincil konular seçildi. correctIndex her soru yazılırken elle dengelendi (varsayılan olarak hep aynı şıkkı doğru yazma hatasına düşülmedi — bkz. 2026-08-16 oturumundaki Math.imul dersi; bu tür partilerde artık neredeyse her taslak ilk yazımda hepsi index 0'a denk geliyor ve elle yeniden dağıtılıyor, bu normal bir alışkanlık haline geldi). Sonuç dağılımı: questions.ts genelinde 0:374/1:407/2:442/3:531, agsQuestions.ts genelinde 0:273/1:369/2:343/3:414 — dengeli, aşırı yoğunlaşma yok. `npx tsc --noEmit` ve id çakışma kontrolü (`grep uniq -d`) her partiden sonra temiz.

**13. parti — 94 soru:**
- Genel kültür +40 (h539-548, c464-473, v414-423, g364-373) → **1754 → 1794** (kalan ~756 soru sıradaki oturumlara kalıyor)
- AGS +54 (9 alt dala 6'şar: gp172-177, op164-169, oy164-169, ov172-177, rh164-169, sy148-153, pg134-139, ot134-139, te156-161) → **1399 → 1453** (kalan ~49 soru sıradaki oturumlara kalıyor — sonraki oturumda tek partide bitirilebilir)

Her partide her soru eklenmeden önce metnin (tam cümle veya ayırt edici parça) ilgili dosyada zaten var olup olmadığı grep ile tek tek kontrol edildi — bazı adaylar (Nizam-ı Cedit'in genel anlatımı, Bab-ı Ali Baskını, Kızılırmak/Sakarya nehirleri, Atatürk/Karakaya barajlarının genel anlatımı, Ihlara/Munzur vadileri, İnsan Hakları Evrensel Beyannamesi'nin tarihi, Türk Devletleri Teşkilatı'nın genel tanımı, CRISPR, KVKK, siber güvenlik, enerji depolama/batarya, IoT, öğrenilmiş çaresizlik, kavram haritası, balık kılçığı diyagramı, "net beklentiler" disiplin yaklaşımı, Mesleki Eğitim Merkezleri (MESEM), DYK, özel eğitim ve rehabilitasyon merkezleri, madde ayırt edicilik indeksi, "denge" (balance) ilkesi (program geliştirmede), MEBBİS/LGS/YKS'nin bazı yönleri gibi) zaten yoğun şekilde soruluyor bulunup elenip yerine daha spesifik/ikincil konular seçildi. correctIndex her soru yazılırken elle dengelendi (varsayılan olarak hep aynı şıkkı doğru yazma hatasına düşülmedi — bkz. 2026-08-16 oturumundaki Math.imul dersi; bu tür partilerde artık neredeyse her taslak ilk yazımda hepsi index 0'a denk geliyor ve elle yeniden dağıtılıyor, bu normal bir alışkanlık haline geldi). Sonuç dağılımı: questions.ts genelinde 0:386/1:419/2:450/3:539, agsQuestions.ts genelinde 0:291/1:387/2:352/3:423 — dengeli, aşırı yoğunlaşma yok. `npx tsc --noEmit` ve id çakışma kontrolü (`grep uniq -d`) her partiden sonra temiz.

**14. parti — 94 soru — AGS HEDEFİNE ULAŞILDI:**
- Genel kültür +40 (h549-558, c474-483, v424-433, g374-383) → **1794 → 1834** (kalan ~716 soru sıradaki oturumlara kalıyor)
- AGS +49 (9 alt dala eşit olmayan dağılımla: gp178-183 [+6], op170-174 [+5], oy170-174 [+5], ov178-183 [+6], ot140-145 [+6], pg140-144 [+5], rh170-175 [+6], sy154-158 [+5], te162-166 [+5]) → **1453 → 1502 — TAM HEDEF, AGS bölümü tamamlandı!** Bundan sonraki oturumlarda AGS'ye dokunulmayacak, sadece genel kültür üzerinde devam edilecek.

Her partide her soru eklenmeden önce metnin (tam cümle veya ayırt edici parça) ilgili dosyada zaten var olup olmadığı grep ile tek tek kontrol edildi — bazı adaylar (Enderun Mektebi, Kitab-ı Bahriye, Lale Devri/Karlofça/Patrona Halil/Zitvatorok'un genel anlatımı, step/maki bitki örtüsünün genel tanımı, şeker pancarı üretimi, pamuk üretimi (GAP), özel hayatın gizliliği, konut dokunulmazlığı, akıllı şehir, dijital ikiz, kültürel araçlar (Vygotsky), Küçük Albert deneyi, şekillendirme/dağıtılmış pratik, öğrenilmiş çaresizlik (tekrar), pozitif bağımlılık (kubaşık öğrenme), balık kılçığı/kavram haritası (tekrar), madde ayırt edicilik indeksi (tekrar), taşra teşkilatı, aday öğretmenlik süreci, öğretmen performans değerlendirmesi gibi) zaten yoğun şekilde soruluyor bulunup elenip yerine daha spesifik/ikincil konular seçildi. correctIndex her soru yazılırken elle dengelendi. Sonuç dağılımı: questions.ts genelinde 0:397/1:432/2:458/3:547, agsQuestions.ts genelinde 0:309/1:400/2:361/3:432 — dengeli, aşırı yoğunlaşma yok. `npx tsc --noEmit` ve id çakışma kontrolü (`grep uniq -d`) her partiden sonra temiz.

**15. parti — sadece genel kültür, 40 soru (AGS tamamlandığı için artık her parti sadece genel kültüre):**
- Genel kültür +40 (h559-568, c484-493, v434-443, g384-393) → **1834 → 1874** (kalan ~676 soru sıradaki oturumlara kalıyor)

Bu partide de her soru eklenmeden önce grep ile duplike kontrolü yapıldı — bazı adaylar (1921 Anayasası/Teşkilat-ı Esasiye, Terakkiperver Cumhuriyet Fırkası, Şeyh Sait İsyanı'nın genel anlatımı, bor madeni yatakları, çalışma hakkı ve ödevi, sendika kurma hakkı, sosyal güvenlik hakkı, algoritmik önyargı gibi) zaten yoğun şekilde soruluyor bulunup elenip yerine daha spesifik/ikincil konular seçildi. Sonuç dağılımı: questions.ts genelinde 0:408/1:444/2:466/3:556 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**16. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h569-578, c494-503, v444-453, g394-403) → **1874 → 1914** (kalan ~636 soru sıradaki oturumlara kalıyor)

Bu partide tarihte Anadolu Selçuklu sonrası beylikler dönemine (Karamanoğulları, Germiyanoğulları, Candaroğulları, Aydınoğulları, Saruhanoğulları, Menteşeoğulları, Karesioğulları), coğrafyada tarım ürünü-bölge eşleştirmeleri ve turizm merkezlerine, vatandaşlıkta Cumhurbaşkanlığı hükümet sistemi detaylarına (yardımcı atama, vekalet, af yetkisi, seçim yenileme), güncelde teknoloji/finans kavramlarına (blockchain, ESG, yeşil tahvil, stablecoin) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (Miryokefalon/Kösedağ/Ankara Savaşı/Fetret Devri'nin genel anlatımı, büyük dil modelleri/LLM, karbon ayak izi, kanun teklifi verme yetkisi, Cumhurbaşkanının cezai sorumluluğu, bakanların atanması gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:418/1:457/2:474/3:565 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**17. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h579-588, c504-513, v454-463, g404-413) → **1914 → 1954** (kalan ~596 soru sıradaki oturumlara kalıyor)

Bu partide tarihte klasik dönem askeri/idari kurumlarına (Pençik, Tımarlı Sipahi, Akıncılar, Cebeci/Topçu Ocağı, dirlik gelir sıralaması, Kapıkulu vs eyalet askerleri, Rumeli Beylerbeyliği), coğrafyada enerji kaynakları ve nüfus/göç kavramlarına, vatandaşlıkta yargı sistemi detaylarına (Yargıtay, Uyuşmazlık Mahkemesi, istinaf/temyiz, jüri sistemi), güncelde sektörel/ekonomik kavramlara (sağlık turizmi, influencer ekonomisi, streaming, biyoçözünür plastik) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (Preveze/İnebahtı Deniz Savaşı'nın genel anlatımı, Karadeniz'de doğalgaz keşfi, kırdan kente göç, nüfus artış hızı, en kalabalık il, mevsimlik göç, Anayasa Mahkemesi üyelerinin görev süresi (2 kez tekrar edilmiş bulundu) gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:428/1:469/2:482/3:575 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**18. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h589-598, c514-523, v464-473, g414-423) → **1954 → 1994** (kalan ~556 soru sıradaki oturumlara kalıyor)

Bu partide tarihte Cumhuriyet dönemi ekonomik kurumlarına (Sümerbank, Etibank, TCMB, Osmanlı Bankası, Ziraat Bankası, Düyun-u Umumiye'nin kaldırılması, Milli İktisat, 1929 Buhranı), coğrafyada doğal afet/risk haritalarına (deprem, heyelan, sel, çölleşme, erozyon, orman yangını, çığ) ve biyoçeşitlilik/çevre konularına, vatandaşlıkta temel hak ve özgürlüklerin ceza hukuku boyutuna (suç ve cezaların kanuniliği, masumiyet karinesi, işkence yasağı, adil yargılanma hakkı), güncelde uluslararası kuruluşlara (G20, OECD, WHO, WTO, IMF, Dünya Bankası, Nobel, Uluslararası Af Örgütü, COP, Kyoto Protokolü) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (kapitülasyonların kaldırılması, kıyı erozyonu, Paris İklim Anlaşması, kişi dokunulmazlığı gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:440/1:481/2:490/3:583 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**19. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h599-608, c524-533, v474-483, g424-433) → **1994 → 2034** (kalan ~516 soru sıradaki oturumlara kalıyor)

Bu partide tarihte Cumhuriyet dönemi kültür/basın figürlerine ve siyasi olaylara (Yunus Nadi, Dil Encümeni, Halkevleri, Köy Enstitüleri'nin kapatılışı, Altı Ok, 1961 Anayasası, 12 Mart Muhtırası, Demokrat Parti), coğrafyada Türkiye'nin matematik/özel konumuna (meridyen aralığı, yerel saat farkı, ekinoks, boğazların önemi), vatandaşlıkta vatandaşlık hukuku ve seçim sistemlerine (D'Hondt, nispi temsil, çoğunluk sistemi, ikinci tur), güncelde yeni teknolojilere (mikro mobilite, nanoteknoloji, uzay madenciliği, kuantum şifreleme) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (Halide Edip Adıvar/Yakup Kadri'nin genel anlatımı, Montrö Boğazlar Sözleşmesi, seçim barajı yüzdesi, dijital ikiz gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:451/1:493/2:498/3:592 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**20. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h609-618, c534-543, v484-493, g434-443) → **2034 → 2074** (kalan ~476 soru sıradaki oturumlara kalıyor)

Bu partide tarihte 1980 sonrası yakın siyasi tarihe (24 Ocak Kararları, Turgut Özal/Anavatan Partisi, 1982 Anayasası, Süleyman Demirel, PKK, GAP, AB müzakereleri, 12 Eylül, Bülent Ecevit), coğrafyada Türkiye'nin temel fiziki özelliklerine (komşu sayısı, yüzölçümü, deniz tuzlulukları, kıyı tipleri, kıyı uzunluğu), vatandaşlıkta idare hukuku ve kamu personeli rejimine (tarafsızlık ilkesi, disiplin cezaları, iptal/tam yargı davası, Sayıştay, Kesin Hesap Kanunu), güncelde çevre/dijital teknolojilere (sıfır emisyon, batarya geri dönüşümü, hassas tarım, e-devlet, temassız ödeme) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (Kıbrıs Barış Harekatı'nın genel anlatımı, hizmet kusuru, idari sözleşmeler gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:461/1:507/2:506/3:600 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**21. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h619-628, c544-553, v494-503, g444-453) → **2074 → 2114** (kalan ~436 soru sıradaki oturumlara kalıyor)

Bu partide tarihte İslamiyet öncesi/ilk Müslüman Türk devletlerine (Göktürkler, Karahanlılar, Büyük Selçuklu — Tuğrul Bey/Alparslan/Melikşah/Nizamülmülk, Divan-ı Lügati't Türk, ikili yönetim sistemi), coğrafyada göl/akarsu oluşum tiplerine (karstik/tektonik/buzul/volkanik set/yapay göller, akarsu rejimi, hidroelektrik potansiyeli, delta), vatandaşlıkta olağanüstü hal ve savunma/güvenlik teşkilatına (OHAL, seferberlik, MGK, Genelkurmay, Milli Savunma Bakanlığı, başkomutanlık), güncelde sağlık/kentsel teknolojilere (telemedicine, kişiselleştirilmiş tıp, deprem erken uyarı, 15 dakikalık şehir, batarya çiftlikleri) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (kut anlayışı, Uygurların yerleşik hayata geçişi, Talas Savaşı/Kutadgu Bilig/Orhun Yazıtları'nın genel anlatımı, Türkiye'nin en büyük gölü (Van Gölü) gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:473/1:518/2:515/3:608 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**22. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h629-638, c554-563, v504-513, g454-463) → **2114 → 2154** (kalan ~396 soru sıradaki oturumlara kalıyor)

Bu partide tarihte Anadolu Selçuklu Devleti detaylarına (Süleyman Şah, I./II. Kılıçarslan, Alaeddin Keykubad, kervansaraylar, Babailer İsyanı, İlhanlı hakimiyeti) ve Anadolu beyliklerine (Danişmendliler, Eşrefoğulları, Pervaneoğulları), coğrafyada dağ/ova oluşum tiplerine (uzanış yönleri, polje, yaylalar, platolar, genç kıvrım dağları, Ağrı/Erciyes), vatandaşlıkta yerel yönetim organlarına (belediye başkanı, il özel idaresi, muhtar, vali, kaymakam, adem-i merkeziyet), güncelde küresel ekonomi/dijital düzenlemelere (stagflasyon, tedarik zinciri krizleri, içerik moderasyonu, dijital hizmet vergisi) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (Miryokefalon/Malazgirt'in genel anlatımı, kervansarayların genel tanımı, yapay zeka düzenlemeleri (tekrar), Türkiye'nin en büyük gölü/volkanik dağları gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:484/1:531/2:523/3:616 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**23. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h639-648, c564-573, v514-523, g464-473) → **2154 → 2194** (kalan ~356 soru sıradaki oturumlara kalıyor)

Bu partide tarihte 1908-1918 İttihat ve Terakki dönemine (Şeyh Bedreddin, Mora İsyanı, II. Balkan Savaşı, Trablusgarp/Uşi Antlaşması, Babıali Baskını sonrası tek parti yönetimi, Enver/Talat/Cemal Paşa), coğrafyada madencilik ve ulaşım altyapısına (Divriği demir cevheri, kurşun-çinko/manganez, mermer, serbest bölgeler, lojistik merkezler, demiryolu/otoyol tarihi), vatandaşlıkta bağımsız idari otoritelere (KVKK, Rekabet Kurumu, BDDK, SPK, RTÜK, EPDK, TİHEK, Merkez Bankası bağımsızlığı), güncelde ileri teknoloji/güvenlik konularına (otonom silah sistemleri, siber savaş, kuantum şifreleme tehdidi, deepfake tespiti, şehir tarımı) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (I. Balkan Savaşı'nın genel anlatımı, Kamu Denetçiliği Kurumu/Ombudsman'ın genel tanımı, organize sanayi bölgeleri gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:495/1:543/2:531/3:625 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**24. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h649-658, c574-583, v524-533, g474-483) → **2194 → 2234** (kalan ~316 soru sıradaki oturumlara kalıyor)

Bu partide tarihte Osmanlı sanat/kültürüne (minyatür, hat, İznik çinisi, Mimar Sinan, Süleymaniye/Selimiye Camii, Topkapı/Dolmabahçe Sarayı, Mevlevilik), coğrafyada nüfus/yerleşme coğrafyasına (nüfus sayımı tarihi, şehirleşme, kentsel dönüşüm, mezra, bağımlı nüfus oranı, nüfus projeksiyonları), vatandaşlıkta Anayasa'nın temel ilkelerine (hukuk/demokratik/laik devlet, Atatürk milliyetçiliği, normlar hiyerarşisi, somut norm denetimi), güncelde yerli teknoloji/sanayi girişimlerine (Togg, savunma sanayii yerlileşmesi, Milli Teknoloji Hamlesi, girişim sermayesi, teknoparklar) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (İHA/SİHA ve Türkiye Uzay Ajansı'nın genel anlatımı, Anayasa'nın değiştirilemez maddelerinin genel sorgusu gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:507/1:555/2:539/3:633 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**25. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h659-668, c584-593, v534-543, g484-493) → **2234 → 2274** (kalan ~276 soru sıradaki oturumlara kalıyor)

Bu partide tarihte I. Dünya Savaşı'nın az bilinen cephelerine (Irak/Kut'ül Amare, Hicaz-Yemen, Galiçya, Romanya), İttifak Devletleri ve Wilson İlkeleri'ne, San Remo Konferansı ve Sevr'in onaylanmamasına, coğrafyada iklim detaylarına (sıcaklık/yağış/kar/don dağılımı, basınç merkezleri, Lodos/föhn rüzgarları, mikroklima, sis/bulutluluk), vatandaşlıkta TBMM komisyonları ve yargı organlarının oluşumuna (Dilekçe Komisyonu, Yüce Divan, Danıştay/Yargıtay üye seçimi, HSK, Adalet Bakanlığı), güncelde enerji/lojistik konularına (Tuz Gölü doğalgaz deposu, yeşil hidrojen, karbon yakalama, TANAP, LNG, konteyner taşımacılığı) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (Kafkas/Kanal Cephesi'nin genel anlatımı, TBMM İnsan Haklarını İnceleme Komisyonu, Akkuyu NGS'nin genel tanımı gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:517/1:568/2:547/3:642 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**26. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h669-678, c594-603, v544-553, g494-503) → **2274 → 2314** (kalan ~236 soru sıradaki oturumlara kalıyor)

Bu partide tarihte Osmanlı eğitim kurumları tarihine (Mekteb-i Harbiye, Tıbbiye, Mekteb-i Sultani, Rüşdiye, İdadi, Mülkiye, Encümen-i Daniş, Maarif-i Umumiye Nizamnamesi), coğrafyada tarım/hayvancılık uygulamalarına (destekleme sistemi, organik tarım, damla sulama, büyükbaş/kümes hayvancılığı, arıcılık, mandıracılık), vatandaşlıkta temel hak ve uluslararası sözleşmelere (kadın-erkek eşitliği, Çocuk Hakları Sözleşmesi, Engelli Hakları Sözleşmesi, İstanbul Sözleşmesi, AİHS'nin iç hukuktaki yeri, kadın kotası, Lozan azınlık hakları), güncelde yeni çalışma/teknoloji trendlerine (dijital nomad vizesi, metaverse eğitim, blok zinciri tedarik zinciri, akıllı sözleşmeler, uydu interneti, e-spor) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (nadas/mera hayvancılığının genel anlatımı, pozitif ayrımcılık, çifte vatandaşlık gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:529/1:580/2:555/3:650 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**27. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h679-688, c604-613, v554-563, g504-513) → **2314 → 2354** (kalan ~196 soru sıradaki oturumlara kalıyor)

Bu partide tarihte Cumhuriyet dönemi dış politikasına (Hatay Meselesi, II. Dünya Savaşı tarafsızlığı, Varlık Vergisi, BM/NATO üyeliği, Kore Savaşı, Truman Doktrini, CENTO, Kıbrıs Cumhuriyeti, Johnson Mektubu), coğrafyada sanayi coğrafyasına (demir-çelik, tekstil, otomotiv, çimento, petrokimya, gıda, savunma sanayii merkezleri), vatandaşlıkta KVKK ve basın hukukuna (özel nitelikli veri, aydınlatma yükümlülüğü, açık rıza, unutulma hakkı, düzeltme-cevap hakkı, nefret söylemi), güncelde fintech/enerji teknolojilerine (dijital bankacılık, kripto cüzdan güvenliği, nearshoring, reskilling, akıllı şebeke, enerji verimliliği sertifikaları) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (Balkan Antantı/Sadabat Paktı'nın genel anlatımı, Marshall Planı, Karabük-Ereğli-İskenderun'un genel tanımı gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:541/1:592/2:563/3:658 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**28. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h689-698, c614-623, v564-573, g514-523) → **2354 → 2394** (kalan ~156 soru sıradaki oturumlara kalıyor)

Bu partide tarihte Cumhuriyet dönemi ekonomik/diplomatik dönüm noktalarına (Gümrük Birliği, 1994/1958/1970 devalüasyonları, IMF stand-by, Ankara Anlaşması, Avrupa Konseyi üyeliği, DPT/Kalkınma Planları, Kıbrıs sonrası ABD ambargosu), coğrafyada niş turizm türlerine (inanç, kongre, kırsal, kuş gözlemciliği, dalış, mavi yolculuk, kamp-karavan, golf, av, macera turizmi), vatandaşlıkta milletvekilliği statüsüne (düşme nedenleri, bağdaşmazlık, ödenek, Başkanlık Divanı, grup kurma şartı, kürsü dokunulmazlığı), güncelde yapay zeka etiği ve ileri teknolojiye (hesap verebilirlik, otonom araç sorumluluğu, 3D biyoyazıcı, SAE seviyeleri, biyometrik doğrulama) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (yayla turizminin genel anlatımı, Palandöken/Erciyes kayak merkezleri, GDPR'ın genel tanımı gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:553/1:604/2:571/3:666 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**29. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h699-708, c624-633, v574-583, g524-533) → **2394 → 2434** (kalan ~116 soru sıradaki oturumlara kalıyor)

Bu partide tarihte Osmanlı klasik dönem saray/idari görevlileri ve modernleşme altyapısına (Reisülküttab, Çavuşbaşı, Şeyhülislam, Zaptiye, posta/telgraf/demiryolu, Bağdat Demiryolu, ilk sigorta şirketi, Düyun-u Umumiye gelirleri), coğrafyada bölgesel kalkınma projelerine (DAP, KOP, DOKAP, bölgesel kalkınma ajansları, İBBS, kalkınmada öncelikli yöreler), vatandaşlıkta idare hukukunun temel kavramlarına (özüne dokunulamama, ölçülülük, kanunilik, idari işlem unsurları, imtiyaz sözleşmesi, kamu malları rejimi), güncelde sağlık/uzay teknolojilerine (mRNA aşı teknolojisi, dijital sağlık pasaportu, desalinasyon, bulut tohumlama, Ay'a insanlı görevler) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (İzmir-Aydın demiryolunun genel anlatımı, fetva verme yetkisinin genel tanımı, ISS/Artemis'in genel mention'ları gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:565/1:616/2:579/3:674 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**30. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h709-718, c634-643, v584-593, g534-543) → **2434 → 2474** (kalan ~76 soru sıradaki oturumlara kalıyor)

Bu partide tarihte Osmanlı dönemi bilim/kültür figürlerine (Koçi Bey, Piri Reis, Uluğ Bey/Kadızade-i Rumi/Takiyüddin rasathaneleri, Ali Kuşçu, Lütfi Paşa, Seydi Ali Reis, Matrakçı Nasuh), coğrafyada karstik oluşumlar ve koruma alanı türlerine (obruk, kanyon/şelale, milli park/tabiat parkı/sit alanı/jeopark farkları, UNESCO Dünya Mirası, deprem bölgeleri haritası), vatandaşlıkta yasama süreci ve AYM kararlarına (kanunların yürürlüğe girişi, Cumhurbaşkanı veto yetkisi, bütçe kanununun vetoya kapalı olması, 2/3 çoğunlukla anayasa değişikliği, eski sistemde KHK, seçimlerin yenilenmesi), güncelde dijital/sosyal trend kavramlarına (dikkat ekonomisi, metaverse sanal ekonomiler, hücresel tarım, uzun ömürlülük araştırmaları, iklim aktivizmi) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (traverten oluşumu, peribacalarının oluşumu, Katip Çelebi/Evliya Çelebi'nin genel anlatımı gibi) zaten yoğun soruluyor bulunup elendi. Sonuç dağılımı: questions.ts genelinde 0:577/1:628/2:587/3:682 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**31. parti — sadece genel kültür, 40 soru:**
- Genel kültür +40 (h719-728, c644-653, v594-603, g544-553) → **2474 → 2514** (kalan ~36 soru sıradaki oturuma kalıyor — son parti!)

Bu partide tarihte 16-17. yüzyıl Osmanlı-Avusturya/Safevi/Venedik mücadelelerine (Amasya Antlaşması, Çaldıran Savaşı'nın sonuçları, Kıbrıs'ın fethi, Girit'in fethi/Kandiye Kuşatması, Haçova Savaşı, Kanije ve Eğri kalelerinin fethi, Genç Osman'ın tahttan indirilmesi, Duraklama Dönemi'nin iç nedenleri), coğrafyada tarımsal ürün-bölge eşleştirmeleri ve nüfus coğrafyasına (balıkçılık, orman varlığı, seracılık, çay/zeytin/buğday üretimi, Doğu Anadolu hayvancılığı, nüfusun yaş yapısı, tarımsal nüfus yoğunluğu), vatandaşlıkta yasama süreci ve yerel yönetim detaylarına (yasama tatili, kanun teklifi komisyon süreci, Cumhurbaşkanlığı kararnamesi sınırları, genişletilmiş yerinden yönetim, AYM üye seçimi, TBMM Başkanlık Divanı, Sayıştay'ın TBMM adına denetimi, il özel idaresi organları, kanunların geriye yürümezliği, vatandaşlıktan çıkarma), güncelde biyoteknoloji/dijital trend kavramlarına (sentetik biyoloji, iklim mültecileri, büyük veri analitiği, giyilebilir teknoloji, biyoplastik, sürdürülebilir moda, dijital ikiz, nöro-teknoloji) yönelinerek dedupe kontrolünden geçirildi — bazı adaylar (Ridaniye/Mercidabık Savaşı'nın genel anlatımı, Anayasa Mahkemesi'ne bireysel başvuru hakkının genel tarihi (2 kez tekrar bulundu), merkez bankası dijital parası/CBDC, uzay turizmi, TBMM İçtüzüğü'nün genel tanımı, "yapay et" (hücresel tarımla neredeyse özdeş olduğu için elendi) gibi) zaten yoğun soruluyor bulunup elenip yerine daha spesifik/ikincil konular seçildi. Sonuç dağılımı: questions.ts genelinde 0:588/1:639/2:596/3:691 — dengeli. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**32. parti — sadece genel kültür, 36 soru — GENEL KÜLTÜR HEDEFİNE ULAŞILDI:**
- Genel kültür +36 (h729-737, c654-662, v604-612, g554-562 — her kategoriye 9'ar) → **2514 → 2550 — TAM HEDEF, genel kültür bölümü de tamamlandı!**

Bu partide tarihte klasik dönem deniz gücü ve fetih/kuşatma olaylarına (İstanbul'un fethinin dünya tarihi önemi, Otranto Seferi, ilk kapitülasyonun Venedik'e verilmesi, Cem Sultan Olayı, Dulkadiroğulları'nın ilhakı, Barbaros Hayreddin Paşa, Turgut Reis, Malta Kuşatması, Nahcıvan Seferi), coğrafyada madencilik/enerji/sanayi coğrafyasına (linyit kömürü, bor rezervleri, rüzgar/jeotermal enerji, kıyı turizmi, sanayinin bölgesel dengesizliği, ihracat kalemleri, kentleşme, OSB'ler), vatandaşlıkta yürütme/yerel yönetim ve vatandaşlık hukukuna (milletvekilliğinin istifayla düşmesi, Cumhurbaşkanlığı seçiminde ikinci tur, MGK, Devlet Denetleme Kurulu, TBMM'nin bütçe hakkı, normlar hiyerarşisinde kararname-kanun ilişkisi, doğum yeri esası, yabancıların mülk edinmesi, OHAL'de temel hakların durdurulması), güncelde eğitim/sağlık/lojistik teknolojilerine (adaptif öğrenme, dijital sağlık kayıtları, otonom teslimat robotları, yeşil bina sertifikasyonu, veri merkezi enerji tüketimi, biyoyakıt, YZ çeviri, e-ticaretin perakendeye etkisi, dijital kimlik doğrulama) yönelinerek dedupe kontrolünden geçirildi — hiçbir aday duplike bulunmadı (36 adayın tamamı ilk denemede temiz çıktı). Sonuç dağılımı: questions.ts genelinde 0:598/1:650/2:604/3:698 — dengeli, aşırı yoğunlaşma yok. `npx tsc --noEmit` ve id çakışma kontrolü temiz.

**✅ PROJE TAMAMLANDI (2026-09-13):** Genel kültür soru havuzu 1275 → **2550** (tam 2 katı, +1275 yeni soru, 32 parti boyunca), AGS soru havuzu 751 → **1502** (tam 2 katı, +751 yeni soru, 14 parti boyunca) hedeflerine ulaşıldı. **Kullanıcının "kalite kaybetmeden 2 katına çıkar" talebi tamamen karşılandı** — hem genel kültür hem AGS artık kendi hedeflerinde, `constants/questions.ts` ve `constants/agsQuestions.ts`'e bu proje kapsamında artık dokunulmayacak. Sonraki oturumlarda soru havuzuyla ilgili bir talep gelmezse bu iki dosyaya elle müdahale etmeye gerek yok. İçerik kalitesi boyunca korundu: her yeni soru eklenmeden önce grep ile duplike kontrolü yapıldı, her partiden sonra `npx tsc --noEmit` + id çakışma kontrolü + correctIndex dağılım kontrolü rutin olarak uygulandı (bkz. 2026-08-16 oturumundaki Math.imul dersi — şık karıştırmada her zaman elle dağıtım kontrolü şart). İçeriğin zorluk seviyesi partiler ilerledikçe klasik/çok bilinen konulardan git gide daha niş/ikincil-üçüncül derece detaylara kaydı (niş antlaşma/kale/kuşatma/beylik/padişah/paşa dönemi olayları, il-ürün-maden-sanayi-turizm eşleştirmeleri, bilim/kültür figürleri, yasama/yürütme süreç detayları, biyoteknoloji/dijital trend kavramları) — bu, havuzun 2 katına çıkmasının doğal ve beklenen bir sonucu, kalite kaybı değil.

**Android tab bar / sistem gezinme çubuğu çakışması düzeltildi:** Kullanıcı Android'de alt tab bar'daki Sıralama ikonunun sistemin kendi geri/gezinme ikonuyla üst üste bindiğini bildirdi. Kök neden: `app/(tabs)/_layout.tsx`'teki `tabBarStyle`'da sabit `height: 64` verilmesi, @react-navigation/bottom-tabs'ın normalde otomatik uyguladığı safe-area alt boşluğunu (Android 15+ zorunlu edge-to-edge modunda gezinme çubuğu payı) devre dışı bırakıyordu. Düzeltme: `useSafeAreaInsets()` (react-native-safe-area-context, zaten dependency'de duruyordu ama kullanılmıyordu) ile `paddingBottom: insets.bottom + 8` ve `height: 64 + insets.bottom` yapıldı. Expo Router'ın `ExpoRoot`'u zaten `SafeAreaProvider` ile sarmaladığı için ek bir provider eklemeye gerek kalmadı. **Henüz cihazda/emülatörde görsel doğrulama yapılamadı** — bu Mac'teki Android emülatörü (AVD adı doğrusu `Pixel_8`, önceki CLAUDE.md notundaki `Pixel_8_API_34` ismi hatalıydı) bu oturumda tekrar tekrar boot olur olmaz kapandı (nohup/disown ile bağımsız başlatılsa bile birkaç saniye içinde "shutdown gracefully" log'uyla kendiliğinden kapandı, kök nedeni belirlenemedi), kullanıcı da simülatörü elle kapatıp denemeyi bıraktı. Bir sonraki Android build'inde (`eas build --platform android`) gerçek cihazda ya da emülatör sorunu çözüldükten sonra görsel doğrulama gerekiyor.

### 2026-08-21 oturumu — v1.3.6: Haftalık Deneme + Atanma Günlüğü + büyük içerik genişletmesi, her iki mağazaya gönderim

Önceki oturumlarda kod tarafı tamamlanan **Haftalık Deneme** ve **Atanma Günlüğü** özellikleri ile ~230 yeni soru (genel kültür 902→1275, AGS 600→751) `main`'e commit'liydi ama hiçbir build'e girmemişti. Bu oturumda:

- `app.json`'daki `version` `1.3.5` → `1.3.6`'ya çekildi (her iki platformda da 1.3.5 zaten canlı/onaylanmıştı, aynı numara tekrar kullanılamaz).
- **iOS:** `eas build --platform ios --profile production` (`EAS_SKIP_AUTO_FINGERPRINT=1` ile — fingerprint hesaplama yine timeout verdi) → build 49 başarıyla alındı → `eas submit` ile App Store Connect'e yüklendi → App Store Connect'te elle yeni versiyon (1.3.6) oluşturulup build 49 eklendi, "What's New" (yeni özellikler + soru sayıları) ve "Notes" (review'cu için "Guest" ile giriş talimatı) güncellendi, manuel yayın modu korunarak review'a gönderildi.
- **Android:** İlk `eas build` denemesi fingerprint timeout'uyla başarısız oldu (versionCode 7→8 boşa arttı), `EAS_SKIP_AUTO_FINGERPRINT=1` ile tekrar denenip versionCode 9 ile başarıyla build alındı, `eas submit --platform android --latest` ile üretim kanalına gönderildi (submit "COMPLETED" döndü).
- **Ders — soru havuzu genişletmesinde tempo:** Kullanıcı "tek seferde en fazla kaç soru ekleyebilirsin" diye sordu; cevap olarak "~100-120/parti (kategori başına 25-30), daha fazlası doğruluk riski taşır" denildi ve bu tempoda genel kültüre ek 112 soru (kategori başına 28) daha eklendi — AGS'ye bu turda dokunulmadı (kullanıcı açıkça istedi). Her partiden sonra `Math.imul` tabanlı shuffle script'i + `grep correctIndex` dağılım kontrolü + `tsc --noEmit` rutini uygulandı.

### 2026-08-04/05 oturumu — iOS v1.3.4'te crash tekrarı, boot canary düzeltmesi, v1.3.5 iOS submit

**Xcode Organizer'da v1.3.4/build 46 için 2 yeni crash bulundu** (Version filtresi 1.3.1'de takılı kalmıştı, 1.3.4'e çevrilip bakıldı). Detaylar için yukarıdaki "AÇIK — v1.3.1/build 34" bölümünün sonuna eklenen not'a bakın — özetle: aynı cihaz (iPhone 12/iPhone13,2, iOS 26.5.2), aynı Hermes `EXC_BAD_ACCESS` imzası, art arda 2 açılış crash'i. `lib/bootRecovery.ts`'teki `CRASH_THRESHOLD` `2`'den `1`'e düşürüldü.

**iOS build + submit akışı (EAS bulut kesintisi ve iki manuel adım gerektirdi):**
- `eas build --platform ios --profile production` ilk denemede "Failed to compute project fingerprint" ile başarısız oldu (EAS'te o sırada "Elevated Android build failures" kesintisi vardı, muhtemelen genel altyapıyı etkiledi). `EAS_SKIP_AUTO_FINGERPRINT=1` ortam değişkeniyle tekrar denenince build başarıyla tamamlandı (buildNumber 46→48, ilk başarısız deneme de bir buildNumber tüketmişti).
- `eas submit --platform ios --latest` ilk seferinde `getaddrinfo ENOTFOUND api.expo.dev` ağ hatasıyla "başarısız" göründü, ama **submit sunucu tarafında aslında tamamlanmıştı** — CLI sadece durumu takip edemedi. İkinci submit denemesi bu yüzden "Build number 48 for app version 1.3.5 has already been used" hatası verdi; App Store Connect → TestFlight'ta build 48'in zaten "Complete" durumda olduğu doğrulandı. **Ders: `eas submit` ağ hatasıyla başarısız görünse bile App Store Connect/Play Console'dan gerçek durumu doğrulamadan tekrar denemeyin** — build numarası tekrar kullanılamaz hatasına düşebilirsiniz.
- Build 48 App Store Connect'e yüklendikten sonra **review'a otomatik gönderilmedi** — 1.3.4 zaten "Ready for Distribution" (canlı, salt okunur) olduğu için yeni bir versiyon (1.3.5) elle oluşturulması gerekti: iOS App başlığının yanındaki mavi "+" ikonu → "New Version" → "1.3.5" yazılıp "Create". Yeni versiyon sayfasında "What's New in This Version" **boş geliyor, zorunlu alan** (eski versiyondan miras kalmıyor) — dolduruldu. "Notes" alanı ise eski versiyondan (1.3.4) miras kaldı, 1.3.5'e göre güncellendi. Build 48 "Add Build" ile seçildi, "Manually release this version" zaten seçili geldi (önceki tercih korunmuş). Save → "Add for Review" → "Submit for Review" ile review'a gönderildi (2026-08-05).
- Apple onayı sonrası (48 saate kadar sürebilir) Can'ın App Store Connect'ten elle "Release This Version" yapması gerekecek (manuel yayın modu, geçmiş crash tecrübesi nedeniyle).

### 2026-08-03 oturumu — Android'de görsel yükleme + sıralama tekrar bug'ı düzeltmesi, v1.3.5

**Rapor edilen sorun:** Bir arkadaş Android'de görselli sorularda (Günün Genel Kültür Sorusu, Kültür & Sanat testleri) fotoların açılmadığını bildirdi.

**Kök neden:** `components/DailyCultureModal.tsx` ve `app/art/index.tsx` React Native'in çekirdek `Image` bileşenini kullanıyordu; Wikimedia Commons `Special:FilePath` URL'leri 2 kez redirect ediyor (302→301→asıl görsel) ve bu çok adımlı zincir Android'in eski `Image`/Fresco altyapısında iOS'a göre daha sık başarısız oluyor.

**Düzeltme:** Her iki dosyada da `Image` importu `react-native` yerine `expo-image`'dan alınacak şekilde değiştirildi (`resizeMode` → `contentFit`). `expo-image` pakete eklendi (`~3.0.11`). **Native modül olduğu için bu düzeltme ancak yeni bir build ile Android kullanıcılarına ulaşır.**

**Bu Mac'te ilk kez Android emülatör kuruldu** (bkz. yukarıdaki Ortam bölümü) çünkü değişikliği gerçek cihazda test etmek gerekiyordu — Android Studio + SDK + AVD (`Pixel_8_API_34`) komut satırından (`sdkmanager`/`avdmanager`) ve GUI'den kuruldu, `npx expo run:android` ile yerel dev build alınıp emülatöre kuruldu, Wikimedia görselinin (Michelangelo freski) sorunsuz yüklendiği doğrulandı.

**Yol boyunca ikinci bir bug bulundu ve düzeltildi — sıralamada tekrar eden kullanıcı:** Test sırasında sıralama ekranında React "duplicate key" hatası çıktı (`app/(tabs)/leaderboard.tsx:180`), aynı `uid`'ye sahip iki satır. Kök neden: `results` koleksiyonu doküman ID'si `${uid}_${date}` olarak deterministik yazılıyor, ama muhtemelen eski bir sürümden kalma farklı ID'li bir "yetim" kayıt aynı `uid` alanıyla duruyor; `fetchLeaderboard` (`lib/firestore.ts:438`) sorgusu sadece `date`/`week` alanına göre filtrelediği için ikisini de döndürüyordu. **Düzeltme:** `fetchLeaderboard` artık normalden fazla doküman çekip (`count * 3`) `uid` bazında tekilleştiriyor (en yüksek skoru tutarak), sonra tekrar sıralayıp `count`'a kesiyor — Firestore'daki eski veriye dokunulmadı, sadece okuma tarafında güvenli bir tekilleştirme eklendi.

**Build ortamı notu — Reanimated bozuk node_modules kalıntısı:** İlk `expo run:android` denemesi `NativeProxyCommon.java`'da "cannot find symbol" hatalarıyla patladı — `node_modules/react-native-reanimated` içinde `NodesManager.java`'nın tanımlamadığı eski/legacy metodları çağıran bir dosya kalmıştı (paketin kendi içinde tutarsız bir kalıntı, muhtemelen önceki bir `npm install`'dan kalma). `rm -rf node_modules/react-native-reanimated && npm install react-native-reanimated@4.1.7 --no-save` ile paket temiz yeniden kurulunca dosya kayboldu ve build sorunsuz tamamlandı. Benzer bir "cannot find symbol"/tutarsız native hata görülürse ilgili paketi tek başına temiz yeniden kurmayı dene.

**Versiyon:** `app.json`'daki `version` `1.3.4` → `1.3.5`'e çekildi. `eas build --platform android --profile production` ile alındı (versionCode 6→7, remote/otomatik arttı), `eas submit --platform android --latest` ile üretim kanalına gönderildi — submit "COMPLETED" döndü, Google incelemesi sürüyor.

### 2026-08-01/02 oturumu — Android'in ilk kez üretime çıkışı

**Durum tespiti:** Google Play Console'da KPSS AGS Quiz aylardır **kapalı test (Alpha)**'ta duruyordu, 14 kişilik test grubuyla tamamlanmış ama **hiç üretime (production) başvuru yapılmamıştı** — üretim kanalı "Etkin değil", hiç sürüm yayınlanmamış haldeydi.

**Adım 1 — Eski AAB'yi (1.3.0) üretime taşıma (2026-08-01):**
- Kapalı testte zaten yüklü olan 1.3.0 (versionCode 5) AAB'si "Kitaplıktan ekle" ile üretim sürümüne eklendi, 177 ülke/bölge seçildi, incelemeye gönderildi.
- **Tuzak:** İlk seferde sadece ülke/bölge + mağaza metadata değişiklikleri "Yayın özeti"nden gönderilmiş, ama sürümün kendisi (AAB) hiç "önizle → onayla → gönder" akışından resmi olarak geçirilmemişti — bu yüzden saatlerce "Taslak" durumunda takılı kaldı, Play Console'un "Gönderim etkinliği" sayfası yanıltıcı şekilde "Yayınlandı" gösteriyordu (sadece metadata değişikliği yayınlanmıştı). Çözüm: Üretim → Sürümler → "Sürümü düzenle" ile taslağı tekrar açıp resmi "Önizle ve onayla" adımından geçirip ayrıca gönderildi. Bu ikinci gönderim gerçekten yayına girdi (2026-08-01 20:53) — Play Store'da canlı, PEGI 3 derecelendirmesiyle doğrulandı.
- Bu ilk üretim gönderimi aynı zamanda hesabın "kapalı test → üretim" bariyerini de resmen aştı: Play Console kontrol panelinde "Tebrikler! Uygulamanıza Google Play üretim erişimi verildi" bildirimi düştü. **Bu bariyer bir daha karşımıza çıkmayacak** — sonraki sürüm güncellemeleri doğrudan üretime gönderilebilir, tekrar kapalı test gerekmiyor.

**Adım 2 — Güncel kodla (1.3.4) gerçek Android build'i (2026-08-02):**
- Can `eas build --platform android --profile production` ile 1.3.4 (versionCode 6, commit `e8e590d` — AGS modülü, düello, Aday Kimliği, Zayıf Konu Radarı dahil) build'ini kendi başlattı, bulut kuyruğunda tamamlandı.
- AAB'yi Play Console'a yüklemek için `eas submit --platform android --latest` denendi, sırasıyla 2 engelle karşılaşıldı:
  1. **"Google Play Android Developer API has not been used in project... or it is disabled"** → Google Cloud Console'da (console.developers.google.com/apis/api/androidpublisher.googleapis.com) API'nin "Enable" edilmesi gerekti (Can'ın kendisi yaptı, bu adım otomasyon için hassas sayılıp engellendi).
  2. **"The service account is missing the necessary permissions"** → Play Console → Kullanıcılar ve izinler'de `eas-submit@rehberkpss.iam.gserviceaccount.com` servis hesabı hiç davetli değildi. Davet edilip KPSS AGS Quiz için **"Üretim sürümüne yayınlama, cihazları hariç tutma ve Play Uygulama İmzalama'yı kullanma"** izni verildi.
- Ayrıca `eas.json`'daki `submit.production.android.track` değeri **"alpha"dan "production"a** değiştirildi — daha önce hiç kullanılmamış bu ayar, `eas submit`'in nereye gönderdiğini belirliyor; "alpha" kalsaydı her yeni build otomatik olarak kapalı teste gidecekti, üretime değil.
- Bu 3 düzeltmeden sonra `eas submit` başarıyla çalıştı, 1.3.4 üretim incelemesine girdi (2026-08-02).
- **Ders:** Android tarafında `eas submit` ilk kez kullanılıyordu (daha önceki tüm yüklemeler muhtemelen elle ya da farklı bir yoldan yapılmıştı) — servis hesabı hem Google Cloud API erişimine hem Play Console uygulama iznine ihtiyaç duyuyor, ikisi de tek seferlik kurulum, bir daha gerekmeyecek.

### 2026-07-30 oturumunda eklenenler

**AGS (Eğitim Bilimleri) modülü — yeni sekme, KPSS'nin genel kültür kısmından tamamen ayrı bir alan:**
- `constants/agsQuestions.ts`: 600 soru, 9 alt dal (Gelişim Psikolojisi, Öğrenme Psikolojisi, Öğretim İlke ve Yöntemleri, Ölçme-Değerlendirme, Rehberlik, Sınıf Yönetimi, Program Geliştirme, Öğretim Teknolojileri, Türk Eğitim Sistemi — her biri ~46-76 soru).
- `lib/agsQuiz.ts` (soru seçimi/etiket/renk), `app/(tabs)/ags.tsx` (tab, konu kartları), `app/ags/quiz.tsx` + `app/ags/_layout.tsx` (5 soru/30sn quiz akışı, `app/quiz/category.tsx`'in ayrı bir kopyası).
- **Bilinçli tasarım kararı:** AGS skoru genel kültürün totalScore/seasonScore/liderlik sistemine hiç dokunmuyor — tamamen kendi alanları (`agsCategoryStats`, `agsTitleId`) üzerinden izleniyor. `firestore.rules`'daki `validUserUpdate` yeni alan eklemeyi kısıtlamadığı için **rules deploy'a gerek kalmadı**.
- **Zayıf Konu Radarı + Aday Kimliği AGS'ye de eklendi:** `lib/agsCategoryAnalysis.ts` ve `lib/agsTitles.ts` — genel kültürdeki `categoryAnalysis.ts`/`titles.ts` ile aynı mantık, ayrı bir unvan seti (9 konu uzmanlığı + "Eğitim Bilimci"). AGS tab'ında en üstte gösteriliyor.
- Soru sayısı UI'da tek tek gösterilmiyor ("X soru" kart başına yerine üstte tek satır "yüzlerce soru") — düşük sayıların kötü izlenim verme riskine karşı.

**Genel kültür soru havuzu genişletmesi:** 902 → 1062 soru (+40 her kategoriden: Tarih/Coğrafya/Vatandaşlık/Güncel).

**⚠️ Bulunan ve düzeltilen kritik hata — tüm sorularda doğru cevap A şıkkındaydı:** Hem yeni yazılan 160 genel kültür sorusunda hem de AGS'nin 600 sorusunun tamamında `correctIndex` hep `0` yazılmıştı (üstelik mevcut eski 902 sorudaki dağılım da zaten dengesizdi — 902/1062'sinde A ağırlıklıydı). TypeScript AST'sini (`typescript` paketi) kullanan bir script ile her sorunun id'sine göre deterministik olarak şıkları karıştırıp `correctIndex`'i buna göre güncelleyen bir düzeltme yapıldı (bkz. git log `fix(ags): şık karıştırma...` commit'i) — soru/açıklama metinleri değişmedi, sadece şık sırası ve doğru cevap konumu. **Ders:** Toplu soru üretiminden sonra `grep -oE "correctIndex: [0-9]" | sort | uniq -c` ile dağılım kontrolü rutine alınmalı.

**Canlı Nabız özelliği eklenip sonra tamamen kaldırıldı:** Ana ekranda "bugün X aday · Y soru çözüldü" göstergesi (`components/LivePulse.tsx`, `lib/firestore.ts`'teki `fetchTodayPulse`) eklendi, ama düşük gerçek kullanıcı sayısıyla ("3 aday" gibi) tam tersi bir izlenim ("az kullanılıyor") verdiği fark edilince component ve fonksiyon komple silindi. **Ders:** Sosyal kanıt / canlı sayaç türü özellikler düşük DAU'lu bir uygulamada erken eklenmemeli; büyüdükten sonra ya da "bugün" yerine hiç küçülmeyen "toplam" metriklerle tekrar değerlendirilebilir.

**Yerel EAS build (`--local`) iş akışı keşfedildi/belgelendi — EAS bulut kotası bittiğinde alternatif:**
- `eas build --platform ios --profile production --local --output <yol>.ipa --non-interactive` bu Mac'te doğrudan derleyip .ipa üretiyor, kimlik bilgilerini EAS sunucularından arka planda otomatik çekiyor (manuel sertifika indirmeye gerek yok).
- **Fastlane bu Mac'te kurulu değildi** (`brew install fastlane` ile kuruldu) — kurulu olmadan bu komut, kimlik bilgisi payload'unu (şifreli p12/provisioning profile base64) hata mesajıyla birlikte log dosyasına döküyor (`spawn fastlane ENOENT` sonrası). Fastlane kurulunca bu risk ortadan kalkıyor.
- Üretilen .ipa Transporter ile Can tarafından App Store Connect'e elle yükleniyor (TestFlight testi için); bu, `eas submit` akışının yerini şimdilik alıyor.
- **appVersionSource: "remote"** olduğu için buildNumber her `--local` build'de de otomatik artıyor (EAS sunucusunda takip ediliyor), `app.json`'daki `version` alanı ise lokal kalıyor — ikisi ayrı senkronize edilmeli.

### 2026-07-10 oturumunda eklenenler
- **Aday Kimliği**: `lib/titles.ts` — ders performansına (categoryStats), streak'e ve haftalık gelişime göre kazanılan 12 unvanlık sistem (örn. "Tarih Kâşifi", "Dört Yönlü Aday"). Öncelik sıralı `evaluateTitle()` ile hesaplanıp `saveCategoryQuizResult` içinde her ders quizinden sonra güncelleniyor. Profilde (kendi + arkadaş) ve sıralamanın "Tüm Zamanlar" sekmesinde görünüyor.
- **Zayıf Konu Radarı**: `lib/categoryAnalysis.ts` — `categoryStats`'tan ders bazlı doğruluk dağılımını (en zayıftan güçlüye) hesaplıyor. Profilde "En zayıf dersin: X" satırı (`/wrong`'a yönlendirir) + Yanlışlarım Defteri'nde tam radar kartı. Ünite/konu bazlı analiz şu an **mümkün değil** — sorularda topicId etiketi yok, ayrı bir migration gerekir.
- Bu iki özellikle birlikte önceden kod tabanında olup commit'lenmemiş büyük bir birikim de commit'lendi: **Arkadaşla Düello** (v1.4.0, aşağıda detaylı), **Akşam Sınavı** (her gün 20:00'de açılan ek 10 soru, `app/evening/`), **onboarding akışı** (`app/onboarding.tsx`), Sentry entegrasyonu.

Önceki oturumlarda eklenenler (detay için `git log`):
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

**Özellikler:**
- [x] Arkadaş ekleme (2026-07-05): `lib/friends.ts` + `app/user/[uid].tsx` (herkese açık profil). Sıralamadaki kullanıcıya dokununca profili açılır, "Arkadaş Ol" ile istek gönderilir; profil sekmesinde gelen istekler (kabul/ret) ve arkadaş listesi görünür. Firestore: `friendRequests/{from_to}` koleksiyonu + `users/{uid}/friends/{friendUid}` alt koleksiyonu; rules güncellendi (**deploy gerekli**). Sohbet yok, ileride düello için zemin.

**Özellikler (henüz yapılmadı):**
- [ ] Aralıklı yanlış tekrarı cilası (`app/wrong/` iskeleti hazır)
- [ ] Seviye/XP unvanları genişlet (Çaylak → Kâtip → Uzman → Şampiyon → …)

## v1.5 Hedefleri (2026-07-08'de seçildi — sosyolojik analiz sonrası)

Hedef kitle analizi: KPSS adayı belirsizlik içinde, yalnız, kıyas baskısı altında; kontrol hissi veren ritüellere ve "yalnız değilim" duygusuna ihtiyacı var. Seçilen üç özellik:

1. **Canlı nabız (hızlı kazanım, ilk yapılacak):** Ana ekranda "Şu an X aday çalışıyor · bugün Y soru çözüldü" sayacı. Mevcut `results`/`categoryResults` verilerinden türetilebilir; 1-2 saatlik iş, yalnızlık hissine doğrudan cevap. **Not:** Bu daha önce (2026-07-30 civarı) denenip düşük gerçek kullanıcı sayısı ters etki yarattığı için kaldırılmıştı — v1.5 kapsamında tekrar gündeme gelmedi.
2. **✅ Haftalık Deneme + yüzdelik dilim — YAPILDI (2026-08-09):** Pazar günü 30 soru, gerçek sınav formatı, o haftaki katılımcılara göre yüzdelik dilim ("Türkiye genelinde ilk %18'desin"). Detaylar aşağıda.
3. **✅ Atanma Günlüğü — YAPILDI (2026-08-09, sadece (a) kısmı):** Ay sonu otomatik, paylaşılabilir özet kartı — o ay çözülen soru sayısı + aktif gün (sonucu değil emeği paylaştırır). **Kader Sorusu (b) yapılmadı** — push/Cloud Functions altyapısı gerektiriyor, bu konu daha önce kapatılmıştı (bkz. reference_yollar.md / proje hafızası), gündeme getirilmedi.

Not: "Çalışma Loncası" (takımlar) fikri şimdilik pas geçildi; ileride tekrar değerlendirilebilir.

### Haftalık Deneme + Atanma Günlüğü + içerik genişletmesi (2026-08-09 oturumu)

Kullanıcıyla karşılıklı Q&A ile kapsam netleştirildi (plan modu kullanıldı), sonra uygulandı:

- **Haftalık Deneme:** `lib/quiz.ts`'e `getWeeklyExamQuestions()` (haftalık deterministik seed, `QUESTION_POOL`'dan 30 soru — tüm Türkiye aynı hafta aynı soruları görür) + `isWeeklyExamAvailable()` (sadece Pazar). `app/weekly/exam.tsx` — `app/evening/quiz.tsx`'in klonu, 30 soru/30sn, yüzdelik chip + paylaşım kartı eklendi. Yeni Firestore koleksiyonu `weeklyExamResults/{uid}_{weekKey}` — **bilinçli olarak `users.totalScore`'a dokunmuyor** (AGS modülüyle aynı izole-istatistik yaklaşımı), bu yüzden `validUserUpdate`'in totalScore tavanını değiştirmeye gerek kalmadı. `firestore.rules` deploy edildi. Ana ekranda Pazar günü açılan altın renkli kart, Pazar 10:00 için yerel bildirim (`scheduleWeeklyExamReady`).
- **Atanma Günlüğü:** `lib/monthlyRecap.ts` — `fetchMonthlyRecap(uid, monthKey)` `results` koleksiyonundaki `mainTotal+eveningTotal` alanlarını o ay için toplar (kategori quiz'leri v1'de dahil değil, bir alt sınır/yaklaşık değer). Yeni Firestore koleksiyonu **yok** — kullanıcı zaten kendi `results` dokümanlarını okuyabiliyor. `components/MonthlyRecapCard.tsx` + `app/recap/[month].tsx` — `captureAndShare` (`lib/share.ts`, zaten kurulu `react-native-view-shot`) ile paylaşılabilir kart. Profilde kalıcı giriş noktası + ayın 1'i için yerel bildirim + bildirim kaçırılırsa diye ana ekranda açılış-anı yedek banner'ı (AsyncStorage `monthlyRecapSeen:{monthKey}` bayrağıyla bir kez gösterilir).
- **İçerik — genişletildi (2026-08-16 devam oturumu):** Genel kültür 902 → **1275 soru** (tarih 413, coğrafya 328, vatandaşlık 292, güncel 242 — her kategoriye toplam 37 yeni soru, üç ayrı parti halinde: 10'ar + 15'er + 28'er; AGS hariç tutularak yapılan son parti kullanıcı isteğiyle sadece genel kültüreydi). AGS 600 → **751 soru** (9 alt dalın her birine 15 yeni soru, gp/ov'a ayrıca ilk partide 8'er eklenmişti). Yeni bir tarih ünitesi (`t14` — Büyük Selçuklu Devleti, `constants/topics.ts`). `app/(tabs)/practice.tsx`'teki "13 ünite" → "14 ünite", `app/onboarding.tsx`'teki "30 üniteyi" → "31 üniteyi" güncellendi.
  - **Kritik ders — correctIndex karıştırma script'inde 32-bit taşma hatası:** AGS'ye eklenen 135 sorunun tamamı ilk karıştırmada yanlışlıkla D şıkkına düşmüştü. Sebep: script'te büyük bir LCG çarpanıyla (1103515245) yapılan düz JS çarpması, seed `0xffffffff`'e yaklaştığında 53-bit güvenli tam sayı sınırını aşıp sessizce hassasiyet kaybediyordu (JS number çarpması gerçek 32-bit taşma gibi davranmıyor). `Math.imul(s, çarpan)` ile düzeltildi. **Ders: id-tabanlı deterministik karıştırma script'i yazılırken her zaman `Math.imul` kullan, düz `*` operatörüyle büyük çarpanlar birleştirme** — `lib/quiz.ts`'teki mevcut LCG'nin (çarpan 1664525) o zamana dek sorunsuz çalışması sadece küçük çarpan seçiminden kaynaklanan bir tesadüftü, garanti değildi.
  - Script her seferinde çalıştırıldıktan sonra `grep -oE "correctIndex: [0-9]" | sort | uniq -c` ile dağılım gözle kontrol edildi (mükemmel eşit değil ama aşırı yoğunlaşma yok).
- **Paylaşılan altyapı:** `getWeekKey()` (`lib/firestore.ts`'te unexported olarak duruyordu) `lib/dateKey.ts`'e taşındı, `getMonthKey()` da oraya eklendi — hem `lib/firestore.ts` hem `lib/quiz.ts`/`lib/monthlyRecap.ts` oradan import ediyor.
- **Doğrulama:** `npx tsc --noEmit` her adımdan sonra çalıştırıldı, tüm değişiklikler tip hatasız. **Simülatörde uçtan uca UI testi yapılmadı** (kullanıcı test aşamasını erteledi) — bir sonraki oturumda `npx expo run:ios --udid BF4715BD-61A3-4115-B27F-CE79BD7776D9` ile Pazar günü kartı/ekranı, paylaşım akışı ve Atanma Günlüğü ekranının gerçek cihazda/simülatörde doğrulanması gerekiyor.

## v1.4.0 — Arkadaşla Düello (2026-07-08, kod tamam + simülatörde E2E test edildi; 2026-07-10 commit'lendi ve build 29'a girdi)

- **Akış:** Arkadaş listesinden ⚔️ → ders seç (Tarih/Coğrafya/Vatandaşlık/Güncel/Karışık) → meydan okuyan 5 soruyu çözer → rakip uygulamayı açınca ana ekranda "sana meydan okudu" kartı → aynı 5 soruyu çözer → VS sonuç ekranı + Rövanş. 48 saat cevapsızsa meydan okuyan hükmen kazanır. Kazanan +25 XP (totalScore+seasonScore).
- **Dosyalar:** `lib/duels.ts` (veri katmanı), `components/DuelRunner.tsx` (5 soru koşucusu), `app/duel/new.tsx`, `app/duel/[id].tsx`; entegrasyon: profil arkadaş listesi, `app/user/[uid].tsx` ("Düelloya Davet Et" + düello istatistiği), ana ekran kartları.
- **Firestore:** `duels/{autoId}` koleksiyonu; rules **deploy edildi** (2026-07-08, arkadaşlık kurallarıyla birlikte).
- **Rozetler:** `duel_first`, `duel_win_3`, `duel_win_10`, `duel_streak_5`. Kullanıcı alanları: `duelCount`, `duelWins`, `duelStreak`.
- **Bilinçli eksik (v1.4.1+):** rakibe anlık push (plan aşağıda), link ile davet, rastgele rakip, canlı mod.

### Düello push bildirimi planı (v1.4.x — YAPILACAK, karar verildi 2026-07-08)

Mevcut bildirimler tamamen lokal; rakibe anlık "sana meydan okundu" push'u için sunucu tarafı gerekiyor. Plan:

1. **Push token toplama (istemci):** `expo-notifications` ile Expo push token al (`getExpoPushTokenAsync`, projectId EAS'ten), `users/{uid}.pushToken` alanına yaz. Uygulama açılışında ve bildirim izni verildiğinde güncelle. Rules: kullanıcı kendi profiline yazıyor, ek kural gerekmez.
2. **Cloud Functions (sunucu):** Firebase Functions v2, iki Firestore trigger'ı:
   - `duels` onCreate → `to` kullanıcısının pushToken'ına Expo Push API ile "⚔️ {fromName} sana meydan okudu! ({kategori})"
   - `duels` onUpdate (status pending→completed) → `from` kullanıcısına "🏁 {toName} düellonu tamamladı — sonucu gör!"
   - Gönderim: `https://exp.host/--/api/v2/push/send` (Expo Push API, APNs/FCM anahtarı gerekmez, EAS build'lerde çalışır).
3. **⚠️ Blaze planı gerekiyor:** Cloud Functions, Firebase'de ücretli (Blaze, kullandıkça öde) plana geçiş ister — kredi kartı bağlanmalı. Bu ölçekte fiilen 0₺ civarı (ücretsiz kotalar geniş) ama karta onay Can'dan alınacak.
4. Dağıtım: repo köküne `functions/` klasörü + `firebase deploy --only functions`.
5. İleride aynı altyapı arkadaşlık isteği bildirimi ve "hükmen kazandın" (48s scheduler) için de kullanılır.

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

- **iOS:** v1.3.4/build 46 App Store'da canlı. Kalan tek şey: App Store Connect'teki "App Name" alanını ("KPSS Quiz: Soru Bankası 2026" → "KPSS AGS Quiz" gibi) güncellemek istersen App Information sayfasından Can'ın kendisinin yapması gerekiyor — Apple bunun için yeni versiyon açılmasını şart koşuyor.
- **Android:** v1.3.4 (versionCode 6) Google Play'de canlı. Üretim kanalı kalıcı olarak aktif.
- **Android sonraki sürümler için:** Artık `eas build --platform android --profile production` + `eas submit --platform android --latest` ikilisi yeterli — servis hesabı izinleri ve `eas.json` track ayarı kalıcı olarak düzeltildi, tekrar kurulum gerekmiyor.
- **iOS sonraki sürümler için:** `eas build --platform ios --profile production --local` (Fastlane, EAS kotası dolarsa) veya normal `eas build --platform ios --profile production` + Transporter/`eas submit` ile App Store Connect'e yükleme, sonra review'a gönderme ve (manuel yayın modu seçili olduğu için) onay sonrası Can'ın "Release This Version" ile elle yayınlaması gerekiyor.

## Dosya Referansları

| Dosya | Ne için |
|---|---|
| `README.md` | Genel proje tanıtımı |
| `aso/app-store-metadata.md` | App Store metinleri (isim, açıklama, keywords) |
| `aso/screenshots/iphone-6.9/` | App Store ham ekran görüntüleri |
| `firestore.rules` / `firestore.indexes.json` | Firestore kuralları / indeksleri |
| `eas.json` / `app.json` | EAS + Expo konfigürasyonu |
