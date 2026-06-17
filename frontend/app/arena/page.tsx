"use client"

import { useState } from "react"
import { Trophy, Users, Clock, ArrowRight, Flame, TrendingUp, Award, Star, Settings } from "lucide-react"
import Layout from "../components/Layout"
import AppearanceSettings from "../components/AppearanceSettings"

interface Competition {
  id: string
  title: string
  description: string
  participants: number
  prize: string
  deadline: string
  status: "active" | "upcoming" | "ended"
  category: string
  difficulty: "easy" | "medium" | "hard"
  image: string
}

const mockCompetitions: Competition[] = [
  {
    id: "1",
    title: "AI Innovation Challenge",
    description: "Build the most innovative AI-powered solution for everyday problems",
    participants: 234,
    prize: "$5,000",
    deadline: "2024-03-15",
    status: "active",
    category: "AI/ML",
    difficulty: "hard",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecbd995?w=800&h=400&fit=crop",
  },
  {
    id: "2",
    title: "Web3 Hackathon",
    description: "Create decentralized applications that push the boundaries of blockchain",
    participants: 156,
    prize: "$3,000",
    deadline: "2024-03-20",
    status: "active",
    category: "Web3",
    difficulty: "medium",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938dd4?w=800&h=400&fit=crop",
  },
  {
    id: "3",
    title: "Mobile App Showcase",
    description: "Design and build the next generation mobile experience",
    participants: 189,
    prize: "$4,000",
    deadline: "2024-03-25",
    status: "active",
    category: "Mobile",
    difficulty: "easy",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7c9e?w=800&h=400&fit=crop",
  },
]

export default function ArenaPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filters = ["all", "AI/ML", "Web3", "Mobile", "Design", "DevOps"]

  const filteredCompetitions = mockCompetitions.filter((comp) => {
    const matchesFilter = activeFilter === "all" || comp.category === activeFilter
    const matchesSearch = comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[var(--bg-secondary)] to-[var(--bg-primary)]">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b29295a0?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f1a]/80 via-[var(--bg-secondary)]/60 to-[var(--bg-primary)]/90" />
          
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)]/80 border border-[var(--border)] mb-6">
              <Flame className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-[var(--text-accent)] text-sm font-medium">Live Competitions</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] mb-6">
              Welcome to the <span className="text-gradient">Arena</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
              Compete with the best, showcase your skills, and win amazing prizes
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-3.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#6366f1]/30 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                Join Competition
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-3.5 border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] transition-all duration-300">
                View Leaderboard
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Trophy, label: "Active Competitions", value: "12", color: "text-[#f59e0b]" },
              { icon: Users, label: "Participants", value: "1,234", color: "text-[#22d3ee]" },
              { icon: Award, label: "Prizes Awarded", value: "$50K", color: "text-[#a78bfa]" },
              { icon: Star, label: "Success Rate", value: "94%", color: "text-[#34d399]" },
            ].map((stat, index) => (
              <div key={index} className="glass-card rounded-xl p-6 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                    <p className="text-[var(--text-secondary)] text-sm">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Competitions Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
                  Active Competitions
                </h2>
                <p className="text-[var(--text-secondary)]">Join these exciting challenges and win prizes</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      activeFilter === filter
                        ? "bg-[#6366f1] text-white"
                        : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#2e2e5a]"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              <AppearanceSettings />
            </div>

            {/* Search */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search competitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[#64748b] focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 transition-all duration-300"
              />
            </div>

            {/* Competition Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompetitions.map((competition) => (
                <div
                  key={competition.id}
                  className="glass-card rounded-xl overflow-hidden card-hover group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={competition.image}
                      alt={competition.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        competition.status === "active"
                          ? "bg-[#34d399]/20 text-[#34d399]"
                          : "bg-[#f59e0b]/20 text-[#f59e0b]"
                      }`}>
                        {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-[var(--bg-card)] rounded text-xs font-medium text-[var(--text-accent)]">
                        {competition.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        competition.difficulty === "easy"
                          ? "bg-[#34d399]/20 text-[#34d399]"
                          : competition.difficulty === "medium"
                          ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                          : "bg-[#ef4444]/20 text-[#ef4444]"
                      }`}>
                        {competition.difficulty.charAt(0).toUpperCase() + competition.difficulty.slice(1)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--text-accent)] transition-colors duration-300">
                      {competition.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                      {competition.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{competition.participants}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{competition.deadline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-5 h-5 text-[#f59e0b]" />
                        <span className="text-[var(--text-primary)] font-bold">{competition.prize}</span>
                      </div>
                      <button className="px-4 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-[#4338ca] transition-colors duration-300 flex items-center gap-1">
                        Join Now
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-6 h-6 text-[#22d3ee]" />
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Trending Now</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCompetitions.slice(0, 3).map((competition) => (
                <div
                  key={`trending-${competition.id}`}
                  className="glass-card rounded-xl p-6 card-hover"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={competition.image}
                        alt={competition.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 truncate">
                        {competition.title}
                      </h3>
                      <p className="text-[var(--text-secondary)] text-sm mb-2">{competition.category}</p>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {competition.participants}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-[#f59e0b]" />
                          {competition.prize}
                        </span>
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
