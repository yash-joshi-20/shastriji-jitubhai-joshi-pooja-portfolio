/**
 * શાસ્ત્રીજી જીતેન્દ્ર જોષી - મુખ્ય એપ્લિકેશન કંટ્રોલર
 * Gujarati UI Logic, Search, Filters & Pamphlet Modal Rendering
 */

import { db } from './db.js';
import { CATEGORIES } from './data.js';
import { adminPanel } from './admin.js';
import { downloadPamphletAsImage, downloadPamphletAsPDF, shareOnWhatsApp } from './pamphlet-export.js';

class App {
  constructor() {
    this.services = [];
    this.profile = null;
    this.activeCategory = "બધી વિધિઓ";
    this.searchQuery = "";
    this.activePamphletService = null;
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
    db.subscribeServices((services) => {
      this.services = services;
      this.renderCategoryPills();
      this.filterAndRenderServices();
    });

    // Initialize Admin Panel
    adminPanel.init(() => {
      // Re-trigger fetch if needed
      db.getProfile().then(p => { this.profile = p; this.renderHeroProfile(); this.renderFooter(); });
      db.getServices().then(s => { this.services = s; this.filterAndRenderServices(); });
    });

    // Check if URL has #admin or ?admin
    if (window.location.hash === '#admin' || window.location.search.includes('admin')) {
      adminPanel.openPinModal();
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
    if (modalCloseBtn && modalOverlay) {
      modalCloseBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
      });
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          modalOverlay.classList.remove('active');
        }
      });
    }

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

    document.getElementById('shareWhatsappBtn')?.addEventListener('click', () => {
      if (this.activePamphletService && this.profile) {
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

    const filtered = this.services.filter(s => {
      const matchesCat = this.activeCategory === "બધી વિધિઓ" || s.category === this.activeCategory;
      const matchesSearch = !this.searchQuery || 
        (s.title && s.title.toLowerCase().includes(this.searchQuery)) ||
        (s.pujapo && s.pujapo.toLowerCase().includes(this.searchQuery)) ||
        (s.anajNaivedya && s.anajNaivedya.toLowerCase().includes(this.searchQuery)) ||
        (s.taiyari && s.taiyari.toLowerCase().includes(this.searchQuery)) ||
        (s.category && s.category.toLowerCase().includes(this.searchQuery));

      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="services-empty-state">
          <div class="services-empty-icon">🔍</div>
          <h3 class="services-empty-title">કોઈ પૂજા કે સામગ્રી મળી નથી</h3>
          <p class="services-empty-desc">કૃપા કરીને અન્ય નામ અથવા સામગ્રી શોધો.</p>
          <button type="button" class="btn btn-primary" id="resetServicesSearchBtn" style="margin-top: 1rem;">
            બધી પૂજા સેવાઓ દર્શાવો
          </button>
        </div>
      `;
      document.getElementById('resetServicesSearchBtn')?.addEventListener('click', () => {
        const input = document.getElementById('searchInput');
        if (input) input.value = '';
        this.searchQuery = '';
        this.filterAndRenderServices();
      });
      return;
    }

    grid.innerHTML = filtered.map(service => `
      <article class="service-ref-card" data-id="${service.id}" tabindex="0" role="button" aria-label="${service.title} - વધુ માહિતી મેળવો">
        <div class="service-ref-thumb-wrap">
          <img src="${service.thumbnailUrl || 'assets/images/card-ganesh.png'}" alt="${service.title}" class="service-ref-thumb-img" loading="lazy">
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
    `).join('');

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
  }

  openPamphletModal(service) {
    this.activePamphletService = service;
    const modalOverlay = document.getElementById('pamphletModalOverlay');
    const canvas = document.getElementById('pamphletCanvas');
    const originalPamphletsBox = document.getElementById('originalPamphletsContainer');
    if (!modalOverlay || !canvas) return;

    // Render Sacred Traditional Pamphlet Content
    canvas.innerHTML = `
      <div class="pamphlet-header">
        <div class="pamphlet-om-badge">
          <img src="assets/icons/gemini-svg.svg" alt="ॐ">
        </div>
        <div class="pamphlet-shree-ganesh">।। શ્રી ગણેશાય નમઃ ।।</div>
        <h2 class="pamphlet-title">${service.title}</h2>
        <div class="pamphlet-price-badge">
          વિભાગ: ${service.category} | ${service.price || 'દક્ષિણા માટે સંપર્ક કરો'}
        </div>
      </div>

      <!-- સેક્શન ૧: પૂજાપો / મુખ્ય સામગ્રી -->
      <div class="pamphlet-section">
        <div class="pamphlet-section-title">
          <span>🌿</span> <span>પૂજાપો / મુખ્ય સામગ્રી :</span>
        </div>
        <div class="pamphlet-section-content">
          ${service.pujapo || 'કોઈ વિગત આપેલ નથી.'}
        </div>
      </div>

      <!-- સેક્શન ૨: અનાજ અને નૈવેદ્ય -->
      ${service.anajNaivedya ? `
        <div class="pamphlet-section">
          <div class="pamphlet-section-title">
            <span>🌾</span> <span>અનાજ અને નૈવેદ્ય :</span>
          </div>
          <div class="pamphlet-section-content">
            ${service.anajNaivedya}
          </div>
        </div>
      ` : ''}

      <!-- સેક્શન ૩: મૂર્તિ, વાસણ અને ઘરની તૈયારી -->
      ${service.taiyari ? `
        <div class="pamphlet-section">
          <div class="pamphlet-section-title">
            <span>🪔</span> <span>મૂર્તિ, વાસણ અને ઘરની તૈયારી :</span>
          </div>
          <div class="pamphlet-section-content">
            ${service.taiyari}
          </div>
        </div>
      ` : ''}

      <!-- સેક્શન ૪: વિશેષ નોંધ -->
      ${service.notes ? `
        <div style="font-size: 0.9rem; color: var(--color-text-sub); margin: 0.75rem 0; font-style: italic; text-align: center;">
          * ${service.notes}
        </div>
      ` : ''}

      <!-- પેમ્ફ્લેટ ફૂટર -->
      <div class="pamphlet-footer">
        <div class="pamphlet-shastriji-info">${this.profile?.name || 'શાસ્ત્રીજી જીતુભાઈ જોષી'}</div>
        <div class="pamphlet-phone-info">સંપર્ક: 📞 ${this.profile?.phone || '99252 64929'}</div>
        <div style="font-size: 0.85rem; color: var(--color-text-sub); margin-top: 0.25rem;">
          કર્મકાંડ • ધાર્મિક • સામાજિક • વ્રત વિધાન સંબંધિત આવશ્યક માર્ગદર્શન
        </div>
      </div>
    `;

    // Render Original Pamphlets Attachments if any exist
    if (originalPamphletsBox) {
      if (service.originalPamphlets && service.originalPamphlets.length > 0) {
        originalPamphletsBox.style.display = 'block';
        originalPamphletsBox.innerHTML = `
          <h4><span>📜</span> <span>અસલ તૈયાર પેમ્ફ્લેટ (Original Pamphlet Files) :</span></h4>
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
  }
}

// Start app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
