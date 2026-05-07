'use client'

import { ArrowRight, Zap, Users, Trophy, Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true)
  const [stats, setStats] = useState({
    activeIdeas: 0,
    communityMembers: 0,
    fundingDistributed: 0,
    countries: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/global')
        if (res.status === 'success') {
          setStats(res.data)
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.remove('light')
    } else {
      root.classList.add('light')
    }
  }, [isDark])

  return (
    <div className="min-h-screen overflow-hidden dark:bg-black bg-slate-50 relative">
      {/* 3D Background Layer */}
      <div className="fixed inset-0 z-0 opacity-40 dark:opacity-60 pointer-events-none">
        <img 
          src="/hero_3d_arena_bg_1777051043555.png" 
          alt="Arena Background" 
          className="w-full h-full object-cover scale-110 blur-[2px] floating"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-premium border-b border-white/10">
        <div className="container-zed flex items-center justify-between h-16">
          <div className="flex items-center gap-3 floating">
            <img src="/logo-icon.png" alt="ZedIdeaArena" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
            <span className="font-bold text-lg gradient-text hidden sm:inline tracking-tighter">ZedIdeaArena</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="btn-icon glass"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
            <Link href="/auth/login" className="btn-secondary text-sm click-push">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm glow-primary click-push">
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 relative z-10 perspective-1000">
        <div className="container-zed text-center animate-zed-fade-up">
          <div className="inline-block px-4 py-1.5 rounded-full border border-zed-primary/30 bg-zed-primary/5 text-zed-primary text-xs font-bold mb-6 tracking-widest uppercase floating">
            Welcome to the future of Innovation
          </div>
          <h1 className="text-6xl sm:text-8xl font-black mb-6 leading-[0.9] dark:text-white text-slate-900 drop-shadow-2xl">
            <span className="gradient-text">PITCH.</span> <br className="hidden sm:block" />
            <span className="dark:text-white">COMPETE.</span> <br className="hidden sm:block" />
            <span className="gradient-text">WIN.</span>
          </h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto dark:text-gray-300 text-slate-600 font-medium leading-relaxed">
            Bring your boldest ideas to the arena. Compete with innovators worldwide. <br className="hidden sm:inline" /> 
            Secure funding and recognition in a 3D decentralized ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/auth/signup" className="btn-primary flex items-center justify-center gap-2 px-10 py-5 text-lg glow-primary click-push">
              Enter Arena <ArrowRight size={24} />
            </Link>
            <button className="btn-secondary px-10 py-5 text-lg glass-premium click-push">
              Learn More
            </button>
          </div>

          {/* Decorative Element */}
          <div className="mt-20 relative h-96 flex items-center justify-center">
            <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
            <img
              src={isDark ? "/logo-full-dark.png" : "/logo-full-light.png"}
              alt="ZedIdeaArena Logo"
              className="relative z-10 w-64 h-64 object-contain transition-all duration-500"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-white/10 dark:border-white/10">
        <div className="container-zed">
          <h2 className="text-4xl font-bold text-center mb-16 dark:text-white text-slate-900">
            The Complete Arena
          </h2>
          <div className="grid md:grid-cols-3 gap-8 perspective-1000">
            {/* Feature 1 */}
            <div className="card-zed-hover group glass-premium tilt-3d p-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:bg-indigo-500/30 transition-all floating">
                <Zap className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white text-slate-900">Pitch Your Ideas</h3>
              <p className="dark:text-gray-400 text-slate-600 leading-relaxed">
                Submit your innovative ideas through our streamlined multi-step submission process. Showcase your vision with media, descriptions, and impact metrics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-zed-hover group glass-premium tilt-3d p-8">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-all floating-delayed">
                <Users className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white text-slate-900">Compete Globally</h3>
              <p className="dark:text-gray-400 text-slate-600 leading-relaxed">
                Go head-to-head with innovators worldwide. Vote on others' ideas, build your reputation, and climb the leaderboards through community engagement.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-zed-hover group glass-premium tilt-3d p-8">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-all floating">
                <Trophy className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white text-slate-900">Win & Get Funded</h3>
              <p className="dark:text-gray-400 text-slate-600 leading-relaxed">
                Top ideas win real funding and investor attention. Secure partnerships, build your community, and turn your vision into reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container-zed">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="card-zed text-center glass-premium tilt-3d">
              <div className="text-5xl font-black gradient-text mb-2 glow-counter">{stats.activeIdeas}</div>
              <p className="dark:text-gray-400 text-slate-600 text-xs font-bold tracking-tighter uppercase">Active Ideas</p>
            </div>
            <div className="card-zed text-center glass-premium tilt-3d">
              <div className="text-5xl font-black gradient-text mb-2 glow-counter">{stats.communityMembers}</div>
              <p className="dark:text-gray-400 text-slate-600 text-xs font-bold tracking-tighter uppercase">Community Members</p>
            </div>
            <div className="card-zed text-center glass-premium tilt-3d">
              <div className="text-5xl font-black text-green-500 mb-2 glow-counter">${(stats.fundingDistributed / 1000).toFixed(0)}K+</div>
              <p className="dark:text-gray-400 text-slate-600 text-xs font-bold tracking-tighter uppercase">Funding Distributed</p>
            </div>
            <div className="card-zed text-center glass-premium tilt-3d">
              <div className="text-5xl font-black gradient-text mb-2 glow-counter">{stats.countries}+</div>
              <p className="dark:text-gray-400 text-slate-600 text-xs font-bold tracking-tighter uppercase">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/10 dark:border-white/10">
        <div className="container-zed text-center">
          <h2 className="text-4xl font-bold mb-6 dark:text-white text-slate-900">
            Ready to Enter the Arena?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto dark:text-gray-400 text-slate-600">
            Join thousands of innovators competing for recognition and funding.
          </p>
          <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2">
            Start Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10 dark:border-white/10 text-center dark:text-gray-400 text-slate-600 bg-white/5 dark:bg-black/50 backdrop-blur-xl">
        <div className="container-zed max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="ZedIdeaArena" className="w-6 h-6 object-contain grayscale opacity-50" />
            <p className="text-sm font-medium">&copy; {new Date().getFullYear()} ZedIdeaArena. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-xs">
            <Link href="/docs/rules" className="hover:text-zed-primary transition-colors">Rules</Link>
            <Link href="/docs/terms" className="hover:text-zed-primary transition-colors">Terms</Link>
            <Link href="/docs/privacy" className="hover:text-zed-primary transition-colors">Privacy</Link>
            <Link href="/docs/video-guidelines" className="hover:text-zed-primary transition-colors">Video Guidelines</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
