'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { Trophy, Vote, Search, ThumbsUp, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react'
import { voteService } from '@/services/core'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function CompetitionVotingPage() {
  const params = useParams()
  const competitionId = params.competitionId as string
  const { profile } = useAuth()
  const router = useRouter()
  const [competition, setCompetition] = useState<any>(null)
  const [ideas, setIdeas] = useState<any[]>([])
  const [filteredIdeas, setFilteredIdeas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [votedIdeas, setVotedIdeas] = useState<string[]>([])
  const [castingVote, setCastingVote] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [guardErrors, setGuardErrors] = useState<string[]>([])

  useEffect(() => {
    const results = ideas.filter(idea =>
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.industry?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredIdeas(results)
  }, [searchQuery, ideas])

  useEffect(() => {
    if (!competitionId) return

    const fetchData = async () => {
      try {
        const compRes = await api.get(`/competitions/${competitionId}`)
        const comp = compRes.data.data
        setCompetition(comp)

        const errors: string[] = []
        if (comp.calculatedStatus === 'closed') errors.push('This competition is closed and no longer accepting votes.')
        if (!profile?.is_verified) errors.push('You must be verified by an admin to vote.')

        const paidComps = profile?.voter_competitions_paid || []
        if (!paidComps.includes(competitionId)) errors.push('You have not paid the voter fee for this competition.')

        setGuardErrors(errors)

        const [ideasRes, votesRes] = await Promise.all([
          api.get('/ideas/public?status=approved'),
          api.get('/votes/user'),
        ])

        const compIdeas = (ideasRes.data || []).filter(
          (idea: any) => idea.competition_id === competitionId && idea.status === 'approved' && idea.is_public
        )
        setIdeas(compIdeas)
        const votedIds = (votesRes.data || []).map((v: any) => v.idea_id)
        setVotedIdeas(votedIds)
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [competitionId, profile])

  const handleVote = async (idea: any) => {
    setCastingVote(idea.id)
    try {
      await voteService.castVoteV2(idea.id, competitionId)
      toast.success('Your vote has been cast!')
      setVotedIdeas(prev => [...prev, idea.id])
      setIdeas(prev => prev.map(i =>
        i.id === idea.id ? { ...i, votes_count: (i.votes_count || 0) + 1 } : i
      ))
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <Link href="/dashboard/voting" className="text-xs text-zed-foreground-secondary hover:text-zed-primary font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                    <ArrowLeft size={14} /> Back to Competitions
                  </Link>
                  <h1 className="text-4xl font-black text-zed-foreground mb-2 flex items-center gap-3">
                    <Vote className="text-zed-primary" size={32} /> {competition?.title || 'Voting Arena'}
                  </h1>
                  <p className="text-zed-foreground-secondary font-medium">Cast your vote for the ideas you believe in.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-3 text-zed-foreground-secondary" size={18} />
                    <input
                      placeholder="Search ideas, industries..."
                      className="input-zed pl-10 h-11"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {guardErrors.length > 0 && (
                <div className="mb-8 p-6 glass-premium border-yellow-500/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="text-yellow-500" size={20} />
                    <h4 className="text-sm font-black text-zed-foreground uppercase tracking-widest">Voting Restricted</h4>
                  </div>
                  <ul className="space-y-2">
                    {guardErrors.map((err, i) => (
                      <li key={i} className="text-xs text-zed-foreground-secondary flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" /> {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="card-zed h-96 animate-pulse opacity-50" />
                  ))}
                </div>
              ) : filteredIdeas.length === 0 ? (
                <div className="text-center py-24 glass-premium rounded-3xl border border-white/5">
                  <Vote size={64} className="mx-auto text-zed-foreground-secondary mb-6 opacity-20" />
                  <h3 className="text-xl font-black text-zed-foreground mb-2">No ideas to vote on yet</h3>
                  <p className="text-zed-foreground-secondary">Approved public ideas will appear here once available.</p>
                </div>
              ) : (
                <Suspense fallback={<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="card-zed h-96 animate-pulse opacity-50" />)}</div>}>
                  <IdeasGrid
                    ideas={filteredIdeas}
                    votedIdeas={votedIdeas}
                    castingVote={castingVote}
                    guardErrors={guardErrors}
                    profile={profile}
                    handleVote={handleVote}
                  />
                </Suspense>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function IdeasGrid({
  ideas,
  votedIdeas,
  castingVote,
  guardErrors,
  profile,
  handleVote,
}: {
  ideas: any[]
  votedIdeas: string[]
  castingVote: string | null
  guardErrors: string[]
  profile: any
  handleVote: (idea: any) => void
}) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {ideas.map((idea) => {
        const hasVoted = votedIdeas.includes(idea.id)
        const isOwn = idea.user_id === profile?.id

        return (
          <div key={idea.id} className="card-zed group flex flex-col hover:border-zed-primary/30 transition-all duration-500">
            <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
              <Image
                src={idea.image_url || 'https://via.placeholder.com/600x400?text=ZedIdeaArena'}
                alt={idea.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-zed-primary/80 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded-full font-black uppercase tracking-widest">
                  {idea.industry || idea.category}
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-black text-zed-foreground mb-1 line-clamp-1 group-hover:text-zed-primary transition-colors">
                {idea.title}
              </h3>
              <p className="text-xs text-zed-foreground-secondary font-bold mb-3 uppercase tracking-wider">
                by {idea.users?.full_name || 'Unknown'}
              </p>
              <p className="text-sm text-zed-foreground-secondary mb-6 line-clamp-3 font-medium leading-relaxed">
                {idea.problem || idea.problem_statement}
              </p>

              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zed-foreground-secondary uppercase font-bold tracking-widest">Votes</span>
                  <span className="text-lg font-black text-zed-foreground">{idea.votes_count || 0}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/ideas/${idea.id}`} className="btn-icon w-10 h-10">
                    <ArrowLeft size={18} className="rotate-135" />
                  </Link>
                  <button
                    onClick={() => handleVote(idea)}
                    disabled={hasVoted || isOwn || !!castingVote || guardErrors.length > 0}
                    className={`flex items-center gap-2 h-10 px-6 rounded-xl font-black text-xs transition-all ${hasVoted ? 'bg-zed-success text-white' : isOwn ? 'bg-white/5 text-zed-foreground-secondary cursor-not-allowed' : 'bg-zed-primary text-white shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95'}`}
                  >
                    {castingVote === idea.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : hasVoted ? (
                      <>Voted <ThumbsUp size={14} /></>
                    ) : isOwn ? (
                      'Your Idea'
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
  )
}
