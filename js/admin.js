/**
 * શાસ્ત્રીજી જીતેન્દ્ર જોષી - મોબાઈલ ફર્સ્ટ એડમિન CMS પેનલ
 * 100% શુદ્ધ ગુજરાતી ભાષામાં સંચાલન
 */

import { db } from './db.js';
import { CATEGORIES } from './data.js';

class AdminPanel {
  constructor() {
    this.isAuthenticated = false;
    this.editingServiceId = null;
    this.onDataChangeCallback = null;
  }

  init(onDataChange) {
    this.onDataChangeCallback = onDataChange;
    this.bindEvents();
  }

  bindEvents() {
    const loginTriggerBtn = document.getElementById('adminLoginTrigger');
    if (loginTriggerBtn) {
      loginTriggerBtn.addEventListener('click', () => this.openPinModal());
    }
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
      return;
    }

    // Render PIN form
    modalBody.innerHTML = `
      <div class="admin-card">
        <button class="modal-close-btn" id="adminCloseBtn" title="બંધ કરો">✕</button>
        <div class="pin-screen-box">
          <div class="pamphlet-om-badge">
            <img src="assets/icons/gemini-svg.svg" alt="ॐ">
          </div>
          <h2 style="font-size: 1.5rem; color: var(--color-maroon); margin-bottom: 0.5rem;">શાસ્ત્રીજી સુરક્ષિત લૉગિન</h2>
          <p style="color: var(--color-text-sub); font-size: 0.95rem;">કૃપા કરીને આપનો ૪-અંકનો ગુપ્ત પિન દાખલ કરો (મૂળભૂત પિન: 1234)</p>
          
          <div class="pin-input-group">
            <input type="password" maxlength="1" class="pin-digit-box" id="pinDigit1" autofocus autocomplete="off" inputmode="numeric">
            <input type="password" maxlength="1" class="pin-digit-box" id="pinDigit2" autocomplete="off" inputmode="numeric">
            <input type="password" maxlength="1" class="pin-digit-box" id="pinDigit3" autocomplete="off" inputmode="numeric">
            <input type="password" maxlength="1" class="pin-digit-box" id="pinDigit4" autocomplete="off" inputmode="numeric">
          </div>

          <div id="pinErrorMsg" style="color: var(--color-danger); font-size: 0.95rem; font-weight: 700; min-height: 24px; margin-bottom: 1rem;"></div>

          <button class="btn btn-primary" id="pinSubmitBtn" style="width: 100%; max-width: 280px;">
            પ્રવેશ કરો ➔
          </button>
        </div>
      </div>
    `;

    modalOverlay.classList.add('active');

    // Close button
    document.getElementById('adminCloseBtn').addEventListener('click', () => {
      modalOverlay.classList.remove('active');
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

    document.getElementById('pinSubmitBtn').addEventListener('click', () => {
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
      this.renderDashboard();
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
      <div class="admin-card">
        <button class="modal-close-btn" id="adminCloseBtn" title="બંધ કરો">✕</button>
        
        <div class="admin-header">
          <h2>શાસ્ત્રીજી કંટ્રોલ પેનલ (CMS)</h2>
          <p style="font-size: 0.9rem; color: var(--color-text-sub);">પૂજા સામગ્રી, પેમ્ફ્લેટ અને સંપર્ક વિગતનું સરળ સંચાલન</p>
        </div>

        <div class="admin-nav-tabs">
          <button class="admin-tab-btn ${activeTab === 'services' ? 'active' : ''}" id="tabBtnServices">📋 બધી પૂજાઓ</button>
          <button class="admin-tab-btn ${activeTab === 'add' ? 'active' : ''}" id="tabBtnAdd">➕ નવી પૂજા ઉમેરો</button>
          <button class="admin-tab-btn ${activeTab === 'profile' ? 'active' : ''}" id="tabBtnProfile">👤 પ્રોફાઈલ વિગત</button>
          <button class="admin-tab-btn ${activeTab === 'pin' ? 'active' : ''}" id="tabBtnPin">🔑 પિન બદલો</button>
          <button class="admin-tab-btn" id="tabBtnLogout" style="color: var(--color-danger); margin-left: auto;">🚪 બહાર નીકળો</button>
        </div>

        <div id="adminTabContent"></div>
      </div>
    `;

    document.getElementById('adminCloseBtn').addEventListener('click', () => {
      document.getElementById('adminModalOverlay').classList.remove('active');
    });

    document.getElementById('tabBtnServices').addEventListener('click', () => this.renderDashboard('services'));
    document.getElementById('tabBtnAdd').addEventListener('click', () => this.renderAddEditForm(null));
    document.getElementById('tabBtnProfile').addEventListener('click', () => this.renderProfileForm());
    document.getElementById('tabBtnPin').addEventListener('click', () => this.renderPinChangeForm());
    document.getElementById('tabBtnLogout').addEventListener('click', () => {
      this.isAuthenticated = false;
      document.getElementById('adminModalOverlay').classList.remove('active');
      this.showToast('આપ સફળતાપૂર્વક લૉગ આઉટ થયા છો.');
    });

    if (activeTab === 'services') {
      await this.renderServicesList();
    }
  }

  async renderServicesList() {
    const container = document.getElementById('adminTabContent');
    if (!container) return;

    const services = await db.getServices();

    if (services.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--color-text-sub);">
          <p>હજી કોઈ પૂજા ઉમેરેલ નથી.</p>
          <button class="btn btn-primary" id="emptyAddBtn" style="margin-top: 1rem;">➕ નવી પૂજા ઉમેરો</button>
        </div>
      `;
      document.getElementById('emptyAddBtn')?.addEventListener('click', () => this.renderAddEditForm(null));
      return;
    }

    let listHtml = `<div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 1.15rem; color: var(--color-maroon);">કુલ પૂજાઓ (${services.length})</h3>
      <button class="btn btn-primary btn-sm" id="addNewServiceTopBtn">➕ નવી પૂજા ઉમેરો</button>
    </div>`;

    services.forEach(item => {
      listHtml += `
        <div class="admin-service-item">
          <div>
            <div class="admin-item-title">${item.title}</div>
            <div style="font-size: 0.85rem; color: var(--color-text-sub);">
              વિભાગ: <strong>${item.category}</strong> | કિંમત: ${item.price || 'સંપર્ક કરો'}
            </div>
          </div>
          <div class="admin-item-actions">
            <button class="btn btn-outline btn-sm edit-srv-btn" data-id="${item.id}">✏️ સુધારો</button>
            <button class="btn btn-call btn-sm del-srv-btn" data-id="${item.id}">🗑️ કાઢી નાખો</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = listHtml;

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
    if (!isEdit) {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('tabBtnAdd')?.classList.add('active');
    }

    const categoriesOptions = CATEGORIES
      .filter(c => c !== "બધી વિધિઓ")
      .map(cat => `<option value="${cat}" ${service?.category === cat ? 'selected' : ''}>${cat}</option>`)
      .join('');

    container.innerHTML = `
      <form id="serviceForm" style="display: flex; flex-direction: column; gap: 1rem;">
        <h3 style="font-size: 1.25rem; color: var(--color-maroon); margin-bottom: 0.5rem;">
          ${isEdit ? '✏️ પૂજામાં ફેરફાર કરો' : '➕ નવી પૂજા ઉમેરો'}
        </h3>

        <div class="form-group">
          <label class="form-label">પૂજાનું નામ *</label>
          <input type="text" class="form-control" id="fTitle" required value="${service?.title || ''}" placeholder="ઉદાહરણ: શ્રી ગણેશ સ્થાપન પૂજા">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
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
        </div>

        <div class="form-group">
          <label class="form-label">બેજ (વિશેષતા)</label>
          <input type="text" class="form-control" id="fBadge" value="${service?.badge || 'ધાર્મિક વિધિ'}" placeholder="ઉદાહરણ: લોકપ્રિય પૂજા">
        </div>

        <div class="form-group">
          <label class="form-label">ભગવાનનો ફોટો અથવા તૈયાર પેમ્ફ્લેટ (Image Upload)</label>
          <input type="file" accept="image/*" class="form-control" id="fImageFile" style="padding: 0.4rem;">
          ${service?.thumbnailUrl ? `
            <div style="margin-top: 0.5rem; display: flex; align-items: center; gap: 0.75rem;">
              <img src="${service.thumbnailUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid var(--color-border-ornate);">
              <span style="font-size: 0.85rem; color: var(--color-text-sub);">હાલનો ફોટો સેવ થયેલ છે</span>
            </div>
          ` : ''}
        </div>

        <div class="form-group">
          <label class="form-label">પૂજાપો / મુખ્ય સામગ્રી લિસ્ટ *</label>
          <textarea class="form-control" id="fPujapo" required placeholder="શ્રીફળ, સોપારી, કંકુ, અબીલ, ગુલાલ, વગેરે...">${service?.pujapo || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">અનાજ અને નૈવેદ્ય</label>
          <textarea class="form-control" id="fAnaj" placeholder="ઘઉં, ચોખા, ફળો, પ્રસાદ, વગેરે...">${service?.anajNaivedya || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">મૂર્તિ, વાસણ અને ઘરની તૈયારી</label>
          <textarea class="form-control" id="fTaiyari" placeholder="બાજોઠ, પાટલો, થાળી, વાટકા, દીવો, આસન, વગેરે...">${service?.taiyari || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">વિશેષ નોંધ / મહત્વ</label>
          <input type="text" class="form-control" id="fNotes" value="${service?.notes || ''}" placeholder="પૂજા સંબંધિત વધારાની વિગત">
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
          <button type="submit" class="btn btn-primary" style="flex: 2;">
            💾 ${isEdit ? 'ફેરફાર સાચવો' : 'પૂજા ઉમેરો'}
          </button>
          <button type="button" class="btn btn-outline" id="fCancelBtn" style="flex: 1;">
            રદ કરો
          </button>
        </div>
      </form>
    `;

    document.getElementById('fCancelBtn').addEventListener('click', () => {
      this.renderDashboard('services');
    });

    const form = document.getElementById('serviceForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'સાચવી રહ્યા છીએ...';

      try {
        let imageUrl = service?.thumbnailUrl || 'assets/images/satyanarayan-card.jpg';
        const fileInput = document.getElementById('fImageFile');
        if (fileInput.files && fileInput.files[0]) {
          imageUrl = await db.uploadImage(fileInput.files[0]);
        }

        const data = {
          title: document.getElementById('fTitle').value.trim(),
          category: document.getElementById('fCategory').value,
          price: document.getElementById('fPrice').value.trim() || 'દક્ષિણા માટે સંપર્ક કરો',
          badge: document.getElementById('fBadge').value.trim() || 'ધાર્મિક વિધિ',
          thumbnailUrl: imageUrl,
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
        submitBtn.disabled = false;
        submitBtn.textContent = 'ફરી પ્રયાસ કરો';
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
      <form id="profileForm" style="display: flex; flex-direction: column; gap: 1rem;">
        <h3 style="font-size: 1.25rem; color: var(--color-maroon); margin-bottom: 0.5rem;">
          👤 શાસ્ત્રીજી પ્રોફાઈલ અને સંપર્ક વિગત
        </h3>

        <div class="form-group">
          <label class="form-label">શાસ્ત્રીજીનું પૂરું નામ *</label>
          <input type="text" class="form-control" id="pName" required value="${profile.name || ''}">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">મોબાઈલ નંબર *</label>
            <input type="text" class="form-control" id="pPhone" required value="${profile.phone || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">વોટ્સએપ નંબર *</label>
            <input type="text" class="form-control" id="pWhatsapp" required value="${profile.whatsapp || ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">વિશેષતા / માર્ગદર્શન વિગત</label>
          <textarea class="form-control" id="pSubtitle">${profile.subtitle || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">નવો સ્ટુડિયો ફોટો અપલોડ કરો (Profile Photo)</label>
          <input type="file" accept="image/*" class="form-control" id="pPhotoFile" style="padding: 0.4rem;">
          ${profile.avatarUrl ? `
            <div style="margin-top: 0.5rem; display: flex; align-items: center; gap: 0.75rem;">
              <img src="${profile.avatarUrl}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-maroon);">
              <span style="font-size: 0.85rem; color: var(--color-text-sub);">હાલનો ફોટો</span>
            </div>
          ` : ''}
        </div>

        <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem;">
          💾 પ્રોફાઈલ સાચવો
        </button>
      </form>
    `;

    const form = document.getElementById('profileForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'સાચવી રહ્યા છીએ...';

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
        submitBtn.disabled = false;
        submitBtn.textContent = '💾 પ્રોફાઈલ સાચવો';
      } catch (err) {
        console.error('Profile update error:', err);
        alert('પ્રોફાઈલ સાચવવામાં સમસ્યા આવી: ' + err.message);
        submitBtn.disabled = false;
      }
    });
  }

  async renderPinChangeForm() {
    const container = document.getElementById('adminTabContent');
    if (!container) return;

    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tabBtnPin')?.classList.add('active');

    container.innerHTML = `
      <form id="pinChangeForm" style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px; margin: 0 auto;">
        <h3 style="font-size: 1.25rem; color: var(--color-maroon); text-align: center;">
          🔑 સુરક્ષા પિન બદલો
        </h3>

        <div class="form-group">
          <label class="form-label">હાલનો પિન (Current PIN) *</label>
          <input type="password" maxlength="4" class="form-control" id="curPin" required placeholder="૪ અંકનો પિન">
        </div>

        <div class="form-group">
          <label class="form-label">નવો પિન (New PIN) *</label>
          <input type="password" maxlength="4" class="form-control" id="newPin" required placeholder="નવો ૪ અંકનો પિન">
        </div>

        <div class="form-group">
          <label class="form-label">નવો પિન ફરીથી દાખલ કરો *</label>
          <input type="password" maxlength="4" class="form-control" id="confirmPin" required placeholder="નવો પિન કન્ફર્મ કરો">
        </div>

        <div id="pinChangeError" style="color: var(--color-danger); font-size: 0.9rem; font-weight: 700; text-align: center;"></div>

        <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem;">
          💾 નવો પિન સાચવો
        </button>
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
