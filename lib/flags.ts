// Convert 2-letter country code to flag emoji using regional indicator symbols
function countryFlag(code: string): string {
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  );
}

// Destination name → 2-letter ISO country code
const DEST_CODES: Record<string, string> = {
  // Greece
  'יוון': 'GR', 'greece': 'GR', 'אתונה': 'GR', 'סנטוריני': 'GR', 'כרתים': 'GR', 'מיקונוס': 'GR', 'רודוס': 'GR',
  // Italy
  'איטליה': 'IT', 'italy': 'IT', 'רומא': 'IT', 'מילאנו': 'IT', 'ונציה': 'IT', 'פירנצה': 'IT', 'סיציליה': 'IT', 'סרדיניה': 'IT', 'נאפולי': 'IT', 'אמלפי': 'IT',
  // France
  'צרפת': 'FR', 'france': 'FR', 'פריז': 'FR', 'ניס': 'FR', 'מרסיי': 'FR', 'ליון': 'FR',
  // Spain
  'ספרד': 'ES', 'spain': 'ES', 'ברצלונה': 'ES', 'מדריד': 'ES', 'איביזה': 'ES', 'מיורקה': 'ES', 'מלגה': 'ES', 'טנריף': 'ES',
  // Portugal
  'פורטוגל': 'PT', 'portugal': 'PT', 'ליסבון': 'PT', 'פורטו': 'PT',
  // Turkey
  'תורכיה': 'TR', 'turkey': 'TR', 'איסטנבול': 'TR', 'אנטליה': 'TR', 'בודרום': 'TR', 'קפדוקיה': 'TR',
  // Cyprus
  'קפריסין': 'CY', 'cyprus': 'CY', 'לרנקה': 'CY', 'פאפוס': 'CY', 'איה נאפה': 'CY',
  // Thailand
  'תאילנד': 'TH', 'thailand': 'TH', 'בנגקוק': 'TH', 'פוקט': 'TH', 'קו סמוי': 'TH', "צ'יאנג מאי": 'TH',
  // Japan
  'יפן': 'JP', 'japan': 'JP', 'טוקיו': 'JP', 'קיוטו': 'JP', 'אוסקה': 'JP',
  // India
  'הודו': 'IN', 'india': 'IN', 'גואה': 'IN', 'דלהי': 'IN', 'מומבאי': 'IN',
  // Egypt
  'מצרים': 'EG', 'egypt': 'EG', 'שארם א-שייח': 'EG', 'שארם': 'EG', 'קהיר': 'EG', 'הורגדה': 'EG',
  // Jordan
  'ירדן': 'JO', 'jordan': 'JO', 'עמאן': 'JO', 'פטרה': 'JO',
  // Morocco
  'מרוקו': 'MA', 'morocco': 'MA', 'מרקש': 'MA',
  // UAE
  'דובאי': 'AE', 'אמירויות': 'AE', 'abu dhabi': 'AE', 'אבו דאבי': 'AE', 'uae': 'AE',
  // Maldives
  'מלדיביים': 'MV', 'maldives': 'MV',
  // Seychelles
  'סיישל': 'SC', 'seychelles': 'SC',
  // Mauritius
  'מאוריציוס': 'MU', 'mauritius': 'MU',
  // Tanzania
  'זנזיבר': 'TZ', 'טנזניה': 'TZ', 'tanzania': 'TZ',
  // Kenya
  'קניה': 'KE', 'kenya': 'KE',
  // South Africa
  'דרום אפריקה': 'ZA', 'south africa': 'ZA', 'קייפטאון': 'ZA',
  // USA
  'ארה"ב': 'US', 'ארהב': 'US', 'usa': 'US', 'ניו יורק': 'US', "לוס אנג'לס": 'US', 'מיאמי': 'US', 'לאס וגאס': 'US', 'הוואי': 'US', 'סן פרנסיסקו': 'US', 'אורלנדו': 'US',
  // Canada
  'קנדה': 'CA', 'canada': 'CA', 'טורונטו': 'CA', 'ונקובר': 'CA',
  // Mexico
  'מקסיקו': 'MX', 'mexico': 'MX', 'קנקון': 'MX',
  // Brazil
  'ברזיל': 'BR', 'brazil': 'BR', 'ריו': 'BR',
  // Argentina
  'ארגנטינה': 'AR', 'argentina': 'AR', 'בואנוס איירס': 'AR',
  // Colombia
  'קולומביה': 'CO', 'colombia': 'CO',
  // Peru
  'פרו': 'PE', 'peru': 'PE',
  // Australia
  'אוסטרליה': 'AU', 'australia': 'AU', 'סידני': 'AU', 'מלבורן': 'AU',
  // New Zealand
  'ניו זילנד': 'NZ', 'new zealand': 'NZ',
  // UK
  'אנגליה': 'GB', 'בריטניה': 'GB', 'לונדון': 'GB', 'england': 'GB', 'uk': 'GB',
  // Germany
  'גרמניה': 'DE', 'germany': 'DE', 'ברלין': 'DE', 'מינכן': 'DE',
  // Netherlands
  'הולנד': 'NL', 'netherlands': 'NL', 'אמסטרדם': 'NL',
  // Czech Republic
  "צ'כיה": 'CZ', 'czech': 'CZ', 'פראג': 'CZ',
  // Austria
  'אוסטריה': 'AT', 'austria': 'AT', 'וינה': 'AT',
  // Switzerland
  'שוויץ': 'CH', 'switzerland': 'CH', 'ציריך': 'CH',
  // Croatia
  'קרואטיה': 'HR', 'croatia': 'HR', 'דוברובניק': 'HR',
  // Hungary
  'הונגריה': 'HU', 'hungary': 'HU', 'בודפשט': 'HU',
  // Poland
  'פולין': 'PL', 'poland': 'PL', 'קרקוב': 'PL', 'ורשה': 'PL',
  // Romania
  'רומניה': 'RO', 'romania': 'RO', 'בוקרשט': 'RO',
  // Bulgaria
  'בולגריה': 'BG', 'bulgaria': 'BG',
  // Albania
  'אלבניה': 'AL', 'albania': 'AL',
  // Montenegro
  'מונטנגרו': 'ME', 'montenegro': 'ME',
  // Slovenia
  'סלובניה': 'SI', 'slovenia': 'SI',
  // Norway
  'נורבגיה': 'NO', 'norway': 'NO',
  // Sweden
  'שבדיה': 'SE', 'sweden': 'SE',
  // Finland
  'פינלנד': 'FI', 'finland': 'FI',
  // Denmark
  'דנמרק': 'DK', 'denmark': 'DK', 'קופנהגן': 'DK',
  // Iceland
  'איסלנד': 'IS', 'iceland': 'IS',
  // Sri Lanka
  'סרי לנקה': 'LK', 'sri lanka': 'LK',
  // Vietnam
  'וייטנאם': 'VN', 'vietnam': 'VN',
  // Cambodia
  'קמבודיה': 'KH', 'cambodia': 'KH',
  // Indonesia / Bali
  'באלי': 'ID', 'אינדונזיה': 'ID', 'indonesia': 'ID',
  // Singapore
  'סינגפור': 'SG', 'singapore': 'SG',
  // Malaysia
  'מלזיה': 'MY', 'malaysia': 'MY',
  // Philippines
  'פיליפינים': 'PH', 'philippines': 'PH',
  // China
  'סין': 'CN', 'china': 'CN', "בייג'ינג": 'CN', 'שנגחאי': 'CN',
  // South Korea
  'דרום קוריאה': 'KR', 'korea': 'KR', 'סיאול': 'KR',
  // Jamaica
  "ג'מייקה": 'JM', 'jamaica': 'JM',
  // Cuba
  'קובה': 'CU', 'cuba': 'CU',
  // Dominican Republic
  'דומיניקנה': 'DO', 'dominican': 'DO', 'פונטה קאנה': 'DO',
  // Costa Rica
  'קוסטה ריקה': 'CR', 'costa rica': 'CR',
  // Fiji
  "פיג'י": 'FJ', 'fiji': 'FJ',
  // French Polynesia (Tahiti)
  'טהיטי': 'PF', 'tahiti': 'PF', 'בורה בורה': 'PF',
  // Malta
  'מלטה': 'MT', 'malta': 'MT',
  // Georgia
  "ג'ורג'יה": 'GE', 'georgia': 'GE', 'טביליסי': 'GE', 'באטומי': 'GE',
};

export function getDestFlag(dest?: string): string {
  if (!dest) return '';
  const lower = dest.toLowerCase().trim();
  // Exact match
  if (DEST_CODES[lower]) return countryFlag(DEST_CODES[lower]);
  // Partial match
  for (const [key, code] of Object.entries(DEST_CODES)) {
    if (lower.includes(key) || key.includes(lower)) return countryFlag(code);
  }
  return countryFlag('UN'); // 🇺🇳 globe/unknown
}
