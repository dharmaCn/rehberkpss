// KPSS Genel Kültür - Tarih konu anlatımları (seviyeli kart formatı)
// Her ünite Kolay / Orta / Zor seviyelerine ayrılmıştır.
// Her seviyenin kendi hap bilgi kartları ve soru havuzu vardır.
// Quiz oturumlarında havuzdan rastgele 5 soru çekilir (her sefer farklı).

export type TopicLevel = 'kolay' | 'orta' | 'zor';

export interface TopicQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  aciklama?: string;
}

export interface TopicLevelContent {
  cards: string[];
  questions: TopicQuestion[];
}

export interface Topic {
  id: string;
  subject: 'tarih';
  title: string;
  icon: string;
  summary: string;
  levels: Record<TopicLevel, TopicLevelContent>;
}

const EMPTY_LEVEL: TopicLevelContent = { cards: [], questions: [] };

export const LEVEL_LABELS: Record<TopicLevel, string> = {
  kolay: 'Kolay',
  orta: 'Orta',
  zor: 'Zor',
};

export const LEVEL_DESCRIPTIONS: Record<TopicLevel, string> = {
  kolay: 'Temel bilgiler, isimler ve önemli tarihler',
  orta: 'Sebep-sonuç ilişkileri ve detaylar',
  zor: 'İnce ayrıntılar, yorum ve sık karıştırılan noktalar',
};

export const LEVEL_COLORS: Record<TopicLevel, string> = {
  kolay: '#10B981',
  orta: '#F59E0B',
  zor: '#EF4444',
};

export const TOPICS: Topic[] = [
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 't01',
    subject: 'tarih',
    title: 'İslamiyet Öncesi Türk Tarihi',
    icon: '🏹',
    summary: 'Hunlar, Göktürkler, Uygurlar ve ilk Türk devletlerinin kültürü.',
    levels: {
      kolay: {
        cards: [
          'Türklerin ana yurdu Orta Asya\'dır.',
          'Bilinen ilk Türk devleti Asya (Büyük) Hun Devleti\'dir.',
          'Asya Hun Devleti en güçlü dönemini Mete Han zamanında yaşamıştır.',
          'Mete Han, orduyu onluk (10\'lu) sisteme göre düzenlemiştir.',
          'Çin Seddi, Türk (Hun) akınlarını durdurmak için inşa edilmiştir.',
          'Avrupa Hunları\'nın en ünlü hükümdarı Attila\'dır.',
          'Kavimler Göçü 375 yılında gerçekleşmiştir.',
          'I. Göktürk Devleti\'ni Bumin Kağan kurmuştur.',
          '"Türk" adını devlet ismi olarak kullanan ilk Türk devleti Göktürklerdir.',
          'Türk tarihinin ilk yazılı belgeleri Orhun (Göktürk) Yazıtları\'dır.',
          'Orhun Yazıtları\'nın ilgili kişileri: Bilge Kağan, Kül Tigin ve Tonyukuk.',
          'Yerleşik hayata geçen ilk Türk topluluğu Uygurlar\'dır.',
          'Uygurlar Mani ve Buda dinlerini benimsemiştir.',
          'İlk Türklerde Gök Tanrı inancı yaygındı.',
          'Sözlü hukuk kurallarına Türklerde "töre" denir.',
        ],
        questions: [
          {
            question: 'Bilinen ilk Türk devleti aşağıdakilerden hangisidir?',
            options: ['Göktürkler', 'Asya Hunları', 'Uygurlar', 'Avrupa Hunları'],
            correctIndex: 1,
            aciklama: 'Bilinen ilk Türk devleti Asya (Büyük) Hun Devleti\'dir.',
          },
          {
            question: 'Orduyu onluk sisteme göre düzenleyen Türk hükümdarı kimdir?',
            options: ['Bilge Kağan', 'Bumin Kağan', 'Mete Han', 'Attila'],
            correctIndex: 2,
            aciklama: 'Onluk (10\'lu) sistemi Mete Han kurmuştur.',
          },
          {
            question: 'Çin Seddi hangi amaçla inşa edilmiştir?',
            options: ['Ticareti korumak', 'Türk (Hun) akınlarını durdurmak', 'Moğolları engellemek', 'Tarım alanı oluşturmak'],
            correctIndex: 1,
            aciklama: 'Çin Seddi Hun akınlarını durdurmak için yapılmıştır.',
          },
          {
            question: 'Avrupa Hunları\'nın en ünlü hükümdarı kimdir?',
            options: ['Mete Han', 'Attila', 'Bumin Kağan', 'Bilge Kağan'],
            correctIndex: 1,
            aciklama: 'Avrupa Hunları\'nın en ünlü hükümdarı Attila\'dır.',
          },
          {
            question: '"Türk" adını devlet ismi olarak kullanan ilk Türk devleti hangisidir?',
            options: ['Asya Hunları', 'I. Göktürk Devleti', 'Uygurlar', 'Karahanlılar'],
            correctIndex: 1,
            aciklama: 'I. Göktürk Devleti "Türk" adını devlet ismi olarak kullanan ilk Türk devletidir.',
          },
          {
            question: 'Türk tarihinin ilk yazılı belgeleri aşağıdakilerden hangisidir?',
            options: ['Orhun Yazıtları', 'Kutadgu Bilig', 'Divânü Lugâti\'t-Türk', 'Siyasetname'],
            correctIndex: 0,
            aciklama: 'Orhun (Göktürk) Yazıtları Türk tarihinin ilk yazılı belgeleridir.',
          },
          {
            question: 'Yerleşik hayata geçen ilk Türk topluluğu hangisidir?',
            options: ['Göktürkler', 'Hunlar', 'Uygurlar', 'Karahanlılar'],
            correctIndex: 2,
            aciklama: 'Uygurlar yerleşik hayata geçen ilk Türk topluluğudur.',
          },
          {
            question: 'I. Göktürk Devleti\'nin kurucusu kimdir?',
            options: ['Bumin Kağan', 'Kutluk Kağan', 'Bilge Kağan', 'Tonyukuk'],
            correctIndex: 0,
            aciklama: 'I. Göktürk Devleti\'ni Bumin Kağan kurmuştur.',
          },
          {
            question: 'Kavimler Göçü hangi tarihte gerçekleşmiştir?',
            options: ['476', '375', '751', '395'],
            correctIndex: 1,
            aciklama: 'Kavimler Göçü 375 yılında gerçekleşmiştir.',
          },
          {
            question: 'İlk Türklerde sözlü hukuk kurallarına ne ad verilir?',
            options: ['Töre', 'Kut', 'Kurultay', 'Yargu'],
            correctIndex: 0,
            aciklama: 'İlk Türklerde sözlü hukuk kurallarına "töre" denirdi.',
          },
        ],
      },
      orta: {
        cards: [
          'Türkleri göçe zorlayan başlıca nedenler: kuraklık, nüfus artışı, otlak yetersizliği, salgın hastalıklar ve boylar arası mücadelelerdir.',
          'Mete Han\'ın onluk sistemi sonraki Türk ve dünya ordularına model olmuştur.',
          'Asya Hun Devleti Çin entrikaları ve iç karışıklıklarla Doğu ve Batı Hunları olarak ikiye ayrılmıştır.',
          'Kavimler Göçü\'nün sonuçları: Roma\'nın ikiye ayrılması, Batı Roma\'nın yıkılması, Avrupa\'da feodalitenin doğması.',
          'Kavimler Göçü, İlk Çağ\'ın sonu ve Orta Çağ\'ın başlangıcı kabul edilir.',
          'I. Göktürk Devleti bir süre Çin egemenliğinde kaldıktan sonra Kutluk Kağan II. Göktürk (Kutluk) Devleti\'ni kurmuştur.',
          'Orhun Yazıtları "Türk" adının geçtiği ilk Türkçe metinlerdir.',
          'Uygurların Mani-Buda dinlerini kabulü, savaşçılık özelliklerini zayıflatmıştır.',
          'Uygurlar 18 harfli kendi alfabelerini kullanmış, matbaa ve hareketli harf tekniğinde önemli işler yapmıştır.',
          'Türk minyatür sanatının ilk örnekleri Uygurlara aittir.',
          'İlk Türklerde "kut" anlayışı: yönetme yetkisinin Tanrı tarafından hükümdara verildiği inancıdır.',
          'İlk Türklerde ülke hanedanın ortak malı sayılırdı; bu anlayış sık sık taht kavgalarına yol açtı.',
          'Halk, boylar hâlinde örgütlenmişti; konargöçer (yarı göçebe) yaşam, hayvancılık ve at öne çıkardı.',
          'Gök Tanrı inancında ölümden sonraki hayata inanılır, mezarlara "balbal" denilen taşlar dikilirdi.',
          'Kurultay (toy), devlet işlerinin görüşüldüğü meclistir.',
        ],
        questions: [
          {
            question: 'Kavimler Göçü\'nün sonuçları arasında aşağıdakilerden hangisi yer almaz?',
            options: ['Roma\'nın ikiye ayrılması', 'Batı Roma\'nın yıkılması', 'Feodalitenin doğması', 'İslamiyet\'in Avrupa\'ya yayılması'],
            correctIndex: 3,
            aciklama: 'İslamiyet, Kavimler Göçü\'nden sonra (7. yy) doğmuştur; bu sonuç göçle ilgili değildir.',
          },
          {
            question: 'Kavimler Göçü hangi olayın başlangıcı kabul edilir?',
            options: ['İlk Çağ', 'Orta Çağ', 'Yeni Çağ', 'Yakın Çağ'],
            correctIndex: 1,
            aciklama: 'Kavimler Göçü (375) Orta Çağ\'ın başlangıcı sayılır.',
          },
          {
            question: '"Kut" anlayışı aşağıdakilerden hangisini ifade eder?',
            options: [
              'Töre kurallarını',
              'Yönetme yetkisinin Tanrı tarafından hükümdara verildiği inancını',
              'Toprak mülkiyeti sistemini',
              'Boyların birleşmesini',
            ],
            correctIndex: 1,
            aciklama: 'Kut, yönetme yetkisinin Tanrı tarafından hükümdara verildiği inancıdır.',
          },
          {
            question: 'Ülkenin hanedanın ortak malı sayılması anlayışının en önemli sonucu nedir?',
            options: ['Yazılı hukukun gelişmesi', 'Sık sık taht kavgalarının yaşanması', 'Boyların güçlenmesi', 'Yerleşik hayata geçilmesi'],
            correctIndex: 1,
            aciklama: 'Bu anlayış kardeşler arası taht kavgalarına yol açmıştır.',
          },
          {
            question: 'Türk minyatür sanatının ilk örnekleri hangi Türk devletine aittir?',
            options: ['Hunlar', 'Göktürkler', 'Uygurlar', 'Karahanlılar'],
            correctIndex: 2,
            aciklama: 'Türk minyatür sanatının ilk örnekleri Uygurlara aittir.',
          },
          {
            question: 'Uygurların savaşçılık özelliklerinin zayıflamasında en etkili olan etken aşağıdakilerden hangisidir?',
            options: [
              'Yazılı kültüre geçmeleri',
              'Mani ve Buda dinlerini kabul etmeleri',
              'Çin\'le ticaret yapmaları',
              'Atalpasını terk etmeleri',
            ],
            correctIndex: 1,
            aciklama: 'Mani ve Buda dinlerini benimsemek savaşçılık özelliklerini zayıflatmıştır.',
          },
          {
            question: 'Mezarlara "balbal" taşı dikme geleneği hangi Türk inancıyla ilişkilidir?',
            options: ['Mani', 'Buda', 'Gök Tanrı', 'Şamanizm dışı totem inancı'],
            correctIndex: 2,
            aciklama: 'Balbal dikme geleneği Gök Tanrı inancı ve ölümden sonraki hayata inanışla ilgilidir.',
          },
          {
            question: 'Aşağıdakilerden hangisi Türkleri Orta Asya\'dan göçe zorlayan nedenler arasında yer almaz?',
            options: ['Kuraklık', 'Nüfus artışı', 'Çin Seddi\'nin yıkılması', 'Boylar arası mücadeleler'],
            correctIndex: 2,
            aciklama: 'Çin Seddi\'nin yıkılması göç nedenlerinden değildir; diğer üçü temel sebeplerdir.',
          },
          {
            question: 'Asya Hun Devleti\'nin Doğu ve Batı Hunları olarak ikiye ayrılmasının başlıca nedeni nedir?',
            options: ['İslamiyet\'in yayılması', 'Çin entrikaları ve iç karışıklıklar', 'Roma\'nın saldırıları', 'Kuraklık'],
            correctIndex: 1,
            aciklama: 'Çin entrikaları ve iç karışıklıklar Asya Hun Devleti\'ni böldü.',
          },
          {
            question: 'Devlet işlerinin görüşüldüğü, ilk Türklerde önemli bir meclis olan kurum aşağıdakilerden hangisidir?',
            options: ['Kurultay (Toy)', 'Divan-ı Hümayun', 'Şura', 'Meclis-i Mebusan'],
            correctIndex: 0,
            aciklama: 'Kurultay (toy), ilk Türk devletlerinde devlet işlerinin görüşüldüğü meclistir.',
          },
        ],
      },
      zor: {
        cards: [
          'Türklerin ana yurdu Orta Asya\'nın sınırları: batıda Hazar Denizi, doğuda Kingan Dağları, kuzeyde Sibirya, güneyde Himalaya Dağları.',
          'Mete Han Çince kaynaklarda "Mo-tun" olarak geçer.',
          'Hun-Çin mücadelesinde imzalanan "Hohanyeh Antlaşması" Çin\'in Hunlara vergi vermeyi sürdürmesini sağlamıştır.',
          'I. Göktürk Devleti, Bumin Kağan\'ın kardeşi İstemi Yabgu tarafından batıda yönetilmiştir; bu çift yönetim Türk devletlerinde "ikili teşkilat"a örnektir.',
          'I. Göktürk Devleti, Sasanilerle ittifak kurarak Akhunları (Eftalitleri) yıkmıştır.',
          'II. Göktürk (Kutluk) Devleti\'nin önemli devlet adamı Tonyukuk\'tur; Bilge Kağan ve Kül Tigin döneminde devlet zirveye çıkmıştır.',
          'Orhun Yazıtları\'nı 1893\'te Danimarkalı Vilhelm Thomsen okumuştur.',
          'Uygurlar Türk tarihinde ilk kez "kâğıt" ve "matbaa" tekniğini geliştirmiştir.',
          'Uygur alfabesi sonraki dönemde Moğollar ve Mançular tarafından da kullanılmıştır.',
          'Avrupa Hunları, Galya seferinde 451 Katalon Savaşı\'nda Romalılar ve Vizigotlarla karşılaşmıştır.',
          'Avarlar, "üzengiyi" Avrupa\'ya tanıtan Türk topluluğudur.',
          'Hazarlar, Museviliği benimseyen tek Türk devleti olarak bilinir.',
          'Bulgarlar ikiye ayrılmıştır: Tuna Bulgarları Hristiyanlığı (Ortodoksluk), İtil (Volga) Bulgarları İslamiyet\'i kabul etmiştir.',
          'Peçenekler 1071 Malazgirt Savaşı\'nda Bizans saflarından Selçuklu tarafına geçmiştir; bu savaşın seyrini etkilemiştir.',
          'Türgişler, parayı kullanan ilk Türk devleti olarak bilinir (Baga Tarkan dönemi).',
        ],
        questions: [
          {
            question: 'Orhun Yazıtları\'nı 1893 yılında çözen Danimarkalı bilim adamı kimdir?',
            options: ['Wilhelm Radloff', 'Vilhelm Thomsen', 'Bartold', 'Strahlenberg'],
            correctIndex: 1,
            aciklama: 'Orhun Yazıtları\'nı 1893\'te Danimarkalı Vilhelm Thomsen okumuştur.',
          },
          {
            question: 'Aşağıdaki Türk devletlerinden hangisi Museviliği benimsemiştir?',
            options: ['Avarlar', 'Hazarlar', 'Peçenekler', 'Karluklar'],
            correctIndex: 1,
            aciklama: 'Hazarlar Museviliği benimseyen tek Türk devleti olarak bilinir.',
          },
          {
            question: 'Üzengiyi Avrupa\'ya tanıtan Türk topluluğu aşağıdakilerden hangisidir?',
            options: ['Hunlar', 'Avarlar', 'Bulgarlar', 'Hazarlar'],
            correctIndex: 1,
            aciklama: 'Avarlar, üzengiyi Avrupa\'ya tanıtan Türk topluluğudur.',
          },
          {
            question: 'Avrupa Hunları\'nın Romalı ve Vizigot ittifakıyla karşılaştığı, Galya\'da yapılan savaş aşağıdakilerden hangisidir?',
            options: ['Manzikert', 'Katalon (451)', 'Adrianapolis', 'Niğbolu'],
            correctIndex: 1,
            aciklama: 'Katalon Savaşı (451), Attila döneminde Galya\'da yapılmış; Roma-Vizigot ittifakıyla Hunlar arasında geçmiştir.',
          },
          {
            question: 'I. Göktürk Devleti\'nin Akhunları (Eftalitleri) yıkmak için ittifak kurduğu devlet aşağıdakilerden hangisidir?',
            options: ['Bizans', 'Sasani İmparatorluğu', 'Çin', 'Roma'],
            correctIndex: 1,
            aciklama: 'I. Göktürk Devleti Sasanilerle ittifak kurarak Akhunları yıkmıştır.',
          },
          {
            question: 'Tuna Bulgarları aşağıdaki dinlerden hangisini benimsemiştir?',
            options: ['İslamiyet', 'Musevilik', 'Hristiyanlık (Ortodoksluk)', 'Mani'],
            correctIndex: 2,
            aciklama: 'Tuna Bulgarları Hristiyanlığı (Ortodoksluk), İtil Bulgarları ise İslamiyet\'i kabul etmiştir.',
          },
          {
            question: 'Parayı kullanan ilk Türk devleti aşağıdakilerden hangisi olarak bilinir?',
            options: ['Hunlar', 'Türgişler', 'Hazarlar', 'Avarlar'],
            correctIndex: 1,
            aciklama: 'Türgişler (Baga Tarkan dönemi), parayı kullanan ilk Türk devleti kabul edilir.',
          },
          {
            question: 'Bumin Kağan\'ın kardeşi olup Göktürklerin batı kanadını yöneten kişi kimdir?',
            options: ['Mukan Kağan', 'İstemi Yabgu', 'Tonyukuk', 'Kül Tigin'],
            correctIndex: 1,
            aciklama: 'İstemi Yabgu, Bumin Kağan\'ın kardeşi olup Göktürklerin batı kanadını yönetmiştir; bu ikili teşkilatın bir örneğidir.',
          },
          {
            question: '1071 Malazgirt Savaşı\'nda Bizans saflarından Selçuklu tarafına geçen Türk topluluğu aşağıdakilerden hangisidir?',
            options: ['Peçenekler', 'Kumanlar (Kıpçaklar)', 'Oğuzlar', 'Uzlar'],
            correctIndex: 0,
            aciklama: 'Peçenekler Malazgirt\'te Bizans saflarından Selçukluya geçerek savaşın seyrini etkilemiştir.',
          },
          {
            question: 'II. Göktürk (Kutluk) Devleti\'nde devletin zirvede olduğu dönemde önemli rol oynayan vezir kimdir?',
            options: ['Tonyukuk', 'Nizamülmülk', 'Bilge Tonyukuk\'un torunu', 'İlteriş'],
            correctIndex: 0,
            aciklama: 'Tonyukuk, II. Göktürk (Kutluk) Devleti\'nin en ünlü devlet adamı ve vezirdir.',
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  {
    id: 't02',
    subject: 'tarih',
    title: 'İlk Türk-İslam Devletleri',
    icon: '☪️',
    summary: 'Karahanlılar, Gazneliler ve Büyük Selçuklu Devleti.',
    levels: {
      kolay: {
        cards: [
          'Talas Savaşı 751 yılında yapılmıştır.',
          'Talas Savaşı\'nda Türkler, Çinlilere karşı Müslüman Arapların yanında yer almıştır.',
          'İslamiyet\'i kabul eden ilk Türk devleti Karahanlılar\'dır.',
          'Karahanlılarda İslamiyet\'i resmî din yapan hükümdar Satuk Buğra Han\'dır.',
          'Karahanlılarda resmî dil Türkçe idi.',
          'Kutadgu Bilig\'i Yusuf Has Hacib yazmıştır.',
          'Divânü Lugâti\'t-Türk\'ü Kaşgarlı Mahmud yazmıştır.',
          '"Sultan" unvanını kullanan ilk Türk hükümdarı Gazneli Mahmud\'dur.',
          'Gazneli Mahmud, Hindistan\'a 17 sefer düzenlemiştir.',
          'Selçukluları kuran Türk boyu Oğuzların Kınık boyudur.',
          'Selçuklular Gaznelileri 1040 Dandanakan Savaşı\'nda yenmiştir.',
          'Büyük Selçukluları Tuğrul ve Çağrı Beyler kurmuştur.',
          'Malazgirt Savaşı 1071 yılında yapılmıştır.',
          'Malazgirt Savaşı\'nda Bizans\'ı Alparslan yenmiştir.',
          'Büyük Selçuklu Devleti en parlak dönemini Melikşah zamanında yaşamıştır.',
        ],
        questions: [
          {
            question: 'İslamiyet\'i kabul eden ilk Türk devleti hangisidir?',
            options: ['Gazneliler', 'Karahanlılar', 'Selçuklular', 'Uygurlar'],
            correctIndex: 1,
            aciklama: 'Karahanlılar İslamiyet\'i kabul eden ilk Türk devletidir.',
          },
          {
            question: 'Talas Savaşı kaç yılında yapılmıştır?',
            options: ['751', '1040', '1071', '1176'],
            correctIndex: 0,
            aciklama: 'Talas Savaşı 751 yılında yapılmıştır.',
          },
          {
            question: '"Sultan" unvanını kullanan ilk Türk hükümdarı kimdir?',
            options: ['Tuğrul Bey', 'Gazneli Mahmud', 'Alparslan', 'Melikşah'],
            correctIndex: 1,
            aciklama: 'Sultan unvanını kullanan ilk Türk hükümdarı Gazneli Mahmud\'dur.',
          },
          {
            question: 'Kutadgu Bilig\'in yazarı kimdir?',
            options: ['Kaşgarlı Mahmud', 'Yusuf Has Hacib', 'Nizamülmülk', 'Ahmet Yesevi'],
            correctIndex: 1,
            aciklama: 'Kutadgu Bilig\'i Yusuf Has Hacib yazmıştır.',
          },
          {
            question: 'Divânü Lugâti\'t-Türk\'ün yazarı kimdir?',
            options: ['Yusuf Has Hacib', 'Kaşgarlı Mahmud', 'Edip Ahmet', 'Hoca Ahmet Yesevi'],
            correctIndex: 1,
            aciklama: 'Divânü Lugâti\'t-Türk\'ü Kaşgarlı Mahmud yazmıştır.',
          },
          {
            question: 'Malazgirt Savaşı kaç yılında yapılmıştır?',
            options: ['1040', '1071', '1176', '1243'],
            correctIndex: 1,
            aciklama: 'Malazgirt Savaşı 1071 yılında yapılmıştır.',
          },
          {
            question: 'Malazgirt Savaşı\'nda Bizans\'ı yenen Selçuklu hükümdarı kimdir?',
            options: ['Tuğrul Bey', 'Alparslan', 'Melikşah', 'Sencer'],
            correctIndex: 1,
            aciklama: 'Malazgirt\'te Bizans\'ı yenen Selçuklu hükümdarı Alparslan\'dır.',
          },
          {
            question: 'Büyük Selçukluları kuran Türk boyu hangisidir?',
            options: ['Kayı', 'Kınık', 'Avşar', 'Bayat'],
            correctIndex: 1,
            aciklama: 'Büyük Selçukluları Oğuzların Kınık boyu kurmuştur.',
          },
          {
            question: 'Selçukluların Gaznelileri yenerek bağımsızlığını kazandığı savaş hangisidir?',
            options: ['Talas', 'Dandanakan', 'Malazgirt', 'Pasinler'],
            correctIndex: 1,
            aciklama: '1040 Dandanakan Savaşı\'yla Selçuklular Gaznelileri yenip bağımsız oldu.',
          },
          {
            question: 'Karahanlılarda İslamiyet\'i resmî din yapan hükümdar kimdir?',
            options: ['Bilge Kül Kadir Han', 'Satuk Buğra Han', 'Yusuf Kadir Han', 'Tabgaç Buğra Han'],
            correctIndex: 1,
            aciklama: 'Karahanlılarda İslamiyet\'i resmî din yapan Satuk Buğra Han\'dır.',
          },
        ],
      },
      orta: {
        cards: [
          'Talas Savaşı\'nın sonuçları: Orta Asya\'nın Çinlileşmesi engellendi, Türk-Müslüman yakınlaşması başladı, kâğıt İslam dünyasına yayıldı.',
          'Karahanlılar Türk dilini ve kültürünü koruyan tek Türk-İslam devleti olarak öne çıkar.',
          'İlk Türk-İslam medreseleri, kervansaraylar ve ribatlar Karahanlılar tarafından yapılmıştır.',
          'Gazneliler\'in Karahanlılar kadar millî kalamamasının nedeni; Türk, Fars, Hint ve Arap karışık nüfus yapısıdır.',
          'Tuğrul Bey, Abbasi halifesini Şii Büveyhoğullarından kurtarınca "Doğu ve Batı\'nın Sultanı" ilan edildi.',
          'Malazgirt Zaferi Anadolu\'nun kapılarını Türklere açmış; Anadolu\'nun "tapu senedi" sayılır.',
          'Büyük Selçuklu Devleti en geniş sınırlarına Melikşah döneminde ulaşmıştır.',
          'Vezir Nizamülmülk Nizamiye Medreselerini kurmuş ve Siyasetname\'yi yazmıştır.',
          'Büyük Selçuklu Devleti\'nin yıkılışında: taht kavgaları, Haçlı Seferleri ve Batıni (Hasan Sabbah) faaliyetleri etkili olmuştur.',
          'Selçuklular, Katvan Savaşı\'nda Karahitaylılara yenilmesiyle dağılış sürecine girmiştir.',
          'Karahanlılar zamanında Türk-İslam edebiyatının temel eserleri olan Kutadgu Bilig, Divânü Lugâti\'t-Türk, Atabetü\'l-Hakayık ve Divan-ı Hikmet yazılmıştır.',
          'Atabetü\'l-Hakayık\'ı Edip Ahmet Yükneki, Divan-ı Hikmet\'i Hoca Ahmet Yesevi yazmıştır.',
          'Gazneliler Hindistan\'da İslamiyet\'in yayılmasını sağlamış; Sultan unvanı ilk kez bu dönemde kullanılmıştır.',
          'Selçuklularda "ikta sistemi" uygulanmış; toprak askeri ve idari görevlilere dağıtılmıştır.',
          'Selçuklularda "Atabeylik" sistemiyle şehzadelerin eğitimi ve yönetim deneyimi sağlanmıştır.',
        ],
        questions: [
          {
            question: 'Talas Savaşı\'nın aşağıdaki sonuçlarından hangisi yanlıştır?',
            options: [
              'Türk-Müslüman yakınlaşması başlamıştır',
              'Orta Asya\'nın Çinlileşmesi engellenmiştir',
              'Kâğıt Çin dışına yayılmıştır',
              'Anadolu\'nun kapıları Türklere açılmıştır',
            ],
            correctIndex: 3,
            aciklama: 'Anadolu\'nun kapıları 1071 Malazgirt Savaşı\'yla açılmıştır; Talas\'la ilgili değildir.',
          },
          {
            question: 'Aşağıdakilerden hangisi Karahanlılar dönemine ait bir eser değildir?',
            options: ['Kutadgu Bilig', 'Divânü Lugâti\'t-Türk', 'Siyasetname', 'Atabetü\'l-Hakayık'],
            correctIndex: 2,
            aciklama: 'Siyasetname Büyük Selçuklu veziri Nizamülmülk tarafından yazılmıştır.',
          },
          {
            question: 'Gazneliler\'in Karahanlılar gibi millî kalamamasının temel nedeni nedir?',
            options: [
              'Türkçenin yasaklanması',
              'Karma (Türk-Fars-Hint-Arap) nüfus yapısı',
              'Sınırlarının dar olması',
              'Müslüman olmamaları',
            ],
            correctIndex: 1,
            aciklama: 'Karma nüfus yapısı millî karakterin korunmasını zorlaştırmıştır.',
          },
          {
            question: 'Tuğrul Bey\'in "Doğu ve Batı\'nın Sultanı" ilan edilmesinin nedeni nedir?',
            options: [
              'Hindistan seferleri',
              'Halifeyi Şii Büveyhoğullarından kurtarması',
              'Bizans\'ı yenmesi',
              'Anadolu\'yu fethetmesi',
            ],
            correctIndex: 1,
            aciklama: 'Tuğrul Bey, Abbasi halifesini Büveyhoğullarından kurtarınca bu unvanı almıştır.',
          },
          {
            question: 'Malazgirt Zaferi\'nin Türk tarihindeki en önemli sonucu nedir?',
            options: [
              'İstanbul\'un fethi',
              'Anadolu\'nun Türklere açılması',
              'Karahanlıların yıkılması',
              'Selçukluların bağımsızlığı',
            ],
            correctIndex: 1,
            aciklama: 'Malazgirt, Anadolu\'nun kapılarını Türklere açan zaferdir; bu nedenle "tapu senedi" sayılır.',
          },
          {
            question: 'Nizamiye Medreselerini kuran Büyük Selçuklu veziri kimdir?',
            options: ['Alparslan', 'Nizamülmülk', 'Tuğrul Bey', 'Sencer'],
            correctIndex: 1,
            aciklama: 'Nizamiye Medreselerini Vezir Nizamülmülk kurmuştur.',
          },
          {
            question: 'Aşağıdakilerden hangisi Büyük Selçuklu Devleti\'nin yıkılışında etkili olmamıştır?',
            options: ['Taht kavgaları', 'Haçlı Seferleri', 'Batıni faaliyetleri', 'Kavimler Göçü'],
            correctIndex: 3,
            aciklama: 'Kavimler Göçü Selçuklulardan çok önce gerçekleşmiştir; yıkılışla ilgisi yoktur.',
          },
          {
            question: 'Aşağıdaki eser-yazar eşleştirmelerinden hangisi yanlıştır?',
            options: [
              'Kutadgu Bilig - Yusuf Has Hacib',
              'Divânü Lugâti\'t-Türk - Kaşgarlı Mahmud',
              'Atabetü\'l-Hakayık - Edip Ahmet Yükneki',
              'Divan-ı Hikmet - Ali Şir Nevai',
            ],
            correctIndex: 3,
            aciklama: 'Divan-ı Hikmet\'i Hoca Ahmet Yesevi yazmıştır; Ali Şir Nevai çok daha sonraki bir Çağatay edebiyatı şairidir.',
          },
          {
            question: 'Selçuklularda toprağın askerî ve idari görevlilere dağıtıldığı sistem hangisidir?',
            options: ['İkta', 'Tımar', 'Pençik', 'Vakıf'],
            correctIndex: 0,
            aciklama: 'Selçuklularda toprak yönetimi "ikta sistemi" ile yapılırdı.',
          },
          {
            question: 'Selçuklularda şehzadelerin eğitimi ve yönetim deneyimi kazanması için uygulanan sistem hangisidir?',
            options: ['Atabeylik', 'Pençik', 'Devşirme', 'Sancağa Çıkma'],
            correctIndex: 0,
            aciklama: 'Atabeylik sistemi, şehzadelerin yanına deneyimli yönetici (atabey) vererek eğitim sağlardı.',
          },
        ],
      },
      zor: {
        cards: [
          'Türkler ile Araplar arasındaki ilk doğrudan komşuluk Hz. Ömer döneminde Kafkasya seferlerinde başlamıştır.',
          'Karahanlıların ikiye ayrılması (Doğu - Batı Karahanlı) 1042\'de gerçekleşmiştir.',
          'Karahanlı hükümdarı Yusuf Kadir Han döneminde Karahanlılar Büyük Selçuklulara bağlanmıştır.',
          'Karahanlılarda yapılan ilk büyük kervansaray Ribat-ı Melik\'tir.',
          'Gazneli Mahmud Hindistan seferlerinde Somnath Tapınağı\'nı yıkmasıyla ünlüdür.',
          'Gazneliler ile Karahanlılar arasındaki sınır Ceyhun (Amuderya) Nehri\'dir.',
          'Tuğrul Bey 1055\'te Bağdat\'a girerek Abbasi halifesini Büveyhoğullarından kurtarmıştır.',
          'Alparslan, Malazgirt\'ten önce 1064\'te Ani şehrini alarak Bizans\'a karşı önemli bir mevki kazanmıştır.',
          'Malazgirt Savaşı\'nda Bizans imparatoru Romen Diyojen (Romanos IV) esir düşmüştür.',
          'Nizamülmülk\'ün öldürülmesi (1092) Hasan Sabbah\'ın fedaileri tarafından yapılmış, Selçuklu çöküşünü hızlandırmıştır.',
          'Sultan Sencer 1141 Katvan Savaşı\'nda Karahitaylılara yenilmiştir.',
          'Karahitaylar Müslüman olmayan, Budist bir Moğol-Türk karışımı devlettir.',
          'Büyük Selçuklu Devleti yıkılınca dört "atabeylik" devlet kurulmuştur: Salgurlular (Fars), Zengiler (Musul-Halep), Beğteginliler (Erbil), İldenizliler (Azerbaycan).',
          'Selçuklularda "Melik" unvanı şehzadeler için kullanılırdı; "Sultan" ise hükümdar unvanıdır.',
          'İlk Türk-İslam mimarisinde "kümbet" (anıt mezar) ve "türbe" geleneği bu dönemde gelişmiştir.',
        ],
        questions: [
          {
            question: 'Türkler ile Araplar arasındaki ilk doğrudan komşuluk hangi dönemde başlamıştır?',
            options: ['Hz. Ebubekir', 'Hz. Ömer', 'Hz. Osman', 'Hz. Ali'],
            correctIndex: 1,
            aciklama: 'Hz. Ömer döneminde Kafkasya seferleriyle Türkler ve Araplar ilk kez komşu olmuştur.',
          },
          {
            question: 'Sultan Sencer 1141\'de hangi savaşta Karahitaylılara yenilmiştir?',
            options: ['Dandanakan', 'Pasinler', 'Katvan', 'Mercidabık'],
            correctIndex: 2,
            aciklama: '1141 Katvan Savaşı, Selçukluların Karahitaylılara yenildiği savaştır; Selçukluların dağılış sürecini hızlandırmıştır.',
          },
          {
            question: 'Malazgirt Savaşı\'nda esir düşen Bizans imparatoru kimdir?',
            options: ['Manuel Komnenos', 'Romen Diyojen', 'I. Aleksios', 'I. İoannis'],
            correctIndex: 1,
            aciklama: 'Malazgirt\'te (1071) Bizans imparatoru Romen Diyojen (Romanos IV) esir düşmüştür.',
          },
          {
            question: 'Tuğrul Bey\'in Bağdat\'a girerek halifeyi Büveyhoğullarından kurtardığı yıl aşağıdakilerden hangisidir?',
            options: ['1040', '1048', '1055', '1071'],
            correctIndex: 2,
            aciklama: 'Tuğrul Bey 1055\'te Bağdat\'a girerek halifeyi kurtarmıştır.',
          },
          {
            question: 'Vezir Nizamülmülk\'ün 1092\'de öldürülmesinden sorumlu olan grup hangisidir?',
            options: ['Bizans casusları', 'Hasan Sabbah\'ın fedaileri (Batıniler)', 'Karahitaylar', 'Gazneli ajanları'],
            correctIndex: 1,
            aciklama: 'Nizamülmülk Hasan Sabbah\'ın Batıni fedaileri tarafından öldürülmüştür.',
          },
          {
            question: 'Karahanlılar Doğu ve Batı olmak üzere kaç yılında ikiye ayrılmıştır?',
            options: ['1040', '1042', '1071', '1077'],
            correctIndex: 1,
            aciklama: 'Karahanlılar 1042\'de Doğu ve Batı Karahanlı olarak ikiye ayrılmıştır.',
          },
          {
            question: 'Aşağıdaki atabeyliklerden hangisi Musul-Halep bölgesinde kurulmuştur?',
            options: ['Salgurlular', 'Zengiler', 'Beğteginliler', 'İldenizliler'],
            correctIndex: 1,
            aciklama: 'Zengiler Musul-Halep bölgesinde kurulan atabeyliktir.',
          },
          {
            question: 'Selçuklularda hükümdar dışındaki şehzadelere verilen unvan aşağıdakilerden hangisidir?',
            options: ['Bey', 'Melik', 'Atabey', 'Vali'],
            correctIndex: 1,
            aciklama: 'Selçuklularda "Melik" unvanı şehzadeler için kullanılır; "Sultan" ise hükümdar unvanıdır.',
          },
          {
            question: 'Alparslan, Malazgirt\'ten önce 1064\'te aşağıdaki şehirlerden hangisini almıştır?',
            options: ['Antakya', 'Edessa (Urfa)', 'Ani', 'Trabzon'],
            correctIndex: 2,
            aciklama: 'Alparslan 1064\'te Bizans\'ın önemli sınır kalesi Ani\'yi almıştır.',
          },
          {
            question: 'Karahitaylar dini açıdan aşağıdaki gruplardan hangisine mensuptur?',
            options: ['Müslüman', 'Hristiyan', 'Budist', 'Mani'],
            correctIndex: 2,
            aciklama: 'Karahitaylar Budist bir Moğol-Türk karışımı devlettir; Selçukluları Katvan\'da yenmişlerdir.',
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  {
    id: 't03',
    subject: 'tarih',
    title: 'Türkiye (Anadolu) Selçuklu Devleti ve Beylikler',
    icon: '🏰',
    summary: 'Anadolu\'nun Türkleşmesi, Anadolu Selçukluları ve beylikler.',
    levels: {
      kolay: {
        cards: [
          'Türkiye Selçuklu Devleti\'ni Süleyman Şah kurmuştur.',
          'Türkiye Selçuklularının ilk başkenti İznik\'tir.',
          'Haçlı Seferleri nedeniyle başkent Konya\'ya taşınmıştır.',
          'Miryokefalon Savaşı 1176 yılında yapılmıştır.',
          'Miryokefalon Savaşı\'nda Bizans\'ı II. Kılıç Arslan yenmiştir.',
          'Miryokefalon Savaşı sonrası Anadolu kesin olarak Türk yurdu olmuştur.',
          'Kösedağ Savaşı 1243 yılında yapılmıştır.',
          'Kösedağ Savaşı\'nda Türkiye Selçukluları Moğollara (İlhanlılara) yenilmiştir.',
          'Anadolu\'da kurulan ilk Türk beylikleri: Danişmentliler, Saltuklular, Mengücekliler, Artuklular.',
          'Türkçeyi 1277\'de resmî dil ilan eden bey Karamanoğlu Mehmet Bey\'dir.',
          'Türkiye Selçukluları kervan yolları üzerine kervansaraylar yapmıştır.',
          'Türkiye Selçukluları ilk devlet sigortası uygulamasını başlatmıştır.',
          'I. Alâeddin Keykubad döneminde Alanya ve Sinop alınmıştır.',
          'Osmanoğulları, Kösedağ sonrası kurulan ikinci dönem beyliklerden biridir.',
          'Türkiye Selçukluları dönemi Anadolu\'nun en parlak imar dönemlerinden biridir.',
        ],
        questions: [
          {
            question: 'Türkiye Selçuklu Devleti\'nin kurucusu kimdir?',
            options: ['Tuğrul Bey', 'Süleyman Şah', 'II. Kılıç Arslan', 'Alâeddin Keykubad'],
            correctIndex: 1,
            aciklama: 'Türkiye Selçuklu Devleti\'ni Süleyman Şah kurmuştur.',
          },
          {
            question: 'Türkiye Selçuklularının ilk başkenti aşağıdakilerden hangisidir?',
            options: ['Konya', 'İznik', 'Bursa', 'Sivas'],
            correctIndex: 1,
            aciklama: 'Türkiye Selçuklularının ilk başkenti İznik\'tir.',
          },
          {
            question: 'Miryokefalon Savaşı kaç yılında yapılmıştır?',
            options: ['1071', '1176', '1243', '1453'],
            correctIndex: 1,
            aciklama: 'Miryokefalon Savaşı 1176\'da yapılmıştır.',
          },
          {
            question: 'Anadolu\'nun kesin olarak Türk yurdu olduğunun belgesi sayılan savaş hangisidir?',
            options: ['Malazgirt', 'Miryokefalon', 'Kösedağ', 'Pasinler'],
            correctIndex: 1,
            aciklama: '1176 Miryokefalon Savaşı, Anadolu\'nun kesin olarak Türk yurdu olduğunun belgesidir.',
          },
          {
            question: 'Kösedağ Savaşı\'nda Türkiye Selçukluları kime yenilmiştir?',
            options: ['Bizans', 'Moğollar (İlhanlılar)', 'Haçlılar', 'Memlükler'],
            correctIndex: 1,
            aciklama: 'Kösedağ\'da Türkiye Selçukluları Moğollara (İlhanlılara) yenilmiştir.',
          },
          {
            question: 'Türkçeyi 1277\'de resmî dil ilan eden Türk beyi kimdir?',
            options: ['Osman Bey', 'Karamanoğlu Mehmet Bey', 'Germiyanoğlu', 'Aydınoğlu'],
            correctIndex: 1,
            aciklama: '1277\'de Türkçeyi resmî dil ilan eden Karamanoğlu Mehmet Bey\'dir.',
          },
          {
            question: 'Aşağıdakilerden hangisi Anadolu\'da kurulan ilk Türk beyliklerinden biri değildir?',
            options: ['Danişmentliler', 'Saltuklular', 'Karamanoğulları', 'Artuklular'],
            correctIndex: 2,
            aciklama: 'Karamanoğulları, Kösedağ sonrası kurulan ikinci dönem beyliklerdendir.',
          },
          {
            question: 'I. Alâeddin Keykubad döneminde alınan liman şehirleri hangileridir?',
            options: ['İzmir ve Bursa', 'Alanya ve Sinop', 'Edirne ve Selanik', 'Trabzon ve Samsun'],
            correctIndex: 1,
            aciklama: 'I. Alâeddin Keykubad döneminde Alanya (Akdeniz) ve Sinop (Karadeniz) alınmıştır.',
          },
          {
            question: 'Türkiye Selçukluları başkentini İznik\'ten Konya\'ya neden taşımıştır?',
            options: ['Moğol istilası', 'Haçlı Seferleri', 'Bizans saldırıları', 'İç karışıklıklar'],
            correctIndex: 1,
            aciklama: 'Başkent Haçlı Seferleri nedeniyle Konya\'ya taşınmıştır.',
          },
          {
            question: 'Miryokefalon Savaşı\'nı kazanan Türkiye Selçuklu hükümdarı kimdir?',
            options: ['Süleyman Şah', 'II. Kılıç Arslan', 'I. Mesut', 'I. Gıyaseddin Keyhüsrev'],
            correctIndex: 1,
            aciklama: 'Miryokefalon Savaşı\'nı (1176) II. Kılıç Arslan kazanmıştır.',
          },
        ],
      },
      orta: {
        cards: [
          'İlk Türk beylikleri Anadolu\'yu cami, medrese, han ve köprülerle imar ederek Türkleşmesini sağlamıştır.',
          'Türkiye Selçukluları, Antalya, Alanya ve Sinop limanlarını alarak ilk Türk donanmasını ve deniz ticaretini geliştirmiştir.',
          'Türkiye Selçuklularında kervansaraylar, tüccarların güvenli konaklaması için ücretsiz hizmet verirdi.',
          'Türkiye Selçukluları, tüccarın zararını karşılayan ilk devlet sigortasını uygulamıştır.',
          'Yassı Çimen Savaşı\'nda I. Alâeddin Keykubad Harzemşahları yenmiştir (1230).',
          'Kösedağ Savaşı sonrası Anadolu Türk birliği bozulmuş ve ikinci kez beylikler kurulmuştur.',
          'İkinci dönem beylikleri: Osmanoğulları, Karamanoğulları, Germiyanoğulları, Aydınoğulları, Karesioğulları, Menteşeoğulları vb.',
          'Karamanoğulları, Selçuklunun varisi olduğunu iddia ederek Türk birliğini kurmaya çalışmıştır.',
          'Aydınoğulları döneminde Umur Bey ile güçlü bir donanma kurulmuş ve Ege\'de hâkimiyet sağlanmıştır.',
          'Türkiye Selçukluları döneminde Mevlana, Yunus Emre ve Hacı Bektaş Veli gibi mutasavvıflar yetişmiştir.',
          'Anadolu Selçuklularında kullanılan para birimi "akçe"den önce "dirhem" idi.',
          'Anadolu\'da Türk-İslam mimarisinin önemli eserleri Konya Alâeddin Camii, Sivas Çifte Minareli Medrese ve Erzurum Çifte Minareli Medrese\'dir.',
          'I. Gıyaseddin Keyhüsrev döneminde Antalya alınarak Akdeniz\'e açılım sağlanmıştır.',
          'Kösedağ Savaşı sonrası Anadolu, İlhanlı (Moğol) hâkimiyetinde kalmıştır.',
          'II. Mesut\'un ölümüyle (1308) Türkiye Selçuklu Devleti resmen sona ermiştir.',
        ],
        questions: [
          {
            question: 'İlk Türk beyliklerinin Anadolu tarihindeki en önemli işlevi nedir?',
            options: [
              'Bizans\'ı yıkmaları',
              'Anadolu\'yu cami, medrese ve hanlarla Türkleştirmeleri',
              'Haçlı Seferlerini başlatmaları',
              'Selçukluları kurmaları',
            ],
            correctIndex: 1,
            aciklama: 'İlk Türk beylikleri Anadolu\'yu mimari eserlerle imar ederek Türkleştirmiştir.',
          },
          {
            question: 'Aşağıdakilerden hangisi Türkiye Selçukluları döneminin özelliklerinden değildir?',
            options: [
              'Kervansaraylar yapılması',
              'Donanmanın geliştirilmesi',
              'İstanbul\'un fethedilmesi',
              'Ticaret yollarının denetlenmesi',
            ],
            correctIndex: 2,
            aciklama: 'İstanbul 1453\'te Osmanlı tarafından fethedilmiştir; Türkiye Selçuklularıyla ilgili değildir.',
          },
          {
            question: 'Tüccarın zararını karşılayan, ilk devlet sigortası kabul edilen uygulama hangi devlete aittir?',
            options: ['Karahanlılar', 'Büyük Selçuklular', 'Türkiye Selçukluları', 'Osmanlılar'],
            correctIndex: 2,
            aciklama: 'İlk devlet sigortası Türkiye Selçukluları döneminde uygulanmıştır.',
          },
          {
            question: 'Aşağıdakilerden hangisi Kösedağ Savaşı sonrası kurulan beyliklerden biri değildir?',
            options: ['Osmanoğulları', 'Germiyanoğulları', 'Aydınoğulları', 'Artuklular'],
            correctIndex: 3,
            aciklama: 'Artuklular ilk dönem (Malazgirt sonrası) beyliklerdendir.',
          },
          {
            question: 'Kösedağ Savaşı\'nın en önemli sonucu aşağıdakilerden hangisidir?',
            options: [
              'Anadolu Türk birliği bozuldu',
              'İstanbul fethedildi',
              'Karahanlılar yıkıldı',
              'Bizans güçlendi',
            ],
            correctIndex: 0,
            aciklama: 'Kösedağ Savaşı sonrası Türkiye Selçukluları zayıflamış ve Anadolu\'da Türk siyasi birliği bozulmuştur.',
          },
          {
            question: 'I. Alâeddin Keykubad\'ın Harzemşahları yendiği savaş aşağıdakilerden hangisidir?',
            options: ['Kösedağ', 'Yassı Çimen', 'Miryokefalon', 'Malazgirt'],
            correctIndex: 1,
            aciklama: 'Yassı Çimen Savaşı\'nda (1230) I. Alâeddin Keykubad Harzemşahları yenmiştir.',
          },
          {
            question: 'Türkiye Selçukluları döneminde güçlü donanmasıyla Ege\'de hâkimiyet sağlayan beylik hangisidir?',
            options: ['Karamanoğulları', 'Germiyanoğulları', 'Aydınoğulları (Umur Bey dönemi)', 'Saltuklular'],
            correctIndex: 2,
            aciklama: 'Aydınoğulları, özellikle Umur Bey döneminde güçlü donanmasıyla Ege\'de hâkim olmuştur.',
          },
          {
            question: 'Selçukluların varisi olduğunu iddia ederek Anadolu Türk birliğini kurmaya çalışan beylik hangisidir?',
            options: ['Karamanoğulları', 'Aydınoğulları', 'Germiyanoğulları', 'Saltuklular'],
            correctIndex: 0,
            aciklama: 'Karamanoğulları, Selçukluların varisi olduğunu iddia ederek Türk birliğini kurmaya çalışmıştır.',
          },
          {
            question: 'Türkiye Selçuklu Devleti resmen hangi olayla sona ermiştir?',
            options: [
              'Miryokefalon Savaşı',
              'Kösedağ Savaşı',
              'II. Mesut\'un ölümü (1308)',
              'Yassı Çimen Savaşı',
            ],
            correctIndex: 2,
            aciklama: 'Türkiye Selçuklu Devleti II. Mesut\'un ölümüyle (1308) resmen sona ermiştir.',
          },
          {
            question: 'Türkiye Selçukluları döneminde Anadolu\'da yaşayan ünlü mutasavvıflar arasında aşağıdakilerden hangisi yer almaz?',
            options: ['Mevlana', 'Yunus Emre', 'Hacı Bektaş Veli', 'Ahmet Yesevi'],
            correctIndex: 3,
            aciklama: 'Hoca Ahmet Yesevi, Türkiye Selçukluları döneminden önce Yesi\'de yaşamış Karahanlı/Selçuklu dönemi mutasavvıfıdır.',
          },
        ],
      },
      zor: {
        cards: [
          'Süleyman Şah, Türkiye Selçuklu Devleti\'ni 1075\'te kurmuştur ve İznik\'i başkent yapmıştır.',
          'I. Haçlı Seferi (1096-1099) Türkiye Selçuklularına büyük zarar vermiş, İznik kaybedilmiştir.',
          'I. Mesut döneminde başkent kesin olarak Konya\'ya taşınmıştır.',
          'II. Kılıç Arslan ülkeyi 11 oğluna paylaştırarak iç karışıklıklara yol açmıştır.',
          'Karatay Han ve Sultan Han, Anadolu\'daki en görkemli Selçuklu kervansaraylarıdır.',
          'I. Gıyaseddin Keyhüsrev döneminde 1207\'de Antalya alınmış; ilk Türk Akdeniz limanı olmuştur.',
          'I. İzzeddin Keykavus döneminde 1214\'te Sinop alınarak Karadeniz\'e açılım sağlanmıştır.',
          'Kösedağ Savaşı\'nda Anadolu Selçuklu hükümdarı II. Gıyaseddin Keyhüsrev\'di.',
          'Kösedağ Savaşı sonrası Anadolu, Baycu Noyan komutasındaki Moğol-İlhanlı kontrolüne girmiştir.',
          'Türkiye Selçuklularının kullandığı dil resmî olarak Farsça idi; halk Türkçe konuşurdu.',
          'Karamanoğulları, başkenti Karaman (Larende) olan ve Türkçeyi devlet dili yapan tek beyliktir.',
          'Karesioğulları Beyliği\'nin Osmanlılar tarafından alınması, Osmanlı donanmasının temelini oluşturmuştur (1345).',
          'Anadolu\'da kurulan Trabzon Rum İmparatorluğu Bizans değil, Komnenos hanedanı tarafından kurulmuş bir Hristiyan devlettir.',
          'Eretnaoğulları ve Kadı Burhaneddin Devleti, Kösedağ sonrası Orta Anadolu\'da kurulmuş önemli güçlerdir.',
          'Memlüklerle yapılan Elbistan Savaşı\'nda (1277) Sultan Baybars Moğolları yenmiş, ancak Anadolu\'da kalıcı olamamıştır.',
        ],
        questions: [
          {
            question: 'Türkiye Selçuklu Devleti hangi yılda kurulmuştur?',
            options: ['1040', '1071', '1075', '1086'],
            correctIndex: 2,
            aciklama: 'Türkiye Selçuklu Devleti Süleyman Şah tarafından 1075\'te İznik\'te kurulmuştur.',
          },
          {
            question: 'I. Haçlı Seferi sonrası Türkiye Selçukluları aşağıdaki şehirlerden hangisini kaybetmiştir?',
            options: ['Konya', 'İznik', 'Sivas', 'Antalya'],
            correctIndex: 1,
            aciklama: 'I. Haçlı Seferi sonrası başkent İznik kaybedilmiş ve Konya başkent yapılmıştır.',
          },
          {
            question: 'Kösedağ Savaşı\'nda Türkiye Selçuklularını yöneten sultan kimdir?',
            options: ['I. Alâeddin Keykubad', 'II. Gıyaseddin Keyhüsrev', 'IV. Kılıç Arslan', 'II. Mesut'],
            correctIndex: 1,
            aciklama: 'Kösedağ Savaşı\'nda (1243) Türkiye Selçuklularını II. Gıyaseddin Keyhüsrev yönetmekteydi.',
          },
          {
            question: 'Türkiye Selçuklularında ilk Türk Akdeniz limanı olarak kabul edilen Antalya kaç yılında alınmıştır?',
            options: ['1176', '1207', '1214', '1230'],
            correctIndex: 1,
            aciklama: 'I. Gıyaseddin Keyhüsrev döneminde Antalya 1207\'de alınmıştır.',
          },
          {
            question: 'Sinop hangi Türkiye Selçuklu hükümdarı döneminde alınarak Karadeniz\'e açılım sağlanmıştır?',
            options: ['I. Mesut', 'II. Kılıç Arslan', 'I. İzzeddin Keykavus', 'I. Alâeddin Keykubad'],
            correctIndex: 2,
            aciklama: 'Sinop 1214\'te I. İzzeddin Keykavus döneminde alınmıştır.',
          },
          {
            question: 'Kösedağ Savaşı sonrası Anadolu\'da kalıcı hâkimiyet kuran Moğol komutanı kimdir?',
            options: ['Cengiz Han', 'Hülagu', 'Baycu Noyan', 'Timur'],
            correctIndex: 2,
            aciklama: 'Kösedağ sonrası Anadolu, Baycu Noyan komutasındaki Moğol-İlhanlı kontrolüne girmiştir.',
          },
          {
            question: 'Aşağıdakilerden hangisi Türkiye Selçuklularının resmî dilidir?',
            options: ['Türkçe', 'Arapça', 'Farsça', 'Soğdca'],
            correctIndex: 2,
            aciklama: 'Türkiye Selçuklularının resmî dili Farsça idi; halk Türkçe konuşurdu.',
          },
          {
            question: 'Osmanlı donanmasının temelini oluşturan beylik aşağıdakilerden hangisidir?',
            options: ['Karamanoğulları', 'Aydınoğulları', 'Karesioğulları', 'Germiyanoğulları'],
            correctIndex: 2,
            aciklama: 'Karesioğulları Beyliği\'nin 1345\'te alınmasıyla Osmanlı ilk donanmaya sahip olmuştur.',
          },
          {
            question: 'Memlük Sultanı Baybars\'ın 1277\'de Moğolları yendiği Anadolu\'daki savaş aşağıdakilerden hangisidir?',
            options: ['Kösedağ', 'Pasinler', 'Elbistan', 'Yassı Çimen'],
            correctIndex: 2,
            aciklama: '1277 Elbistan Savaşı\'nda Memlük Sultanı Baybars Moğolları yenmiştir.',
          },
          {
            question: 'Kösedağ sonrası Orta Anadolu\'da Sivas merkezli kurulan ve Kadı Burhaneddin tarafından yönetilen devlet aşağıdakilerden hangisidir?',
            options: ['Eretnaoğulları', 'Kadı Burhaneddin Devleti', 'Dulkadiroğulları', 'Ramazanoğulları'],
            correctIndex: 1,
            aciklama: 'Kadı Burhaneddin Devleti, Kösedağ sonrası Sivas merkezli kurulan bir Türk devletidir.',
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  {
    id: 't04',
    subject: 'tarih',
    title: 'Osmanlı Kuruluş Dönemi',
    icon: '⚔️',
    summary: 'Osmanlı\'nın kuruluşu, ilk padişahlar ve devletleşme süreci.',
    levels: {
      kolay: {
        cards: [
          'Osmanlı Devleti, Oğuzların Kayı boyuna mensuptur.',
          'Osmanlı Devleti 1299\'da Osman Bey tarafından kurulmuştur.',
          'Osmanlıların ilk merkezi Söğüt\'tür.',
          'Orhan Bey döneminde Bursa alınarak başkent yapılmıştır.',
          'Yeniçeri Ocağı I. Murad döneminde kurulmuştur.',
          'Osmanlılar Rumeli\'ye ilk kez Çimpe Kalesi\'nin alınmasıyla (1353) geçmiştir.',
          'I. Murad, I. Kosova Savaşı\'nın ardından şehit edilen ilk Osmanlı padişahıdır.',
          'I. Kosova Savaşı 1389 yılında yapılmıştır.',
          'Niğbolu Savaşı 1396 yılında Yıldırım Bayezid tarafından kazanılmıştır.',
          'Ankara Savaşı 1402 yılında yapılmıştır.',
          'Ankara Savaşı\'nda Yıldırım Bayezid Timur\'a yenilmiştir.',
          'Fetret Devri\'ni I. Mehmed (Çelebi Mehmed) kazanmıştır.',
          'Çelebi Mehmed "Osmanlı Devleti\'nin ikinci kurucusu" sayılır.',
          'Varna Savaşı 1444, II. Kosova Savaşı 1448\'de yapılmıştır.',
          'Osmanlı Kuruluş Dönemi 1453\'te İstanbul\'un Fethi ile sona ermiştir.',
        ],
        questions: [
          {
            question: 'Osmanlı Devleti hangi Oğuz boyuna mensuptur?',
            options: ['Kınık', 'Kayı', 'Bayat', 'Avşar'],
            correctIndex: 1,
            aciklama: 'Osmanlı Devleti Oğuzların Kayı boyuna mensuptur.',
          },
          {
            question: 'Osmanlı Devleti\'nin ilk merkezi aşağıdakilerden hangisidir?',
            options: ['Söğüt', 'Bursa', 'Edirne', 'İstanbul'],
            correctIndex: 0,
            aciklama: 'Osmanlıların ilk merkezi Söğüt\'tür.',
          },
          {
            question: 'Bursa hangi padişah döneminde alınarak başkent yapılmıştır?',
            options: ['Osman Bey', 'Orhan Bey', 'I. Murad', 'Yıldırım Bayezid'],
            correctIndex: 1,
            aciklama: 'Bursa Orhan Bey döneminde alınarak başkent yapılmıştır.',
          },
          {
            question: 'Yeniçeri Ocağı hangi padişah döneminde kurulmuştur?',
            options: ['Osman Bey', 'Orhan Bey', 'I. Murad', 'Yıldırım Bayezid'],
            correctIndex: 2,
            aciklama: 'Yeniçeri Ocağı I. Murad döneminde kurulmuştur.',
          },
          {
            question: 'Osmanlılar Rumeli\'ye ilk kez hangi kalenin alınmasıyla geçmiştir?',
            options: ['Niğbolu', 'Çimpe', 'Edirne', 'Varna'],
            correctIndex: 1,
            aciklama: 'Çimpe Kalesi\'nin 1353\'te alınmasıyla Osmanlı Rumeli\'ye geçmiştir.',
          },
          {
            question: 'Ankara Savaşı kaç yılında yapılmıştır?',
            options: ['1389', '1396', '1402', '1444'],
            correctIndex: 2,
            aciklama: 'Ankara Savaşı 1402 yılında yapılmıştır.',
          },
          {
            question: 'Ankara Savaşı\'nda Yıldırım Bayezid\'i yenen hükümdar kimdir?',
            options: ['Timur', 'Cengiz Han', 'Hülagu', 'Hulagu'],
            correctIndex: 0,
            aciklama: 'Ankara Savaşı\'nda Yıldırım Bayezid, Timur\'a yenilmiş ve esir düşmüştür.',
          },
          {
            question: 'Fetret Devri\'ni kazanarak Osmanlı\'nın "ikinci kurucusu" sayılan padişah kimdir?',
            options: ['I. Mehmed (Çelebi)', 'II. Murad', 'II. Mehmed (Fatih)', 'Yıldırım Bayezid'],
            correctIndex: 0,
            aciklama: 'Fetret Devri\'ni I. Mehmed (Çelebi Mehmed) kazanarak Osmanlı\'nın ikinci kurucusu sayılır.',
          },
          {
            question: 'Niğbolu Savaşı\'nı kazanan Osmanlı padişahı kimdir?',
            options: ['I. Murad', 'Yıldırım Bayezid', 'I. Mehmed', 'II. Murad'],
            correctIndex: 1,
            aciklama: 'Niğbolu Savaşı\'nı (1396) Yıldırım Bayezid kazanmıştır.',
          },
          {
            question: 'Osmanlı Kuruluş Dönemi hangi olayla sona erer?',
            options: [
              'Ankara Savaşı (1402)',
              'I. Kosova Savaşı (1389)',
              'İstanbul\'un Fethi (1453)',
              'Niğbolu Savaşı (1396)',
            ],
            correctIndex: 2,
            aciklama: 'Osmanlı Kuruluş Dönemi 1453\'te İstanbul\'un Fethi ile sona ermiştir.',
          },
        ],
      },
      orta: {
        cards: [
          'Osmanlı Beyliği\'nin Bizans sınırında uç bölgede olması, gaza-cihat anlayışıyla genişlemesini ve Türkmen göçlerini çekmesini sağlamıştır.',
          'Osman Bey döneminde Koyunhisar Savaşı\'nda Bizans yenilmiştir (1302).',
          'Orhan Bey döneminde ilk Osmanlı medresesi (İznik), ilk düzenli ordu (yaya ve müsellem) ve ilk vakıf teşkilatı kurulmuştur.',
          'Karesioğulları Beyliği\'nin alınmasıyla (1345) Osmanlı ilk donanmaya sahip olmuştur.',
          'İskân (şenlendirme) politikası ile Anadolu\'dan Türkmenler getirilerek fethedilen bölgelere yerleştirilmiş, Balkanlar Türkleştirilmiştir.',
          'I. Murad döneminde Acemi Oğlanlar Ocağı ve "Pençik Sistemi" uygulanmıştır.',
          'Pençik Sistemi: savaş esirlerinin beşte birinin asker yetiştirilmek üzere alınmasıdır.',
          'I. Murad döneminde Sırpsındığı ve I. Kosova savaşlarıyla Balkan Haçlı ittifakları yenilmiştir.',
          'I. Murad döneminde "ülke hanedanın ortak malıdır" anlayışından "ülke padişah ve oğullarının malıdır" anlayışına geçilmiştir.',
          'Yıldırım Bayezid, Anadolu Türk birliğini büyük ölçüde sağlamış ve İstanbul\'u kuşatmıştır.',
          'Ankara Savaşı\'nın sonuçları: Anadolu Türk birliği bozuldu, İstanbul\'un fethi gecikti, Fetret Devri başladı.',
          'Fetret Devri (1402-1413) Yıldırım Bayezid\'in oğulları arasındaki taht mücadelesi dönemidir.',
          'II. Murad döneminde 1444 Varna ve 1448 II. Kosova savaşlarıyla Balkan Haçlı tehlikesi bertaraf edilmiştir.',
          'Edirne, II. Murad döneminden itibaren Avrupa\'ya yönelik seferlerin merkezi olmuş ve Bursa\'nın yerine başkent olarak gelişmiştir.',
          'II. Murad\'ın 1444\'te tahtı oğlu II. Mehmed\'e bırakması, Edirne-Segedin Antlaşması\'na yol açan iç karışıklıklara neden olmuştur.',
        ],
        questions: [
          {
            question: 'Osmanlı\'nın Bizans sınırında uç beyliği olarak konumlanmasının en önemli avantajı nedir?',
            options: [
              'Daha az vergi vermesi',
              'Türkmen göçlerini ve gazileri çekmesi',
              'Moğol baskısından korunması',
              'Karadeniz ticaretine hâkim olması',
            ],
            correctIndex: 1,
            aciklama: 'Uç beyliği konumu Osmanlı\'ya gaza-cihat anlayışıyla Türkmen göçlerini ve gazileri çekme avantajı sağlamıştır.',
          },
          {
            question: 'Aşağıdakilerden hangisi Orhan Bey döneminde gerçekleşmemiştir?',
            options: [
              'Bursa\'nın alınması',
              'İlk düzenli ordunun kurulması',
              'İlk Osmanlı medresesinin açılması',
              'Yeniçeri Ocağı\'nın kurulması',
            ],
            correctIndex: 3,
            aciklama: 'Yeniçeri Ocağı, Orhan Bey döneminde değil, I. Murad döneminde kurulmuştur.',
          },
          {
            question: 'Osmanlı\'nın ilk donanmaya sahip olduğu olay aşağıdakilerden hangisidir?',
            options: [
              'Bursa\'nın alınması',
              'Karesioğulları Beyliği\'nin alınması',
              'Çimpe Kalesi\'nin alınması',
              'Niğbolu Savaşı',
            ],
            correctIndex: 1,
            aciklama: 'Karesioğulları\'nın alınmasıyla (1345) Osmanlı ilk donanmaya sahip olmuş, Rumeli\'ye geçişin zemini hazırlanmıştır.',
          },
          {
            question: 'Osmanlı\'nın fethettiği topraklara Anadolu\'dan Türkmenleri yerleştirdiği politikaya ne ad verilir?',
            options: ['Devşirme', 'İskân (şenlendirme)', 'Pençik', 'Tımar'],
            correctIndex: 1,
            aciklama: 'İskân (şenlendirme) politikası, Balkanların Türkleşmesini sağlamıştır.',
          },
          {
            question: '"Pençik Sistemi" nedir?',
            options: [
              'Toprağın askere dağıtılması',
              'Savaş esirlerinin beşte birinin asker yetiştirilmek üzere alınması',
              'Tüccarın zararının karşılanması',
              'Vergi toplama sistemi',
            ],
            correctIndex: 1,
            aciklama: 'Pençik Sistemi, savaş esirlerinin beşte birinin asker yetiştirilmek üzere alındığı sistemdir.',
          },
          {
            question: 'I. Kosova Savaşı\'nın ardından şehit edilen ilk Osmanlı padişahı kimdir?',
            options: ['Osman Bey', 'Orhan Bey', 'I. Murad', 'Yıldırım Bayezid'],
            correctIndex: 2,
            aciklama: 'I. Murad (Hüdavendigâr), 1389 I. Kosova Savaşı sonrası savaş alanını dolaşırken şehit edilmiştir.',
          },
          {
            question: 'I. Murad döneminde devlet yönetiminde gerçekleşen değişim aşağıdakilerden hangisidir?',
            options: [
              '"Ülke padişah ve oğullarının malıdır" anlayışına geçiş',
              'Halifeliğin alınması',
              'Tımar sisteminin kurulması',
              'Devşirme sisteminin başlaması',
            ],
            correctIndex: 0,
            aciklama: 'I. Murad döneminde "ülke hanedanın ortak malıdır" anlayışından "ülke padişah ve oğullarının malıdır" anlayışına geçilmiştir.',
          },
          {
            question: 'Ankara Savaşı\'nın sonuçları arasında aşağıdakilerden hangisi yer almaz?',
            options: [
              'Anadolu Türk birliği bozuldu',
              'İstanbul\'un fethi gecikti',
              'Fetret Devri başladı',
              'Yeniçeri Ocağı kapatıldı',
            ],
            correctIndex: 3,
            aciklama: 'Yeniçeri Ocağı 1826\'da II. Mahmud döneminde kaldırılmıştır; Ankara Savaşı\'yla ilgisi yoktur.',
          },
          {
            question: 'II. Murad döneminde Balkanlardaki Haçlı tehlikesi hangi savaşlarla bertaraf edilmiştir?',
            options: [
              'Niğbolu ve Ankara',
              'Varna ve II. Kosova',
              'Mohaç ve Otranto',
              'Çaldıran ve Mercidabık',
            ],
            correctIndex: 1,
            aciklama: 'II. Murad döneminde 1444 Varna ve 1448 II. Kosova Savaşları kazanılarak Haçlı tehlikesi bertaraf edilmiştir.',
          },
          {
            question: 'Fetret Devri kaç yıl sürmüştür?',
            options: ['9 yıl', '11 yıl', '13 yıl', '15 yıl'],
            correctIndex: 1,
            aciklama: 'Fetret Devri 1402-1413 arasında 11 yıl sürmüştür.',
          },
        ],
      },
      zor: {
        cards: [
          'Osman Bey\'in babası Ertuğrul Gazi, Söğüt-Domaniç bölgesini Türkiye Selçukluları\'ndan uç beyliği olarak almıştır.',
          'Osman Bey 1302 Koyunhisar (Bafeus) Savaşı\'nda Bizans\'ı yenmiş; bu Osmanlı\'nın bağımsızlığını perçinlemiştir.',
          'Orhan Bey döneminde Karesi Beyliği\'nin alınmasıyla beraber Hacı İlbey, Evrenos Bey, Süleyman Paşa gibi tecrübeli komutanlar Osmanlı hizmetine girmiştir.',
          'Süleyman Paşa, 1353\'te Çimpe Kalesi\'ni alarak Rumeli\'ye geçişi sağlamıştır; Tekirdağ yakınlarındaki bir kazada hayatını kaybetmiştir.',
          'Sırpsındığı Savaşı (1364), Edirne\'nin alınmasından (1361) sonra Haçlılarla yapılan ilk büyük zaferdir.',
          'I. Kosova Savaşı\'nda Sırp Kralı Lazar, Osmanlı imparatoru I. Murad\'ı şehit etmiştir; ardından Lazar idam edilmiştir.',
          'Yıldırım Bayezid 1391, 1395, 1396, 1397\'de dört kez İstanbul\'u kuşatmış ancak alamamıştır.',
          'Niğbolu Savaşı (1396) Macar Kralı Sigismund komutasındaki Haçlı ordusuna karşı kazanılmıştır.',
          'Ankara Savaşı\'nda Yıldırım Bayezid esir düşmüş ve 1403\'te esarette ölmüştür.',
          'Fetret Devri\'nde tahta geçen şehzadeler: Süleyman Çelebi (Edirne), İsa Çelebi (Bursa), Musa Çelebi (Rumeli), Mehmed Çelebi (Amasya).',
          'Şeyh Bedreddin İsyanı (1416) II. Murad döneminde değil, Çelebi Mehmed döneminde bastırılmıştır.',
          'Edirne-Segedin Antlaşması (1444), Osmanlı\'nın Macar Kralı I. Ulaszlo ile yaptığı ve Balkanlarda barışı amaçlayan antlaşmadır.',
          'Varna Savaşı\'nda (1444) Macar Kralı I. Ulaszlo ölmüş; Haçlılar büyük bir yenilgi almıştır.',
          'II. Kosova Savaşı\'nda (1448) Macar komutan Hunyadi Janos yenilmiş, Avrupa\'nın Balkanlardan Türkleri çıkarma umudu sona ermiştir.',
          'Bilecik\'in alınması (1299), Osmanlı\'nın bağımsızlık ilanı sayılan olaydır.',
        ],
        questions: [
          {
            question: 'Osman Bey\'in babası ve Söğüt-Domaniç bölgesini Selçuklulardan uç beyliği olarak alan kişi kimdir?',
            options: ['Süleyman Şah', 'Ertuğrul Gazi', 'Gündüz Alp', 'Bayhoca'],
            correctIndex: 1,
            aciklama: 'Osman Bey\'in babası Ertuğrul Gazi, Söğüt-Domaniç bölgesini uç beyliği olarak almıştır.',
          },
          {
            question: 'Osman Bey\'in 1302\'de Bizans\'ı yendiği savaş aşağıdakilerden hangisidir?',
            options: ['Koyunhisar (Bafeus)', 'Maltepe (Palekanon)', 'Sırpsındığı', 'I. Kosova'],
            correctIndex: 0,
            aciklama: '1302 Koyunhisar (Bafeus) Savaşı, Osman Bey\'in Bizans\'a karşı kazandığı zaferdir.',
          },
          {
            question: 'Çimpe Kalesi\'ni alarak Rumeli\'ye geçişi sağlayan Osmanlı şehzadesi kimdir?',
            options: ['Murad', 'Süleyman Paşa', 'Bayezid', 'Yakub'],
            correctIndex: 1,
            aciklama: 'Süleyman Paşa, Orhan Bey\'in oğlu olarak 1353\'te Çimpe Kalesi\'ni almıştır.',
          },
          {
            question: 'Yıldırım Bayezid İstanbul\'u kaç kez kuşatmıştır?',
            options: ['2', '3', '4', '5'],
            correctIndex: 2,
            aciklama: 'Yıldırım Bayezid 1391, 1395, 1396 ve 1397\'de İstanbul\'u dört kez kuşatmıştır.',
          },
          {
            question: 'Niğbolu Savaşı\'nda Haçlı ordusuna komuta eden Macar Kralı kimdir?',
            options: ['Hunyadi Janos', 'I. Ulaszlo', 'Sigismund', 'Lazar'],
            correctIndex: 2,
            aciklama: 'Niğbolu Savaşı\'nda (1396) Haçlı ordusuna Macar Kralı Sigismund komuta etmiştir.',
          },
          {
            question: 'Fetret Devri\'nde Edirne\'de tahta geçen Osmanlı şehzadesi kimdir?',
            options: ['Süleyman Çelebi', 'İsa Çelebi', 'Musa Çelebi', 'Mehmed Çelebi'],
            correctIndex: 0,
            aciklama: 'Fetret Devri\'nde Edirne\'de Süleyman Çelebi, Bursa\'da İsa, Rumeli\'de Musa, Amasya\'da Mehmed Çelebi tahta geçmiştir.',
          },
          {
            question: 'Şeyh Bedreddin İsyanı hangi padişah döneminde bastırılmıştır?',
            options: ['Yıldırım Bayezid', 'I. Mehmed (Çelebi)', 'II. Murad', 'II. Mehmed (Fatih)'],
            correctIndex: 1,
            aciklama: 'Şeyh Bedreddin İsyanı 1416\'da Çelebi Mehmed döneminde bastırılmıştır.',
          },
          {
            question: 'Varna Savaşı\'nda hayatını kaybeden Macar Kralı kimdir?',
            options: ['Sigismund', 'I. Ulaszlo', 'Hunyadi Janos', 'III. Bela'],
            correctIndex: 1,
            aciklama: 'Varna Savaşı\'nda (1444) Macar Kralı I. Ulaszlo hayatını kaybetmiştir.',
          },
          {
            question: 'II. Kosova Savaşı\'nda Osmanlılar tarafından yenilen Macar komutan kimdir?',
            options: ['I. Ulaszlo', 'Hunyadi Janos', 'Sigismund', 'Stefan Lazarević'],
            correctIndex: 1,
            aciklama: 'II. Kosova Savaşı\'nda (1448) Macar komutan Hunyadi Janos yenilmiştir.',
          },
          {
            question: 'Osmanlı\'nın bağımsızlık ilanı olarak kabul edilen olay aşağıdakilerden hangisidir?',
            options: [
              'Koyunhisar Savaşı (1302)',
              'Söğüt\'ün alınması',
              'Bilecik\'in alınması (1299)',
              'Bursa\'nın alınması (1326)',
            ],
            correctIndex: 2,
            aciklama: 'Bilecik\'in 1299\'da alınması, Osmanlı\'nın bağımsızlık ilanı sayılmaktadır.',
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // Diğer üniteler "Yakında"
  {
    id: 't05',
    subject: 'tarih',
    title: 'Osmanlı Yükselme Dönemi',
    icon: '👑',
    summary: 'İstanbul\'un Fethi\'nden Sokullu\'nun ölümüne kadar yükseliş.',
    levels: { kolay: EMPTY_LEVEL, orta: EMPTY_LEVEL, zor: EMPTY_LEVEL },
  },
  {
    id: 't06',
    subject: 'tarih',
    title: 'Osmanlı Duraklama, Gerileme ve Dağılma',
    icon: '📉',
    summary: 'Duraklama nedenleri, ıslahatlar ve dağılma süreci.',
    levels: { kolay: EMPTY_LEVEL, orta: EMPTY_LEVEL, zor: EMPTY_LEVEL },
  },
  {
    id: 't07',
    subject: 'tarih',
    title: 'Osmanlı Kültür ve Medeniyeti',
    icon: '🕌',
    summary: 'Devlet yönetimi, ordu, toprak sistemi, eğitim ve sanat.',
    levels: { kolay: EMPTY_LEVEL, orta: EMPTY_LEVEL, zor: EMPTY_LEVEL },
  },
  {
    id: 't08',
    subject: 'tarih',
    title: 'I. Dünya Savaşı ve Osmanlı',
    icon: '💣',
    summary: 'Savaşın nedenleri, Osmanlı cepheleri ve sonuçları.',
    levels: { kolay: EMPTY_LEVEL, orta: EMPTY_LEVEL, zor: EMPTY_LEVEL },
  },
  {
    id: 't09',
    subject: 'tarih',
    title: 'Kurtuluş Savaşı Hazırlık Dönemi',
    icon: '📜',
    summary: 'Cemiyetler, genelgeler, kongreler ve TBMM\'nin açılışı.',
    levels: { kolay: EMPTY_LEVEL, orta: EMPTY_LEVEL, zor: EMPTY_LEVEL },
  },
  {
    id: 't10',
    subject: 'tarih',
    title: 'Kurtuluş Savaşı Cepheleri ve Antlaşmalar',
    icon: '🎖️',
    summary: 'Doğu, Güney ve Batı cepheleri; muharebeler ve antlaşmalar.',
    levels: { kolay: EMPTY_LEVEL, orta: EMPTY_LEVEL, zor: EMPTY_LEVEL },
  },
  {
    id: 't11',
    subject: 'tarih',
    title: 'Atatürk İlkeleri ve İnkılapları',
    icon: '🇹🇷',
    summary: 'Siyasi, hukuki, sosyal inkılaplar ve altı ilke.',
    levels: { kolay: EMPTY_LEVEL, orta: EMPTY_LEVEL, zor: EMPTY_LEVEL },
  },
  {
    id: 't12',
    subject: 'tarih',
    title: 'Atatürk Dönemi Türk Dış Politikası',
    icon: '🤝',
    summary: 'Lozan sonrası dış politika, sorunlar ve antlaşmalar.',
    levels: { kolay: EMPTY_LEVEL, orta: EMPTY_LEVEL, zor: EMPTY_LEVEL },
  },
  {
    id: 't13',
    subject: 'tarih',
    title: 'Çağdaş Türk ve Dünya Tarihi',
    icon: '🌍',
    summary: 'II. Dünya Savaşı, Soğuk Savaş ve günümüz dünyası.',
    levels: { kolay: EMPTY_LEVEL, orta: EMPTY_LEVEL, zor: EMPTY_LEVEL },
  },
];

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

export function topicHasContent(t: Topic): boolean {
  return t.levels.kolay.cards.length > 0 || t.levels.orta.cards.length > 0 || t.levels.zor.cards.length > 0;
}

// Konunun belirli seviyesinden rastgele N soru seçer (her quiz oturumunda farklı set)
export function pickRandomLevelQuestions(level: TopicLevelContent, count = 5): TopicQuestion[] {
  if (!level.questions.length) return [];
  const shuffled = [...level.questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
