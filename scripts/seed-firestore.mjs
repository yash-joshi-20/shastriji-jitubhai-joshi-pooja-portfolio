import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../js/firebase-config.js';
import { INITIAL_PROFILE, INITIAL_SERVICES } from '../js/data.js';

console.log('Firebase Cloud Firestore સાથે કનેક્ટ થઈ રહ્યા છીએ...');
console.log('Project ID:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

async function seedData() {
  try {
    // 1. Seed Profile
    console.log('1. પ્રોફાઈલ ડેટા (settings/profile) અપલોડ કરી રહ્યા છીએ...');
    await setDoc(doc(firestore, 'settings', 'profile'), INITIAL_PROFILE);
    console.log('✅ પ્રોફાઈલ સફળતાપૂર્વક Firestore માં અપલોડ થઈ ગઈ!');

    // 2. Seed Services
    console.log('2. પૂજા સેવાઓ (services) અપલોડ કરી રહ્યા છીએ...');
    for (const service of INITIAL_SERVICES) {
      await setDoc(doc(firestore, 'services', service.id), service);
      console.log(`✅ પૂજા ઉમેરાઈ: ${service.title} (ID: ${service.id})`);
    }

    console.log('\n🎉 તમામ ડેટા સફળતાપૂર્વક Firebase Cloud Firestore માં સેવ થઈ ગયો છે!');
    console.log('હવે Firebase Console માં જઈને પેજ Refresh કરો, "services" અને "settings" કલેક્શન દેખાશે.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Firestore માં ડેટા લખવામાં ભૂલ આવી:', error.code || error.message);
    if (error.code === 'permission-denied') {
      console.error('\n⚠️ સૂચના: Firestore Security Rules માં write પરમિશન બંધ છે.');
      console.error('Firebase Console > Cloud Firestore > Rules ટેબમાં જઈને આ રૂલ્સ પેસ્ટ કરો:');
      console.error(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
      `);
    }
    process.exit(1);
  }
}

seedData();
