'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, User, Plane, Hotel, DollarSign, Tag, Facebook, MessageCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Tag as TagType, Lead } from '@/lib/data';
import { getLead, updateLead } from '@/lib/leads';

const AVAILABLE_TAGS: { value: TagType; label: string; emoji: string }[] = [
  { value: 'honeymoon', label: 'ירח דבש', emoji: '💑' },
  { value: 'family', label: 'משפחה', emoji: '👨‍👩‍👧' },
  { value: 'vip', label: 'VIP', emoji: '⭐' },
  { value: 'kosher', label: 'כשר', emoji: '✡️' },
  { value: 'solo', label: 'יחיד', emoji: '🧳' },
  { value: 'group', label: 'קבוצה', emoji: '👥' },
];

export default function EditLeadClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state (controlled)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('facebook');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [vacationType, setVacationType] = useState('beach');
  const [hotelLevel, setHotelLevel] = useState('4');
  const [boardBasis, setBoardBasis] = useState('hb');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [budget, setBudget] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositPaid, setDepositPaid] = useState(false);
  const [commission, setCommission] = useState(0);
  const [seatPreference, setSeatPreference] = useState('');
  const [kosherMeal, setKosherMeal] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);

  useEffect(() => {
    getLead(id).then(lead => {
      if (!lead) return;
      setLead(lead);
      setName(lead.name || '');
      setPhone(lead.phone || '');
      setEmail(lead.email || '');
      setSource(lead.source || 'facebook');
      setDestination(lead.destination || '');
      setDepartureDate(lead.departure_date?.slice(0, 10) || '');
      setReturnDate(lead.return_date?.slice(0, 10) || '');
      setVacationType(lead.vacation_type || 'beach');
      setHotelLevel(lead.hotel_level || '4');
      setBoardBasis(lead.board_basis || 'hb');
      setAdults(lead.adults || 2);
      setChildren(lead.children || 0);
      setInfants(lead.infants || 0);
      setBudget(lead.budget || 0);
      setTotalPrice(lead.total_price || 0);
      setDepositAmount(lead.deposit_amount || 0);
      setDepositPaid(lead.deposit_paid || false);
      setCommission(lead.commission || 0);
      setSeatPreference(lead.seat_preference || '');
      setKosherMeal(lead.kosher_meal || false);
      setNotes(lead.notes || '');
      setSelectedTags((lead.tags || []) as TagType[]);
      setLoading(false);
    });
  }, [id]);

  const toggleTag = (tag: TagType) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const updated = await updateLead(id, {
      name, phone, email,
      source: source as Lead['source'],
      destination,
      departure_date: departureDate,
      return_date: returnDate,
      vacation_type: vacationType as Lead['vacation_type'],
      hotel_level: hotelLevel as Lead['hotel_level'],
      board_basis: boardBasis as Lead['board_basis'],
      adults, children, infants,
      budget, total_price: totalPrice,
      deposit_amount: depositAmount,
      deposit_paid: depositPaid,
      commission,
      seat_preference: seatPreference as Lead['seat_preference'] || undefined,
      kosher_meal: kosherMeal,
      notes,
      tags: selectedTags,
    });

    if (updated) {
      router.push(`/leads/detail?id=${id}`);
    } else {
      setError('שגיאה בשמירת הליד. נסה שוב.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">ליד לא נמצא</p>
        <Link href="/leads"><Button className="mt-4">חזרה ללידים</Button></Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/leads/detail?id=${id}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">עריכת ליד — {lead.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">עדכן את פרטי הליד</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">

            {/* Personal Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />פרטים אישיים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">שם מלא *</Label>
                    <Input className="mt-1.5" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">טלפון *</Label>
                    <Input className="mt-1.5 ltr" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">אימייל</Label>
                  <Input className="mt-1.5 ltr" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm font-medium">מקור ליד</Label>
                  <div className="mt-1.5 flex gap-2 flex-wrap">
                    {[
                      { value: 'facebook', label: 'פייסבוק', icon: <Facebook className="w-4 h-4 text-blue-600" /> },
                      { value: 'whatsapp', label: 'ווטסאפ', icon: <MessageCircle className="w-4 h-4 text-green-600" /> },
                      { value: 'referral', label: 'המלצה', icon: null },
                      { value: 'website', label: 'אתר', icon: null },
                    ].map(s => (
                      <label key={s.value} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer transition-colors ${source === s.value ? 'bg-blue-50 border-blue-400' : 'hover:bg-slate-50'}`}>
                        <input type="radio" name="source" value={s.value} checked={source === s.value} onChange={() => setSource(s.value)} className="accent-blue-600" />
                        {s.icon}
                        <span className="text-sm">{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip Details */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-600" />פרטי הנסיעה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">יעד</Label>
                  <Input className="mt-1.5" value={destination} onChange={e => setDestination(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">תאריך יציאה</Label>
                    <Input className="mt-1.5 ltr" type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">תאריך חזרה</Label>
                    <Input className="mt-1.5 ltr" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
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
                      <label key={type.value} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer transition-colors ${vacationType === type.value ? 'bg-blue-50 border-blue-400' : 'hover:bg-slate-50'}`}>
                        <input type="radio" name="vacation_type" value={type.value} checked={vacationType === type.value} onChange={() => setVacationType(type.value)} className="accent-blue-600" />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotel */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-blue-600" />מלון ובסיס לינה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">רמת מלון</Label>
                    <Select value={hotelLevel} onValueChange={setHotelLevel}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
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
                    <Select value={boardBasis} onValueChange={setBoardBasis}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
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

            {/* Payments */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />תשלומים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">מחיר כולל (₪)</Label>
                    <Input className="mt-1.5 ltr" type="number" min={0} value={totalPrice || ''} onChange={e => setTotalPrice(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">תקציב לקוח (₪)</Label>
                    <Input className="mt-1.5 ltr" type="number" min={0} value={budget || ''} onChange={e => setBudget(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">סכום מקדמה (₪)</Label>
                    <Input className="mt-1.5 ltr" type="number" min={0} value={depositAmount || ''} onChange={e => setDepositAmount(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">עמלה (₪)</Label>
                    <Input className="mt-1.5 ltr" type="number" min={0} value={commission || ''} onChange={e => setCommission(Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="deposit_paid" checked={depositPaid} onChange={e => setDepositPaid(e.target.checked)} className="w-4 h-4 accent-green-600" />
                  <Label htmlFor="deposit_paid" className="text-sm cursor-pointer">מקדמה שולמה</Label>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">הערות</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea className="min-h-24 resize-none" value={notes} onChange={e => setNotes(e.target.value)} placeholder="הוסף הערות, בקשות מיוחדות..." />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Group */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">הרכב קבוצה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">מבוגרים</Label>
                  <Input className="mt-1.5" type="number" min={1} max={20} value={adults} onChange={e => setAdults(Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-sm font-medium">ילדים (2-11)</Label>
                  <Input className="mt-1.5" type="number" min={0} max={10} value={children} onChange={e => setChildren(Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-sm font-medium">תינוקות (0-1)</Label>
                  <Input className="mt-1.5" type="number" min={0} max={5} value={infants} onChange={e => setInfants(Number(e.target.value))} />
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
                  <Select value={seatPreference} onValueChange={setSeatPreference}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="בחר..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="window">חלון</SelectItem>
                      <SelectItem value="aisle">מעבר</SelectItem>
                      <SelectItem value="middle">אמצע</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="kosher" checked={kosherMeal} onChange={e => setKosherMeal(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                  <Label htmlFor="kosher" className="text-sm cursor-pointer">ארוחה כשרה</Label>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-600" />תגיות
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

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 mt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href={`/leads/detail?id=${id}`}>
            <Button variant="outline" type="button" className="w-full sm:w-auto">ביטול</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />שומר...</> : 'שמור שינויים'}
          </Button>
        </div>
      </form>
    </div>
  );
}
