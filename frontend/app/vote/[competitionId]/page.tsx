'use client'

import { useState, useEffect, Suspense } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { usePageChannel } from '@/hooks/usePageChannel'
import { MediaCard, IdeaCardSkeleton } from '@/components/ui/MediaCard'
import { Vote, Search, ThumbsUp, ArrowLeft, AlertTriangle, CheckCircle2, Play } from 'lucide-react'
import { getYouTubeThumbnail, getYouTubeThumbnailFallbacks } from '@/components/YouTubeEmbed'
import { motion } from 'framer-motion'
import { voteService } from '@/services/core'
import { RatingModal } from '@/components/voter/RatingModal'
import { IdeaDetailModal } from '@/components/voter/IdeaDetailModal'
import { ContestantProfileCard } from '@/components/ContestantProfileCard'
import { AdCard, shouldShowAd } from '@/components/ads/AdCard'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [guardErrors, setGuardErrors] = useState<string[]>([])
  const [selectedIdea, setSelectedIdea] = useState<any>(null)
  const [viewingIdea, setViewingIdea] = useState<any>(null)
  // Real-time: one channel per competition — broadcast vote counts + live competition updates
  usePageChannel(`competition-${competitionId}`, [
    // Broadcast: lightweight vote count updates from DB trigger
    { type: 'broadcast', event: 'vote_update', handler: (payload: any) => {
      const data = typeof payload === 'string' ? JSON.parse(payload) : payload
      if (data.type === 'vote_count' && data.idea_id) {
        setIdeas(prev => prev.map(i =>
          i.id === data.idea_id
            ? { ...i, votes_count: data.votes_count }
            : i
        ))
        // If the current user cast this vote, ensure votedIdeas is in sync
        if (data.user_id === profile?.id) {
          setVotedIdeas(prev => prev.includes(data.idea_id) ? prev : [...prev, data.idea_id])
        }
      }
    }},
    // Postgres Changes: competition metadata (prize pool, status, deadline)
    { type: 'pg', event: 'UPDATE', table: 'competitions', filter: `id=eq.${competitionId}`, handler: (payload: any) => {
      setCompetition((prev: any) => prev ? { ...prev, ...payload.new } : prev)
    }},
  ], [competitionId])

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
        const [compRes, paymentCheckRes] = await Promise.all([
          api.get(`/competitions/${competitionId}`),
          api.get(`/payments/check?competition_id=${competitionId}&type=voter`).catch(() => null),
        ])
        const comp = compRes.data
        setCompetition(comp)

        const errors: string[] = []
        if (comp.calculatedStatus === 'closed') errors.push('This competition is closed and no longer accepting votes.')
        if (!profile?.is_verified) errors.push('You must be verified by an admin to vote.')

        const hasPaidVoterFee = (paymentCheckRes as any)?.alreadyPaid
        if (!hasPaidVoterFee) {
          errors.push('You have not paid the voter fee for this competition.')
        }

        setGuardErrors(errors)

        const [ideasRes, approvedRes, votesRes] = await Promise.all([
          api.get(`/ideas/public?status=submitted&competition_id=${competitionId}`),
          api.get(`/ideas/public?status=approved&competition_id=${competitionId}`),
          api.get('/votes/user'),
        ])

        // Merge both submitted and approved ideas
        const merged = [...(ideasRes.data || []), ...(approvedRes.data || [])]
        const seen = new Set()
        const deduped = merged.filter((i: any) => {
          if (seen.has(i.id)) return false
          seen.add(i.id)
          return true
        })

        setIdeas(deduped)
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

  const handleVoteClick = (idea: any) => {
    setSelectedIdea(idea)
  }

  const handleVoteComplete = (ideaId: string) => {
    setVotedIdeas(prev => [...prev, ideaId])
    setIdeas(prev => prev.map(i =>
      i.id === ideaId ? { ...i, votes_count: (i.votes_count || 0) + 1 } : i
    ))
    setSelectedIdea(null)
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
                    <IdeaCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredIdeas.length === 0 ? (
                <div className="text-center py-24 glass-premium rounded-3xl border border-white/5">
                  <Vote size={64} className="mx-auto text-zed-foreground-secondary mb-6 opacity-20" />
                  <h3 className="text-xl font-black text-zed-foreground mb-2">No ideas to vote on yet</h3>
                  <p className="text-zed-foreground-secondary">Approved public ideas will appear here once available.</p>
                </div>
              ) : (
                <Suspense fallback={<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{Array.from({ length: 6 }).map((_, i) => <IdeaCardSkeleton key={i} />)}</div>}>
                  <IdeasGrid
                    ideas={filteredIdeas}
                    votedIdeas={votedIdeas}
                    guardErrors={guardErrors}
                    profile={profile}
                    onVoteClick={handleVoteClick}
                    onViewIdea={setViewingIdea}
                  />
                </Suspense>
              )}
            </div>
          </main>
        </div>
      </div>

      {viewingIdea && (
        <IdeaDetailModal
          idea={viewingIdea}
          competitionId={competitionId}
          hasVoted={votedIdeas.includes(viewingIdea.id)}
          isOwn={viewingIdea.user_id === profile?.id}
          guardErrors={guardErrors}
          onClose={() => setViewingIdea(null)}
          onVoteClick={() => { setSelectedIdea(viewingIdea); setViewingIdea(null) }}
        />
      )}
      <RatingModal
        idea={selectedIdea}
        onClose={() => setSelectedIdea(null)}
        onSubmit={async (ratings) => {
          try {
            await voteService.castVoteV2(selectedIdea.id, competitionId, ratings)
            handleVoteComplete(selectedIdea.id)
            toast.success('Your vote has been cast!')
          } catch (err: any) {
            toast.error(err?.response?.data?.message || err.message || 'Failed to cast vote')
            throw err
          }
        }}
      />
    </ProtectedRoute>
  )
}

function IdeasGrid({
  ideas,
  votedIdeas,
  guardErrors,
  profile,
  onVoteClick,
  onViewIdea,
}: {
  ideas: any[]
  votedIdeas: string[]
  guardErrors: string[]
  profile: any
  onVoteClick: (idea: any) => void
  onViewIdea: (idea: any) => void
}) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {ideas.flatMap((idea, i) => {
        const items: React.ReactNode[] = []
        const hasVoted = votedIdeas.includes(idea.id)
        const isOwn = idea.user_id === profile?.id
        const hasVideo = idea.pitch_video_url || idea.video_url
        const mediaSrc = idea.image_url || (hasVideo ? getYouTubeThumbnail(hasVideo) : null)
        const mediaFallbacks = hasVideo ? getYouTubeThumbnailFallbacks(hasVideo) : []

        items.push(
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            onClick={() => onViewIdea(idea)}
            className={`card-zed group flex flex-col transition-all duration-500 cursor-pointer ${
              hasVoted
                ? 'border-zed-success/50 shadow-[0_0_30px_rgba(34,197,94,0.25)] hover:shadow-[0_0_50px_rgba(34,197,94,0.4)]'
                : isOwn
                ? 'border-zed-primary/20'
                : 'hover:border-zed-primary/30'
            }`}
          >
            <div className="relative mb-6">
              <MediaCard
                src={mediaSrc}
                fallbackSrcs={mediaFallbacks}
                alt={idea.title}
                containerClassName="group-hover:scale-105 transition-transform duration-700"
                className="grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent pointer-events-none" />
              {hasVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
                    <Play size={28} className="text-white ml-1" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                {(idea.industry || idea.category) && (
                <span className="bg-black/60 backdrop-blur-md text-[10px] text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border border-white/10">
                  {idea.industry || idea.category}
                </span>
                )}
                <span className="bg-black/60 backdrop-blur-md text-[10px] text-white px-2.5 py-1 rounded-full font-bold border border-white/10">
                  #{idea.votes_count || 0} votes
                </span>
              </div>
              {hasVoted && (
                <div className="absolute top-3 right-3 bg-zed-success/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} /> Voted
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-black text-zed-foreground mb-1 line-clamp-1 group-hover:text-zed-primary transition-colors">
                {idea.title}
              </h3>
              <ContestantProfileCard userId={idea.user_id} className="mb-3 -mx-0" />
              <p className="text-sm text-zed-foreground-secondary mb-6 line-clamp-3 font-medium leading-relaxed">
                {(idea.problem || idea.problem_statement || '').replace(/<[^>]*>/g, '')}
              </p>

              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zed-foreground-secondary uppercase font-bold tracking-widest">Votes</span>
                  <span className="text-lg font-black text-zed-foreground">{idea.votes_count || 0}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); !hasVoted && !isOwn && guardErrors.length === 0 && onVoteClick(idea) }}
                    disabled={hasVoted || isOwn || guardErrors.length > 0}
                    className={`flex items-center gap-2 h-11 px-6 rounded-xl font-black text-xs transition-all duration-200 ${
                      hasVoted
                        ? 'bg-zed-success/20 text-zed-success border border-zed-success/30 cursor-default'
                        : isOwn
                        ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                        : guardErrors.length > 0
                        ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                        : idea.status === 'approved'
                        ? 'bg-zed-primary text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                        : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 cursor-not-allowed'
                    }`}
                  >
                    {hasVoted ? (
                      <><CheckCircle2 size={14} /> Voted</>
                    ) : isOwn ? (
                      'Your Idea'
                    ) : idea.status === 'approved' ? (
                      <><ThumbsUp size={14} /> Vote</>
                    ) : (
                      'Pending Approval'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )

        if (shouldShowAd(i + 1)) {
          items.push(<AdCard key={`ad-${i}`} />)
        }

        return items
      })}
    </div>
  )
}
