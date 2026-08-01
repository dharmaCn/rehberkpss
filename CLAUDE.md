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

components/  DailyCultureModal, ExamGoalModal, SeasonResetModal, ReportQuestionButton, DuelRunner
constants/   questions.ts (genel kültür, 1062 soru: Tarih/Coğrafya/Vatandaşlık/Güncel), agsQuestions.ts (AGS/Eğitim Bilimleri, 600 soru: 9 alt dal), artworks.ts (81), facts.ts (101), topics.ts (30 ünite: 13 tarih + 10 coğrafya + 7 vatandaşlık), exams.ts, season.ts
lib/         firestore.ts (veri katmanı), badges.ts, levels.ts (XP/seviye), titles.ts (Aday Kimliği unvanları — genel kültür), categoryAnalysis.ts (Zayıf Konu Radarı — genel kültür), agsQuiz.ts (AGS soru seçimi/etiket/renk), agsTitles.ts (AGS unvan seti), agsCategoryAnalysis.ts (AGS Zayıf Konu Radarı), duels.ts, notifications.ts, share.ts, demoMode.ts, guestName.ts, onboarding.ts
app/(tabs)/ags.tsx  AGS sekmesi: 9 konu kartı + Zayıf Konu Radarı + unvan rozeti
app/ags/     AGS quiz akışı (5 soru, 30sn timer) — kendi Firestore alanları (agsCategoryStats/agsTitleId), genel kültür skor/liderlik sistemine dokunmaz
app/duel/    Arkadaşla düello (yeni + [id] sonuç ekranı)
app/evening/ Akşam Sınavı (20:00'de açılan ek 10 soru)
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

## Güncel Durum (2026-07-30)

| Şey | Durum |
|---|---|
| Versiyon | **v1.3.4 hazırlanıyor** — AGS modülü + soru havuzu genişletmesi + şık karıştırma düzeltmesi içeriyor. Yerel EAS build (`--local`) ile üretilip Transporter ile App Store Connect/TestFlight'a Can tarafından elle yükleniyor; henüz Apple review'a submit edilmedi. Android versionCode 5 hâlâ güncel |
| App Store | v1.3.3/build 40 **onaylandı ve yayında**. v1.3.2/build 35'teki açılış crash'i düzeldi (versiyon-değişimi süpürmesi işe yaradı) |
| Google Play | Kapalı test (Alpha); ~16 Tem'de üretim başvurusu açılır |
| EAS build kotası | Ücretsiz aylık kota bu ay tükendi (aylık sıfırlanıyor) — bu yüzden `eas build --local` (bu Mac'te, Fastlane ile) kullanılıyor; bkz. aşağıdaki oturum notu |
| Stabil snapshot | `git tag v1.2.1-stable`, `git branch backup/v1.2.1-stable` — bozulursa `git reset --hard v1.2.1-stable` |

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

**✅ ÇÖZÜLDÜ — TestFlight açılış crash'i (2026-07-10/11, kök neden bulundu ve yamalandı):**
Build 31 ve 33, kurulumdan sonra her açılışta anında çöküyordu. Kök neden: **cihazdaki bozuk AsyncStorage verisi**, açılışta (Firebase auth kalıcılığı + onboarding bayrağı okumaları sırasında) native `NSException` fırlatıyor; RN 0.81'in bu exception'ı JS Error'a çevirme kodu (`convertNSExceptionToJSError`, kendi dispatch kuyruğundan jsi::Runtime'a dokunuyor) Hermes'i bozup `EXC_BAD_ACCESS (SIGSEGV)` veriyor (crash log'larda çöken adresin ASCII metin olması — `0x75646f70` = "podu" — bellek bozulmasını ele veriyordu). Teşhis, cihazda uygulamayı **silip yeniden kurunca** (temiz veri) crash'in kaybolmasıyla doğrulandı; simülatörde temiz veriyle hiç üretilemiyordu.
- **Kalıcı çözüm (build 34+):** `patches/@react-native-async-storage+async-storage+2.2.0.patch` — RNCAsyncStorage.mm'deki 6 dışa açık metod `@try/@catch` ile sarıldı: exception'da çökmek yerine callback'e hata dönüyor + okunamayan depo temizleniyor (self-heal). `package.json`'da `postinstall: patch-package` var; **AsyncStorage sürümü değişirse patch yeniden üretilmeli** (`npx patch-package @react-native-async-storage/async-storage`).
- Bu koruma kritik: App Store'daki v1.3.0 kullanıcıları güncellemede eski verilerini taşır — verisi sorunlu olan kullanıcı yamasız build'de kalıcı crash-loop'a girer.
- Build 32 (Sentry kaldırma) ve 33 (bildirim erteleme) değişiklikleri crash'le ilgisizmiş ama zararsız; Sentry zaten yapılandırılmamıştı, kaldırılmış durumda.
- Yeni bir crash olursa: Xcode → Window → Organizer → crash log'a çift tıkla → sembolize log `~/Library/Developer/Xcode/Products/com.rehberkpss.app/Crashes/Points/.../Logs/*.crash` altına düşer, `Thread N Crashed:` kısmına bak.

**⚠️ Diğer build notları:**
- İlk submit denemesi (build 29, v1.3.0) Apple tarafından **90062 hatasıyla reddedildi**: `app.json`'daki `"version"` (CFBundleShortVersionString) zaten onaylanmış 1.3.0 ile aynıydı, artırılması gerekiyordu → `1.3.1`'e çekildi. Bir sonraki sürümde `app.json`'daki `version`'ı da elle artırmayı unutma (EAS sadece `buildNumber`'ı `autoIncrement` ile otomatik artırıyor, marketing version'ı artırmıyor).
- `eas build:version:set --platform ios` komutu **interaktif** — bu ortamda `expect` ile otomatikleştirildi ama alan öndeki değeri temizlemeden yazarsa değerleri birbirine karıştırabiliyor (`30` yerine yanlışlıkla `1.3.1` yazılmıştı, düzeltildi). Bu komutu tekrar çalıştırırken dikkatli ol, sonucu `eas build:version:get --platform ios` ile doğrula.

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

1. **Canlı nabız (hızlı kazanım, ilk yapılacak):** Ana ekranda "Şu an X aday çalışıyor · bugün Y soru çözüldü" sayacı. Mevcut `results`/`categoryResults` verilerinden türetilebilir; 1-2 saatlik iş, yalnızlık hissine doğrudan cevap.
2. **Haftalık Deneme + yüzdelik dilim:** Pazar günü 30 soru, gerçek sınav formatı, Türkiye geneli yüzdelik ("ilk %18'desin"). Adaya başka yerde bulamayacağı konum bilgisi verir. (Eski yol haritasından öne çekildi.)
3. **Atanma Günlüğü + Kader Sorusu:** (a) Ay sonu otomatik, paylaşılabilir özet kartı — "Mart: 1.240 soru, 27 gün seri" (sonucu değil emeği paylaştırır, organik büyüme); (b) her akşam 21:00 push ile tüm kullanıcılara aynı zor soru, tek cevap hakkı, "Türkiye'nin %34'ü bildi" sonucu — düello push altyapısının üstüne biner.

Not: "Çalışma Loncası" (takımlar) fikri şimdilik pas geçildi; ileride tekrar değerlendirilebilir.

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

- **iOS:** Production'da v1.3.3/build 40 yayında. v1.3.4 (AGS modülü + düzeltmeler) yerel build ile üretildi, Can Transporter'la App Store Connect'e yükleyip TestFlight'tan test ediyor — henüz production review'a submit edilmedi. Test sonrası App Store Connect'te "App Name" alanının (gerekirse) güncellenmesi için yeni versiyon açılması gerekebilir (bu adım Can tarafından yapılmalı, kod tarafında `app.json`'daki isim zaten "KPSS AGS Quiz").
- **Android:** ~16 Tem sayaç dolunca Play Console → Kontrol paneli'nden "Üretime başvur".

## Dosya Referansları

| Dosya | Ne için |
|---|---|
| `README.md` | Genel proje tanıtımı |
| `aso/app-store-metadata.md` | App Store metinleri (isim, açıklama, keywords) |
| `aso/screenshots/iphone-6.9/` | App Store ham ekran görüntüleri |
| `firestore.rules` / `firestore.indexes.json` | Firestore kuralları / indeksleri |
| `eas.json` / `app.json` | EAS + Expo konfigürasyonu |
