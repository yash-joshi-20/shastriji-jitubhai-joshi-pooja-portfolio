/**
 * શાસ્ત્રીજી જીતેન્દ્ર જોષી - ડાયનામિક દેવ ઈમેજ જનરેશન એન્જિન
 * ટાઈટલ અને કીવર્ડ્સ પરથી આપમેળે સંબંધિત દેવ/મૂર્તિની દિવ્ય ઈમેજ તૈયાર કરે છે
 * 100% શુદ્ધ ગુજરાતી, મોબાઈલ ફર્સ્ટ, ઝીરો લેટન્સી (Real-time Instant Generation)
 */

export const DEITY_REGISTRY = [
  {
    id: 'saraswati',
    name: 'મા સરસ્વતીજી',
    icon: '🪕',
    symbol: 'વીણા',
    titleSample: 'સરસ્વતી પૂજા',
    url: 'assets/images/card-saraswati.png',
    theme: 'sandalwood',
    shloka: '।। ॐ ऐं सरस्वत्यै नमः ।।   •   ।। विद्यां बुद्धिं प्रदेहि मे ।।',
    mantraShort: '।। શ્રી સરસ્વત્યૈ નમઃ ।।',
    keywords: [
      'સરસ્વતી', 'શારદા', 'વીણા', 'વિદ્યા', 'પુસ્તક', 'હંસ', 'સરસ્વતીપૂજા', 'વસંતપંચમી',
      'saraswati', 'sarasvati', 'sharada', 'sharda', 'veena', 'vidya', 'vasant panchami', 'vasant'
    ]
  },
  {
    id: 'vishnu',
    name: 'શ્રી વિષ્ણુ ભગવાન (નારાયણ)',
    icon: '🪷',
    symbol: 'ચક્ર',
    titleSample: 'શ્રી વિષ્ણુ પૂજા',
    url: 'assets/images/card-vishnu.png',
    theme: 'amber',
    shloka: '।। ॐ नमो भगवते वासुदेवाय ।।   •   ।। शान्ताकारं भुजगशयनम् ।।',
    mantraShort: '।। ॐ શ્રી વિષ્ણવે નમઃ ।।',
    keywords: [
      'વિષ્ણુ', 'નારાયણ', 'લક્ષ્મીનારાયણ', 'શેષશાયી', 'સુદર્શન', 'શંખ', 'શ્રીહરિ', 'વૈકુંઠ', 'વિષ્ણુસહસ્રનામ', 'એકાદશી',
      'vishnu', 'narayan', 'lakshminarayan', 'shree hari', 'sudarshan', 'sheshnag', 'vaikuntha', 'ekadashi'
    ]
  },
  {
    id: 'ganesh',
    name: 'શ્રી ગણેશજી',
    icon: '🕉️',
    symbol: 'ॐ',
    titleSample: 'ગણેશ પૂજા',
    url: 'assets/images/card-ganesh.png',
    theme: 'maroon',
    shloka: '।। શ્રી ગણેશાય નમઃ ।।   •   ।। વક્રતુંડ મહાકાય સૂર્યકોટિ સમપ્રભ ।।',
    mantraShort: '।। શ્રી ગણેશાય નમઃ ।।',
    keywords: [
      'ગણેશ', 'ગણપતિ', 'વિનાયક', 'વિઘ્નહર્તા', 'બાપ્પા', 'મોદક', 'દૂર્વા', 'સિંદૂર', 'લાડુ', 'ચતુર્થી',
      'ganesh', 'ganesha', 'ganpati', 'ganapathi', 'vinayak', 'vighnaharta', 'bappa', 'chaturthi'
    ]
  },
  {
    id: 'lakshmi',
    name: 'મા લક્ષ્મીજી',
    icon: '🌸',
    symbol: 'શ્રી',
    titleSample: 'લક્ષ્મી પૂજા',
    url: 'assets/images/card-lakshmi.png',
    theme: 'gold',
    shloka: '।। ॐ श्रीं ह्रीं श्रीं कमले कमलालये नमः ।।   •   ।। શુભ લાભ ।।',
    mantraShort: '।। મા મહાલક્ષ્મ્યૈ નમઃ ।।',
    keywords: [
      'લક્ષ્મી', 'મહાલક્ષ્મી', 'ધનતેરસ', 'દિવાળી', 'ધન', 'કમળ', 'વૈભવ', 'સમૃદ્ધિ', 'શ્રીયંત્ર',
      'lakshmi', 'laxmi', 'mahalakshmi', 'mahalaxmi', 'dhanteras', 'diwali', 'kamal', 'lotus', 'dhan'
    ]
  },
  {
    id: 'shiva',
    name: 'દેવાધિદેવ શિવ (મહાદેવ / રુદ્ર)',
    icon: '🔱',
    symbol: 'ૐ',
    titleSample: 'શિવ રુદ્રાભિષેક પૂજા',
    url: 'assets/images/card-shiva.png',
    theme: 'himalaya',
    shloka: '।। ॐ नमः शिवाय ।।   •   ।। ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ।।',
    mantraShort: '।। હર હર મહાદેવ ।।',
    keywords: [
      'શિવ', 'મહાદેવ', 'રુદ્ર', 'રુદ્રાભિષેક', 'ભોલેનાથ', 'શંકર', 'નીલકંઠ', 'મૃત્યુંજય', 'બિલ્વપત્ર', 'કાશી', 'સોમનાથ', 'શિવરાત્રી',
      'shiva', 'shiv', 'mahadev', 'rudra', 'rudrabhishek', 'bholenath', 'shankar', 'mrityunjaya', 'shivratri'
    ]
  },
  {
    id: 'satyanarayan',
    name: 'શ્રી સત્યનારાયણ દેવ',
    icon: '🪷',
    symbol: 'સત્ય',
    titleSample: 'સત્યનારાયણ કથા',
    url: 'assets/images/card-satyanarayan.png',
    theme: 'amber',
    shloka: '।। શ્રી સત્યનારાયણાય નમઃ ।।   •   ।। સત્યમેવ જયતે ।।',
    mantraShort: '।। સત્યનારાયણ દેવ કી જય ।।',
    keywords: [
      'સત્યનારાયણ', 'કથા', 'વ્રત', 'ઉદ્યાપન', 'શીરો', 'કેળના પાન',
      'satyanarayan', 'satyanarayana', 'katha', 'vrat', 'sheera', 'satya'
    ]
  },
  {
    id: 'hanuman',
    name: 'શ્રી હનુમાનજી મહારાજ',
    icon: '🚩',
    symbol: 'ગદા',
    titleSample: 'શ્રી હનુમાન પૂજા',
    url: 'assets/images/card-hanuman.png',
    theme: 'saffron',
    shloka: '।। શ્રી હનુમતે નમઃ ।।   •   ।। અતુલિત બલધામં હેમશૈલાભદેહમ્ ।।',
    mantraShort: '।। જય બજરંગબલી ।।',
    keywords: [
      'હનુમાન', 'મારુતિ', 'અંજનીપુત્ર', 'બજરંગબલી', 'સંકટમોચન', 'ચાલીસા', 'સિંદૂર', 'વડવાનલ', 'શનિવાર',
      'hanuman', 'hanumanji', 'maruti', 'bajrangbali', 'chalisa', 'anjaneya'
    ]
  },
  {
    id: 'durga',
    name: 'મા દુર્ગા / અંબા માતાજી',
    icon: '🦁',
    symbol: 'ત્રિશૂળ',
    titleSample: 'મા દુર્ગા નવચંડી યજ્ઞ',
    url: 'assets/images/card-durga.png',
    theme: 'crimson',
    shloka: '।। ॐ दुं दुर्गायै नमः ।।   •   ।। સર્વમંગલ માંગલ્યે શિવે સર્વાર્થ સાધિકે ।।',
    mantraShort: '।। જય મા અંબે ।।',
    keywords: [
      'દુર્ગા', 'અંબા', 'નવદુર્ગા', 'ચંડી', 'નવચંડી', 'નવરાત્રી', 'માતાજી', 'કુળદેવી', 'કાળી', 'ખોડિયાર', 'મેલડી', 'ચામુંડા',
      'durga', 'amba', 'chandi', 'navchandi', 'navratri', 'mataji', 'kuldevi', 'chamunda', 'khodiyar'
    ]
  },
  {
    id: 'krishna',
    name: 'શ્રી કૃષ્ણ / દ્વારકાધીશ',
    icon: '🪈',
    symbol: 'મોરપિચ્છ',
    titleSample: 'શ્રી કૃષ્ણ જન્માષ્ટમી પૂજા',
    url: 'assets/images/card-krishna.png',
    theme: 'peacock',
    shloka: '।। ॐ क्लीं कृष्णाय नमઃ ।।   •   ।। કૃષ્ણાય વાસુદેવાય હરયે પરમાત્મને ।।',
    mantraShort: '।। શ્રી કૃષ્ણઃ શરણં મમ ।।',
    keywords: [
      'કૃષ્ણ', 'કાનહા', 'જન્માષ્ટમી', 'દ્વારકાધીશ', 'ગોપાલ', 'શ્યામ', 'રાધા', 'માખણ', 'મોરપંખ', 'બંસી',
      'krishna', 'kanha', 'janmashtami', 'dwarkadhish', 'gopal', 'radha', 'shyam'
    ]
  },
  {
    id: 'ram',
    name: 'શ્રી રામ દરબાર',
    icon: '🏹',
    symbol: 'ધનુષ',
    titleSample: 'શ્રી રામ દરબાર પૂજન',
    url: 'assets/images/card-ram.png',
    theme: 'royal_gold',
    shloka: '।। શ્રી રામચંદ્રાય નમઃ ।।   •   ।। મંગલ ભવન અમંગલ હારી ।।',
    mantraShort: '।। જય શ્રી રામ ।।',
    keywords: [
      'રામ', 'રામચંદ્ર', 'રામદરબાર', 'સિયા', 'રઘુનાથ', 'અયોધ્યા', 'રામનવમી', 'સીતારામ',
      'ram', 'rama', 'ramchandra', 'ramdarbar', 'sita', 'ayodhya', 'ramnavami'
    ]
  },
  {
    id: 'navgrah',
    name: 'સૂર્યદેવ & નવગ્રહ શાંતિ',
    icon: '☀️',
    symbol: 'સૂર્ય',
    titleSample: 'નવગ્રહ શાંતિ પૂજા',
    url: 'assets/images/card-navgrah.png',
    theme: 'saffron',
    shloka: '।। ॐ સૂર્યાય નમઃ ।।   •   ।। નવગ્રહ શાંતિ વિધાન ।।',
    mantraShort: '।। ॐ સૂર્યાય નમઃ ।।',
    keywords: [
      'નવગ્રહ', 'ગ્રહ', 'સૂર્ય', 'શનિ', 'રાહુ', 'કેતુ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'સૂર્યાય', 'ગ્રહદોષ',
      'navgrah', 'navgraha', 'surya', 'shani', 'rahu', 'ketu', 'mangal', 'grah'
    ]
  },
  {
    id: 'gruhpravesh',
    name: 'ગૃહપ્રવેશ & વાસ્તુ શાંતિ',
    icon: '🛕',
    symbol: 'કળશ',
    titleSample: 'ગૃહપ્રવેશ વાસ્તુ પૂજા',
    url: 'assets/images/card-gruhpravesh.png',
    theme: 'maroon',
    shloka: '।। ॐ વાસ્તુ પુરુષાય નમઃ ।।   •   ।। નૂતન ગૃહ શાંતિ વિધાન ।।',
    mantraShort: '।। શુભ વાસ્તુ પ્રવેશ ।।',
    keywords: [
      'વાસ્તુ', 'ગૃહપ્રવેશ', 'નવું ઘર', 'મકાન', 'ખાતમુહૂર્ત', 'તોરણ', 'કળશ', 'શાંતિ',
      'vastu', 'gruhpravesh', 'griha', 'housewarming', 'pravesh'
    ]
  },
  {
    id: 'havan',
    name: 'પવિત્ર વૈદિક હવન & યજ્ઞ',
    icon: '🔥',
    symbol: 'કુંડ',
    titleSample: 'પવિત્ર હવન & યજ્ઞ',
    url: 'assets/images/card-havan.png',
    theme: 'saffron',
    shloka: '।। ॐ અગ્નયે સ્વાહા ।।   •   ।। પવિત્ર વૈદિક યજ્ઞ હોત્ર ।।',
    mantraShort: '।। સ્વાહા ।।',
    keywords: [
      'હવન', 'યજ્ઞ', 'હોમ', 'અગ્નિહોત્ર', 'સમિધા', 'ગૂગળ', 'કુંડ',
      'havan', 'hawan', 'yajna', 'yagya', 'homa', 'agnihotra'
    ]
  },
  {
    id: 'vivah',
    name: 'વિવાહ સંસ્કાર હસ્તમેળાપ',
    icon: '💍',
    symbol: 'ગાંઠ',
    titleSample: 'વિવાહ સંસ્કાર પૂજા',
    url: 'assets/images/card-vivah.png',
    theme: 'crimson',
    shloka: '।। ॐ પ્રજાપતયે નમઃ ।।   •   ।। પવિત્ર સપ્તપદી મંગલ ફેરા ।।',
    mantraShort: '।। મંગલમ્ ભગવાન વિષ્ણુ ।।',
    keywords: [
      'વિવાહ', 'લગ્ન', 'સપ્તપદી', 'હસ્તમેળાપ', 'માંડવો', 'ચોરી', 'મંગળસૂત્ર', 'કન્યાદાન',
      'vivah', 'lagna', 'wedding', 'marriage', 'saptapadi', 'hastmelap'
    ]
  },
  {
    id: 'anyapooja',
    name: 'શાસ્ત્રોક્ત પૂજા આયોજન',
    icon: '🪔',
    symbol: 'દીપક',
    titleSample: 'અન્ય શાસ્ત્રોક્ત પૂજા',
    url: 'assets/images/card-anyapooja.png',
    theme: 'maroon',
    shloka: '।। ॐ નમઃ શિવાય ।।   •   ।। સર્વ મનોકામના પૂર્ણ ।।',
    mantraShort: '।। શુભમ્ ભવતુ ।।',
    keywords: [
      'અન્ય', 'સાત્વિક', 'વિધિ', 'પૂજા', 'સંકલ્પ', 'અર્ચન', 'પિતૃ', 'શ્રાદ્ધ', 'જનોઈ',
      'pooja', 'puja', 'vidhi', 'sanskar'
    ]
  }
];

/**
 * ટાઈટલ અને કીવર્ડ્સનું પૃથક્કરણ કરી સંબંધિત દેવ શોધો (Smart Deity Detector)
 * @param {string} title - પૂજાનું ગુજરાતી અથવા અંગ્રેજી શીર્ષક
 * @param {string} [category] - વિભાગ (ધાર્મિક પૂજા, કર્મકાંડ, વ્રત, વગેરે)
 * @returns {object} મેચ થયેલ દેવની વિગત
 */
export function detectDeity(title = '', category = '') {
  const cleanTitle = (title || '').trim().toLowerCase();
  const cleanCategory = (category || '').trim().toLowerCase();
  const combined = `${cleanTitle} ${cleanCategory}`;

  if (!cleanTitle && !cleanCategory) {
    return DEITY_REGISTRY.find(d => d.id === 'ganesh') || DEITY_REGISTRY[0];
  }

  // 1. Direct Keyword Matching with Priority Weight
  let bestMatch = null;
  let highestScore = 0;

  for (const deity of DEITY_REGISTRY) {
    let score = 0;

    for (const kw of deity.keywords) {
      const lowerKw = kw.toLowerCase();

      // Exact title contains full keyword
      if (cleanTitle.includes(lowerKw)) {
        score += 10;
        // Prefix/word match bonus
        if (cleanTitle.startsWith(lowerKw)) score += 5;
      } else if (combined.includes(lowerKw)) {
        score += 3;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = deity;
    }
  }

  if (bestMatch && highestScore > 0) {
    return bestMatch;
  }

  // 2. Fallback based on category
  if (cleanCategory.includes('વ્રત') || cleanCategory.includes('ઉદ્યાપન')) {
    return DEITY_REGISTRY.find(d => d.id === 'satyanarayan');
  }
  if (cleanCategory.includes('કર્મકાંડ')) {
    return DEITY_REGISTRY.find(d => d.id === 'havan');
  }
  if (cleanCategory.includes('સામાજિક')) {
    return DEITY_REGISTRY.find(d => d.id === 'vivah');
  }

  // Default to auspicious Lord Ganesh or Anya Pooja
  return DEITY_REGISTRY.find(d => d.id === 'ganesh');
}

/**
 * ટાઈટલ પરથી આપમેળે ઉચ્ચ રિઝોલ્યુશન પવિત્ર કાર્ડ (Canvas Image) બનાવે છે
 * @param {string} title - પૂજાનું શીર્ષક
 * @param {object} [options] - વધારાના વિકલ્પો
 * @returns {Promise<string>} Data URL અથવા Image URL
 */
export async function generateDeityImageFromTitle(title, options = {}) {
  const deity = detectDeity(title, options.category || '');
  const targetTitle = (title || '').trim() || deity.titleSample;

  // જો પ્રી-જનરેટેડ દિવ્ય આર્ટવર્ક મોજૂદ હોય, તો તે પ્રાથમિકતા તરીકે વાપરો
  if (deity.url && !options.forceCanvas) {
    return deity.url;
  }

  // નહીંતર ડાયનામિક HTML5 Canvas પર ઉચ્ચ ગુણવત્તાવાળું (1200x800) ગોલ્ડન કાર્ડ બનાવો
  return renderSacredCanvasCard(targetTitle, deity, options);
}

/**
 * ડાયનામિક કેનવાસ કાર્ડ કમ્પોઝિશન (Client-side Instant Rendering)
 */
export function renderSacredCanvasCard(title, deity, options = {}) {
  const width = 1200;
  const height = 800;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background Theme
  const isGold = deity.theme === 'gold' || deity.theme === 'sandalwood';
  const cx = width / 2;
  const cy = 300;

  const bgGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, width * 0.75);
  if (deity.theme === 'crimson') {
    bgGrad.addColorStop(0, '#9F1239');
    bgGrad.addColorStop(0.4, '#881337');
    bgGrad.addColorStop(1, '#4C0519');
  } else if (deity.theme === 'peacock') {
    bgGrad.addColorStop(0, '#1E40AF');
    bgGrad.addColorStop(0.4, '#1E3A8A');
    bgGrad.addColorStop(1, '#0F172A');
  } else if (deity.theme === 'saffron') {
    bgGrad.addColorStop(0, '#F59E0B');
    bgGrad.addColorStop(0.4, '#D97706');
    bgGrad.addColorStop(1, '#451A03');
  } else if (deity.theme === 'himalaya') {
    bgGrad.addColorStop(0, '#0284C7');
    bgGrad.addColorStop(0.35, '#0369A1');
    bgGrad.addColorStop(0.7, '#0C4A6E');
    bgGrad.addColorStop(1, '#082F49');
  } else {
    // Royal Maroon (Default)
    bgGrad.addColorStop(0, '#A82512');
    bgGrad.addColorStop(0.35, '#8B1E0F');
    bgGrad.addColorStop(0.7, '#580E05');
    bgGrad.addColorStop(1, '#2B0401');
  }

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Divine Sunburst Rays
  ctx.save();
  ctx.translate(cx, cy);
  const rays = 36;
  ctx.fillStyle = 'rgba(254, 243, 199, 0.08)';
  for (let i = 0; i < rays; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const angle = (i * 2 * Math.PI) / rays;
    const spread = (Math.PI / rays) * 0.45;
    ctx.arc(0, 0, width * 0.7, angle - spread, angle + spread);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Ornate Double Gold Borders
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2;
  ctx.strokeRect(38, 38, width - 76, height - 76);

  // Top Sacred Shloka Pill
  const pillW = 680;
  const pillH = 46;
  const pillX = (width - pillW) / 2;
  const pillY = 54;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  roundRect(ctx, pillX, pillY, pillW, pillH, 23);
  ctx.fill();
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 20px "Noto Sans Gujarati", serif';
  ctx.fillStyle = '#FEF3C7';
  ctx.fillText(deity.shloka, width / 2, pillY + 23);

  // Central Sacred Medallion
  const radius = 95;
  const halo = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.5);
  halo.addColorStop(0, 'rgba(254, 243, 199, 0.35)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  const diskGrad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, radius);
  diskGrad.addColorStop(0, '#FFFBEB');
  diskGrad.addColorStop(0.4, '#FDE68A');
  diskGrad.addColorStop(0.8, '#D97706');
  diskGrad.addColorStop(1, '#78350F');
  ctx.fillStyle = diskGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FEF3C7';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Deity Icon/Symbol inside Medallion
  ctx.font = '70px "Segoe UI Symbol", "Apple Color Emoji", sans-serif';
  ctx.fillStyle = '#671207';
  ctx.fillText(deity.icon || '🕉️', cx, cy + 6);

  // Main Pooja Title
  ctx.font = 'bold 54px "Noto Sans Gujarati", "Rozha One", serif';
  ctx.fillStyle = '#FFFDF7';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.fillText(title, width / 2, 475);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Category Badge
  const catText = `[ ${options.category || 'પવિત્ર શાસ્ત્રોક્ત વિધાન'} ]`;
  ctx.font = '600 22px "Noto Sans Gujarati", sans-serif';
  const badgeW = Math.max(ctx.measureText(catText).width + 50, 240);
  const badgeH = 42;
  const badgeX = (width - badgeW) / 2;
  const badgeY = 535;

  ctx.fillStyle = 'rgba(217, 119, 6, 0.85)';
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 21);
  ctx.fill();
  ctx.strokeStyle = '#FEF3C7';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#FFFDF7';
  ctx.fillText(catText, width / 2, badgeY + badgeH / 2 + 1);

  // Footer Ribbon
  const ribbonY = height - 120;
  const ribbonH = 65;
  const ribbonW = width - 120;
  const ribbonX = 60;

  const ribGrad = ctx.createLinearGradient(ribbonX, 0, ribbonX + ribbonW, 0);
  ribGrad.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
  ribGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.95)');
  ribGrad.addColorStop(1, 'rgba(245, 158, 11, 0.3)');
  ctx.fillStyle = ribGrad;
  roundRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 12);
  ctx.fill();

  ctx.strokeStyle = '#FEF3C7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 24px "Noto Sans Gujarati", sans-serif';
  ctx.fillStyle = '#3B1209';
  ctx.fillText('શાસ્ત્રીજી જીતેન્દ્ર જોષી (જીતુભાઈ જોષી) • મો. ૯૯૨૫૨ ૬૪૯૨૯', width / 2, ribbonY + ribbonH / 2);

  return canvas.toDataURL('image/jpeg', 0.92);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y, x + height, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
