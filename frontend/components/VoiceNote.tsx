'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2 } from 'lucide-react'

interface VoiceNoteProps {
  src: string
  title: string
  description?: string
  className?: string
}

export default function VoiceNote({ src, title, description, className = '' }: VoiceNoteProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoaded = () => {
      setDuration(audio.duration)
      setLoading(false)
    }
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onEnded = () => {
      setPlaying(false)
      setCurrentTime(0)
    }
    const onError = () => setLoading(false)

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    if (audio.readyState >= 1) {
      setDuration(audio.duration)
      setLoading(false)
    }

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
    setPlaying(!playing)
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const time = pct * duration
    audio.currentTime = time
    setCurrentTime(time)
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`p-6 rounded-2xl border border-white/10 ${className}`}
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-start gap-4">
        <motion.button
          onClick={togglePlay}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : playing ? (
            <Pause size={18} className="text-white fill-white" />
          ) : (
            <Play size={18} className="text-white fill-white ml-0.5" />
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 size={14} className="text-zed-primary flex-shrink-0" />
            <h4 className="font-bold text-sm truncate">{title}</h4>
          </div>
          {description && (
            <p className="text-xs text-white/50 mb-3 line-clamp-2">{description}</p>
          )}

          <div
            className="relative w-full h-1.5 rounded-full cursor-pointer group"
            style={{ background: 'rgba(255,255,255,0.08)' }}
            onClick={seek}
          >
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ background: 'linear-gradient(90deg,#6366F1,#22D3EE)' }}
              initial={{ width: 0 }}
              animate={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              transition={{ duration: 0.1 }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                left: duration ? `${(currentTime / duration) * 100}%` : '0%',
                boxShadow: '0 0 8px rgba(99,102,241,0.6)',
              }}
            />
          </div>

          <div className="flex justify-between mt-1">
            <span className="text-[10px] font-medium text-white/40">{fmt(currentTime)}</span>
            <span className="text-[10px] font-medium text-white/40">{fmt(duration)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
