/**
 * Firebase Config v10 Modular SDK
 * જો તમારી પાસે Firebase પ્રોજેક્ટ છે, તો નીચે તમારી કી મૂકો.
 * જો કી નહીં હોય, તો એપ્લિકેશન આપમેળે LocalStorage/IndexedDB માં સંપૂર્ણ કાર્ય કરશે!
 */

export const firebaseConfig = {
  apiKey: "AIzaSyAMqmTOozc8T03TNFmCT_m9ERVrCfXdtKE",
  authDomain: "website-3cad6.firebaseapp.com",
  projectId: "website-3cad6",
  storageBucket: "website-3cad6.firebasestorage.app",
  messagingSenderId: "315573777558",
  appId: "1:315573777558:web:1595c51a18fd37e5bf3eb7",
  measurementId: "G-VWNHJFR21Y"
};

// Check if Firebase is legitimately configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID"
);
