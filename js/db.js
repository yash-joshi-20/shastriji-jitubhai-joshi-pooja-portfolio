/**
 * Dynamic Dual-Mode Data Layer (Firebase Firestore/Storage + Real-time Sync)
 * Real-time listeners for live cloud data from Firestore.
 */

import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';
import { INITIAL_PROFILE, INITIAL_SERVICES } from './data.js';

const STORAGE_KEYS = {
  PROFILE: 'shastriji_profile_v1',
  SERVICES: 'shastriji_services_v1'
};

class DatabaseManager {
  constructor() {
    this.useFirebase = isFirebaseConfigured;
    this.firestore = null;
    this.storage = null;
    this.analytics = null;
    this.initialized = false;
    this.servicesSubscribers = [];
    this.profileSubscribers = [];
    this.cachedServices = null;
    this.cachedProfile = null;
    this.init();
  }

  async init() {
    if (this.useFirebase) {
      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
        const { getFirestore, collection, doc, onSnapshot, getDocs, setDoc, query } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const { getStorage } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');

        const app = initializeApp(firebaseConfig);
        this.firestore = getFirestore(app);
        this.storage = getStorage(app);

        // Optional Firebase Analytics
        if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
          try {
            const { getAnalytics, isSupported } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js');
            if (await isSupported()) {
              this.analytics = getAnalytics(app);
              console.log('Firebase Analytics સક્રિય છે!');
            }
          } catch (analyticsErr) {
            // Analytics optional
          }
        }

        console.log('Firebase Cloud Firestore & Storage સક્રિય છે!');

        // Check if Firestore is empty and auto-seed initial data to cloud
        this.autoSeedFirestore();

        // Attach Real-time listener for Services
        const servicesQuery = query(collection(this.firestore, 'services'));
        onSnapshot(servicesQuery, (snapshot) => {
          if (!snapshot.empty) {
            const list = [];
            snapshot.forEach(docSnap => {
              list.push({ id: docSnap.id, ...docSnap.data() });
            });
            this.cachedServices = list;
            localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
            this.notifyServicesSubscribers(list);
          }
        }, (err) => {
          console.warn('Real-time Firestore listener error, using local fallback:', err);
        });

        // Attach Real-time listener for Profile
        const profileDocRef = doc(this.firestore, 'settings', 'profile');
        onSnapshot(profileDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const profileData = { ...INITIAL_PROFILE, ...docSnap.data() };
            this.cachedProfile = profileData;
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
            this.notifyProfileSubscribers(profileData);
          }
        }, (err) => {
          console.warn('Profile listener error, using local fallback:', err);
        });

      } catch (err) {
        console.warn('Firebase કનેક્ટ ન થયું. LocalStorage મોડમાં સ્વિચ કરીએ છીએ:', err);
        this.useFirebase = false;
      }
    }

    // Ensure LocalStorage has initial seed data
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    }
    this.initialized = true;
  }

  async autoSeedFirestore() {
    if (!this.useFirebase || !this.firestore) return;
    try {
      const { collection, getDocs, doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      
      // Check services
      const srvSnap = await getDocs(collection(this.firestore, 'services'));
      if (srvSnap.empty) {
        console.log('Cloud Firestore માં સેવાઓ સીડ કરી રહ્યા છીએ...');
        for (const s of INITIAL_SERVICES) {
          await setDoc(doc(this.firestore, 'services', s.id), s);
        }
      }

      // Check profile
      const profSnap = await getDoc(doc(this.firestore, 'settings', 'profile'));
      if (!profSnap.exists()) {
        console.log('Cloud Firestore માં પ્રોફાઈલ સીડ કરી રહ્યા છીએ...');
        await setDoc(doc(this.firestore, 'settings', 'profile'), INITIAL_PROFILE);
      }
    } catch (e) {
      console.warn('Auto-seed check notice:', e);
    }
  }

  // ---- REAL-TIME SUBSCRIPTIONS ----
  subscribeServices(callback) {
    this.servicesSubscribers.push(callback);
    // Immediately emit current data
    this.getServices().then(data => callback(data));
  }

  subscribeProfile(callback) {
    this.profileSubscribers.push(callback);
    // Immediately emit current data
    this.getProfile().then(data => callback(data));
  }

  notifyServicesSubscribers(services) {
    this.servicesSubscribers.forEach(cb => {
      try { cb(services); } catch (e) { console.error(e); }
    });
  }

  notifyProfileSubscribers(profile) {
    this.profileSubscribers.forEach(cb => {
      try { cb(profile); } catch (e) { console.error(e); }
    });
  }

  // ---- PROFILE METHODS ----
  async getProfile() {
    if (this.cachedProfile) return this.cachedProfile;

    if (this.useFirebase && this.firestore) {
      try {
        const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const snap = await getDoc(doc(this.firestore, 'settings', 'profile'));
        if (snap.exists()) {
          this.cachedProfile = { ...INITIAL_PROFILE, ...snap.data() };
          return this.cachedProfile;
        } else {
          await setDoc(doc(this.firestore, 'settings', 'profile'), INITIAL_PROFILE);
          this.cachedProfile = INITIAL_PROFILE;
          return INITIAL_PROFILE;
        }
      } catch (e) {
        console.error('Firebase profile fetch error:', e);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.PROFILE);
    this.cachedProfile = local ? JSON.parse(local) : INITIAL_PROFILE;
    return this.cachedProfile;
  }

  async updateProfile(updatedData) {
    const current = await this.getProfile();
    const merged = { ...current, ...updatedData };
    this.cachedProfile = merged;

    // Save to LocalStorage
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(merged));
    this.notifyProfileSubscribers(merged);

    // Save to Firestore
    if (this.useFirebase && this.firestore) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        await setDoc(doc(this.firestore, 'settings', 'profile'), merged, { merge: true });
      } catch (e) {
        console.error('Firebase profile update error:', e);
      }
    }
    return merged;
  }

  // ---- SERVICES CRUD ----
  async getServices() {
    if (this.cachedServices && this.cachedServices.length > 0) {
      return this.cachedServices;
    }

    if (this.useFirebase && this.firestore) {
      try {
        const { collection, getDocs, query } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const q = query(collection(this.firestore, 'services'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const list = [];
          querySnapshot.forEach(docSnap => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
          this.cachedServices = list;
          return list;
        }
      } catch (e) {
        console.warn('Firebase services fetch error, using local data:', e);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.SERVICES);
    this.cachedServices = local ? JSON.parse(local) : INITIAL_SERVICES;
    return this.cachedServices;
  }

  async getServiceById(id) {
    const services = await this.getServices();
    return services.find(s => s.id === id) || null;
  }

  async addService(serviceData) {
    const services = await this.getServices();
    const newId = 'service_' + Date.now();
    const newService = {
      id: newId,
      ...serviceData,
      createdAt: new Date().toISOString()
    };

    services.unshift(newService);
    this.cachedServices = services;
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    this.notifyServicesSubscribers(services);

    if (this.useFirebase && this.firestore) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        await setDoc(doc(this.firestore, 'services', newId), newService);
      } catch (e) {
        console.error('Firebase addService error:', e);
      }
    }
    return newService;
  }

  async updateService(id, updatedData) {
    const services = await this.getServices();
    const index = services.findIndex(s => s.id === id);
    if (index === -1) throw new Error('પૂજા મળી નથી');

    const updated = { ...services[index], ...updatedData, updatedAt: new Date().toISOString() };
    services[index] = updated;
    this.cachedServices = services;
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    this.notifyServicesSubscribers(services);

    if (this.useFirebase && this.firestore) {
      try {
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        await updateDoc(doc(this.firestore, 'services', id), updated);
      } catch (e) {
        console.error('Firebase updateService error:', e);
      }
    }
    return updated;
  }

  async deleteService(id) {
    let services = await this.getServices();
    services = services.filter(s => s.id !== id);
    this.cachedServices = services;
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    this.notifyServicesSubscribers(services);

    if (this.useFirebase && this.firestore) {
      try {
        const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        await deleteDoc(doc(this.firestore, 'services', id));
      } catch (e) {
        console.error('Firebase deleteService error:', e);
      }
    }
    return true;
  }

  // Upload image to Firebase Storage or compress to base64 DataURL
  async uploadImage(file) {
    if (this.useFirebase && this.storage) {
      try {
        const { ref, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
        const filename = `uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(this.storage, filename);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch (e) {
        console.warn('Firebase Storage upload failed, falling back to Base64:', e);
      }
    }

    // Fallback: convert file to compressed Base64 DataURL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    this.cachedProfile = INITIAL_PROFILE;
    this.cachedServices = INITIAL_SERVICES;
    return true;
  }
}

export const db = new DatabaseManager();
