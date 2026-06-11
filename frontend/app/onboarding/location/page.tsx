'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2, MapPin, Home, Globe, Info } from 'lucide-react'
import { authService } from '@/services/auth'
import { toast } from 'sonner'

const ALL_COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czechia',
  "Côte d'Ivoire","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
  'Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
  'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
  'Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar',
  'Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria',
  'Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
]

export default function LocationPage() {
  const router = useRouter()
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [country, setCountry] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = () => {
    if (!city.trim()) { toast.error('City is required'); return false }
    if (!province.trim()) { toast.error('Province / State is required'); return false }
    if (!country.trim()) { toast.error('Country is required'); return false }
    if (!address.trim()) { toast.error('Street address is required'); return false }
    return true
  }

  const handleContinue = async () => {
    if (!validate()) return
    setSaving(true)
    setError(null)
    try {
      const res: any = await authService.updateProfile({
        city: city.trim(),
        province: province.trim(),
        country: country.trim(),
        address: address.trim(),
        onboarding_step: 2,
      })
      if (res?.status !== 'success') throw new Error(res?.error || 'Failed to save')
      router.push('/onboarding/documents')
    } catch (err: any) {
      const msg = err?.message || err?.error_description || 'Failed to save. Please try again.'
      toast.error(msg)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-zed-fade-up">
      <h2 className="text-xl font-black text-zed-foreground mb-2">Your Location</h2>
      <p className="text-sm text-zed-foreground-secondary -mt-4">
        Your location helps us connect you with local innovation communities and verify your identity for prize payouts.
      </p>

      <div className="p-4 rounded-2xl border border-zed-primary/10 flex items-start gap-3" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.06),rgba(34,211,238,0.03))' }}>
        <Info size={16} className="text-zed-accent mt-0.5 flex-shrink-0" />
        <p className="text-xs text-zed-foreground-secondary leading-relaxed">
          Your city and country are shown on your public profile. Your street address is kept private and only used for verification purposes.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-1">City / Town</label>
          <p className="text-[10px] text-zed-foreground-secondary/50 mb-2">Where you currently reside.</p>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={18} />
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="input-zed pl-10"
              placeholder="e.g. Lusaka"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-1">Province / State</label>
          <p className="text-[10px] text-zed-foreground-secondary/50 mb-2">Region within your country.</p>
          <input
            type="text"
            value={province}
            onChange={e => setProvince(e.target.value)}
            className="input-zed"
            placeholder="e.g. Lusaka Province"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-1">Country</label>
        <p className="text-[10px] text-zed-foreground-secondary/50 mb-2">Your country of residence.</p>
        <div className="relative">
          <Globe className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={18} />
          <select value={country} onChange={e => setCountry(e.target.value)} className="input-zed pl-10">
            <option value="">Select country</option>
            {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-1">Street Address</label>
        <p className="text-[10px] text-zed-foreground-secondary/50 mb-2">For identity verification and prize delivery. Never shared publicly.</p>
        <div className="relative">
          <Home className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={18} />
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="input-zed pl-10"
            placeholder="e.g. 123 Freedom Way, Unit 5"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-600 border-2 border-red-400 rounded-2xl shadow-lg shadow-red-600/30">
          <p className="text-sm font-bold text-white">{error}</p>
        </div>
      )}

      <div className="flex justify-between gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.push('/onboarding/personal')}
          className="btn-secondary px-8 h-14 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={saving}
          className="btn-primary px-10 h-14 flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 size={18} className="animate-spin" /> Saving...</>
          ) : (
            <>Continue <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  )
}
