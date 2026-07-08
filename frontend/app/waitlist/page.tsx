'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Mail, Sparkles, Users, Share2, Copy, CheckCircle2, Loader2, Gift, Info, User, Globe, Briefcase, Target, Link2 } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { toast } from 'sonner'

const STEPS = [
  { id: 1, label: 'You', icon: User },
  { id: 2, label: 'Background', icon: Briefcase },
  { id: 3, label: 'Interests', icon: Target },
  { id: 4, label: 'Referral', icon: Link2 },
  { id: 5, label: 'Verify', icon: Mail },
]

const ROLES = ['Student', 'Entrepreneur', 'Startup Founder', 'Developer', 'Designer', 'Investor', 'Creator', 'Freelancer', 'Business Owner', 'Other']
const PROFESSIONS = ['Student', 'Entrepreneur', 'Software Engineer', 'Data Scientist', 'Product Manager', 'Designer', 'Artist', 'Researcher', 'Writer', 'Marketer', 'Consultant', 'Other']
const INTEREST_OPTIONS = ['AI & Machine Learning', 'Fintech', 'HealthTech', 'EdTech', 'GreenTech', 'E-Commerce', 'Social Media', 'Gaming', 'Blockchain', 'Space Tech', 'Agriculture', 'Other']
const GOAL_OPTIONS = ['Find a co-founder', 'Get funding', 'Validate my idea', 'Network with builders', 'Learn from others', 'Showcase my work', 'Find a mentor', 'Hire talent', 'Other']
const CHALLENGE_OPTIONS = ['Funding', 'Team building', 'Market research', 'Technical skills', 'User acquisition', 'Legal/regulatory', 'Product development', 'Finding customers', 'Other']
const ALL_NATIONS = ['Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czechia',"Côte d'Ivoire","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe']

const containerVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
}

function ChipSelect({ options, selected, onChange, label }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; label: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isActive = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(isActive ? selected.filter(s => s !== opt) : [...selected, opt])}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isActive
                  ? 'bg-zed-primary/20 border-zed-primary/50 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function WaitlistPage() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [countData, setCountData] = useState<{ total: number; freePassLimit: number; spotsRemaining: number } | null>(null)

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    country: '',
    profession: '',
    role: '',
    interests: [] as string[],
    goal: '',
    challenge: '',
    referralCode: '',
    marketingConsent: true,
  })

  useEffect(() => {
    api.get('/waitlist/count').then((r: any) => {
      if (r?.total !== undefined) setCountData(r)
    }).catch(() => {})
  }, [])

  const update = useCallback((field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const validateStep = useCallback(() => {
    switch (step) {
      case 1:
        if (!form.name.trim()) { toast.error('Name is required'); return false }
        if (!form.email.trim()) { toast.error('Email is required'); return false }
        if (!/\S+@\S+\.\S+/.test(form.email)) { toast.error('Invalid email address'); return false }
        return true
      case 2:
        if (!form.country) { toast.error('Country is required'); return false }
        if (!form.profession) { toast.error('Profession is required'); return false }
        if (!form.role) { toast.error('Role is required'); return false }
        return true
      case 3:
        if (form.interests.length === 0) { toast.error('Select at least one interest'); return false }
        return true
      default:
        return true
    }
  }, [step, form])

  const next = () => {
    if (!validateStep()) return
    setDirection(1)
    setStep(s => Math.min(s + 1, 5))
  }

  const prev = () => {
    setDirection(-1)
    setStep(s => Math.max(s - 1, 1))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res: any = await api.post('/waitlist/signup', {
        name: form.name.trim(),
        username: form.username.trim() || undefined,
        email: form.email.trim(),
        country: form.country,
        profession: form.profession,
        role: form.role,
        interests: form.interests,
        goal: form.goal || undefined,
        challenge: form.challenge || undefined,
        marketingConsent: form.marketingConsent,
        referralCode: form.referralCode.toUpperCase().trim() || undefined,
      })
      if (res?.success) {
        setSubmitted(true)
        if (res?.data?.referralCode) setReferralCode(res.data.referralCode)
        setStep(5)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const progressPercent = Math.round(((step - 1) / 4) * 100)

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(24px)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zed-primary to-zed-accent flex items-center justify-center text-[10px] font-black">Z</div>
            <span className="font-extrabold text-lg tracking-tight hidden sm:inline gradient-text">ZedIdeaArena</span>
          </Link>
          <div className="text-xs text-white/40">
            {countData && <span>{countData.spotsRemaining} / {countData.freePassLimit} free passes left</span>}
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="wizard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Steps Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {STEPS.map(s => {
                    const StepIcon = s.icon
                    const isActive = s.id === step
                    const isDone = s.id < step
                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <div className={`flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          isDone ? 'bg-zed-primary text-white' :
                          isActive ? 'bg-zed-primary/20 border border-zed-primary/50 text-white' :
                          'bg-white/5 border border-white/10 text-white/30'
                        }`}>
                          {isDone ? <Check size={14} /> : <StepIcon size={14} />}
                        </div>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:block ${isActive ? 'text-white' : 'text-white/30'}`}>
                          {s.label}
                        </span>
                        {s.id < 5 && <div className={`w-8 h-px ${isDone ? 'bg-zed-primary/50' : 'bg-white/10'}`} />}
                      </div>
                    )
                  })}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-zed-primary to-zed-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                {/* Step Content */}
                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={containerVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="card-zed p-6 sm:p-8 space-y-5"
                    >
                      {step === 1 && (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <User size={16} className="text-zed-primary" />
                            <h2 className="text-lg font-black text-white">Tell us about you</h2>
                          </div>
                          <p className="text-xs text-white/50 -mt-2">Start your journey to the arena.</p>
                          <div>
                            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Name *</label>
                            <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className="input-zed" placeholder="Your full name" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Email *</label>
                            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="input-zed" placeholder="your@email.com" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Username (optional)</label>
                            <input type="text" value={form.username} onChange={e => update('username', e.target.value)} className="input-zed" placeholder="Choose a unique username" />
                          </div>
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Globe size={16} className="text-zed-primary" />
                            <h2 className="text-lg font-black text-white">Your background</h2>
                          </div>
                          <p className="text-xs text-white/50 -mt-2">Help us understand where you're coming from.</p>
                          <div>
                            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Country *</label>
                            <select value={form.country} onChange={e => update('country', e.target.value)} className="input-zed">
                              <option value="">Select your country</option>
                              {ALL_NATIONS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Profession *</label>
                            <select value={form.profession} onChange={e => update('profession', e.target.value)} className="input-zed">
                              <option value="">Select profession</option>
                              {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Role in the arena *</label>
                            <select value={form.role} onChange={e => update('role', e.target.value)} className="input-zed">
                              <option value="">How do you see yourself?</option>
                              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                        </>
                      )}

                      {step === 3 && (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Target size={16} className="text-zed-primary" />
                            <h2 className="text-lg font-black text-white">Interests & goals</h2>
                          </div>
                          <p className="text-xs text-white/50 -mt-2">What excites you? We'll personalize your experience.</p>
                          <ChipSelect label="Areas of interest *" options={INTEREST_OPTIONS} selected={form.interests} onChange={v => update('interests', v)} />
                          <div>
                            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Primary goal</label>
                            <select value={form.goal} onChange={e => update('goal', e.target.value)} className="input-zed">
                              <option value="">What brings you here?</option>
                              {GOAL_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Biggest challenge</label>
                            <select value={form.challenge} onChange={e => update('challenge', e.target.value)} className="input-zed">
                              <option value="">What's your biggest hurdle?</option>
                              {CHALLENGE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </>
                      )}

                      {step === 4 && (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Link2 size={16} className="text-zed-primary" />
                            <h2 className="text-lg font-black text-white">Almost there</h2>
                          </div>
                          <p className="text-xs text-white/50 -mt-2">One last thing before you join.</p>
                          <div className="p-4 rounded-2xl border border-zed-primary/10 flex items-start gap-3" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.06),rgba(34,211,238,0.03))' }}>
                            <Info size={16} className="text-zed-accent mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-white/50 leading-relaxed">Got a referral code from a friend? Enter it below. You'll get priority access when the arena opens.</p>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Referral code (optional)</label>
                            <input
                              type="text"
                              value={form.referralCode}
                              onChange={e => update('referralCode', e.target.value.toUpperCase())}
                              className="input-zed font-mono tracking-widest uppercase"
                              placeholder="e.g. SEAN4A2B"
                              maxLength={12}
                            />
                          </div>
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                            <input
                              type="checkbox"
                              id="marketing"
                              checked={form.marketingConsent}
                              onChange={e => update('marketingConsent', e.target.checked)}
                              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-zed-primary"
                            />
                            <label htmlFor="marketing" className="text-xs text-white/60 cursor-pointer">
                              I'd like to receive updates about the arena launch, new features, and community events.
                            </label>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                  {step > 1 ? (
                    <button type="button" onClick={prev} className="btn-secondary flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                      <ArrowLeft size={16} /> Back
                    </button>
                  ) : (
                    <div />
                  )}
                  {step < 4 ? (
                    <button type="button" onClick={next} className="btn-primary flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                      Continue <ArrowRight size={16} />
                    </button>
                  ) : step === 4 ? (
                    <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50">
                      {loading ? <><Loader2 size={16} className="animate-spin" /> Joining...</> : <>Join the Arena <Sparkles size={16} /></>}
                    </button>
                  ) : null}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="flex justify-center"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-green-400" />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white">Verify your email</h2>
                  <p className="text-sm text-white/50 max-w-sm mx-auto">
                    We sent a verification link to <strong className="text-white">{form.email}</strong>. Click it to confirm your spot on the waitlist.
                  </p>
                </div>

                <div className="card-zed p-6 space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                    <Mail size={16} className="text-zed-primary" />
                    <span>Didn't get the email?</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await api.post('/waitlist/resend-verification', { email: form.email })
                        toast.success('Verification email resent!')
                      } catch (err: any) {
                        toast.error(err?.message || 'Failed to resend')
                      }
                    }}
                    className="btn-secondary text-xs font-black uppercase tracking-widest"
                  >
                    Resend Email
                  </button>
                </div>

                <div className="card-zed p-6 space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Users size={16} className="text-zed-primary" />
                    <span className="text-sm font-bold text-white">Invite friends, move up the list</span>
                  </div>
                  <p className="text-xs text-white/50">Share your referral link and get priority access when we launch.</p>
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `https://zedideaarena.com/waitlist?ref=${referralCode}`
                        navigator.clipboard.writeText(url)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                        toast.success('Link copied!')
                      }}
                      className="btn-secondary flex items-center gap-2 text-xs"
                    >
                      <Copy size={14} /> {copied ? 'Copied!' : 'Copy Referral Link'}
                    </button>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('I just joined the waitlist for ZedIdeaArena — where ideas compete and builders get noticed.')}&url=${encodeURIComponent('https://zedideaarena.com/waitlist')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex items-center gap-2 text-xs"
                    >
                      <Share2 size={14} /> Share
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
