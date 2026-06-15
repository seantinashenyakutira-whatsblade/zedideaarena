'use client'

import { FileText, Plus, ArrowRight, Clock, CheckCircle2, ShieldCheck, DollarSign, Play, Image as ImageIcon, Save } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ideaService } from '@/services/idea'
import { getYouTubeThumbnail } from '@/components/YouTubeEmbed'

export default function MyIdeasPage() {
  const [loading, setLoading] = useState(true)
  const [ideas, setIdeas] = useState<any[]>([])

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasRes = await ideaService.getUserIdeas()
        setIdeas(ideasRes.data || [])
      } catch (err) {
        console.error('Failed to fetch ideas:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchIdeas()
  }, [])

  return (
          <div className="container-zed py-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 animate-zed-fade-up">
                <div>
                  <h1 className="text-4xl font-black text-zed-foreground mb-2">My Visions</h1>
                  <p className="text-zed-foreground-secondary font-medium uppercase tracking-widest text-xs">Manage your pitch portfolio globally</p>
                </div>
                <Link href="/dashboard/ideas/new" className="btn-primary flex items-center justify-center gap-2 mt-4 md:mt-0 px-8 py-4 rounded-2xl shadow-xl click-push">
                  <Plus size={20} /> Create New Idea
                </Link>
              </div>

<div className="grid gap-6">
                {ideas.length === 0 && !loading ? (
                  <div className="card-zed py-24 text-center glass-premium border-white/5">
                    <FileText className="mx-auto mb-6 text-zed-primary opacity-20 floating" size={64} />
                    <h3 className="text-xl font-bold text-zed-foreground mb-2">The Arena Awaits</h3>
                    <p className="text-zed-foreground-secondary text-sm mb-6 max-w-sm mx-auto">You haven't pitched any ideas yet. Start your journey today.</p>
                    <Link href="/dashboard/ideas/new" className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2">
                      Submit Your First Vision <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : (
                  ideas.map((idea) => {
                    const canEdit = idea.status !== 'approved'
                    const editLabel = idea.status === 'draft' ? 'Continue Draft' : 'Edit'
                    return (
                      <div key={idea.id} className="card-zed group glass-premium hover:border-zed-primary/30 transition-all duration-500 flex flex-col md:flex-row gap-8 p-8 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-zed-primary/5 rounded-full blur-[80px]" />

                        {/* Idea Preview */}
                        <div className="w-full md:w-64 aspect-video rounded-2xl overflow-hidden border border-white/5 bg-white/5 flex-shrink-0 relative">
                          {(() => {
                            const rawImage = idea.image_url && !idea.image_url.includes('youtube.com') && !idea.image_url.includes('youtu.be') ? idea.image_url : null
                            const thumb = rawImage || getYouTubeThumbnail(idea.pitch_video_url || idea.video_url)
                            if (thumb) {
                              return (
                                <>
                                  <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  {(idea.pitch_video_url || idea.video_url) && (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Play size={32} className="text-white drop-shadow-lg" />
                                    </div>
                                  )}
                                </>
                              )
                            }
                            return (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                <ImageIcon className="text-white/20" size={36} />
                                <span className="text-[10px] text-white/10 font-bold uppercase tracking-widest">No Image</span>
                              </div>
                            )
                          })()}
                        </div>

                        {/* Idea Details */}
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full text-zed-foreground-secondary border border-white/10">
                              {idea.industry || idea.category}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 ${
                              idea.status === 'submitted' || idea.status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                : idea.status === 'approved'
                                ? 'bg-zed-success/10 text-zed-success border border-zed-success/20'
                                : idea.status === 'rejected'
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}>
                              {(idea.status === 'submitted' || idea.status === 'pending') ? <Clock size={12} /> : idea.status === 'approved' ? <CheckCircle2 size={12} /> : idea.status === 'rejected' ? <FileText size={12} /> : <Save size={12} />}
                              {idea.status === 'draft' ? 'Draft' : idea.status}
                            </span>
                          </div>

                          <h3 className="text-2xl font-black text-zed-foreground mb-2 group-hover:text-zed-primary transition-colors">{idea.title}</h3>
                          <p className="text-sm text-zed-foreground-secondary line-clamp-2 font-medium mb-6">{idea.problem || idea.problem_statement}</p>

                          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/5">
                             <div className="flex flex-col">
                               <span className="text-[10px] text-zed-foreground-secondary uppercase font-bold tracking-widest">Votes</span>
                               <span className="text-lg font-black text-zed-foreground">{idea.votes_count || 0}</span>
                             </div>
                             <div className="flex flex-col">
                               <span className="text-[10px] text-zed-foreground-secondary uppercase font-bold tracking-widest">Payment</span>
                               <span className={`text-xs font-black uppercase flex items-center gap-1 ${idea.payment_status === 'paid' ? 'text-zed-success' : 'text-red-400'}`}>
                                 {idea.payment_status === 'paid' ? <ShieldCheck size={14} /> : <DollarSign size={14} />}
                                 {idea.payment_status || 'unpaid'}
                               </span>
                             </div>
                             <div className="flex-1" />
                             
                              <div className="flex items-center gap-3">
                                 {canEdit && (
                                   <Link 
                                     href={`/dashboard/ideas/new?draftId=${idea.id}`}
                                     className="btn-primary py-2 px-6 rounded-xl text-xs font-black shadow-lg flex items-center gap-2"
                                   >
                                     <Save size={14} /> {editLabel}
                                   </Link>
                                 )}
                                 {idea.payment_status !== 'paid' && (idea.status === 'submitted' || idea.status === 'pending') && (
                                   <Link 
                                     href={`/dashboard/payment?type=contestant&competitionId=${idea.competition_id}&ideaId=${idea.id}`}
                                     className="btn-primary py-2 px-6 rounded-xl text-xs font-black shadow-lg"
                                    >
                                      Pay Entry Fee
                                    </Link>
                                  )}
                               <Link 
                                 href={`/dashboard/ideas/${idea.id}`}
                                 className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 hover:bg-zed-primary text-white hover:text-white border border-white/10 hover:border-zed-primary transition-all"
                               >
                                 <ArrowRight size={20} />
                               </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
  )
}
