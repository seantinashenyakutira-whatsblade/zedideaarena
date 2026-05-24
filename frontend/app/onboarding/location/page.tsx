'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2, MapPin } from 'lucide-react'
import { authService } from '@/services/auth'
import { toast } from 'sonner'

export default function LocationPage() {
  const router = useRouter()
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = () => {
    if (!city.trim()) { toast.error('City is required'); return false }
    if (!country.trim()) { toast.error('Country is required'); return false }
    return true
  }

  const handleContinue = async () => {
    if (!validate()) return
    setSaving(true)
    setError(null)
    try {
      const res: any = await authService.updateProfile({
        city: city.trim(),
        country: country.trim(),
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
      <p className="text-sm text-zed-foreground-secondary mb-4">
        Enter your location below. Your location helps us connect you with local innovation communities.
      </p>

      <div>
        <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">City / Town</label>
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
        <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">Country</label>
        <select value={country} onChange={e => setCountry(e.target.value)} className="input-zed">
          <option value="">Select country</option>
          <option value="Zambia">Zambia</option>
          <option value="Zimbabwe">Zimbabwe</option>
          <option value="South Africa">South Africa</option>
          <option value="Nigeria">Nigeria</option>
          <option value="Kenya">Kenya</option>
          <option value="Tanzania">Tanzania</option>
          <option value="Ghana">Ghana</option>
          <option value="Ethiopia">Ethiopia</option>
          <option value="Other">Other</option>
        </select>
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
