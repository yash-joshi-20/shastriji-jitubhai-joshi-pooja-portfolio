/**
 * શાસ્ત્રીજી જીતેન્દ્ર જોષી - દિવ્ય પૂજા કાર્ડ ઈમેજ જનરેટર
 * 100% શુદ્ધ HTML5 Canvas + JavaScript (Zero AI / Zero LLM)
 * ઉચ્ચ-રિઝોલ્યુશન (1200x800) પવિત્ર ધાર્મિક કાર્ડ બનાવે છે
 */

export class SacredCardGenerator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 1200;
    this.height = 800;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.state = {
      theme: 'maroon', // 'maroon', 'saffron', 'sandalwood'
      symbol: 'ॐ',     // 'ॐ', '卐', '🪔', '🛕'
      title: 'જય શ્રી સત્યનારાયણ દેવ પૂજા',
      category: 'ધાર્મિક પૂજા',
      tagline: 'શાસ્ત્રીજી જીતેન્દ્ર જોષી (જીતુભાઈ) • મો. ૯૯૨૫૨ ૬૪૯૨૯'
    };
  }

  setOptions(options = {}) {
    this.state = { ...this.state, ...options };
    this.render();
  }

  render() {
    const { ctx, width, height } = this;
    const { theme, symbol, title, category, tagline } = this.state;

    ctx.clearRect(0, 0, width, height);

    // 1. પૃષ્ઠભૂમિ (Background Gradient & Glow)
    this.drawBackground(theme);

    // 2. સૂર્યકિરણો અને દિવ્ય આભા (Rays & Halo Aura)
    this.drawDivineAura(theme);

    // 3. પરંપરાગત ગોલ્ડન ડબલ બોર્ડર અને કોર્નર આભૂષણ (Ornate Borders)
    this.drawOrnateBorders(theme);

    // 4. શીર્ષક પવિત્ર મંત્ર (Top Sacred Mantra)
    this.drawTopMantra(theme);

    // 5. મધ્ય પવિત્ર પ્રતીક મેડાલિયન (Center Holy Medallion)
    this.drawMedallion(symbol, theme);

    // 6. પૂજાનું નામ (Pooja Title with Text Wrap)
    this.drawPoojaTitle(title, theme);

    // 7. વિભાગ અને વિશેષતા બેજ (Category Badge)
    this.drawCategoryBadge(category, theme);

    // 8. શાસ્ત્રીજી પરિચય અને આશીર્વચન ફૂટર રીબન (Footer Ribbon)
    this.drawFooterRibbon(tagline, theme);
  }

  drawBackground(theme) {
    const { ctx, width, height } = this;
    const cx = width / 2;
    const cy = height * 0.45;

    let bgGrad;
    if (theme === 'saffron') {
      bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, width * 0.7);
      bgGrad.addColorStop(0, '#F59E0B');
      bgGrad.addColorStop(0.4, '#D97706');
      bgGrad.addColorStop(0.8, '#92400E');
      bgGrad.addColorStop(1, '#451A03');
    } else if (theme === 'sandalwood') {
      bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, width * 0.7);
      bgGrad.addColorStop(0, '#FFFDF7');
      bgGrad.addColorStop(0.35, '#FEF3C7');
      bgGrad.addColorStop(0.75, '#FDE68A');
      bgGrad.addColorStop(1, '#D97706');
    } else {
      // Default: Deep Royal Maroon
      bgGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, width * 0.75);
      bgGrad.addColorStop(0, '#A82512');
      bgGrad.addColorStop(0.35, '#8B1E0F');
      bgGrad.addColorStop(0.7, '#580E05');
      bgGrad.addColorStop(1, '#2B0401');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  drawDivineAura(theme) {
    const { ctx, width, height } = this;
    const cx = width / 2;
    const cy = 290;

    // Sunburst rays emitting from behind the medallion
    const rayCount = 36;
    const rayLength = width * 0.7;
    ctx.save();
    ctx.translate(cx, cy);

    const rayColor = theme === 'sandalwood' ? 'rgba(217, 119, 6, 0.08)' : 'rgba(254, 243, 199, 0.06)';
    ctx.fillStyle = rayColor;

    for (let i = 0; i < rayCount; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const angle = (i * 2 * Math.PI) / rayCount;
      const spread = (Math.PI / rayCount) * 0.45;
      ctx.arc(0, 0, rayLength, angle - spread, angle + spread);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawOrnateBorders(theme) {
    const { ctx, width, height } = this;
    const gold1 = '#FDE68A';
    const gold2 = '#F59E0B';
    const darkMaroon = '#8B1E0F';

    const isLight = theme === 'sandalwood';
    const primaryBorder = isLight ? darkMaroon : gold1;
    const secondaryBorder = isLight ? gold2 : '#D97706';

    // Outer line
    ctx.save();
    ctx.strokeStyle = primaryBorder;
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, width - 56, height - 56);

    // Inner line
    ctx.strokeStyle = secondaryBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(38, 38, width - 76, height - 76);

    // 4 Traditional Decorative Corner Motifs
    const corners = [
      { x: 38, y: 38, rot: 0 },
      { x: width - 38, y: 38, rot: Math.PI / 2 },
      { x: width - 38, y: height - 38, rot: Math.PI },
      { x: 38, y: height - 38, rot: -Math.PI / 2 }
    ];

    corners.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);

      ctx.fillStyle = primaryBorder;
      ctx.strokeStyle = primaryBorder;
      ctx.lineWidth = 2.5;

      // Corner arc with flourish
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(45, 0);
      ctx.quadraticCurveTo(20, 20, 0, 45);
      ctx.closePath();
      ctx.stroke();

      // Corner small circle ornament
      ctx.beginPath();
      ctx.arc(14, 14, 4, 0, Math.PI * 2);
      ctx.fill();

      // Flourish lines
      ctx.beginPath();
      ctx.moveTo(25, 0);
      ctx.lineTo(25, 12);
      ctx.lineTo(0, 25);
      ctx.stroke();

      ctx.restore();
    });

    ctx.restore();
  }

  drawTopMantra(theme) {
    const { ctx, width } = this;
    const isLight = theme === 'sandalwood';

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top Shloka Pill background
    const pillW = 460;
    const pillH = 40;
    const pillX = (width - pillW) / 2;
    const pillY = 56;

    ctx.fillStyle = isLight ? 'rgba(139, 30, 15, 0.08)' : 'rgba(0, 0, 0, 0.25)';
    this.roundRect(ctx, pillX, pillY, pillW, pillH, 20);
    ctx.fill();

    ctx.strokeStyle = isLight ? '#8B1E0F' : '#FDE68A';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '700 20px "Noto Sans Gujarati", "Rozha One", serif';
    ctx.fillStyle = isLight ? '#8B1E0F' : '#FEF3C7';
    ctx.fillText('।। શ્રી ગણેશાય નમઃ ।।   •   ।। શુભ લાભ ।।', width / 2, pillY + 20);
    ctx.restore();
  }

  drawMedallion(symbol, theme) {
    const { ctx, width } = this;
    const cx = width / 2;
    const cy = 250;
    const radius = 80;
    const isLight = theme === 'sandalwood';

    ctx.save();

    // Outer glow
    const halo = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.5);
    halo.addColorStop(0, isLight ? 'rgba(217, 119, 6, 0.4)' : 'rgba(254, 243, 199, 0.35)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Gold medallion circle
    const diskGrad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, radius);
    if (isLight) {
      diskGrad.addColorStop(0, '#FEF3C7');
      diskGrad.addColorStop(0.7, '#F59E0B');
      diskGrad.addColorStop(1, '#8B1E0F');
    } else {
      diskGrad.addColorStop(0, '#FFFBEB');
      diskGrad.addColorStop(0.4, '#FDE68A');
      diskGrad.addColorStop(0.8, '#D97706');
      diskGrad.addColorStop(1, '#78350F');
    }

    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Medallion double border
    ctx.strokeStyle = isLight ? '#8B1E0F' : '#FEF3C7';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = isLight ? '#FEF3C7' : '#78350F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 7, 0, Math.PI * 2);
    ctx.stroke();

    // Draw symbol inside medallion
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 74px "Noto Sans Gujarati", serif';
    ctx.fillStyle = isLight ? '#8B1E0F' : '#671207';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 4;
    ctx.fillText(symbol, cx, cy + 3);

    ctx.restore();
  }

  drawPoojaTitle(title, theme) {
    const { ctx, width } = this;
    const isLight = theme === 'sandalwood';
    const text = title || 'પવિત્ર પૂજા વિધાન';

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Dynamic font size depending on title length
    let fontSize = 62;
    if (text.length > 25) fontSize = 48;
    if (text.length > 40) fontSize = 40;

    ctx.font = `bold ${fontSize}px "Noto Sans Gujarati", "Rozha One", serif`;

    if (isLight) {
      ctx.fillStyle = '#671207';
      ctx.shadowColor = 'rgba(217, 119, 6, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
    } else {
      ctx.fillStyle = '#FFFDF7';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
    }

    const startY = 370;
    const maxWidth = width - 180;
    const lineHeight = fontSize * 1.35;

    this.wrapText(ctx, text, width / 2, startY, maxWidth, lineHeight);

    ctx.restore();
  }

  drawCategoryBadge(category, theme) {
    const { ctx, width } = this;
    const isLight = theme === 'sandalwood';
    const text = `[ ${category || 'ધાર્મિક વિધિ'} ]`;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 24px "Noto Sans Gujarati", sans-serif';

    const textWidth = ctx.measureText(text).width;
    const badgeW = Math.max(textWidth + 48, 220);
    const badgeH = 46;
    const badgeX = (width - badgeW) / 2;
    const badgeY = 575;

    // Badge background
    if (isLight) {
      ctx.fillStyle = '#8B1E0F';
      ctx.strokeStyle = '#D97706';
    } else {
      ctx.fillStyle = 'rgba(217, 119, 6, 0.35)';
      ctx.strokeStyle = '#FDE68A';
    }

    this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFDF7';
    ctx.fillText(text, width / 2, badgeY + badgeH / 2 + 1);

    ctx.restore();
  }

  drawFooterRibbon(tagline, theme) {
    const { ctx, width, height } = this;
    const isLight = theme === 'sandalwood';

    ctx.save();
    const ribbonY = height - 120;
    const ribbonH = 65;
    const ribbonW = width - 120;
    const ribbonX = 60;

    // Golden gradient ribbon
    const ribGrad = ctx.createLinearGradient(ribbonX, 0, ribbonX + ribbonW, 0);
    if (isLight) {
      ribGrad.addColorStop(0, '#FEF3C7');
      ribGrad.addColorStop(0.5, '#FDE68A');
      ribGrad.addColorStop(1, '#FEF3C7');
    } else {
      ribGrad.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
      ribGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.95)');
      ribGrad.addColorStop(1, 'rgba(245, 158, 11, 0.15)');
    }

    ctx.fillStyle = ribGrad;
    this.roundRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 12);
    ctx.fill();

    ctx.strokeStyle = isLight ? '#8B1E0F' : '#FEF3C7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Footer text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 24px "Noto Sans Gujarati", sans-serif';
    ctx.fillStyle = isLight ? '#8B1E0F' : '#3B1209';
    ctx.fillText(tagline, width / 2, ribbonY + ribbonH / 2);

    ctx.restore();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Center vertically if multiple lines
    for (let k = 0; k < lines.length; k++) {
      ctx.fillText(lines[k], x, y + (k * lineHeight));
    }
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  toDataURL(type = 'image/jpeg', quality = 0.92) {
    return this.canvas.toDataURL(type, quality);
  }

  async toBlob(type = 'image/jpeg', quality = 0.92) {
    return new Promise(resolve => {
      this.canvas.toBlob(blob => resolve(blob), type, quality);
    });
  }
}

/**
 * Helper to mount the Image Generator UI inside any container
 */
export function mountCardGenerator(containerEl, { initialTitle = '', initialCategory = 'ધાર્મિક પૂજા', onSetImage }) {
  if (!containerEl) return null;

  containerEl.innerHTML = `
    <div class="card-generator-box" style="background: #FFFDF7; border: 2px solid var(--color-border-ornate); border-radius: var(--radius-md); padding: 1.25rem; margin-top: 0.75rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.4rem;">🎨</span>
          <div>
            <div style="font-weight: 800; color: var(--color-maroon); font-size: 1.05rem;">દિવ્ય પૂજા કાર્ડ ઈમેજ જનરેટર (AI વગર)</div>
            <div style="font-size: 0.85rem; color: var(--color-text-sub);">પૂજા માટે પવિત્ર હાઈ-રિઝોલ્યુશન બેનર કાર્ડ ૧-ક્લિકમાં બનાવો</div>
          </div>
        </div>
        <span style="font-size: 0.75rem; background: #FEF3C7; color: #92400E; border: 1px solid #F59E0B; padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 700;">
          HTML5 કેનવાસ
        </span>
      </div>

      <!-- Controls Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
        <div>
          <label style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--color-maroon); margin-bottom: 0.25rem;">૧. શૈલી (થીમ)</label>
          <select id="genThemeSelect" class="form-control" style="min-height: 40px; font-size: 0.9rem;">
            <option value="maroon" selected>👑 કંકુ-કેસરી સુવર્ણ દરબાર</option>
            <option value="saffron">🌅 સૂર્યોદય કેસરિયું તેજ</option>
            <option value="sandalwood">🪔 પવિત્ર ચંદન-સુવર્ણ આભા</option>
          </select>
        </div>

        <div>
          <label style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--color-maroon); margin-bottom: 0.25rem;">૨. પવિત્ર પ્રતીક</label>
          <select id="genSymbolSelect" class="form-control" style="min-height: 40px; font-size: 0.9rem;">
            <option value="ॐ" selected>ॐ (પવિત્ર ૐ પ્રતીક)</option>
            <option value="卐">卐 (મંગળ સ્વસ્તિક)</option>
            <option value="🪔">🪔 (દિવ્ય દીપક / દીવો)</option>
            <option value="🛕">🛕 (પવિત્ર મંદિર / કળશ)</option>
          </select>
        </div>

        <div>
          <label style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--color-maroon); margin-bottom: 0.25rem;">૩. કાર્ડ શીર્ષક</label>
          <input type="text" id="genTitleInput" class="form-control" style="min-height: 40px; font-size: 0.9rem;" value="${initialTitle || 'જય શ્રી સત્યનારાયણ દેવ પૂજા'}" placeholder="પૂજાનું નામ">
        </div>
      </div>

      <!-- Live Canvas Preview Box -->
      <div style="position: relative; width: 100%; border-radius: var(--radius-sm); overflow: hidden; border: 2px solid var(--color-border-ornate); box-shadow: 0 4px 14px rgba(0,0,0,0.1); background: #000; margin-bottom: 1rem;">
        <canvas id="sacredCardCanvas" style="width: 100%; height: auto; display: block; aspect-ratio: 3/2;"></canvas>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
        <button type="button" class="btn btn-primary" id="genApplyToFormBtn" style="flex: 2; min-height: 46px; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          <span>✅</span> <span>આ ઈમેજને પૂજાનો મુખ્ય ફોટો બનાવો</span>
        </button>
        <button type="button" class="btn btn-outline" id="genDownloadBtn" style="flex: 1; min-height: 46px; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
          <span>📥</span> <span>ડાઉનલોડ કરો</span>
        </button>
      </div>
    </div>
  `;

  const canvas = containerEl.querySelector('#sacredCardCanvas');
  const generator = new SacredCardGenerator(canvas);

  const themeSelect = containerEl.querySelector('#genThemeSelect');
  const symbolSelect = containerEl.querySelector('#genSymbolSelect');
  const titleInput = containerEl.querySelector('#genTitleInput');
  const applyBtn = containerEl.querySelector('#genApplyToFormBtn');
  const downloadBtn = containerEl.querySelector('#genDownloadBtn');

  function update() {
    generator.setOptions({
      theme: themeSelect.value,
      symbol: symbolSelect.value,
      title: titleInput.value.trim() || 'પવિત્ર પૂજા વિધાન',
      category: initialCategory || 'ધાર્મિક પૂજા'
    });
  }

  themeSelect.addEventListener('change', update);
  symbolSelect.addEventListener('change', update);
  titleInput.addEventListener('input', update);

  // Initial draw
  update();

  // Apply to Form callback
  applyBtn.addEventListener('click', async () => {
    applyBtn.disabled = true;
    const oldText = applyBtn.innerHTML;
    applyBtn.innerHTML = '<span>⏳</span> <span>ફોટો જોડી રહ્યા છીએ...</span>';

    try {
      const dataUrl = generator.toDataURL('image/jpeg', 0.92);
      if (typeof onSetImage === 'function') {
        await onSetImage(dataUrl);
      }
      applyBtn.innerHTML = '<span>✨</span> <span>મુખ્ય ફોટો સફળતાપૂર્વક જોડાયો!</span>';
      setTimeout(() => {
        applyBtn.disabled = false;
        applyBtn.innerHTML = oldText;
      }, 2500);
    } catch (e) {
      console.error(e);
      applyBtn.disabled = false;
      applyBtn.innerHTML = oldText;
    }
  });

  // Download image
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    const safeTitle = (titleInput.value.trim() || 'pooja-card').replace(/\s+/g, '-');
    link.download = `${safeTitle}-card.jpg`;
    link.href = generator.toDataURL('image/jpeg', 0.95);
    link.click();
  });

  return {
    generator,
    setTitle: (newTitle) => {
      if (titleInput) {
        titleInput.value = newTitle;
        update();
      }
    },
    setCategory: (newCategory) => {
      generator.setOptions({ category: newCategory });
    }
  };
}
