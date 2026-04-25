'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Trophy, Vote, Search, Filter, ExternalLink, ThumbsUp, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'

export default function VotingArenaPage() {
  const { profile } = useAuth()
  const [ideas, setIdeas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [votedIdeas, setVotedIdeas] = useState<string[]>([])
  const [castingVote, setCastingVote] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ideasRes, profileRes] = await Promise.all([
          api.get('/ideas/public'),
          api.get('/user/profile') // to get latest voted status
        ])
        setIdeas(ideasRes.data || [])
        // Assume profile has a list of voted ideas or we fetch them separately
        // For now let's just use the ideas list
      } catch (err) {
        console.error('Failed to fetch ideas:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleVote = async (idea: any) => {
    if (profile?.kyc_status !== 'verified' || profile?.voter_payment_status !== 'paid') {
      toast.error('You must be verified and have paid the entry fee to vote.')
      return
    }

    if (idea.user_id === profile.uid) {
      toast.error('You cannot vote for your own idea.')
      return
    }

    setCastingVote(idea.id)
    try {
      await api.post('/votes/cast', { 
        ideaId: idea.id, 
        competitionId: idea.competition_id || 'idea-to-win-2024' 
      })
      toast.success('Your vote has been cast!')
      setVotedIdeas(prev => [...prev, idea.id])
      // Refresh ideas to show updated counts
      const res = await api.get('/ideas/public')
      setIdeas(res.data || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to cast vote')
    } finally {
      setCastingVote(null)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-zed-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-8 bg-zed-background-alt">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <h1 className="text-4xl font-black text-zed-foreground mb-2 flex items-center gap-3">
                    <Vote className="text-zed-primary" size={32} /> Voting Arena
                  </h1>
                  <p className="text-zed-foreground-secondary font-medium">Discover groundbreaking ideas and support the ones you believe in.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-3 text-zed-foreground-secondary" size={18} />
                    <input 
                      placeholder="Search ideas, industries..." 
                      className="input-zed pl-10 h-11"
                    />
                  </div>
                  <button className="btn-secondary h-11 px-4 flex items-center gap-2">
                    <Filter size={18} /> Filter
                  </button>
                </div>
              </div>

              {/* Status Notice if not eligible */}
              {(profile?.kyc_status !== 'verified' || profile?.voter_payment_status !== 'paid') && (
                <div className="mb-12 p-6 glass-premium border-yellow-500/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                      <Trophy className="text-yellow-500" size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-zed-foreground uppercase tracking-widest">Voting Restricted</h4>
                      <p className="text-xs text-zed-foreground-secondary">Complete your onboarding to cast your votes and support innovators.</p>
                    </div>
                  </div>
                  <Link href="/dashboard/voter" className="btn-primary py-2 px-6 rounded-xl text-xs font-black">
                    Complete Onboarding
                  </Link>
                </div>
              )}

              {/* Ideas Grid */}
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="card-zed h-96 animate-pulse opacity-50" />
                  ))}
                </div>
              ) : ideas.length === 0 ? (
                <div className="text-center py-24 glass-premium rounded-3xl border border-white/5">
                  <Vote size={64} className="mx-auto text-zed-foreground-secondary mb-6 opacity-20" />
                  <h3 className="text-xl font-black text-zed-foreground mb-2">No ideas in the Arena yet</h3>
                  <p className="text-zed-foreground-secondary">Be the first to submit a vision!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {ideas.map((idea) => {
                    const hasVoted = votedIdeas.includes(idea.id)
                    const isOwn = idea.user_id === profile?.uid

                    return (
                      <div key={idea.id} className="card-zed group flex flex-col hover:border-zed-primary/30 transition-all duration-500">
                        {/* Image Preview */}
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                           <img 
                            src={idea.image_url || 'https://via.placeholder.com/600x400?text=ZedIdeaArena'} 
                            alt={idea.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                           <div className="absolute bottom-4 left-4">
                             <span className="bg-zed-primary/80 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded-full font-black uppercase tracking-widest">
                               {idea.category}
                             </span>
                           </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                          <h3 className="text-xl font-black text-zed-foreground mb-3 line-clamp-1 group-hover:text-zed-primary transition-colors">
                            {idea.title}
                          </h3>
                          <p className="text-sm text-zed-foreground-secondary mb-6 line-clamp-3 font-medium leading-relaxed">
                            {idea.description}
                          </p>

                          <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-zed-foreground-secondary uppercase font-bold tracking-widest">Votes</span>
                              <span className="text-lg font-black text-zed-foreground">{idea.votes_count || 0}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Link 
                                href={`/dashboard/ideas/${idea.id}`}
                                className="btn-icon w-10 h-10"
                              >
                                <ExternalLink size={18} />
                              </Link>
                              <button
                                onClick={() => handleVote(idea)}
                                disabled={hasVoted || isOwn || !!castingVote}
                                className={`flex items-center gap-2 h-10 px-6 rounded-xl font-black text-xs transition-all ${
                                  hasVoted 
                                    ? 'bg-zed-success text-white' 
                                    : isOwn
                                    ? 'bg-white/5 text-zed-foreground-secondary cursor-not-allowed'
                                    : 'bg-zed-primary text-white shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95'
                                }`}
                              >
                                {castingVote === idea.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : hasVoted ? (
                                  <>Voted <ThumbsUp size={14} /></>
                                ) : (
                                  <>Vote <ThumbsUp size={14} /></>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
