/**
 * પેમ્ફ્લેટ એક્સપોર્ટ અને વ્હોટ્સએપ શેર મોડ્યુલ
 * html2canvas અને jsPDF દ્વારા ઉચ્ચ ગુણવત્તાવાળા ઈમેજ અને પીડીએફ ડાઉનલોડ
 */

export async function downloadPamphletAsImage(elementId, poojaTitle = "Pooja_Pamphlet") {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("પેમ્ફ્લેટ મળ્યું નથી");
    return;
  }

  const safeFilename = `${poojaTitle.replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_')}_Pamphlet.png`;

  try {
    if (!window.html2canvas) {
      throw new Error("html2canvas લાઇબ્રેરી લોડ થઈ નથી");
    }

    // Scroll to top of element for clean capture
    const canvas = await window.html2canvas(element, {
      scale: 2, // High resolution capture
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFDF7',
      logging: false
    });

    const link = document.createElement('a');
    link.download = safeFilename;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("ઈમેજ ડાઉનલોડ કરવામાં ખામી:", error);
    alert("ફોટો બનાવવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.");
  }
}

export async function downloadPamphletAsPDF(elementId, poojaTitle = "Pooja_Pamphlet") {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("પેમ્ફ્લેટ મળ્યું નથી");
    return;
  }

  const safeFilename = `${poojaTitle.replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_')}_Pamphlet.pdf`;

  try {
    if (!window.html2canvas) {
      throw new Error("html2canvas લાઇબ્રેરી લોડ થઈ નથી");
    }

    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      throw new Error("jsPDF લાઇબ્રેરી લોડ થઈ નથી");
    }

    const canvas = await window.html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFDF7',
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const renderWidth = imgWidth * ratio;
    const renderHeight = imgHeight * ratio;
    const xOffset = (pdfWidth - renderWidth) / 2;
    const yOffset = 10;

    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight);
    pdf.save(safeFilename);
  } catch (error) {
    console.error("PDF ડાઉનલોડ કરવામાં ખામી:", error);
    alert("PDF બનાવવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.");
  }
}

export function shareOnWhatsApp(service, profile) {
  if (!service) return;

  const textLines = [
    `।। શ્રી ગણેશાય નમઃ ।।`,
    `🕉️ *${service.title}* 🕉️`,
    `📌 *વિભાગ:* ${service.category || 'ધાર્મિક વિધિ'}`,
    `💰 *દક્ષિણા/કિંમત:* ${service.price || 'દક્ષિણા માટે સંપર્ક કરો'}`,
    ``,
    `📋 *પૂજાપો / મુખ્ય સામગ્રી:*`,
    `${service.pujapo || 'સામગ્રી માટે શાસ્ત્રીજીનો સંપર્ક કરો.'}`,
    ``,
    service.anajNaivedya ? `🌾 *અનાજ અને નૈવેદ્ય:*\n${service.anajNaivedya}\n` : '',
    service.taiyari ? `🪔 *મૂર્તિ, વાસણ અને ઘરની તૈયારી:*\n${service.taiyari}\n` : '',
    `----------------------------------`,
    `🙏 *શાસ્ત્રીજી:* ${profile.name || 'શાસ્ત્રીજી જીતેન્દ્ર જોષી (જીતુભાઈ જોષી)'}`,
    `📞 *સંપર્ક નંબર:* ${profile.phone || '99252 64929'}`,
    `કર્મકાંડ, ધાર્મિક, સામાજિક તથા વ્રત વિધાન સંબંધિત આવશ્યક માર્ગદર્શન`
  ].filter(Boolean);

  const fullMessage = encodeURIComponent(textLines.join('\n'));
  const whatsappUrl = `https://api.whatsapp.com/send?text=${fullMessage}`;
  window.open(whatsappUrl, '_blank');
}
