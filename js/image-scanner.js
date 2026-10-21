/**
 * શાસ્ત્રીજી જીતેન્દ્ર જોષી - દસ્તાવેજ/પેમ્ફ્લેટ ઈમેજ સ્કેનર અને ઓટો-ફિલર
 * ૧૦૦% શુદ્ધ HTML5 + Canvas + Tesseract.js OCR (Zero AI / Zero LLM)
 * કેમેરા અથવા ગેલેરીમાંથી પૂજા યાદી સ્કેન કરી આપમેળે ફોર્મ ભરે છે
 */

export class PamphletImageScanner {
  constructor(onApplyCallback) {
    this.onApplyCallback = onApplyCallback;
    this.currentImage = null;
    this.rotationAngle = 0; // 0, 90, 180, 270
    this.isScanning = false;
  }

  /**
   * Helper to load Tesseract.js dynamically if not already loaded
   */
  async ensureTesseract() {
    if (window.Tesseract) return window.Tesseract;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = () => {
        if (window.Tesseract) resolve(window.Tesseract);
        else reject(new Error('Tesseract લોડ થઈ શક્યું નહીં.'));
      };
      script.onerror = () => reject(new Error('Tesseract સ્ક્રિપ્ટ લોડ કરવામાં એરર આવી.'));
      document.head.appendChild(script);
    });
  }

  /**
   * Pre-process image on offscreen Canvas for highest OCR accuracy
   */
  preprocessImage(imgElement, rotate = 0) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxDim = 1800;
    let w = imgElement.naturalWidth || imgElement.width;
    let h = imgElement.naturalHeight || imgElement.height;

    // Scale down if image is huge (speeds up OCR significantly)
    if (Math.max(w, h) > maxDim) {
      const ratio = maxDim / Math.max(w, h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    if (rotate === 90 || rotate === 270) {
      canvas.width = h;
      canvas.height = w;
    } else {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.save();
    if (rotate === 90) {
      ctx.translate(h, 0);
      ctx.rotate(Math.PI / 2);
    } else if (rotate === 180) {
      ctx.translate(w, h);
      ctx.rotate(Math.PI);
    } else if (rotate === 270) {
      ctx.translate(0, w);
      ctx.rotate(-Math.PI / 2);
    }
    ctx.drawImage(imgElement, 0, 0, w, h);
    ctx.restore();

    // High-contrast grayscale conversion
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        // Luminance grayscale
        const v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        // Contrast enhancement
        const contrastFactor = 1.35;
        const enhanced = Math.min(255, Math.max(0, (v - 128) * contrastFactor + 128));
        d[i] = enhanced;
        d[i + 1] = enhanced;
        d[i + 2] = enhanced;
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      // Cross-origin fallback
    }

    return canvas;
  }

  /**
   * Smart Gujarati Rule-Based Parser (Zero AI / Zero LLM)
   * Converts raw text into structured Pooja fields
   */
  parseGujaratiText(rawText) {
    if (!rawText) return {};

    // Standardize text
    const cleanText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/[•●▪■◆★*]/g, ',')
      .replace(/\t+/g, ' ');

    const rawLines = cleanText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const parsed = {
      title: '',
      category: 'ધાર્મિક પૂજા',
      price: 'દક્ષિણા માટે સંપર્ક કરો',
      badge: 'ધાર્મિક વિધિ',
      pujapo: '',
      anajNaivedya: '',
      taiyari: '',
      notes: ''
    };

    const anajKeywords = [
      'ઘઉં', 'ચોખા', 'તલ', 'કાળાતલ', 'મગ', 'દાળ', 'ચણાદાળ', 'તુવેર', 'અડદ',
      'વટાણા', 'મઠ', 'કઠોળ', 'પ્રસાદ', 'નૈવેદ્ય', 'સુખડી', 'શિરો', 'લાડુ',
      'ખીર', 'સીધુ', 'પંચામૃત', 'ફળ', 'ફળો', 'દૂધ', 'દહીં', 'ઘી', 'મધ', 'સાકર'
    ];

    const taiyariKeywords = [
      'બાજોઠ', 'પાટલો', 'થાળી', 'વાટકા', 'ચમચી', 'દીવો', 'અખંડ દીપ', 'અગરબત્તી સ્ટેન્ડ',
      'તાંબાનો લોટો', 'તાંબુ', 'પિત્તળ', 'ગ્લાસ', 'ડબ્બો', 'કપ', 'રકાબી', 'આસન',
      'બાકસ', 'આરતી', 'ફાનસ', 'છત્રી', 'લાકડી', 'ગાદલું', 'ગોદડુ', 'ઓછાડ', 'ઓશીકુ',
      'વસ્ત્ર', 'ચપ્પલ', 'શણગાર', 'મૂર્તિ', 'સૂર્ય', 'ધર્મરાજ', 'સાથિયો', 'જનોઈ',
      'નીસરણી', 'ગાય', 'હોડી', 'તુલસીક્યારો', 'સોનાની ચૂક', 'મોતી', 'પલંગ'
    ];

    const pujapoKeywords = [
      'શ્રીફળ', 'સોપારી', 'અબીલ', 'ગુલાલ', 'કંકુ', 'ચંદન', 'સિંદુર', 'સિંદૂર',
      'તજ', 'લવિંગ', 'એલચી', 'ગોળ', 'દ્રાક્ષ', 'કાજુ', 'બદામ', 'પીસ', 'લાલ પીસ',
      'સફેદ પીસ', 'લીલુ પીસ', 'પીળું પીસ', 'નાડાછડી', 'દડી', 'કપૂર', 'સુતળી',
      'કેળના પાન', 'આસોપાલવ', 'તોરણ', 'તુલસીપત્ર', 'તુલસી', 'પડીયા', 'નાગરવેલ',
      'હાર', 'ફૂલહાર', 'ફૂલ', 'યજ્ઞોપવીત', 'જાવંત્રી', 'જાયફળ', 'અગરબત્તી', 'ધૂપ'
    ];

    const titleKeywords = [
      'પૂજા', 'કથા', 'વિધાન', 'યજ્ઞ', 'સ્થાપન', 'વાસ્તુ', 'જય', 'પાઠ', 'હવન',
      'ઉદ્યાપન', 'શાંતિ', 'લગ્ન', 'જનોઈ', 'શ્રી'
    ];

    // 1. Detect Title (Look across first 5 lines)
    for (let i = 0; i < Math.min(rawLines.length, 5); i++) {
      const line = rawLines[i];
      if (titleKeywords.some(k => line.includes(k)) && line.length > 3 && line.length < 65) {
        parsed.title = line.replace(/^[0-9.:\-\s]+/, '').trim();
        break;
      }
    }

    if (!parsed.title && rawLines.length > 0) {
      parsed.title = rawLines[0].substring(0, 45).replace(/^[0-9.:\-\s]+/, '').trim();
    }

    // 2. Detect Category
    const fullText = cleanText.toLowerCase();
    if (fullText.includes('ઉદ્યાપન') || fullText.includes('વ્રત')) {
      parsed.category = 'વ્રત અને ઉદ્યાપન';
      parsed.badge = 'સંપૂર્ણ વિધાન';
    } else if (fullText.includes('વાસ્તુ') || fullText.includes('લગ્ન') || fullText.includes('સીમંત') || fullText.includes('જનોઈ')) {
      parsed.category = 'સામાજિક વિધિ';
      parsed.badge = 'શુભ સંસ્કાર';
    } else if (fullText.includes('હવન') || fullText.includes('યજ્ઞ') || fullText.includes('શાંતિ') || fullText.includes('ગ્રહ') || fullText.includes('કર્મકાંડ')) {
      parsed.category = 'કર્મકાંડ';
      parsed.badge = 'વૈદિક અનુષ્ઠાન';
    } else {
      parsed.category = 'ધાર્મિક પૂજા';
      parsed.badge = 'લોકપ્રિય પૂજા';
    }

    // 3. Detect Price / Dakshina
    const priceMatch = cleanText.match(/(?:દક્ષિણા|કિંમત|₹|રૂ\.?)\s*:?\s*([૦-૯0-9,]+(?:\s*\/-)?)/i);
    if (priceMatch) {
      parsed.price = '₹ ' + priceMatch[1].trim();
    }

    // 4. Categorize items into Pujapo, Anaj, and Taiyari
    const pujapoItems = [];
    const anajItems = [];
    const taiyariItems = [];
    const noteItems = [];

    // Check line by line or split by comma
    rawLines.forEach(line => {
      // Skip the line if it is just the title
      if (parsed.title && line.includes(parsed.title)) return;

      // Check section headers if present in text
      const lower = line.toLowerCase();
      if (lower.startsWith('અનાજ') || lower.startsWith('નૈવેદ્ય')) {
        anajItems.push(line.replace(/^(?:અનાજ|નૈવેદ્ય)\s*[:\-]/i, '').trim());
        return;
      }
      if (lower.startsWith('તૈયારી') || lower.startsWith('વાસણ') || lower.startsWith('મૂર્તિ')) {
        taiyariItems.push(line.replace(/^(?:તૈયારી|વાસણ|મૂર્તિ)\s*[:\-]/i, '').trim());
        return;
      }
      if (lower.startsWith('પૂજાપો') || lower.startsWith('સામગ્રી')) {
        pujapoItems.push(line.replace(/^(?:પૂજાપો|સામગ્રી)\s*[:\-]/i, '').trim());
        return;
      }
      if (lower.startsWith('દક્ષિણા') || lower.startsWith('કિંમત') || lower.match(/^(?:₹|રૂ)/)) {
        return; // Already captured in parsed.price
      }
      if (lower.startsWith('નોંધ') || lower.startsWith('સૂચના') || lower.includes('મહત્વ') || lower.includes('લાભ')) {
        noteItems.push(line.replace(/^(?:નોંધ|સૂચના)\s*[:\-]/i, '').trim());
        return;
      }

      // Check item matches
      const isAnaj = anajKeywords.some(k => line.includes(k));
      const isTaiyari = taiyariKeywords.some(k => line.includes(k));
      const isPujapo = pujapoKeywords.some(k => line.includes(k));

      if (isAnaj && !isPujapo && !isTaiyari) {
        anajItems.push(line);
      } else if (isTaiyari && !isPujapo) {
        taiyariItems.push(line);
      } else if (isPujapo) {
        pujapoItems.push(line);
      } else {
        // Fallback: if it looks like an item list, add to pujapo; otherwise to notes
        if (line.includes(',') || line.includes('-') || line.length < 35) {
          pujapoItems.push(line);
        } else {
          noteItems.push(line);
        }
      }
    });

    // Join with proper formatting
    parsed.pujapo = pujapoItems.join(', ').replace(/,\s*,/g, ',').trim();
    parsed.anajNaivedya = anajItems.join(', ').replace(/,\s*,/g, ',').trim();
    parsed.taiyari = taiyariItems.join(', ').replace(/,\s*,/g, ',').trim();
    parsed.notes = noteItems.join(' ').trim();

    // Clean up trailing commas or periods
    ['pujapo', 'anajNaivedya', 'taiyari', 'notes'].forEach(key => {
      parsed[key] = parsed[key].replace(/^,\s*/, '').replace(/,\s*$/, '.');
    });

    return parsed;
  }
}

/**
 * Mount the full Scanning Modal / Dialog in Gujarati
 */
export function openScannerModal({ onApply }) {
  const existingModal = document.getElementById('scannerModalOverlay');
  if (existingModal) existingModal.remove();

  const scanner = new PamphletImageScanner(onApply);

  const modalHtml = `
    <div class="modal-overlay active" id="scannerModalOverlay" style="z-index: 10000;">
      <div class="modal-container" style="max-width: 720px; max-height: 90vh; overflow-y: auto; padding: 1.5rem;">
        <button class="modal-close-btn" id="scannerCloseBtn" title="બંધ કરો">✕</button>

        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem;">
          <span style="font-size: 1.7rem;">📷</span>
          <div>
            <h2 style="font-size: 1.35rem; color: var(--color-maroon); margin: 0;">પૂજા પેમ્ફ્લેટ અને સામગ્રી સ્કેનર</h2>
            <p style="font-size: 0.85rem; color: var(--color-text-sub); margin: 0.15rem 0 0;">કેમેરા અથવા ગેલેરીમાંથી ફોટો પાડી આપમેળે વિગત ભરો (AI / LLM વગર)</p>
          </div>
        </div>

        <!-- Input Modes: Camera vs Gallery vs Direct Paste -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
          <label class="btn btn-primary" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; text-align: center; min-height: 48px; margin: 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <span>📸 કેમેરાથી ફોટો પાડો</span>
            <input type="file" id="scanCameraFile" accept="image/*" capture="environment" style="display: none;">
          </label>

          <label class="btn btn-outline" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; text-align: center; min-height: 48px; margin: 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>🖼️ ગેલેરીમાંથી પસંદ કરો</span>
            <input type="file" id="scanGalleryFile" accept="image/*" style="display: none;">
          </label>
        </div>

        <!-- Image Preview & Rotation Section (Hidden until image chosen) -->
        <div id="scanImagePreviewArea" style="display: none; background: #FFFDF7; border: 2px dashed var(--color-border-ornate); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem; text-align: center;">
          <div style="position: relative; display: inline-block; max-width: 100%; max-height: 280px; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <img id="scanPreviewImg" src="" style="max-width: 100%; max-height: 260px; object-fit: contain; display: block;">
          </div>
          <div style="display: flex; justify-content: center; gap: 0.6rem; margin-top: 0.75rem; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline" id="scanRotateBtn" style="min-height: 38px; font-size: 0.85rem; padding: 0.35rem 0.85rem;">
              🔄 ૯૦° ફેરવો (Rotate)
            </button>
            <button type="button" class="btn btn-primary" id="startScanBtn" style="min-height: 38px; font-size: 0.95rem; font-weight: 700;">
              ⚡ સ્કેન શરૂ કરો (Scan Now)
            </button>
          </div>
        </div>

        <!-- Scanning Progress Bar -->
        <div id="scanProgressBarContainer" style="display: none; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: var(--color-maroon); margin-bottom: 0.35rem;">
            <span id="scanStatusText">તસવીર સ્કેન થઈ રહી છે...</span>
            <span id="scanPercentText">૦%</span>
          </div>
          <div style="width: 100%; height: 12px; background: #FDE68A; border-radius: 999px; overflow: hidden;">
            <div id="scanProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--color-maroon), var(--color-saffron)); transition: width 0.2s ease;"></div>
          </div>
        </div>

        <!-- Paste WhatsApp / Text Direct Mode -->
        <div style="margin-bottom: 1.25rem;">
          <details style="background: #FFFDF7; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0.6rem 0.85rem;">
            <summary style="font-size: 0.9rem; font-weight: 700; color: var(--color-text-sub); cursor: pointer; user-select: none;">
              ✍️ અથવા અહીં લખાણ / WhatsApp મેસેજ સીધો પેસ્ટ કરો
            </summary>
            <div style="margin-top: 0.75rem;">
              <textarea id="scanPasteText" class="form-control" style="min-height: 85px; font-size: 0.9rem;" placeholder="યજમાન તરફથી આવેલ પૂજાપો અથવા સામગ્રી લિસ્ટ અહીં પેસ્ટ કરો..."></textarea>
              <button type="button" class="btn btn-outline" id="scanParsePastedBtn" style="margin-top: 0.5rem; width: 100%; font-size: 0.9rem;">
                🔍 લખાણમાંથી આપમેળે વિગત ગોઠવો
              </button>
            </div>
          </details>
        </div>

        <!-- Parsed Results Preview & Form Auto-fill (Hidden until scan complete) -->
        <div id="scanResultsArea" style="display: none; background: #FDFBF7; border: 2px solid #10B981; border-radius: var(--radius-md); padding: 1.25rem; margin-top: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="font-weight: 800; color: #047857; font-size: 1.05rem; display: flex; align-items: center; gap: 0.4rem;">
              <span>✅</span> <span>સ્કેન સફળ! વિગત ચકાસો:</span>
              <span id="ocrEngineBadge" style="display: none; font-size: 0.75rem; background: #DEF7EC; color: #03543F; border: 1px solid #31C48D; padding: 0.15rem 0.6rem; border-radius: 999px; font-weight: 700;"></span>
            </div>
            <span style="font-size: 0.8rem; color: var(--color-text-sub);">જરૂર હોય તો સુધારો કરી શકો છો</span>
          </div>

          <div style="display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div>
              <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-maroon);">પૂજાનું નામ</label>
              <input type="text" id="resTitle" class="form-control" style="font-size: 0.9rem; min-height: 38px;">
            </div>
            <div>
              <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-maroon);">વિભાગ (Category)</label>
              <select id="resCategory" class="form-control" style="font-size: 0.9rem; min-height: 38px;">
                <option value="ધાર્મિક પૂજા">ધાર્મિક પૂજા</option>
                <option value="કર્મકાંડ">કર્મકાંડ</option>
                <option value="વ્રત અને ઉદ્યાપન">વ્રત અને ઉદ્યાપન</option>
                <option value="સામાજિક વિધિ">સામાજિક વિધિ</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-maroon);">દક્ષિણા (Dakshina)</label>
              <input type="text" id="resPrice" class="form-control" placeholder="દા.ત. ₹ ૨૧૦૦/-" style="font-size: 0.9rem; min-height: 38px;">
            </div>
          </div>

          <div style="margin-bottom: 0.75rem;">
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-maroon);">પૂજાપો / મુખ્ય સામગ્રી</label>
            <textarea id="resPujapo" class="form-control" style="font-size: 0.85rem; min-height: 70px;"></textarea>
          </div>

          <div style="margin-bottom: 0.75rem;">
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-maroon);">અનાજ અને નૈવેદ્ય</label>
            <textarea id="resAnaj" class="form-control" style="font-size: 0.85rem; min-height: 60px;"></textarea>
          </div>

          <div style="margin-bottom: 0.75rem;">
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-maroon);">મૂર્તિ, વાસણ અને ઘરની તૈયારી</label>
            <textarea id="resTaiyari" class="form-control" style="font-size: 0.85rem; min-height: 60px;"></textarea>
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-maroon);">વિશેષ નોંધ / મહત્વ</label>
            <input type="text" id="resNotes" class="form-control" style="font-size: 0.9rem; min-height: 38px;">
          </div>

          <!-- Raw OCR text accordion -->
          <details style="margin-bottom: 1rem; font-size: 0.85rem;">
            <summary style="color: var(--color-text-sub); cursor: pointer;">🔍 અસલ સ્કેન કરેલ અક્ષરો (Raw Text) જુઓ</summary>
            <textarea id="resRawText" class="form-control" readonly style="margin-top: 0.5rem; min-height: 80px; font-size: 0.8rem; background: #F3F4F6;"></textarea>
          </details>

          <!-- Master Apply Button -->
          <button type="button" class="btn btn-primary" id="resApplyBtn" style="width: 100%; min-height: 48px; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <span>🎯</span> <span>આ બધી વિગતો પૂજા ફોર્મમાં ભરી દો</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalEl = document.getElementById('scannerModalOverlay');
  const closeBtn = document.getElementById('scannerCloseBtn');
  const cameraInput = document.getElementById('scanCameraFile');
  const galleryInput = document.getElementById('scanGalleryFile');
  const previewArea = document.getElementById('scanImagePreviewArea');
  const previewImg = document.getElementById('scanPreviewImg');
  const rotateBtn = document.getElementById('scanRotateBtn');
  const startScanBtn = document.getElementById('startScanBtn');
  const progressBox = document.getElementById('scanProgressBarContainer');
  const progressBar = document.getElementById('scanProgressBar');
  const statusText = document.getElementById('scanStatusText');
  const percentText = document.getElementById('scanPercentText');
  const resultsArea = document.getElementById('scanResultsArea');
  const applyBtn = document.getElementById('resApplyBtn');
  const pasteText = document.getElementById('scanPasteText');
  const parsePastedBtn = document.getElementById('scanParsePastedBtn');

  let selectedImageSrc = null;
  let rotation = 0;

  function closeModal() {
    modalEl.remove();
  }

  closeBtn.addEventListener('click', closeModal);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });

  // Handle Image Selection (Camera or Gallery)
  function handleFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      selectedImageSrc = event.target.result;
      previewImg.src = selectedImageSrc;
      rotation = 0;
      previewImg.style.transform = `rotate(0deg)`;
      previewArea.style.display = 'block';
      resultsArea.style.display = 'none';
      progressBox.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  cameraInput.addEventListener('change', handleFileSelected);
  galleryInput.addEventListener('change', handleFileSelected);

  // Rotation
  rotateBtn.addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    previewImg.style.transform = `rotate(${rotation}deg)`;
  });

  // Perform Scan (Priority: PaddleOCR Backend in Python VENV -> Fallback: Tesseract.js)
  startScanBtn.addEventListener('click', async () => {
    if (!selectedImageSrc) return;

    startScanBtn.disabled = true;
    progressBox.style.display = 'block';
    resultsArea.style.display = 'none';
    progressBar.style.width = '15%';
    percentText.textContent = '૧૫%';
    statusText.textContent = '🚀 PaddleOCR (Python VENV) એન્જિન શરૂ થઈ રહ્યું છે...';

    // Preprocess image
    const processedCanvas = scanner.preprocessImage(previewImg, rotation);
    const dataUrl = processedCanvas.toDataURL('image/jpeg', 0.92);

    let paddleSuccess = false;

    // Step ૧: Call Backend PaddleOCR Service
    try {
      progressBar.style.width = '40%';
      percentText.textContent = '૪૦%';
      statusText.textContent = '🤖 PaddleOCR દ્વારા તસવીરમાંથી અક્ષરો ઓળખાઈ રહ્યા છે...';

      const resp = await fetch('/api/ocr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });

      if (resp.ok) {
        const ocrData = await resp.json();
        if (ocrData.success && (ocrData.raw_text || (ocrData.lines && ocrData.lines.length))) {
          paddleSuccess = true;
          progressBar.style.width = '100%';
          percentText.textContent = '૧૦૦%';
          statusText.textContent = '✨ PaddleOCR (Python VENV) દ્વારા સફળ સ્કેનિંગ!';

          const rawText = ocrData.raw_text || (ocrData.lines || []).map(l => l.text).join('\n');
          const parsed = ocrData.parsed || scanner.parseGujaratiText(rawText);
          displayParsedResults(parsed, rawText, 'PaddleOCR (Python VENV)');
          return;
        }
      }
    } catch (backendErr) {
      console.warn('PaddleOCR backend unavailable, switching to local OCR fallback:', backendErr);
    }

    // Step ૨: Fallback to client-side OCR if Python service is unavailable
    if (!paddleSuccess) {
      statusText.textContent = 'સ્થાનિક OCR એન્જિન દ્વારા સ્કેનિંગ...';
      try {
        const Tesseract = await scanner.ensureTesseract();

        progressBar.style.width = '55%';
        percentText.textContent = '૫૫%';
        statusText.textContent = 'ગુજરાતી અને અંગ્રેજી અક્ષરો સ્કેન થઈ રહ્યા છે...';

        const res = await Tesseract.recognize(processedCanvas, 'guj+eng', {
          logger: (m) => {
            if (m.status === 'recognizing text' && m.progress) {
              const p = Math.round(55 + m.progress * 40);
              progressBar.style.width = `${p}%`;
              percentText.textContent = `${p}%`;
              statusText.textContent = `અક્ષરો સ્કેન થઈ રહ્યા છે... ${p}%`;
            }
          }
        });

        progressBar.style.width = '100%';
        percentText.textContent = '૧૦૦%';
        statusText.textContent = '✨ સ્કેનિંગ સફળ!';

        const text = res.data && res.data.text ? res.data.text : '';
        displayParsedResults(scanner.parseGujaratiText(text), text, 'Client-Side OCR');
      } catch (err) {
        console.error('Scan Error:', err);
        statusText.textContent = '⚠️ અક્ષરો ઓળખવામાં સમસ્યા આવી. લખાણ મોડનો ઉપયોગ કરો.';
        progressBar.style.background = 'var(--color-danger)';
      } finally {
        startScanBtn.disabled = false;
      }
    } else {
      startScanBtn.disabled = false;
    }
  });

  // Direct Text Paste Parse
  parsePastedBtn.addEventListener('click', () => {
    const raw = pasteText.value.trim();
    if (!raw) {
      alert('કૃપા કરીને પહેલા લખાણ પેસ્ટ કરો.');
      return;
    }
    const parsed = scanner.parseGujaratiText(raw);
    displayParsedResults(parsed, raw, 'ટેક્સ્ટ પાર્સર');
  });

  function displayParsedResults(parsed, raw, engineName = '') {
    document.getElementById('resTitle').value = parsed.title || '';
    document.getElementById('resCategory').value = parsed.category || 'ધાર્મિક પૂજા';
    const priceEl = document.getElementById('resPrice');
    if (priceEl) priceEl.value = parsed.price || '';
    document.getElementById('resPujapo').value = parsed.pujapo || '';
    document.getElementById('resAnaj').value = parsed.anajNaivedya || '';
    document.getElementById('resTaiyari').value = parsed.taiyari || '';
    document.getElementById('resNotes').value = parsed.notes || '';
    document.getElementById('resRawText').value = raw || '';

    // Show Engine Badge
    const engineBadge = document.getElementById('ocrEngineBadge');
    if (engineBadge) {
      engineBadge.textContent = engineName ? `એન્જિન: ${engineName}` : '';
      engineBadge.style.display = engineName ? 'inline-block' : 'none';
    }

    resultsArea.style.display = 'block';
    resultsArea.scrollIntoView({ behavior: 'smooth' });
    startScanBtn.disabled = false;
  }

  // Apply to form
  applyBtn.addEventListener('click', () => {
    const finalData = {
      title: document.getElementById('resTitle').value.trim(),
      category: document.getElementById('resCategory').value,
      price: (document.getElementById('resPrice')?.value || '').trim(),
      pujapo: document.getElementById('resPujapo').value.trim(),
      anajNaivedya: document.getElementById('resAnaj').value.trim(),
      taiyari: document.getElementById('resTaiyari').value.trim(),
      notes: document.getElementById('resNotes').value.trim(),
      // Attach captured image as pamphlet if available
      scannedImage: selectedImageSrc
    };

    if (typeof onApply === 'function') {
      onApply(finalData);
    }

    closeModal();
  });
}
