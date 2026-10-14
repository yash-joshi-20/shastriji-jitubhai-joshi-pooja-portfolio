# Project Knowledge & Requirements

## Project: શાસ્ત્રીજી જીતેન્દ્ર જોષી (જીતુભાઈ જોષી) - પૂજા સામગ્રી અને પોર્ટફોલિયો CMS

### 1. Vision & Purpose
A mobile-first, high-performance, culturally authentic Gujarati portfolio and Pooja Samagri management system for Shastriji Jitendra Joshi. Clients can view pooja offerings, search rituals and ingredients in Gujarati, download ornate religious pamphlets (PDF / Image), and share pooja samagri lists directly via WhatsApp. Shastriji can manage his offerings through an intuitive Gujarati-only admin panel protected with a 4-digit PIN.

### 2. Core Stakeholders
- **Public Devotees / Yajmans (યજમાનો)**: Need clear, sacred Gujarati listings of required pooja samagri (પૂજાપો, અનાજ, વાસણ, તૈયારી), ability to contact Shastriji via phone/WhatsApp, and download printable pamphlets.
- **Shastriji Jitendra Joshi (શાસ્ત્રીજી)**: Needs a frictionless, Gujarati smartphone-friendly CMS to add, edit, or delete poojas, upload pamphlet images or deity photos, and update his contact information.

### 3. Key Feature Matrix
- **Sacred Branding & Logo**: Auspicious "ॐ" gold circular medallion, "।। શ્રી ગણેશાય નમઃ ।।", traditional ornamental borders.
- **Hero Presentation**: Studio-quality portrait of Shastriji with soft warm halo lighting, direct phone calling CTA (`tel:9925264929`), WhatsApp chat button, and 7+7 Dharmik rules open-book card.
- **Search & Category Filtering**: Instant real-time search across pooja names and ingredient lists in Gujarati. Category chips: `[બધી વિધિઓ]`, `[કર્મકાંડ]`, `[ધાર્મિક પૂજા]`, `[વ્રત અને ઉદ્યાપન]`, `[સામાજિક વિધિ]`.
- **Dynamic Service Grid & Modal/Detail View**: Ornate card layout with divine deity visuals, pricing/dakshina badges, and full structured samagri preview.
- **Auto-Pamphlet Generator**:
  - Double-line maroon & gold traditional border
  - Sacred header with "ॐ" and "શ્રી ગણેશાય નમઃ"
  - Formatted sections: પૂજાનું નામ અને દક્ષિણા, પૂજાપો / સામગ્રી, અનાજ અને નૈવેદ્ય, મૂર્તિ, વાસણ અને ઘરની તૈયારી, and Shastriji contact footer
  - Instant high-res PNG download via `html2canvas`
  - Instant A4 PDF download via `jsPDF`
  - 1-click WhatsApp share button with pre-formatted Gujarati text
- **Mobile-First Gujarati CMS (Admin Panel)**:
  - Accessible via "⚙️ શાસ્ત્રીજી લોગિન (એડિટ)"
  - 4-digit PIN verification (Default: `1234`, stored securely and customizable)
  - Full CRUD operations in pure Gujarati:
    - ➕ નવી પૂજા ઉમેરો (Add Pooja)
    - ✏️ ફેરફાર કરો (Edit Pooja)
    - 🗑️ કાઢી નાખો (Delete with Gujarati confirmation)
    - 👤 પ્રોફાઈલ અને ફોટો બદલો (Update profile photo and phone)
- **Zero-Crash Dual-Mode Data Layer**:
  - Works out of the box with `localStorage` + `IndexedDB` seeded with authentic data.
  - Ready for Firebase Cloud Firestore & Storage integration with `firebase-config.js`.
