"use client"

import { ArrowRight, Zap, Trophy, Users, Star, Shield, Play, Sparkles } from "lucide-react"
import Layout from "./components/Layout"

const features = [
  { icon: Trophy, title: "Compete & Win", desc: "Join exciting competitions and win amazing prizes while showcasing your skills", color: "#f59e0b" },
  { icon: Users, title: "Join Community", desc: "Connect with thousands of creators, developers, and innovators worldwide", color: "#22d3ee" },
  { icon: Star, title: "Get Recognized", desc: "Build your portfolio and get noticed by top companies and recruiters", color: "#a78bfa" },
  { icon: Shield, title: "Secure Platform", desc: "Fair judging, transparent rules, and secure payments guaranteed", color: "#34d399" },
]

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "500+", label: "Competitions" },
  { value: "$2M+", label: "Prizes Awarded" },
  { value: "95%", label: "Satisfaction" },
]

const testimonials = [
  { name: "Sarah Chen", role: "Full Stack Developer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", content: "Zedidea helped me win my first hackathon and land a job at a top tech company!", rating: 5 },
  { name: "Marcus Johnson", role: "UI/UX Designer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", content: "The best platform for designers to showcase their skills and earn recognition.", rating: 5 },
  { name: "Elena Rodriguez", role: "AI Researcher", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", content: "Amazing community and challenging competitions that push you to innovate.", rating: 5 },
]

const howItWorks = [
  { step: "01", title: "Create Account", desc: "Sign up for free and complete your profile", icon: Users },
  { step: "02", title: "Join Competition", desc: "Browse and enter exciting challenges", icon: Trophy },
  { step: "03", title: "Win & Grow", desc: "Earn prizes and build your reputation", icon: Star },
]

function ctaClasses(base: string) {
  return `${base} px-8 py-4 font-bold rounded-xl transition-all duration-300`
}

export default function LandingPage() {
  return (
    <Layout>
      <div className="min-h-screen" style={{
        background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)"
      }}>
        {/* ===== Hero ===== */}
        <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
              style={{ backgroundColor: "var(--color-primary-500)" }} />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
              style={{ backgroundColor: "var(--color-primary-400)" }} />
          </div>

          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{ backgroundColor: "var(--badge-bg)", border: "1px solid var(--border)" }}>
              <Sparkles className="w-4 h-4" style={{ color: "var(--color-accent-400)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text-accent)" }}>
                Join the Future of Competition
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ color: "var(--text-primary)" }}>
              Where Ideas<br /><span className="gradient-text">Compete & Shine</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{ color: "var(--text-secondary)" }}>
              Join thousands of creators, developers, and innovators competing in exciting challenges.
              Win prizes, build your portfolio, and get noticed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className={ctaClasses("w-full sm:w-auto text-white flex items-center justify-center gap-2")}
                style={{ background: "var(--gradient-accent)" }}>
                Start Competing Now <ArrowRight className="w-5 h-5" />
              </button>
              <button className={ctaClasses("w-full sm:w-auto flex items-center justify-center gap-2")}
                style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--surface-hover)"; e.currentTarget.style.borderColor = "var(--border-hover)" }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "var(--border)" }}>
                <Play className="w-5 h-5" /> Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Features ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                Why Choose <span className="gradient-text">Zedidea</span>?
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                Everything you need to compete, create, and succeed
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 card-hover group">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${f.color}15` }}>
                    <f.icon className="w-7 h-7" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                  <p style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== How It Works ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--bg-secondary)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                How It <span className="gradient-text">Works</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                Get started in three simple steps
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorks.map((item, i) => (
                <div key={i} className="relative">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5"
                      style={{ background: "linear-gradient(90deg, var(--color-primary-500) 0%, transparent 100%)" }} />
                  )}
                  <div className="glass-card rounded-2xl p-8 text-center">
                    <div className="text-5xl font-bold mb-4" style={{ color: "var(--color-primary-200)", opacity: 0.2 }}>
                      {item.step}
                    </div>
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: "var(--surface)" }}>
                      <item.icon className="w-8 h-8" style={{ color: "var(--color-primary-500)" }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
                    <p style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Testimonials ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                Loved by <span className="gradient-text">Thousands</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                See what our community has to say
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 card-hover">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-5 h-5" style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                    ))}
                  </div>
                  <p className="mb-6" style={{ color: "var(--text-primary)" }}>&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{t.name}</p>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)" }} />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                  Ready to Start Competing?
                </h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                  Join thousands of creators and developers who are already competing and winning
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button className={ctaClasses("text-white")}
                    style={{ background: "var(--gradient-accent)" }}>
                    Get Started Free
                  </button>
                  <button className={ctaClasses("")}
                    style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--surface-hover)"; e.currentTarget.style.borderColor = "var(--border-hover)" }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "var(--border)" }}>
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
