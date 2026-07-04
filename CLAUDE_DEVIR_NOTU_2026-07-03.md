# Claude Devir Notu - 2026-07-03

Bu dosya, ana ekran UI/UX duzenlemelerinden sonra projeye Claude uzerinden devam edebilmek icin hazirlandi.

## Kisa Ozet

Kullanici ana ekranin daha guzel, daha belirgin ve daha kolay anlasilir olmasini istedi. Ozellikle:

- Gunluk 10 soruluk quiz cok altta ve zayif gorunuyordu.
- Genel kultur / guncel bilgiler bolumu goz onunde degildi.
- Ressam-eser, yazar-eser gibi genel kultur sorulari daha belirgin olmaliydi.
- "Testler" butonu tiklanabilir oldugunu belli etmiyordu.
- Header alani daha duzenli olmaliydi.
- Profil balonuna tiklaninca Profil sekmesine gitmeliydi.
- Ders quizleri kartlari daha guzel ve canli olmaliydi.

Bu istekler dogrultusunda ana ekran buyuk olcude yeniden duzenlendi.

## Degisen Dosyalar

### `app/(tabs)/index.tsx`

Ana ekran UI burada degisti.

Yapilan ana degisiklikler:

- Eski ayri "Gunun genel kultur sorusu" ve "Gunluk quiz" kartlari kaldirildi.
- Ust bolume iki ana karttan olusan yeni bir `featureDeck` eklendi:
  - `Gunluk 10 Soru`
  - `Genel Kultur Sorulari`
- `Gunluk 10 Soru` kartina mor gradientli buyuk bir hero bandi eklendi.
- Quiz kartinda 10 soru rozeti, 30 sn tempo bilgisi, ana gorev pill'i ve belirgin baslat butonu eklendi.
- `Genel Kultur Sorulari` kartina yeni gorsel arka plan eklendi.
- Genel kultur kartinda iki ayri aksiyon var:
  - `Gunun Sorusu`: gunluk genel kultur sorusunu acar.
  - `Testler`: tum genel kultur testlerine gider.
- Alttaki `Genel Kultur & Guncel Bilgiler` satiri kaldirildi; bu islev genel kultur kartinin icine alindi.
- `Kesfet` bolumu `Tekrar` olarak sadeleştirildi ve sadece `Yanlislarim Defteri` kaldi.
- Header yeniden duzenlendi:
  - Daha kompakt ve modern gradient alan.
  - "Bugunku odagin hazir" satiri eklendi.
  - "Gunluk plan" chip'i eklendi.
  - Profil balonu `TouchableOpacity` oldu.
  - Profil balonuna basinca `router.push('/profile')` ile Profil sekmesine gidiyor.
- Ders quizleri 4 kartlik alani yenilendi:
  - 2x2 grid daha belirgin hale getirildi.
  - Her ders icin renkli arka plan tonu, ikon kutusu, durum rozeti ve aksiyon oku eklendi.
  - Ders kartlarinda artik `5 soru • 27 unite` gibi metin kullaniliyor.
  - Alttaki sayac etiketi `soru` yerine `unite` olarak degisti.

### `assets/culture-card-bg.png`

Genel kultur karti icin sakin, daha az renkli bir gorsel eklendi.

Bu gorsel kullaniliyor:

```tsx
const CULTURE_CARD_IMAGE = require('../../assets/culture-card-bg.png');
```

Kart icinde:

```tsx
<Image source={CULTURE_CARD_IMAGE} style={styles.cultureImage} resizeMode="cover" />
```

## Guncel Ana Ekran Mantigi

Ana ekranin ust akisi su sekilde:

1. Header
2. Varsa streak/freeze uyarilari
3. Ana feature kartlari:
   - Gunluk 10 Soru
   - Genel Kultur Sorulari
4. Tekrar zamani karti, gerekiyorsa
5. Ilk hafta gorevleri, gerekiyorsa
6. Ders Quizleri 2x2 grid
7. Konu Anlatimi
8. Tekrar / Yanlislarim Defteri
9. Gunun Bilgisi

## Dikkat Edilecek Noktalar

- Kullanici build istemedi; bu surecte production build alinmadi.
- Sadece TypeScript kontrolu calistirildi:

```bash
npx tsc --noEmit
```

- Bu komut son kontrollerde hatasiz gecti.
- Simulatorde gorsel kontroller yapildi.
- Expo icin proje talimati cok onemli:

```text
Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.
```

Yeni kod yazmadan once bu talimata dikkat et.

## Kullanici Ile Alinan UI Kararlari

- Genel kultur bolumu ayri altta durmak yerine "Genel Kultur Sorulari" kartinin icinde toplandi.
- Genel kultur gorseli icin once daha renkli secenekler dusunuldu, sonra daha sakin ve az renkli bir sanat/kitap/palet kompozisyonu secildi.
- `Testler` butonu mor ve belirgin yapildi.
- Gunluk quiz kartinin beyaz bos gorunen ust alani mor gradient hero bandina cevrildi.
- Quiz hero bandi ilk basta kucuk kaldi; sonra kultur gorseliyle ayni yukseklik ritmine getirildi.
- Header daha duzenli hale getirildi.
- Profil balonu tiklanabilir hale getirildi ve simulator icinde Profil sekmesine gittigi dogrulandi.
- Ders quizleri kartlari daha canli hale getirildi.
- Kart metninde `KPSS soru alani` / `sinavda soru` gibi ifade yerine `unite` kullanilmasina karar verildi.

## Son Bilinen Gorsel Durum

Ana ekranda kullanici en son ders kartlarindaki metni begendi:

- `5 soru • 27 unite`
- altta `27 unite`

Kartlar:

- Tarih
- Cografya
- Vatandaslik
- Guncel

Her biri renkli, ikonlu, basla/tamam rozetli ve sag altta ok/check aksiyonlu.

## Ileride Yapilabilecek Kucuk Iyilestirmeler

Kullanici isterse su noktalarda devam edilebilir:

- Header biraz daha kisa veya daha premium hale getirilebilir.
- Ders kartlarindaki unite sayilari gercek konu sayilarina baglanabilir. Su an mevcut `exam` degeri gorselde unite gibi kullaniliyor.
- "Ilk Hafta Gorevleri" karti da yeni ana ekran stiline uyacak sekilde modernlestirilebilir.
- `Konu Anlatimi` satirlari yeni ders kartlariyla daha uyumlu hale getirilebilir.
- Profil ekraninin UI'i de ana ekran kalitesine yaklastirilabilir.

## Teknik Not

`CATEGORIES` icindeki alanlar su an soyle:

```tsx
{ key, label, color, icon, iconName, exam }
```

`exam` ismi artik UI'da unite gibi gosteriliyor. Daha temiz bir refactor istenirse `exam` alani `unitCount` gibi yeniden adlandirilabilir. Simdilik kapsam dar tutuldu, mevcut veri yapisi bozulmadi.

