/**
 * શાસ્ત્રીજી જીતેન્દ્ર જોષી - મુખ્ય એપ્લિકેશન કંટ્રોલર
 * Gujarati UI Logic, Search, Filters & Pamphlet Modal Rendering
 */

import { db, resolveDeityImage } from './db.js';
import { CATEGORIES, toGujaratiNumber } from './data.js';
import { ICONS } from './icons.js';
import { adminPanel } from './admin.js';
import { downloadPamphletAsImage, downloadPamphletAsPDF, shareOnWhatsApp } from './pamphlet-export.js';

class App {
  constructor() {
    this.services = [];
    this.profile = null;
    this.activeCategory = "બધી વિધિઓ";
    this.searchQuery = "";
    this.activePamphletService = null;
    this.currentPage = 1;
    this.itemsPerPage = 'all'; // બધી પૂજાઓ એકસાથે દર્શાવો જેથી કોઈપણ પૂજા છૂટી ન જાય
  }

  async init() {
    this.renderCategoryPills();
    this.bindEvents();

    // Show dynamic loading state
    const grid = document.getElementById('servicesGrid');
    if (grid && (!this.services || this.services.length === 0)) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem; animation: pulseGlow 1.5s infinite;">🕉️</div>
          <p style="color: var(--color-maroon); font-weight: 700;">પવિત્ર પૂજા સામગ્રી લાઇવ લોડ થઈ રહી છે...</p>
        </div>
      `;
    }

    // Real-time Dynamic Profile Subscription from Firestore
    db.subscribeProfile((profile) => {
      this.profile = profile;
      this.renderHeroProfile();
      this.renderFooter();
    });

    // Real-time Dynamic Services Subscription
    let prevServicesCount = 0;
    db.subscribeServices((services) => {
      if (!Array.isArray(services)) return;
      const countChanged = prevServicesCount > 0 && prevServicesCount !== services.length;
      prevServicesCount = services.length;

      this.services = services;

      // જો નવી પૂજા ઉમેરાય કે ડિલીટ થાય અને યુઝરે ચોક્કસ કેટેગરી ફિલ્ટર રાખ્યું હોય,
      // તો આપમેળે 'બધી વિધિઓ' પર લાવી દો જેથી નવી આઈટમ હોમપેજ પર તુરંત આગળ દેખાય
      if (countChanged && this.activeCategory !== "બધી વિધિઓ") {
        this.activeCategory = "બધી વિધિઓ";
      }

      this.renderCategoryPills();
      this.filterAndRenderServices();
    });

    // Initialize Admin Panel
    adminPanel.init(() => {
      // Re-trigger fresh fetch on admin change
      db.getProfile(true).then(p => { this.profile = p; this.renderHeroProfile(); this.renderFooter(); });
      db.getServices(true).then(s => {
        this.services = s;
        this.renderCategoryPills();
        this.filterAndRenderServices();
      });
    });

    // Check if URL has #admin or ?admin -> redirect to full-screen dedicated portal
    if (window.location.hash === '#admin' || window.location.search.includes('admin')) {
      window.location.href = 'admin.html';
    }
  }

  renderHeroProfile() {
    if (!this.profile) return;

    // Header elements
    const headerTitle = document.getElementById('headerShastrijiName');
    if (headerTitle) headerTitle.textContent = this.profile.name;

    // Hero visual portrait (Shastriji temple hero photo)
    const visualImg = document.getElementById('heroVisualImg');
    if (visualImg && this.profile.avatarUrl && this.profile.avatarUrl !== 'assets/images/shastriji-profile.jpg') {
      visualImg.src = this.profile.avatarUrl;
    }

    // Hero Shastriji Name
    const heroShastrijiName = document.getElementById('heroShastrijiName');
    if (heroShastrijiName) heroShastrijiName.textContent = this.profile.name;

    // Action CTA buttons
    const callBtn = document.getElementById('heroCallBtn');
    if (callBtn) {
      callBtn.onclick = () => this.openContactModal();
    }

    const whatsappBtn = document.getElementById('heroWhatsappBtn');
    if (whatsappBtn) {
      const cleanWa = this.profile.whatsapp ? this.profile.whatsapp.replace(/[^0-9]/g, '') : '9925264929';
      const waMsg = encodeURIComponent(`પ્રણામ શાસ્ત્રીજી, મારે પૂજા/વિધિ સંબંધિત માર્ગદર્શન જોઈએ છે.`);
      whatsappBtn.href = `https://wa.me/91${cleanWa}?text=${waMsg}`;
    }
  }

  renderFooter() {
    if (!this.profile) return;
    const footerName = document.getElementById('footerShastrijiName');
    if (footerName) footerName.textContent = this.profile.name;

    const footerPhoneBtn = document.getElementById('footerPhoneCta');
    if (footerPhoneBtn) {
      footerPhoneBtn.onclick = () => this.openContactModal();
    }

    const footerWaCta = document.getElementById('footerWaCta');
    if (footerWaCta) {
      const cleanWa = this.profile.whatsapp ? this.profile.whatsapp.replace(/[^0-9]/g, '') : '9925264929';
      const waMsg = encodeURIComponent(`પ્રણામ શાસ્ત્રીજી, મારે પૂજા/વિધિ સંબંધિત માર્ગદર્શન જોઈએ છે.`);
      footerWaCta.href = `https://wa.me/91${cleanWa}?text=${waMsg}`;
    }
  }

  openContactModal() {
    const overlay = document.getElementById('contactModalOverlay');
    if (!overlay) return;

    const phone = this.profile?.phone || '99252 64929';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanWa = (this.profile?.whatsapp || '9925264929').replace(/[^0-9]/g, '');

    const nameEl = document.getElementById('contactModalName');
    if (nameEl) nameEl.textContent = this.profile?.name || 'શાસ્ત્રીજી જીતેન્દ્ર જોષી (જીતુભાઈ જોષી)';

    const subEl = document.getElementById('contactModalSubtitle');
    if (subEl) subEl.textContent = this.profile?.subtitle || 'કર્મકાંડ • ધાર્મિક પૂજા • સામાજિક વિધિઓ';

    const phoneEl = document.getElementById('contactModalPhone');
    if (phoneEl) phoneEl.textContent = phone;

    const callLink = document.getElementById('contactModalCallLink');
    if (callLink) {
      callLink.href = `tel:+91${cleanPhone}`;
      callLink.innerHTML = `<span>📞</span> <span>હમણાં જ કૉલ કરો (${phone})</span>`;
    }

    const waLink = document.getElementById('contactModalWaLink');
    if (waLink) {
      const waMsg = encodeURIComponent(`પ્રણામ શાસ્ત્રીજી, મારે પૂજા/વિધિ સંબંધિત માર્ગદર્શન જોઈએ છે.`);
      waLink.href = `https://wa.me/91${cleanWa}?text=${waMsg}`;
    }

    // Highlight header button
    const headerBtn = document.getElementById('headerContactTrigger');
    if (headerBtn) {
      headerBtn.classList.add('revealed');
    }

    overlay.classList.add('active');
  }

  renderCategoryPills() {
    const container = document.getElementById('categoryPills');
    if (!container) return;

    const dynamicCats = ['બધી વિધિઓ'];
    if (Array.isArray(this.services)) {
      this.services.forEach(s => {
        if (s.category && !dynamicCats.includes(s.category)) {
          dynamicCats.push(s.category);
        }
      });
    }

    container.innerHTML = dynamicCats.map(cat => `
      <button class="cat-pill ${cat === this.activeCategory ? 'active' : ''}" data-cat="${cat}">
        ${cat}
      </button>
    `).join('');

    container.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeCategory = e.currentTarget.dataset.cat;
        this.currentPage = 1;
        this.filterAndRenderServices();
      });
    });
  }

  bindEvents() {
    // Search input & button
    const searchInput = document.getElementById('searchInput');
    const searchSubmitBtn = document.getElementById('searchSubmitBtn');
    const searchBannerForm = document.getElementById('searchBannerForm');

    const executeSearch = () => {
      if (searchInput) {
        this.searchQuery = searchInput.value.toLowerCase().trim();
        this.currentPage = 1;
        this.filterAndRenderServices();
      }
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        executeSearch();
      });
    }

    const scrollToServicesAndSearch = () => {
      executeSearch();
      const servicesSec = document.getElementById('servicesSection');
      if (servicesSec) {
        servicesSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (searchSubmitBtn) {
      searchSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToServicesAndSearch();
      });
    }

    if (searchBannerForm) {
      searchBannerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        scrollToServicesAndSearch();
      });
    }

    // Modal close
    const modalOverlay = document.getElementById('pamphletModalOverlay');
    const modalCloseBtn = document.getElementById('pamphletCloseBtn');
    const closeModal = () => {
      if (modalOverlay) modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });

    // Modal action buttons
    document.getElementById('downloadImgBtn')?.addEventListener('click', () => {
      if (this.activePamphletService) {
        downloadPamphletAsImage('pamphletCanvas', this.activePamphletService.title);
      }
    });

    document.getElementById('downloadPdfBtn')?.addEventListener('click', () => {
      if (this.activePamphletService) {
        downloadPamphletAsPDF('pamphletCanvas', this.activePamphletService.title);
      }
    });

    document.getElementById('shareWhatsappBtn')?.addEventListener('click', (e) => {
      if (this.activePamphletService && this.profile && (!e.currentTarget.href || e.currentTarget.href.endsWith('#'))) {
        e.preventDefault();
        shareOnWhatsApp(this.activePamphletService, this.profile);
      }
    });

    // Header contact button
    document.getElementById('headerContactTrigger')?.addEventListener('click', () => {
      this.openContactModal();
    });

    // Contact modal close handlers
    const contactOverlay = document.getElementById('contactModalOverlay');
    const contactCloseBtn = document.getElementById('contactModalCloseBtn');
    if (contactCloseBtn && contactOverlay) {
      contactCloseBtn.addEventListener('click', () => {
        contactOverlay.classList.remove('active');
      });
      contactOverlay.addEventListener('click', (e) => {
        if (e.target === contactOverlay) {
          contactOverlay.classList.remove('active');
        }
      });
    }

    // Hero Card 2: સરળ વિધિ માહિતી -> Smooth scroll to filters and highlight
    document.getElementById('heroCardVidhi')?.addEventListener('click', (e) => {
      e.preventDefault();
      const filterSec = document.getElementById('filterSection');
      if (filterSec) {
        filterSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const pills = document.getElementById('categoryPills');
        if (pills) {
          pills.style.transition = 'box-shadow 0.3s ease';
          pills.style.boxShadow = '0 0 0 4px var(--color-saffron-light)';
          setTimeout(() => { pills.style.boxShadow = ''; }, 1500);
        }
      }
    });

    // Hero Card 3: ધાર્મિક અને સાહિત્ય / સામગ્રી -> Smooth scroll & focus search
    document.getElementById('heroCardSamagri')?.addEventListener('click', (e) => {
      e.preventDefault();
      const searchBox = document.getElementById('searchInput');
      if (searchBox) {
        searchBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => searchBox.focus(), 600);
      }
    });

    // Hero Card 4: જીવનમાં સંસ્કાર -> Open Sanskar Rules Modal
    const sanskarOverlay = document.getElementById('sanskarModalOverlay');
    const sanskarCloseBtn = document.getElementById('sanskarModalCloseBtn');
    const sanskarBottomCloseBtn = document.getElementById('closeSanskarModalBottomBtn');
    const sanskarTriggerBtn = document.getElementById('heroCardSanskar');

    const openSanskarModal = () => {
      if (sanskarOverlay) sanskarOverlay.classList.add('active');
    };
    const closeSanskarModal = () => {
      if (sanskarOverlay) sanskarOverlay.classList.remove('active');
    };

    if (sanskarTriggerBtn) {
      sanskarTriggerBtn.addEventListener('click', openSanskarModal);
    }
    if (sanskarCloseBtn) {
      sanskarCloseBtn.addEventListener('click', closeSanskarModal);
    }
    if (sanskarBottomCloseBtn) {
      sanskarBottomCloseBtn.addEventListener('click', closeSanskarModal);
    }
    if (sanskarOverlay) {
      sanskarOverlay.addEventListener('click', (e) => {
        if (e.target === sanskarOverlay) closeSanskarModal();
      });
    }

    // Share Sanskar Rules on WhatsApp
    document.getElementById('shareSanskarWaBtn')?.addEventListener('click', () => {
      const waMsg = encodeURIComponent(
        `🌿 *શાસ્ત્રીજી જીતેન્દ્ર જોષી દર્શિત પવિત્ર જીવન અને પૂજાના ૧૪ નિયમો* 🌿\n\n` +
        `*જીવનના ૭ પવિત્ર નિયમો:*\n` +
        `૧. નિયમ — સદાચાર અને શિસ્તબદ્ધ દિનચર્યા\n` +
        `૨. સેવા — નિઃસ્વાર્થ ભાવે માનવ અને ઈશ્વર સેવા\n` +
        `૩. પ્રાર્થના — ઈશ્વર સાથે હૃદયપૂર્વક આત્મિક જોડાણ\n` +
        `૪. સત્ય — વિચાર, વાણી અને વર્તનમાં પવિત્ર સત્ય\n` +
        `૫. દયા — સર્વ જીવો પ્રત્યે અનુકંપા અને કરુણા\n` +
        `૬. પ્રેમ — સર્વ પ્રત્યે સ્નેહ અને પવિત્ર સમભાવ\n` +
        `૭. સહનશીલતા — ધૈર્ય, શાંતિ અને વિવેકપૂર્ણ સમતાભાવ\n\n` +
        `*પૂજાના ૭ પવિત્ર નિયમો:*\n` +
        `૧. પૂજા — પવિત્રતા અને શાસ્ત્રોક્ત વિધિપૂર્વક આરાધના\n` +
        `૨. સંસ્કાર — મન, વાણી અને કર્મની આધ્યાત્મિક શુદ્ધિ\n` +
        `૩. પ્રતિષ્ઠા — ઈશ્વરીય તત્વ અને ભાવની હૃદયમાં સ્થાપના\n` +
        `૪. ભાવના — સમર્પણ અને અનન્ય ભક્તિ ભાવ\n` +
        `૫. શાંતિ — શાંત ચિત્તે મંત્રોચ્ચાર અને ધ્યાનાવસ્થા\n` +
        `૬. શ્રદ્ધા — ગુરુ અને શાસ્ત્રોક્ત વચનોમાં અતૂટ વિશ્વાસ\n` +
        `૭. નીતિ — ધર્માનુસાર પવિત્ર આચરણ અને સત્કર્મ\n\n` +
        `"ધર્મ એ જીવનને સત્ય, શાંતિ અને સદકાર્ય તરફ દોરી જાય છે."\n\n` +
        `સંપર્ક: શાસ્ત્રીજી જીતેન્દ્ર જોષી (૯૯૨૫૨ ૬૪૯૨૯)`
      );
      window.open(`https://wa.me/?text=${waMsg}`, '_blank');
    });
  }

  filterAndRenderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    // Bilingual search helper: Matches Gujarati and English phonetics, synonyms, and transliterations
    const matchesBilingualSearch = (service, rawQuery) => {
      if (!rawQuery) return true;
      const q = rawQuery.toLowerCase().trim();
      if (!q) return true;

      // 1. All Gujarati text fields in service
      const gujaratiCorpus = [
        service.title || '',
        service.subtitle || '',
        service.category || '',
        service.badge || '',
        service.pujapo || '',
        service.anajNaivedya || '',
        service.taiyari || '',
        service.notes || ''
      ].join(' ').toLowerCase();

      if (gujaratiCorpus.includes(q)) return true;

      // 2. English title and keywords
      const englishTitle = (service.englishTitle || '').toLowerCase();
      if (englishTitle.includes(q)) return true;

      const keywords = (service.keywords || []).map(k => k.toLowerCase());
      if (keywords.some(k => k.includes(q) || q.includes(k))) return true;

      // 3. Service ID and Predefined Service-Level Aliases
      const SERVICE_ALIASES = {
        'ganesh-puja': ['ganesh', 'ganesha', 'ganpati', 'ganapathi', 'ganeshji', 'vinayak', 'vighnaharta', 'pratham pujya', 'bappa', 'modak', 'ladu', 'laddu', 'durva', 'dharo', 'ગણેશ', 'ગણપતિ', 'વિનાયક', 'મોદક'],
        'lakshmi-puja': ['lakshmi', 'laxmi', 'mahalakshmi', 'mahalaxmi', 'laxmi puja', 'lakshmi puja', 'laxmi pooja', 'dhan', 'samriddhi', 'diwali', 'dhanteras', 'kamal', 'lotus', 'shikka', 'chandi', 'લક્ષ્મી', 'ધનતેરસ', 'દિવાળી'],
        'navgrah-puja': ['navgrah', 'navgraha', 'navagraha', 'graha', 'grah', 'grah shanti', 'graha dosh', 'grah dosh', 'shanti', 'havan', 'samidha', 'surya', 'chandra', 'mangal', 'budh', 'guru', 'shukra', 'shani', 'rahu', 'ketu', 'નવગ્રહ', 'ગ્રહ શાંતિ'],
        'satyanarayan-puja': ['satyanarayan', 'satyanarayana', 'satya narayan', 'satynarayan', 'satyanarayan dev', 'satyanarayan dev ni katha', 'satyanarayan katha', 'satyanarayan pooja', 'satyanarayan puja', 'katha', 'vrat', 'udyapan', 'sheera', 'shiro', 'prasad', 'kel na pan', 'tulsi', 'banana leaves', 'panchamrut', 'સત્યનારાયણ', 'કથા', 'સત્યનારાયણ દેવની કથા', 'સત્યનારાયણ કથા', 'વ્રત', 'ઉદ્યાપન', 'શીરો', 'પ્રસાદ'],
        'gruhpravesh-puja': ['vastu', 'vaastu', 'vastu shanti', 'vastu puja', 'vastu pooja', 'gruhpravesh', 'gruh pravesh', 'griha pravesh', 'house warming', 'new home', 'home', 'ghar', 'makan', 'toran', 'asopalav', 'yantra', 'વાસ્તુ', 'વાસ્તુ શાંતિ', 'ગૃહપ્રવેશ', 'નવું ઘર', 'મકાન'],
        'havan-yajna': ['havan', 'hawan', 'yajna', 'yagya', 'homa', 'agnihotra', 'havan kund', 'samidha', 'ghee', 'guggal', 'loban', 'pavitra agni', 'હવન', 'યજ્ઞ', 'હોમ', 'અગ્નિહોત્ર', 'હવન કુંડ'],
        'vivah-sanskar': ['vivah', 'vivaha', 'lagna', 'lagn', 'marriage', 'wedding', 'saptapadi', 'hastmelap', 'hast melap', 'var mala', 'varmala', 'mangalsutra', 'chheda chhedi', 'kansar', 'chori', 'kanyadaan', 'વિવાહ', 'લગ્ન', 'હસ્તમેળાપ', 'સપ્તપદી'],
        'anya-pooja': ['rudra', 'rudrabhishek', 'rudrabhisheka', 'shiva', 'shiv', 'mahadev', 'bholenath', 'bilipatra', 'bili', 'gangajal', 'dudh', 'milk', 'kaalsarp', 'kal sarp', 'pitru', 'tarpan', 'shraddh', 'janoi', 'upanayan', 'sacred thread', 'shrimant', 'godh bharai', 'dharmaraja', 'surya', 'surya dev', 'રુદ્રાભિષેક', 'મહાદેવ', 'શિવ', 'કાળસર્પ', 'પિતૃતર્પણ', 'શ્રાદ્ધ', 'જનોઈ', 'સીમંત', 'સૂર્યદેવ', 'ધર્મરાજા']
      };

      const aliases = SERVICE_ALIASES[service.id] || [];
      if (aliases.some(a => a.includes(q) || q.includes(a))) return true;

      // 4. Samagri English Synonyms
      const SAMAGRI_SYNONYMS = {
        'coconut': ['શ્રીફળ', 'નાળિયેર'],
        'shrifal': ['શ્રીફળ'],
        'nariyal': ['શ્રીફળ'],
        'sopari': ['સોપારી'],
        'supari': ['સોપારી'],
        'kanku': ['કંકુ'],
        'kumkum': ['કંકુ'],
        'sindoor': ['સિંદૂર', 'સિંદુર'],
        'chaval': ['ચોખા', 'અક્ષત'],
        'chokha': ['ચોખા', 'અક્ષત'],
        'rice': ['ચોખા', 'અક્ષત'],
        'akshat': ['ચોખા', 'અક્ષત'],
        'wheat': ['ઘઉં'],
        'ghau': ['ઘઉં'],
        'gehu': ['ઘઉં'],
        'modak': ['મોદક', 'લાડુ'],
        'ladu': ['લાડુ', 'મોદક'],
        'laddu': ['લાડુ', 'મોદક'],
        'panchamrut': ['પંચામૃત'],
        'panchamrit': ['પંચામૃત'],
        'tulsi': ['તુલસી'],
        'kapoor': ['કપૂર'],
        'camphor': ['કપૂર'],
        'agarbatti': ['અગરબત્તી'],
        'incense': ['અગરબત્તી', 'ધૂપ'],
        'dhoop': ['ધૂપ'],
        'ghee': ['ઘી'],
        'janoi': ['જનોઈ'],
        'janeu': ['જનોઈ'],
        'durva': ['દૂર્વા', 'ધરો'],
        'dharo': ['દૂર્વા', 'ધરો'],
        'asopalav': ['આસોપાલવ'],
        'gangajal': ['ગંગાજળ']
      };

      if (SAMAGRI_SYNONYMS[q] && SAMAGRI_SYNONYMS[q].some(term => gujaratiCorpus.includes(term))) {
        return true;
      }

      // 5. Multi-word phrase token matching (e.g. "satyanarayan dev ni katha")
      const stopWords = new Set(['ni', 'no', 'nu', 'na', 'ne', 'ma', 'thi', 'ane', 'and', 'the', 'of', 'for', 'in', 'ki', 'ka', 'ke']);
      const tokens = q.split(/[\s,+-]+/).filter(t => t.length > 1 && !stopWords.has(t));
      if (tokens.length > 0) {
        const matchesAnyToken = tokens.some(token => {
          if (aliases.some(a => a.includes(token))) return true;
          if (keywords.some(k => k.includes(token))) return true;
          if (englishTitle.includes(token)) return true;
          if (gujaratiCorpus.includes(token)) return true;
          if (SAMAGRI_SYNONYMS[token] && SAMAGRI_SYNONYMS[token].some(term => gujaratiCorpus.includes(term))) return true;
          return false;
        });
        if (matchesAnyToken) return true;
      }

      // 6. Transliteration phonetic matching
      const charMap = {
        'અ': 'a', 'આ': 'aa', 'ઇ': 'i', 'ઈ': 'ee', 'ઉ': 'u', 'ઊ': 'oo', 'ઋ': 'ri',
        'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au', 'અં': 'an', 'અઃ': 'ah',
        'ક': 'k', 'ખ': 'kh', 'ગ': 'g', 'ઘ': 'gh',
        'ચ': 'ch', 'છ': 'chh', 'જ': 'j', 'ઝ': 'jh',
        'ટ': 't', 'ઠ': 'th', 'ડ': 'd', 'ઢ': 'dh', 'ણ': 'n',
        'ત': 't', 'થ': 'th', 'દ': 'd', 'ધ': 'dh', 'ન': 'n',
        'પ': 'p', 'ફ': 'f', 'બ': 'b', 'ભ': 'bh', 'મ': 'm',
        'ય': 'y', 'ર': 'r', 'લ': 'l', 'વ': 'v',
        'શ': 'sh', 'ષ': 'sh', 'સ': 's', 'હ': 'h', 'ળ': 'l',
        'ક્ષ': 'ksh', 'જ્ઞ': 'gn',
        'ા': 'a', 'િ': 'i', 'ી': 'ee', 'ુ': 'u', 'ૂ': 'oo', 'ૃ': 'ri', 'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au', 'ં': 'n', 'ઃ': 'h', '્': ''
      };
      const latinCorpus = gujaratiCorpus.split('').map(c => charMap[c] || c).join('');
      if (latinCorpus.includes(q)) return true;
      if (tokens.length > 0 && tokens.some(t => latinCorpus.includes(t))) return true;

      return false;
    };

    const filtered = this.services.filter(s => {
      const matchesCat = this.activeCategory === "બધી વિધિઓ" || s.category === this.activeCategory;
      const matchesSearch = matchesBilingualSearch(s, this.searchQuery);
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      const paginationContainer = document.getElementById('servicesPaginationContainer');
      if (paginationContainer) paginationContainer.innerHTML = '';

      grid.innerHTML = `
        <div class="services-empty-state">
          <div class="services-empty-icon">🔍</div>
          <h3 class="services-empty-title">કોઈ પૂજા કે સામગ્રી મળી નથી</h3>
          <p class="services-empty-desc">આપ ગુજરાતી અથવા અંગ્રેજી (દા.ત. Satyanarayan, Vastu, Havan) માં શોધી શકો છો.</p>
          <button type="button" class="btn btn-primary" id="resetServicesSearchBtn" style="margin-top: 1rem;">
            બધી પૂજા સેવાઓ દર્શાવો
          </button>
        </div>
      `;
      document.getElementById('resetServicesSearchBtn')?.addEventListener('click', () => {
        const input = document.getElementById('searchInput');
        if (input) input.value = '';
        this.searchQuery = '';
        this.currentPage = 1;
        this.filterAndRenderServices();
      });
      return;
    }

    // Pagination calculations
    const totalFiltered = filtered.length;
    const effectivePerPage = this.itemsPerPage === 'all' ? totalFiltered : parseInt(this.itemsPerPage, 10);
    const totalPages = Math.max(1, Math.ceil(totalFiltered / effectivePerPage));

    if (this.currentPage > totalPages) this.currentPage = totalPages;
    if (this.currentPage < 1) this.currentPage = 1;

    const startIndex = (this.currentPage - 1) * effectivePerPage;
    const endIndex = Math.min(startIndex + effectivePerPage, totalFiltered);
    const paginatedList = filtered.slice(startIndex, endIndex);

    grid.innerHTML = paginatedList.map(service => {
      const thumb = service.thumbnailUrl || resolveDeityImage(service.title, service.category);
      return `
      <article class="service-ref-card" data-id="${service.id}" tabindex="0" role="button" aria-label="${service.title} - વધુ માહિતી મેળવો">
        <div class="service-ref-thumb-wrap">
          <img src="${thumb}" alt="${service.title}" class="service-ref-thumb-img" loading="lazy" onerror="this.src='assets/icons/gemini-svg.svg'">
        </div>
        <div class="service-ref-body">
          <h3 class="service-ref-title">${service.title}</h3>
          <p class="service-ref-subtitle">${service.subtitle || 'વિધિવત પૂજા માર્ગદર્શિકા'}</p>
          <div class="service-ref-action">
            <span class="service-ref-link">
              <span>વધુ માહિતી</span>
              <span class="service-ref-arrow" aria-hidden="true">➔</span>
            </span>
          </div>
        </div>
      </article>
    `;
    }).join('');

    grid.querySelectorAll('.service-ref-card').forEach(card => {
      const openModalForCard = () => {
        const id = card.dataset.id;
        const service = this.services.find(s => s.id === id);
        if (service) {
          this.openPamphletModal(service);
        }
      };

      card.addEventListener('click', openModalForCard);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModalForCard();
        }
      });
    });

    // Render pagination controls
    this.renderPagination(totalFiltered, totalPages, startIndex, endIndex, effectivePerPage);
  }

  renderPagination(totalItems, totalPages, startIndex, endIndex, effectivePerPage) {
    const container = document.getElementById('servicesPaginationContainer');
    if (!container) return;

    const startNum = toGujaratiNumber(startIndex + 1);
    const endNum = toGujaratiNumber(endIndex);
    const totalNum = toGujaratiNumber(totalItems);
    const currentPageNum = toGujaratiNumber(this.currentPage);
    const totalPagesNum = toGujaratiNumber(totalPages);

    // Build page number sequence
    let pages = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (this.currentPage <= 3) {
        pages = [1, 2, 3, 4, '...', totalPages];
      } else if (this.currentPage >= totalPages - 2) {
        pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', totalPages];
      }
    }

    const numbersHtml = pages.map(p => {
      if (p === '...') {
        return `<span class="pagination-ellipsis" aria-hidden="true">…</span>`;
      }
      const isActive = p === this.currentPage;
      return `
        <button type="button" class="pagination-btn ${isActive ? 'active' : ''}" data-page="${p}" aria-label="પેજ ${toGujaratiNumber(p)}" ${isActive ? 'aria-current="page"' : ''}>
          ${toGujaratiNumber(p)}
        </button>
      `;
    }).join('');

    const isFirstPage = this.currentPage <= 1;
    const isLastPage = this.currentPage >= totalPages;

    container.innerHTML = `
      <nav class="sacred-pagination-bar" aria-label="પૂજા સેવાઓ પેજીનેશન નેવિગેશન">
        <div class="pagination-meta-info">
          <span>કુલ <strong>${totalNum}</strong> પૂજાઓમાંથી <strong>${startNum}</strong> થી <strong>${endNum}</strong></span>
          <span class="pagination-page-badge">પેજ ${currentPageNum} / ${totalPagesNum}</span>
        </div>

        ${totalPages > 1 ? `
          <div class="pagination-controls-row">
            <button type="button" class="pagination-btn pagination-btn-nav" data-page="1" title="પ્રથમ પેજ" aria-label="પ્રથમ પેજ" ${isFirstPage ? 'disabled' : ''}>
              ${ICONS.chevronsLeft}
              <span class="pagination-btn-label">પ્રથમ</span>
            </button>

            <button type="button" class="pagination-btn pagination-btn-nav" data-page="${this.currentPage - 1}" title="અગાઉનું પેજ" aria-label="અગાઉનું પેજ" ${isFirstPage ? 'disabled' : ''}>
              ${ICONS.arrowLeft}
              <span class="pagination-btn-label">અગાઉ</span>
            </button>

            <div class="pagination-numbers-wrap">
              ${numbersHtml}
            </div>

            <button type="button" class="pagination-btn pagination-btn-nav" data-page="${this.currentPage + 1}" title="આગળનું પેજ" aria-label="આગળનું પેજ" ${isLastPage ? 'disabled' : ''}>
              <span class="pagination-btn-label">આગળ</span>
              ${ICONS.arrowRight}
            </button>

            <button type="button" class="pagination-btn pagination-btn-nav" data-page="${totalPages}" title="છેલ્લું પેજ" aria-label="છેલ્લું પેજ" ${isLastPage ? 'disabled' : ''}>
              <span class="pagination-btn-label">છેલ્લું</span>
              ${ICONS.chevronsRight}
            </button>
          </div>
        ` : ''}

        <div class="pagination-per-page-wrap">
          <label for="servicesPerPageSelect" class="pagination-per-page-label">પ્રતિ પેજ:</label>
          <select id="servicesPerPageSelect" class="pagination-per-page-select" aria-label="પ્રતિ પેજ પૂજાઓની સંખ્યા પસંદ કરો">
            <option value="6" ${this.itemsPerPage === 6 || this.itemsPerPage === '6' ? 'selected' : ''}>૬ પૂજાઓ (ટેસ્ટ)</option>
            <option value="10" ${this.itemsPerPage === 10 || this.itemsPerPage === '10' ? 'selected' : ''}>૧૦ પૂજાઓ</option>
            <option value="12" ${this.itemsPerPage === 12 || this.itemsPerPage === '12' ? 'selected' : ''}>૧૨ પૂજાઓ</option>
            <option value="15" ${this.itemsPerPage === 15 || this.itemsPerPage === '15' ? 'selected' : ''}>૧૫ પૂજાઓ</option>
            <option value="25" ${this.itemsPerPage === 25 || this.itemsPerPage === '25' ? 'selected' : ''}>૨૫ પૂજાઓ</option>
            <option value="all" ${this.itemsPerPage === 'all' ? 'selected' : ''}>બધી પૂજાઓ</option>
          </select>
        </div>
      </nav>
    `;

    // Wire page buttons
    container.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetPage = parseInt(e.currentTarget.dataset.page, 10);
        if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages && targetPage !== this.currentPage) {
          this.currentPage = targetPage;
          this.filterAndRenderServices();
          const targetSection = document.getElementById('services') || document.getElementById('servicesSection');
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    // Wire per-page select
    const perPageSelect = document.getElementById('servicesPerPageSelect');
    if (perPageSelect) {
      perPageSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        this.itemsPerPage = val === 'all' ? 'all' : parseInt(val, 10);
        this.currentPage = 1;
        this.filterAndRenderServices();
      });
    }
  }

  openPamphletModal(service) {
    this.activePamphletService = service;
    const modalOverlay = document.getElementById('pamphletModalOverlay');
    const canvas = document.getElementById('pamphletCanvas');
    const originalPamphletsBox = document.getElementById('originalPamphletsContainer');
    const modalTopTitle = document.getElementById('modalTopTitle');
    const modalTopBadge = document.getElementById('modalTopBadge');
    const modalCallBtn = document.getElementById('modalCallBtn');
    const shareWhatsappBtn = document.getElementById('shareWhatsappBtn');
    if (!modalOverlay || !canvas) return;

    if (modalTopTitle) modalTopTitle.textContent = service.title;
    if (modalTopBadge) modalTopBadge.textContent = `${service.category} • ${service.badge || 'પવિત્ર વિધાન'}`;

    const cleanPhone = (this.profile?.phone || '99252 64929').replace(/[^0-9]/g, '');
    const cleanWa = (this.profile?.whatsapp || '9925264929').replace(/[^0-9]/g, '');

    if (modalCallBtn) {
      modalCallBtn.href = `tel:+91${cleanPhone}`;
      modalCallBtn.innerHTML = `<span>📞</span> <span>શાસ્ત્રીજીને કૉલ કરો (${this.profile?.phone || '99252 64929'})</span>`;
    }

    if (shareWhatsappBtn) {
      const waInquiryMsg = encodeURIComponent(`પ્રણામ શાસ્ત્રીજી, મારે "${service.title}" ની પૂજા વિધિ અને સામગ્રી બાબતે માર્ગદર્શન મેળવવું છે.`);
      shareWhatsappBtn.href = `https://wa.me/91${cleanWa}?text=${waInquiryMsg}`;
    }

    // Split pujapo string into clean items for scannable pill layout
    const pujapoItems = (service.pujapo || '')
      .split(/[,،]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const anajItems = (service.anajNaivedya || '')
      .split(/[,،]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const taiyariItems = (service.taiyari || '')
      .split(/[,،]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    // Render Sacred Traditional Pamphlet Content
    canvas.innerHTML = `
      <div class="pamphlet-header">
        <div class="pamphlet-om-badge">
          <span>🕉️</span>
        </div>
        <div class="pamphlet-shree-ganesh">।। શ્રી ગણેશાય નમઃ ।।</div>
        <h2 class="pamphlet-title">${service.title}</h2>
        <p class="pamphlet-subtitle">${service.subtitle || 'શાસ્ત્રોક્ત વિધિવત પૂજા માર્ગદર્શિકા'}</p>
        
        <div class="pamphlet-meta-chips">
          <span class="pamphlet-chip">
            <span>🏷️</span> <span>વિભાગ: ${service.category}</span>
          </span>
          <span class="pamphlet-chip">
            <span>✨</span> <span>${service.badge || 'સાત્વિક સંસ્કાર'}</span>
          </span>
          <span class="pamphlet-chip">
            <span>🪙</span> <span>${service.price || 'દક્ષિણા માટે સંપર્ક કરો'}</span>
          </span>
        </div>

        <div class="pamphlet-hero-banner">
          <img src="${service.thumbnailUrl || 'assets/images/card-ganesh.png'}" alt="${service.title}" class="pamphlet-hero-thumb">
          <div class="pamphlet-hero-meta">
            <div class="pamphlet-hero-heading">${service.title} - સંપૂર્ણ સામગ્રી સૂચિ</div>
            <div class="pamphlet-hero-sub">શાસ્ત્રીજી જીતેન્દ્ર જોષી (જીતુભાઈ જોષી) દ્વારા પ્રમાણિત યાદી</div>
          </div>
        </div>
      </div>

      <!-- સેક્શન ૧: પૂજાપો / મુખ્ય સામગ્રી -->
      <div class="pamphlet-section highlight-pujapo">
        <div class="pamphlet-section-title">
          <span class="sec-icon">🌿</span> 
          <span>પૂજાપો / મુખ્ય સામગ્રી (${pujapoItems.length} આવશ્યક વસ્તુઓ) :</span>
        </div>
        <div class="pamphlet-items-container">
          ${pujapoItems.map(item => `
            <span class="pamphlet-item-pill">
              <span class="pill-bullet">✦</span>
              <span>${item}</span>
            </span>
          `).join('')}
        </div>
      </div>

      <!-- સેક્શન ૨: અનાજ અને પવિત્ર નૈવેદ્ય -->
      ${service.anajNaivedya ? `
        <div class="pamphlet-section highlight-grains">
          <div class="pamphlet-section-title">
            <span class="sec-icon">🌾</span> 
            <span>અનાજ અને પવિત્ર નૈવેદ્ય (પ્રસાદ) :</span>
          </div>
          <div class="pamphlet-items-container">
            ${anajItems.map(item => `
              <span class="pamphlet-item-pill pill-amber">
                <span class="pill-bullet">✦</span>
                <span>${item}</span>
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- સેક્શન ૩: મૂર્તિ, વાસણ અને ઘરની તૈયારી -->
      ${service.taiyari ? `
        <div class="pamphlet-section highlight-prep">
          <div class="pamphlet-section-title">
            <span class="sec-icon">🪔</span> 
            <span>મૂર્તિ, વાસણ અને ઘરની તૈયારી :</span>
          </div>
          <div class="pamphlet-items-container">
            ${taiyariItems.map(item => `
              <span class="pamphlet-item-pill pill-saffron">
                <span class="pill-bullet">✦</span>
                <span>${item}</span>
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- સેક્શન ૪: શાસ્ત્રોક્ત મહત્વ અને વિશેષ નોંધ -->
      ${service.notes ? `
        <div class="pamphlet-notes-box">
          <span class="notes-quote-mark">“</span>
          <span>${service.notes}</span>
          <span class="notes-quote-mark">”</span>
        </div>
      ` : ''}

      <!-- પેમ્ફ્લેટ પવિત્ર મહોર / ફૂટર -->
      <div class="pamphlet-footer">
        <div class="pamphlet-seal-ornament">❖ ૐ ❖</div>
        <div class="pamphlet-shastriji-info">${this.profile?.name || 'શાસ્ત્રીજી જીતેન્દ્ર જોષી (જીતુભાઈ જોષી)'}</div>
        <div class="pamphlet-phone-info">પવિત્ર સંપર્ક: 📞 ${this.profile?.phone || '99252 64929'}</div>
        <div class="pamphlet-tagline">
          કર્મકાંડ • ધાર્મિક • સામાજિક • વ્રત વિધાન સંબંધિત આવશ્યક માર્ગદર્શન
        </div>
        <div class="pamphlet-blessing">
          "ધર્મ એ જીવનને સત્ય, શાંતિ અને સદકાર્ય તરફ દોરી જાય છે."
        </div>
      </div>
    `;

    // Render Original Pamphlets Attachments if any exist
    if (originalPamphletsBox) {
      if (service.originalPamphlets && service.originalPamphlets.length > 0) {
        originalPamphletsBox.style.display = 'block';
        originalPamphletsBox.innerHTML = `
          <div class="original-pamphlets-header">
            <span>📜</span> <span>અસલ તૈયાર પેમ્ફ્લેટ (Original Pamphlet Files) :</span>
          </div>
          <div class="original-pamphlets-list">
            ${service.originalPamphlets.map(p => `
              <a href="${p.url}" target="_blank" download class="pamphlet-img-thumb-link">
                <span>📥</span> <span>${p.title} જુઓ / ડાઉનલોડ કરો</span>
              </a>
            `).join('')}
          </div>
        `;
      } else {
        originalPamphletsBox.style.display = 'none';
      }
    }

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Start app reliably (whether DOMContentLoaded has already fired or is pending)
function startApp() {
  const app = new App();
  app.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
