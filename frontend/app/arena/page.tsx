"use client"

import { useState } from "react"
import { Trophy, Users, Clock, ArrowRight, Flame, TrendingUp, Award, Star } from "lucide-react"
import Layout from "../components/Layout"

interface Competition {
  id: string; title: string; description: string
  participants: number; prize: string; deadline: string
  status: "active" | "upcoming" | "ended"; category: string
  difficulty: "easy" | "medium" | "hard"
  image: string
}

const competitions: Competition[] = [
  { id:"1", title:"AI Innovation Challenge", description:"Build the most innovative AI-powered solution for everyday problems", participants:234, prize:"$5,000", deadline:"2024-03-15", status:"active", category:"AI/ML", difficulty:"hard", image:"https://images.unsplash.com/photo-1677442136019-21780ecbd995?w=800&h=400&fit=crop" },
  { id:"2", title:"Web3 Hackathon", description:"Create decentralized applications that push the boundaries of blockchain", participants:156, prize:"$3,000", deadline:"2024-03-20", status:"active", category:"Web3", difficulty:"medium", image:"https://images.unsplash.com/photo-1639762681485-074b7f938dd4?w=800&h=400&fit=crop" },
  { id:"3", title:"Mobile App Showcase", description:"Design and build the next generation mobile experience", participants:189, prize:"$4,000", deadline:"2024-03-25", status:"active", category:"Mobile", difficulty:"easy", image:"https://images.unsplash.com/photo-1512941937669-90a1b58e7c9e?w=800&h=400&fit=crop" },
]

const statIcon = { color: "var(--text-secondary)" }

export default function ArenaPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filters = ["all", "AI/ML", "Web3", "Mobile", "Design", "DevOps"]

  const filtered = competitions.filter(c => {
    const mf = activeFilter === "all" || c.category === activeFilter
    const ms = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               c.description.toLowerCase().includes(searchQuery.toLowerCase())
    return mf && ms
  })

  return (
    <Layout>
      <div
        className="min-h-screen"
        style={{ background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)" }}
      >
        {/* ===== Hero ===== */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1550745165-9bc0b29295a0?w=1920&h=1080&fit=crop)" }} />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(180deg, var(--bg-primary) 0%, rgba(26,26,46,0.6) 50%, var(--bg-primary) 100%)"
          }} />

          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: "var(--badge-bg)", border: "1px solid var(--border)" }}>
              <Flame className="w-4 h-4" style={{ color: "#f59e0b" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text-accent)" }}>Live Competitions</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
              Welcome to the <span className="gradient-text">Arena</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8" style={{ color: "var(--text-secondary)" }}>
              Compete with the best, showcase your skills, and win amazing prizes
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                className="px-8 py-3.5 text-white font-bold rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                style={{ background: "var(--gradient-accent)" }}>
                Join Competition <ArrowRight className="w-5 h-5" />
              </button>
              <button
                className="px-8 py-3.5 font-semibold rounded-lg transition-all duration-300"
                style={{ border: "1px solid var(--border)", color: "var(--text-primary)", backgroundColor: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--surface-hover)"; e.currentTarget.style.borderColor = "var(--border-hover)" }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "var(--border)" }}>
                View Leaderboard
              </button>
            </div>
          </div>
        </section>

        {/* ===== Stats ===== */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Trophy, label: "Active Competitions", value: "12", color: "#f59e0b" },
              { icon: Users, label: "Participants", value: "1,234", color: "#22d3ee" },
              { icon: Award, label: "Prizes Awarded", value: "$50K", color: "#a78bfa" },
              { icon: Star, label: "Success Rate", value: "94%", color: "#34d399" },
            ].map((stat, idx) => (
              <div key={idx} className="glass-card rounded-xl p-6 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--surface)" }}>
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Competitions ===== */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Active Competitions
                </h2>
                <p style={{ color: "var(--text-secondary)" }}>Join these exciting challenges and win prizes</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                    style={{
                      backgroundColor: activeFilter === f ? "var(--filter-active-bg)" : "var(--filter-inactive-bg)",
                      color: activeFilter === f ? "var(--filter-active-text)" : "var(--filter-inactive-text)",
                    }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search competitions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full max-w-md px-4 py-3 rounded-lg focus:outline-none transition-all duration-300"
                style={{
                  backgroundColor: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--input-text)",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--input-focus-border)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--input-focus-ring)" }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--input-border)"; e.currentTarget.style.boxShadow = "none" }}
              />
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(c => {
                const diffColor = c.difficulty === "easy" ? "#34d399" : c.difficulty === "medium" ? "#f59e0b" : "#ef4444"
                return (
                  <div key={c.id} className="glass-card rounded-xl overflow-hidden card-hover group">
                    <div className="relative h-48 overflow-hidden">
                      <img src={c.image} alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0" style={{
                        background: "linear-gradient(to top, var(--bg-primary) 0%, transparent 50%)"
                      }} />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: c.status === "active" ? "rgba(52,211,153,0.2)" : "rgba(245,158,11,0.2)",
                            color: c.status === "active" ? "#34d399" : "#f59e0b",
                          }}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: "var(--tag-bg)", color: "var(--tag-text)" }}>
                          {c.category}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: `${diffColor}20`, color: diffColor }}>
                          {c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 transition-colors duration-300"
                        style={{ color: "var(--text-primary)" }}>
                        {c.title}
                      </h3>
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {c.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                          <span className="flex items-center gap-1"><Users className="w-4 h-4" />{c.participants}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{c.deadline}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-5 h-5" style={{ color: "#f59e0b" }} />
                          <span className="font-bold" style={{ color: "var(--text-primary)" }}>{c.prize}</span>
                        </span>
                        <button
                          className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-300 flex items-center gap-1"
                          style={{ backgroundColor: "var(--color-primary-500)" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--color-primary-700)"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--color-primary-500)"}>
                          Join Now <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ===== Trending ===== */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-6 h-6" style={{ color: "var(--color-accent-400)" }} />
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.slice(0, 3).map(c => (
                <div key={`tr-${c.id}`} className="glass-card rounded-xl p-6 card-hover">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold mb-1 truncate" style={{ color: "var(--text-primary)" }}>
                        {c.title}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>{c.category}</p>
                      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.participants}</span>
                        <span className="flex items-center gap-1"><Trophy className="w-3 h-3" style={{ color: "#f59e0b" }} />{c.prize}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
