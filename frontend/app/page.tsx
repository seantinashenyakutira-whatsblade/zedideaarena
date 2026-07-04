'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, Mail, Sparkles, Users, Zap, Lightbulb, Gift, Share2, Copy, Music2, Video, Camera, Facebook } from 'lucide-react'
import api from '@/lib/api'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
}

function FloatingOrb({ className, color }: { className?: string; color: string }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      animate={{ y: [0, -30, 0], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

function SectionDivider() {
  return (
    <div className="relative h-32 sm:h-48">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.03), transparent)' }} />
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-px h-16" style={{ background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.3), transparent)' }} />
    </div>
  )
}

export default function HomePage() {
  const [formData, setFormData] = useState({ name: '', email: '', interest: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [countData, setCountData] = useState<{ total: number; freePassLimit: number; spotsRemaining: number } | null>(null)
  const [loadingCount, setLoadingCount] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res: any = await api.get('/waitlist/count')
        if (res?.total !== undefined) setCountData(res)
      } catch {} finally {
        setLoadingCount(false)
      }
    }
    fetchCount()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/waitlist/signup', {
        name: formData.name,
        email: formData.email,
        interest: formData.interest || null,
      })

      if (response?.data?.success || response?.status === 201) {
        setSubmitted(true)
        setFormData({ name: '', email: '', interest: '' })
        setTimeout(() => setSubmitted(false), 5000)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen overflow-x-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
        style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(24px)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <Image src="/logo-icon.png" alt="ZedIdeaArena" width={28} height={28} className="object-contain relative z-10" />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(99,102,241,0.3)', filter: 'blur(8px)' }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <span className="font-extrabold text-lg tracking-tight hidden sm:inline gradient-text">ZedIdeaArena</span>
          </Link>
          <div className="text-xs font-semibold text-white/50 text-center sm:text-right">
            <p>Coming Soon</p>
          </div>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 pt-20">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 h-full w-[85vw] max-w-[1100px] opacity-[0.2]"
            style={{
              left: '-22%',
              background: 'linear-gradient(160deg, #6366F1 0%, #22D3EE 40%, transparent 70%)',
              clipPath: 'polygon(0 0, 100% 0, 75% 100%, 0 100%)',
              WebkitClipPath: 'polygon(0 0, 100% 0, 75% 100%, 0 100%)',
            }}
          />
          <div
            className="absolute top-0 h-full w-[70vw] max-w-[800px] opacity-[0.08]"
            style={{
              left: '-15%',
              background: 'linear-gradient(180deg, #000000 0%, #6366F1 50%, transparent 80%)',
              clipPath: 'polygon(0 0, 90% 0, 65% 100%, 0 100%)',
              WebkitClipPath: 'polygon(0 0, 90% 0, 65% 100%, 0 100%)',
            }}
          />
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background: 'linear-gradient(135deg, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.6) 35%, rgba(10,10,15,0.2) 60%, transparent 80%)',
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto py-20">
          {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 flex flex-wrap gap-3"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                <Sparkles size={16} style={{ color: '#6366F1' }} />
                <span className="text-xs font-semibold text-white/70">The Arena Opens Soon</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/10 backdrop-blur-sm">
                <Gift size={16} className="text-amber-400" />
                <span className="text-xs font-semibold text-amber-300">First 50 Contestants get a Free Pass</span>
              </div>
            </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 tracking-tight"
          >
            Great ideas deserve
            <br />
            to be <span className="gradient-text">seen.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg sm:text-xl text-white/70 mb-12 max-w-2xl leading-relaxed"
          >
            ZedIdeaArena is building the arena where ideas compete, communities discover innovation, and builders get noticed. Be among the first to enter.
          </motion.p>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="w-full max-w-lg"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-zed-primary/50 focus:bg-white/8 transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-zed-primary/50 focus:bg-white/8 transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Interest Dropdown */}
                  <div>
                    <select
                      name="interest"
                      value={formData.interest}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-zed-primary/50 focus:bg-white/8 transition-all disabled:opacity-50 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' opacity='0.5' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="" style={{ color: '#fff', background: '#0A0A0F' }}>Interest (optional)</option>
                      <option value="tech" style={{ color: '#fff', background: '#0A0A0F' }}>Tech & Software</option>
                      <option value="business" style={{ color: '#fff', background: '#0A0A0F' }}>Business & Startups</option>
                      <option value="creative" style={{ color: '#fff', background: '#0A0A0F' }}>Creative & Design</option>
                      <option value="social" style={{ color: '#fff', background: '#0A0A0F' }}>Social Impact</option>
                      <option value="other" style={{ color: '#fff', background: '#0A0A0F' }}>Other</option>
                    </select>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-400 font-medium"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg,#6366F1,#22D3EE)',
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join the Waitlist
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>

                  {/* Secondary Text */}
                  <p className="text-xs text-white/40 text-center">
                    Be among the first to enter the arena.
                  </p>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="p-8 rounded-2xl border border-green-500/30 bg-green-500/5 text-center mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring' }}
                      className="mb-4 flex justify-center"
                    >
                      <CheckCircle2 size={48} className="text-green-400" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">You&apos;re on the list!</h3>
                    <p className="text-sm text-white/60 mb-4">
                      We&apos;ll keep you updated before the arena opens. Check your email for updates.
                    </p>
                    {countData && countData.total <= countData.freePassLimit && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20"
                      >
                        <Gift size={14} className="text-amber-400" />
                        <span className="text-xs font-semibold text-amber-300">You&apos;ve earned a Free Pass!</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Share / Referral */}
                  <div className="text-center">
                    <p className="text-xs text-white/40 mb-3">Tell a friend about the arena</p>
                    <div className="flex items-center justify-center gap-2">
                      <motion.a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('I just joined the waitlist for ZedIdeaArena — the arena where ideas compete and builders get noticed. First 50 contestants get a free pass!')}&url=${encodeURIComponent('https://zedideaarena.com')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-medium flex items-center gap-1.5"
                      >
                        <Share2 size={14} /> Share on X
                      </motion.a>
                      <motion.button
                        onClick={() => {
                          navigator.clipboard.writeText('https://zedideaarena.com')
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-medium flex items-center gap-1.5"
                      >
                        <Copy size={14} /> {copied ? 'Copied!' : 'Copy Link'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Live Counter */}
        {!submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-10 max-w-lg"
          >
            {loadingCount ? (
              <div className="flex items-center gap-2 text-xs text-white/40">
                <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                Loading...
              </div>
            ) : countData ? (
              <div>
                <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                  <span>Free Passes Claimed</span>
                  <span className="font-semibold text-white/70">{Math.min(countData.total, countData.freePassLimit)} / {countData.freePassLimit}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((countData.total / countData.freePassLimit) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: countData.spotsRemaining > 0 ? 'linear-gradient(90deg,#6366F1,#22D3EE)' : '#ef4444' }}
                  />
                </div>
                <p className="text-xs mt-2">
                  {countData.spotsRemaining > 0 ? (
                    <span className="text-amber-400 font-medium">Only {countData.spotsRemaining} spot{countData.spotsRemaining !== 1 ? 's' : ''} left!</span>
                  ) : (
                    <span className="text-red-400 font-medium">All 50 free passes have been claimed</span>
                  )}
                </p>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Scroll Indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}>
          <motion.div className="w-5 h-8 rounded-full border-2 border-white/15 flex items-start justify-center p-1" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
            <motion.div className="w-1 h-1.5 rounded-full" style={{ background: '#6366F1' }} animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
          </motion.div>
        </motion.div>
      </section>

      <SectionDivider />

      {/* WHY WE'RE BUILDING THIS */}
      <section className="py-24 px-6 relative overflow-hidden">
        <FloatingOrb className="top-0 right-0 w-[600px] h-[600px]" color="rgba(99,102,241,0.06)" />
        <motion.div {...fadeUp} className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2 {...fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Why we&apos;re building <span className="gradient-text">this.</span>
            </motion.h2>
            <motion.p {...fadeUp} className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Innovation happens when ideas get visibility. Today, most ideas never get noticed. We&apos;re building the stage where they do.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Lightbulb size={24} />,
                title: 'Ideas Need Visibility',
                desc: 'Great ideas come from everywhere. But they need the right audience to be discovered and developed.',
              },
              {
                icon: <Users size={24} />,
                title: 'Community Over Gatekeepers',
                desc: 'We believe communities should decide which ideas matter\u2014not gatekeepers or algorithms.',
              },
              {
                icon: <Zap size={24} />,
                title: 'Builders Get Noticed',
                desc: 'When your idea wins, you don&apos;t just get funding\u2014you get noticed by a community that believes in you.',
              },
              {
                icon: <Mail size={24} />,
                title: 'Real Feedback, Real Rewards',
                desc: 'Submit your idea. Get feedback from verified voters. Win real funding if your idea resonates.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <SectionDivider />

      {/* HOW IT WILL WORK */}
      <section className="py-24 px-6 relative overflow-hidden">
        <FloatingOrb className="bottom-0 left-0 w-[500px] h-[500px]" color="rgba(34,211,238,0.06)" />
        <motion.div {...fadeUp} className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2 {...fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              How it will <span className="gradient-text">work.</span>
            </motion.h2>
          </div>

          <div className="space-y-6">
            {[
              {
                num: '1',
                title: 'Submit Your Idea',
                desc: 'Tell us your idea. What problem does it solve? What makes it unique?',
              },
              {
                num: '2',
                title: 'Community Reviews',
                desc: 'Verified community members review and provide feedback on your submission.',
              },
              {
                num: '3',
                title: 'Community Votes',
                desc: 'Voters decide which ideas they believe in most. Every vote counts.',
              },
              {
                num: '4',
                title: 'Winners Are Announced',
                desc: 'Top ideas win. Winning ideas split the prize pool and get real exposure.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 items-start p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#6366F1' }}
                >
                  {item.num}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <SectionDivider />

      {/* WHO IT'S FOR */}
      <section className="py-24 px-6 relative overflow-hidden">
        <FloatingOrb className="top-1/2 left-1/4 w-[500px] h-[500px]" color="rgba(99,102,241,0.06)" />
        <motion.div {...fadeUp} className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2 {...fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Who it&apos;s <span className="gradient-text">for.</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                role: 'For Innovators',
                items: [
                  'You have an idea that could change something',
                  'You want real feedback from a community',
                  'You\u2019re looking for support and exposure',
                  'You believe your idea deserves a chance',
                ],
              },
              {
                role: 'For Community Members',
                items: [
                  'You want to discover breakthrough ideas early',
                  'You enjoy supporting builders and innovators',
                  'You believe great ideas should be rewarded',
                  'You want to be part of something meaningful',
                ],
              },
            ].map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <h3 className="text-2xl font-bold mb-6" style={{ color: '#6366F1' }}>
                  {section.role}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-white/70">
                      <span className="text-zed-primary mt-1">\u2713</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <SectionDivider />

      {/* CTA SECTION */}
      <section className="relative py-24 px-6 overflow-hidden">
        <FloatingOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]" color="rgba(99,102,241,0.08)" />

        <motion.div {...fadeUp} className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.h2
            {...fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight"
            style={{ background: 'linear-gradient(135deg,#fff 0%,#6366F1 50%,#22D3EE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Launching Soon
          </motion.h2>
          <motion.p {...fadeUp} className="text-lg text-white/60 mb-8 max-w-lg mx-auto leading-relaxed">
            Sign up now to be among the first when the arena opens.
          </motion.p>
          <motion.div {...fadeUp}>
            <button
              onClick={() => {
                const form = document.querySelector('form')
                form?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-full text-base font-bold transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}
            >
              Join the Waitlist <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* SOCIAL FOLLOW */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingOrb className="top-0 right-0 w-[400px] h-[400px]" color="rgba(99,102,241,0.05)" />
        <motion.div {...fadeUp} className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-black mb-4">
            Follow the <span className="gradient-text">Arena</span>
          </motion.h2>
          <motion.p {...fadeUp} className="text-sm text-white/50 mb-10 max-w-md mx-auto">
            Stay updated on launch news, competitions, and community highlights.
          </motion.p>
          <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-3">
            {[
              { key: 'x', label: 'X (Twitter)', url: 'https://x.com/WhatsbladeLLC', color: '#000' },
              { key: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@Zedideaarena?sub_confirmation=1', color: '#FF0000' },
              { key: 'instagram', label: 'Instagram', url: 'https://instagram.com/zedideaarena', color: '#E4405F' },
              { key: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61573631967617', color: '#1877F2' },
              { key: 'tiktok', label: 'TikTok', url: 'https://tiktok.com/@zedideaarena', color: '#000' },
              { key: 'email', label: 'Email', url: 'mailto:support@zedideaarena.com', color: '#6366F1' },
            ].map((platform, i) => (
              <motion.a
                key={platform.key}
                href={platform.url}
                target={platform.key === 'email' ? undefined : '_blank'}
                rel={platform.key === 'email' ? undefined : 'noopener noreferrer'}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border border-white/10"
                style={{ background: `${platform.color}15`, borderColor: `${platform.color}30`, color: platform.color }}
              >
                {platform.key === 'youtube' && <Video size={16} />}
                {platform.key === 'instagram' && <Camera size={16} />}
                {platform.key === 'facebook' && <Facebook size={16} />}
                {platform.key === 'tiktok' && <Music2 size={16} />}
                {platform.key === 'email' && <Mail size={16} />}
                {platform.key === 'x' && <span className="text-xs font-bold">X</span>}
                {platform.label}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-10 w-full border-t border-white/10 py-12 px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center gap-2 justify-center mb-6">
            <Image src="/logo-icon.png" alt="ZedIdeaArena" width={24} height={24} className="object-contain opacity-50" />
            <span className="text-sm font-bold text-white/50">ZedIdeaArena</span>
          </div>
          <p className="text-xs text-white/30 mb-6">
            Where great ideas come to compete. Launching soon.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-white/50 mb-8">
            <a href="mailto:hello@zedideaarena.com" className="hover:text-white transition-colors">Contact</a>
            <a href="/docs/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/docs/terms" className="hover:text-white transition-colors">Terms</a>
          </div>
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} ZedIdeaArena. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  )
}
