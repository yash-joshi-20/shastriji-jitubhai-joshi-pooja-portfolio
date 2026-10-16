/**
 * શાસ્ત્રીજી જીતેન્દ્ર જોષી - મોબાઈલ ફર્સ્ટ એડમિન CMS પેનલ
 * દિવ્ય ધાર્મિક થીમ, 100% શુદ્ધ ગુજરાતી ભાષામાં સંપૂર્ણ લાઈવ સંચાલન
 */

import { db } from './db.js';
import { CATEGORIES } from './data.js';
import { mountCardGenerator } from './card-generator.js';
import { openScannerModal } from './image-scanner.js';

class AdminPanel {
  constructor() {
    this.isAuthenticated = false;
    this.editingServiceId = null;
    this.onDataChangeCallback = null;
    this.adminSearchFilter = '';
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
    toast.innerHTML = `<span>🙏</span> <span>${message}</span>`;
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
          <div class="pin-om-symbol">🕉️</div>
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

          <button class="btn btn-primary pin-submit-btn" id="pinSubmitBtn">
            <span>🔐</span> <span>પ્રવેશ કરો</span>
          </button>

          <div class="pin-hint-tag">
            <span>💡</span> <span>મૂળભૂત સુરક્ષા પિન: <strong>1234</strong></span>
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
        errorEl.textContent = '❌ ખોટો પિન! કૃપા કરીને ફરી પ્રયાસ કરો.';
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
            <span class="admin-header-om">🕉️</span>
            <div>
              <div class="admin-header-badge">
                <span class="pulse-indicator">🟢</span> <span>લાઈવ સર્વર કનેક્ટેડ</span>
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

        <!-- નેવિગેશન ટેબ્સ (Nav Tabs) -->
        <div class="admin-nav-tabs">
          <button class="admin-tab-btn ${activeTab === 'services' ? 'active' : ''}" id="tabBtnServices">
            <span>📋</span> <span>બધી પૂજાઓ</span>
          </button>
          <button class="admin-tab-btn ${activeTab === 'add' ? 'active' : ''}" id="tabBtnAdd">
            <span>➕</span> <span>નવી પૂજા ઉમેરો</span>
          </button>
          <button class="admin-tab-btn ${activeTab === 'profile' ? 'active' : ''}" id="tabBtnProfile">
            <span>👤</span> <span>પ્રોફાઈલ વિગત</span>
          </button>
          <button class="admin-tab-btn ${activeTab === 'pin' ? 'active' : ''}" id="tabBtnPin">
            <span>🔑</span> <span>સુરક્ષા પિન</span>
          </button>
          <button class="admin-tab-btn tab-logout" id="tabBtnLogout" title="બહાર નીકળો">
            <span>🚪</span> <span>લૉગ આઉટ</span>
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
          <div class="empty-icon">🪔</div>
          <h3>હજી કોઈ પૂજા ઉમેરેલ નથી</h3>
          <p>આપ અહીંથી નવી પૂજા વિધિ અને સામગ્રી ઉમેરી શકો છો.</p>
          <button class="btn btn-primary" id="emptyAddBtn" style="margin-top: 1rem;">
            <span>➕</span> <span>પ્રથમ પૂજા ઉમેરો</span>
          </button>
        </div>
      `;
      document.getElementById('emptyAddBtn')?.addEventListener('click', () => this.renderAddEditForm(null));
      return;
    }

    container.innerHTML = `
      <div class="admin-services-top-bar">
        <div class="admin-search-wrap">
          <span class="admin-search-icon">🔍</span>
          <input type="text" id="adminServiceSearchInput" class="admin-search-input" placeholder="પૂજાનું નામ શોધો (દા.ત. સત્યનારાયણ, ગણેશ, Vastu)..." value="${this.adminSearchFilter}">
        </div>
        <button class="btn btn-primary admin-add-top-btn" id="addNewServiceTopBtn">
          <span>➕</span> <span>નવી પૂજા ઉમેરો</span>
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
        ` : services.map(item => `
          <div class="admin-service-card" data-id="${item.id}">
            <div class="admin-srv-thumb-wrap">
              <img src="${item.thumbnailUrl || 'assets/images/card-ganesh.png'}" alt="${item.title}" class="admin-srv-thumb" loading="lazy">
            </div>
            <div class="admin-srv-info">
              <div class="admin-srv-title-row">
                <h4 class="admin-srv-title">${item.title}</h4>
                <span class="admin-srv-category-pill">${item.category}</span>
              </div>
              <div class="admin-srv-subtitle">${item.subtitle || 'વિધિવત પૂજા માર્ગદર્શિકા'} • ${item.price || 'દક્ષિણા માટે સંપર્ક કરો'}</div>
              <div class="admin-srv-badge-tag">
                <span>✨</span> <span>${item.badge || 'સાત્વિક વિધાન'}</span>
                ${item.englishTitle ? `<span class="admin-srv-en-tag">En: ${item.englishTitle}</span>` : ''}
              </div>
            </div>
            <div class="admin-srv-actions">
              <button class="btn btn-outline edit-srv-btn" data-id="${item.id}" title="સુધારો (Edit)" aria-label="${item.title} સુધારો">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>સુધારો</span>
              </button>
              <button class="btn btn-call del-srv-btn" data-id="${item.id}" title="કાઢી નાખો (Delete)" aria-label="${item.title} કાઢી નાખો">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span>હટાવો</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Live search input handling
    const searchInput = document.getElementById('adminServiceSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.adminSearchFilter = e.target.value;
        this.renderServicesList();
      });
    }

    document.getElementById('clearAdminFilterBtn')?.addEventListener('click', () => {
      this.adminSearchFilter = '';
      this.renderServicesList();
    });

    document.getElementById('addNewServiceTopBtn')?.addEventListener('click', () => this.renderAddEditForm(null));

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

    const keywordsString = Array.isArray(service?.keywords) ? service.keywords.join(', ') : '';

    container.innerHTML = `
      <form id="serviceForm" class="admin-edit-form">
        <div class="admin-form-header-bar">
          <div>
            <h3 class="admin-form-title">
              ${isEdit ? '✏️ પૂજા વિધિમાં ફેરફાર કરો' : '➕ નવી પૂજા વિધિ ઉમેરો'}
            </h3>
            <p class="admin-form-subtitle">દરેક માહિતી સાચવવા પર વેબસાઈટ પર તુરંત લાઈવ થશે</p>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="fBackToListBtn">
            <span>⬅️</span> <span>યાદી પર પાછા જાઓ</span>
          </button>
        </div>

        <!-- સેક્શન ૧: મુખ્ય પૂજા વિગત (Core Details) -->
        <div class="admin-form-fieldset">
          <div class="fieldset-legend">
            <span>🏷️</span> <span>૧. મુખ્ય પૂજા વિગત (Core Information)</span>
          </div>

          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label">પૂજાનું ગુજરાતી નામ *</label>
              <input type="text" class="form-control" id="fTitle" required value="${service?.title || ''}" placeholder="ઉદાહરણ: સત્યનારાયણ કથા / ગણેશ પૂજા">
            </div>
            <div class="form-group">
              <label class="form-label">અંગ્રેજી નામ (English Title / Search Alias)</label>
              <input type="text" class="form-control" id="fEnglishTitle" value="${service?.englishTitle || ''}" placeholder="ઉદાહરણ: Satyanarayan Dev Katha / Ganesh Pooja">
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
              <input type="text" class="form-control" id="fPrice" value="${service?.price || 'દક્ષિણા માટે સંપર્ક કરો'}" placeholder="દક્ષિણા માટે સંપર્ક કરો">
            </div>
            <div class="form-group">
              <label class="form-label">વિશેષ બેજ (Badge)</label>
              <input type="text" class="form-control" id="fBadge" value="${service?.badge || 'સાત્વિક સંસ્કાર'}" placeholder="ઉદાહરણ: સર્વ મનોકામના પૂર્ણ">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">દ્વિભાષી સર્ચ કીવર્ડ્સ (Search Keywords - અલ્પવિરામથી અલગ કરો)</label>
            <input type="text" class="form-control" id="fKeywords" value="${keywordsString}" placeholder="દા.ત. satyanarayan, katha, vrat, prasad, sheera, સત્યનારાયણ">
            <div class="form-helper-text">આ કીવર્ડ્સ દ્વારા ભક્તો અંગ્રેજી અથવા ગુજરાતીમાં સર્ચ કરીને આ પૂજા સરળતાથી મેળવી શકશે.</div>
          </div>
        </div>

        <!-- સેક્શન ૨: કેમેરા સ્કેનર અને દિવ્ય કાર્ડ જનરેટર -->
        <div class="admin-form-fieldset highlight-fieldset">
          <div class="fieldset-legend">
            <span>📸</span> <span>૨. મુખ્ય ફોટો, સ્કેનર અને દિવ્ય કાર્ડ (Photo & Card Generator)</span>
          </div>

          <!-- સ્કેનર બેનર -->
          <div class="scanner-trigger-banner">
            <div class="scanner-info-group">
              <span class="scanner-camera-icon">📷</span>
              <div>
                <div class="scanner-title">કેમેરા અથવા ગેલેરીમાંથી સ્કેન કરો</div>
                <div class="scanner-desc">પેમ્ફ્લેટ અથવા સામગ્રી લિસ્ટનો ફોટો પાડી આપમેળે ફોર્મ ભરી શકાય છે.</div>
              </div>
            </div>
            <button type="button" class="btn btn-outline" id="fOpenScannerBtn">
              <span>📸</span> <span>સ્કેન શરૂ કરો</span>
            </button>
          </div>

          <!-- ફોટો અપલોડ અને પ્રીવ્યૂ -->
          <div class="form-group" style="margin-top: 1rem;">
            <label class="form-label">પૂજાનો મુખ્ય ફોટો (Thumbnail Image)</label>
            <input type="file" accept="image/*" class="form-control" id="fImageFile" style="padding: 0.5rem;">

            <div id="imagePreviewBox" class="admin-photo-preview-box" style="display: ${service?.thumbnailUrl ? 'flex' : 'none'};">
              <img id="imgPreviewThumb" src="${service?.thumbnailUrl || ''}" alt="પ્રીવ્યૂ" class="admin-photo-thumb">
              <div>
                <div id="imgPreviewStatus" class="photo-preview-status">✨ મુખ્ય ફોટો સેટ થયેલ છે</div>
                <div id="imgPreviewMeta" class="photo-preview-meta">સાચવવા પર આ ફોટો વેબસાઈટ પર દર્શાવાશે</div>
              </div>
            </div>
          </div>

          <!-- કેનવાસ કાર્ડ જનરેટર માઉન્ટ પોઈન્ટ -->
          <div id="cardGenMountPoint" style="margin-top: 1rem;"></div>
        </div>

        <!-- સેક્શન ૩: સામગ્રી યાદી (Samagri Details) -->
        <div class="admin-form-fieldset">
          <div class="fieldset-legend">
            <span>🌿</span> <span>૩. સામગ્રી યાદી અને વિધિ તૈયારી (Materials & Preparations)</span>
          </div>

          <div class="form-group">
            <label class="form-label">🌿 પૂજાપો / મુખ્ય સામગ્રી લિસ્ટ * (અલ્પવિરામથી અલગ કરો)</label>
            <textarea class="form-control" id="fPujapo" required placeholder="શ્રીફળ-૧, સોપારી-૧૫ નંગ, કંકુ, અબીલ, ગુલાલ, કપૂર, કેળના પાન, વગેરે...">${service?.pujapo || ''}</textarea>
            <div class="form-helper-text">અલ્પવિરામ (,) મૂકવાથી વેબસાઈટ પર દરેક વસ્તુ સુંદર પિલ્સ (Cards) સ્વરૂપે અલગ-અલગ દર્શાવાશે.</div>
          </div>

          <div class="form-group">
            <label class="form-label">🌾 અનાજ અને પવિત્ર નૈવેદ્ય (પ્રસાદ)</label>
            <textarea class="form-control" id="fAnaj" placeholder="ઘઉં, ચોખા સવાશેર, પંચામૃત, શિરાનો પ્રસાદ, ઋતુફળ...">${service?.anajNaivedya || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">🪔 મૂર્તિ, વાસણ અને ઘરની તૈયારી</label>
            <textarea class="form-control" id="fTaiyari" placeholder="બાજોઠ-૧, પાટલો-૧, થાળી-૫, વાટકા-૫, ચમચી-૩, તાંબાનો લોટો, આસન...">${service?.taiyari || ''}</textarea>
          </div>
        </div>

        <!-- સેક્શન ૪: શાસ્ત્રોક્ત મહત્વ અને વિશેષ નોંધ -->
        <div class="admin-form-fieldset">
          <div class="fieldset-legend">
            <span>📜</span> <span>૪. શાસ્ત્રોક્ત મહત્વ અને વિશેષ માર્ગદર્શન (Notes & Guidance)</span>
          </div>

          <div class="form-group">
            <label class="form-label">વિશેષ નોંધ / શાસ્ત્રોક્ત મહત્વ</label>
            <textarea class="form-control" id="fNotes" placeholder="આ પૂજા કરવાથી સુખ, શાંતિ, સમૃદ્ધિ અને પારિવારિક એકતા વધે છે...">${service?.notes || ''}</textarea>
          </div>
        </div>

        <!-- સબમિટ અને કેન્સલ એક્શન બાર -->
        <div class="admin-form-actions-bar">
          <button type="submit" class="btn btn-primary btn-save-action" id="fSubmitBtn">
            <span>💾</span> <span>${isEdit ? 'ફેરફાર સાચવો' : 'નવી પૂજા ઉમેરો'}</span>
          </button>
          <button type="button" class="btn btn-outline" id="fCancelBtn">
            <span>❌</span> <span>રદ કરો</span>
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
            if (previewStatus) previewStatus.textContent = '✨ દિવ્ય જનરેટ કરેલ ફોટો પસંદ થયો!';
            if (previewMeta) previewMeta.textContent = 'સાચવવા પર આ નવું કાર્ડ મુખ્ય ફોટો બનશે';
          }
          this.showToast('✨ દિવ્ય કાર્ડ મુખ્ય ફોટો તરીકે સેટ થઈ ગયું!');
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

          this.showToast('🙏 સ્કેન કરેલી બધી વિગતો આપમેળે ફોર્મમાં ભરાઈ ગઈ છે!');
        }
      });
    });

    const form = document.getElementById('serviceForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('fSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>⏳</span> <span>સાચવી રહ્યા છીએ...</span>`;
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
          submitBtn.innerHTML = `<span>💾</span> <span>ફરી પ્રયાસ કરો</span>`;
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
            <h3 class="admin-form-title">👤 શાસ્ત્રીજી પ્રોફાઈલ અને સંપર્ક વિગત</h3>
            <p class="admin-form-subtitle">વેબસાઈટના હેડર, હીરો સેક્શન અને ફૂટરમાં આ વિગતો દર્શાવાશે</p>
          </div>
        </div>

        <div class="admin-form-fieldset">
          <div class="fieldset-legend">
            <span>🪔</span> <span>મુખ્ય પરિચય (Priest Profile)</span>
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
          <button type="submit" class="btn btn-primary btn-save-action" id="pSubmitBtn">
            <span>💾</span> <span>પ્રોફાઈલ સાચવો</span>
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
        submitBtn.innerHTML = `<span>⏳</span> <span>સાચવી રહ્યા છીએ...</span>`;
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
          submitBtn.innerHTML = `<span>💾</span> <span>પ્રોફાઈલ સાચવો</span>`;
        }
      } catch (err) {
        console.error('Profile update error:', err);
        alert('પ્રોફાઈલ સાચવવામાં સમસ્યા આવી: ' + err.message);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>💾</span> <span>ફરી પ્રયાસ કરો</span>`;
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
            <h3 class="admin-form-title">🔑 સુરક્ષા પિન બદલો</h3>
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
          <button type="submit" class="btn btn-primary btn-save-action" id="pinChangeSubmitBtn">
            <span>🔐</span> <span>નવો પિન સાચવો</span>
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
        errEl.textContent = '❌ હાલનો પિન ખોટો છે!';
        return;
      }

      if (newPin.length !== 4 || isNaN(newPin)) {
        errEl.textContent = '❌ નવો પિન બરાબર ૪ અંકનો હોવો જોઈએ!';
        return;
      }

      if (newPin !== confirmPin) {
        errEl.textContent = '❌ બંને નવા પિન સરખા નથી!';
        return;
      }

      await db.updateProfile({ pin: newPin });
      this.showToast('સુરક્ષા પિન સફળતાપૂર્વક બદલાઈ ગયો છે!');
      this.renderDashboard('services');
    });
  }
}

export const adminPanel = new AdminPanel();
