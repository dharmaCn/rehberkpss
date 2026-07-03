# KPSS AGS Quiz — Proje Durum & Devir Raporu

> Yeni bir oturumun / AI asistanının projeyi tek bakışta anlaması için yazıldı.
> **Son güncelleme: 2026-07-03**

Detaylı devir notu için önce **`AGENTS.md`** dosyasını oku (mimari, kurallar, komutlar).

---

## Şu Anki Durum (2 Tem 2026)

| Şey | Durum |
|---|---|
| Uygulama versiyonu | **v1.2.1** (build 24) |
| App Store | Submit edildi, **"Waiting for Review"** |
| Google Play | Kapalı test (Alpha) kanalında yayında; 12 test kullanıcısı kayıtlı; 14 gün sayacı işliyor (~**16 Tem** üretim başvurusu açılır) |
| Stabil snapshot | `git tag v1.2.1-stable`, `git branch backup/v1.2.1-stable` |
| Simülatör testi | Ana ekran, profil (seviye kartı), günün kültür sorusu, exam countdown, konu anlatımı → hepsi çalışıyor |

---

## Uygulama Kısaca

**KPSS AGS Quiz** — KPSS ve AGS sınavına hazırlanan Türk kullanıcılar için:
- Her gün 10 soru + günün genel kültür sorusu + günün bilgisi
- 4 kategori (Tarih, Coğrafya, Vatandaşlık, Güncel) toplam **501 soru**
- 17 ünitede hap bilgi kartı konu anlatımı (Kolay/Orta/Zor)
- Günlük / haftalık / tüm zamanlar sıralaması
- Seviye + XP sistemi (Çaylak, ...), streak ve rozetler
- Ücretsiz, reklamsız, Firebase auth (Google/Apple/misafir)

---

## v1.2.1 → v1.3.0 Yol Haritası

Kullanıcı bunları istedi, henüz yapılmadı — sıra:

### Özellikler
- [ ] **Haftalık Deneme Sınavı** (pazar günleri 30 soru, yüzdelik dilim, gerçek sınav formatı)
- [ ] **Aralıklı yanlış tekrarı** (`app/wrong/` iskeleti hazır, cilalanacak)
- [ ] **Arkadaşla Düello** (link paylaşımı + 5 soru, kazanan rozet)
- [ ] Seviye/XP unvanları genişlet (Çaylak → Kâtip → Uzman → Şampiyon → …)

### İçerik büyütme
- [ ] Vatandaşlık: 75 → 150 (öncelikli)
- [ ] Güncel: 50 → 100 (2026 olayları)
- [ ] Coğrafya: 150 → 200
- [ ] Tarih: 226 → 275
- [ ] Kültür (artworks): 50 → 80
- [ ] Günlük bilgi (facts): 42 → 100

### Bilinen bug / iyileştirme
- [ ] Günün kültür sorusu modalı kapandığında ana ekrandaki karttaki
      `artAnswered` state yenilenmiyor ("Bugünkü soruyu çözdün ✓" görünmüyor).
      Küçük UX kırığı, submit'i etkilemedi.

---

## Yayın Sürecinde Kalan İşler

### iOS
1. App Store review sonucu bekleniyor (~24-48 saat).
2. Onay gelirse otomatik yayına düşecek (release ayarı hemen yayında).

### Android
1. 16 Tem civarı 14 günlük sayaç dolunca **"Üretime başvur"** butonu açılacak.
2. Play Console → Kontrol paneli'nden başvur, kısa formu doldur.
3. Google incelemesi geçince canlı yayın (birkaç saat - birkaç gün).

**Önemli:** Test kullanıcı sayısı 12'nin altına düşerse sayaç sıfırlanır. Gruptan
kimsenin ayrılmadığından emin ol.

---

## Codex ile Çalışırken Güvenlik Ağı

```bash
# Bir şey bozulursa v1.2.1'e geri dön
git reset --hard v1.2.1-stable
# veya ayrı branch'e geç
git checkout backup/v1.2.1-stable

# Codex için ayrı branch aç (main'i korumak için tercih edilir)
git checkout -b codex-experiments
```

---

## Dosya Referansları

| Dosya | Ne için |
|---|---|
| `AGENTS.md` | AI asistan devir notu (mimari, kurallar, komutlar) |
| `README.md` | Genel proje tanıtımı |
| `aso/app-store-metadata.md` | App Store için tüm metinler (isim, açıklama, keywords) |
| `aso/whats-new-v1.2.0.md` | v1.2.0 sürüm notları |
| `aso/screenshots/iphone-6.9/` | App Store ham ekran görüntüleri |
| `firestore.rules` | Firestore güvenlik kuralları |
| `firestore.indexes.json` | Firestore sorgu indeksleri |
| `eas.json` | EAS Build + Submit konfigürasyonu |
| `app.json` | Expo konfigürasyonu (sürüm, bundle id, pluginler) |

---

## İletişim / Kimlik

- Geliştirici: Can Özdar
- E-posta: canozdar@gmail.com
- GitHub: dharmaCn
- Apple Team ID: 7NDJ59U73L
- App Store Connect ID: 6774950987
- Google Play developer ID: 8074651722042556511
