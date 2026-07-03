# App Store Optimization (ASO) Paketi — KPSS Quiz

Bu dosya, App Store Connect'te girilecek tüm metadata'yı içerir. Her bölümü doğrudan ilgili alana kopyala-yapıştır.

---

## 1. App Name (30 karakter sınırı)

**Şu an:** `KPSS AGS Quiz` (13 karakter — güncellendi, hem KPSS hem AGS arama trafiğine giriyor)

Bu isim App Store Connect → App Information → **Name** alanına birebir girilmeli (uygulama zaten bu isimle build edildi; app.json + CFBundleDisplayName güncellendi).

> AGS (Akademik Personel ve Lisansüstü Eğitim Giriş Sınavı) KPSS'den ayrı ama aynı adaylarca aranan bir sınav; isimde ikisini birden barındırmak arama havuzunu genişletir. Apple keyword-stuffing reddi riski yok çünkü ikisi de gerçek, tanınır sınav adları.

---

## 2. Subtitle (30 karakter sınırı, app adı altında)

```
Tarih Coğrafya Vatandaşlık
```

(26 karakter — üç ders kategorisi yüksek hacimli aramalar; "KPSS/AGS" isimde zaten var, subtitle'da tekrar etmeye gerek yok)

Alternatif:

```
Soru Bankası ve Konu Anlatımı
```

(29 karakter — özellik vurgulu, "soru bankası" yüksek hacimli arama terimi)

> Şu an muhtemelen **boş** ve bu büyük bir kayıp. Subtitle sıralamada app adı kadar yüksek ağırlıklı.

---

## 3. Keywords (100 karakter, virgülle ayır, BOŞLUK YOK)

**Kural:**
- App adı ve subtitle'da geçen kelimeleri TEKRARLAMA (Apple zaten otomatik dahil eder, alan israfı olur)
- Aramada kullanılan ham terimleri sıkıştır

```
test,deneme,sınav,hazırlık,çıkmış,güncel,memurluk,ösym,konu,anlatım,2026,sıralama,önlisans,ags
```

(96 karakter)

**Hedef kelimeler:** test, deneme, sınav, hazırlık, çıkmış (sorular), güncel, memurluk, ösym, konu anlatım, 2025, sıralama, önlisans.

---

## 4. Promotional Text (170 karakter — sürüm güncellemeden değiştirebilirsin)

Description'ın en üstünde, kalın ve renkli görünür. Buraya **kampanya / yeni özellik / güncel hatırlatma** koy:

```
2026 KPSS ve AGS'e az kaldı! Her gün 10 yeni soru, günün genel kültür sorusu, hap bilgi kartları ve canlı Türkiye sıralaması seni bekliyor. Hemen başla!
```

(153 karakter)

---

## 5. Description (Açıklama)

İlk 3 satır kritik — kullanıcı "daha fazla göster"e tıklamadan görünür. Bu yapıyı kullan:

```
KPSS AGS Quiz, KPSS ve AGS sınavlarına hazırlananlar için tasarlanmış ücretsiz bir soru bankası ve konu anlatımı uygulamasıdır. Her gün yeni 10 soru, günün genel kültür sorusu, hap bilgi kartları, ders bazlı mini quizler ve canlı Türkiye sıralamasıyla çalışma rutinini eğlenceli hâle getirir.

Tek bir uygulamada KPSS Tarih, Coğrafya, Vatandaşlık ve Güncel Bilgiler konularını çalış, kendini sınırsız ve ücretsiz dene.

🏆 GÜNLÜK 10 SORU
• Her gün taze 10 soru, tüm kullanıcılara aynı set
• Hızlı cevapla ekstra puan, soru başı 30 saniye süre
• 150 maksimum puan, hız bonusu sistemi

🖼️ GÜNÜN GENEL KÜLTÜR SORUSU
• Her gün girişte tek bir soru: ünlü tablo, eser, yazar veya kült film
• Görsel destekli, çözenlerin yüzde kaçının doğru bildiğini gör
• Altında "Bunu Unutma" bilgi kartıyla kalıcı öğrenme

💡 GÜNÜN BİLGİSİ
• Tarih, coğrafya ve vatandaşlık üzerine kısa "bunu biliyor muydun?" bilgileri
• Beğendiğini arkadaşınla tek dokunuşla paylaş

📚 13 ÜNİTE HAP BİLGİ KARTI
• KPSS Tarih için 13 ünite konu anlatımı
• Her ünite: Kolay / Orta / Zor 3 seviye
• Kısa, kolay okunan hap bilgi kartları (sınavda en çok çıkan)
• Kartlar bitince konuya özel 5 soruluk mini quiz

📊 DERS QUİZLERİ
• Tarih, Coğrafya, Vatandaşlık, Güncel ayrı ayrı 5'er soru
• Kategori başına farklı sorular, her gün değişir
• KPSS Genel Kültür dağılımına uygun ağırlıklar

🏅 CANLI TÜRKİYE SIRALAMASI
• Günlük, haftalık ve tüm zamanlar sıralaması
• Doğru cevap + hız bonusu = en yüksek puan
• Profilinde bireysel istatistiklerini takip et

🔓 ÜCRETSİZ VE REKLAMSIZ
• Tamamen ücretsiz, abonelik veya kilitli içerik yok
• Misafir, Google veya Apple ile giriş — saniyeler içinde başla
• Verilerin Firebase ile güvenli şekilde senkronize edilir

KPSS Lisans, Önlisans, Ortaöğretim ve AGS adayları için ideal. ÖSYM çıkmış soru mantığına uygun, güncel müfredat esas alınarak hazırlanmıştır.

Hemen ücretsiz indir, her gün bir adım öne çık. 🚀

— Geri bildirimlerin için: canozdar@gmail.com
— Gizlilik politikası: https://dharmacn.github.io/rehberkpss/privacy-policy.html
```

> Açıklamada keyword stuffing yapma — bu metin doğal okunuyor ve gerçek kullanıcıyı dönüştürmek için yazıldı. Sıralamaya doğrudan etkisi sınırlı; etkili olan **conversion rate** (gören kişilerin indirme oranı).

---

## 6. What's New (sürüm güncelleme notu)

Sürüm 1.2.0 için (bkz. `aso/whats-new-v1.2.0.md`):

```
Bu güncellemeyle gelen yenilikler:

• Uygulama adı KPSS AGS Quiz oldu — AGS adayları da artık burada
• Günün Genel Kültür Sorusu: her gün girişte tek soru, görsel destekli
• Günün Bilgisi: kısa "bunu biliyor muydun?" bilgileri + arkadaşınla paylaş
• Giriş ve ana sayfa tasarımı tamamen yenilendi
• Genel kültür soru havuzu 50 soruya çıkarıldı (resim, eser, heykel, yazar, film)
• Performans ve okunabilirlik iyileştirmeleri

Geri bildirimlerin için teşekkürler! 🚀
```

---

## 7. Ekran Görüntüleri

Apple 2025 itibarıyla şunları zorunlu/önerilen kılıyor:
- **6.9" iPhone** (1320 × 2868 — iPhone 16 Pro Max) — zorunlu, ana set
- **6.5" iPhone** (1284 × 2778) — Apple otomatik ölçekleyebilir ama ayrı yüklemek daha iyi görünür
- iPad kullanıyorsan iPad seti de gerekir (bu uygulama iPad'i şu an hedeflemiyor, atlanabilir)

Final set — 6 görsel, kullanıcı kendi hazırladı (Figma/Canva, cihaz çerçevesi + başlık + gradient arka plan). Sıralama ve başlıklar:

### 1. `06-login.png` — "KPSS ve AGS'ye hazırlığın en hızlı yolu"
Giriş ekranı, ilk izlenim — küçük önizlemede görünen en kritik görsel.

### 2. `02-culture-modal.png` — "Görselli sorularla genel kültürünü test et"
Günün Genel Kültür Sorusu modalı, en özgün/farklılaştırıcı özellik — merak uyandırıp "hook" görevi görür.

### 3. `03-quiz.png` — "10 soru, 30 saniye, günlük pratik"
Quiz çözme ekranı, ana kullanım — asıl değer önerisi.

### 4. `04-art-levels.png` — "50 soruluk genel kültür havuzu"
Zorluk seviyesi seçimi, içerik derinliğini gösterir.

### 5. `05-leaderboard.png` — "Sıralamada zirveye çık"
Leaderboard, sosyal kanıt/motivasyon unsuru.

### 6. `01-home.png` — "Her gün yeni bir soru, her gün ilerleme"
Ana sayfa, genel özet — kapanış görseli.

**Not:** İlk 3 görsel (login, culture-modal, quiz) App Store'un küçük önizlemesinde görünen kısım — en güçlü mesaj oraya kondu. 6 görsel, maksimum 10 hakkının tamamı kullanılmadı; kullanıcı ilk 2-3 görselde karar verdiği için fazladan görsel eklemenin dönüşüme katkısı düşük.

### 7.1 Ham ekran görüntüleri nasıl alındı

`iPhone 16 Pro Max` simülatöründe (1320×2868, iOS 26.5) uygulama çalıştırılıp aşağıdaki ekranların ham `.png` çıktısı `aso/screenshots/iphone-6.9/` klasörüne kaydedildi:
- `01-home.png` — Ana sayfa (gradient header, Günün Genel Kültür Sorusu kartı, Bugünün Soruları)
- `02-culture-modal.png` — Günün Genel Kültür Sorusu modalı (görsel + şıklar)
- `03-quiz.png` — Quiz çözme ekranı
- `04-art-levels.png` — Genel Kültür zorluk seviyesi seçimi
- `05-leaderboard.png` — Sıralama ekranı
- `06-login.png` — Giriş ekranı

Bu dosyaları doğrudan Figma/Canva'ya sürükleyip üstüne başlık ekleyebilirsin; boyutları zaten App Store'un istediği 1320×2868 çözünürlükte.

---

## 8. App Preview Video (15-30 saniye, OPSİYONEL ama EN ETKİLİ)

Bu, küçük listelemeden büyük autoplay karta geçişin tek garantili yolu. 

### Storyboard (28 saniye)

| Saniye | İçerik |
|---|---|
| 0-3s | Logo + "KPSS Quiz" yazısı, kısa açılış |
| 3-8s | Ana sayfa scroll, "Günlük Quiz" kartı |
| 8-13s | Quiz başla → hızlıca 3 soruya cevap → "✓ Doğru!" animasyon |
| 13-18s | Hap bilgi kart akışı, sağa sola kaydır |
| 18-23s | Seviye seçim (3 renkli kart) → bir tıkla |
| 23-26s | Sıralama ekranı → en üstteki kişiyi göster |
| 26-28s | "Ücretsiz İndir" CTA + uygulama ikonu |

### Nasıl çekilir
- Simulator'da QuickTime ile "File > New Movie Recording" → kamera olarak iOS Simulator seç
- Veya gerçek telefonda ekran kaydı + iPhone Mirroring
- Final cut: iMovie veya CapCut, müzik ekle (App Store standart sessiz de kabul eder)
- Çıktı: 1080×1920 portrait, .mov veya .mp4

---

## 9. Localization (Yerelleştirme)

App Store Connect → **App Information** → **Localizations**:
- **Türkçe (tr)** dilini birincil yap (zaten öyle olabilir)
- Türkiye, Kıbrıs, Almanya'daki Türkler için ayrı bir İngilizce yerelleştirmesi şart değil — şimdilik sadece tr-TR ile odaklan
- Tüm metadata Türkçe olmalı (yukarıdaki metinler hazır)

---

## 10. Kategori ve Yaş Sınırı

- **Birincil kategori:** Education
- **İkincil kategori:** Reference (referans)
- **Yaş sınırı:** 4+ (zaten doğru olmalı)

---

## 11. Önemli — Çoklu Cihaz Ekran Görüntüleri

App Store şunları ister:
- **6.7" iPhone** (1290×2796) — iPhone 15 Pro Max
- **6.5" iPhone** (1284×2778) — iPhone 14 Plus
- **5.5" iPhone** (1242×2208) — iPhone 8 Plus (zorunlu değil ama dolu olanın görünürlüğü daha iyi)
- **iPad** — uygulama iPad destekliyorsa zorunlu

Apple bir set yüklediğinde diğerlerini otomatik scale eder ama **6.7"** mutlaka doldurulmalı.

---

## 12. Yorumlar & Yıldız — En Önemli Sıralama Faktörü

Sıralamayı en hızlı yükselten faktör **organik 5 yıldız yorumlar**.

Şu an uygulamada `expo-store-review` ile değerlendirme diyaloğu var. Bunu kontrol et:

1. `lib/review.ts` içinde diyalog **2 quiz sonrası** mı tetikleniyor? (Çok erken = kullanıcı sevmeden kapatır, çok geç = unutur)
2. Diyaloğun **ardından** App Store'a yönlendirme butonu var mı?
3. Ana sayfa + giriş ekranındaki "Bizi Değerlendir" linkleri çalışıyor mu?

Hedef: ilk 2 hafta **20+ yorum, 4.5+ yıldız**. Bunu sağlamak için:
- Sosyal medya / Reddit (r/kpss) / KPSS forumlarda paylaş
- Tanıdıklarından dürüst yorum iste
- Uygulamada quiz çok başarılıysa (örn. %80+) diyaloğu sun → pozitif yorum olasılığı yüksek

---

## 13. İndirme Hızı ve Algoritma Boost

Apple algoritması "kısa sürede çok indirme" görürse uygulamayı yukarıya atar:

- **Lansman gününde** sosyal medyada yoğun paylaşım
- TikTok / Instagram Reels'te 15-30 sn'lik gerçek kullanım videosu
- Eğitim kanallarıyla işbirliği (mikro-influencer KPSS YouTuber'ları)
- "KPSS Quiz" araması yapılınca 2-3 sayfa içinde görünmeye başladığında trafik organik olarak artar

---

## ⏱ Hızlı Aksiyon Planı (Bugün)

1. App Store Connect → **App Information** → adı/subtitle/keywords güncelle (5 dk)
2. **Description** ve **Promotional Text** kopyala-yapıştır (5 dk)
3. Yeni 6 ekran görüntüsü hazırla (Figma/Shotbot, 1-2 saat)
4. **What's New** metnini sürüm 1.0.1'e ekle (zaten Build 15 onay bekliyor olabilir)
5. Bu hafta: 28 saniyelik App Preview Video kaydet (büyük autoplay karta geçiş için kritik)
6. Lansman: KPSS forum/Reddit/sosyal medyada paylaş, 20+ yorum hedefi

Bu listenin **1, 2, 4** maddeleri 15 dakika sürer ve algoritmada en hızlı etkiyi gösterir. **3 ve 5** orta vadede sıralamayı katlar.
