'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tag as TagType } from '@/lib/data';
import { ArrowRight } from 'lucide-react';

const AVAILABLE_TAGS: { value: TagType; label: string }[] = [
  { value: 'honeymoon', label: 'ירח דבש' },
  { value: 'family', label: 'משפחה' },
  { value: 'vip', label: 'VIP' },
  { value: 'kosher', label: 'כשר' },
  { value: 'solo', label: 'יחיד' },
  { value: 'group', label: 'קבוצה' },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-xs tracking-widest uppercase text-muted-600 mb-1"
      style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
    >
      {children}
    </label>
  );
}

function FieldInput({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-transparent border-0 border-b-2 border-black py-2 px-0 text-sm text-black placeholder:text-muted-400 focus:outline-none focus:border-black ${className}`}
      style={{ fontFamily: 'var(--font-source-serif), serif' }}
    />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b-2 border-black pb-2 mb-6">
      <h2
        className="text-lg font-bold"
        style={{ fontFamily: 'var(--font-playfair), serif' }}
      >
        {children}
      </h2>
    </div>
  );
}

export default function NewLeadPage() {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: TagType) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    router.push('/leads');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b-4 border-black">
        <Link
          href="/leads"
          className="flex items-center gap-1 text-xs tracking-widest uppercase border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors duration-100"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          <ArrowRight className="w-3 h-3" />
          חזרה
        </Link>
        <div>
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: 'var(--font-frank-ruhl), serif' }}
          >
            ליד חדש
          </h1>
          <p
            className="text-xs tracking-widest uppercase text-muted-500 mt-1"
            style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
          >
            New Lead · Pacific CRM
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main */}
          <div className="lg:col-span-2 space-y-10">

            {/* Personal Info */}
            <section>
              <SectionTitle>פרטים אישיים</SectionTitle>
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <FieldLabel>שם מלא *</FieldLabel>
                  <FieldInput name="name" placeholder="ישראל ישראלי" required />
                </div>
                <div>
                  <FieldLabel>טלפון *</FieldLabel>
                  <FieldInput name="phone" type="tel" placeholder="050-0000000" className="ltr" required />
                </div>
              </div>
              <div className="mb-6">
                <FieldLabel>אימייל</FieldLabel>
                <FieldInput name="email" type="email" placeholder="email@example.com" className="ltr" />
              </div>

              {/* Source */}
              <div>
                <FieldLabel>מקור ליד</FieldLabel>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: 'facebook', label: 'FACEBOOK' },
                    { value: 'whatsapp', label: 'WHATSAPP' },
                    { value: 'referral', label: 'REFERRAL' },
                    { value: 'website', label: 'WEBSITE' },
                  ].map(src => (
                    <label
                      key={src.value}
                      className="flex items-center gap-2 border border-black px-3 py-2 cursor-pointer text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-100 has-[:checked]:bg-black has-[:checked]:text-white"
                      style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      <input type="radio" name="source" value={src.value} defaultChecked={src.value === 'facebook'} className="sr-only" />
                      {src.label}
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Trip Details */}
            <section>
              <SectionTitle>פרטי הנסיעה</SectionTitle>
              <div className="mb-6">
                <FieldLabel>יעד *</FieldLabel>
                <FieldInput name="destination" placeholder="לדוגמה: יוון - סנטוריני" required />
              </div>
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <FieldLabel>תאריך יציאה *</FieldLabel>
                  <FieldInput name="departure_date" type="date" className="ltr" required />
                </div>
                <div>
                  <FieldLabel>תאריך חזרה *</FieldLabel>
                  <FieldInput name="return_date" type="date" className="ltr" required />
                </div>
              </div>

              {/* Vacation type */}
              <div>
                <FieldLabel>סוג חופשה</FieldLabel>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[
                    { value: 'beach', label: 'BEACH' },
                    { value: 'tours', label: 'TOURS' },
                    { value: 'city', label: 'CITY' },
                    { value: 'adventure', label: 'ADVENTURE' },
                  ].map(type => (
                    <label
                      key={type.value}
                      className="flex items-center gap-2 border border-black px-3 py-2 cursor-pointer text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-100 has-[:checked]:bg-black has-[:checked]:text-white"
                      style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      <input type="radio" name="vacation_type" value={type.value} defaultChecked={type.value === 'beach'} className="sr-only" />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Hotel */}
            <section>
              <SectionTitle>מלון ובסיס לינה</SectionTitle>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <FieldLabel>רמת מלון</FieldLabel>
                  <select
                    name="hotel_level"
                    defaultValue="4"
                    className="w-full bg-transparent border-0 border-b-2 border-black py-2 px-0 text-sm focus:outline-none appearance-none"
                    style={{ fontFamily: 'var(--font-source-serif), serif' }}
                  >
                    <option value="3">3 כוכבים</option>
                    <option value="4">4 כוכבים</option>
                    <option value="5">5 כוכבים</option>
                    <option value="boutique">בוטיק</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>בסיס לינה</FieldLabel>
                  <select
                    name="board_basis"
                    defaultValue="hb"
                    className="w-full bg-transparent border-0 border-b-2 border-black py-2 px-0 text-sm focus:outline-none appearance-none"
                    style={{ fontFamily: 'var(--font-source-serif), serif' }}
                  >
                    <option value="ai">הכל כלול (AI)</option>
                    <option value="hb">חצי פנסיון (HB)</option>
                    <option value="fb">פנסיון מלא (FB)</option>
                    <option value="bb">לינה + ארוחת בוקר (BB)</option>
                    <option value="ro">לינה בלבד (RO)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section>
              <SectionTitle>הערות</SectionTitle>
              <textarea
                name="notes"
                placeholder="הוסף הערות, בקשות מיוחדות, מידע נוסף..."
                className="w-full bg-transparent border-b-2 border-black py-2 px-0 text-sm placeholder:text-muted-400 focus:outline-none resize-none min-h-24"
                style={{ fontFamily: 'var(--font-source-serif), serif' }}
              />
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Composition */}
            <section>
              <SectionTitle>הרכב קבוצה</SectionTitle>
              <div className="space-y-4">
                <div>
                  <FieldLabel>מבוגרים *</FieldLabel>
                  <FieldInput name="adults" type="number" min="1" max="20" defaultValue="2" required />
                </div>
                <div>
                  <FieldLabel>ילדים (2-11)</FieldLabel>
                  <FieldInput name="children" type="number" min="0" max="10" defaultValue="0" />
                </div>
                <div>
                  <FieldLabel>תינוקות (0-1)</FieldLabel>
                  <FieldInput name="infants" type="number" min="0" max="5" defaultValue="0" />
                </div>
              </div>
            </section>

            {/* Budget */}
            <section>
              <SectionTitle>תקציב</SectionTitle>
              <div>
                <FieldLabel>תקציב כולל (₪)</FieldLabel>
                <FieldInput name="budget" type="number" min="0" placeholder="20000" className="ltr" />
              </div>
            </section>

            {/* Preferences */}
            <section>
              <SectionTitle>העדפות</SectionTitle>
              <div className="mb-4">
                <FieldLabel>מקום ישיבה</FieldLabel>
                <select
                  name="seat_preference"
                  className="w-full bg-transparent border-0 border-b-2 border-black py-2 px-0 text-sm focus:outline-none appearance-none"
                  style={{ fontFamily: 'var(--font-source-serif), serif' }}
                >
                  <option value="">בחר...</option>
                  <option value="window">חלון</option>
                  <option value="aisle">מעבר</option>
                  <option value="middle">אמצע</option>
                </select>
              </div>
              <label
                className="flex items-center gap-2 cursor-pointer text-sm"
                style={{ fontFamily: 'var(--font-source-serif), serif' }}
              >
                <input type="checkbox" id="kosher_meal" name="kosher_meal" className="w-4 h-4" />
                ארוחה כשרה
              </label>
            </section>

            {/* Tags */}
            <section>
              <SectionTitle>תגיות</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map(tag => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => toggleTag(tag.value)}
                    className={`text-xs px-3 py-1.5 border tracking-widest uppercase transition-colors duration-100 ${
                      selectedTags.includes(tag.value)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-black hover:bg-black hover:text-white'
                    }`}
                    style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t-4 border-black">
          <Link href="/leads">
            <button
              type="button"
              className="border-2 border-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-100"
              style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
            >
              ביטול
            </button>
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white px-12 py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-black border-2 border-black transition-colors duration-100 disabled:opacity-50"
            style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
          >
            {isSubmitting ? 'SAVING...' : 'שמור ליד'}
          </button>
        </div>
      </form>
    </div>
  );
}
