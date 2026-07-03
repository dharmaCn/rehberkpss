// Genel Kültür & Güncel Bilgiler — eser/sanatçı/yazar soru bankası.
// Görseller Wikimedia Commons'tan (kamu malı — sanatçısı 70+ yıl önce vefat etmiş eserler).
// Görsel yüklenemezse UI metin fallback gösterir.

export type ArtType = 'resim' | 'eser' | 'heykel' | 'karakter' | 'film';
export type ArtDifficulty = 'kolay' | 'orta' | 'zor';

export interface ArtQuestion {
  id: string;
  type: ArtType;
  image?: string; // resim sorularında Wikimedia URL'i
  prompt: string;
  options: string[];
  correctIndex: number;
  info: string; // cevap sonrası "Bunu unutma" bilgisi
  difficulty: ArtDifficulty;
}

// Wikimedia Commons stabil görsel URL'i (Special:FilePath, istenen genişlikte)
function wikiImg(fileName: string, width = 800): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;
}

export const ART_QUESTIONS: ArtQuestion[] = [
  // ─── RESİM → RESSAM (görselli) ───
  {
    id: 'a01', type: 'resim', difficulty: 'kolay',
    image: wikiImg('Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg'),
    prompt: 'Bu ünlü tablo hangi sanatçıya aittir?',
    options: ['Leonardo da Vinci', 'Michelangelo', 'Raffaello', 'Rembrandt'],
    correctIndex: 0,
    info: 'Mona Lisa, Leonardo da Vinci tarafından yapılmıştır ve Louvre Müzesi\'ndedir.',
  },
  {
    id: 'a02', type: 'resim', difficulty: 'kolay',
    image: wikiImg('Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'),
    prompt: 'Bu tablonun ("Yıldızlı Gece") ressamı kimdir?',
    options: ['Claude Monet', 'Vincent van Gogh', 'Paul Cézanne', 'Edvard Munch'],
    correctIndex: 1,
    info: 'Yıldızlı Gece (1889), Vincent van Gogh\'un en ünlü eserlerindendir.',
  },
  {
    id: 'a03', type: 'resim', difficulty: 'kolay',
    image: wikiImg('Edvard_Munch,_1893,_The_Scream,_oil,_tempera_and_pastel_on_cardboard,_91_x_73_cm,_National_Gallery_of_Norway.jpg'),
    prompt: 'Bu eser ("Çığlık") hangi sanatçıya aittir?',
    options: ['Salvador Dalí', 'Edvard Munch', 'Gustav Klimt', 'Pablo Picasso'],
    correctIndex: 1,
    info: 'Çığlık (1893), Norveçli ressam Edvard Munch\'un başyapıtıdır.',
  },
  {
    id: 'a04', type: 'resim', difficulty: 'orta',
    image: wikiImg('1665_Girl_with_a_Pearl_Earring.jpg'),
    prompt: 'Bu tablonun ("İnci Küpeli Kız") ressamı kimdir?',
    options: ['Johannes Vermeer', 'Rembrandt', 'Peter Paul Rubens', 'Jan van Eyck'],
    correctIndex: 0,
    info: 'İnci Küpeli Kız (~1665), Hollandalı ressam Johannes Vermeer\'in eseridir.',
  },
  {
    id: 'a05', type: 'resim', difficulty: 'orta',
    image: wikiImg('The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg'),
    prompt: 'Bu eser ("Öpücük") hangi ressama aittir?',
    options: ['Egon Schiele', 'Henri Matisse', 'Gustav Klimt', 'Marc Chagall'],
    correctIndex: 2,
    info: 'Öpücük (1908), Avusturyalı ressam Gustav Klimt\'in altın dönem eseridir.',
  },
  {
    id: 'a06', type: 'resim', difficulty: 'orta',
    image: wikiImg('Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg'),
    prompt: 'Bu Rönesans eseri ("Venüs\'ün Doğuşu") kimindir?',
    options: ['Sandro Botticelli', 'Tiziano', 'Caravaggio', 'Leonardo da Vinci'],
    correctIndex: 0,
    info: 'Venüs\'ün Doğuşu (~1485), Sandro Botticelli\'nin eseridir; Uffizi Galerisi\'ndedir.',
  },
  {
    id: 'a07', type: 'resim', difficulty: 'orta',
    image: wikiImg('La_ronda_de_noche,_por_Rembrandt_van_Rijn.jpg'),
    prompt: 'Bu tablo ("Gece Devriyesi") hangi ressama aittir?',
    options: ['Johannes Vermeer', 'Rembrandt', 'Frans Hals', 'Anthony van Dyck'],
    correctIndex: 1,
    info: 'Gece Devriyesi (1642), Rembrandt\'ın başyapıtıdır; Rijksmuseum\'dadır.',
  },
  {
    id: 'a08', type: 'resim', difficulty: 'kolay',
    image: wikiImg('Michelangelo_-_Creation_of_Adam_(cropped).jpg'),
    prompt: 'Sistine Şapeli\'ndeki bu fresk ("Adem\'in Yaratılışı") kime aittir?',
    options: ['Raffaello', 'Michelangelo', 'Donatello', 'Caravaggio'],
    correctIndex: 1,
    info: 'Adem\'in Yaratılışı, Michelangelo\'nun Sistine Şapeli tavanındaki freskidir.',
  },
  {
    id: 'a09', type: 'resim', difficulty: 'zor',
    image: wikiImg('Las_Meninas,_by_Diego_Velázquez,_from_Prado_in_Google_Earth.jpg'),
    prompt: 'Bu eser ("Las Meninas") hangi İspanyol ressama aittir?',
    options: ['Francisco Goya', 'El Greco', 'Diego Velázquez', 'Joan Miró'],
    correctIndex: 2,
    info: 'Las Meninas (1656), Diego Velázquez\'in başyapıtıdır; Prado Müzesi\'ndedir.',
  },
  {
    id: 'a10', type: 'resim', difficulty: 'orta',
    image: wikiImg('La_Liberté_guidant_le_peuple_-_Eugène_Delacroix_-_Musée_du_Louvre_Peintures_RF_129_-_après_restauration_2024.jpg'),
    prompt: 'Bu tablo ("Halka Yol Gösteren Özgürlük") kimindir?',
    options: ['Eugène Delacroix', 'Jacques-Louis David', 'Gustave Courbet', 'Édouard Manet'],
    correctIndex: 0,
    info: 'Halka Yol Gösteren Özgürlük (1830), Eugène Delacroix\'nın romantik dönem eseridir.',
  },
  {
    id: 'a11', type: 'resim', difficulty: 'zor',
    image: wikiImg('"The_School_of_Athens"_by_Raffaello_Sanzio_da_Urbino.jpg'),
    prompt: 'Vatikan\'daki bu fresk ("Atina Okulu") hangi sanatçıya aittir?',
    options: ['Michelangelo', 'Raffaello (Raphael)', 'Leonardo da Vinci', 'Tiziano'],
    correctIndex: 1,
    info: 'Atina Okulu (1511), Raffaello\'nun Vatikan\'daki ünlü freskidir.',
  },
  {
    id: 'a12', type: 'resim', difficulty: 'zor',
    image: wikiImg('Monet_-_Impression,_Sunrise.jpg'),
    prompt: 'İzlenimciliğe adını veren bu tablo ("İzlenim, Gün Doğumu") kimindir?',
    options: ['Pierre-Auguste Renoir', 'Claude Monet', 'Edgar Degas', 'Camille Pissarro'],
    correctIndex: 1,
    info: 'İzlenim, Gün Doğumu (1872), Claude Monet\'nin eseridir; "İzlenimcilik" akımı adını bu tablodan alır.',
  },

  // ─── ESER → YAZAR (metin) ───
  {
    id: 'a13', type: 'eser', difficulty: 'kolay',
    prompt: '"Suç ve Ceza" romanının yazarı kimdir?',
    options: ['Lev Tolstoy', 'Fyodor Dostoyevski', 'Anton Çehov', 'Maksim Gorki'],
    correctIndex: 1,
    info: 'Suç ve Ceza (1866), Rus yazar Fyodor Dostoyevski\'nin romanıdır.',
  },
  {
    id: 'a14', type: 'eser', difficulty: 'kolay',
    prompt: '"Savaş ve Barış" eserinin yazarı kimdir?',
    options: ['Lev Tolstoy', 'İvan Turgenyev', 'Aleksandr Puşkin', 'Nikolay Gogol'],
    correctIndex: 0,
    info: 'Savaş ve Barış (1869), Lev Tolstoy\'un destansı romanıdır.',
  },
  {
    id: 'a15', type: 'eser', difficulty: 'orta',
    prompt: '"Sefiller" (Les Misérables) romanı kime aittir?',
    options: ['Émile Zola', 'Victor Hugo', 'Honoré de Balzac', 'Gustave Flaubert'],
    correctIndex: 1,
    info: 'Sefiller (1862), Fransız yazar Victor Hugo\'nun eseridir.',
  },
  {
    id: 'a16', type: 'eser', difficulty: 'orta',
    prompt: '"Don Kişot" eserinin yazarı kimdir?',
    options: ['Miguel de Cervantes', 'Lope de Vega', 'Dante Alighieri', 'Goethe'],
    correctIndex: 0,
    info: 'Don Kişot (1605), İspanyol yazar Miguel de Cervantes\'in eseridir; ilk modern roman sayılır.',
  },
  {
    id: 'a17', type: 'eser', difficulty: 'kolay',
    prompt: '"Çalıkuşu" romanının yazarı kimdir?',
    options: ['Halide Edip Adıvar', 'Reşat Nuri Güntekin', 'Yakup Kadri Karaosmanoğlu', 'Peyami Safa'],
    correctIndex: 1,
    info: 'Çalıkuşu (1922), Reşat Nuri Güntekin\'in ünlü romanıdır.',
  },
  {
    id: 'a18', type: 'eser', difficulty: 'orta',
    prompt: '"İnce Memed" romanı hangi Türk yazara aittir?',
    options: ['Orhan Kemal', 'Yaşar Kemal', 'Kemal Tahir', 'Sabahattin Ali'],
    correctIndex: 1,
    info: 'İnce Memed (1955), Yaşar Kemal\'in başyapıtıdır.',
  },
  {
    id: 'a19', type: 'eser', difficulty: 'orta',
    prompt: '"Kürk Mantolu Madonna" romanının yazarı kimdir?',
    options: ['Sabahattin Ali', 'Sait Faik Abasıyanık', 'Ahmet Hamdi Tanpınar', 'Oğuz Atay'],
    correctIndex: 0,
    info: 'Kürk Mantolu Madonna (1943), Sabahattin Ali\'nin romanıdır.',
  },
  {
    id: 'a20', type: 'eser', difficulty: 'zor',
    prompt: '"Saatleri Ayarlama Enstitüsü" romanı kime aittir?',
    options: ['Ahmet Hamdi Tanpınar', 'Yusuf Atılgan', 'Oğuz Atay', 'Adalet Ağaoğlu'],
    correctIndex: 0,
    info: 'Saatleri Ayarlama Enstitüsü (1961), Ahmet Hamdi Tanpınar\'ın romanıdır.',
  },
  {
    id: 'a21', type: 'eser', difficulty: 'kolay',
    prompt: '"Hamlet", "Romeo ve Juliet" gibi eserlerin yazarı kimdir?',
    options: ['Charles Dickens', 'William Shakespeare', 'Oscar Wilde', 'George Bernard Shaw'],
    correctIndex: 1,
    info: 'Bu eserler İngiliz oyun yazarı William Shakespeare\'e aittir.',
  },
  {
    id: 'a22', type: 'eser', difficulty: 'zor',
    prompt: '"Tutunamayanlar" romanının yazarı kimdir?',
    options: ['Oğuz Atay', 'Bilge Karasu', 'Yusuf Atılgan', 'Vüsat O. Bener'],
    correctIndex: 0,
    info: 'Tutunamayanlar (1971-72), Oğuz Atay\'ın modernist başyapıtıdır.',
  },
  {
    id: 'a23', type: 'eser', difficulty: 'orta',
    prompt: '"Dönüşüm" (Die Verwandlung) adlı eserin yazarı kimdir?',
    options: ['Franz Kafka', 'Thomas Mann', 'Hermann Hesse', 'Stefan Zweig'],
    correctIndex: 0,
    info: 'Dönüşüm (1915), Franz Kafka\'nın ünlü uzun öyküsüdür.',
  },
  {
    id: 'a24', type: 'eser', difficulty: 'zor',
    prompt: '"Yüzyıllık Yalnızlık" romanı hangi yazara aittir?',
    options: ['Jorge Luis Borges', 'Gabriel García Márquez', 'Mario Vargas Llosa', 'Pablo Neruda'],
    correctIndex: 1,
    info: 'Yüzyıllık Yalnızlık (1967), Gabriel García Márquez\'in eseridir; büyülü gerçekçiliğin simgesidir.',
  },

  // ─── HEYKEL / YAPI → SANATÇI veya BİLGİ (metin) ───
  {
    id: 'a25', type: 'heykel', difficulty: 'kolay',
    prompt: 'Floransa\'daki ünlü "Davud" (David) heykeli kime aittir?',
    options: ['Donatello', 'Michelangelo', 'Bernini', 'Rodin'],
    correctIndex: 1,
    info: 'Davud heykeli (1504), Michelangelo\'nun mermer başyapıtıdır.',
  },
  {
    id: 'a26', type: 'heykel', difficulty: 'orta',
    prompt: '"Düşünen Adam" (Le Penseur) heykelinin sanatçısı kimdir?',
    options: ['Auguste Rodin', 'Antonio Canova', 'Constantin Brâncuși', 'Michelangelo'],
    correctIndex: 0,
    info: 'Düşünen Adam, Fransız heykeltıraş Auguste Rodin\'in eseridir.',
  },
  {
    id: 'a27', type: 'heykel', difficulty: 'kolay',
    prompt: 'Paris\'teki ünlü Eyfel Kulesi\'nin mühendisi kimdir?',
    options: ['Gustave Eiffel', 'Le Corbusier', 'Auguste Rodin', 'Georges Haussmann'],
    correctIndex: 0,
    info: 'Eyfel Kulesi (1889), mühendis Gustave Eiffel\'in şirketi tarafından inşa edilmiştir.',
  },
  {
    id: 'a28', type: 'heykel', difficulty: 'orta',
    prompt: 'İstanbul\'daki Ayasofya başlangıçta hangi amaçla, hangi dönemde yapılmıştır?',
    options: ['Roma tapınağı', 'Bizans (Doğu Roma) kilisesi', 'Selçuklu medresesi', 'Osmanlı sarayı'],
    correctIndex: 1,
    info: 'Ayasofya 537\'de Bizans İmparatoru I. Justinianus döneminde kilise olarak yapılmıştır.',
  },
  {
    id: 'a29', type: 'heykel', difficulty: 'zor',
    prompt: 'Selimiye Camii\'nin (Edirne) mimarı kimdir?',
    options: ['Mimar Hayreddin', 'Mimar Sinan', 'Mimar Kemaleddin', 'Davut Ağa'],
    correctIndex: 1,
    info: 'Selimiye Camii (1575), Mimar Sinan\'ın "ustalık eserim" dediği yapıdır.',
  },
  {
    id: 'a30', type: 'heykel', difficulty: 'orta',
    prompt: 'Hindistan\'daki ünlü Tac Mahal hangi amaçla yapılmıştır?',
    options: ['Saray', 'Anıt mezar (türbe)', 'Cami', 'Kale'],
    correctIndex: 1,
    info: 'Tac Mahal (1653), Şah Cihan tarafından eşi Mümtaz Mahal için yaptırılan anıt mezardır.',
  },
  {
    id: 'a31', type: 'heykel', difficulty: 'zor',
    prompt: '"Venus de Milo" heykeli hangi uygarlığa aittir?',
    options: ['Antik Mısır', 'Antik Yunan', 'Roma', 'Mezopotamya'],
    correctIndex: 1,
    info: 'Venus de Milo (~MÖ 130-100), Antik Yunan dönemine ait mermer heykeldir; Louvre\'dadır.',
  },
  {
    id: 'a32', type: 'heykel', difficulty: 'kolay',
    prompt: 'New York\'taki Özgürlük Heykeli hangi ülkenin hediyesidir?',
    options: ['İngiltere', 'Fransa', 'İspanya', 'İtalya'],
    correctIndex: 1,
    info: 'Özgürlük Heykeli (1886), Fransa\'nın ABD\'ye armağanıdır; heykeltıraşı Frédéric Auguste Bartholdi\'dir.',
  },

  // ─── YAZAR & BAŞROL KARAKTER ───
  {
    id: 'a33', type: 'karakter', difficulty: 'kolay',
    prompt: '"İnce Memed" romanının başkahramanı kimdir?',
    options: ['Memed', 'İsmail', 'Hasan', 'Yusuf'],
    correctIndex: 0,
    info: 'İnce Memed, Yaşar Kemal\'in romanında Toroslar\'da eşkıyalığa zorlanan genç kahramandır.',
  },
  {
    id: 'a34', type: 'karakter', difficulty: 'orta',
    prompt: '"Suç ve Ceza"nın başkahramanı kimdir?',
    options: ['Raskolnikov', 'Karamazov', 'Oblomov', 'Levin'],
    correctIndex: 0,
    info: 'Rodion Raskolnikov, Dostoyevski\'nin Suç ve Ceza romanının vicdanı sorgulayan başkahramanıdır.',
  },
  {
    id: 'a35', type: 'karakter', difficulty: 'kolay',
    prompt: '"Çalıkuşu"nun başkahramanı Feride\'yi hangi yazar yazmıştır?',
    options: ['Halide Edip Adıvar', 'Reşat Nuri Güntekin', 'Peyami Safa', 'Yakup Kadri Karaosmanoğlu'],
    correctIndex: 1,
    info: 'Feride, Reşat Nuri Güntekin\'in 1922 tarihli Çalıkuşu romanının başkahramanıdır.',
  },
  {
    id: 'a36', type: 'karakter', difficulty: 'orta',
    prompt: '"Kürk Mantolu Madonna"nın anlatıcı-kahramanı kimdir?',
    options: ['Raif Efendi', 'Kemal', 'Selim İleri', 'Adnan'],
    correctIndex: 0,
    info: 'Raif Efendi, Sabahattin Ali\'nin romanında Maria Puder\'e âşık olan içe dönük kahramandır.',
  },
  {
    id: 'a37', type: 'karakter', difficulty: 'kolay',
    prompt: '"Don Kişot"un sadık yardımcısının adı nedir?',
    options: ['Sancho Panza', 'Dulcinea', 'Rocinante', 'Figaro'],
    correctIndex: 0,
    info: 'Sancho Panza, Cervantes\'in Don Kişot romanında şövalyenin sadık silahdarıdır.',
  },
  {
    id: 'a38', type: 'karakter', difficulty: 'orta',
    prompt: '"Büyük Gatsby" romanının başkahramanı Jay Gatsby\'yi kim yazmıştır?',
    options: ['Ernest Hemingway', 'F. Scott Fitzgerald', 'John Steinbeck', 'Mark Twain'],
    correctIndex: 1,
    info: 'Büyük Gatsby (1925), F. Scott Fitzgerald\'ın Amerikan rüyasını sorgulayan romanıdır.',
  },
  {
    id: 'a39', type: 'karakter', difficulty: 'zor',
    prompt: '"Tutunamayanlar"ın iki başkahramanından biri olan Turgut Özben\'i hangi yazar yaratmıştır?',
    options: ['Oğuz Atay', 'Yusuf Atılgan', 'Bilge Karasu', 'Adalet Ağaoğlu'],
    correctIndex: 0,
    info: 'Turgut Özben, Oğuz Atay\'ın Tutunamayanlar (1971-72) romanının başkahramanıdır.',
  },
  {
    id: 'a40', type: 'karakter', difficulty: 'kolay',
    prompt: '"Hamlet"in ünlü "Olmak ya da olmamak" sözünü söyleyen karakter kimdir?',
    options: ['Hamlet', 'Macbeth', 'Kral Lear', 'Othello'],
    correctIndex: 0,
    info: 'Bu ünlü tirad, Shakespeare\'in Hamlet oyununun 3. perdesindedir.',
  },
  {
    id: 'a41', type: 'karakter', difficulty: 'zor',
    prompt: '"Vadideki Zambak" romanının yazarı kimdir?',
    options: ['Stendhal', 'Honoré de Balzac', 'Guy de Maupassant', 'Gustave Flaubert'],
    correctIndex: 1,
    info: 'Vadideki Zambak (1835), Honoré de Balzac\'ın İnsanlık Komedyası serisinden bir romandır.',
  },
  {
    id: 'a42', type: 'karakter', difficulty: 'zor',
    prompt: '"Aylak Adam" romanının başkahramanı C.\'yi hangi yazar yazmıştır?',
    options: ['Yusuf Atılgan', 'Oğuz Atay', 'Orhan Pamuk', 'Ahmet Hamdi Tanpınar'],
    correctIndex: 0,
    info: 'Aylak Adam (1959), Yusuf Atılgan\'ın varoluşçu romanıdır.',
  },

  // ─── KÜLT FİLMLER ───
  {
    id: 'a43', type: 'film', difficulty: 'kolay',
    prompt: '"Baba" (The Godfather) filminin yönetmeni kimdir?',
    options: ['Martin Scorsese', 'Francis Ford Coppola', 'Steven Spielberg', 'Ridley Scott'],
    correctIndex: 1,
    info: 'Baba (1972), Francis Ford Coppola\'nın yönettiği sinema tarihinin en önemli filmlerindendir.',
  },
  {
    id: 'a44', type: 'film', difficulty: 'orta',
    prompt: '"Esaretin Bedeli" (The Shawshank Redemption) filminde başrol oyuncusu kimdir?',
    options: ['Morgan Freeman', 'Tim Robbins', 'Al Pacino', 'Robert De Niro'],
    correctIndex: 1,
    info: 'Esaretin Bedeli (1994), Tim Robbins ve Morgan Freeman başrollü hapishane dramasıdır.',
  },
  {
    id: 'a45', type: 'film', difficulty: 'kolay',
    prompt: '"Yüzüklerin Efendisi" üçlemesinin yönetmeni kimdir?',
    options: ['James Cameron', 'Peter Jackson', 'Christopher Nolan', 'Ridley Scott'],
    correctIndex: 1,
    info: 'Yüzüklerin Efendisi (2001-2003), Peter Jackson\'ın yönettiği fantastik üçlemedir.',
  },
  {
    id: 'a46', type: 'film', difficulty: 'orta',
    prompt: '"2001: Bir Uzay Destanı" filminin yönetmeni kimdir?',
    options: ['Steven Spielberg', 'Stanley Kubrick', 'Ridley Scott', 'George Lucas'],
    correctIndex: 1,
    info: '2001: Bir Uzay Destanı (1968), Stanley Kubrick\'in bilim kurgu başyapıtıdır.',
  },
  {
    id: 'a47', type: 'film', difficulty: 'kolay',
    prompt: '"Ucuz Roman" (Pulp Fiction) filminin yönetmeni kimdir?',
    options: ['Guy Ritchie', 'Quentin Tarantino', 'David Fincher', 'Martin Scorsese'],
    correctIndex: 1,
    info: 'Ucuz Roman (1994), Quentin Tarantino\'nun kült filmidir; Cannes\'da Altın Palmiye kazandı.',
  },
  {
    id: 'a48', type: 'film', difficulty: 'zor',
    prompt: '"Susuz Yaz" filmiyle Altın Ayı ödülünü kazanan Türk yönetmen kimdir?',
    options: ['Yılmaz Güney', 'Metin Erksan', 'Nuri Bilge Ceylan', 'Zeki Demirkubuz'],
    correctIndex: 1,
    info: 'Susuz Yaz (1964), Metin Erksan\'ın Berlin Film Festivali\'nde Altın Ayı kazanan filmidir.',
  },
  {
    id: 'a49', type: 'film', difficulty: 'orta',
    prompt: '"Kış Uykusu" filmiyle Cannes\'da Altın Palmiye kazanan Türk yönetmen kimdir?',
    options: ['Nuri Bilge Ceylan', 'Ferzan Özpetek', 'Semih Kaplanoğlu', 'Zeki Demirkubuz'],
    correctIndex: 0,
    info: 'Kış Uykusu (2014), Nuri Bilge Ceylan\'ın Cannes\'da Altın Palmiye kazanan filmidir.',
  },
  {
    id: 'a50', type: 'film', difficulty: 'orta',
    prompt: '"Yol" filmiyle Cannes\'da Altın Palmiye kazanan yönetmen kimdir?',
    options: ['Yılmaz Güney', 'Metin Erksan', 'Ömer Kavur', 'Atıf Yılmaz'],
    correctIndex: 0,
    info: 'Yol (1982), Yılmaz Güney\'in senaryo ve yönetmenliğinde Altın Palmiye kazanan filmidir.',
  },
  // ─── EK HAVUZ (a51–a80) ───
  {
    id: 'a51', type: 'resim', difficulty: 'orta',
    image: wikiImg('Meisje_met_de_parel.jpg'),
    prompt: 'Bu tablo ("İnci Küpeli Kız") hangi ressama aittir?',
    options: ['Johannes Vermeer', 'Rembrandt', 'Jan van Eyck', 'Frans Hals'],
    correctIndex: 0,
    info: 'İnci Küpeli Kız (~1665), Hollandalı ressam Johannes Vermeer\'in başyapıtıdır; "Kuzeyin Mona Lisası" olarak anılır.',
  },
  {
    id: 'a52', type: 'resim', difficulty: 'orta',
    image: wikiImg('The_Great_Wave_off_Kanagawa.jpg'),
    prompt: 'Bu ünlü Japon baskısı ("Büyük Dalga") kimin eseridir?',
    options: ['Hokusai', 'Hiroshige', 'Utamaro', 'Sesshu'],
    correctIndex: 0,
    info: 'Kanagawa Açıklarında Büyük Dalga (~1831), Katsushika Hokusai\'nin dünyaca ünlü ahşap baskısıdır.',
  },
  {
    id: 'a53', type: 'resim', difficulty: 'orta',
    image: wikiImg('The_Night_Watch_-_HD.jpg'),
    prompt: 'Bu tablo ("Gece Devriyesi") hangi ressamın eseridir?',
    options: ['Vermeer', 'Rembrandt', 'Rubens', 'Velázquez'],
    correctIndex: 1,
    info: 'Gece Devriyesi (1642), Rembrandt\'ın en ünlü eseridir ve Amsterdam Rijksmuseum\'dadır.',
  },
  {
    id: 'a54', type: 'resim', difficulty: 'zor',
    image: wikiImg('Gustav_Klimt_016.jpg'),
    prompt: 'Bu tablo ("Öpücük") hangi sanatçıya aittir?',
    options: ['Egon Schiele', 'Gustav Klimt', 'Henri Matisse', 'Marc Chagall'],
    correctIndex: 1,
    info: 'Öpücük (1908), Avusturyalı ressam Gustav Klimt\'in altın varaklı başyapıtıdır.',
  },
  {
    id: 'a55', type: 'resim', difficulty: 'orta',
    image: wikiImg('Claude_Monet,_Impression,_soleil_levant.jpg'),
    prompt: 'Empresyonizm akımına adını veren bu tablo ("İzlenim: Gün Doğumu") kimindir?',
    options: ['Édouard Manet', 'Claude Monet', 'Camille Pissarro', 'Auguste Renoir'],
    correctIndex: 1,
    info: 'İzlenim: Gün Doğumu (1872), Claude Monet\'nin eseridir; "Empresyonizm" adı bu tablodan doğmuştur.',
  },
  {
    id: 'a56', type: 'resim', difficulty: 'zor',
    image: wikiImg('Las_Meninas,_by_Diego_Velázquez,_from_Prado_in_Google_Earth.jpg'),
    prompt: 'Bu tablo ("Nedimeler / Las Meninas") hangi ressamın eseridir?',
    options: ['Francisco Goya', 'El Greco', 'Diego Velázquez', 'Pablo Picasso'],
    correctIndex: 2,
    info: 'Las Meninas (1656), İspanyol ressam Diego Velázquez\'in başyapıtıdır; Madrid Prado Müzesi\'ndedir.',
  },
  {
    id: 'a57', type: 'resim', difficulty: 'orta',
    image: wikiImg('Vincent_Willem_van_Gogh_128.jpg'),
    prompt: 'Bu tablo ("Ayçiçekleri") hangi ressamın serisindendir?',
    options: ['Paul Gauguin', 'Vincent van Gogh', 'Henri Matisse', 'Claude Monet'],
    correctIndex: 1,
    info: 'Ayçiçekleri serisi (1888-89), Van Gogh\'un Arles döneminde yaptığı en tanınmış eserlerindendir.',
  },
  {
    id: 'a58', type: 'resim', difficulty: 'zor',
    image: wikiImg('Eugène_Delacroix_-_Le_28_Juillet._La_Liberté_guidant_le_peuple.jpg'),
    prompt: 'Bu tablo ("Halka Yol Gösteren Özgürlük") hangi ressamın eseridir?',
    options: ['Eugène Delacroix', 'Jacques-Louis David', 'Théodore Géricault', 'Gustave Courbet'],
    correctIndex: 0,
    info: 'Halka Yol Gösteren Özgürlük (1830), Eugène Delacroix\'nın Fransız Temmuz Devrimi\'ni simgeleyen eseridir.',
  },
  {
    id: 'a59', type: 'resim', difficulty: 'orta',
    image: wikiImg('Osman_Hamdi_Bey_-_The_Tortoise_Trainer_-_Google_Art_Project.jpg'),
    prompt: 'Bu tablo ("Kaplumbağa Terbiyecisi") hangi Türk ressamın eseridir?',
    options: ['İbrahim Çallı', 'Osman Hamdi Bey', 'Fikret Mualla', 'Hoca Ali Rıza'],
    correctIndex: 1,
    info: 'Kaplumbağa Terbiyecisi (1906), Osman Hamdi Bey\'in en ünlü eseridir; Pera Müzesi\'ndedir. Osman Hamdi Bey ayrıca İstanbul Arkeoloji Müzesi\'nin kurucusudur.',
  },
  {
    id: 'a60', type: 'resim', difficulty: 'zor',
    image: wikiImg('Paul_Cézanne,_Les_joueurs_de_carte_(1892-95).jpg'),
    prompt: 'Bu tablo ("Kağıt Oyuncuları") hangi ressamın eseridir?',
    options: ['Paul Cézanne', 'Edgar Degas', 'Henri Toulouse-Lautrec', 'Georges Seurat'],
    correctIndex: 0,
    info: 'Kağıt Oyuncuları serisi (1890-95), modern sanatın babası sayılan Paul Cézanne\'ın başyapıtlarındandır.',
  },
  {
    id: 'a61', type: 'heykel', difficulty: 'orta',
    image: wikiImg('Michelangelo\'s_Pieta_5450_cropncleaned_edit.jpg'),
    prompt: 'Bu heykel ("Pietà") hangi sanatçının eseridir?',
    options: ['Donatello', 'Michelangelo', 'Bernini', 'Rodin'],
    correctIndex: 1,
    info: 'Pietà (1499), Michelangelo\'nun Vatikan\'daki başyapıtıdır; Meryem\'in kucağında İsa\'yı tasvir eder.',
  },
  {
    id: 'a62', type: 'heykel', difficulty: 'orta',
    image: wikiImg('Venus_de_Milo_Louvre_Ma399_n4.jpg'),
    prompt: 'Louvre\'daki bu antik heykelin adı nedir?',
    options: ['Milo Venüsü', 'Semadirek Nikesi', 'Athena Parthenos', 'Diskobol'],
    correctIndex: 0,
    info: 'Milo Venüsü (MÖ ~130-100), antik Yunan heykeltıraşlığının en ünlü örneklerindendir; kolları hiçbir zaman bulunamamıştır.',
  },
  {
    id: 'a63', type: 'heykel', difficulty: 'zor',
    image: wikiImg('Nike_of_Samothrake_Louvre_Ma2369_n4.jpg'),
    prompt: 'Louvre merdivenlerindeki bu kanatlı zafer heykelinin adı nedir?',
    options: ['Milo Venüsü', 'Semadirek Nikesi (Kanatlı Zafer)', 'Artemis', 'Nemesis'],
    correctIndex: 1,
    info: 'Semadirek Nikesi (MÖ ~190), zafer tanrıçası Nike\'yi gemi pruvasına konarken tasvir eden Helenistik başyapıttır.',
  },
  {
    id: 'a64', type: 'eser', difficulty: 'kolay',
    prompt: '"Suç ve Ceza" romanının yazarı kimdir?',
    options: ['Tolstoy', 'Dostoyevski', 'Çehov', 'Gogol'],
    correctIndex: 1,
    info: 'Suç ve Ceza (1866), Fyodor Dostoyevski\'nin başyapıtıdır; Raskolnikov karakteriyle vicdan ve suç psikolojisini işler.',
  },
  {
    id: 'a65', type: 'eser', difficulty: 'kolay',
    prompt: '"Savaş ve Barış" romanının yazarı kimdir?',
    options: ['Lev Tolstoy', 'Dostoyevski', 'Turgenyev', 'Puşkin'],
    correctIndex: 0,
    info: 'Savaş ve Barış (1869), Lev Tolstoy\'un Napolyon savaşları dönemindeki Rus toplumunu anlatan dev eseridir.',
  },
  {
    id: 'a66', type: 'eser', difficulty: 'orta',
    prompt: '"İnce Memed" romanının yazarı kimdir?',
    options: ['Yaşar Kemal', 'Orhan Kemal', 'Kemal Tahir', 'Fakir Baykurt'],
    correctIndex: 0,
    info: 'İnce Memed (1955), Yaşar Kemal\'in Çukurova\'da geçen destansı romanıdır; 40\'tan fazla dile çevrilmiştir.',
  },
  {
    id: 'a67', type: 'eser', difficulty: 'orta',
    prompt: '"Tutunamayanlar" romanının yazarı kimdir?',
    options: ['Oğuz Atay', 'Ahmet Hamdi Tanpınar', 'Yusuf Atılgan', 'Sait Faik'],
    correctIndex: 0,
    info: 'Tutunamayanlar (1971-72), Oğuz Atay\'ın modern Türk edebiyatının en önemli eserlerinden sayılan romanıdır.',
  },
  {
    id: 'a68', type: 'eser', difficulty: 'orta',
    prompt: '"Saatleri Ayarlama Enstitüsü" hangi yazarın eseridir?',
    options: ['Ahmet Hamdi Tanpınar', 'Peyami Safa', 'Refik Halit Karay', 'Halid Ziya'],
    correctIndex: 0,
    info: 'Saatleri Ayarlama Enstitüsü (1961), Tanpınar\'ın Doğu-Batı ikilemini ironiyle işleyen başyapıtıdır.',
  },
  {
    id: 'a69', type: 'eser', difficulty: 'kolay',
    prompt: '"Kürk Mantolu Madonna" romanının yazarı kimdir?',
    options: ['Sabahattin Ali', 'Sait Faik', 'Orhan Veli', 'Nazım Hikmet'],
    correctIndex: 0,
    info: 'Kürk Mantolu Madonna (1943), Sabahattin Ali\'nin Raif Efendi ile Maria Puder\'in aşkını anlatan romanıdır.',
  },
  {
    id: 'a70', type: 'eser', difficulty: 'zor',
    prompt: '"Dönüşüm" (Die Verwandlung) adlı eserinde bir sabah böceğe dönüşen Gregor Samsa\'yı anlatan yazar kimdir?',
    options: ['Franz Kafka', 'Albert Camus', 'Hermann Hesse', 'Thomas Mann'],
    correctIndex: 0,
    info: 'Dönüşüm (1915), Franz Kafka\'nın modern edebiyatın en etkili öykülerinden biri sayılan eseridir.',
  },
  {
    id: 'a71', type: 'eser', difficulty: 'orta',
    prompt: '"1984" ve "Hayvan Çiftliği" hangi yazarın eserleridir?',
    options: ['Aldous Huxley', 'George Orwell', 'Ray Bradbury', 'H.G. Wells'],
    correctIndex: 1,
    info: 'George Orwell, totaliter rejimleri eleştirdiği 1984 (1949) ve Hayvan Çiftliği (1945) ile dünya klasikleri arasına girdi.',
  },
  {
    id: 'a72', type: 'eser', difficulty: 'zor',
    prompt: '"Yüzyıllık Yalnızlık" romanıyla Nobel kazanan Kolombiyalı yazar kimdir?',
    options: ['Jorge Luis Borges', 'Gabriel García Márquez', 'Mario Vargas Llosa', 'Pablo Neruda'],
    correctIndex: 1,
    info: 'Yüzyıllık Yalnızlık (1967), büyülü gerçekçiliğin başyapıtıdır; Márquez 1982\'de Nobel Edebiyat Ödülü aldı.',
  },
  {
    id: 'a73', type: 'karakter', difficulty: 'kolay',
    prompt: 'Cervantes\'in romanında yel değirmenlerine saldıran karakter kimdir?',
    options: ['Don Kişot', 'Sancho Panza', 'Hamlet', 'Faust'],
    correctIndex: 0,
    info: 'Don Kişot (1605), Cervantes\'in eseridir; modern romanın ilk örneği kabul edilir. Yel değirmenlerini dev sanarak saldırır.',
  },
  {
    id: 'a74', type: 'karakter', difficulty: 'orta',
    prompt: '"Olmak ya da olmamak" repliğiyle ünlü Shakespeare karakteri hangisidir?',
    options: ['Macbeth', 'Othello', 'Hamlet', 'Kral Lear'],
    correctIndex: 2,
    info: 'Bu ünlü monolog, Shakespeare\'in Hamlet (1601) trajedisinde Danimarka Prensi Hamlet\'e aittir.',
  },
  {
    id: 'a75', type: 'karakter', difficulty: 'orta',
    prompt: 'Yaşlı balıkçı Santiago, hangi Nobel ödüllü yazarın eserinin kahramanıdır?',
    options: ['John Steinbeck', 'Ernest Hemingway', 'William Faulkner', 'Mark Twain'],
    correctIndex: 1,
    info: 'İhtiyar Adam ve Deniz (1952), Hemingway\'e Pulitzer ve Nobel getiren kısa romandır; Santiago dev bir kılıç balığıyla mücadele eder.',
  },
  {
    id: 'a76', type: 'karakter', difficulty: 'zor',
    prompt: 'Goethe\'nin eserinde ruhunu şeytan Mefistofeles\'e satan karakter kimdir?',
    options: ['Faust', 'Werther', 'Wilhelm Meister', 'Prometheus'],
    correctIndex: 0,
    info: 'Faust, Goethe\'nin 60 yılda tamamladığı başyapıtıdır; bilgiye doymayan Faust, ruhunu Mefistofeles\'e satar.',
  },
  {
    id: 'a77', type: 'film', difficulty: 'orta',
    prompt: '2019\'da "Parazit" filmiyle Oscar kazanan Güney Koreli yönetmen kimdir?',
    options: ['Park Chan-wook', 'Bong Joon-ho', 'Kim Ki-duk', 'Lee Chang-dong'],
    correctIndex: 1,
    info: 'Bong Joon-ho\'nun Parazit\'i (2019), Oscar tarihinde En İyi Film ödülünü kazanan ilk yabancı dilde film oldu.',
  },
  {
    id: 'a78', type: 'film', difficulty: 'orta',
    prompt: '"Baba" (The Godfather) filminin yönetmeni kimdir?',
    options: ['Martin Scorsese', 'Francis Ford Coppola', 'Stanley Kubrick', 'Steven Spielberg'],
    correctIndex: 1,
    info: 'Baba (1972), Francis Ford Coppola\'nın Mario Puzo romanından uyarladığı, sinema tarihinin en iyi filmlerinden sayılan yapıttır.',
  },
  {
    id: 'a79', type: 'film', difficulty: 'zor',
    prompt: '"Yedinci Mühür" ve "Yaban Çilekleri" filmlerinin İsveçli yönetmeni kimdir?',
    options: ['Ingmar Bergman', 'Andrei Tarkovsky', 'Federico Fellini', 'Akira Kurosawa'],
    correctIndex: 0,
    info: 'Ingmar Bergman, varoluşsal temalarıyla sinema tarihinin en etkili yönetmenlerindendir; Yedinci Mühür\'de (1957) şövalye Ölüm\'le satranç oynar.',
  },
  {
    id: 'a80', type: 'film', difficulty: 'orta',
    prompt: '"Yedi Samuray" ve "Rashomon" filmlerinin Japon yönetmeni kimdir?',
    options: ['Yasujiro Ozu', 'Akira Kurosawa', 'Kenji Mizoguchi', 'Hayao Miyazaki'],
    correctIndex: 1,
    info: 'Akira Kurosawa, dünya sinemasını derinden etkileyen Japon yönetmendir; Yedi Samuray (1954) birçok Hollywood filmine ilham verdi.',
  },
];

export function getDailyArtQuestion(): ArtQuestion {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return ART_QUESTIONS[seed % ART_QUESTIONS.length];
}

export function getArtByDifficulty(difficulty: ArtDifficulty): ArtQuestion[] {
  return ART_QUESTIONS.filter((q) => q.difficulty === difficulty);
}

// Belirli zorluktan rastgele N soru (her test farklı set)
export function pickArtTest(difficulty: ArtDifficulty, count = 5): ArtQuestion[] {
  const pool = getArtByDifficulty(difficulty);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export const ART_DIFFICULTY_LABELS: Record<ArtDifficulty, string> = {
  kolay: 'Kolay',
  orta: 'Orta',
  zor: 'Zor',
};
