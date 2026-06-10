'use client'

import { ArrowRight, ChevronLeft, ChevronRight, Users, Trophy, Zap, Play, Clock, DollarSign, Star, Glasses, Camera, Linkedin, Twitter, Sparkles, TrendingUp, Lightbulb, Shield, Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
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

function useCountUp(end: number, duration = 2) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!ref.current || entered) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !entered) {
          setEntered(true)
          let start = 0
          const step = Math.ceil(end / (duration * 60))
          const timer = setInterval(() => {
            start += step
            if (start >= end) {
              setCount(end)
              clearInterval(timer)
            } else {
              setCount(start)
            }
          }, 16)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration, entered])

  return { count, ref }
}

function SectionDivider() {
  return (
    <div className="relative h-32 sm:h-48">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.03), transparent)' }} />
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-px h-16" style={{ background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.3), transparent)' }} />
    </div>
  )
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

export default function LandingPage() {
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll()
  const bgOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.05])
  const navBg = useTransform(scrollYProgress, [0, 0.05], ['rgba(10,10,15,0.5)', 'rgba(10,10,15,0.95)'])
  const navBlur = useTransform(scrollYProgress, [0, 0.05], ['blur(0px)', 'blur(24px)'])

  const heroTextY = useTransform(scrollYProgress, [0, 0.1], [0, 60])
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  const stats = [
    { label: 'Active Users', value: 1250, suffix: '+', icon: Users },
    { label: 'Ideas Submitted', value: 340, suffix: '+', icon: Lightbulb },
    { label: 'Prize Pool', value: 5000, prefix: '$', suffix: '+', icon: DollarSign },
    { label: 'Countries', value: 12, suffix: '', icon: TrendingUp },
  ]

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

  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen overflow-x-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 transition-all duration-300"
        style={{ background: navBg, backdropFilter: navBlur }}
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

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/competitions" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">Competitions</Link>
            <Link href="/docs/rules" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">Rules</Link>
            <div className="w-px h-4 bg-white/10" />
            <Link href="/auth/login" className="text-sm font-semibold text-white/70 hover:text-white transition-colors px-4 py-2">Sign In</Link>
            <Link href="/auth/signup" className="text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 btn-glow" style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}>
              Join Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white/70">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 overflow-hidden"
              style={{ background: 'rgba(10,10,15,0.98)' }}
            >
              <div className="px-6 py-6 space-y-4">
                <Link href="/competitions" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-white/70 hover:text-white transition-colors">Competitions</Link>
                <Link href="/docs/rules" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-white/70 hover:text-white transition-colors">Rules</Link>
                <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-white/70 hover:text-white transition-colors px-4 py-2">Sign In</Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold px-5 py-2.5 rounded-full text-center btn-glow" style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}>
                    Join Now
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* SECTION 1 — HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,10,15,0.92) 0%, rgba(10,10,15,0.6) 50%, rgba(10,10,15,0.92) 100%)' }} />
          <FloatingOrb className="top-1/4 left-1/4 w-[500px] h-[500px]" color="rgba(99,102,241,0.15)" />
          <FloatingOrb className="bottom-1/3 right-1/4 w-[400px] h-[400px]" color="rgba(34,211,238,0.1)" />
        </motion.div>

        <motion.div style={{ y: heroTextY, opacity: heroTextOpacity }} className="relative z-10 max-w-5xl mx-auto text-center pt-24 pb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="mb-10"
          >
            <div className="relative inline-block">
              <Image src="/logo-full-dark.png" alt="ZedIdeaArena" width={120} height={120} className="object-contain drop-shadow-[0_0_40px_rgba(99,102,241,0.5)] relative z-10" />
              <motion.div
                className="absolute inset-0 z-0"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(20px)' }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
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
                className="inline-block gradient-text"
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
            <Link href="/auth/signup?role=contestant" className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 btn-glow" style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}>
              Enter as Contestant <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/signup?role=voter" className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all">
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
            <div className="relative group cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:border-white/20 transition-all duration-300">
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(34,211,238,0.05))' }}
              />
              <div className="aspect-video rounded-xl flex items-center justify-center relative" style={{ background: 'rgba(99,102,241,0.08)' }}>
                <motion.div
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(99,102,241,0.2)' }}
                  whileHover={{ scale: 1.15 }}
                >
                  <Play size={28} className="text-white ml-1" />
                </motion.div>
              </div>
              <p className="text-xs text-white/50 mt-3 font-medium group-hover:text-white/70 transition-colors">Watch: How ZedIdeaArena works (2 min)</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
        >
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#6366F1' }}
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </section>

      <SectionDivider />

      {/* Stats Bar */}
      <section className="py-16 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const { count, ref } = useCountUp(stat.value, 2.5)
              const Icon = stat.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center p-6 rounded-2xl border border-white/5"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <Icon size={18} style={{ color: '#6366F1' }} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black mb-1">
                    <span ref={ref}>{stat.prefix || ''}{count}{stat.suffix || ''}</span>
                  </p>
                  <p className="text-xs text-white/40 font-semibold">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* SECTION 2 — HOW IT WORKS */}
      <section className="py-24 px-6 relative overflow-hidden">
        <FloatingOrb className="top-0 right-0 w-[600px] h-[600px]" color="rgba(99,102,241,0.06)" />
        <motion.div {...fadeUp} className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.span {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4 block">How It Works</motion.span>
            <motion.h2 {...fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
              From idea to{' '}
              <span className="gradient-text">
                funding
              </span>
              <br className="hidden sm:block" />
              <span className="text-white/30 text-2xl sm:text-3xl lg:text-4xl font-bold block mt-4">in 5 simple steps</span>
            </motion.h2>
          </div>

          <div className="relative">
            <div className="flex justify-end gap-3 mb-6">
              <button onClick={() => scrollBy('left')} className={`w-11 h-11 rounded-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-sm transition-all ${canScrollLeft ? 'opacity-100 hover:bg-white/10 hover:border-white/20' : 'opacity-30 cursor-default'}`}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollBy('right')} className={`w-11 h-11 rounded-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-sm transition-all ${canScrollRight ? 'opacity-100 hover:bg-white/10 hover:border-white/20' : 'opacity-30 cursor-default'}`}>
                <ChevronRight size={18} />
              </button>
            </div>

            <div ref={scrollRef} onScroll={checkScroll} className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                    className="min-w-[300px] sm:min-w-[360px] p-8 rounded-3xl border border-white/10 flex-shrink-0 backdrop-blur-sm hover:border-white/20 transition-all duration-300 group snap-start"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366F1', boxShadow: '0 0 20px rgba(99,102,241,0.1)' }}>
                        {step.num}
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                        <Icon size={22} style={{ color: '#22D3EE' }} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                    <div className="mt-6 h-1 w-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg,#6366F1,#22D3EE)' }} />
                  </motion.div>
                )
              })}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {howItWorks.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full transition-all duration-300" style={{ background: i === 0 ? '#6366F1' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <SectionDivider />

      {/* SECTION 3 — WHO WE ARE */}
      <section className="py-24 px-6 relative overflow-hidden">
        <FloatingOrb className="bottom-0 left-0 w-[500px] h-[500px]" color="rgba(34,211,238,0.06)" />
        <motion.div {...fadeUp} className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.span {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4 block">Who We Are</motion.span>
            <motion.h2 {...fadeUp} className="text-4xl sm:text-5xl font-black leading-tight max-w-3xl mx-auto">
              We believe the best ideas deserve{' '}
              <span className="gradient-text">a real chance.</span>
            </motion.h2>
          </div>

          <motion.div {...fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-3xl border border-white/10 text-center backdrop-blur-sm hover:border-white/20 transition-all duration-300 group"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <motion.div
                  className="w-20 h-20 rounded-full mx-auto mb-5 overflow-hidden border-2 border-white/10 group-hover:border-zed-primary/30 transition-all duration-300"
                  style={{ background: 'rgba(99,102,241,0.1)' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Image src="/placeholder-user.jpg" alt={member.name} width={80} height={80} className="w-full h-full object-cover opacity-70" />
                </motion.div>
                <h4 className="font-bold text-sm mb-1">{member.name}</h4>
                <p className="text-xs font-semibold" style={{ color: '#6366F1' }}>{member.role}</p>
                <p className="text-xs text-white/40 mt-2">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
            <motion.div {...fadeUp} className="p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Founded</p>
              <p className="text-lg font-bold">Southern Africa</p>
            </motion.div>
            <motion.div {...fadeUp} className="p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Our Goal</p>
              <p className="text-lg font-bold gradient-text">Fund 100 ideas by end of 2026</p>
            </motion.div>
            <motion.div {...fadeUp} className="p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Backed By</p>
              <p className="text-lg font-bold">Community</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <SectionDivider />

      {/* SECTION 4 — LIVE COMPETITIONS */}
      <section className="py-24 px-6 relative overflow-hidden">
        <FloatingOrb className="top-1/2 left-1/4 w-[500px] h-[500px]" color="rgba(99,102,241,0.06)" />
        <motion.div {...fadeUp} className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.span {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4 block">Live Competitions</motion.span>
            <motion.h2 {...fadeUp} className="text-4xl sm:text-5xl font-black">
              Enter the{' '}
              <span className="gradient-text">Arena</span>
            </motion.h2>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-2 border-zed-primary border-t-transparent rounded-full animate-spin mx-auto" />
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
                      <motion.div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(99,102,241,0.15)' }}
                        whileHover={{ rotate: 10 }}
                      >
                        <Trophy size={20} style={{ color: '#6366F1' }} />
                      </motion.div>
                      <h3 className="font-bold text-lg">{comp.title}</h3>
                    </div>

                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Prize Pool</p>
                      <motion.p
                        className="text-3xl font-black"
                        style={{ color: '#6366F1' }}
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        ${(comp.prize_pool_cents / 100).toLocaleString()}
                      </motion.p>
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

                    <div className="w-full h-px bg-white/5 mb-6" />

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
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(99,102,241,0.1)' }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Trophy size={32} style={{ color: '#6366F1' }} />
              </motion.div>
              <h3 className="text-2xl font-bold mb-3">First competition launching soon</h3>
              <p className="text-white/50 max-w-md mx-auto">Be the first to know. Sign up and get notified when we go live.</p>
            </motion.div>
          )}
        </motion.div>
      </section>

      <SectionDivider />

      {/* SECTION 5 — CTA + FOOTER */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 py-24 overflow-hidden">
        <FloatingOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]" color="rgba(99,102,241,0.08)" />
        <FloatingOrb className="top-1/3 right-1/4 w-[400px] h-[400px]" color="rgba(34,211,238,0.06)" />

        <motion.div {...fadeUp} className="relative z-10 text-center max-w-3xl mx-auto mb-32">
          <motion.span
            {...fadeUp}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6 px-4 py-2 rounded-full border border-white/10"
          >
            <Sparkles size={14} style={{ color: '#6366F1' }} /> Ready to start?
          </motion.span>

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
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-full text-base font-bold transition-all duration-300 hover:scale-105 btn-glow"
              style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}
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
                {[Twitter, Linkedin, Camera].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-all text-white/50 hover:text-white"
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
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


