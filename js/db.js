/**
 * શાસ્ત્રીજી જીતેન્દ્ર જોષી - ડાયનેમિક ડેટા મેનેજર (100% Firebase મુક્ત)
 * સોફ્ટ-કોડેડ JSON API + LocalStorage ફોલબેક સાથે સંપૂર્ણ ડાયનેમિક CRUD
 */

const STORAGE_KEYS = {
  PROFILE: 'shastriji_profile_v2',
  SERVICES: 'shastriji_services_v2'
};

// ૮ પવિત્ર દેવો અને પૂજા વિધિઓની હાઈ-રિઝોલ્યુશન ફોટો ગેલેરી
export const DEITY_GALLERY = [
  { id: 'ganesh', name: 'શ્રી ગણેશજી', icon: '🕉️', url: 'assets/images/card-ganesh.png', keywords: ['ગણેશ', 'ગણપતિ', 'વિનાયક', 'ganesh', 'ganpati'] },
  { id: 'lakshmi', name: 'મા લક્ષ્મીજી', icon: '🌸', url: 'assets/images/card-lakshmi.png', keywords: ['લક્ષ્મી', 'મહાલક્ષ્મી', 'ધનતેરસ', 'દિવાળી', 'ધન', 'lakshmi', 'laxmi'] },
  { id: 'navgrah', name: 'સૂર્યદેવ & નવગ્રહ', icon: '☀️', url: 'assets/images/card-navgrah.png', keywords: ['નવગ્રહ', 'ગ્રહ', 'સૂર્ય', 'શનિ', 'રાહુ', 'navgrah', 'surya'] },
  { id: 'satyanarayan', name: 'શ્રી સત્યનારાયણ દેવ', icon: '🪷', url: 'assets/images/card-satyanarayan.png', keywords: ['સત્યનારાયણ', 'વિષ્ણુ', 'નારાયણ', 'કથા', 'satyanarayan'] },
  { id: 'gruhpravesh', name: 'ગૃહપ્રવેશ વાસ્તુ કળશ', icon: '🛕', url: 'assets/images/card-gruhpravesh.png', keywords: ['વાસ્તુ', 'ગૃહપ્રવેશ', 'ઘર', 'મકાન', 'vastu', 'gruh'] },
  { id: 'havan', name: 'પવિત્ર હવન & યજ્ઞ', icon: '🔥', url: 'assets/images/card-havan.png', keywords: ['હવન', 'યજ્ઞ', 'હોમ', 'ગાયત્રી', 'havan', 'yajna'] },
  { id: 'vivah', name: 'વિવાહ સંસ્કાર હસ્તમેળાપ', icon: '💍', url: 'assets/images/card-vivah.png', keywords: ['વિવાહ', 'લગ્ન', 'સપ્તપદી', 'હસ્તમેળાપ', 'vivah', 'wedding'] },
  { id: 'anyapooja', name: 'પવિત્ર દીપ & પૂજા આયોજન', icon: '🪔', url: 'assets/images/card-anyapooja.png', keywords: ['અન્ય', 'રુદ્ર', 'શિવ', 'મહાદેવ', 'કાળસર્પ', 'શ્રાધ્ધ', 'shiva'] }
];

/**
 * પૂજાના નામ અને શ્રેણી મુજબ આપમેળે યોગ્ય પવિત્ર દેવ ફોટો મેળવો
 */
export function resolveDeityImage(title = '', category = '') {
  const query = (title + ' ' + category).toLowerCase();
  for (const deity of DEITY_GALLERY) {
    if (deity.keywords.some(k => query.includes(k.toLowerCase()))) {
      return deity.url;
    }
  }
  return 'assets/images/card-anyapooja.png';
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
    this.setupRealtimeListeners();
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
            this.notifyServicesSubscribers(this.cachedServices);
          } else {
            this.getServices(true).then(services => this.notifyServicesSubscribers(services));
          }
        } else if (type === 'PROFILE_UPDATED') {
          if (event.data.profile) {
            this.cachedProfile = event.data.profile;
            this.notifyProfileSubscribers(this.cachedProfile);
          } else {
            this.getProfile(true).then(profile => this.notifyProfileSubscribers(profile));
          }
        }
      };
    }

    // ૨. લોકલ સ્ટોરેજ ઇવેન્ટ લિસનર
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

  async init() {
    try {
      // First try to load from soft-coded server API or JSON
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
  async getProfile() {
    // 1. Check Server API
    try {
      const res = await fetch('/api/profile');
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

    // 2. Check LocalStorage
    const local = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (local) {
      try {
        this.cachedProfile = JSON.parse(local);
        return this.cachedProfile;
      } catch (e) {}
    }

    // 3. Check data/profile.json file directly
    try {
      const res = await fetch('data/profile.json');
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
      const res = await fetch('/api/profile', {
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
    // 1. Check Server API with cache busting
    try {
      const res = await fetch(`/api/services?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.cachedServices = data;
          localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data));
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
          localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data));
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
      // જો શીર્ષકમાં ગણેશ ન હોય અને ઓટો ઇમેજ મળતી હોય તો ઓટો ઇમેજ વાપરો
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

    // Update local cache
    const current = await this.getServices();
    current.unshift(newService);
    this.cachedServices = current;
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(current));
    this.notifyServicesSubscribers(current);

    // Broadcast immediately to index.html and all open tabs
    if (syncChannel) {
      try { syncChannel.postMessage({ type: 'SERVICES_UPDATED', services: current }); } catch (e) {}
    }

    // Save to Server JSON
    try {
      const res = await fetch('/api/services', {
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
    current[index] = updated;
    this.cachedServices = current;
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(current));
    this.notifyServicesSubscribers(current);

    // Broadcast immediately to index.html and all open tabs
    if (syncChannel) {
      try { syncChannel.postMessage({ type: 'SERVICES_UPDATED', services: current }); } catch (e) {}
    }

    // Save to Server JSON
    try {
      const res = await fetch(`/api/services/${encodeURIComponent(id)}`, {
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
    current = current.filter(s => s.id !== id);
    this.cachedServices = current;
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(current));
    this.notifyServicesSubscribers(current);

    // Broadcast immediately to index.html and all open tabs
    if (syncChannel) {
      try { syncChannel.postMessage({ type: 'SERVICES_UPDATED', services: current }); } catch (e) {}
    }

    // Delete on Server JSON
    try {
      await fetch(`/api/services/${encodeURIComponent(id)}`, {
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
          const res = await fetch('/api/upload', {
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
          const res = await fetch('/api/upload', {
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
