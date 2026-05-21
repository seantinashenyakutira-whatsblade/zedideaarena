'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CompetitionCountdownProps {
  deadline: string
}

export function CompetitionCountdown({ deadline }: CompetitionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime()
      const end = new Date(deadline).getTime()
      const distance = end - now

      if (distance <= 0) {
        setIsExpired(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-red-400 font-bold">
        <Clock size={16} />
        <span>Submissions Closed</span>
      </div>
    )
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-3 font-mono">
      <div className="flex items-center gap-1.5">
        <div className="bg-white/5 rounded-lg px-2 py-1 min-w-[2.5rem] text-center">
          <span className="text-lg font-black tabular-nums">{pad(timeLeft.days)}</span>
          <span className="text-[8px] block text-zed-foreground-secondary uppercase tracking-wider">Days</span>
        </div>
        <span className="text-lg font-black text-zed-foreground-secondary mb-4">:</span>
        <div className="bg-white/5 rounded-lg px-2 py-1 min-w-[2.5rem] text-center">
          <span className="text-lg font-black tabular-nums">{pad(timeLeft.hours)}</span>
          <span className="text-[8px] block text-zed-foreground-secondary uppercase tracking-wider">Hours</span>
        </div>
        <span className="text-lg font-black text-zed-foreground-secondary mb-4">:</span>
        <div className="bg-white/5 rounded-lg px-2 py-1 min-w-[2.5rem] text-center">
          <span className="text-lg font-black tabular-nums">{pad(timeLeft.minutes)}</span>
          <span className="text-[8px] block text-zed-foreground-secondary uppercase tracking-wider">Mins</span>
        </div>
        <span className="text-lg font-black text-zed-foreground-secondary mb-4">:</span>
        <div className="bg-zed-primary/10 rounded-lg px-2 py-1 min-w-[2.5rem] text-center border border-zed-primary/20">
          <span className="text-lg font-black text-zed-primary tabular-nums">{pad(timeLeft.seconds)}</span>
          <span className="text-[8px] block text-zed-primary uppercase tracking-wider">Secs</span>
        </div>
      </div>
    </div>
  )
}
