/**
 * શાસ્ત્રીજી જીતેન્દ્ર જોષી - મોબાઈલ ફર્સ્ટ એડમિન CMS પેનલ
 * દિવ્ય ધાર્મિક થીમ, 100% શુદ્ધ ગુજરાતી ભાષામાં સંપૂર્ણ લાઈવ સંચાલન
 */

import { db } from './db.js';
import { CATEGORIES, DEFAULT_COMMON_SAMAGRI, toGujaratiNumber } from './data.js';
import { ICONS } from './icons.js';
import { mountCardGenerator } from './card-generator.js';
import { openScannerModal } from './image-scanner.js';

class AdminPanel {
  constructor() {
    this.isAuthenticated = false;
    this.editingServiceId = null;
    this.onDataChangeCallback = null;
    this.adminSearchFilter = '';
    this.currentPage = 1;
    this.itemsPerPage = 10;
  }

  init(onDataChange) {
    this.onDataChangeCallback = onDataChange;
    this.bindEvents();
  }

  bindEvents() {
    const loginTriggerBtn = document.getElementById('adminLoginTrigger');
    if (loginTriggerBtn) {
      loginTriggerBtn.addEventListener('click', (e) => {
        // If it's a link to admin.html, allow direct full-screen navigation
        if (loginTriggerBtn.getAttribute('href')) {
          return;
        }
        e.preventDefault();
        this.openPinModal();
      });
    }

    // Modal background click and Escape key listeners
    const modalOverlay = document.getElementById('adminModalOverlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.closeModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  closeModal() {
    const modalOverlay = document.getElementById('adminModalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="display:inline-flex;align-items:center;color:#D97706;">${ICONS.diya}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  async openPinModal() {
    const modalOverlay = document.getElementById('adminModalOverlay');
    const modalBody = document.getElementById('adminModalBody');
    if (!modalOverlay || !modalBody) return;

    if (this.isAuthenticated) {
      this.renderDashboard();
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      return;
    }

    // Render Sacred PIN Form
    modalBody.innerHTML = `
      <div class="admin-card pin-card-wrap">
        <button class="modal-close-btn" id="adminCloseBtn" title="બંધ કરો" aria-label="બંધ કરો">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="pin-screen-box">
          <div class="sacred-logo-ring pin-logo-ring" style="width: 72px; height: 72px; margin: 0 auto 1.25rem;">
            <img src="assets/icons/gemini-svg.svg" alt="શાસ્ત્રીજી ॐ લોગો" class="sacred-logo-img">
          </div>
          <div class="pin-shree-ganesh">।। શ્રી ગણેશાય નમઃ ।।</div>
          <h2 class="pin-screen-title">શાસ્ત્રીજી સુરક્ષિત લૉગિન</h2>
          <p class="pin-screen-desc">પૂજા સામગ્રી, પેમ્ફ્લેટ અને સંપર્ક વિગતનું લાઈવ સંચાલન કરવા ૪-અંકનો સુરક્ષા પિન દાખલ કરો.</p>
          
          <div class="pin-input-group">
            <input type="password" maxlength="1" class="pin-digit-box" id="pinDigit1" autofocus autocomplete="off" inputmode="numeric" aria-label="પિન અંક ૧">
            <input type="password" maxlength="1" class="pin-digit-box" id="pinDigit2" autocomplete="off" inputmode="numeric" aria-label="પિન અંક ૨">
            <input type="password" maxlength="1" class="pin-digit-box" id="pinDigit3" autocomplete="off" inputmode="numeric" aria-label="પિન અંક ૩">
            <input type="password" maxlength="1" class="pin-digit-box" id="pinDigit4" autocomplete="off" inputmode="numeric" aria-label="પિન અંક ૪">
          </div>

          <div id="pinErrorMsg" class="pin-error-box"></div>

          <button class="btn btn-primary pin-submit-btn" id="pinSubmitBtn" style="display:inline-flex;align-items:center;justify-content:center;gap:0.45rem;">
            ${ICONS.lock}
            <span>પ્રવેશ કરો</span>
          </button>

          <div class="pin-hint-tag" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.shield}
            <span>મૂળભૂત સુરક્ષા પિન: <strong>1234</strong></span>
          </div>
        </div>
      </div>
    `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Close button
    document.getElementById('adminCloseBtn')?.addEventListener('click', () => {
      this.closeModal();
    });

    // Auto-advance PIN inputs
    const digits = [
      document.getElementById('pinDigit1'),
      document.getElementById('pinDigit2'),
      document.getElementById('pinDigit3'),
      document.getElementById('pinDigit4')
    ];

    digits.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && index < 3) {
          digits[index + 1].focus();
        }
        if (digits.every(d => d.value.length === 1)) {
          this.verifyPin(digits.map(d => d.value).join(''));
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          digits[index - 1].focus();
        }
      });
    });

    document.getElementById('pinSubmitBtn')?.addEventListener('click', () => {
      const pin = digits.map(d => d.value).join('');
      this.verifyPin(pin);
    });
  }

  async verifyPin(enteredPin) {
    const errorEl = document.getElementById('pinErrorMsg');
    const profile = await db.getProfile();
    const correctPin = profile.pin || '1234';

    if (enteredPin === correctPin) {
      this.isAuthenticated = true;
      this.showToast('સ્વાગત છે શાસ્ત્રીજી! લૉગિન સફળ રહ્યું.');
      this.renderDashboard('services');
    } else {
      if (errorEl) {
        errorEl.textContent = 'ખોટો પિન! કૃપા કરીને ફરી પ્રયાસ કરો.';
      }
      const digits = ['pinDigit1', 'pinDigit2', 'pinDigit3', 'pinDigit4'].map(id => document.getElementById(id));
      digits.forEach(d => { if (d) d.value = ''; });
      if (digits[0]) digits[0].focus();
    }
  }

  async renderDashboard(activeTab = 'services') {
    const modalBody = document.getElementById('adminModalBody');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="admin-card admin-dashboard-card">
        
        <!-- સ્ટીકી હેડર બાર (Sticky Header Bar) -->
        <div class="admin-sticky-header">
          <div class="admin-header-brand">
            <div class="sacred-logo-ring admin-header-logo-ring" style="width: 44px; height: 44px; flex-shrink: 0; padding: 2px;">
              <img src="assets/icons/gemini-svg.svg" alt="શાસ્ત્રીજી ॐ લોગો" class="sacred-logo-img">
            </div>
            <div>
              <div class="admin-header-badge" style="display:inline-flex;align-items:center;gap:0.4rem;">
                <span class="admin-status-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10B981;box-shadow:0 0 6px #10B981;"></span>
                <span>લાઈવ સર્વર કનેક્ટેડ</span>
              </div>
              <h2 class="admin-header-title">શાસ્ત્રીજી કંટ્રોલ પેનલ (CMS)</h2>
            </div>
          </div>
          <button class="modal-close-btn" id="adminCloseBtn" title="બંધ કરો" aria-label="બંધ કરો">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- નેવિગેશન ટેબ્સ (Nav Tabs with Crisp SVG Icons) -->
        <div class="admin-nav-tabs">
          <button class="admin-tab-btn ${activeTab === 'services' ? 'active' : ''}" id="tabBtnServices" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.list}
            <span>બધી પૂજાઓ</span>
          </button>
          <button class="admin-tab-btn ${activeTab === 'add' ? 'active' : ''}" id="tabBtnAdd" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.plus}
            <span>નવી પૂજા ઉમેરો</span>
          </button>
          <button class="admin-tab-btn ${activeTab === 'profile' ? 'active' : ''}" id="tabBtnProfile" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.user}
            <span>પ્રોફાઈલ વિગત</span>
          </button>
          <button class="admin-tab-btn ${activeTab === 'pin' ? 'active' : ''}" id="tabBtnPin" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.key}
            <span>સુરક્ષા પિન</span>
          </button>
          <button class="admin-tab-btn tab-logout" id="tabBtnLogout" title="બહાર નીકળો" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.logout}
            <span>લૉગ આઉટ</span>
          </button>
        </div>

        <!-- ટેબ સામગ્રી કન્ટેનર -->
        <div id="adminTabContent" class="admin-tab-content-wrap"></div>
      </div>
    `;

    document.getElementById('adminCloseBtn')?.addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('tabBtnServices')?.addEventListener('click', () => this.renderDashboard('services'));
    document.getElementById('tabBtnAdd')?.addEventListener('click', () => this.renderAddEditForm(null));
    document.getElementById('tabBtnProfile')?.addEventListener('click', () => this.renderProfileForm());
    document.getElementById('tabBtnPin')?.addEventListener('click', () => this.renderPinChangeForm());
    document.getElementById('tabBtnLogout')?.addEventListener('click', () => {
      this.isAuthenticated = false;
      this.closeModal();
      this.showToast('આપ સફળતાપૂર્વક લૉગ આઉટ થયા છો.');
    });

    if (activeTab === 'services') {
      await this.renderServicesList();
    }
  }

  async renderServicesList() {
    const container = document.getElementById('adminTabContent');
    if (!container) return;

    const allServices = await db.getServices();
    const query = this.adminSearchFilter.toLowerCase().trim();

    const services = query ? allServices.filter(s => {
      const corpus = `${s.title || ''} ${s.englishTitle || ''} ${s.category || ''} ${(s.keywords || []).join(' ')}`.toLowerCase();
      return corpus.includes(query);
    }) : allServices;

    if (allServices.length === 0) {
      container.innerHTML = `
        <div class="admin-empty-state">
          <div class="empty-icon" style="color: #8B1E0F;">${ICONS.diya}</div>
          <h3>હજી કોઈ પૂજા ઉમેરેલ નથી</h3>
          <p>આપ અહીંથી નવી પૂજા વિધિ અને સામગ્રી ઉમેરી શકો છો.</p>
          <button class="btn btn-primary" id="emptyAddBtn" style="margin-top: 1rem; display:inline-flex; align-items:center; gap:0.45rem;">
            ${ICONS.plus}
            <span>પ્રથમ પૂજા ઉમેરો</span>
          </button>
        </div>
      `;
      document.getElementById('emptyAddBtn')?.addEventListener('click', () => this.renderAddEditForm(null));
      return;
    }

    // Pagination calculations
    const totalFiltered = services.length;
    const effectivePerPage = this.itemsPerPage === 'all' ? totalFiltered : parseInt(this.itemsPerPage, 10);
    const totalPages = Math.max(1, Math.ceil(totalFiltered / effectivePerPage));

    if (this.currentPage > totalPages) this.currentPage = totalPages;
    if (this.currentPage < 1) this.currentPage = 1;

    const startIndex = (this.currentPage - 1) * effectivePerPage;
    const endIndex = Math.min(startIndex + effectivePerPage, totalFiltered);
    const paginatedServices = services.slice(startIndex, endIndex);

    // Build pagination HTML
    let paginationHtml = '';
    if (totalFiltered > 0) {
      const startNum = toGujaratiNumber(startIndex + 1);
      const endNum = toGujaratiNumber(endIndex);
      const totalNum = toGujaratiNumber(totalFiltered);
      const currentPageNum = toGujaratiNumber(this.currentPage);
      const totalPagesNum = toGujaratiNumber(totalPages);

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

      paginationHtml = `
        <div class="admin-pagination-container" style="margin-top: 1rem;">
          <nav class="sacred-pagination-bar" aria-label="એડમિન પૂજા યાદી પેજીનેશન નેવિગેશન">
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
              <label for="adminModalPerPageSelect" class="pagination-per-page-label">પ્રતિ પેજ:</label>
              <select id="adminModalPerPageSelect" class="pagination-per-page-select" aria-label="પ્રતિ પેજ પૂજાઓની સંખ્યા પસંદ કરો">
                <option value="6" ${this.itemsPerPage === 6 || this.itemsPerPage === '6' ? 'selected' : ''}>૬ પૂજાઓ (ટેસ્ટ)</option>
                <option value="10" ${this.itemsPerPage === 10 || this.itemsPerPage === '10' ? 'selected' : ''}>૧૦ પૂજાઓ</option>
                <option value="15" ${this.itemsPerPage === 15 || this.itemsPerPage === '15' ? 'selected' : ''}>૧૫ પૂજાઓ</option>
                <option value="25" ${this.itemsPerPage === 25 || this.itemsPerPage === '25' ? 'selected' : ''}>૨૫ પૂજાઓ</option>
                <option value="all" ${this.itemsPerPage === 'all' ? 'selected' : ''}>બધી પૂજાઓ</option>
              </select>
            </div>
          </nav>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="admin-services-top-bar">
        <div class="admin-search-wrap">
          <span class="admin-search-icon" style="display:inline-flex; align-items:center;">${ICONS.search}</span>
          <input type="text" id="adminServiceSearchInput" class="admin-search-input" placeholder="પૂજાનું નામ શોધો (દા.ત. સત્યનારાયણ, ગણેશ, Vastu)..." value="${this.adminSearchFilter}">
        </div>
        <button class="btn btn-primary admin-add-top-btn" id="addNewServiceTopBtn" style="display:inline-flex; align-items:center; gap:0.45rem;">
          ${ICONS.plus}
          <span>નવી પૂજા ઉમેરો</span>
        </button>
      </div>

      <div class="admin-services-meta-count">
        <span>કુલ પૂજા સેવાઓ: <strong>${allServices.length}</strong></span>
        ${query ? `<span class="search-filter-tag">શોધ પરિણામ: <strong>${services.length}</strong></span>` : ''}
      </div>

      <div class="admin-services-list" id="adminServicesItemsList">
        ${services.length === 0 ? `
          <div class="admin-empty-state" style="padding: 2rem 1rem;">
            <p>‘${query}’ નામે કોઈ પૂજા મળી નથી.</p>
            <button class="btn btn-outline" id="clearAdminFilterBtn" style="margin-top: 0.5rem;">બધી પૂજાઓ દર્શાવો</button>
          </div>
        ` : paginatedServices.map(item => `
          <div class="admin-service-card" data-id="${item.id}">
            <div class="admin-srv-thumb-wrap">
              <img src="${item.thumbnailUrl || 'assets/images/card-ganesh.png'}" alt="${item.title}" class="admin-srv-thumb" loading="lazy">
            </div>
            <div class="admin-srv-info">
              <div class="admin-srv-title-row">
                <h4 class="admin-srv-title">${item.title}</h4>
                <span class="admin-srv-category-pill">${item.category}</span>
              </div>
              <div class="admin-srv-subtitle">${item.subtitle || 'વિધિવત પૂજા માગર્દર્શિકા'} • ${item.price || 'દક્ષિણા માટે સંપર્ક કરો'}</div>
              <div class="admin-srv-badge-tag">
                <span style="color:#D97706; display:inline-flex; align-items:center;">${ICONS.star}</span> <span>${item.badge || 'સાત્વિક વિધાન'}</span>
                ${item.englishTitle ? `<span class="admin-srv-en-tag">En: ${item.englishTitle}</span>` : ''}
              </div>
            </div>
            <div class="admin-srv-actions">
              <button class="btn btn-outline edit-srv-btn" data-id="${item.id}" title="સુધારો (Edit)" aria-label="${item.title} સુધારો">
                ${ICONS.edit}
                <span>સુધારો</span>
              </button>
              <button class="btn btn-call del-srv-btn" data-id="${item.id}" title="કાઢી નાખો (Delete)" aria-label="${item.title} કાઢી નાખો">
                ${ICONS.trash}
                <span>હટાવો</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      ${paginationHtml}
    `;

    // Live search input handling
    const searchInput = document.getElementById('adminServiceSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.adminSearchFilter = e.target.value;
        this.currentPage = 1;
        this.renderServicesList();
      });
    }

    document.getElementById('clearAdminFilterBtn')?.addEventListener('click', () => {
      this.adminSearchFilter = '';
      this.currentPage = 1;
      this.renderServicesList();
    });

    document.getElementById('addNewServiceTopBtn')?.addEventListener('click', () => this.renderAddEditForm(null));

    // Wire pagination buttons
    container.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetPage = parseInt(e.currentTarget.dataset.page, 10);
        if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages && targetPage !== this.currentPage) {
          this.currentPage = targetPage;
          this.renderServicesList();
          container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Wire per page select
    const perPageSelect = document.getElementById('adminModalPerPageSelect');
    if (perPageSelect) {
      perPageSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        this.itemsPerPage = val === 'all' ? 'all' : parseInt(val, 10);
        this.currentPage = 1;
        this.renderServicesList();
      });
    }

    container.querySelectorAll('.edit-srv-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const srv = await db.getServiceById(id);
        this.renderAddEditForm(srv);
      });
    });

    container.querySelectorAll('.del-srv-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const srv = await db.getServiceById(id);
        const confirmDelete = confirm(`શું આપ ખરેખર "${srv?.title || 'આ પૂજા'}" કાઢી નાખવા માંગો છો?`);
        if (confirmDelete) {
          await db.deleteService(id);
          this.showToast('પૂજા સફળતાપૂર્વક કાઢી નાખવામાં આવી.');
          if (this.onDataChangeCallback) this.onDataChangeCallback();
          this.renderServicesList();
        }
      });
    });
  }

  renderAddEditForm(service = null) {
    const isEdit = Boolean(service);
    const container = document.getElementById('adminTabContent');
    if (!container) return;

    // Highlight Add tab if creating new
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    if (!isEdit) {
      document.getElementById('tabBtnAdd')?.classList.add('active');
    }

    const categoriesOptions = CATEGORIES
      .filter(c => c !== "બધી વિધિઓ")
      .map(cat => `<option value="${cat}" ${service?.category === cat ? 'selected' : ''}>${cat}</option>`)
      .join('');

    const initialTitle = service?.title || '';
    const initialEnTitle = service?.englishTitle || '';
    const initialCategory = service?.category || 'કર્મકાંડ વિધિ';
    const initialPrice = service?.price || (isEdit ? '' : DEFAULT_COMMON_SAMAGRI.price);
    const initialBadge = service?.badge || (isEdit ? '' : DEFAULT_COMMON_SAMAGRI.badge);
    const initialKeywords = Array.isArray(service?.keywords)
      ? service.keywords.join(', ')
      : (isEdit ? '' : DEFAULT_COMMON_SAMAGRI.keywords);
    const initialPujapo = service?.pujapo || (isEdit ? '' : DEFAULT_COMMON_SAMAGRI.pujapo);
    const initialAnaj = service?.anajNaivedya || (isEdit ? '' : DEFAULT_COMMON_SAMAGRI.anajNaivedya);
    const initialTaiyari = service?.taiyari || (isEdit ? '' : DEFAULT_COMMON_SAMAGRI.taiyari);
    const initialNotes = service?.notes || (isEdit ? '' : DEFAULT_COMMON_SAMAGRI.notes);

    container.innerHTML = `
      <form id="serviceForm" class="admin-edit-form">
        <div class="admin-form-header-bar">
          <div>
            <h3 class="admin-form-title" style="display:flex;align-items:center;gap:0.5rem;">
              ${isEdit ? ICONS.edit : ICONS.plus}
              <span>${isEdit ? 'પૂજા વિધિમાં ફેરફાર કરો' : 'નવી પૂજા વિધિ ઉમેરો'}</span>
            </h3>
            <p class="admin-form-subtitle">દરેક માહિતી સાચવવા પર વેબસાઈટ પર તુરંત લાઈવ થશે</p>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="fBackToListBtn" style="display:inline-flex;align-items:center;gap:0.4rem;">
            ${ICONS.arrowLeft}
            <span>યાદી પર પાછા જાઓ</span>
          </button>
        </div>

        <!-- સેક્શન ૧: મુખ્ય પૂજા વિગત (Core Details) -->
        <div class="admin-form-fieldset">
          <div class="fieldset-legend" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.tag}
            <span>૧. મુખ્ય પૂજા વિગત (Core Information)</span>
          </div>

          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label">પૂજાનું ગુજરાતી નામ *</label>
              <input type="text" class="form-control" id="fTitle" required value="${initialTitle}" placeholder="ઉદાહરણ: સત્યનારાયણ કથા / ગણેશ પૂજા">
            </div>
            <div class="form-group">
              <label class="form-label">અંગ્રેજી નામ (English Title / Search Alias)</label>
              <input type="text" class="form-control" id="fEnglishTitle" value="${initialEnTitle}" placeholder="ઉદાહરણ: Satyanarayan Dev Katha / Ganesh Pooja">
            </div>
          </div>

          <div class="form-row-3col">
            <div class="form-group">
              <label class="form-label">વિભાગ (Category) *</label>
              <select class="form-control" id="fCategory" required>
                ${categoriesOptions}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">દક્ષિણા / કિંમત</label>
              <input type="text" class="form-control" id="fPrice" value="${initialPrice}" placeholder="દક્ષિણા માટે સંપર્ક કરો">
            </div>
            <div class="form-group">
              <label class="form-label">વિશેષ બેજ (Badge)</label>
              <input type="text" class="form-control" id="fBadge" value="${initialBadge}" placeholder="ઉદાહરણ: સર્વ મનોકામના પૂર્ણ">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">દ્વિભાષી સર્ચ કીવર્ડ્સ (Search Keywords - અલ્પવિરામથી અલગ કરો)</label>
            <input type="text" class="form-control" id="fKeywords" value="${initialKeywords}" placeholder="દા.ત. satyanarayan, katha, vrat, prasad, sheera, સત્યનારાયણ">
            <div class="form-helper-text">આ કીવર્ડ્સ દ્વારા ભક્તો અંગ્રેજી અથવા ગુજરાતીમાં સર્ચ કરીને આ પૂજા સરળતાથી મેળવી શકશે.</div>
          </div>
        </div>

        <!-- સેક્શન ૨: કેમેરા સ્કેનર અને દિવ્ય કાર્ડ જનરેટર -->
        <div class="admin-form-fieldset highlight-fieldset">
          <div class="fieldset-legend" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.camera}
            <span>૨. મુખ્ય ફોટો, સ્કેનર અને દિવ્ય કાર્ડ (Photo & Card Generator)</span>
          </div>

          <!-- સ્કેનર બેનર -->
          <div class="scanner-trigger-banner">
            <div class="scanner-info-group">
              <span class="scanner-camera-icon" style="display:inline-flex;align-items:center;">${ICONS.camera}</span>
              <div>
                <div class="scanner-title">કેમેરા અથવા ગેલેરીમાંથી સ્કેન કરો</div>
                <div class="scanner-desc">પેમ્ફ્લેટ અથવા સામગ્રી લિસ્ટનો ફોટો પાડી આપમેળે ફોર્મ ભરી શકાય છે.</div>
              </div>
            </div>
            <button type="button" class="btn btn-outline" id="fOpenScannerBtn" style="display:inline-flex;align-items:center;gap:0.45rem;">
              ${ICONS.camera}
              <span>સ્કેન શરૂ કરો</span>
            </button>
          </div>

          <!-- ફોટો અપલોડ અને પ્રીવ્યૂ -->
          <div class="form-group" style="margin-top: 1rem;">
            <label class="form-label">પૂજાનો મુખ્ય ફોટો (Thumbnail Image)</label>
            <input type="file" accept="image/*" class="form-control" id="fImageFile" style="padding: 0.5rem;">

            <div id="imagePreviewBox" class="admin-photo-preview-box" style="display: ${service?.thumbnailUrl ? 'flex' : 'none'};">
              <img id="imgPreviewThumb" src="${service?.thumbnailUrl || ''}" alt="પ્રીવ્યૂ" class="admin-photo-thumb">
              <div>
                <div id="imgPreviewStatus" class="photo-preview-status" style="display:inline-flex;align-items:center;gap:0.35rem;">
                  ${ICONS.check}
                  <span>મુખ્ય ફોટો સેટ થયેલ છે</span>
                </div>
                <div id="imgPreviewMeta" class="photo-preview-meta">સાચવવા પર આ ફોટો વેબસાઈટ પર દર્શાવાશે</div>
              </div>
            </div>
          </div>

          <!-- કેનવાસ કાર્ડ જનરેટર માઉન્ટ પોઈન્ટ -->
          <div id="cardGenMountPoint" style="margin-top: 1rem;"></div>
        </div>

        <!-- સેક્શન ૩: સામગ્રી યાદી (Samagri Details) -->
        <div class="admin-form-fieldset">
          <div class="fieldset-legend" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.list}
            <span>૩. સામગ્રી યાદી અને વિધિ તૈયારી (Materials & Preparations)</span>
          </div>

          <div class="form-group">
            <label class="form-label" style="display:inline-flex;align-items:center;gap:0.4rem;">
              ${ICONS.scroll}
              <span>પૂજાપો / મુખ્ય સામગ્રી લિસ્ટ * (અલ્પવિરામથી અલગ કરો)</span>
            </label>
            <textarea class="form-control" id="fPujapo" required placeholder="શ્રીફળ-૧, સોપારી-૧૫ નંગ, કંકુ, અબીલ, ગુલાલ, કપૂર, કેળના પાન, વગેરે...">${initialPujapo}</textarea>
            <div class="form-helper-text">અલ્પવિરામ (,) મૂકવાથી વેબસાઈટ પર દરેક વસ્તુ સુંદર પિલ્સ (Cards) સ્વરૂપે અલગ-અલગ દર્શાવાશે.</div>
          </div>

          <div class="form-group">
            <label class="form-label" style="display:inline-flex;align-items:center;gap:0.4rem;">
              ${ICONS.diya}
              <span>અનાજ અને પવિત્ર નૈવેદ્ય (પ્રસાદ)</span>
            </label>
            <textarea class="form-control" id="fAnaj" placeholder="ઘઉં, ચોખા સવાશેર, પંચામૃત, શિરાનો પ્રસાદ, ઋતુફળ...">${initialAnaj}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" style="display:inline-flex;align-items:center;gap:0.4rem;">
              ${ICONS.shield}
              <span>મૂર્તિ, વાસણ અને ઘરની તૈયારી</span>
            </label>
            <textarea class="form-control" id="fTaiyari" placeholder="બાજોઠ-૧, પાટલો-૧, થાળી-૫, વાટકા-૫, ચમચી-૩, તાંબાનો લોટો, આસન...">${initialTaiyari}</textarea>
          </div>
        </div>

        <!-- સેક્શન ૪: શાસ્ત્રોક્ત મહત્વ અને વિશેષ નોંધ -->
        <div class="admin-form-fieldset">
          <div class="fieldset-legend" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.scroll}
            <span>૪. શાસ્ત્રોક્ત મહત્વ અને વિશેષ માર્ગદર્શન (Notes & Guidance)</span>
          </div>

          <div class="form-group">
            <label class="form-label">વિશેષ નોંધ / શાસ્ત્રોક્ત મહત્વ</label>
            <textarea class="form-control" id="fNotes" placeholder="આ પૂજા કરવાથી સુખ, શાંતિ, સમૃદ્ધિ અને પારિવારિક એકતા વધે છે...">${initialNotes}</textarea>
          </div>
        </div>

        <!-- સબમિટ અને કેન્સલ એક્શન બાર -->
        <div class="admin-form-actions-bar">
          <button type="submit" class="btn btn-primary btn-save-action" id="fSubmitBtn" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.save}
            <span>${isEdit ? 'ફેરફાર સાચવો' : 'નવી પૂજા ઉમેરો'}</span>
          </button>
          <button type="button" class="btn btn-outline" id="fCancelBtn" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.close}
            <span>રદ કરો</span>
          </button>
        </div>
      </form>
    `;

    document.getElementById('fCancelBtn')?.addEventListener('click', () => {
      this.renderDashboard('services');
    });

    document.getElementById('fBackToListBtn')?.addEventListener('click', () => {
      this.renderDashboard('services');
    });

    // Track user-generated canvas image
    let selectedGeneratedImage = null;

    // Mount Auspicious Canvas Card Generator
    const cardGenHandle = mountCardGenerator(
      document.getElementById('cardGenMountPoint'),
      {
        initialTitle: service?.title || document.getElementById('fTitle')?.value || 'પવિત્ર પૂજા વિધાન',
        initialCategory: service?.category || document.getElementById('fCategory')?.value || 'ધાર્મિક પૂજા',
        onSetImage: async (dataUrl) => {
          selectedGeneratedImage = dataUrl;
          const previewBox = document.getElementById('imagePreviewBox');
          const previewThumb = document.getElementById('imgPreviewThumb');
          const previewStatus = document.getElementById('imgPreviewStatus');
          const previewMeta = document.getElementById('imgPreviewMeta');
          if (previewBox && previewThumb) {
            previewThumb.src = dataUrl;
            previewBox.style.display = 'flex';
            if (previewStatus) previewStatus.innerHTML = `${ICONS.check} <span>દિવ્ય જનરેટ કરેલ ફોટો પસંદ થયો!</span>`;
            if (previewMeta) previewMeta.textContent = 'સાચવવા પર આ નવું કાર્ડ મુખ્ય ફોટો બનશે';
          }
          this.showToast('દિવ્ય કાર્ડ મુખ્ય ફોટો તરીકે સેટ થઈ ગયું!');
        }
      }
    );

    // Sync Title input with live card generator
    const fTitleEl = document.getElementById('fTitle');
    const fCategoryEl = document.getElementById('fCategory');
    if (fTitleEl && cardGenHandle) {
      fTitleEl.addEventListener('input', (e) => cardGenHandle.setTitle(e.target.value));
    }
    if (fCategoryEl && cardGenHandle) {
      fCategoryEl.addEventListener('change', (e) => cardGenHandle.setCategory(e.target.value));
    }

    // Wire Scanner Button
    document.getElementById('fOpenScannerBtn')?.addEventListener('click', () => {
      openScannerModal({
        onApply: (scanned) => {
          if (scanned.title) {
            fTitleEl.value = scanned.title;
            if (cardGenHandle) cardGenHandle.setTitle(scanned.title);
          }
          if (scanned.category) {
            fCategoryEl.value = scanned.category;
            if (cardGenHandle) cardGenHandle.setCategory(scanned.category);
          }
          if (scanned.price) document.getElementById('fPrice').value = scanned.price;
          if (scanned.pujapo) document.getElementById('fPujapo').value = scanned.pujapo;
          if (scanned.anajNaivedya) document.getElementById('fAnaj').value = scanned.anajNaivedya;
          if (scanned.taiyari) document.getElementById('fTaiyari').value = scanned.taiyari;
          if (scanned.notes) document.getElementById('fNotes').value = scanned.notes;

          this.showToast('સ્કેન કરેલી બધી વિગતો આપમેળે ફોર્મમાં ભરાઈ ગઈ છે!');
        }
      });
    });

    const form = document.getElementById('serviceForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('fSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>સાચવી રહ્યા છીએ...</span>`;
      }

      try {
        let imageUrl = service?.thumbnailUrl || 'assets/images/card-ganesh.png';
        const fileInput = document.getElementById('fImageFile');
        if (fileInput.files && fileInput.files[0]) {
          imageUrl = await db.uploadImage(fileInput.files[0]);
        } else if (selectedGeneratedImage) {
          const safeTitle = (document.getElementById('fTitle').value.trim() || 'pooja').replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_');
          imageUrl = await db.uploadImage(selectedGeneratedImage, `card_${safeTitle}_${Date.now()}.jpg`);
        }

        // Keywords parsing
        const rawKeywords = document.getElementById('fKeywords').value.trim();
        const keywordsArray = rawKeywords
          ? rawKeywords.split(/[,،]+/).map(k => k.trim().toLowerCase()).filter(Boolean)
          : (service?.keywords || []);

        const data = {
          title: document.getElementById('fTitle').value.trim(),
          englishTitle: document.getElementById('fEnglishTitle').value.trim(),
          category: document.getElementById('fCategory').value,
          price: document.getElementById('fPrice').value.trim() || 'દક્ષિણા માટે સંપર્ક કરો',
          badge: document.getElementById('fBadge').value.trim() || 'સાત્વિક સંસ્કાર',
          thumbnailUrl: imageUrl,
          keywords: keywordsArray,
          pujapo: document.getElementById('fPujapo').value.trim(),
          anajNaivedya: document.getElementById('fAnaj').value.trim(),
          taiyari: document.getElementById('fTaiyari').value.trim(),
          notes: document.getElementById('fNotes').value.trim(),
          originalPamphlets: service?.originalPamphlets || []
        };

        if (isEdit) {
          await db.updateService(service.id, data);
          this.showToast('પૂજામાં ફેરફાર સફળતાપૂર્વક સાચવવામાં આવ્યા!');
        } else {
          await db.addService(data);
          this.showToast('નવી પૂજા સફળતાપૂર્વક ઉમેરવામાં આવી!');
        }

        if (this.onDataChangeCallback) this.onDataChangeCallback();
        this.renderDashboard('services');
      } catch (err) {
        console.error('Save error:', err);
        alert('સાચવવામાં સમસ્યા આવી: ' + err.message);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${ICONS.save} <span>ફરી પ્રયાસ કરો</span>`;
        }
      }
    });
  }

  async renderProfileForm() {
    const container = document.getElementById('adminTabContent');
    if (!container) return;

    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tabBtnProfile')?.classList.add('active');

    const profile = await db.getProfile();

    container.innerHTML = `
      <form id="profileForm" class="admin-edit-form">
        <div class="admin-form-header-bar">
          <div>
            <h3 class="admin-form-title" style="display:flex;align-items:center;gap:0.5rem;">
              ${ICONS.user}
              <span>શાસ્ત્રીજી પ્રોફાઈલ અને સંપર્ક વિગત</span>
            </h3>
            <p class="admin-form-subtitle">વેબસાઈટના હેડર, હીરો સેક્શન અને ફૂટરમાં આ વિગતો દર્શાવાશે</p>
          </div>
        </div>

        <div class="admin-form-fieldset">
          <div class="fieldset-legend" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.diya}
            <span>મુખ્ય પરિચય (Priest Profile)</span>
          </div>

          <div class="form-group">
            <label class="form-label">શાસ્ત્રીજીનું પૂરું નામ *</label>
            <input type="text" class="form-control" id="pName" required value="${profile.name || ''}" placeholder="શાસ્ત્રીજી જીતેન્દ્ર જોષી (જીતુભાઈ જોષી)">
          </div>

          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label">મોબાઈલ નંબર *</label>
              <input type="text" class="form-control" id="pPhone" required value="${profile.phone || ''}" placeholder="99252 64929">
            </div>
            <div class="form-group">
              <label class="form-label">વોટ્સએપ નંબર *</label>
              <input type="text" class="form-control" id="pWhatsapp" required value="${profile.whatsapp || ''}" placeholder="9925264929">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">વિશેષતા / માર્ગદર્શન ટેગલાઈન</label>
            <textarea class="form-control" id="pSubtitle" placeholder="કર્મકાંડ • ધાર્મિક • સામાજિક • વ્રત વિધાન સંબંધિત આવશ્યક માર્ગદર્શન">${profile.subtitle || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">નવો પ્રોફાઈલ / સ્ટુડિયો ફોટો અપલોડ કરો</label>
            <input type="file" accept="image/*" class="form-control" id="pPhotoFile" style="padding: 0.5rem;">
            ${profile.avatarUrl ? `
              <div class="profile-current-thumb-box">
                <img src="${profile.avatarUrl}" alt="હાલનો ફોટો" class="profile-current-thumb">
                <div>
                  <span class="profile-thumb-label">હાલનો પ્રોફાઈલ ફોટો</span>
                  <div class="profile-thumb-sub">આ ફોટો વેબસાઈટ પર લાઈવ છે</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="admin-form-actions-bar">
          <button type="submit" class="btn btn-primary btn-save-action" id="pSubmitBtn" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.save}
            <span>પ્રોફાઈલ સાચવો</span>
          </button>
        </div>
      </form>
    `;

    const form = document.getElementById('profileForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('pSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>સાચવી રહ્યા છીએ...</span>`;
      }

      try {
        let avatarUrl = profile.avatarUrl;
        const fileInput = document.getElementById('pPhotoFile');
        if (fileInput.files && fileInput.files[0]) {
          avatarUrl = await db.uploadImage(fileInput.files[0]);
        }

        const updated = {
          name: document.getElementById('pName').value.trim(),
          phone: document.getElementById('pPhone').value.trim(),
          whatsapp: document.getElementById('pWhatsapp').value.trim(),
          subtitle: document.getElementById('pSubtitle').value.trim(),
          avatarUrl: avatarUrl
        };

        await db.updateProfile(updated);
        this.showToast('પ્રોફાઈલ સફળતાપૂર્વક અપડેટ કરવામાં આવી!');
        if (this.onDataChangeCallback) this.onDataChangeCallback();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${ICONS.save} <span>પ્રોફાઈલ સાચવો</span>`;
        }
      } catch (err) {
        console.error('Profile update error:', err);
        alert('પ્રોફાઈલ સાચવવામાં સમસ્યા આવી: ' + err.message);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${ICONS.save} <span>ફરી પ્રયાસ કરો</span>`;
        }
      }
    });
  }

  async renderPinChangeForm() {
    const container = document.getElementById('adminTabContent');
    if (!container) return;

    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tabBtnPin')?.classList.add('active');

    container.innerHTML = `
      <form id="pinChangeForm" class="admin-edit-form pin-change-form-wrap">
        <div class="admin-form-header-bar" style="justify-content: center; text-align: center;">
          <div>
            <h3 class="admin-form-title" style="display:flex;align-items:center;justify-content:center;gap:0.5rem;">
              ${ICONS.key}
              <span>સુરક્ષા પિન બદલો</span>
            </h3>
            <p class="admin-form-subtitle">૪-અંકનો નવો પિન સેટ કરીને CMS પેનલ વધુ સુરક્ષિત બનાવો</p>
          </div>
        </div>

        <div class="admin-form-fieldset">
          <div class="form-group">
            <label class="form-label">હાલનો પિન (Current PIN) *</label>
            <input type="password" maxlength="4" class="form-control" id="curPin" required placeholder="૪ અંકનો હાલનો પિન" inputmode="numeric">
          </div>

          <div class="form-group">
            <label class="form-label">નવો પિન (New 4-Digit PIN) *</label>
            <input type="password" maxlength="4" class="form-control" id="newPin" required placeholder="નવો ૪ અંકનો પિન" inputmode="numeric">
          </div>

          <div class="form-group">
            <label class="form-label">નવો પિન ફરીથી દાખલ કરો (Confirm PIN) *</label>
            <input type="password" maxlength="4" class="form-control" id="confirmPin" required placeholder="નવો પિન કન્ફર્મ કરો" inputmode="numeric">
          </div>

          <div id="pinChangeError" class="pin-error-box"></div>
        </div>

        <div class="admin-form-actions-bar" style="justify-content: center;">
          <button type="submit" class="btn btn-primary btn-save-action" id="pinChangeSubmitBtn" style="display:inline-flex;align-items:center;gap:0.45rem;">
            ${ICONS.lock}
            <span>નવો પિન સાચવો</span>
          </button>
        </div>
      </form>
    `;

    const form = document.getElementById('pinChangeForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const curPin = document.getElementById('curPin').value.trim();
      const newPin = document.getElementById('newPin').value.trim();
      const confirmPin = document.getElementById('confirmPin').value.trim();
      const errEl = document.getElementById('pinChangeError');

      const profile = await db.getProfile();
      if (curPin !== (profile.pin || '1234')) {
        errEl.textContent = 'હાલનો પિન ખોટો છે!';
        return;
      }

      if (newPin.length !== 4 || isNaN(newPin)) {
        errEl.textContent = 'નવો પિન બરાબર ૪ અંકનો હોવો જોઈએ!';
        return;
      }

      if (newPin !== confirmPin) {
        errEl.textContent = 'બંને નવા પિન સરખા નથી!';
        return;
      }

      await db.updateProfile({ pin: newPin });
      this.showToast('સુરક્ષા પિન સફળતાપૂર્વક બદલાઈ ગયો છે!');
      this.renderDashboard('services');
    });
  }
}

export const adminPanel = new AdminPanel();
