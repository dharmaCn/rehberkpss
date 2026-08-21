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
- **Android emülatör bu Mac'te kurulu** (2026-08-03'te kuruldu): Android Studio + SDK `~/Library/Android/sdk`, AVD adı `Pixel_8_API_34` (Android 14, Google APIs, arm64-v8a). Çalıştırmak için: `export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk" ANDROID_HOME="$HOME/Library/Android/sdk" JAVA_HOME="/opt/homebrew/opt/openjdk@17"`, sonra Android Studio → Device Manager'dan emülatörü başlat (veya `emulator -avd Pixel_8_API_34` — `emulator` PATH'e ekli değilse `$ANDROID_SDK_ROOT/emulator/emulator`). Uygulamayı kurup Metro'ya bağlamak için `npx expo run:android` (native modüller içerdiğinden Expo Go çalışmaz, dev build şart). `adb`/`avdmanager`/`sdkmanager` de `platform-tools`/`cmdline-tools` altında kurulu.

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
constants/   questions.ts (genel kültür, 1275 soru: Tarih/Coğrafya/Vatandaşlık/Güncel), agsQuestions.ts (AGS/Eğitim Bilimleri, 751 soru: 9 alt dal), artworks.ts (81), facts.ts (101), topics.ts (31 ünite: 14 tarih + 10 coğrafya + 7 vatandaşlık), exams.ts, season.ts
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

## Güncel Durum (2026-08-05)

**Kısa özet — "uygulama şu an ne durumda?" sorusunun cevabı:**
- 🍎 **App Store:** v1.3.4 **canlı**, v1.3.5 (build 48 — boot canary eşiği düşürüldü, sıralama tekrar + görsel yükleme düzeltmeleri) **Apple incelemesinde** (2026-08-05'te submit edildi, 48 saate kadar sürebilir) — bkz. aşağıdaki 2026-08-04/05 oturum notu.
- 🤖 **Google Play:** v1.3.4 **canlı**, v1.3.5 (görsel yükleme + sıralama tekrar düzeltmeleri, versionCode 7) **Google incelemesinde** (2026-08-03'te submit edildi) — bkz. aşağıdaki 2026-08-03 oturum notu.
- **İki platform da senkron ve güncel** — ilk kez bu noktaya ulaşıldı (Android'in üretime hiç çıkmamış olması Ağustos başındaki oturumların ana konusuydu, bkz. aşağıdaki oturum notları).

| Şey | Durum |
|---|---|
| iOS versiyon | **v1.3.4/build 46 hâlâ canlı; v1.3.5/build 48 Apple incelemesinde.** `eas build --platform ios --profile production` (EAS_SKIP_AUTO_FINGERPRINT=1 ile, fingerprint hesaplama EAS kesintisi yüzünden timeout veriyordu) + App Store Connect'te elle yeni versiyon (1.3.5) oluşturulup build 48 eklendi, "What's New" ve "Notes" güncellendi, manuel yayın modu korunarak review'a gönderildi (2026-08-05). Apple onayladıktan sonra Can'ın elle "Release This Version" yapması gerekecek. |
| Android versiyon | **v1.3.4 (versionCode 6) hâlâ canlı; v1.3.5 (versionCode 7) Google incelemesinde.** v1.3.5, `eas build --platform android --profile production` + `eas submit --platform android --latest` ile 2026-08-03'te üretim kanalına gönderildi (submit "COMPLETED" döndü, Google onayı bekleniyor). Önceki v1.3.4: aynı komut ikilisiyle alınıp gönderilmiş, Google onaylamış, 2026-08-02 12:41'de yayına girmişti. |
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
