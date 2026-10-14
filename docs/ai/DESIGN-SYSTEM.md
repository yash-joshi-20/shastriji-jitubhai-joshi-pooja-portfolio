# Visual Design System & Standards

## Theme Direction
- **Theme**: Traditional Dharmik Light Theme (પવિત્ર વૈદિક લાઇટ થીમ).
- **Core Mood**: Devotional, sacred, prestigious, warm, trustworthy, easy to read for all age groups.

## Color Tokens
```css
:root {
  /* Brand Dharmik Colors */
  --color-maroon: #8B1E0F;          /* Deep Sacred Maroon / કંકુ લાલ */
  --color-maroon-dark: #671207;
  --color-saffron: #D97706;         /* Sacred Saffron / કેસરી */
  --color-saffron-light: #F59E0B;
  --color-gold: #B45309;            /* Gold Accent / સુવર્ણ */
  --color-turmeric: #FEF3C7;        /* Turmeric / હળદર પીળો */
  --color-cream: #FFFDF7;           /* Warm Sandalwood Cream Background / ચંદન પૃષ્ઠભૂમિ */
  --color-card-bg: #FFFFFF;         /* Pure Card White */
  
  /* Text & Surfaces */
  --color-text-primary: #3B1209;    /* Rich earthy maroon-black */
  --color-text-secondary: #78350F;  /* Warm saffron brown */
  --color-text-muted: #92400E;      /* Muted dharmik tone */
  --color-border: #FDE68A;          /* Delicate gold border */
  --color-border-ornate: #D97706;
  
  /* Status Colors */
  --color-success: #15803D;
  --color-error: #B91C1C;
  --color-whatsapp: #25D366;
  --color-whatsapp-dark: #128C7E;
}
```

## Typography
- **Primary Font**: `'Noto Sans Gujarati', -apple-system, BlinkMacSystemFont, sans-serif`.
- **Headings**: Weights 600, 700 with traditional Indian rhythmic hierarchy.
- **Body**: Weight 400, 500, minimum 16px font size on mobile to ensure readability for senior devotees.
- **Line Height**: 1.6 to allow Gujarati vowel marks (માત્રા, હ્રસ્વ/દીર્ઘ, અનુસ્વાર) ample breathing room without clipping.

## Sacred Ornaments & Borders
- Double-lined borders (`border: 3px double var(--color-maroon)`).
- Golden corner flourishes and auspicious "ॐ" / "શ્રી ગણેશાય નમઃ" medallions.
- Soft radiant golden halo shadow: `box-shadow: 0 10px 25px -5px rgba(217, 119, 6, 0.18), 0 8px 10px -6px rgba(139, 30, 15, 0.1)`.

## Responsive & Touch Rules
- Minimum touch target: 48px × 48px for all buttons and interactive controls.
- Fluid containers with max-width 1200px for desktop, adaptive padding for mobile (16px).
- Zero horizontal scrolling on all viewport sizes (360px to 4K).
