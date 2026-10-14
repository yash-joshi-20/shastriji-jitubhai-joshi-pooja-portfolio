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

    // Hero portrait
    const portraitImg = document.getElementById('heroPortraitImg');
    if (portraitImg && this.profile.avatarUrl) {
      portraitImg.src = this.profile.avatarUrl;
    }

    // Hero details
    const heroTitle = document.getElementById('heroTitle');
    if (heroTitle) heroTitle.textContent = this.profile.name;

    const heroSubtitle = document.getElementById('heroSubtitle');
    if (heroSubtitle) heroSubtitle.textContent = this.profile.subtitle;

    // Action CTA buttons: Only Phone Call and WhatsApp
    const callBtn = document.getElementById('heroCallBtn');
    if (callBtn) {
      callBtn.href = `tel:+91${this.profile.phone.replace(/[^0-9]/g, '')}`;
      callBtn.innerHTML = `<span>📞</span> <span>ફોન કરો (${this.profile.phone})</span>`;
    }

    const whatsappBtn = document.getElementById('heroWhatsappBtn');
    if (whatsappBtn) {
      const waMsg = encodeURIComponent(`પ્રણામ શાસ્ત્રીજી, મારે પૂજા/વિધિ સંબંધિત માર્ગદર્શન જોઈએ છે.`);
      whatsappBtn.href = `https://wa.me/91${this.profile.whatsapp.replace(/[^0-9]/g, '')}?text=${waMsg}`;
      whatsappBtn.innerHTML = `<span>💬</span> <span>WhatsApp પર પૂછો</span>`;
    }
  }

  renderFooter() {
    if (!this.profile) return;
    const footerName = document.getElementById('footerShastrijiName');
    if (footerName) footerName.textContent = this.profile.name;

    const footerContactsWrapper = document.getElementById('footerContactsWrapper');
    if (footerContactsWrapper) {
      const cleanPhone = this.profile.phone.replace(/[^0-9]/g, '');
      const cleanWa = this.profile.whatsapp.replace(/[^0-9]/g, '');
      const waMsg = encodeURIComponent(`પ્રણામ શાસ્ત્રીજી, મારે પૂજા/વિધિ સંબંધિત માર્ગદર્શન જોઈએ છે.`);

      footerContactsWrapper.innerHTML = `
        <a href="tel:+91${cleanPhone}" class="footer-phone-cta">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          <span>ફોન કરો (${this.profile.phone})</span>
        </a>
        <a href="https://wa.me/91${cleanWa}?text=${waMsg}" target="_blank" class="footer-phone-cta" style="border-color: var(--color-whatsapp); color: var(--color-whatsapp-dark);">
          <span style="font-size: 1.2rem;">💬</span>
          <span>WhatsApp (${this.profile.whatsapp})</span>
        </a>
      `;
    }
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
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.filterAndRenderServices();
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
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; background: #FFFFFF; border-radius: 12px; border: 2px dashed var(--color-border-ornate);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h3 style="color: var(--color-maroon); font-size: 1.35rem;">કોઈ પૂજા કે સામગ્રી મળી નથી</h3>
          <p style="color: var(--color-text-sub); margin-top: 0.5rem;">કૃપા કરીને અન્ય નામ અથવા વિભાગ શોધો.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(service => `
      <article class="card service-card">
        <div class="service-thumb-box">
          <img src="${service.thumbnailUrl || 'assets/images/satyanarayan-card.jpg'}" alt="${service.title}" class="service-thumb-img" loading="lazy">
          <span class="service-cat-tag">${service.category}</span>
          ${service.badge ? `<span class="service-badge-tag">${service.badge}</span>` : ''}
        </div>
        <div class="service-body">
          <h3 class="service-title">${service.title}</h3>
          <div class="service-dakshina">
            <span>🪙</span> <span>${service.price || 'દક્ષિણા માટે સંપર્ક કરો'}</span>
          </div>
          <div class="service-snippet">
            <strong>મુખ્ય પૂજાપો:</strong> ${service.pujapo || 'સંપૂર્ણ સામગ્રી માટે પેમ્ફ્લેટ જુઓ.'}
          </div>
          <div class="service-footer">
            <button class="btn btn-primary open-pamphlet-btn" data-id="${service.id}">
              📜 પૂજાપો અને સંપૂર્ણ વિગત જુઓ ➔
            </button>
          </div>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.open-pamphlet-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const service = this.services.find(s => s.id === id);
        if (service) {
          this.openPamphletModal(service);
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
