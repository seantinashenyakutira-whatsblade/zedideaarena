'use client'

import { ChevronRight, ChevronLeft, Loader2, User, Lightbulb, Video, ShieldCheck, CreditCard, Trophy, CheckCircle, Save, AlertCircle, Github, Linkedin, Instagram, DollarSign } from 'lucide-react'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { ideaService } from '@/services/idea'
import { authService, getToken } from '@/services/auth'
import PitchVideoGuide from '@/components/pitch/PitchVideoGuide'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import api from '@/lib/api'
import RichTextEditor from '@/components/ui/RichTextEditor'

interface FormState {
  fullName: string; dob: string; nationality: string; bio: string; profession: string;
  title: string; competition_id: string;
  problem: string; solution: string; industry: string; business_model: string;
  pitch_video_url: string; github_url: string; linkedin_url: string; instagram_url: string;
  collaborators: string;
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
const DRAFT_KEY = 'idea_draft_'

function NewIdeaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isPaidIdea, setIsPaidIdea] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const draftSaveTimeout = useRef<NodeJS.Timeout | null>(null)

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
      collaborators: '',
      guidelinesAccepted: false, termsAccepted: false,
    }
  }

  const [formData, setFormData] = useState<FormState>(getInitialForm)

  // Debounced auto-save draft
  const saveDraft = useCallback(async () => {
    if (!profile?.id) return
    if (!formData.title && !formData.problem && !formData.solution) return

    setIsSavingDraft(true)
    try {
      const collaboratorsArray = formData.collaborators
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const res: any = await ideaService.saveDraft({
        ...formData,
        collaborators: collaboratorsArray,
        competition_id: formData.competition_id || undefined,
        ...(draftId && { id: draftId }),
      })
      if (res?.id) {
        setDraftId(res.id)
        sessionStorage.setItem(DRAFT_KEY + profile.id, res.id)
      }
      toast.success('Draft saved', { duration: 1500 })
    } catch (err: any) {
      console.error('Draft save failed:', err)
    } finally {
      setIsSavingDraft(false)
    }
  }, [formData, profile?.id, draftId])

  useEffect(() => {
    sessionStorage.setItem(FORM_KEY, JSON.stringify(formData))

    // Debounced auto-save draft every 30 seconds while editing
    if (draftSaveTimeout.current) clearTimeout(draftSaveTimeout.current)
    const timeout = setTimeout(() => {
      saveDraft()
    }, 30000)
    draftSaveTimeout.current = timeout

    return () => {
      if (draftSaveTimeout.current) clearTimeout(draftSaveTimeout.current)
    }
  }, [formData, saveDraft])

  const [competitions, setCompetitions] = useState<any[]>([])

  // Load existing draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      if (!profile?.id) return
      try {
        const ideasRes = await ideaService.getUserIdeas()
        const ideas = ideasRes.data || []
        const urlDraftId = searchParams.get('draftId')
        const storedDraftId = sessionStorage.getItem(DRAFT_KEY + profile.id)
        const draftIdToLoad = urlDraftId || storedDraftId
        let targetDraft = null
        if (draftIdToLoad) {
          targetDraft = ideas.find((i: any) => i.id === draftIdToLoad && i.status !== 'approved')
        }
        if (!targetDraft) {
          const drafts = ideas.filter((i: any) => i.status === 'draft')
          targetDraft = drafts[0]
        }
        if (targetDraft) {
          setDraftId(targetDraft.id)
          setIsEditMode(targetDraft.status !== 'draft' && targetDraft.status !== 'approved')
          setIsPaidIdea(targetDraft.payment_status === 'paid')
          sessionStorage.setItem(DRAFT_KEY + profile.id, targetDraft.id)
          setFormData(prev => ({
            ...prev,
            title: targetDraft.title || '',
            competition_id: targetDraft.competition_id || '',
            problem: targetDraft.problem || targetDraft.problem_statement || '',
            solution: targetDraft.solution || targetDraft.description || '',
            industry: targetDraft.industry || targetDraft.category || '',
            business_model: targetDraft.business_model || '',
            pitch_video_url: targetDraft.pitch_video_url || targetDraft.video_url || '',
            github_url: targetDraft.github_url || '',
            linkedin_url: targetDraft.linkedin_url || '',
            instagram_url: targetDraft.instagram_url || '',
            collaborators: targetDraft.collaborators?.join?.('\n') || (Array.isArray(targetDraft.collaborators) ? targetDraft.collaborators.map((c: any) => typeof c === 'string' ? c : c.name || '').join('\n') : ''),
          }))
          if (targetDraft.competition_id) {
            setCurrentStep(2)
          }
        }
      } catch {}
    }
    loadDraft()
  }, [profile?.id])

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
        const editDraftId = searchParams.get('draftId')
        if (editDraftId) {
          try {
            const { paid } = await api.get(`/payments/check-entry/${compId || ''}?ideaId=${editDraftId}`) as any
            if (paid) setIsPaidIdea(true)
          } catch { /* silent */ }
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err)
      }
    }
    fetchInitial()
    setHasMounted(true)
  }, [])

  const [hasPaidEntry, setHasPaidEntry] = useState(false)

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
      const plainProblem = formData.problem.replace(/<[^>]*>/g, '').trim()
      const plainSolution = formData.solution.replace(/<[^>]*>/g, '').trim()
      if (plainProblem.length < 20) {
        toast.error('Problem must be at least 20 characters (after removing formatting).')
        return
      }
      if (plainSolution.length < 20) {
        toast.error('Solution must be at least 20 characters (after removing formatting).')
        return
      }
      // Save draft when moving past concept step
      await saveDraft()
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

  const handleSaveDraft = async () => {
    await saveDraft()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = getToken()
    if (!token) {
      router.push('/auth/login')
      return
    }

    setIsSubmitting(true)
    try {
      const collaboratorsArray = formData.collaborators
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      // First save as draft (or update existing draft)
      let ideaId = draftId
      if (!ideaId) {
        const draftRes: any = await ideaService.saveDraft({
          ...formData,
          collaborators: collaboratorsArray,
          competition_id: formData.competition_id || undefined,
        })
        ideaId = draftRes.id
      } else {
        await ideaService.saveDraft({
          ...formData,
          collaborators: collaboratorsArray,
          competition_id: formData.competition_id || undefined,
          id: ideaId,
        })
      }

      if (!ideaId) {
        console.error('No idea ID available for submission');
        return;
      }

      if (isEditMode) {
        setIsSyncing(true)
        await new Promise(r => setTimeout(r, 800))
        setIsSyncing(false)
        toast.success('Changes saved')
        router.push(`/dashboard/ideas/${ideaId}`)
        return
      }

      // Submit the idea
      await ideaService.submitIdea(ideaId)
      sessionStorage.removeItem(FORM_KEY)

      const competitionName = competitions.find(c => c.id === formData.competition_id)?.title || ''

      if (!hasPaidEntry && formData.competition_id) {
        const payRes: any = await api.post(`/competitions/${formData.competition_id}/enter`, { ideaId: ideaId })
        if (payRes.checkoutUrl) {
          window.location.href = payRes.checkoutUrl
          return
        }
      }

      setIsSuccess(true)
      const params = new URLSearchParams({ title: formData.title, competition: competitionName })
      if (ideaId) params.append('id', ideaId)
      router.replace(`/dashboard/ideas/success?${params}`)
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
                          <h1 className="text-4xl font-black text-zed-foreground mb-2">{isEditMode ? 'Edit Idea' : 'Competition Entry'}</h1>
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
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Idea Title</label>
                      <input name="title" value={formData.title} onChange={handleInputChange} className="input-zed text-lg font-bold" placeholder="Vision name" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Competition Arena</label>
                      <select name="competition_id" value={formData.competition_id} onChange={handleInputChange} className="input-zed">
                        <option value="">Select Target</option>
                        {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Target Industry</label>
                      <select name="industry" value={formData.industry} onChange={handleInputChange} className="input-zed">
                        <option value="">Select Industry</option>
                        <optgroup label="Financial &amp; Business Services">
                          <option value="Fintech &amp; Financial Services">Fintech &amp; Financial Services</option>
                          <option value="Insurtech">Insurtech</option>
                          <option value="LegalTech &amp; Compliance">LegalTech &amp; Compliance</option>
                        </optgroup>
                        <optgroup label="Technology &amp; Data">
                          <option value="Enterprise/SaaS">Enterprise / SaaS</option>
                          <option value="AI, ML &amp; Data">AI, ML &amp; Data</option>
                          <option value="Cybersecurity">Cybersecurity</option>
                          <option value="Developer Tools &amp; Infrastructure">Developer Tools &amp; Infrastructure</option>
                          <option value="Hardware &amp; IoT">Hardware &amp; IoT</option>
                        </optgroup>
                        <optgroup label="Climate, Energy &amp; Agriculture">
                          <option value="Cleantech &amp; Renewable Energy">Cleantech &amp; Renewable Energy</option>
                          <option value="Agritech &amp; Food Systems">Agritech &amp; Food Systems</option>
                          <option value="Climate &amp; Sustainability">Climate &amp; Sustainability</option>
                        </optgroup>
                        <optgroup label="Health, Education &amp; Social">
                          <option value="Healthtech &amp; MedTech">Healthtech &amp; MedTech</option>
                          <option value="EdTech &amp; Workforce Development">EdTech &amp; Workforce Development</option>
                          <option value="Social Impact &amp; Public Sector">Social Impact &amp; Public Sector</option>
                        </optgroup>
                        <optgroup label="Commerce, Media &amp; Lifestyle">
                          <option value="E-commerce &amp; Retail">E-commerce &amp; Retail</option>
                          <option value="Media, Content &amp; Creator Economy">Media, Content &amp; Creator Economy</option>
                          <option value="Entertainment &amp; Gaming">Entertainment &amp; Gaming</option>
                          <option value="Travel, Hospitality &amp; Tourism">Travel, Hospitality &amp; Tourism</option>
                        </optgroup>
                        <optgroup label="Infrastructure &amp; Industrial">
                          <option value="Mobility, Logistics &amp; Transport">Mobility, Logistics &amp; Transport</option>
                          <option value="Real Estate &amp; PropTech">Real Estate &amp; PropTech</option>
                          <option value="Construction &amp; ConTech">Construction &amp; ConTech</option>
                          <option value="Manufacturing &amp; Industrial">Manufacturing &amp; Industrial</option>
                        </optgroup>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Business Model</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 z-10">
                          <DollarSign size={16} />
                        </div>
                        <select name="business_model" value={formData.business_model} onChange={handleInputChange} className="input-zed pl-10">
                          <option value="">Select Business Model</option>
                          <option value="Subscription">Subscription — Recurring revenue (monthly/yearly)</option>
                          <option value="One-Time Payment">One-Time Payment — Single purchase, lifetime access</option>
                          <option value="Selling Products">Selling Products — Physical or digital goods</option>
                          <option value="Freemium">Freemium — Free tier + paid premium features</option>
                          <option value="Marketplace">Marketplace — Commission on transactions</option>
                          <option value="Advertising">Advertising — Ad-based revenue model</option>
                          <option value="Affiliate">Affiliate — Commission on referrals</option>
                          <option value="Licensing">Licensing — IP/technology licensing fees</option>
                          <option value="Donations">Donations / Crowdfunding — Community-funded</option>
                          <option value="Pay-per-Use">Pay-per-Use — Usage-based billing</option>
                          <option value="Other">Other — Hybrid / custom model</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">The Problem</label>
                      <span className="text-[9px] text-amber-400/60 font-medium">Use the toolbar to format your pitch</span>
                    </div>
                    <RichTextEditor
                      value={formData.problem}
                      onChange={(html) => setFormData(prev => ({ ...prev, problem: html }))}
                      placeholder="What pain point are you solving? Be specific — judges love real-world data..."
                      maxLength={5000}
                      minLength={20}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Our Solution</label>
                      <span className="text-[9px] text-amber-400/60 font-medium">Explain your vision clearly</span>
                    </div>
                    <RichTextEditor
                      value={formData.solution}
                      onChange={(html) => setFormData(prev => ({ ...prev, solution: html }))}
                      placeholder="Describe your vision clearly — how does it solve the problem? What makes it unique?..."
                      maxLength={5000}
                      minLength={20}
                    />
                  </div>
                </div>
              )}

               {currentStep === 3 && (
                <div className="space-y-12 animate-zed-fade-up">
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <PitchVideoGuide
                        value={formData.pitch_video_url}
                        onChange={(url) => setFormData(prev => ({ ...prev, pitch_video_url: url }))}
                      />
                    </div>
                       <div className="space-y-6">
                           <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Links</label>
                           <div className="space-y-4">
                             <div className="relative">
                               <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                                 <Linkedin size={18} className="text-[#0A66C2]" />
                               </div>
                               <input name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} placeholder="LinkedIn URL" className="input-zed h-12 text-sm pl-11" />
                             </div>
                             <div className="relative">
                               <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                                 <Github size={18} className="text-white" />
                               </div>
                               <input name="github_url" value={formData.github_url} onChange={handleInputChange} placeholder="GitHub Repo" className="input-zed h-12 text-sm pl-11" />
                             </div>
                             <div className="relative">
                               <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                                 <Instagram size={18} className="text-[#E4405F]" />
                               </div>
                               <input name="instagram_url" value={formData.instagram_url} onChange={handleInputChange} placeholder="Instagram URL" className="input-zed h-12 text-sm pl-11" />
                             </div>
                           </div>
                        </div>
                        <div className="space-y-6">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Collaborators</label>
                          <textarea
                            name="collaborators"
                            value={formData.collaborators}
                            onChange={handleInputChange}
                            rows={2}
                            className="input-zed text-sm"
                            placeholder="Add team members — one name/email per line"
                          />
                          <p className="text-[9px] text-zed-foreground-secondary">List any co-creators on this idea (optional)</p>
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
                            {(hasPaidEntry || isPaidIdea) ? (
                              <div className="flex items-center gap-2 text-zed-success"><CheckCircle size={24} /><span className="text-lg font-black">Fee Paid</span></div>
                            ) : (
                              <><p className="text-5xl font-black text-white">${(() => { const c = competitions.find(x => x.id === formData.competition_id); return c ? (c.entry_fee_cents / 100).toFixed(2) : (500 / 100).toFixed(2) })()}</p><p className="text-[10px] text-zed-foreground-secondary mt-2">Non-refundable competition fee</p></>
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

              {isSyncing && (
                <div className="absolute inset-0 bg-zed-background z-50 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 bg-zed-primary/20 rounded-full flex items-center justify-center mb-8">
                    <Loader2 size={64} className="text-zed-primary animate-spin" />
                  </div>
                  <h2 className="text-4xl font-black mb-4">Saving Changes...</h2>
                  <p className="text-zed-foreground-secondary max-w-sm">Syncing data to Supabase</p>
                  <div className="mt-8 flex gap-1.5">
                    <span className="w-2 h-2 bg-zed-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-zed-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-zed-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
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

            <div className="mt-8 flex justify-between gap-4">
              <button type="button" onClick={handlePrev} disabled={currentStep === 1 || isSubmitting} className="btn-secondary px-10 h-16 flex items-center gap-3 text-xs font-black uppercase tracking-widest disabled:opacity-20">
                <ChevronLeft size={20} /> Back
              </button>
              {currentStep >= 2 && currentStep < 5 && (
                <button
                  type="button"
                  onClick={async () => {
                    if (currentStep === 1) {
                      toast.error('Please complete Step 1 first')
                      return
                    }
                    if (currentStep === 2) {
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
                    if (currentStep === 3) {
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

                    setIsSubmitting(true)
                    try {
                      const collaboratorsArray = formData.collaborators
                        .split('\n')
                        .map(s => s.trim())
                        .filter(Boolean)

                      // Save draft
                      let ideaId = draftId
                      if (!ideaId) {
                        const draftRes: any = await ideaService.saveDraft({
                          ...formData,
                          collaborators: collaboratorsArray,
                          competition_id: formData.competition_id || undefined,
                        })
                        ideaId = draftRes.id
                      } else {
                        await ideaService.saveDraft({
                          ...formData,
                          collaborators: collaboratorsArray,
                          competition_id: formData.competition_id || undefined,
                          id: ideaId,
                        })
                      }

                      if (!ideaId) {
                        console.error('No idea ID available')
                        return
                      }

                      if (isEditMode) {
                        setIsSyncing(true)
                        await new Promise(r => setTimeout(r, 800))
                        setIsSyncing(false)
                        toast.success('Changes saved')
                        router.push(`/dashboard/ideas/${ideaId}`)
                        return
                      }

                      // Submit the idea
                      await ideaService.submitIdea(ideaId)

                      // Check if payment is needed
                      if (!hasPaidEntry && formData.competition_id) {
                        const payRes: any = await api.post(`/competitions/${formData.competition_id}/enter`, { ideaId: ideaId })
                        if (payRes.checkoutUrl) {
                          window.location.href = payRes.checkoutUrl
                          return
                        }
                      }

                      // Success - no payment needed
                      setIsSuccess(true)
                      const competitionName = competitions.find(c => c.id === formData.competition_id)?.title || ''
                      const params = new URLSearchParams({ title: formData.title, competition: competitionName })
                      if (ideaId) params.append('id', ideaId)
                      router.replace(`/dashboard/ideas/success?${params}`)
                    } catch (err: any) {
                      toast.error(err.message || 'Submission failed')
                    } finally {
                      setIsSubmitting(false)
                    }
                  }}
                  disabled={isSubmitting || (!isEditMode && !formData.termsAccepted)}
                  className="btn-primary px-16 h-16 flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-2xl shadow-zed-primary/40"
                >
                  {isSubmitting ? 'Processing...' : isEditMode ? 'Save Changes' : 'Submit & Pay Now'} <CreditCard size={20} />
                </button>
              )}
              {currentStep < 5 ? (
                <button type="button" onClick={handleNext} className="btn-primary px-16 h-16 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                  Continue <ChevronRight size={20} />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting || (!isEditMode && !formData.termsAccepted)} className="btn-primary px-16 h-16 flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-2xl shadow-zed-primary/40">
                  {isSubmitting ? 'Processing...' : isEditMode ? 'Save Changes' : 'Submit Entry'} <CreditCard size={20} />
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
