'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

export function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function getYouTubeThumbnail(url: string, quality: 'hq' | 'max' = 'max'): string | null {
  const id = getYouTubeId(url)
  if (!id) return null
  return quality === 'max'
    ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

export function YouTubeEmbed({ url, className = '' }: { url: string; className?: string }) {
  const videoId = getYouTubeId(url)
  const [play, setPlay] = useState(false)
  if (!videoId) return null
  if (play) {
    return (
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-black ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }
  return (
    <button
      onClick={() => setPlay(true)}
      className={`relative w-full aspect-video rounded-xl overflow-hidden group cursor-pointer border-0 p-0 ${className}`}
    >
      <img
        src={getYouTubeThumbnail(url, 'max') || ''}
        alt="YouTube video thumbnail"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          const img = e.currentTarget
          const fallback = getYouTubeThumbnail(url, 'hq')
          if (fallback && img.src !== fallback) img.src = fallback
        }}
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform group-active:scale-95">
          <Play size={26} className="text-black ml-0.5" />
        </div>
      </div>
    </button>
  )
}
