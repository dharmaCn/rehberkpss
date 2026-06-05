// KPSS Genel Kültür - Tarih konu anlatımları
// İlk 4 ünite tam içeriklidir; kalanlar yapı hazır olacak şekilde "yakında" durumundadır.

export interface TopicSection {
  heading: string;
  body: string;
}

export interface Topic {
  id: string;
  subject: 'tarih';
  title: string;
  icon: string;
  summary: string;
  readMinutes: number;
  sections: TopicSection[]; // boş ise "yakında" kabul edilir
}

export const TOPICS: Topic[] = [
  {
    id: 't01',
    subject: 'tarih',
    title: 'İslamiyet Öncesi Türk Tarihi',
    icon: '🏹',
    summary: 'Hunlar, Göktürkler, Uygurlar ve ilk Türk devletlerinin kültürü.',
    readMinutes: 6,
    sections: [
      {
        heading: 'Türklerin Ana Yurdu ve Göçler',
        body: 'Türklerin ana yurdu Orta Asya\'dır. Sınırları batıda Hazar Denizi, doğuda Kingan Dağları, kuzeyde Sibirya, güneyde Himalaya Dağları ile çevrilidir. İklim koşullarının ağırlaşması, kuraklık, nüfus artışı, otlak yetersizliği, salgın hastalıklar ve boylar arası mücadeleler Türkleri göçe zorlamıştır. Göçler sonucu Türkler dünyanın birçok bölgesine yayılmış ve gittikleri yerlere kendi kültürlerini taşımışlardır.',
      },
      {
        heading: 'Asya (Büyük) Hun Devleti',
        body: 'Bilinen ilk Türk devleti Asya Hun Devleti\'dir. En güçlü dönemini Mete Han (Mo-tun) zamanında yaşamıştır. Mete Han, orduyu onluk sisteme göre düzenlemiş (10\'lu sistem), bu sistem sonraki Türk ve dünya ordularına örnek olmuştur. Çinlilerin Türk akınlarına karşı Çin Seddi\'ni inşa etmesi Hunların gücünü gösterir. Devlet daha sonra Çin entrikaları ve iç karışıklıklarla zayıflayarak Doğu ve Batı Hunları olarak ikiye ayrılmıştır.',
      },
      {
        heading: 'Kavimler Göçü ve Avrupa Hunları',
        body: 'Batıya göç eden Hunların önünden kaçan kavimlerin Avrupa\'ya yayılması Kavimler Göçü\'ne (375) yol açtı. Bu göç, Roma İmparatorluğu\'nun ikiye ayrılmasına, ilerleyen süreçte Batı Roma\'nın yıkılmasına ve Avrupa\'da feodalite (derebeylik) düzeninin doğmasına neden oldu. Kavimler Göçü, İlk Çağ\'ın sonu, Orta Çağ\'ın başlangıcı kabul edilir. Avrupa Hunları\'nın en ünlü hükümdarı Attila\'dır.',
      },
      {
        heading: 'Göktürk (Kök Türk) Devleti',
        body: 'Bumin Kağan tarafından kurulan I. Göktürk Devleti, "Türk" adını devlet ismi olarak kullanan ilk Türk devletidir. Bir süre Çin egemenliğinde kaldıktan sonra Kutluk Kağan I I. Göktürk (Kutluk) Devleti\'ni kurmuştur. Bu dönemde Bilge Kağan, kardeşi Kül Tigin ve vezir Tonyukuk öne çıkar. Türk tarihinin ve edebiyatının ilk yazılı belgeleri olan Orhun (Göktürk) Yazıtları bu dönemde dikilmiştir; bu kitabeler Türk adının geçtiği ilk Türkçe metinlerdir.',
      },
      {
        heading: 'Uygurlar',
        body: 'Göktürklerin yıkılmasıyla Uygur Devleti kuruldu. Uygurlar yerleşik hayata geçen ilk Türk topluluğudur. Mani ve Buda dinlerini benimsemeleri savaşçılık özelliklerini zayıflatmıştır. 18 harfli Uygur alfabesini kullanmışlar, matbaa ve hareketli harf tekniğinde önemli işler yapmışlardır. Türk minyatür sanatının ilk örnekleri Uygurlara aittir.',
      },
      {
        heading: 'İlk Türklerde Kültür ve Medeniyet',
        body: 'Devlet yönetiminde "kut" anlayışı vardı: yönetme yetkisinin Tanrı tarafından hükümdara verildiğine inanılırdı. Ülke hanedanın ortak malı sayılırdı (bu anlayış taht kavgalarına yol açmıştır). Halk boylar hâlinde örgütlenmişti. Konargöçer (yarı göçebe) yaşam, hayvancılık ve at önemliydi. Yazılı hukuk yoktu; sözlü hukuk kuralları "töre" ile sağlanırdı. Gök Tanrı inancı yaygındı; ölümden sonraki yaşama inanılır, mezarlara "balbal" denilen taşlar dikilirdi.',
      },
    ],
  },
  {
    id: 't02',
    subject: 'tarih',
    title: 'İlk Türk-İslam Devletleri',
    icon: '☪️',
    summary: 'Karahanlılar, Gazneliler ve Büyük Selçuklu Devleti.',
    readMinutes: 6,
    sections: [
      {
        heading: 'Türklerin İslamiyet\'i Kabulü',
        body: 'Türkler ile Araplar ilk kez Hz. Ömer döneminde komşu oldu. 751 Talas Savaşı\'nda Türkler, Çinlilere karşı Müslüman Arapların yanında yer aldı. Bu savaş Orta Asya\'nın Çinlileşmesini engellemiş, Türkler ile Müslümanlar arasındaki ilişkileri geliştirmiş ve Türklerin kitleler hâlinde İslamiyet\'i kabul etme sürecini başlatmıştır. Ayrıca kâğıt, savaş sonrası Çin dışına (İslam dünyasına ve oradan Avrupa\'ya) yayılmıştır.',
      },
      {
        heading: 'Karahanlılar',
        body: 'Karahanlılar, İslamiyet\'i kabul eden ilk Türk devletidir. Satuk Buğra Han döneminde İslamiyet resmî din olmuştur. Halkın büyük çoğunluğu Türk olduğu için Türk dili ve kültürünü korumuşlar, resmî dil olarak Türkçeyi kullanmışlardır. İlk Türk-İslam eserleri bu dönemde yazılmıştır: Yusuf Has Hacib\'in "Kutadgu Bilig"i ve Kaşgarlı Mahmud\'un "Divânü Lugâti\'t-Türk"ü. Ayrıca ilk Türk-İslam medreseleri, kervansaraylar ve ribatlar Karahanlılarca yapılmıştır.',
      },
      {
        heading: 'Gazneliler',
        body: 'Gazneliler en parlak dönemini Gazneli Mahmud zamanında yaşamıştır. Gazneli Mahmud, Hindistan\'a 17 sefer düzenleyerek İslamiyet\'in bu bölgede yayılmasını sağlamış ve "Sultan" unvanını kullanan ilk Türk hükümdarı olmuştur. Farklı milletleri (Türk, Fars, Hint, Arap) bir arada barındırdıkları için Karahanlılar kadar millî kalamamış, sarayda Farsça ve Arapçanın etkisi artmıştır. Dandanakan Savaşı\'nda (1040) Selçuklulara yenilerek yıkılış sürecine girmişlerdir.',
      },
      {
        heading: 'Büyük Selçuklu Devleti\'nin Kuruluşu',
        body: 'Oğuzların Kınık boyundan gelen Selçuklular, Tuğrul ve Çağrı Beyler önderliğinde Gaznelileri Dandanakan Savaşı\'nda (1040) yenerek bağımsız devlet kurmuşlardır. Tuğrul Bey, Abbasi halifesini Şii Büveyhoğullarına karşı koruyunca halife tarafından "Doğu\'nun ve Batı\'nın Sultanı" ilan edilmiştir. Böylece siyasi güç sultana, dini otorite halifeye ait olacak şekilde bir denge kurulmuştur.',
      },
      {
        heading: 'Malazgirt Savaşı ve Anadolu\'nun Kapıları',
        body: 'Sultan Alparslan döneminde 1071 Malazgirt Savaşı\'nda Bizans yenilgiye uğratıldı. Bu zafer Anadolu\'nun kapılarını Türklere açmış, Türkleşme ve İslamlaşma sürecini başlatmıştır. Bu nedenle Malazgirt Zaferi (1071), Anadolu\'nun "tapu senedi" olarak da nitelendirilir. Savaştan sonra Anadolu\'da ilk Türk beylikleri kurulmaya başlamıştır.',
      },
      {
        heading: 'Melikşah, Nizamülmülk ve Yıkılış',
        body: 'Devlet en geniş sınırlarına Melikşah döneminde ulaştı. Ünlü vezir Nizamülmülk, "Nizamiye Medreseleri"ni kurarak eğitime büyük katkı sağlamış, "Siyasetname" adlı ünlü siyaset kitabını yazmıştır. Melikşah\'ın ölümünden sonra taht kavgaları, Haçlı Seferleri ve Batınilerin (Hasan Sabbah) faaliyetleri devleti zayıflattı. Katvan Savaşı\'ndaki yenilginin ardından Büyük Selçuklu Devleti dağılmıştır.',
      },
    ],
  },
  {
    id: 't03',
    subject: 'tarih',
    title: 'Türkiye (Anadolu) Selçuklu Devleti ve Beylikler',
    icon: '🏰',
    summary: 'Anadolu\'nun Türkleşmesi, Anadolu Selçukluları ve beylikler.',
    readMinutes: 5,
    sections: [
      {
        heading: 'İlk Türk Beylikleri',
        body: 'Malazgirt Zaferi\'nden sonra Anadolu\'da Danişmentliler, Saltuklular, Mengücekliler, Artuklular gibi ilk Türk beylikleri kuruldu. Bu beylikler Anadolu\'nun Türkleşmesinde ve imar edilmesinde önemli rol oynadı; cami, medrese, han ve köprülerle Anadolu\'yu bayındır hâle getirdiler. Bölgeyi Bizans ve Haçlılara karşı savunarak Türklüğün Anadolu\'da kalıcı olmasını sağladılar.',
      },
      {
        heading: 'Türkiye Selçuklu Devleti\'nin Kuruluşu',
        body: 'Süleyman Şah tarafından İznik başkent yapılarak kurulan Türkiye Selçuklu Devleti, Haçlı Seferleri nedeniyle başkentini Konya\'ya taşımıştır. Devlet, Anadolu\'daki Türk birliğini sağlamayı ve ticaret yollarını denetlemeyi hedeflemiştir.',
      },
      {
        heading: 'Yükselme Dönemi',
        body: 'I. Mesut, II. Kılıç Arslan, I. Gıyaseddin Keyhüsrev, I. İzzeddin Keykavus ve I. Alâeddin Keykubad dönemleri devletin en parlak yıllarıdır. II. Kılıç Arslan, Bizans\'ı 1176 Miryokefalon Savaşı\'nda yenmiştir; bu zaferle Anadolu kesin olarak Türk yurdu hâline gelmiş, Bizans\'ın Anadolu\'yu geri alma umudu sona ermiştir. I. Alâeddin Keykubad döneminde Alanya ve Sinop alınarak Akdeniz ve Karadeniz ticareti geliştirilmiştir.',
      },
      {
        heading: 'Ticaret ve Ekonomi',
        body: 'Türkiye Selçukluları ticarete büyük önem verdi. Kervan yolları üzerine kervansaraylar (hanlar) yapıldı, tüccarların zararını karşılayan bir tür devlet sigortası uygulandı. Antalya, Alanya ve Sinop gibi limanlar alınarak deniz ticareti canlandırıldı. İlk Türk denizciliği ve donanması bu dönemde gelişmiştir.',
      },
      {
        heading: 'Kösedağ Savaşı ve Beylikler Dönemi',
        body: '1243 Kösedağ Savaşı\'nda Moğollara (İlhanlılar) yenilen Türkiye Selçuklu Devleti yıkılış sürecine girdi ve Anadolu\'da Türk siyasi birliği bozuldu. Bu ortamda Anadolu\'da ikinci kez beylikler kuruldu: Osmanoğulları, Karamanoğulları, Germiyanoğulları, Aydınoğulları, Karesioğulları ve diğerleri. Karamanoğulları, Türkçeyi resmî dil ilan etmesiyle (1277, Karamanoğlu Mehmet Bey) tanınır. Bu beyliklerden Osmanoğulları zamanla büyüyerek Osmanlı Devleti\'ne dönüşecektir.',
      },
    ],
  },
  {
    id: 't04',
    subject: 'tarih',
    title: 'Osmanlı Kuruluş Dönemi',
    icon: '⚔️',
    summary: 'Osmanlı\'nın kuruluşu, ilk padişahlar ve devletleşme süreci.',
    readMinutes: 6,
    sections: [
      {
        heading: 'Kuruluş ve Coğrafi Konum',
        body: 'Osmanlı Devleti, Oğuzların Kayı boyuna mensup olup, Söğüt ve Domaniç dolaylarına yerleşen aşiretin Osman Bey önderliğinde bağımsızlığını ilan etmesiyle kuruldu. Bizans\'a komşu uç bölgede yer alması, gaza ve cihat anlayışıyla genişlemesini kolaylaştırdı. Beyliğin Bizans sınırında olması Türkmen göçlerini ve gazileri kendisine çekmiş, hızla büyümesini sağlamıştır.',
      },
      {
        heading: 'Osman Bey ve Orhan Bey Dönemi',
        body: 'Osman Bey döneminde Koyunhisar Savaşı\'nda Bizans yenildi ve beylik genişledi. Orhan Bey döneminde Bursa alınarak başkent yapıldı; ilk medrese, ilk düzenli ordu (yaya ve müsellem) ve ilk vakıf teşkilatı bu dönemde kuruldu. Karesioğulları Beyliği\'nin alınmasıyla Osmanlı ilk kez donanmaya sahip oldu ve Rumeli\'ye (Avrupa yakasına) geçiş için zemin hazırlandı.',
      },
      {
        heading: 'Rumeli\'ye Geçiş ve İskân Politikası',
        body: 'Çimpe Kalesi\'nin alınmasıyla (1353) Osmanlı, Rumeli\'ye (Balkanlara) ilk kez ayak bastı. Fethedilen yerlerde uygulanan iskân (şenlendirme) politikasıyla Anadolu\'dan getirilen Türkmenler bölgeye yerleştirildi. Bu sayede fethedilen topraklar kalıcı hâle getirildi ve Balkanlar\'ın Türkleşmesi sağlandı.',
      },
      {
        heading: 'I. Murad Dönemi',
        body: 'I. Murad (Hüdavendigâr) döneminde devlet teşkilatlanmasını güçlendirdi. Yeniçeri Ocağı ve Acemi Oğlanlar Ocağı kuruldu, "Pençik Sistemi" uygulandı. Sırpsındığı ve özellikle 1389 I. Kosova Savaşı ile Balkanlarda Haçlı ittifakları yenildi. I. Murad, I. Kosova Savaşı\'nın ardından şehit edilen ilk Osmanlı padişahı oldu. Bu dönemde "ülke hanedanın ortak malıdır" anlayışından "ülke padişah ve oğullarının malıdır" anlayışına geçilmiştir.',
      },
      {
        heading: 'Yıldırım Bayezid ve Ankara Savaşı',
        body: 'Yıldırım Bayezid, Anadolu Türk birliğini büyük ölçüde sağladı ve İstanbul\'u kuşattı. 1396 Niğbolu Savaşı\'nda Haçlıları büyük bir yenilgiye uğrattı. Ancak doğudan gelen Timur ile yapılan 1402 Ankara Savaşı\'nda yenilerek esir düştü. Bu yenilgi Anadolu Türk birliğinin bozulmasına ve "Fetret Devri" denilen 11 yıllık taht kavgaları dönemine yol açtı; bu dönemde İstanbul\'un fethi gecikti.',
      },
      {
        heading: 'Fetret Devri ve Toparlanma',
        body: 'Fetret Devri\'nde Yıldırım Bayezid\'in oğulları arasında taht mücadelesi yaşandı; mücadeleyi I. Mehmed (Çelebi Mehmed) kazandı ve devleti yeniden birleştirdiği için "Osmanlı Devleti\'nin ikinci kurucusu" sayıldı. Ardından II. Murad döneminde Balkanlardaki Haçlı tehlikesi 1444 Varna ve 1448 II. Kosova savaşlarıyla bertaraf edildi. Böylece İstanbul\'un fethi için uygun zemin hazırlandı ve kuruluş dönemi tamamlandı.',
      },
    ],
  },
  {
    id: 't05',
    subject: 'tarih',
    title: 'Osmanlı Yükselme Dönemi',
    icon: '👑',
    summary: 'İstanbul\'un Fethi\'nden Sokullu\'nun ölümüne kadar yükseliş.',
    readMinutes: 0,
    sections: [],
  },
  {
    id: 't06',
    subject: 'tarih',
    title: 'Osmanlı Duraklama, Gerileme ve Dağılma',
    icon: '📉',
    summary: 'Duraklama nedenleri, ıslahatlar ve dağılma süreci.',
    readMinutes: 0,
    sections: [],
  },
  {
    id: 't07',
    subject: 'tarih',
    title: 'Osmanlı Kültür ve Medeniyeti',
    icon: '🕌',
    summary: 'Devlet yönetimi, ordu, toprak sistemi, eğitim ve sanat.',
    readMinutes: 0,
    sections: [],
  },
  {
    id: 't08',
    subject: 'tarih',
    title: 'I. Dünya Savaşı ve Osmanlı',
    icon: '💣',
    summary: 'Savaşın nedenleri, Osmanlı cepheleri ve sonuçları.',
    readMinutes: 0,
    sections: [],
  },
  {
    id: 't09',
    subject: 'tarih',
    title: 'Kurtuluş Savaşı Hazırlık Dönemi',
    icon: '📜',
    summary: 'Cemiyetler, genelgeler, kongreler ve TBMM\'nin açılışı.',
    readMinutes: 0,
    sections: [],
  },
  {
    id: 't10',
    subject: 'tarih',
    title: 'Kurtuluş Savaşı Cepheleri ve Antlaşmalar',
    icon: '🎖️',
    summary: 'Doğu, Güney ve Batı cepheleri; muharebeler ve antlaşmalar.',
    readMinutes: 0,
    sections: [],
  },
  {
    id: 't11',
    subject: 'tarih',
    title: 'Atatürk İlkeleri ve İnkılapları',
    icon: '🇹🇷',
    summary: 'Siyasi, hukuki, sosyal inkılaplar ve altı ilke.',
    readMinutes: 0,
    sections: [],
  },
  {
    id: 't12',
    subject: 'tarih',
    title: 'Atatürk Dönemi Türk Dış Politikası',
    icon: '🤝',
    summary: 'Lozan sonrası dış politika, sorunlar ve antlaşmalar.',
    readMinutes: 0,
    sections: [],
  },
  {
    id: 't13',
    subject: 'tarih',
    title: 'Çağdaş Türk ve Dünya Tarihi',
    icon: '🌍',
    summary: 'II. Dünya Savaşı, Soğuk Savaş ve günümüz dünyası.',
    readMinutes: 0,
    sections: [],
  },
];

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
