/**
 * શાસ્ત્રીજી જીતેન્દ્ર જોષી - ડાયનેમિક ડેટા મેનેજર (100% Firebase મુક્ત)
 * સોફ્ટ-કોડેડ JSON API + LocalStorage ફોલબેક સાથે સંપૂર્ણ ડાયનેમિક CRUD
 */

const STORAGE_KEYS = {
  PROFILE: 'shastriji_profile_v2',
  SERVICES: 'shastriji_services_v2'
};

class DatabaseManager {
  constructor() {
    this.servicesSubscribers = [];
    this.profileSubscribers = [];
    this.cachedServices = null;
    this.cachedProfile = null;
    this.initialized = false;
    this.init();
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
  async getServices() {
    // 1. Check Server API
    try {
      const res = await fetch('/api/services');
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

    // 2. Check LocalStorage
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

    // 3. Check data/services.json file directly
    try {
      const res = await fetch('data/services.json');
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
    const newService = {
      ...serviceData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    // Update local cache
    const current = await this.getServices();
    current.unshift(newService);
    this.cachedServices = current;
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(current));
    this.notifyServicesSubscribers(current);

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

    const updated = {
      ...current[index],
      ...updatedData,
      id,
      updatedAt: new Date().toISOString()
    };
    current[index] = updated;
    this.cachedServices = current;
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(current));
    this.notifyServicesSubscribers(current);

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

  // UPLOAD IMAGE (ઈમેજ અપલોડ)
  async uploadImage(file) {
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
              filename: file.name
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
