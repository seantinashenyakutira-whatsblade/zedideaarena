'use client'

import { ArrowRight, ChevronLeft, ChevronRight, Users, Trophy, Zap, Play, Clock, DollarSign, Star, Glasses, Camera, Linkedin, Twitter } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import api from '@/lib/api'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  initial: {},
  whileInView: {},
  viewport: { once: true, margin: '-100px' },
}

const staggerItem = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
}

const howItWorks = [
  { num: '01', title: 'Sign Up', desc: 'Create your account in seconds. No credit card required.', icon: Users },
  { num: '02', title: 'Choose Your Role', desc: 'Enter as a Contestant or judge as a Voter.', icon: Star },
  { num: '03', title: 'Enter a Competition', desc: 'Pay the entry fee and join an active arena.', icon: Trophy },
  { num: '04', title: 'Contestant: Submit', desc: 'Your idea pitch goes live for the world to see.', icon: Zap },
  { num: '04', title: 'Voter: Judge', desc: 'Watch pitches and vote for the best ideas.', icon: Glasses },
  { num: '05', title: 'Winners Paid', desc: 'Prize pool distributed to top ideas automatically.', icon: DollarSign },
]

const team = [
  { name: 'Sean Nyakutira', role: 'Founder & CEO', bio: 'Visionary behind ZedIdeaArena' },
  { name: 'Tinashe Shumba', role: 'Lead Developer', bio: 'Full-stack architect' },
  { name: 'Chenai Nyakutira', role: 'Community Lead', bio: 'Growing the innovator network' },
  { name: 'Dylan Ibrahimovic', role: 'Head of Operations', bio: 'Scaling the platform' },
]

export default function LandingPage() {
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const fetchComps = async () => {
      try {
        const res: any = await api.get('/competitions')
        const active = (res.data || []).filter((c: any) => c.calculatedStatus === 'active')
        setCompetitions(active.slice(0, 3))
      } catch { /* silent */ }
      setLoading(false)
    }
    fetchComps()
  }, [])

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scrollBy = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 360
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const { scrollYProgress } = useScroll()
  const bgOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen overflow-x-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/5"
        style={{ background: 'rgba(10,10,15,0.8)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-icon.png" alt="ZedIdeaArena" width={28} height={28} className="object-contain" />
            <span className="font-bold text-lg tracking-tight hidden sm:inline" style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ZedIdeaArena</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-semibold text-white/70 hover:text-white transition-colors px-4 py-2">Sign In</Link>
            <Link href="/auth/signup" className="text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105" style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
              Join Now
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* SECTION 1 — HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(34,211,238,0.1) 40%, transparent 70%)' }} />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 60%)' }} />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto text-center pt-24 pb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="mb-10"
          >
            <Image src="/logo-full-dark.png" alt="ZedIdeaArena" width={120} height={120} className="mx-auto object-contain drop-shadow-[0_0_40px_rgba(99,102,241,0.5)]" />
          </motion.div>

          <motion.h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.95] mb-8 tracking-tight">
            <span className="inline-block overflow-hidden">
              <motion.span
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-block"
              >
                Where Ideas
              </motion.span>
            </span>{' '}
            <span className="inline-block overflow-hidden">
              <motion.span
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="inline-block"
                style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Compete.
              </motion.span>
            </span>{' '}
            <br className="sm:hidden" />
            <span className="inline-block overflow-hidden">
              <motion.span
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="inline-block"
              >
                And Win.
              </motion.span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            Submit your idea. Let the world vote.
            <br />
            The best idea takes the prize.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Link href="/auth/signup?role=contestant" className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105" style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)', boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}>
              Enter as Contestant <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/signup?role=voter" className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
              Become a Voter <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Founder Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.4 }}
            className="max-w-lg mx-auto"
          >
            <div className="relative group cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <div className="aspect-video rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.08)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: 'rgba(99,102,241,0.2)' }}>
                  <Play size={28} className="text-white ml-1" />
                </div>
              </div>
              <p className="text-xs text-white/50 mt-3 font-medium">Watch: How ZedIdeaArena works (2 min)</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 — HOW IT WORKS */}
      <section className="py-24 px-6 relative">
        <motion.div {...fadeUp} className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4 block">How It Works</motion.span>
            <motion.h2 {...fadeUp} className="text-4xl sm:text-5xl font-black">
              From idea to{' '}
              <span style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                funding
              </span>
            </motion.h2>
          </div>

          <div className="relative">
            <div className="flex justify-end gap-3 mb-6">
              <button onClick={() => scrollBy('left')} className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-sm transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-30 cursor-default'}`}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollBy('right')} className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-sm transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-30 cursor-default'}`}>
                <ChevronRight size={18} />
              </button>
            </div>

            <div ref={scrollRef} onScroll={checkScroll} className="flex gap-6 overflow-x-auto pb-4 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`div[data-scroll-container]::-webkit-scrollbar { display: none; }`}</style>
              {howItWorks.map((step, i) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="min-w-[300px] sm:min-w-[340px] p-8 rounded-3xl border border-white/10 flex-shrink-0 backdrop-blur-sm hover:border-white/20 transition-all duration-300 group"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black transition-all duration-300 group-hover:scale-110" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366F1' }}>
                        {step.num}
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                        <Icon size={20} style={{ color: '#22D3EE' }} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3 — WHO WE ARE */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 60%)' }} />
        </div>

        <motion.div {...fadeUp} className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.span {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4 block">Who We Are</motion.span>
            <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-black leading-tight max-w-3xl mx-auto">
              We believe the best ideas deserve a real chance.
              <br />
              <span className="text-white/40">Not just a pitch deck. A competition.</span>
            </motion.h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-3xl border border-white/10 text-center backdrop-blur-sm hover:border-white/20 transition-all"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-5 overflow-hidden border-2 border-white/10" style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <Image src="/placeholder-user.jpg" alt={member.name} width={80} height={80} className="w-full h-full object-cover opacity-70" />
                </div>
                <h4 className="font-bold text-sm mb-1">{member.name}</h4>
                <p className="text-xs font-semibold" style={{ color: '#6366F1' }}>{member.role}</p>
                <p className="text-xs text-white/40 mt-2">{member.bio}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
            <motion.div {...fadeUp} className="p-6 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Founded</p>
              <p className="text-lg font-bold">Southern Africa</p>
            </motion.div>
            <motion.div {...fadeUp} className="p-6 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Our Goal</p>
              <p className="text-lg font-bold" style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fund 100 ideas by end of 2026</p>
            </motion.div>
            <motion.div {...fadeUp} className="p-6 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Backed By</p>
              <p className="text-lg font-bold">Community</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 4 — LIVE COMPETITIONS */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%)' }} />
        </div>

        <motion.div {...fadeUp} className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.span {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4 block">Live Competitions</motion.span>
            <motion.h2 {...fadeUp} className="text-4xl sm:text-5xl font-black">
              Enter the{' '}
              <span style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Arena
              </span>
            </motion.h2>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-zed-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : competitions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((comp, i) => {
                const daysLeft = Math.max(0, Math.ceil((new Date(comp.submission_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                return (
                  <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="p-8 rounded-3xl border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 group"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Trophy size={24} style={{ color: '#6366F1' }} />
                      <h3 className="font-bold text-lg">{comp.title}</h3>
                    </div>

                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Prize Pool</p>
                      <p className="text-3xl font-black prize-pool-card" style={{ color: '#6366F1' }}>
                        <span className="amount">${(comp.prize_pool_cents / 100).toLocaleString()}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mb-6 text-sm">
                      <div className="flex items-center gap-2 text-white/50">
                        <Clock size={14} />
                        <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/50">
                        <DollarSign size={14} />
                        <span>${(comp.entry_fee_cents / 100).toFixed(2)} entry</span>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/competitions/${comp.id}`}
                      className="group inline-flex items-center gap-2 text-sm font-bold transition-all"
                      style={{ color: '#22D3EE' }}
                    >
                      Enter Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <motion.div {...fadeUp} className="text-center py-20">
              <Trophy size={48} className="mx-auto mb-6 text-white/20" />
              <h3 className="text-2xl font-bold mb-3">First competition launching soon</h3>
              <p className="text-white/50 max-w-md mx-auto">Be the first to know. Sign up and get notified when we go live.</p>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* SECTION 5 — CTA + FOOTER */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(34,211,238,0.1) 30%, transparent 60%)' }} />
        </div>

        <motion.div {...fadeUp} className="relative z-10 text-center max-w-3xl mx-auto mb-32">
          <motion.h2
            {...fadeUp}
            className="text-5xl sm:text-7xl font-black mb-6 leading-tight"
            style={{ background: 'linear-gradient(135deg,#fff 0%,#6366F1 50%,#22D3EE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Your idea deserves a stage.
          </motion.h2>
          <motion.p {...fadeUp} className="text-lg text-white/50 mb-12 max-w-lg mx-auto leading-relaxed">
            Join thousands of innovators competing for real funding.
          </motion.p>
          <motion.div {...fadeUp}>
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-full text-base font-bold transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)', boxShadow: '0 0 40px rgba(99,102,241,0.3)' }}
            >
              Get Started — It&apos;s Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative z-10 w-full max-w-5xl mx-auto border-t border-white/10 pt-12"
        >
          <div className="grid sm:grid-cols-3 gap-8 mb-12 text-center sm:text-left">
            <div>
              <div className="flex items-center gap-3 justify-center sm:justify-start mb-4">
                <Image src="/logo-icon.png" alt="ZedIdeaArena" width={24} height={24} className="object-contain opacity-50" />
                <span className="text-sm font-bold text-white/50">ZedIdeaArena</span>
              </div>
              <p className="text-xs text-white/30 leading-relaxed max-w-xs mx-auto sm:mx-0">Empowering innovators across Africa and beyond. Where ideas compete and winners are made.</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Platform</p>
              <div className="flex flex-col gap-3">
                <Link href="/competitions" className="text-sm text-white/50 hover:text-white transition-colors">Competitions</Link>
                <Link href="/docs/rules" className="text-sm text-white/50 hover:text-white transition-colors">Rules</Link>
                <Link href="/docs/terms" className="text-sm text-white/50 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/docs/privacy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Connect</p>
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <a href="#" className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-all text-white/50 hover:text-white">
                  <Twitter size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-all text-white/50 hover:text-white">
                  <Linkedin size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-all text-white/50 hover:text-white">
                  <Camera size={18} />
                </a>
              </div>
            </div>
          </div>
          <div className="text-center pb-8">
            <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} ZedIdeaArena. All rights reserved.</p>
          </div>
        </motion.footer>
      </section>
    </div>
  )
}
