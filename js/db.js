/**
 * શાસ્ત્રીજી જીતેન્દ્ર જોષી - ડાયનેમિક ડેટા મેનેજર (100% Firebase મુક્ત)
 * સોફ્ટ-કોડેડ JSON API + LocalStorage ફોલબેક સાથે સંપૂર્ણ ડાયનેમિક CRUD
 * લાઈવ સર્વર / પોર્ટ ૫૫૦૦ / રીઅલ-ટાઇમ સિંક સાથે સંપૂર્ણ સુસંગત
 */

const STORAGE_KEYS = {
  PROFILE: 'shastriji_profile_v2',
  SERVICES: 'shastriji_services_v2',
  LAST_SYNC: 'shastriji_services_last_sync'
};

import { DEITY_REGISTRY, detectDeity, generateDeityImageFromTitle, renderSacredCanvasCard } from './deity-engine.js';

// ૧૫ પવિત્ર દેવો અને પૂજા વિધિઓની હાઈ-રિઝોલ્યુશન ફોટો ગેલેરી (Full Registry)
export const DEITY_GALLERY = DEITY_REGISTRY;

export { detectDeity, generateDeityImageFromTitle, renderSacredCanvasCard };

/**
 * પૂજાના નામ અને શ્રેણી મુજબ આપમેળે યોગ્ય પવિત્ર દેવ ફોટો મેળવો
 */
export function resolveDeityImage(title = '', category = '') {
  const match = detectDeity(title, category);
  return match?.url || 'assets/images/card-anyapooja.png';
}

/**
 * સ્માર્ટ બેકએન્ડ API બેઝ URL નિર્ધારિત કરો
 * જ્યારે યુઝર VS Code Live Server (port 5500) અથવા ફાઈલમાંથી વેબસાઈટ ખોલે ત્યારે
 * સીધા Node.js બેકએન્ડ (port 3000) સાથે કનેક્ટ થાય છે.
 */
export function getApiBaseUrl() {
  if (typeof window === 'undefined') return '';
  const port = window.location.port;
  const proto = window.location.protocol;
  const host = window.location.hostname || 'localhost';

  // જો પહેલેથી જ પોર્ટ ૩૦૦૦ પર ચાલતું હોય તો સંબંધિત URL વાપરો
  if (port === '3000') return '';

  // જો લોકલ સ્ટેટિક ડેવ સર્વર (Live Server 5500, Vite 5173, વગેરે) અથવા file: પ્રોટોકોલ હોય
  if (['5500', '5501', '5502', '5173', '8080', '5000', '3001'].includes(port) || proto === 'file:') {
    const targetHost = (host === '127.0.0.1' || host === 'localhost') ? 'localhost' : host;
    return `http://${targetHost}:3000`;
  }

  // પ્રોડક્શન હોસ્ટિંગ (Render, Vercel વગેરે જ્યાં ડિફોલ્ટ 80/443 હોય)
  return '';
}

/**
 * સર્વર API કોલ માટે સુરક્ષિત ફંક્શન (ઓટોમેટિક ફોલબેક અને ક્રોસ-ઓરિજિન હેન્ડલિંગ)
 */
export async function apiFetch(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const primaryUrl = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
  try {
    const res = await fetch(primaryUrl, options);
    if (res.ok) return res;

    // જો પ્રાથમિક કોલ નિષ્ફળ ગયો અને બેઝ URL ખાલી હતું, પરંતુ પોર્ટ ૩૦૦૦ નથી, તો http://localhost:3000 ટ્રાય કરો
    if (!baseUrl && typeof window !== 'undefined' && window.location.port !== '3000') {
      try {
        const fallbackRes = await fetch(`http://localhost:3000${endpoint}`, options);
        if (fallbackRes.ok) return fallbackRes;
      } catch (e) {}
    }
    return res;
  } catch (err) {
    if (!baseUrl && typeof window !== 'undefined' && window.location.port !== '3000') {
      try {
        const fallbackRes = await fetch(`http://localhost:3000${endpoint}`, options);
        if (fallbackRes.ok) return fallbackRes;
      } catch (e2) {}
    }
    throw err;
  }
}

// બ્રોડકાસ્ટ ચેનલ (સમાન બ્રાઉઝરમાં બધા ટેબ્સ વચ્ચે રીઅલ-ટાઇમ લાઈવ સિંક)
const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('shastriji_pooja_sync') : null;

class DatabaseManager {
  constructor() {
    this.servicesSubscribers = [];
    this.profileSubscribers = [];
    this.cachedServices = null;
    this.cachedProfile = null;
    this.initialized = false;
    this.lastServicesHash = '';
    this.pollingTimer = null;
    this.setupRealtimeListeners();
    this.startHeartbeatPolling();
    this.init();
  }

  setupRealtimeListeners() {
    // ૧. બ્રોડકાસ્ટ ચેનલ લિસનર (જ્યારે એડમિનમાં સેવ થાય, ત્યારે ઇન્ડેક્સ ટેબ આપમેળે અપડેટ થાય)
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        const type = (event.data?.type || '').toUpperCase();
        if (type === 'SERVICES_UPDATED') {
          if (Array.isArray(event.data.services)) {
            this.cachedServices = event.data.services;
            try {
              localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(this.cachedServices));
              localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
            } catch (e) {}
            this.notifyServicesSubscribers(this.cachedServices);
          } else {
            this.getServices(true).then(services => this.notifyServicesSubscribers(services));
          }
        } else if (type === 'PROFILE_UPDATED') {
          if (event.data.profile) {
            this.cachedProfile = event.data.profile;
            try {
              localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.cachedProfile));
            } catch (e) {}
            this.notifyProfileSubscribers(this.cachedProfile);
          } else {
            this.getProfile(true).then(profile => this.notifyProfileSubscribers(profile));
          }
        }
      };
    }

    // ૨. લોકલ સ્ટોરેજ ઇવેન્ટ લિસનર (સેમ-ઓરિજિન ટેબ્સ વચ્ચે સિંક)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.SERVICES && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) {
              this.cachedServices = parsed;
              this.notifyServicesSubscribers(parsed);
            }
          } catch (err) {}
        } else if (e.key === STORAGE_KEYS.PROFILE && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.cachedProfile = parsed;
            this.notifyProfileSubscribers(parsed);
          } catch (err) {}
        } else if (e.key === STORAGE_KEYS.LAST_SYNC) {
          // જ્યારે અન્ય ટેબમાં છેલ્લો સિંક ટાઈમ બદલાય ત્યારે તાજો ડેટા ખેંચો
          this.getServices(true).then(services => this.notifyServicesSubscribers(services));
        }
      });

      // ૩. જ્યારે યુઝર ઇન્ડેક્સ પેજ ટેબ પર પાછો આવે ત્યારે આપમેળે તાજો ડેટા ખેંચો
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.getServices(true).then(services => this.notifyServicesSubscribers(services));
          this.getProfile(true).then(profile => this.notifyProfileSubscribers(profile));
        }
      });

      window.addEventListener('focus', () => {
        this.getServices(true).then(services => this.notifyServicesSubscribers(services));
      });
    }
  }

  /**
   * એક્ટિવ હાર્ટબીટ પોલિંગ (દર ૨.૫ સેકન્ડે સર્વર ચેક કરે છે જેથી બે અલગ વિન્ડો કે
   * અલગ પોર્ટ (૫૫૦૦ અને ૩૦૦૦) પર પણ ઇન્ડેક્સ પેજ ઓટોમેટિક અપડેટ થાય)
   */
  startHeartbeatPolling() {
    if (typeof window === 'undefined') return;
    if (this.pollingTimer) clearInterval(this.pollingTimer);

    this.pollingTimer = setInterval(async () => {
      try {
        const res = await apiFetch(`/api/status?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const status = await res.json();
          const currentHash = status.servicesHash || `${status.servicesCount}`;
          if (this.lastServicesHash && this.lastServicesHash !== currentHash) {
            this.lastServicesHash = currentHash;
            const freshServices = await this.getServices(true);
            this.notifyServicesSubscribers(freshServices);
          } else if (!this.lastServicesHash) {
            this.lastServicesHash = currentHash;
          }
        }
      } catch (e) {
        // સર્વર કનેક્શન તપાસ ચૂકી જાય તો સાયલન્ટ ફોલબેક
      }
    }, 2500);
  }

  async init() {
    try {
      await Promise.allSettled([this.getServices(), this.getProfile()]);
    } catch (e) {
      console.warn('ડેટાબેઝ પ્રારંભિક લોડિંગ સૂચના:', e);
    }
    this.initialized = true;
  }

  // ---- રીઅલ-ટાઇમ સબસ્ક્રિપ્શન્સ (UI રીએક્ટિવિટી) ----
  subscribeServices(callback) {
    this.servicesSubscribers.push(callback);
    this.getServices().then(data => {
      if (typeof callback === 'function') callback(data);
    });
  }

  subscribeProfile(callback) {
    this.profileSubscribers.push(callback);
    this.getProfile().then(data => {
      if (typeof callback === 'function') callback(data);
    });
  }

  notifyServicesSubscribers(services) {
    this.servicesSubscribers.forEach(cb => {
      try { cb(services); } catch (e) { console.error('સબસ્ક્રાઇબર એરર:', e); }
    });
  }

  notifyProfileSubscribers(profile) {
    this.profileSubscribers.forEach(cb => {
      try { cb(profile); } catch (e) { console.error('સબસ્ક્રાઇબર એરર:', e); }
    });
  }

  // ---- પ્રોફાઈલ મેનેજમેન્ટ (PROFILE CRUD) ----
  async getProfile(forceFresh = false) {
    // 1. Check Server API
    try {
      const res = await apiFetch(`/api/profile?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          this.cachedProfile = data;
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      // Server API unreachable, proceed to fallback
    }

    // 2. Check LocalStorage if not forced fresh
    if (!forceFresh) {
      const local = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (local) {
        try {
          this.cachedProfile = JSON.parse(local);
          return this.cachedProfile;
        } catch (e) {}
      }
    }

    // 3. Check data/profile.json file directly
    try {
      const res = await fetch(`data/profile.json?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        this.cachedProfile = data;
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));
        return data;
      }
    } catch (e) {}

    // Default safe fallback
    const fallbackProfile = {
      name: "શાસ્ત્રીજી જીતેન્દ્ર જોષી (જીતુભાઈ જોષી)",
      phone: "99252 64929",
      whatsapp: "9925264929",
      subtitle: "કર્મકાંડ • ધાર્મિક • સામાજિક • વ્રત વિધાન સંબંધિત આવશ્યક માર્ગદર્શન",
      avatarUrl: "assets/images/shastriji-profile.jpg",
      visitingCardUrl: "assets/images/shastriji-visiting-card.jpg",
      pin: "1234"
    };
    this.cachedProfile = fallbackProfile;
    return fallbackProfile;
  }

  async updateProfile(updatedData) {
    const current = await this.getProfile();
    const merged = { ...current, ...updatedData };
    this.cachedProfile = merged;

    // Save to LocalStorage immediately
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(merged));
    this.notifyProfileSubscribers(merged);

    // Broadcast live to all open tabs / windows
    if (syncChannel) {
      try { syncChannel.postMessage({ type: 'PROFILE_UPDATED', profile: merged }); } catch (e) {}
    }

    // Save to Server JSON via API
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
      if (res.ok) {
        const serverData = await res.json();
        this.cachedProfile = serverData;
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(serverData));
        return serverData;
      }
    } catch (err) {
      console.warn('સર્વર સેવ એરર (સ્થાનિક સેવ સફળ):', err);
    }
    return merged;
  }

  // ---- પૂજા સેવાઓ મેનેજમેન્ટ (SERVICES CRUD) ----
  async getServices(forceFresh = false) {
    // 1. Check Server API with cache busting (Always primary source of truth)
    try {
      const res = await apiFetch(`/api/services?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.cachedServices = data;
          this.lastServicesHash = `${data.length}_${data.map(s => s.id).join(',').slice(0, 50)}`;
          try {
            localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data));
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
          } catch (e) {}
          return data;
        }
      }
    } catch (err) {
      // Server API unreachable, proceed to fallback
    }

    // 2. Check LocalStorage if not forced fresh
    if (!forceFresh) {
      const local = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cachedServices = parsed;
            return parsed;
          }
        } catch (e) {}
      }
    }

    // 3. Check data/services.json file directly with cache busting
    try {
      const res = await fetch(`data/services.json?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.cachedServices = data;
          try {
            localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data));
          } catch (e) {}
          return data;
        }
      }
    } catch (e) {}

    return this.cachedServices || [];
  }

  async getServiceById(id) {
    const list = await this.getServices();
    return list.find(s => s.id === id) || null;
  }

  // ADD POOJA (નવી પૂજા ઉમેરો)
  async addService(serviceData) {
    const newId = serviceData.id || `service_${Date.now()}`;
    
    // પવિત્ર દેવ ફોટો નિર્ધારિત કરો: જો ફોટો ન આપેલો હોય અથવા સામાન્ય ગણપતિ ફોટો હોય, તો પૂજાના નામ મુજબ આપમેળે યોગ્ય દેવ ફોટો સેટ કરો
    let resolvedImage = serviceData.thumbnailUrl;
    if (!resolvedImage || resolvedImage === 'assets/images/card-ganesh.png') {
      const autoImage = resolveDeityImage(serviceData.title, serviceData.category);
      const isGanesh = (serviceData.title || '').toLowerCase().includes('ગણેશ') || (serviceData.title || '').toLowerCase().includes('ગણપતિ');
      if (!isGanesh && autoImage) {
        resolvedImage = autoImage;
      } else if (!resolvedImage) {
        resolvedImage = autoImage;
      }
    }

    const newService = {
      ...serviceData,
      id: newId,
      thumbnailUrl: resolvedImage,
      createdAt: new Date().toISOString()
    };

    // Update local cache immediately
    const current = await this.getServices();
    // Prepend new service at index 0 so it immediately appears first
    const updatedList = [newService, ...current.filter(s => s.id !== newId)];
    this.cachedServices = updatedList;
    this.lastServicesHash = `${updatedList.length}_${updatedList.map(s => s.id).join(',').slice(0, 50)}`;

    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(updatedList));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (e) {}

    // Notify all UI subscribers in this window/tab immediately
    this.notifyServicesSubscribers(updatedList);

    // Broadcast immediately to index.html and all open tabs
    if (syncChannel) {
      try {
        syncChannel.postMessage({
          type: 'SERVICES_UPDATED',
          services: updatedList,
          timestamp: Date.now()
        });
      } catch (e) {}
    }

    // Save to Server JSON via API
    try {
      const res = await apiFetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      if (res.ok) {
        const saved = await res.json();
        return saved;
      }
    } catch (err) {
      console.warn('સર્વર સેવ એરર (સ્થાનિક સેવ સફળ):', err);
    }
    return newService;
  }

  // UPDATE POOJA (પૂજા સુધારો)
  async updateService(id, updatedData) {
    const current = await this.getServices();
    const index = current.findIndex(s => s.id === id);
    if (index === -1) throw new Error('પૂજા મળી નથી');

    let resolvedImage = updatedData.thumbnailUrl || current[index].thumbnailUrl;
    if (!resolvedImage || resolvedImage === 'assets/images/card-ganesh.png') {
      const autoImage = resolveDeityImage(updatedData.title || current[index].title, updatedData.category || current[index].category);
      const isGanesh = (updatedData.title || current[index].title || '').toLowerCase().includes('ગણેશ');
      if (!isGanesh && autoImage) {
        resolvedImage = autoImage;
      }
    }

    const updated = {
      ...current[index],
      ...updatedData,
      thumbnailUrl: resolvedImage,
      id,
      updatedAt: new Date().toISOString()
    };

    const updatedList = [...current];
    updatedList[index] = updated;
    this.cachedServices = updatedList;
    this.lastServicesHash = `${updatedList.length}_${updatedList.map(s => s.id).join(',').slice(0, 50)}`;

    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(updatedList));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (e) {}

    // Notify all UI subscribers in this window/tab immediately
    this.notifyServicesSubscribers(updatedList);

    // Broadcast immediately to index.html and all open tabs
    if (syncChannel) {
      try {
        syncChannel.postMessage({
          type: 'SERVICES_UPDATED',
          services: updatedList,
          timestamp: Date.now()
        });
      } catch (e) {}
    }

    // Save to Server JSON via API
    try {
      const res = await apiFetch(`/api/services/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const saved = await res.json();
        return saved;
      }
    } catch (err) {
      console.warn('સર્વર સેવ એરર (સ્થાનિક સેવ સફળ):', err);
    }
    return updated;
  }

  // DELETE POOJA (પૂજા કાઢી નાખો)
  async deleteService(id) {
    let current = await this.getServices();
    const updatedList = current.filter(s => s.id !== id);
    this.cachedServices = updatedList;
    this.lastServicesHash = `${updatedList.length}_${updatedList.map(s => s.id).join(',').slice(0, 50)}`;

    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(updatedList));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (e) {}

    // Notify all UI subscribers in this window/tab immediately
    this.notifyServicesSubscribers(updatedList);

    // Broadcast immediately to index.html and all open tabs
    if (syncChannel) {
      try {
        syncChannel.postMessage({
          type: 'SERVICES_UPDATED',
          services: updatedList,
          timestamp: Date.now()
        });
      } catch (e) {}
    }

    // Delete on Server JSON via API
    try {
      await apiFetch(`/api/services/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('સર્વર ડિલીટ એરર:', err);
    }
    return true;
  }

  // UPLOAD IMAGE (ઈમેજ અપલોડ - File, Blob અથવા Base64 DataURL)
  async uploadImage(file, customFilename = null) {
    // 1. If already a string (DataURL or existing URL)
    if (typeof file === 'string') {
      if (file.startsWith('data:image')) {
        try {
          const res = await apiFetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: file,
              filename: customFilename || `pooja_${Date.now()}.jpg`
            })
          });
          if (res.ok) {
            const result = await res.json();
            if (result.url) return result.url;
          }
        } catch (err) {
          console.warn('ડેટાયુઆરએલ સર્વર અપલોડ એરર:', err);
        }
      }
      return file;
    }

    // 2. If File or Blob
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;

        // Try server upload endpoint
        try {
          const res = await apiFetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64Data,
              filename: file.name || customFilename || `upload_${Date.now()}.jpg`
            })
          });
          if (res.ok) {
            const result = await res.json();
            if (result.url) return resolve(result.url);
          }
        } catch (err) {
          // If server upload fails, fallback to base64 DataURL
        }
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const db = new DatabaseManager();
