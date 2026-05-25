'use client'

import { ChevronRight, ChevronLeft, Upload, Loader2, User, Lightbulb, Video, ShieldCheck, CreditCard, Trophy, CheckCircle } from 'lucide-react'
import { useState, useEffect, useRef, Suspense } from 'react'
import { ideaService } from '@/services/idea'
import { mediaService } from '@/services/core'
import { authService } from '@/services/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import api from '@/lib/api'

interface FormState {
  fullName: string; dob: string; nationality: string; bio: string; profession: string;
  title: string; competition_id: string;
  problem: string; solution: string; industry: string; business_model: string;
  pitch_video_url: string; github_url: string; linkedin_url: string; instagram_url: string;
  guidelinesAccepted: boolean; termsAccepted: boolean;
}

const steps = [
  { number: 1, title: 'Identity', icon: User },
  { number: 2, title: 'Concept', icon: Lightbulb },
  { number: 3, title: 'Pitch', icon: Video },
  { number: 4, title: 'Guidelines', icon: ShieldCheck },
  { number: 5, title: 'Commit', icon: CreditCard },
]

const FORM_KEY = 'idea_submission_form'

function NewIdeaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  const getInitialForm = (): FormState => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(FORM_KEY)
      if (saved) {
        try { return JSON.parse(saved) } catch {}
      }
    }
    return {
      fullName: '', dob: '', nationality: '', bio: '', profession: '',
      title: '', competition_id: searchParams.get('competitionId') || '',
      problem: '', solution: '', industry: '', business_model: '',
      pitch_video_url: '', github_url: '', linkedin_url: '', instagram_url: '',
      guidelinesAccepted: false, termsAccepted: false,
    }
  }

  const [formData, setFormData] = useState<FormState>(getInitialForm)

  useEffect(() => {
    sessionStorage.setItem(FORM_KEY, JSON.stringify(formData))
  }, [formData])

  const [competitions, setCompetitions] = useState<any[]>([])

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [compsRes, profileRes] = await Promise.all([
          api.get('/competitions'),
          authService.getProfile()
        ])
        const allComps = compsRes.data || []
        setCompetitions(allComps.filter((c: any) => c.calculatedStatus === 'active'))
        const p = profileRes.data
        setProfile(p)
        if (p) {
          setFormData(prev => ({
            ...prev,
            fullName: p.full_name || p.fullName || '',
            dob: p.dob || '',
            nationality: p.nationality || '',
            bio: p.bio || '',
            profession: p.profession || ''
          }))
        }
        const compId = searchParams.get('competitionId')
        if (compId) {
          try {
            const { paid } = await api.get(`/payments/check-entry/${compId}`) as any
            setHasPaidEntry(paid === true)
          } catch { /* silent */ }
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err)
      }
    }
    fetchInitial()
    setHasMounted(true)
  }, [])

  const [uploading, setUploading] = useState(false)
  const [hasPaidEntry, setHasPaidEntry] = useState(false)

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const response: any = await mediaService.uploadFile(file)
      if (response.status === 'success') {
        setFormData(prev => ({ ...prev, pitch_video_url: response.url }))
        toast.success('Video uploaded!')
      }
    } catch {
      toast.error('Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToEnd(true)
    }
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.fullName) {
        toast.error('Full name is required.')
        return
      }
      try {
        await authService.updateProfile({
          fullName: formData.fullName,
          dob: formData.dob,
          nationality: formData.nationality,
          bio: formData.bio,
          profession: formData.profession
        })
      } catch {
        // silent
      }
    }

    if (currentStep === 2) {
      if (!formData.title || !formData.competition_id) {
        toast.error('Idea title and competition are required.')
        return
      }
      if (!formData.problem || !formData.solution) {
        toast.error('Problem and solution are required.')
        return
      }
    }

    if (currentStep === 4 && !hasScrolledToEnd) {
      toast.error('Please scroll to the end of the guidelines to continue.')
      return
    }

    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/auth/login')
      return
    }

    if (!hasPaidEntry && formData.competition_id) {
      try {
        const res: any = await api.post(`/competitions/${formData.competition_id}/enter`)
        if (res.checkoutUrl) {
          sessionStorage.removeItem(FORM_KEY)
          window.location.href = res.checkoutUrl
          return
        }
      } catch {
        // fall through to default flow
      }
    }

    setIsSubmitting(true)
    try {
      const res: any = await ideaService.createIdea({
        ...formData,
        competition_id: formData.competition_id || undefined,
      })
      sessionStorage.removeItem(FORM_KEY)
      setIsSuccess(true)
      toast.success('Idea submitted!')
      if (!hasPaidEntry && formData.competition_id) {
        setTimeout(() => router.push(`/dashboard/payment?type=contestant&competitionId=${formData.competition_id}`), 2500)
      } else {
        setTimeout(() => router.push(`/dashboard/ideas/${res.id}`), 2500)
      }
    } catch (err: any) {
      toast.error(err.message || 'Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container-zed py-8">
      {profile?.current_mode === 'voter' ? (
        <div className="max-w-2xl mx-auto mt-24 text-center card-zed glass-premium p-12 border-white/5">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 floating border border-red-500/30">
            <ShieldCheck size={48} className="text-red-500" />
          </div>
          <h1 className="text-4xl font-black text-zed-foreground mb-4">Role Restricted</h1>
          <p className="text-zed-foreground-secondary mb-8">
            Your current role is set to <strong>Voter</strong>. Only <strong>Contestants</strong> can submit new ideas to the Arena.
          </p>
          <button
            onClick={() => router.push('/dashboard/settings')}
            className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2"
          >
            Switch Role in Settings <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        <>
          <div className="mb-12">
            <h1 className="text-4xl font-black text-zed-foreground mb-2">Competition Entry</h1>
            <p className="text-zed-foreground-secondary uppercase tracking-widest text-[10px] font-bold">Step {currentStep} of 5: {steps[currentStep-1].title}</p>
          </div>

          <div className="flex items-center justify-between mb-12 max-w-3xl mx-auto px-4">
            {steps.map((s, idx) => {
              const Icon = s.icon
              const isActive = currentStep >= s.number
              return (
                <div key={idx} className="flex flex-col items-center gap-3 relative flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 ${
                    isActive ? 'bg-zed-primary text-white shadow-lg shadow-zed-primary/30' : 'bg-white/5 text-zed-foreground-secondary'
                  }`}>
                    <Icon size={24} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-zed-primary' : 'text-zed-foreground-secondary'}`}>
                    {s.title}
                  </span>
                  {idx < steps.length - 1 && (
                    <div className={`absolute top-6 left-1/2 w-full h-[1px] -z-0 ${currentStep > s.number ? 'bg-zed-primary' : 'bg-white/10'}`} />
                  )}
                </div>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto pb-24">
            <div className="card-zed glass-premium p-10 min-h-[500px] border-white/5 relative overflow-hidden">
              {currentStep === 1 && (
                <div className="space-y-8 animate-zed-fade-up">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Full Name</label>
                      <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="input-zed" placeholder="As it appears on ID" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="input-zed" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Nationality</label>
                      <select name="nationality" value={formData.nationality} onChange={handleInputChange} className="input-zed">
                        <option value="">Select Nationality</option>
                        <option value="Zambia">Zambia</option>
                        <option value="Zimbabwe">Zimbabwe</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Profession</label>
                      <select name="profession" value={formData.profession} onChange={handleInputChange} className="input-zed">
                        <option value="">Select Profession</option>
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
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Who am I? (Bio)</label>
                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className="input-zed" placeholder="Tell the judges about yourself..." />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8 animate-zed-fade-up">
                  <div>
                    <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Idea Title</label>
                    <input name="title" value={formData.title} onChange={handleInputChange} className="input-zed text-lg font-bold" placeholder="Vision name" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Competition Arena</label>
                      <select name="competition_id" value={formData.competition_id} onChange={handleInputChange} className="input-zed">
                        <option value="">Select Target</option>
                        {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Target Industry</label>
                      <select name="industry" value={formData.industry} onChange={handleInputChange} className="input-zed">
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Fintech">Fintech</option>
                        <option value="Agritech">Agritech</option>
                        <option value="Education">Education</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">The Problem</label>
                    <textarea name="problem" value={formData.problem} onChange={handleInputChange} rows={3} className="input-zed" placeholder="What pain point are you solving?" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">The Solution</label>
                    <textarea name="solution" value={formData.solution} onChange={handleInputChange} rows={4} className="input-zed" placeholder="Describe your vision clearly..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Business Model</label>
                    <textarea name="business_model" value={formData.business_model} onChange={handleInputChange} rows={2} className="input-zed" placeholder="How will this create value?" />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-12 animate-zed-fade-up">
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Video Pitch (2-5 mins)</label>
                      <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center relative group overflow-hidden">
                        {formData.pitch_video_url ? (
                          <video src={formData.pitch_video_url} controls className="w-full h-full" />
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-zed-primary/20 rounded-2xl flex items-center justify-center text-zed-primary">
                              {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                            </div>
                            <span className="text-[10px] font-black uppercase">Upload Video</span>
                            <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideoUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Links</label>
                      <div className="space-y-4">
                        <input name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} placeholder="LinkedIn URL" className="input-zed h-12 text-sm" />
                        <input name="github_url" value={formData.github_url} onChange={handleInputChange} placeholder="GitHub Repo" className="input-zed h-12 text-sm" />
                        <input name="instagram_url" value={formData.instagram_url} onChange={handleInputChange} placeholder="Instagram URL" className="input-zed h-12 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8 animate-zed-fade-up">
                  <div ref={scrollRef} onScroll={handleScroll} className="p-10 bg-black/20 rounded-3xl border border-white/5 max-h-96 overflow-y-auto custom-scrollbar">
                    <h3 className="text-2xl font-black mb-8">Video Pitch Guidelines</h3>
                    <div className="space-y-6 text-zed-foreground-secondary leading-relaxed">
                      <p className="font-bold text-white">To maintain a standard, please ensure your video follows these points:</p>
                      <ul className="space-y-4">
                        <li className="flex gap-4"><div className="w-6 h-6 rounded-full bg-zed-primary/20 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-zed-primary">1</div><span>Clean professional background with adequate lighting.</span></li>
                        <li className="flex gap-4"><div className="w-6 h-6 rounded-full bg-zed-primary/20 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-zed-primary">2</div><span>Crystal clear audio (minimal background noise).</span></li>
                        <li className="flex gap-4"><div className="w-6 h-6 rounded-full bg-zed-primary/20 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-zed-primary">3</div><span>Start by introducing yourself and your background.</span></li>
                        <li className="flex gap-4"><div className="w-6 h-6 rounded-full bg-zed-primary/20 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-zed-primary">4</div><span>Explain your problem and solution clearly without heavy editing.</span></li>
                        <li className="flex gap-4"><div className="w-6 h-6 rounded-full bg-zed-primary/20 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-zed-primary">5</div><span>Keep the duration between 2 to 5 minutes total.</span></li>
                      </ul>
                    </div>
                    {!hasScrolledToEnd && <div className="mt-8 text-center text-[10px] font-black uppercase text-zed-primary animate-bounce">Scroll to read all</div>}
                  </div>
                  <label className="flex items-center gap-4 cursor-pointer p-6 bg-zed-primary/5 rounded-2xl border border-zed-primary/20">
                    <input type="checkbox" name="guidelinesAccepted" checked={formData.guidelinesAccepted} onChange={handleInputChange} className="w-5 h-5 rounded border-white/10" disabled={!hasScrolledToEnd} />
                    <span className="text-xs font-black uppercase tracking-widest text-zed-foreground">I confirm I have read and followed the competition rules</span>
                  </label>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-12 animate-zed-fade-up">
                  <div className="p-10 bg-zed-primary/5 rounded-3xl border border-zed-primary/20 relative overflow-hidden">
                    <Trophy className="absolute -right-12 -top-12 text-zed-primary opacity-10" size={160} />
                    <div className="relative z-10">
                      <h3 className="text-3xl font-black mb-8">Review & Submit</h3>
                      <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <div><p className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary mb-1">Competition</p><p className="text-lg font-bold">{competitions.find(c => c.id === formData.competition_id)?.title || 'N/A'}</p></div>
                          <div><p className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary mb-1">Submission Title</p><p className="text-lg font-bold">{formData.title}</p></div>
                          <div><p className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary mb-1">Industry</p><p className="text-lg font-bold">{formData.industry || 'Not specified'}</p></div>
                        </div>
                        <div className="space-y-6">
                          <div className="p-8 bg-black/20 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary mb-4">Entry Fee</p>
                            {hasPaidEntry ? (
                              <div className="flex items-center gap-2 text-zed-success"><CheckCircle size={24} /><span className="text-lg font-black">Fee Paid</span></div>
                            ) : (
                              <><p className="text-5xl font-black text-white">${(() => { const c = competitions.find(x => x.id === formData.competition_id); return c ? (c.entry_fee_cents / 100).toFixed(2) : '5.00' })()}</p><p className="text-[10px] text-zed-foreground-secondary mt-2">Non-refundable competition fee</p></>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-4 cursor-pointer">
                    <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange} className="w-5 h-5 rounded border-white/10" />
                    <span className="text-xs font-black uppercase tracking-widest text-zed-foreground-secondary">I confirm all data provided is accurate and authentic.</span>
                  </label>
                </div>
              )}

              {isSuccess && (
                <div className="absolute inset-0 bg-zed-background z-50 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 bg-zed-success/20 rounded-full flex items-center justify-center mb-8"><ShieldCheck size={64} className="text-zed-success" /></div>
                  <h2 className="text-4xl font-black mb-4">Vision Submitted!</h2>
                  <p className="text-zed-foreground-secondary max-w-sm mb-12">Your entry into the Arena has been recorded. Redirecting to payment...</p>
                  <Loader2 className="animate-spin text-zed-primary" size={32} />
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between gap-6">
              <button type="button" onClick={handlePrev} disabled={currentStep === 1 || isSubmitting} className="btn-secondary px-10 h-16 flex items-center gap-3 text-xs font-black uppercase tracking-widest disabled:opacity-20">
                <ChevronLeft size={20} /> Back
              </button>
              {currentStep < 5 ? (
                <button type="button" onClick={handleNext} className="btn-primary px-16 h-16 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                  Continue <ChevronRight size={20} />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting || !formData.termsAccepted} className="btn-primary px-16 h-16 flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-2xl shadow-zed-primary/40">
                  {isSubmitting ? 'Processing...' : 'Submit Entry'} <CreditCard size={20} />
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default function NewIdeaPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-zed-background"><Loader2 className="animate-spin text-zed-primary" /></div>}>
      <NewIdeaForm />
    </Suspense>
  )
}
