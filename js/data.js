/**
 * શાસ્ત્રીજી જીતેન્દ્ર જોષી - પ્રારંભિક પૂજા ડેટા (Seed Data)
 * 100% શુદ્ધ ગુજરાતી ભાષામાં સંપૂર્ણ વિગતો
 */

export const INITIAL_PROFILE = {
  name: "શાસ્ત્રીજી જીતેન્દ્ર જોષી (જીતુભાઈ જોષી)",
  phone: "99252 64929",
  whatsapp: "9925264929",
  subtitle: "કર્મકાંડ • ધાર્મિક • સામાજિક • વ્રત વિધાન સંબંધિત આવશ્યક માર્ગદર્શન",
  avatarUrl: "assets/images/shastriji-profile.jpg",
  visitingCardUrl: "assets/images/shastriji-visiting-card.jpg",
  pin: "1234"
};

export const INITIAL_SERVICES = [
  {
    id: "ganesh-puja",
    title: "ગણેશ પૂજા",
    englishTitle: "Ganesh Puja / Ganpati Pooja",
    category: "ધાર્મિક પૂજા",
    subtitle: "વિધિવત પૂજા માર્ગદર્શિકા",
    price: "દક્ષિણા માટે સંપર્ક કરો",
    badge: "પ્રથમ પૂજ્ય દેવ",
    thumbnailUrl: "assets/images/card-ganesh.png",
    keywords: [
      "ganesh", "ganesha", "ganpati", "ganapathi", "ganeshji", "vinayak", "vighnaharta", "pratham pujya", 
      "bappa", "modak", "ladu", "laddu", "durva", "dharo", "kanku", "supari", "sopari", "shrifal", "coconut", 
      "ગણેશ", "ગણપતિ", "વિનાયક", "વિઘ્નહર્તા", "મોદક", "દૂર્વા", "જનોઈ"
    ],
    originalPamphlets: [],
    pujapo: "શ્રીફળ-૧, સોપારી-૫, કંકુ, અબીલ, ગુલાલ, સિંદૂર, નાડાછડી દડી-૧, જનોઈ જોડી-૧, લવિંગ-એલચી, કપૂર, અગરબત્તી, ધૂપ, દૂર્વા (ધરો), આસોપાલવ પાન, નાગરવેલના પાન-૫, લાલ વસ્ત્ર (પીસ)-૧, ફળ-ફૂલ અને મોદક / લાડુ પ્રસાદ.",
    anajNaivedya: "ઘઉં, ચોખા, ગોળ, સાકર, મોદક, બેસનના લાડુ, ઋતુફળ.",
    taiyari: "બાજોઠ-૧, પાટલો-૧, થાળી-૨, વાટકા-૨, ચમચી-૨, તાંબાનો લોટો, પંચામૃત (દૂધ, દહીં, ઘી, મધ, સાકર), ઘીનો દીવો, બાકસ, આસન.",
    notes: "કોઈપણ શુભ કાર્ય, વાસ્તુ કે પૂજાની શરૂઆતમાં નિર્વિઘ્ન સમાપ્તિ માટે ગણપતિ સ્થાપન અને પૂજન અનિવાર્ય છે."
  },
  {
    id: "lakshmi-puja",
    title: "લક્ષ્મી પૂજા",
    englishTitle: "Lakshmi Puja / Laxmi Pooja",
    category: "ધાર્મિક પૂજા",
    subtitle: "વિધિવત પૂજા માર્ગદર્શિકા",
    price: "દક્ષિણા માટે સંપર્ક કરો",
    badge: "સુખ-સમૃદ્ધિ પ્રદાતા",
    thumbnailUrl: "assets/images/card-lakshmi.png",
    keywords: [
      "lakshmi", "laxmi", "mahalakshmi", "mahalaxmi", "laxmi puja", "lakshmi puja", "laxmi pooja", 
      "dhan", "samriddhi", "diwali", "dhanteras", "kamal", "lotus", "shikka", "chandi", "shrifal", 
      "coconut", "supari", "sopari", "kanku", "kumkum", "લક્ષ્મી", "મહાલક્ષ્મી", "ધન", "ધનતેરસ", "કમળ"
    ],
    originalPamphlets: [],
    pujapo: "શ્રીફળ-૧, સોપારી-૭, કંકુ, ચંદન, અક્ષત (ચોખા), કમળ કાકડી, ગોમતી ચક્ર, કોડી-૫, લાલ અથવા પીળું વસ્ત્ર (પીસ), ગુલાબ કે કમળના પુષ્પ, અત્તર, નાડાછડી, ધૂપ-દીપ, ગંગાજળ, કપૂર.",
    anajNaivedya: "ચોખા, સાકર, દૂધની ખીર, પતાસા, ૫ પ્રકારના સૂકામેવા (કાજુ, બદામ, દ્રાક્ષ), ફળફળાદિ.",
    taiyari: "ચાંદી અથવા તાંબાનો કળશ, આસોપાલવ પાન, બાજોઠ-૧, થાળી-૩, વાટકા, ઘીના કોડિયા, પંચામૃત, આસન.",
    notes: "મા લક્ષ્મીની શાસ્ત્રોક્ત આરાધનાથી ઘરમાં અખંડ લક્ષ્મી, સુખ-શાંતિ અને વૈભવની પ્રાપ્તિ થાય છે."
  },
  {
    id: "navgrah-puja",
    title: "નવગ્રહ પૂજા",
    englishTitle: "Navgrah Puja / Navgraha Shanti",
    category: "કર્મકાંડ",
    subtitle: "વિધિવત પૂજા માર્ગદર્શિકા",
    price: "દક્ષિણા માટે સંપર્ક કરો",
    badge: "ગ્રહદોષ શાંતિ",
    thumbnailUrl: "assets/images/card-navgrah.png",
    keywords: [
      "navgrah", "navgraha", "navagraha", "graha", "grah", "grah shanti", "graha dosh", "grah dosh", 
      "havan", "samidha", "surya", "chandra", "mangal", "budh", "guru", "shukra", "shani", "rahu", "ketu", 
      "નવગ્રહ", "ગ્રહ શાંતિ", "ગ્રહદોષ", "હવન"
    ],
    originalPamphlets: [],
    pujapo: "શ્રીફળ-૧, સોપારી-૯ નંગ, નવગ્રહ સમિધા (આકડો, ખેર, ખાખરો, બોર વગેરે), કંકુ, અબીલ, ગુલાલ, ચંદન, જનોઈ-૨, કપૂર, અગરબત્તી, હવન સામગ્રી, જવ, તલ, કાળાતલ, નાડાછડી દડી.",
    anajNaivedya: "નવધાન્ય (ઘઉં, ચોખા, તુવેર, મગ, ચણા, વાલ, અડદ, તલ, કુલથી), ઋતુફળ, ગોળ-સુખડી કે લાડુ.",
    taiyari: "બાજોઠ, નવગ્રહ મંડળ પટ, હવન કુંડ, શુદ્ધ ગાયનું ઘી, લાકડાનો ચમચો (શ્રુવા), થાળીઓ, તાંબાના લોટા, આસન.",
    notes: "જન્મકુંડળીમાં ગ્રહપીડા નિવારણ અને જીવનમાં આરોગ્ય, પ્રગતિ અને સ્થિરતા માટે નવગ્રહ શાંતિ પૂજા વિધાન."
  },
  {
    id: "satyanarayan-puja",
    title: "સત્યનારાયણ કથા",
    englishTitle: "Shree Satyanarayan Dev Katha / Pooja",
    category: "વ્રત અને ઉદ્યાપન",
    subtitle: "વિધિવત પૂજા માર્ગદર્શિકા",
    price: "દક્ષિણા માટે સંપર્ક કરો",
    badge: "સર્વ મનોકામના પૂર્ણ",
    thumbnailUrl: "assets/images/card-satyanarayan.png",
    keywords: [
      "satyanarayan", "satyanarayana", "satya narayan", "satynarayan", "satyanarayan dev", 
      "satyanarayan dev ni katha", "satyanarayan katha", "satyanarayan pooja", "satyanarayan puja", 
      "katha", "vrat", "udyapan", "sheera", "shiro", "prasad", "kel na pan", "banana leaves", 
      "tulsi", "panchamrut", "સત્યનારાયણ", "કથા", "સત્યનારાયણ દેવની કથા", "સત્યનારાયણ કથા", 
      "વ્રત", "ઉદ્યાપન", "શીરો", "પ્રસાદ", "કેળના પાન"
    ],
    originalPamphlets: [
      {
        title: "સત્યનારાયણ પૂજાપો (અસલ પેમ્ફ્લેટ)",
        url: "assets/images/satyanarayan-pamphlet-original.jpg"
      }
    ],
    pujapo: "શ્રીફળ -૧, સોપારી -૧૫ નંગ, અબીલ, ગુલાલ, કંકુ, ચંદન-સિંદુર, તજ, લવિંગ, એલચી, ગોળ, સાકર-૧૦૦ ગ્રામ, દ્રાક્ષ-૧૦૦ગ્રા, કાજુ-૧૦૦, બદામ-૧૦૦ગ્રા, લાલ પીસ-૧, સફેદ પીસ-૧, ઘઉં, ચોખા- સવાશેર, ફળ, ફૂલ, ફૂલહાર નાનો-૧, આસોપાલવ પાન નુ તોરણ, આસોપાલવ પાન, તુલસીપત્ર, પ્રસાદ, પડીયા ના પેકેટ, નાડાછડી દડી, કપૂર, એક નંગ સુતળી, કેળના પાન-૪.",
    anajNaivedya: "ઘઉં, ચોખા સવાશેર, ઋતુ પ્રમાણે તાજા ફળો, પંચામૃત અને શિરાનો પવિત્ર પ્રસાદ.",
    taiyari: "બાજોઠ-૧, પાટલો-૧, થાળી-૫, વાટકા-૫, ચમચી-૩, પંચામૃત, ધૂપ-દીપ, અગરબત્તી સ્ટેન્ડ, બાકસ, આસન-૩.",
    notes: "સત્યનારાયણ કથા શ્રવણ કરવાથી ઘરમાં સુખ, શાંતિ, સમૃદ્ધિ અને પારિવારિક એકતા વધે છે."
  },
  {
    id: "gruhpravesh-puja",
    title: "ગૃહપ્રવેશ પૂજા",
    englishTitle: "Gruh Pravesh / Vastu Shanti Puja",
    category: "કર્મકાંડ",
    subtitle: "વિધિવત પૂજા માર્ગદર્શિકા",
    price: "દક્ષિણા માટે સંપર્ક કરો",
    badge: "વાસ્તુ શાંતિ વિધાન",
    thumbnailUrl: "assets/images/card-gruhpravesh.png",
    keywords: [
      "vastu", "vaastu", "vastu shanti", "vastu puja", "vastu pooja", "gruhpravesh", "gruh pravesh", 
      "griha pravesh", "house warming", "new home", "home", "ghar", "makan", "toran", "asopalav", 
      "yantra", "વાસ્તુ", "વાસ્તુ શાંતિ", "ગૃહપ્રવેશ", "નવું ઘર", "મકાન", "તોરણ"
    ],
    originalPamphlets: [],
    pujapo: "શ્રીફળ-૩, સોપારી-૨૧, કંકુ, અબીલ, ગુલાલ, સિંદૂર, હળદર ગાંઠિયા-૫, નાડાછડી, આસોપાલવ પાન તોરણ, ગંગાજળ, ગૌમૂત્ર, વાસ્તુ યંત્ર, તાંબાનો મોટો કળશ, દૂર્વા, તુલસી, હવન સામગ્રી, કપૂર, અગરબત્તી.",
    anajNaivedya: "ઘઉં, ચોખા, ગોળ, તાજું દૂધ (ઉભરો લાવવા માટે), સાકર, ખીર, લાડુ પ્રસાદ.",
    taiyari: "બાજોઠ-૨, પાટલા, થાળી-૫, વાટકા-૫, તાંબાનો લોટો, હવનકુંડ, સૂકા લાકડા/ગાયના છાણાં, આસન.",
    notes: "નવા મકાનમાં વાસ્તુ શાંતિ અને ગણેશ સ્થાપનથી મકાનમાંથી તમામ નકારાત્મક ઉર્જા દૂર થઈ સુખ-શાંતિનો વાસ થાય છે."
  },
  {
    id: "havan-yajna",
    title: "હવન અને યજ્ઞ",
    englishTitle: "Havan and Yajna / Vedic Homa",
    category: "કર્મકાંડ",
    subtitle: "વિધિવત પૂજા માર્ગદર્શિકા",
    price: "દક્ષિણા માટે સંપર્ક કરો",
    badge: "પવિત્ર અગ્નિહોત્ર",
    thumbnailUrl: "assets/images/card-havan.png",
    keywords: [
      "havan", "hawan", "yajna", "yagya", "homa", "agnihotra", "havan kund", "samidha", 
      "ghee", "guggal", "loban", "pavitra agni", "હવન", "યજ્ઞ", "હોમ", "અગ્નિહોત્ર", "હવન કુંડ"
    ],
    originalPamphlets: [],
    pujapo: "હવન કુંડ, શુદ્ધ ગાયનું ઘી, વૈદિક હવન સામગ્રી પેકેટ, જવ, તલ, કાળાતલ, કપૂર, ગૂગળ, લોબાન, પવિત્ર સમિધા (પીપળો, આંબો, ખાખરો), કંકુ, નાડાછડી, સોપારી, શ્રીફળ હોમવા માટે-૧.",
    anajNaivedya: "ઘઉં, ચોખા, ગોળ, સુખડી, ખીર, પંચામૃત, મોસમી ફળો.",
    taiyari: "હવન કુંડ, બાજોઠ, પાટલો, ચમચો (શ્રુવા), થાળી, વાટકા, પાણીનો લોટો, આસન.",
    notes: "યજ્ઞ અને હવન દ્વારા વાતાવરણની શુદ્ધિ થાય છે અને ઈષ્ટદેવો તથા પિતૃઓ સંતુષ્ટ થઈ સર્વ મનોકામના પૂર્ણ કરે છે."
  },
  {
    id: "vivah-sanskar",
    title: "વિવાહ સંસ્કાર",
    englishTitle: "Vivah Sanskar / Hindu Wedding Ceremony",
    category: "સામાજિક વિધિ",
    subtitle: "વિધિવત પૂજા માર્ગદર્શિકા",
    price: "દક્ષિણા માટે સંપર્ક કરો",
    badge: "પવિત્ર સપ્તપદી",
    thumbnailUrl: "assets/images/card-vivah.png",
    keywords: [
      "vivah", "vivaha", "lagna", "lagn", "marriage", "wedding", "saptapadi", "hastmelap", 
      "hast melap", "var mala", "varmala", "mangalsutra", "chheda chhedi", "kansar", "chori", 
      "kanyadaan", "વિવાહ", "લગ્ન", "હસ્તમેળાપ", "સપ્તપદી", "મંગળસૂત્ર", "કન્યાદાન"
    ],
    originalPamphlets: [],
    pujapo: "મંગળસૂત્ર, વરમાળા-૨, હસ્તમેળાપ વસ્ત્ર, છેડાછેડી, કંકુ, ચોખા, હળદર, નાડાછડી, સોપારી-૨૫, શ્રીફળ-૪, જનોઈ, અબીલ, ગુલાલ, કપૂર, કાજલ, મીંઢળ-૨, કોડિયું, કન્યાદાન સામગ્રી.",
    anajNaivedya: "કંસાર (ઘઉંનો લોટ, શુદ્ધ ઘી, ગોળ), વિવિધ મિષ્ટાન્ન, લાડુ, ઋતુફળ.",
    taiyari: "ચોરીના બાજોઠ, પાટલા-૪, થાળીઓ, તાંબાના કળશ, હવન સામગ્રી, અગ્નિ પ્રદીપ્ત સામગ્રી, આસન.",
    notes: "હિન્દુ વૈદિક સંસ્કૃતિના ૧૬ સંસ્કારોમાં વિવાહ સંસ્કાર એ બે આત્માઓ અને પરિવારોનું પવિત્ર મિલન છે."
  },
  {
    id: "anya-pooja",
    title: "અન્ય પૂજા",
    englishTitle: "Rudra Abhishek / Kaalsarp / Other Poojas",
    category: "સામાજિક વિધિ",
    subtitle: "વિધિવત પૂજા માર્ગદર્શિકા",
    price: "દક્ષિણા માટે સંપર્ક કરો",
    badge: "શાસ્ત્રોક્ત માર્ગદર્શન",
    thumbnailUrl: "assets/images/card-anyapooja.png",
    keywords: [
      "rudra", "rudrabhishek", "rudrabhisheka", "shiva", "shiv", "mahadev", "bholenath", 
      "bilipatra", "bili", "gangajal", "dudh", "milk", "kaalsarp", "kal sarp", "pitru", 
      "tarpan", "shraddh", "janoi", "upanayan", "sacred thread", "shrimant", "godh bharai", 
      "dharmaraja", "surya", "surya dev", "રુદ્રાભિષેક", "મહાદેવ", "શિવ", "કાળસર્પ", 
      "પિતૃતર્પણ", "શ્રાદ્ધ", "જનોઈ", "સીમંત", "સૂર્યદેવ", "ધર્મરાજા"
    ],
    originalPamphlets: [
      {
        title: "ધર્મરાજા સૂર્ય દેવ - ૧ (પૂજાપો અને અનાજ)",
        url: "assets/images/dharmaraja-pamphlet-1-original.jpg"
      },
      {
        title: "ધર્મરાજા સૂર્ય દેવ - ૨ (મૂર્તિ અને વાસણ)",
        url: "assets/images/dharmaraja-pamphlet-2-original.jpg"
      }
    ],
    pujapo: "રુદ્રાભિષેક, મહામૃત્યુંજય જાપ, કાળસર્પ દોષ પૂજા, પિતૃતર્પણ, શ્રાદ્ધ વિધિ, જનોઈ સંસ્કાર, સીમંત વિધિ, સૂર્યદેવ-ધર્મરાજા ઉદ્યાપન અને વાર્ષિક ઉત્સવ પૂજા સંબંધિત સંપૂર્ણ શાસ્ત્રોક્ત સામગ્રી.",
    anajNaivedya: "વિધિ અનુસાર પંચામૃત, બિલ્વપત્ર, ગંગાજળ, અનાજ, સીધુ અને વિશેષ નૈવેદ્ય.",
    taiyari: "શાસ્ત્રીજી જીતેન્દ્ર જોષીના માર્ગદર્શન મુજબ યજમાનના ઘર અને વિધિના પ્રકાર અનુસાર સંપૂર્ણ પવિત્ર આયોજન.",
    notes: "કોઈપણ વિશેષ વિધિ કે સંકલ્પ પૂજા માટે શાસ્ત્રીજીનો સીધો સંપર્ક કરી વિગતવાર માર્ગદર્શન મેળવી શકાય છે."
  }
];

export const CATEGORIES = [
  "બધી વિધિઓ",
  "કર્મકાંડ",
  "ધાર્મિક પૂજા",
  "વ્રત અને ઉદ્યાપન",
  "સામાજિક વિધિ"
];

/**
 * સામાન્ય પૂજા સામગ્રી - દરેક પૂજા માટે બાય ડિફોલ્ટ સેટ થશે
 * શાસ્ત્રીજી જરૂર મુજબ આમાં વધ-ઘટ કે ફેરફાર કરી શકે છે
 */
export const DEFAULT_COMMON_SAMAGRI = {
  pujapo: "શ્રીફળ-૧, સોપારી-૫, કંકુ, અબીલ, ગુલાલ, સિંદૂર, નાડાછડી દડી-૧, જનોઈ જોડી-૧, લવિંગ-એલચી, કપૂર, અગરબત્તી, ધૂપ, દૂર્વા (ધરો), આસોપાલવ પાન, નાગરવેલના પાન-૫, લાલ વસ્ત્ર (પીસ)-૧, અત્તર, ગંગાજળ, ઋતુફળ અને પુષ્પ.",
  anajNaivedya: "ઘઉં, ચોખા (અક્ષત), ગોળ, સાકર, ઋતુફળ, પંચામૃત સામગ્રી (દૂધ, દહીં, ઘી, મધ, સાકર), પ્રસાદ.",
  taiyari: "બાજોઠ-૧, પાટલો-૧, થાળી-૨, વાટકા-૨, ચમચી-૨, તાંબાનો લોટો (કળશ), ઘીનો દીવો, બાકસ, બેસવા માટે આસન.",
  price: "દક્ષિણા માટે સંપર્ક કરો",
  badge: "ધાર્મિક પૂજા વિધાન"
};
