'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  ThumbsUp, 
  Share2, 
  ShieldCheck, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Instagram, 
  Globe,
  FileText,
  Play,
  Calendar,
  Users,
  Settings
} from 'lucide-react'
import { YouTubeEmbed, getYouTubeId } from '@/components/YouTubeEmbed'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'

export default function IdeaDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { profile } = useAuth()
  const [idea, setIdea] = useState<any>(null)
  const [creator, setCreator] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [castingVote, setCastingVote] = useState(false)
  const [hasVoted, setHasVoted] = useState(false) // You'd ideally fetch this from backend

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/ideas/${id}`)
        setIdea(res.data)
        // Fetch creator info if available
        if (res.data.user_id) {
          const userRes = await api.get(`/user/profile/${res.data.user_id}`)
          setCreator(userRes.data)
        }
      } catch (err) {
        console.error('Failed to fetch idea details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleVote = async () => {
    if (profile?.kyc_status !== 'verified' || profile?.voter_payment_status !== 'paid') {
      toast.error('You must be verified and have paid the entry fee to vote.')
      return
    }

    if (idea.user_id === profile.uid) {
      toast.error('You cannot vote for your own idea.')
      return
    }

    setCastingVote(true)
    try {
      await api.post('/votes/cast', { 
        ideaId: idea.id, 
        competitionId: idea.competition_id || 'idea-to-win-2024' 
      })
      toast.success('Your vote has been cast!')
      setHasVoted(true)
      setIdea((prev: any) => ({ ...prev, votes_count: (prev.votes_count || 0) + 1 }))
    } catch (err: any) {
      toast.error(err.message || 'Failed to cast vote')
    } finally {
      setCastingVote(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!idea) return <div>Idea not found</div>

  return (
          <main className="py-8">
            <div className="max-w-6xl mx-auto">
              {/* Back Button */}
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-zed-foreground-secondary hover:text-zed-foreground font-black text-xs uppercase tracking-widest mb-8 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Arena
              </button>

              <div className="grid lg:grid-cols-3 gap-12">
                {/* Left Column: Content */}
                <div className="lg:col-span-2 space-y-12">
                  {/* Hero / Video */}
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/5 group">
                    {(idea.pitch_video_url || idea.video_url) ? (
                      (getYouTubeId(idea.pitch_video_url || idea.video_url)) ? (
                        <YouTubeEmbed url={idea.pitch_video_url || idea.video_url} className="rounded-3xl" />
                      ) : (
                        <video 
                          src={idea.pitch_video_url || idea.video_url} 
                          controls 
                          className="w-full h-full object-contain"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/20">
                        <Play size={64} className="opacity-20" />
                        <span className="font-black uppercase tracking-[0.2em] text-xs">No Pitch Video Available</span>
                      </div>
                    )}
                  </div>

                  {/* About the Idea */}
                    <div className="space-y-8 animate-zed-fade-up">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-zed-primary/10 text-zed-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-zed-primary/20">
                          {idea.industry || idea.category}
                        </span>
                        <span className="text-zed-foreground-secondary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <Calendar size={12} /> {new Date(idea.createdAt || idea.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h1 className="text-5xl font-black text-zed-foreground mb-6 leading-tight">
                        {idea.title}
                      </h1>
                    </div>

                    <div className="space-y-6">
                      <section>
                        <h4 className="text-xs font-black text-zed-primary uppercase tracking-[0.2em] mb-3">The Problem</h4>
                        <p className="text-lg text-zed-foreground-secondary font-medium leading-relaxed">
                          {idea.problem || idea.problem_statement}
                        </p>
                      </section>

                      <section>
                        <h4 className="text-xs font-black text-zed-primary uppercase tracking-[0.2em] mb-3">Our Solution</h4>
                        <p className="text-lg text-zed-foreground font-medium leading-relaxed">
                          {idea.solution || idea.description}
                        </p>
                      </section>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                          <h4 className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Users size={14} /> Business Model
                          </h4>
                          <p className="font-bold text-zed-foreground">{idea.business_model || 'Not specified'}</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                          <h4 className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Calendar size={14} /> Status
                          </h4>
                          <p className="font-bold text-zed-foreground capitalize">{idea.status}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Stats & Creator */}
                <div className="space-y-8">
                  {/* Voting Card */}
                  <div className="card-zed p-8 glass-premium border-white/10 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <ThumbsUp size={100} />
                    </div>
                    
                    <div className="mb-8">
                      <span className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-1">Current Standing</span>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-zed-foreground">{idea.votes_count || 0}</span>
                        <span className="text-sm font-bold text-zed-foreground-secondary mb-1.5 uppercase">Votes</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <button 
                        onClick={handleVote}
                        disabled={hasVoted || castingVote || idea.user_id === profile?.uid}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all ${
                          hasVoted
                            ? 'bg-zed-success text-white'
                            : idea.user_id === profile?.uid
                            ? 'bg-white/5 text-zed-foreground-secondary cursor-not-allowed'
                            : 'btn-primary shadow-xl glow-primary'
                        }`}
                      >
                        {castingVote ? 'Casting...' : hasVoted ? 'Voted' : 'Cast Your Vote'} <ThumbsUp size={18} />
                      </button>
                      <button className="btn-secondary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest">
                        Share Pitch <Share2 size={18} />
                      </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-3">
                      <ShieldCheck className="text-zed-success" size={20} />
                      <span className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">
                        Verified Secure Submission
                      </span>
                    </div>
                  </div>

                  {/* Creator Card */}
                  <div className="card-zed p-8 border-white/5 bg-white/5">
                    <h4 className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-[0.2em] mb-6">About the Creator</h4>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-zed-gradient-primary overflow-hidden shadow-lg">
                        {creator?.picture && <img src={creator.picture} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <h3 className="font-black text-zed-foreground">{creator?.fullName || 'Arena Innovator'}</h3>
                        <p className="text-[10px] text-zed-primary font-black uppercase tracking-widest">{creator?.role || 'Contestant'}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(idea.github_url || idea.links?.github) && (
                        <a href={idea.github_url || idea.links?.github} target="_blank" className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <Github size={16} className="text-zed-foreground-secondary" />
                            <span className="text-xs font-bold">GitHub Repository</span>
                          </div>
                          <ExternalLink size={14} className="text-white/20" />
                        </a>
                      )}
                      {(idea.linkedin_url || idea.links?.linkedin) && (
                        <a href={idea.linkedin_url || idea.links?.linkedin} target="_blank" className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <Linkedin size={16} className="text-zed-foreground-secondary" />
                            <span className="text-xs font-bold">LinkedIn Profile</span>
                          </div>
                          <ExternalLink size={14} className="text-white/20" />
                        </a>
                      )}
                      {(idea.instagram_url || idea.links?.instagram) && (
                        <a href={idea.instagram_url || idea.links?.instagram} target="_blank" className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <Instagram size={16} className="text-zed-foreground-secondary" />
                            <span className="text-xs font-bold">Instagram</span>
                          </div>
                          <ExternalLink size={14} className="text-white/20" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Manage Idea */}
                  <Link
                    href={`/dashboard/ideas/${id}/manage`}
                    className="card-zed p-6 border-white/5 bg-white/5 hover:bg-white/10 transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-zed-primary/20 flex items-center justify-center text-zed-primary">
                        <Settings size={24} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-zed-foreground uppercase tracking-widest">Manage Idea</h4>
                        <p className="text-[10px] text-zed-foreground-secondary font-bold">Insights, settings, and more</p>
                      </div>
                    </div>
                    <ExternalLink size={18} className="text-white/20 group-hover:text-zed-primary transition-colors" />
                  </Link>

                  {/* Supporting Files */}
                  {idea.deck_url && (
                    <div className="card-zed p-6 border-white/5 bg-zed-primary/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zed-primary/20 flex items-center justify-center text-zed-primary">
                          <FileText size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-black text-zed-foreground uppercase tracking-widest">Pitch Deck</h4>
                          <p className="text-[10px] text-zed-foreground-secondary font-bold">Comprehensive PDF details</p>
                        </div>
                        <a 
                          href={idea.deck_url} 
                          target="_blank"
                          className="btn-primary p-2.5 rounded-xl"
                        >
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
  )
}
