export type LeadStatus = 'lead' | 'proposal_sent' | 'paid' | 'flying' | 'returned';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  lead: 'ליד',
  proposal_sent: 'הצעה נשלחה',
  paid: 'שולם',
  flying: 'טס',
  returned: 'חזר',
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  lead: 'bg-gray-100 text-gray-800 border-gray-200',
  proposal_sent: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  flying: 'bg-purple-100 text-purple-800 border-purple-200',
  returned: 'bg-orange-100 text-orange-800 border-orange-200',
};

export const LEAD_STATUS_BG: Record<LeadStatus, string> = {
  lead: 'bg-gray-50 border-gray-200',
  proposal_sent: 'bg-blue-50 border-blue-200',
  paid: 'bg-green-50 border-green-200',
  flying: 'bg-purple-50 border-purple-200',
  returned: 'bg-orange-50 border-orange-200',
};

export type VacationType = 'beach' | 'tours' | 'city' | 'adventure';
export type BoardBasis = 'ai' | 'hb' | 'bb' | 'ro' | 'fb';
export type HotelLevel = '3' | '4' | '5' | 'boutique';
export type Tag = 'honeymoon' | 'family' | 'vip' | 'kosher' | 'solo' | 'group';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  departure_date: string;
  return_date: string;
  hotel_level: HotelLevel;
  board_basis: BoardBasis;
  adults: number;
  children: number;
  infants: number;
  budget: number;
  vacation_type: VacationType;
  destination: string;
  source: 'facebook' | 'whatsapp' | 'referral' | 'website';
  tags: Tag[];
  notes: string;
  created_at: string;
  agent_id: string;
  // Payment
  deposit_amount?: number;
  deposit_paid?: boolean;
  balance_amount?: number;
  balance_due_date?: string;
  total_price?: number;
  commission?: number;
  // Preferences
  seat_preference?: 'window' | 'aisle' | 'middle';
  kosher_meal?: boolean;
  hotel_preference?: string;
}

export interface Document {
  id: string;
  lead_id: string;
  type: 'passport' | 'visa' | 'ticket' | 'voucher' | 'contract' | 'other';
  name: string;
  expiry_date?: string;
  url: string;
  uploaded_at: string;
}

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'דוד כהן',
    email: 'david@example.com',
    phone: '050-1234567',
    status: 'lead',
    departure_date: '2024-07-15',
    return_date: '2024-07-25',
    hotel_level: '5',
    board_basis: 'hb',
    adults: 2,
    children: 1,
    infants: 0,
    budget: 20000,
    vacation_type: 'beach',
    destination: 'יוון - סנטוריני',
    source: 'facebook',
    tags: ['family'],
    notes: 'מעוניין בחדר עם נוף לים',
    created_at: '2024-01-10T10:00:00Z',
    agent_id: 'agent1',
    seat_preference: 'window',
    kosher_meal: false,
  },
  {
    id: '2',
    name: 'שרה לוי',
    email: 'sarah@example.com',
    phone: '052-9876543',
    status: 'proposal_sent',
    departure_date: '2024-08-01',
    return_date: '2024-08-14',
    hotel_level: '4',
    board_basis: 'ai',
    adults: 2,
    children: 0,
    infants: 0,
    budget: 25000,
    vacation_type: 'beach',
    destination: 'מלדיביים',
    source: 'whatsapp',
    tags: ['honeymoon', 'vip'],
    notes: 'זוג טרי נשוי, יש להכין הפתעות',
    created_at: '2024-01-12T14:30:00Z',
    agent_id: 'agent1',
    total_price: 28000,
    commission: 2800,
    deposit_amount: 5000,
    deposit_paid: true,
    balance_amount: 23000,
    balance_due_date: '2024-06-01',
    seat_preference: 'aisle',
    kosher_meal: false,
  },
  {
    id: '3',
    name: 'יוסף אברהם',
    email: 'yosef@example.com',
    phone: '054-5551234',
    status: 'paid',
    departure_date: '2024-06-20',
    return_date: '2024-06-30',
    hotel_level: '5',
    board_basis: 'hb',
    adults: 4,
    children: 2,
    infants: 0,
    budget: 50000,
    vacation_type: 'tours',
    destination: 'איטליה - רומא ופירנצה',
    source: 'referral',
    tags: ['family', 'kosher'],
    notes: 'דורש מלון כשר מוסמך',
    created_at: '2024-01-08T09:00:00Z',
    agent_id: 'agent1',
    total_price: 52000,
    commission: 5200,
    deposit_amount: 15000,
    deposit_paid: true,
    balance_amount: 37000,
    balance_due_date: '2024-05-01',
    kosher_meal: true,
    hotel_preference: 'כשר בלבד',
  },
  {
    id: '4',
    name: 'מיכל גולדברג',
    email: 'michal@example.com',
    phone: '053-7778889',
    status: 'flying',
    departure_date: '2024-01-20',
    return_date: '2024-01-30',
    hotel_level: '4',
    board_basis: 'bb',
    adults: 2,
    children: 0,
    infants: 0,
    budget: 18000,
    vacation_type: 'city',
    destination: 'ניו יורק',
    source: 'facebook',
    tags: ['vip'],
    notes: 'לקוחה קבועה, VIP',
    created_at: '2023-12-20T11:00:00Z',
    agent_id: 'agent1',
    total_price: 20000,
    commission: 2000,
    deposit_paid: true,
  },
  {
    id: '5',
    name: 'אבי רוזנברג',
    email: 'avi@example.com',
    phone: '050-3334445',
    status: 'returned',
    departure_date: '2024-01-05',
    return_date: '2024-01-15',
    hotel_level: '3',
    board_basis: 'hb',
    adults: 2,
    children: 3,
    infants: 1,
    budget: 30000,
    vacation_type: 'beach',
    destination: 'תורכיה - אנטליה',
    source: 'whatsapp',
    tags: ['family'],
    notes: 'חזרו מהחופשה, ממליצים לחברים',
    created_at: '2023-12-01T08:00:00Z',
    agent_id: 'agent1',
    total_price: 32000,
    commission: 3200,
    deposit_paid: true,
  },
  {
    id: '6',
    name: 'רחל שמעון',
    email: 'rachel@example.com',
    phone: '052-1112223',
    status: 'lead',
    departure_date: '2024-09-10',
    return_date: '2024-09-20',
    hotel_level: '4',
    board_basis: 'hb',
    adults: 2,
    children: 2,
    infants: 0,
    budget: 22000,
    vacation_type: 'beach',
    destination: 'ספרד - ברצלונה',
    source: 'facebook',
    tags: ['family'],
    notes: '',
    created_at: '2024-01-15T16:00:00Z',
    agent_id: 'agent1',
  },
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'd1',
    lead_id: '3',
    type: 'passport',
    name: 'דרכון - יוסף אברהם',
    expiry_date: '2028-05-15',
    url: '#',
    uploaded_at: '2024-01-09T10:00:00Z',
  },
  {
    id: 'd2',
    lead_id: '3',
    type: 'ticket',
    name: 'כרטיס טיסה - TA2024-003',
    url: '#',
    uploaded_at: '2024-01-10T12:00:00Z',
  },
  {
    id: 'd3',
    lead_id: '3',
    type: 'voucher',
    name: 'וואוצ\'ר מלון רומא',
    url: '#',
    uploaded_at: '2024-01-11T09:00:00Z',
  },
];

export const WHATSAPP_TEMPLATES: Record<LeadStatus, { title: string; message: string }[]> = {
  lead: [
    {
      title: 'ברכת שלום ראשונית',
      message: 'שלום {name}! 🌴 תודה על פנייתך ל-Pacific Travel. אשמח לעזור לך לתכנן את החופשה המושלמת. מתי תוכל לדבר כמה דקות?',
    },
    {
      title: 'בקשת פרטים נוספים',
      message: 'שלום {name}! כדי להכין לך הצעה מותאמת אישית, אשמח לדעת: לאיזה יעד חשבת? ומה התקציב המשוער שלך?',
    },
  ],
  proposal_sent: [
    {
      title: 'שליחת הצעה',
      message: 'שלום {name}! 📋 שלחתי לך כרגע הצעת מחיר מפורטת לחופשה ב{destination}. אשמח לענות על כל שאלה!',
    },
    {
      title: 'מעקב אחר הצעה',
      message: 'שלום {name}! רציתי לבדוק אם קיבלת את ההצעה ואם יש לך שאלות. ההצעה בתוקף עד סוף השבוע 😊',
    },
  ],
  paid: [
    {
      title: 'אישור תשלום',
      message: 'שלום {name}! ✅ אישרתי את התשלום שלך. החופשה ב{destination} מאושרת! אשלח לך את כל המסמכים בקרוב.',
    },
    {
      title: 'מסמכי נסיעה',
      message: 'שלום {name}! 📄 המסמכים שלך מוכנים! ✈️ כרטיסי טיסה, וואוצ\'ר מלון ומדריך יעד - הכל מחכה לך.',
    },
  ],
  flying: [
    {
      title: 'תזכורת לפני טיסה',
      message: 'שלום {name}! ✈️ עוד יומיים אתם טסים ל{destination}! תזכורת: הגעה לשדה תעופה 3 שעות לפני. נסיעה טובה!',
    },
    {
      title: 'צ\'ק-אין מקוון',
      message: 'שלום {name}! 📱 הצ\'ק-אין המקוון פתוח! אל תשכחו לסמן מקומות ישיבה. צריכים עזרה? אני פה!',
    },
  ],
  returned: [
    {
      title: 'ברכת שובם',
      message: 'שלום {name}! 🏠 ברוכים השבים! מקווה שנהניתם בחופשה ב{destination}. אשמח לשמוע הכל!',
    },
    {
      title: 'בקשת משוב',
      message: 'שלום {name}! 🌟 האם תוכלו לדרג את החופשה שלכם? הדירוג שלכם עוזר לנו לשפר ולהמליץ לחברים. תודה!',
    },
  ],
};

export const HOTEL_LEVEL_LABELS: Record<HotelLevel, string> = {
  '3': '3 כוכבים',
  '4': '4 כוכבים',
  '5': '5 כוכבים',
  'boutique': 'בוטיק',
};

export const BOARD_BASIS_LABELS: Record<BoardBasis, string> = {
  ai: 'הכל כלול',
  hb: 'חצי פנסיון',
  fb: 'פנסיון מלא',
  bb: 'לינה וארוחת בוקר',
  ro: 'לינה בלבד',
};

export const VACATION_TYPE_LABELS: Record<VacationType, string> = {
  beach: 'חוף ים',
  tours: 'טיולים',
  city: 'עיר',
  adventure: 'הרפתקאות',
};

export const SOURCE_LABELS = {
  facebook: 'פייסבוק',
  whatsapp: 'ווטסאפ',
  referral: 'המלצה',
  website: 'אתר',
};
