'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Sparkles, Users, CheckCircle2, Loader2, Info, Globe, Briefcase, Target, Share2, Copy, ExternalLink, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { toast } from 'sonner'

const ONBOARD_STEPS = [
  { id: 1, label: 'Background', icon: Briefcase, pct: 50 },
  { id: 2, label: 'Interests', icon: Target, pct: 75 },
  { id: 3, label: 'Social & Share', icon: Share2, pct: 90 },
  { id: 4, label: 'Complete', icon: CheckCircle2, pct: 100 },
]

const ROLES = ['Student', 'Entrepreneur', 'Startup Founder', 'Developer', 'Designer', 'Investor', 'Creator', 'Freelancer', 'Business Owner', 'Other']
const PROFESSIONS = ['Student', 'Entrepreneur', 'Software Engineer', 'Data Scientist', 'Product Manager', 'Designer', 'Artist', 'Researcher', 'Writer', 'Marketer', 'Consultant', 'Other']
const INTEREST_OPTIONS = ['AI & Machine Learning', 'Fintech', 'HealthTech', 'EdTech', 'GreenTech', 'E-Commerce', 'Social Media', 'Gaming', 'Blockchain', 'Space Tech', 'Agriculture', 'Other']
const GOAL_OPTIONS = ['Find a co-founder', 'Get funding', 'Validate my idea', 'Network with builders', 'Learn from others', 'Showcase my work', 'Find a mentor', 'Hire talent', 'Other']
const CHALLENGE_OPTIONS = ['Funding', 'Team building', 'Market research', 'Technical skills', 'User acquisition', 'Legal/regulatory', 'Product development', 'Finding customers', 'Other']
const ALL_NATIONS = ['Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czechia','Democratic Republic of the Congo','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe']

const containerVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
}

function ChipSelect({ options, selected, onChange, label }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; label: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-2">{label}</p>
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

export default function OnboardPage() {
  const searchParams = useSearchParams()
  const isOnboard = searchParams.get('onboard') === 'true'
  const emailParam = searchParams.get('email') || ''

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [socialFollowed, setSocialFollowed] = useState({ twitter: false, youtube: false, instagram: false })
  const [whatsAppShares, setWhatsAppShares] = useState(0)
  const [email, setEmail] = useState(emailParam)

  const [form, setForm] = useState({
    username: '',
    country: '',
    profession: '',
    role: '',
    interests: [] as string[],
    goal: '',
    challenge: '',
  })

  useEffect(() => {
    if (isOnboard && !email) {
      const stored = sessionStorage.getItem('onboard_email')
      if (stored) setEmail(stored)
    }
  }, [isOnboard, email])

  const currentStep = ONBOARD_STEPS.find(s => s.id === step)!

  const update = useCallback((field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const validateStep = useCallback(() => {
    switch (step) {
      case 1:
        if (!form.country) { toast.error('Country is required'); return false }
        if (!form.profession) { toast.error('Profession is required'); return false }
        if (!form.role) { toast.error('Role is required'); return false }
        return true
      case 2:
        if (form.interests.length === 0) { toast.error('Select at least one interest'); return false }
        return true
      case 3:
        if (whatsAppShares < 3) { toast.error(`Share to ${3 - whatsAppShares} more WhatsApp group${whatsAppShares === 2 ? '' : 's'}`); return false }
        if (!socialFollowed.twitter || !socialFollowed.youtube || !socialFollowed.instagram) { toast.error('Follow all three social channels'); return false }
        return true
      default:
        return true
    }
  }, [step, form, whatsAppShares, socialFollowed])

  const next = () => {
    if (!validateStep()) return
    setDirection(1)
    setStep(s => Math.min(s + 1, 4))
  }

  const prev = () => {
    setDirection(-1)
    setStep(s => Math.max(s - 1, 1))
  }

  const handleComplete = async () => {
    if (!email) { toast.error('Session expired. Please sign up again.'); return }
    setLoading(true)
    try {
      const res: any = await api.post('/waitlist/signup', {
        name: email, // backend uses this to identify existing user + skip re-verification
        email,
        username: form.username.trim() || undefined,
        country: form.country,
        profession: form.profession,
        role: form.role,
        interests: form.interests,
        goal: form.goal || undefined,
        challenge: form.challenge || undefined,
        marketingConsent: true,
      })
      if (res?.success) {
        if (res?.data?.referralCode) setReferralCode(res.data.referralCode)
        setCompleted(true)
        setStep(4)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppShare = () => {
    const msg = encodeURIComponent(
      `🚀 I just joined ZedIdeaArena — where ideas compete and builders get noticed!\n\nJoin me on the waitlist: https://zedideaarena.com/waitlist`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
    setWhatsAppShares(s => Math.min(s + 1, 3))
  }

  if (!isOnboard) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black text-white">Join the Waitlist</h1>
          <p className="text-sm text-white/50">Sign up on our homepage to get started.</p>
          <Link href="/" className="btn-primary inline-flex text-xs font-black uppercase tracking-widest">Go to Homepage</Link>
        </div>
      </div>
    )
  }

  const progressPct = completed ? 100 : currentStep.pct

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(24px)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zed-primary to-zed-accent flex items-center justify-center text-[10px] font-black">Z</div>
            <span className="font-extrabold text-lg tracking-tight hidden sm:inline gradient-text">ZedIdeaArena</span>
          </Link>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{progressPct}% Complete</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {!completed ? (
              <motion.div
                key="wizard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {ONBOARD_STEPS.map(s => {
                    const isActive = s.id === step
                    const isDone = s.id < step
                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <div className={`flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          isDone ? 'bg-zed-primary text-white' :
                          isActive ? 'bg-zed-primary/20 border border-zed-primary/50 text-white' :
                          'bg-white/5 border border-white/10 text-white/30'
                        }`}>
                          {isDone ? <Check size={14} /> : <s.icon size={14} />}
                        </div>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:block ${isActive ? 'text-white' : 'text-white/30'}`}>{s.label}</span>
                        {s.id < 4 && <div className={`w-8 h-px ${isDone ? 'bg-zed-primary/50' : 'bg-white/10'}`} />}
                      </div>
                    )
                  })}
                </div>

                {/* Bar */}
                <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-zed-primary to-zed-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
                </div>

                {/* Content */}
                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div key={step} custom={direction} variants={containerVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="card-zed p-6 sm:p-8 space-y-5">
                      {step === 1 && (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Globe size={16} className="text-zed-primary" />
                            <h2 className="text-lg font-black text-white">Your background</h2>
                          </div>
                          <p className="text-xs text-white/50 -mt-2">Help us understand where you're from.</p>
                          <div>
                            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Username (optional)</label>
                            <input type="text" value={form.username} onChange={e => update('username', e.target.value)} className="input-zed" placeholder="Choose a unique username" />
                          </div>
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
                            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Role *</label>
                            <select value={form.role} onChange={e => update('role', e.target.value)} className="input-zed">
                              <option value="">How do you see yourself?</option>
                              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                        </>
                      )}

                      {step === 2 && (
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

                      {step === 3 && (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Share2 size={16} className="text-zed-primary" />
                            <h2 className="text-lg font-black text-white">Spread the word</h2>
                          </div>
                          <p className="text-xs text-white/50 -mt-2">Follow us and share with your community.</p>

                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Follow Us</p>
                            {[
                              { key: 'twitter', label: 'Follow on X', url: 'https://x.com/zedideaarena', emoji: '𝕏' },
                              { key: 'youtube', label: 'Subscribe on YouTube', url: 'https://youtube.com/@zedideaarena', emoji: '▶' },
                              { key: 'instagram', label: 'Follow on Instagram', url: 'https://instagram.com/zedideaarena', emoji: '📷' },
                            ].map(social => {
                              const followed = socialFollowed[social.key as keyof typeof socialFollowed]
                              return (
                                <div key={social.key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                  <span className="text-sm font-semibold text-white/80">{social.emoji} {social.label}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      window.open(social.url, '_blank')
                                      setSocialFollowed(prev => ({ ...prev, [social.key]: true }))
                                      toast.success(`Followed on ${social.label}`)
                                    }}
                                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                                      followed
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-zed-primary/20 text-zed-primary border border-zed-primary/30 hover:bg-zed-primary/30'
                                    }`}
                                  >
                                    {followed ? <><Check size={12} className="inline mr-1" /> Done</> : <><ExternalLink size={12} className="inline mr-1" /> Follow</>}
                                  </button>
                                </div>
                              )
                            })}
                          </div>

                          <div className="p-4 rounded-2xl border border-green-500/20 bg-green-500/5">
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Share to WhatsApp Groups</p>
                            <p className="text-xs text-white/50 mb-3">Share the arena with your community. ({whatsAppShares}/3 completed)</p>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={handleWhatsAppShare}
                                className="btn-primary flex items-center gap-2 text-xs flex-1 justify-center"
                              >
                                <MessageCircle size={16} /> Share on WhatsApp
                              </button>
                              <div className="flex gap-1">
                                {[1, 2, 3].map(i => (
                                  <div key={i} className={`w-3 h-3 rounded-full ${i <= whatsAppShares ? 'bg-green-400' : 'bg-white/10'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-[9px] text-white/40 mt-2">Share to at least 3 different WhatsApp groups</p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Nav */}
                <div className="flex items-center justify-between gap-4">
                  {step > 1 ? (
                    <button type="button" onClick={prev} className="btn-secondary flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                      <ArrowLeft size={16} /> Back
                    </button>
                  ) : <div />}
                  {step < 3 ? (
                    <button type="button" onClick={next} className="btn-primary flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                      Continue <ArrowRight size={16} />
                    </button>
                  ) : step === 3 ? (
                    <button type="button" onClick={handleComplete} disabled={loading} className="btn-primary flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50">
                      {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <>Complete <Sparkles size={16} /></>}
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
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle2 size={48} className="text-green-400" />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white">You're 100% in! 🎉</h2>
                  <p className="text-sm text-white/50 max-w-sm mx-auto">
                    Welcome to the arena. You're fully onboarded and we'll keep you posted on launch.
                  </p>
                </div>

                {referralCode && (
                  <div className="card-zed p-6 space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Users size={16} className="text-zed-primary" />
                      <span className="text-sm font-bold text-white">Your Referral Code</span>
                    </div>
                    <div className="text-3xl font-black tracking-[0.2em] text-zed-primary">{referralCode}</div>
                    <p className="text-xs text-white/50">Share this code — referrers get priority access.</p>
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://zedideaarena.com/waitlist?ref=${referralCode}`)
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                          toast.success('Link copied!')
                        }}
                        className="btn-secondary flex items-center gap-2 text-xs font-black uppercase"
                      >
                        <Copy size={14} /> {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                )}

                <Link href="/" className="btn-primary inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                  Back to Home
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
