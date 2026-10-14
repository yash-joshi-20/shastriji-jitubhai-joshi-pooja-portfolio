# Engineering Standards & Architecture

## Tech Stack
- **HTML5 & Semantic Structure**: Descriptive semantic tags, ARIA attributes, meta tags for SEO and Gujarati language declaration (`lang="gu"`).
- **Styling**: Modern Vanilla CSS with CSS custom properties, responsive flexbox & CSS grid, light theme defaults.
- **Client Logic**: Vanilla ES6+ JavaScript modules. No bulky third-party frontend frameworks needed; ultra-fast load time (< 500ms).
- **Libraries**:
  - `html2canvas` (v1.4.1) for rendering client-side DOM pamphlets into PNG.
  - `jsPDF` (v2.5.1) for generating A4 PDF pamphlets.
  - Firebase JavaScript SDK v10 (modular App, Firestore, Storage) with automatic fallback.

## State Management & Dual-Mode Data Layer
1. `firebase-config.js`: Exports Firebase initialization. If keys are missing or placeholder, flags `isFirebaseConfigured = false`.
2. `db.js`:
   - Checks `isFirebaseConfigured`.
   - If true: performs asynchronous reads and writes to Cloud Firestore and Firebase Storage.
   - If false: reads and writes to `localStorage` + `IndexedDB`, auto-seeding the initial 2 poojas and profile data on first run.
   - Synchronization hook: Allows one-click export/import or automatic cloud sync when credentials are added.

## Security & Admin Access
- 4-digit PIN protection stored locally or in Firestore metadata.
- Rate-limited PIN verification (prevents rapid brute force).
- Sanitize all user inputs before rendering into DOM (XSS prevention using textContent or safe DOM creation).
