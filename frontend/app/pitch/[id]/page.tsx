'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, ThumbsUp, Share2, ExternalLink, Github, Linkedin, Instagram,
  FileText, Play, Calendar, Loader2, AlertTriangle, Lightbulb
} from 'lucide-react'
import { YouTubeEmbed, getYouTubeId } from '@/components/YouTubeEmbed'
import { ContestantProfileCard } from '@/components/ContestantProfileCard'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function PublicPitchPage() {
  const { id } = useParams()
  const [idea, setIdea] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const fetchIdea = async () => {
      try {
        const res: any = await api.get(`/ideas/public/${id}`)
        if (res?.status === 'error' || !res?.data) {
          setError('Idea not found')
        } else {
          setIdea(res.data)
        }
      } catch {
        setError('This pitch is not available or has been removed.')
      }
      setLoading(false)
    }
    fetchIdea()
  }, [id])

  const handleCopyLink = () => {
    const url = window.location.href
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => toast.success('Link copied!')).catch(() => fallbackCopy(url))
    } else {
      fallbackCopy(url)
    }
  }

  const fallbackCopy = (text: string) => {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    toast.success('Link copied!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zed-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-zed-primary" />
          <p className="font-bold text-zed-foreground">Loading pitch...</p>
        </div>
      </div>
    )
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-zed-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} className="text-red-400" />
          </div>
          <h1 className="text-3xl font-black text-zed-foreground mb-3">Pitch Not Found</h1>
          <p className="text-zed-foreground-secondary mb-8">{error || 'This pitch is not available.'}</p>
          <Link href="/" className="btn-primary px-8 py-3">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zed-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="flex items-center gap-2 text-zed-foreground-secondary hover:text-zed-primary font-black text-xs uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Arena
        </Link>

        {/* Video / Hero */}
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/5 mb-12">
          {(idea.pitch_video_url || idea.video_url) ? (
            getYouTubeId(idea.pitch_video_url || idea.video_url) ? (
              <YouTubeEmbed url={idea.pitch_video_url || idea.video_url} className="rounded-3xl" />
            ) : (
              <video src={idea.pitch_video_url || idea.video_url} controls className="w-full h-full object-contain" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Lightbulb size={80} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/30 font-black uppercase tracking-[0.2em] text-xs">No Pitch Video</p>
              </div>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {(idea.industry || idea.category) && (
                <span className="bg-zed-primary/10 text-zed-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-zed-primary/20">
                  {idea.industry || idea.category}
                </span>
                )}
                <span className="text-zed-foreground-secondary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} /> {new Date(idea.created_at).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-zed-foreground leading-tight mb-6">
                {idea.title}
              </h1>
            </div>

            <section>
              <h4 className="text-xs font-black text-zed-primary uppercase tracking-[0.2em] mb-3">The Problem</h4>
              <p className="text-lg text-zed-foreground-secondary font-medium leading-relaxed">
                {idea.problem || idea.problem_statement}
              </p>
            </section>

            <section>
              <h4 className="text-xs font-black text-zed-primary uppercase tracking-[0.2em] mb-3">The Solution</h4>
              <p className="text-lg text-zed-foreground font-medium leading-relaxed">
                {idea.solution || idea.description}
              </p>
            </section>

            {idea.business_model && (
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <h4 className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-[0.2em] mb-2">Business Model</h4>
                <p className="font-bold text-zed-foreground">{idea.business_model}</p>
              </div>
            )}

            {(idea.deck_url || idea.links?.deck) && (
              <a href={idea.deck_url || idea.links?.deck} target="_blank" className="flex items-center gap-4 p-6 bg-zed-primary/5 rounded-3xl border border-zed-primary/10 hover:bg-zed-primary/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-zed-primary/20 flex items-center justify-center text-zed-primary">
                  <FileText size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black text-zed-foreground uppercase tracking-widest">Pitch Deck</h4>
                  <p className="text-[10px] text-zed-foreground-secondary font-bold">View the full pitch deck</p>
                </div>
                <ExternalLink size={18} className="text-zed-primary" />
              </a>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="card-zed p-8 border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ThumbsUp size={100} />
              </div>
              <div className="mb-8">
                <span className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-1">Votes</span>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-zed-foreground">{idea.votes_count || 0}</span>
                  <span className="text-sm font-bold text-zed-foreground-secondary mb-1.5 uppercase">Votes</span>
                </div>
              </div>
              <button onClick={handleCopyLink} className="btn-secondary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest">
                <Share2 size={18} /> Share Pitch
              </button>
            </div>

            <ContestantProfileCard userId={idea.user_id} />

            <div className="space-y-3">
              {(idea.github_url || idea.links?.github) && (
                <a href={idea.github_url || idea.links?.github} target="_blank" className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3"><Github size={16} className="text-zed-foreground-secondary" /><span className="text-xs font-bold">GitHub</span></div>
                  <ExternalLink size={14} className="text-white/20" />
                </a>
              )}
              {(idea.linkedin_url || idea.links?.linkedin) && (
                <a href={idea.linkedin_url || idea.links?.linkedin} target="_blank" className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3"><Linkedin size={16} className="text-zed-foreground-secondary" /><span className="text-xs font-bold">LinkedIn</span></div>
                  <ExternalLink size={14} className="text-white/20" />
                </a>
              )}
              {(idea.instagram_url || idea.links?.instagram) && (
                <a href={idea.instagram_url || idea.links?.instagram} target="_blank" className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3"><Instagram size={16} className="text-zed-foreground-secondary" /><span className="text-xs font-bold">Instagram</span></div>
                  <ExternalLink size={14} className="text-white/20" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
