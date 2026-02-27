'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { ArrowRight, User, Plane, Hotel, DollarSign, Tag, Facebook, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Tag as TagType } from '@/lib/data';

const AVAILABLE_TAGS: { value: TagType; label: string; emoji: string }[] = [
  { value: 'honeymoon', label: 'ירח דבש', emoji: '💑' },
  { value: 'family', label: 'משפחה', emoji: '👨‍👩‍👧' },
  { value: 'vip', label: 'VIP', emoji: '⭐' },
  { value: 'kosher', label: 'כשר', emoji: '✡️' },
  { value: 'solo', label: 'יחיד', emoji: '🧳' },
  { value: 'group', label: 'קבוצה', emoji: '👥' },
];

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
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    router.push('/leads');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/leads">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ליד חדש</h1>
          <p className="text-slate-500 text-sm mt-0.5">הוסף ליד חדש למשפך המכירות</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  פרטים אישיים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">שם מלא *</Label>
                    <Input id="name" name="name" placeholder="ישראל ישראלי" className="mt-1.5" required />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">טלפון *</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="050-0000000" className="mt-1.5 ltr" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">אימייל</Label>
                  <Input id="email" name="email" type="email" placeholder="email@example.com" className="mt-1.5 ltr" />
                </div>

                {/* Lead Source */}
                <div>
                  <Label className="text-sm font-medium">מקור ליד</Label>
                  <div className="mt-1.5 flex gap-2">
                    <label className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                      <input type="radio" name="source" value="facebook" defaultChecked className="accent-blue-600" />
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">פייסבוק</span>
                    </label>
                    <label className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors has-[:checked]:bg-green-50 has-[:checked]:border-green-400">
                      <input type="radio" name="source" value="whatsapp" className="accent-green-600" />
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">ווטסאפ</span>
                    </label>
                    <label className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors has-[:checked]:bg-purple-50 has-[:checked]:border-purple-400">
                      <input type="radio" name="source" value="referral" className="accent-purple-600" />
                      <span className="text-sm">המלצה</span>
                    </label>
                    <label className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors has-[:checked]:bg-orange-50 has-[:checked]:border-orange-400">
                      <input type="radio" name="source" value="website" className="accent-orange-600" />
                      <span className="text-sm">אתר</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip Details */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-600" />
                  פרטי הנסיעה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="destination" className="text-sm font-medium">יעד *</Label>
                  <Input id="destination" name="destination" placeholder="לדוג': יוון - סנטוריני" className="mt-1.5" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departure_date" className="text-sm font-medium">תאריך יציאה *</Label>
                    <Input id="departure_date" name="departure_date" type="date" className="mt-1.5 ltr" required />
                  </div>
                  <div>
                    <Label htmlFor="return_date" className="text-sm font-medium">תאריך חזרה *</Label>
                    <Input id="return_date" name="return_date" type="date" className="mt-1.5 ltr" required />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">סוג חופשה</Label>
                  <div className="mt-1.5 flex gap-2 flex-wrap">
                    {[
                      { value: 'beach', label: '🏖️ חוף ים' },
                      { value: 'tours', label: '🗺️ טיולים' },
                      { value: 'city', label: '🏙️ עיר' },
                      { value: 'adventure', label: '🧗 הרפתקאות' },
                    ].map(type => (
                      <label key={type.value} className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                        <input type="radio" name="vacation_type" value={type.value} className="accent-blue-600" defaultChecked={type.value === 'beach'} />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotel & Board */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-blue-600" />
                  מלון ובסיס לינה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">רמת מלון</Label>
                    <Select name="hotel_level" defaultValue="4">
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 כוכבים</SelectItem>
                        <SelectItem value="4">4 כוכבים</SelectItem>
                        <SelectItem value="5">5 כוכבים</SelectItem>
                        <SelectItem value="boutique">בוטיק</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">בסיס לינה</Label>
                    <Select name="board_basis" defaultValue="hb">
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai">הכל כלול (AI)</SelectItem>
                        <SelectItem value="hb">חצי פנסיון (HB)</SelectItem>
                        <SelectItem value="fb">פנסיון מלא (FB)</SelectItem>
                        <SelectItem value="bb">לינה + ארוחת בוקר (BB)</SelectItem>
                        <SelectItem value="ro">לינה בלבד (RO)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Group Composition */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">הרכב קבוצה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="adults" className="text-sm font-medium">מבוגרים *</Label>
                  <Input id="adults" name="adults" type="number" min="1" max="20" defaultValue="2" className="mt-1.5" required />
                </div>
                <div>
                  <Label htmlFor="children" className="text-sm font-medium">ילדים (2-11)</Label>
                  <Input id="children" name="children" type="number" min="0" max="10" defaultValue="0" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="infants" className="text-sm font-medium">תינוקות (0-1)</Label>
                  <Input id="infants" name="infants" type="number" min="0" max="5" defaultValue="0" className="mt-1.5" />
                </div>
              </CardContent>
            </Card>

            {/* Budget */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  תקציב משוער
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="budget" className="text-sm font-medium">תקציב כולל (₪)</Label>
                  <Input id="budget" name="budget" type="number" min="0" placeholder="20000" className="mt-1.5 ltr" />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">העדפות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">מקום ישיבה</Label>
                  <Select name="seat_preference">
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="בחר..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="window">חלון</SelectItem>
                      <SelectItem value="aisle">מעבר</SelectItem>
                      <SelectItem value="middle">אמצע</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="kosher_meal" name="kosher_meal" className="w-4 h-4 accent-blue-600" />
                  <Label htmlFor="kosher_meal" className="text-sm cursor-pointer">ארוחה כשרה</Label>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-600" />
                  תגיות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map(tag => (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => toggleTag(tag.value)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-all ${
                        selectedTags.includes(tag.value)
                          ? 'bg-blue-100 border-blue-400 text-blue-700 font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{tag.emoji}</span>
                      <span>{tag.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notes */}
        <Card className="border-0 shadow-sm mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">הערות</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="notes"
              placeholder="הוסף הערות, בקשות מיוחדות, מידע נוסף..."
              className="min-h-24 resize-none"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <Link href="/leads">
            <Button variant="outline" type="button">ביטול</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="px-8">
            {isSubmitting ? 'שומר...' : 'שמור ליד'}
          </Button>
        </div>
      </form>
    </div>
  );
}
