'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, Upload, Loader2, Check, User, FileText, ClipboardCheck } from 'lucide-react'
import { authService } from '@/services/auth'
import { toast } from 'sonner'

interface OnboardingData {
  fullName: string
  dob: string
  nationality: string
  profession: string
  bio: string
  country: string
  city: string
  address: string
  identityDocumentUrl: string
  addressDocumentUrl: string
}

const steps = [
  { number: 1, title: 'Personal Info', icon: User },
  { number: 2, title: 'Location', icon: MapPin },
  { number: 3, title: 'Documents', icon: FileText },
  { number: 4, title: 'Review', icon: ClipboardCheck },
]

const initialData: OnboardingData = {
  fullName: '',
  dob: '',
  nationality: '',
  profession: '',
  bio: '',
  country: '',
  city: '',
  address: '',
  identityDocumentUrl: '',
  addressDocumentUrl: '',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [loading, setLoading] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [uploadingIdentity, setUploadingIdentity] = useState(false)
  const [uploadingAddress, setUploadingAddress] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res: any = await authService.getProfile()
        if (res?.status === 'success' && res?.data) {
          const p = res.data
          if (p.onboarding_complete) {
            router.push('/dashboard')
            return
          }
          setData({
            fullName: p.full_name || '',
            dob: p.dob || '',
            nationality: p.nationality || '',
            profession: p.profession || '',
            bio: p.bio || '',
            country: p.country || '',
            city: p.city || '',
            address: p.address || '',
            identityDocumentUrl: p.identity_document_url || '',
            addressDocumentUrl: p.address_document_url || '',
          })
        }
      } catch {
        router.push('/auth/login')
      } finally {
        setProfileLoaded(true)
      }
    }
    fetchProfile()
  }, [router])

  const update = (fields: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...fields }))
  }

  const uploadDocument = async (file: File, type: 'identity' | 'address') => {
    const TOKEN = localStorage.getItem('token')
    if (!TOKEN) {
      toast.error('Session expired. Please login again.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    if (type === 'identity') setUploadingIdentity(true)
    else setUploadingAddress(true)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const res = await fetch(`${baseUrl}/media/upload-document`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData,
      })
      const body = await res.json()
      if (body.status === 'success') {
        if (type === 'identity') update({ identityDocumentUrl: body.url })
        else update({ addressDocumentUrl: body.url })
        toast.success(`${type === 'identity' ? 'Identity' : 'Address'} document uploaded`)
      } else {
        toast.error(body.message || 'Upload failed')
      }
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      if (type === 'identity') setUploadingIdentity(false)
      else setUploadingAddress(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'identity' | 'address') => {
    const file = e.target.files?.[0]
    if (file) uploadDocument(file, type)
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!data.fullName.trim()) { toast.error('Full name is required'); return false }
        if (!data.dob) { toast.error('Date of birth is required'); return false }
        if (!data.nationality) { toast.error('Nationality is required'); return false }
        if (!data.profession) { toast.error('Profession is required'); return false }
        if (!data.bio.trim()) { toast.error('Short bio is required'); return false }
        if (data.bio.length > 300) { toast.error('Bio must be 300 characters or less'); return false }
        return true
      case 2:
        if (!data.address) { toast.error('Full address is required'); return false }
        if (!data.country) { toast.error('Country is required'); return false }
        if (!data.city) { toast.error('City is required'); return false }
        return true
      case 3:
        if (!data.identityDocumentUrl) { toast.error('Proof of identity is required'); return false }
        if (!data.addressDocumentUrl) { toast.error('Proof of address is required'); return false }
        return true
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) return

    if (currentStep === 1) {
      try {
        await authService.updateProfile({
          fullName: data.fullName,
          dob: data.dob,
          nationality: data.nationality,
          profession: data.profession,
          bio: data.bio,
        })
      } catch { /* silent */ }
    }

    if (currentStep === 2) {
      try {
        await authService.updateProfile({
          country: data.country,
          city: data.city,
          address: data.address,
        })
      } catch { /* silent */ }
    }

    if (currentStep === 4) {
      setLoading(true)
      try {
        await authService.updateProfile({
          onboarding_complete: true,
        })
        toast.success('Onboarding complete!')
        router.push('/dashboard')
      } catch {
        toast.error('Failed to complete onboarding')
        setLoading(false)
      }
      return
    }

    setCurrentStep(s => s + 1)
  }

  if (!profileLoaded) {
    return (
      <div className="min-h-screen bg-zed-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zed-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zed-background">
      <div className="container-zed py-12 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="flex items-center gap-3 justify-center">
              <Image src="/logo-icon.png" alt="ZedIdeaArena" width={36} height={36} className="object-contain" />
              <span className="font-bold text-xl gradient-text">ZedIdeaArena</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-zed-foreground mb-2">Complete Your Profile</h1>
          <p className="text-zed-foreground-secondary">Set up your account before entering the Arena</p>
        </div>

        <div className="flex items-center justify-between mb-10 px-2">
          {steps.map((s, idx) => {
            const Icon = s.icon
            const isActive = currentStep >= s.number
            const isDone = currentStep > s.number
            return (
              <div key={idx} className="flex flex-col items-center gap-2 relative flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 text-sm font-black ${
                  isActive ? 'bg-zed-primary text-white shadow-lg shadow-zed-primary/30' : 'bg-white/5 text-zed-foreground-secondary'
                }`}>
                  {isDone ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest text-center ${isActive ? 'text-zed-primary' : 'text-zed-foreground-secondary'}`}>
                  {s.title}
                </span>
                {idx < steps.length - 1 && (
                  <div className={`absolute top-5 left-[60%] w-[80%] h-[1px] ${currentStep > s.number ? 'bg-zed-primary' : 'bg-white/10'}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="card-zed glass-premium p-8 min-h-[400px]">
          {currentStep === 1 && (
            <div className="space-y-6 animate-zed-fade-up">
              <h2 className="text-xl font-black text-zed-foreground mb-6">Personal Information</h2>
              <div>
                <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">Full Name</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={e => update({ fullName: e.target.value })}
                  className="input-zed"
                  placeholder="As it appears on your ID"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">Date of Birth</label>
                  <input type="date" value={data.dob} onChange={e => update({ dob: e.target.value })} className="input-zed" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">Nationality</label>
                  <select value={data.nationality} onChange={e => update({ nationality: e.target.value })} className="input-zed">
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
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">Profession</label>
                  <select value={data.profession} onChange={e => update({ profession: e.target.value })} className="input-zed">
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
                <div />
              </div>
              <div>
                <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">
                  Short Bio <span className="text-zed-foreground-secondary/50">({data.bio.length}/300)</span>
                </label>
                <textarea
                  value={data.bio}
                  onChange={e => update({ bio: e.target.value })}
                  maxLength={300}
                  rows={3}
                  className="input-zed"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-zed-fade-up">
              <h2 className="text-xl font-black text-zed-foreground mb-6">Your Location</h2>
              <p className="text-sm text-zed-foreground-secondary mb-4">
                Enter your full address below. Your location helps us connect you with local innovation communities.
              </p>
              <div>
                <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">Full Address</label>
                <input
                  type="text"
                  value={data.address}
                  onChange={e => update({ address: e.target.value })}
                  className="input-zed"
                  placeholder="e.g. 123 Independence Ave, Lusaka"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">City / Town</label>
                  <input
                    type="text"
                    value={data.city}
                    onChange={e => update({ city: e.target.value })}
                    className="input-zed"
                    placeholder="e.g. Lusaka"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">Country</label>
                  <select value={data.country} onChange={e => update({ country: e.target.value })} className="input-zed">
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
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-zed-fade-up">
              <h2 className="text-xl font-black text-zed-foreground mb-6">Document Upload</h2>
              <p className="text-sm text-zed-foreground-secondary mb-4">
                Upload clear images or PDFs of your documents. Max 10MB per file.
              </p>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <label className="text-xs font-black text-zed-foreground uppercase tracking-widest block mb-4">Proof of Identity</label>
                <p className="text-[10px] text-zed-foreground-secondary mb-4">Passport or National ID (JPEG, PNG, PDF)</p>
                {data.identityDocumentUrl ? (
                  <div className="flex items-center gap-3 p-4 bg-zed-success/10 rounded-2xl border border-zed-success/20">
                    <Check size={20} className="text-zed-success" />
                    <span className="text-sm font-bold text-zed-foreground">Identity document uploaded</span>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-zed-primary/30 transition-colors">
                    {uploadingIdentity ? (
                      <Loader2 size={24} className="animate-spin text-zed-primary" />
                    ) : (
                      <Upload size={24} className="text-zed-foreground-secondary" />
                    )}
                    <span className="text-xs font-bold text-zed-foreground-secondary">
                      {uploadingIdentity ? 'Uploading...' : 'Click to upload'}
                    </span>
                    <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => handleFileChange(e, 'identity')} className="hidden" disabled={uploadingIdentity} />
                  </label>
                )}
              </div>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <label className="text-xs font-black text-zed-foreground uppercase tracking-widest block mb-4">Proof of Address</label>
                <p className="text-[10px] text-zed-foreground-secondary mb-4">Utility bill or bank statement (JPEG, PNG, PDF)</p>
                {data.addressDocumentUrl ? (
                  <div className="flex items-center gap-3 p-4 bg-zed-success/10 rounded-2xl border border-zed-success/20">
                    <Check size={20} className="text-zed-success" />
                    <span className="text-sm font-bold text-zed-foreground">Address document uploaded</span>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-zed-primary/30 transition-colors">
                    {uploadingAddress ? (
                      <Loader2 size={24} className="animate-spin text-zed-primary" />
                    ) : (
                      <Upload size={24} className="text-zed-foreground-secondary" />
                    )}
                    <span className="text-xs font-bold text-zed-foreground-secondary">
                      {uploadingAddress ? 'Uploading...' : 'Click to upload'}
                    </span>
                    <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => handleFileChange(e, 'address')} className="hidden" disabled={uploadingAddress} />
                  </label>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-zed-fade-up">
              <h2 className="text-xl font-black text-zed-foreground mb-2">Review & Submit</h2>
              <p className="text-sm text-zed-foreground-secondary mb-6">Please confirm all information is accurate before submitting.</p>

              <div className="p-6 bg-zed-primary/5 rounded-3xl border border-zed-primary/20 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Full Name</p>
                    <p className="font-bold text-zed-foreground">{data.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Date of Birth</p>
                    <p className="font-bold text-zed-foreground">{data.dob}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Nationality</p>
                    <p className="font-bold text-zed-foreground">{data.nationality}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Profession</p>
                    <p className="font-bold text-zed-foreground">{data.profession}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Bio</p>
                  <p className="text-sm text-zed-foreground-secondary">{data.bio}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Full Address</p>
                  <p className="font-bold text-zed-foreground">{data.address}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Country</p>
                    <p className="font-bold text-zed-foreground">{data.country}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">City</p>
                    <p className="font-bold text-zed-foreground">{data.city}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Identity Document</p>
                  <p className="font-bold text-zed-success flex items-center gap-2">
                    <Check size={14} /> Uploaded
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Address Document</p>
                  <p className="font-bold text-zed-success flex items-center gap-2">
                    <Check size={14} /> Uploaded
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-4 bg-white/5 rounded-2xl border border-white/10">
                <input type="checkbox" id="confirmCheck" className="mt-1" />
                <span className="text-xs font-bold text-zed-foreground">
                  I confirm that all information provided above is accurate and complete.
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between gap-4">
          <button
            type="button"
            onClick={() => setCurrentStep(s => s - 1)}
            disabled={currentStep === 1 || loading}
            className="btn-secondary px-8 h-14 flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-20"
          >
            <ChevronLeft size={18} /> Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="btn-primary px-10 h-14 flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : currentStep === 4 ? (
              <>Submit <Check size={18} /></>
            ) : (
              <>Continue <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
