'use client'

import { ArrowRight, ChevronLeft, ChevronRight, Users, Trophy, Zap, Play, Clock, DollarSign, Star, Glasses, Sparkles, TrendingUp, Lightbulb, Shield, Menu, X, Linkedin, Twitter, Camera, MessageCircle, Award } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { team } from '@/lib/team'
import { social } from '@/lib/social'
import { AdBanner } from '@/components/ads/AdBanner'
import { HorizontalScroll } from '@/components/HorizontalScroll'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
}

const steps = [
  { num: '01', icon: '👤', title: 'Sign Up', desc: 'Create your account in seconds. Free forever. No credit card needed.' },
  { num: '02', icon: '🎭', title: 'Choose Your Role', desc: 'Contestant: submit your idea. Voter: judge entries and earn rewards.' },
  { num: '03', icon: '🏟️', title: 'Enter a Competition', desc: 'Pay the entry fee. It goes straight to the prize pool.' },
  { num: '04', icon: '💡', title: 'Submit Your Idea', desc: 'Pitch your idea with a title, problem statement, solution, and YouTube video.' },
  { num: '05', icon: '🗳️', title: 'Get Voted On', desc: 'Verified voters review and judge every submission fairly.' },
  { num: '06', icon: '💰', title: 'Winners Get Paid', desc: 'Top ideas split the prize pool. 1st: 25%, 2nd: 10%, 3rd: 5%.' },
]

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

function AnimatedStat({ value, prefix = '', suffix = '+', label, icon: Icon }: { value: number; prefix?: string; suffix?: string; label: string; icon: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!ref.current || entered) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !entered) {
          setEntered(true)
          const end = value
          const duration = 1500
          const step = end / (duration / 16)
          const timer = setInterval(() => {
            setDisplay(prev => {
              const next = prev + step
              if (next >= end) { clearInterval(timer); return end }
              return Math.floor(next)
            })
          }, 16)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, entered])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center p-6 rounded-2xl border border-white/5"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(99,102,241,0.1)' }}>
        <Icon size={18} style={{ color: '#6366F1' }} />
      </div>
      <p className="text-2xl sm:text-3xl font-black mb-1">
        {prefix}{display.toLocaleString()}{suffix}
      </p>
      <p className="text-xs text-white/40 font-semibold">{label}</p>
    </motion.div>
  )
}

function VideoPlayer() {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlay = () => {
    setPlaying(true)
    videoRef.current?.play()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 2.4 }}
      className="w-full max-w-lg ml-auto"
    >
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl shadow-zed-primary/10">
        <video
          ref={videoRef}
          src="/videos/landing-hero.mp4"
          preload="metadata"
          className="w-full aspect-video object-contain"
          onEnded={() => setPlaying(false)}
          playsInline
          controls={playing}
        />
        {!playing && (
          <button onClick={handlePlay} className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 hover:bg-black/10 group transition-all duration-300">
            <motion.div
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ background: 'rgba(99,102,241,0.25)' }}
              whileHover={{ scale: 1.15 }}
            >
              <Play size={24} className="text-white ml-0.5" />
            </motion.div>
          </button>
        )}
      </div>
      <p className="text-[10px] text-white/50 mt-2 font-medium text-center">Watch: How ZedIdeaArena works (2 min)</p>
    </motion.div>
  )
}

function TypeWriter({ texts }: { texts: string[] }) {
  const [display, setDisplay] = useState('')
  const [i, setI] = useState(0)
  const [j, setJ] = useState(0)
  const [dir, setDir] = useState(1)

  useEffect(() => {
    const word = texts[i]
    const timer = setTimeout(() => {
      const next = j + dir
      if (next > word.length || next < 0) {
        if (dir === 1) { setDir(-1); return }
        setI((i + 1) % texts.length)
        setJ(0)
        setDir(1)
        return
      }
      setJ(next)
      setDisplay(word.slice(0, next))
    }, dir === 1 ? 140 : 60)
    return () => clearTimeout(timer)
  }, [j, dir, i, texts])

  return <span>{display}<span className="animate-pulse text-zed-primary">|</span></span>
}

export default function LandingPage() {
  const [competitions, setCompetitions] = useState<any[]>([])
  const [compLoading, setCompLoading] = useState(true)
  const [stats, setStats] = useState({ activeIdeas: 0, communityMembers: 0, fundingDistributed: 0, countries: 0 })
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  // Drag scroll state
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragScrollLeft = useRef(0)

  const { scrollYProgress } = useScroll()
  const bgOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.05])
  const navBg = useTransform(scrollYProgress, [0, 0.05], ['rgba(10,10,15,0.5)', 'rgba(10,10,15,0.95)'])
  const navBlur = useTransform(scrollYProgress, [0, 0.05], ['blur(0px)', 'blur(24px)'])
  const heroTextY = useTransform(scrollYProgress, [0, 0.1], [0, 60])
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  useEffect(() => {
    api.get('/stats/global')
      .then((res: any) => {
        if (res?.data?.data) setStats(res.data.data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    api.get('/competitions')
      .then((res: any) => {
        const list = res?.data?.data || []
        const active = list.filter((c: any) => c.calculatedStatus === 'active' || c.calculatedStatus === 'upcoming').slice(0, 3)
        setCompetitions(active)
      })
      .catch(() => {})
      .finally(() => setCompLoading(false))
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

  const handleDragStart = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    dragStartX.current = e.pageX - scrollRef.current.offsetLeft
    dragScrollLeft.current = scrollRef.current.scrollLeft
  }

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - dragStartX.current) * 1.5
    scrollRef.current.scrollLeft = dragScrollLeft.current - walk
  }

  const handleDragEnd = () => setIsDragging(false)

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
            <Link href="/about" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">About</Link>
            <Link href="/how-it-works" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">How It Works</Link>
            <Link href="/pricing" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">Pricing</Link>
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
                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-white/70 hover:text-white">About</Link>
                <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-white/70 hover:text-white">How It Works</Link>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-white/70 hover:text-white">Pricing</Link>
                <Link href="/competitions" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-white/70 hover:text-white">Competitions</Link>
                <Link href="/docs/rules" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-white/70 hover:text-white">Rules</Link>
                <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-white/70 hover:text-white px-4 py-2">Sign In</Link>
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
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden px-6 hero-bg">
        {/* Background — gradient shape left-aligned, overlapping off-page, diagonal fade */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large gradient shape — starts off-page left, fades diagonally */}
          <div
            className="absolute top-0 h-full w-[85vw] max-w-[1100px] opacity-[0.2]"
            style={{
              left: '-22%',
              background: 'linear-gradient(160deg, #6366F1 0%, #22D3EE 40%, transparent 70%)',
              clipPath: 'polygon(0 0, 100% 0, 75% 100%, 0 100%)',
              WebkitClipPath: 'polygon(0 0, 100% 0, 75% 100%, 0 100%)',
            }}
          />
          {/* Secondary subtle gradient — deeper color layer */}
          <div
            className="absolute top-0 h-full w-[70vw] max-w-[800px] opacity-[0.08]"
            style={{
              left: '-15%',
              background: 'linear-gradient(180deg, #000000 0%, #6366F1 50%, transparent 80%)',
              clipPath: 'polygon(0 0, 90% 0, 65% 100%, 0 100%)',
              WebkitClipPath: 'polygon(0 0, 90% 0, 65% 100%, 0 100%)',
            }}
          />
          {/* Diagonal transparent overlay — darkens left, reveals right */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background: 'linear-gradient(135deg, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.6) 35%, rgba(10,10,15,0.2) 60%, transparent 80%)',
            }}
          />
          <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0">
            <motion.div className="absolute w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)', top: '10%', left: '20%' }} animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div className="absolute w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08), transparent)', bottom: '20%', right: '15%' }} animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
          </motion.div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto pt-28 pb-16">
          <HorizontalScroll showControls={false} className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT — Hero Text */}
            <motion.div style={{ y: heroTextY, opacity: heroTextOpacity }}>
              {/* Headline with typewriter */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 tracking-tight text-left"
              >
                Where Ideas <span className="gradient-text">Compete.</span><br />
                And{' '}
                <span className="gradient-text">
                  <TypeWriter texts={['Win.', 'Build.', 'Scale.', 'Fund.', 'Launch.']} />
                </span>
              </motion.h1>

              {/* Glowy purple gradient border card for subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.6 }}
                className="relative mb-10 inline-block"
              >
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-600 opacity-40 blur-[2px] animate-pulse" />
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-600 opacity-60" />
                <div className="relative bg-[#0A0A0F]/80 backdrop-blur-sm rounded-2xl px-6 py-4">
                  <p className="text-base sm:text-lg text-white/70 leading-relaxed font-medium">
                    Submit your idea. Let the world vote.<br />
                    The best idea takes the prize.
                  </p>
                </div>
              </motion.div>

              {/* Buttons — unique layout */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 2 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/auth/signup?role=contestant" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 btn-glow" style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}>
                  Enter as Contestant <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/auth/signup?role=voter" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-bold border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all">
                  Become a Voter <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              {/* Mobile Video */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 2.4 }}
                className="lg:hidden mt-10"
              >
                <VideoPlayer />
              </motion.div>
            </motion.div>

            {/* RIGHT — Video */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="hidden lg:block"
            >
              <VideoPlayer />
            </motion.div>
          </HorizontalScroll>
        </div>

        {/* Scroll Indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5, duration: 1 }}>
          <motion.div className="w-5 h-8 rounded-full border-2 border-white/15 flex items-start justify-center p-1" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
            <motion.div className="w-1 h-1.5 rounded-full" style={{ background: '#6366F1' }} animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
          </motion.div>
        </motion.div>
      </section>

      <SectionDivider />

      {/* Stats Bar — Live Data */}
      <section className="py-16 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedStat value={stats.communityMembers} label="Community Members" icon={Users} />
            <AnimatedStat value={stats.activeIdeas} label="Ideas Submitted" icon={Lightbulb} />
            <AnimatedStat value={stats.fundingDistributed} prefix="$" suffix="+" label="Funding Distributed" icon={DollarSign} />
            <AnimatedStat value={stats.countries} label="Countries" icon={TrendingUp} />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* In-content ad */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <AdBanner />
      </div>

      {/* SECTION 2 — HOW IT WORKS */}
      <section className="py-24 px-6 relative overflow-hidden">
        <FloatingOrb className="top-0 right-0 w-[600px] h-[600px]" color="rgba(99,102,241,0.06)" />
        <motion.div {...fadeUp} className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.span {...fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4 block">How It Works</motion.span>
            <motion.h2 {...fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
              From idea to{' '}
              <span className="gradient-text">funding</span>
              <br className="hidden sm:block" />
              <span className="text-white/30 text-2xl sm:text-3xl lg:text-4xl font-bold block mt-4">in 6 simple steps</span>
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

            <div
              ref={scrollRef}
              onScroll={checkScroll}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              className={`flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
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
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                  <div className="mt-6 h-1 w-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg,#6366F1,#22D3EE)' }} />
                </motion.div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {steps.map((_, i) => (
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

          <motion.div {...fadeUp} className="relative overflow-hidden mb-20" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
            <div className="flex gap-6 animate-carousel" style={{ width: 'max-content' }}>
              {[...team, ...team].map((member, i) => (
                <motion.div
                  key={i}
                  className="w-64 flex-shrink-0 p-6 rounded-3xl border border-white/10 text-center backdrop-blur-sm hover:border-white/20 transition-all duration-300 group"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-full mx-auto mb-5 overflow-hidden border-2 border-white/10 group-hover:border-zed-primary/30 transition-all duration-300"
                    style={{ background: 'rgba(99,102,241,0.1)' }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Image src={member.image} alt={member.name} width={80} height={80} className="w-full h-full object-cover opacity-70" unoptimized />
                  </motion.div>
                  <h4 className="font-bold text-sm mb-1">{member.name}</h4>
                  <p className="text-xs font-semibold" style={{ color: '#6366F1' }}>{member.role}</p>
                  <p className="text-xs text-white/40 mt-2 mb-3">{member.bio}</p>
                  <div className="flex items-center justify-center gap-2">
                    {(member as any).website && (
                      <a href={(member as any).website} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 hover:border-white/30 hover:text-white transition-all text-white/40">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      </a>
                    )}
                    {(member as any).instagram && (
                      <a href={(member as any).instagram} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 hover:border-white/30 hover:text-white transition-all text-white/40">
                        <Camera size={12} />
                      </a>
                    )}
                    {(member as any).linkedin && (member as any).linkedin !== '#' && (
                      <a href={(member as any).linkedin} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 hover:border-white/30 hover:text-white transition-all text-white/40">
                        <Linkedin size={12} />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
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

          {compLoading ? (
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
              <p className="text-white/50 max-w-md mx-auto">Sign up to be notified when we go live.</p>
              <Link
                href="/auth/signup"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-105 btn-glow"
                style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}
              >
                Get Notified <ArrowRight size={16} />
              </Link>
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
          <div className="grid sm:grid-cols-4 gap-8 mb-12 text-center sm:text-left">
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
                <Link href="/about" className="text-sm text-white/50 hover:text-white transition-colors">About</Link>
                <Link href="/how-it-works" className="text-sm text-white/50 hover:text-white transition-colors">How It Works</Link>
                <Link href="/pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</Link>
                <Link href="/competitions" className="text-sm text-white/50 hover:text-white transition-colors">Competitions</Link>
                <Link href="/docs/rules" className="text-sm text-white/50 hover:text-white transition-colors">Rules</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Legal</p>
              <div className="flex flex-col gap-3">
                <Link href="/docs/terms" className="text-sm text-white/50 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/docs/privacy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/docs/rules" className="text-sm text-white/50 hover:text-white transition-colors">Competition Rules</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Connect</p>
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <motion.a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-all text-white/50 hover:text-white"
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  <Twitter size={18} />
                </motion.a>
                <motion.a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-all text-white/50 hover:text-white"
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  <Camera size={18} />
                </motion.a>
                <motion.a
                  href={social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-all text-white/50 hover:text-white"
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  <MessageCircle size={18} />
                </motion.a>
                <motion.a
                  href={`mailto:${social.email}`}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-all text-white/50 hover:text-white"
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </motion.a>
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
