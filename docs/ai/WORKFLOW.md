# Workflow & Verification Process

## Step-by-Step Methodology
1. **Understand**: Digest Gujarati requirements, religious context, and user flows.
2. **Inspect**: Check all assets in `doc/` and `assets/`.
3. **Reuse**: Bind existing extracted assets, SVGs, and seed data.
4. **Plan**: Architecture of single-page app with modals, search filters, pamphlet generation, and admin CMS.
5. **Implement**:
   - `index.html`: Complete structure with semantic tags and Gujarati content.
   - `css/design-system.css` & `css/style.css`: Dharmik light theme styling, ornate borders, responsive cards.
   - `js/data.js`: Authentic Gujarati seed data for Satyanarayan Dev Pooja and Dharmaraja Surya Dev Udhyapan.
   - `js/firebase-config.js`: Firebase v10 modular configuration.
   - `js/db.js`: Dual-mode storage engine.
   - `js/pamphlet-export.js`: Image and PDF generator using `html2canvas` and `jsPDF`.
   - `js/admin.js`: Mobile-first Gujarati CMS with PIN modal and CRUD forms.
   - `js/app.js`: Application controller, search, filters, and event wiring.
   - `firebase.json` & `.firebaserc`: Deployment configs.
6. **Test & Verify**: Test in browser using local server and browser subagent/headless checks.
7. **Review & Fix**: Ensure no console errors, verify contrast and mobile responsiveness.
8. **Deliver**: Provide complete documentation and instructions for Firebase hosting.

## Definition of Done
- 100% pure Gujarati language across user & admin UI.
- All assets from `doc/` mapped and working.
- High-res studio portrait of Shastriji displayed with traditional framing.
- Search & filter functionality works instantly.
- Pamphlet modal displays formatted sections and allows downloading PNG, PDF, and sharing to WhatsApp.
- Admin CMS functions smoothly with 4-digit PIN (`1234`), allowing adding, editing, and deleting poojas.
- Works offline/standalone with localStorage and is 1-command deployable to Firebase.
