'use client'

import { X, Play, ThumbsUp, Users, ExternalLink, Loader2, CheckCircle2, ImageOff } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { getYouTubeThumbnail } from '@/components/YouTubeEmbed'
import { ContestantProfileCard } from '@/components/ContestantProfileCard'

interface IdeaDetailModalProps {
  idea: any
  competitionId: string
  hasVoted: boolean
  isOwn: boolean
  guardErrors: string[]
  onClose: () => void
  onVoteClick: () => void
}

export function IdeaDetailModal({ idea, hasVoted, isOwn, guardErrors, onClose, onVoteClick }: IdeaDetailModalProps) {
  const [thumbFailed, setThumbFailed] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)

  if (!idea) return null

  const vid = idea.pitch_video_url || idea.video_url
  const imgSrc = idea.image_url || (thumbFailed ? getYouTubeThumbnail(vid, 'hq') : getYouTubeThumbnail(vid))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <div className="sticky top-0 z-10 flex justify-end p-4 bg-gradient-to-b from-zinc-900 to-transparent">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Video thumbnail / player */}
        {(imgSrc || vid) ? (
          <div className="relative aspect-video mx-6 rounded-xl overflow-hidden bg-white/5 group">
            {vid ? (
              <div className="relative w-full h-full">
                {videoPlaying ? (
                  vid.includes('youtube.com') || vid.includes('youtu.be') ? (
                    <iframe
                      src={vid.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/').split('&')[0]}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={vid}
                      controls
                      className="w-full h-full"
                      onPlay={() => setVideoPlaying(true)}
                      onEnded={() => setVideoPlaying(false)}
                    />
                  )
                ) : (
                  <>
                    <Image src={imgSrc || '/hero_3d_arena_bg_1777051043555.png'} alt={idea.title} fill className="object-cover grayscale-0" sizes="(max-width: 768px) 100vw, 800px" loading="lazy" onError={() => setThumbFailed(true)} />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center" />
                    <button
                      onClick={() => setVideoPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors shadow-2xl">
                        <Play size={36} className="text-white ml-1" />
                      </div>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <Image src={imgSrc || '/hero_3d_arena_bg_1777051043555.png'} alt={idea.title} fill className="object-cover grayscale-0" sizes="(max-width: 768px) 100vw, 800px" loading="lazy" onError={() => setThumbFailed(true)} />
            )}
          </div>
        ) : (
          <div className="mx-6 aspect-video rounded-xl bg-white/5 flex flex-col items-center justify-center">
            <ImageOff size={40} className="text-white/20 mb-2" />
            <span className="text-xs text-white/10 font-bold uppercase tracking-widest">No Image</span>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Title + badges */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-white">{idea.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 uppercase">
                  {idea.industry || idea.category || 'General'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                  #{idea.votes_count || 0} votes
                </span>
                {hasVoted && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Voted
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contestant */}
          <ContestantProfileCard userId={idea.user_id} />

          {/* Problem */}
          {(idea.problem || idea.problem_statement) && (
            <div>
              <h4 className="text-xs font-black text-rose-400 uppercase tracking-[0.2em] mb-1.5 drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]">Problem</h4>
              <p className="text-sm text-white/80 leading-relaxed break-words">{idea.problem || idea.problem_statement}</p>
            </div>
          )}

          {/* Solution */}
          {(idea.solution || idea.description) && (
            <div>
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-1.5 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">Solution</h4>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">{idea.solution || idea.description}</p>
            </div>
          )}

          {/* Pitch Video */}
          {vid && (
            <div>
              <h4 className="text-xs font-black text-zed-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Play size={12} /> Pitch Video
              </h4>
              <p className="text-xs text-white/40 mb-2">Click the thumbnail above to play the pitch video</p>
            </div>
          )}

          {/* Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Status</span>
              <p className="text-sm font-bold text-white mt-0.5">{idea.status === 'approved' ? 'Approved for voting' : 'Pending approval'}</p>
            </div>
            <button
              onClick={onVoteClick}
              disabled={hasVoted || isOwn || guardErrors.length > 0 || idea.status !== 'approved'}
              className={`flex items-center gap-2 h-11 px-6 rounded-xl font-black text-xs transition-all duration-200 ${
                hasVoted
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                  : isOwn
                  ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                  : guardErrors.length > 0
                  ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                  : idea.status === 'approved'
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 cursor-not-allowed'
              }`}
            >
              {hasVoted ? (
                <><CheckCircle2 size={14} /> Voted</>
              ) : isOwn ? (
                'Your Idea'
              ) : idea.status === 'approved' ? (
                <><ThumbsUp size={14} /> Vote for this idea</>
              ) : (
                'Pending Approval'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
