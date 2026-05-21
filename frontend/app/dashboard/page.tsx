'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { VerificationBanner } from '@/components/dashboard/KycBanner'
import { TrendingUp, FileText, Clock, CheckCircle, ArrowRight, Lightbulb, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ideaService } from '@/services/idea'
import { authService } from '@/services/auth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [ideas, setIdeas] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ideasRes, profileRes] = await Promise.all([
          ideaService.getUserIdeas(),
          authService.getProfile(),
        ])
        setIdeas(ideasRes.data || [])
        setProfile(profileRes.data || null)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = [
    { icon: FileText, label: 'Total Ideas', value: ideas.length.toString(), color: 'text-zed-primary' },
    { icon: Clock, label: 'Drafts', value: ideas.filter(i => i.status === 'draft').length.toString(), color: 'text-yellow-400' },
    { icon: CheckCircle, label: 'Published', value: ideas.filter(i => i.status === 'submitted' && i.payment_status === 'paid').length.toString(), color: 'text-zed-success' },
  ]

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-zed-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            <div className="container-zed py-8">
              <div className="mb-12 animate-zed-fade-up flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-black gradient-text mb-2 drop-shadow-lg">Welcome Back!</h1>
                  <p className="text-zed-foreground-secondary font-medium">Manage your ideas and track your progress in the Arena</p>
                </div>
                <Link href="/dashboard/ideas/new" className="btn-primary px-8 h-14 flex items-center gap-3 text-sm font-black uppercase tracking-widest shadow-lg shadow-zed-primary/30">
                  <Lightbulb size={20} /> New Idea <ChevronRight size={18} />
                </Link>
              </div>

              <VerificationBanner
                status={profile?.is_verified ? 'verified' : 'unverified'}
                isVerified={profile?.is_verified}
              />

              <div className="grid md:grid-cols-3 gap-8 mb-12 perspective-1000">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={index} className="card-zed glass-premium tilt-3d group p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`p-3 rounded-2xl bg-zed-primary/20 ${stat.color} floating`}>
                          <Icon size={28} className="drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                        </div>
                        <TrendingUp size={20} className="text-zed-success animate-pulse" />
                      </div>
                      <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                      <p className="text-4xl font-black text-zed-foreground glow-counter">{stat.value}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-zed-foreground">Your Recent Ideas</h2>
                  <Link href="/dashboard/ideas/new" className="btn-primary text-sm">New Idea</Link>
                </div>

                <div className="card-zed glass-premium overflow-hidden border-white/5">
                  <div className="overflow-x-auto">
                    {ideas.length === 0 ? (
                      <div className="text-center py-20 bg-black/10">
                        <FileText className="mx-auto mb-6 text-zed-primary opacity-20 floating" size={64} />
                        <p className="text-zed-foreground-secondary text-lg italic">No ideas found. Start your journey by creating a new one!</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-zed-border">
                            <th className="px-6 py-4 text-left text-sm font-bold text-zed-foreground-secondary">Title</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-zed-foreground-secondary">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-zed-foreground-secondary">Votes</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-zed-foreground-secondary">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ideas.map((idea: any) => (
                            <tr key={idea.id} className="border-b border-zed-border hover:bg-zed-surface/50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-medium text-zed-foreground">{idea.title}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-3 py-1 rounded-zed-pill text-xs font-bold ${idea.status === 'submitted' && idea.payment_status === 'paid' ? 'bg-zed-success/20 text-zed-success' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                  {idea.status === 'submitted' && idea.payment_status === 'paid' ? 'Published' : idea.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-zed-foreground">{idea.votes_count || 0}</td>
                              <td className="px-6 py-4">
                                <Link href={`/dashboard/ideas/${idea.id}`} className="text-zed-primary hover:text-zed-accent transition-colors">
                                  <ArrowRight size={20} />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              {loading && (
                <div className="fixed inset-0 bg-zed-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-zed-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-zed-foreground">Loading Arena...</p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="card-zed-hover cursor-pointer">
                  <h3 className="font-bold text-zed-foreground mb-2">Submit an Idea</h3>
                  <p className="text-sm text-zed-foreground-secondary mb-4">Got a brilliant idea? Submit it to one of our active competitions and compete for funding.</p>
                  <Link href="/dashboard/ideas/new" className="text-zed-primary hover:text-zed-accent transition-colors flex items-center gap-2">
                    Get Started <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="card-zed-hover cursor-pointer">
                  <h3 className="font-bold text-zed-foreground mb-2">Vote & Support Ideas</h3>
                  <p className="text-sm text-zed-foreground-secondary mb-4">Browse ideas from creators worldwide. Vote for the ones you believe in and help shape the future.</p>
                  <Link href="/dashboard/voting" className="text-zed-primary hover:text-zed-accent transition-colors flex items-center gap-2">
                    Start Voting <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
