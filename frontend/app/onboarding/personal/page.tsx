'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Loader2 } from 'lucide-react'
import { authService } from '@/services/auth'
import { toast } from 'sonner'

export default function PersonalPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [nationality, setNationality] = useState('')
  const [profession, setProfession] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = () => {
    if (!fullName.trim()) { toast.error('Full name is required'); return false }
    if (!dob) { toast.error('Date of birth is required'); return false }
    if (!nationality) { toast.error('Nationality is required'); return false }
    if (!profession) { toast.error('Profession is required'); return false }
    if (!bio.trim()) { toast.error('Short bio is required'); return false }
    if (bio.length > 300) { toast.error('Bio must be 300 characters or less'); return false }
    return true
  }

  const handleContinue = async () => {
    if (!validate()) return
    setSaving(true)
    setError(null)
    try {
      const res: any = await authService.updateProfile({
        fullName,
        dob,
        nationality,
        profession,
        bio,
        onboarding_step: 1,
      })
      if (res?.status !== 'success') throw new Error(res?.error || 'Failed to save')
      router.push('/onboarding/location')
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
      <h2 className="text-xl font-black text-zed-foreground mb-6">Personal Information</h2>

      <div>
        <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className="input-zed"
          placeholder="As it appears on your ID"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">Date of Birth</label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="input-zed" />
        </div>
        <div>
          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">Nationality</label>
          <select value={nationality} onChange={e => setNationality(e.target.value)} className="input-zed">
            <option value="">Select nationality</option>
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
      </div>

      <div>
        <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">Profession</label>
        <select value={profession} onChange={e => setProfession(e.target.value)} className="input-zed">
          <option value="">Select profession</option>
          <option value="Student">Student</option>
          <option value="Entrepreneur">Entrepreneur</option>
          <option value="Software Engineer">Software Engineer</option>
          <option value="Data Scientist">Data Scientist</option>
          <option value="Product Manager">Product Manager</option>
          <option value="Artist">Artist</option>
          <option value="Researcher">Researcher</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">
          Short Bio <span className="text-zed-foreground-secondary/50">({bio.length}/300)</span>
        </label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          maxLength={300}
          rows={3}
          className="input-zed"
          placeholder="Tell us a bit about yourself..."
        />
      </div>

      {error && (
        <div className="p-4 bg-red-600 border-2 border-red-400 rounded-2xl shadow-lg shadow-red-600/30">
          <p className="text-sm font-bold text-white">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
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
