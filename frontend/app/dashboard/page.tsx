'use client'

import { TrendingUp, FileText, Clock, CheckCircle, ArrowRight, Lightbulb, ChevronRight } from 'lucide-react'
import { AdBanner } from '@/components/ads/AdBanner'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ideaService } from '@/services/idea'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [ideas, setIdeas] = useState<any[]>([])
  const { profile } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await ideaService.getUserIdeas()
        setIdeas(res.data || [])
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

  const pendingCount = ideas.filter(i => i.status === 'submitted' && i.payment_status !== 'paid').length
  const approvedCount = ideas.filter(i => i.status === 'submitted' && i.payment_status === 'paid').length
  const rejectedCount = ideas.filter(i => i.status === 'rejected').length

  return (
    <>
      <div className="mb-12 animate-zed-fade-up flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black gradient-text mb-2 drop-shadow-lg">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-zed-foreground-secondary font-medium">Manage your ideas and track your progress in the Arena</p>
        </div>
        <Link href="/dashboard/ideas/new" className="btn-primary px-8 h-14 flex items-center gap-3 text-sm font-black uppercase tracking-widest shadow-lg shadow-zed-primary/30">
          <Lightbulb size={20} /> New Idea <ChevronRight size={18} />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12 perspective-1000">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card-zed glass-premium tilt-3d group p-8">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-zed-primary/20 ${stat.color}`}>
                  <Icon size={28} className="drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                </div>
                <TrendingUp size={20} className="text-zed-success" />
              </div>
              <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-4xl font-black text-zed-foreground glow-counter">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {ideas.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card-zed glass-premium p-6 border-zed-primary/20">
            <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest mb-2">Pending Review</p>
            <p className="text-3xl font-black text-yellow-400">{pendingCount}</p>
          </div>
          <div className="card-zed glass-premium p-6 border-zed-success/20">
            <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest mb-2">Approved</p>
            <p className="text-3xl font-black text-zed-success">{approvedCount}</p>
          </div>
          <div className="card-zed glass-premium p-6 border-red-500/20">
            <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest mb-2">Rejected</p>
            <p className="text-3xl font-black text-red-400">{rejectedCount}</p>
          </div>
        </div>
      )}

      <AdBanner className="mb-8" />

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-zed-foreground">Your Recent Ideas</h2>
          <Link href="/dashboard/ideas/new" className="btn-primary text-sm">New Idea</Link>
        </div>

        <div className="card-zed glass-premium overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            {ideas.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="mx-auto mb-6 text-zed-primary opacity-20" size={64} />
                <p className="text-zed-foreground-secondary text-lg italic">No ideas yet. Start your journey!</p>
                <Link href="/dashboard/ideas/new" className="btn-primary mt-6 inline-flex items-center gap-2 px-8 py-3 text-xs font-black">
                  Submit an Idea <ArrowRight size={16} />
                </Link>
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
                  {ideas.slice(0, 5).map((idea: any) => (
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

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/dashboard/ideas/new" className="card-zed-hover cursor-pointer card-zed">
          <h3 className="font-bold text-zed-foreground mb-2">Submit an Idea</h3>
          <p className="text-sm text-zed-foreground-secondary mb-4">Got a brilliant idea? Submit it to one of our active competitions and compete for funding.</p>
          <span className="text-zed-primary hover:text-zed-accent transition-colors flex items-center gap-2 text-sm font-bold">
            Get Started <ArrowRight size={16} />
          </span>
        </Link>

        <Link href="/dashboard/competitions" className="card-zed-hover cursor-pointer card-zed">
          <h3 className="font-bold text-zed-foreground mb-2">Browse Competitions</h3>
          <p className="text-sm text-zed-foreground-secondary mb-4">Explore active competitions and find the perfect arena for your ideas.</p>
          <span className="text-zed-primary hover:text-zed-accent transition-colors flex items-center gap-2 text-sm font-bold">
            View Competitions <ArrowRight size={16} />
          </span>
        </Link>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-zed-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-zed-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-zed-foreground">Loading Arena...</p>
          </div>
        </div>
      )}
    </>
  )
}
