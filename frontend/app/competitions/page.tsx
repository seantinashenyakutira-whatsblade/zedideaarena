'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Clock, DollarSign, Users, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CompetitionCountdown } from '@/components/CompetitionCountdown'

interface Competition {
  id: string
  title: string
  description: string
  thumbnail_url: string
  prize_pool_cents: number
  entry_fee_cents: number
  voter_fee_cents: number
  start_date: string
  submission_deadline: string
  end_date: string
  calculatedStatus: string
}

const statusConfig: Record<string, { label: string; bg: string }> = {
  upcoming: { label: 'UPCOMING', bg: 'bg-blue-500/80' },
  active: { label: 'ACTIVE', bg: 'bg-zed-success/80' },
  closed: { label: 'CLOSED', bg: 'bg-gray-500/60' },
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://zedideaarena.onrender.com/api'
        const res = await fetch(`${baseUrl}/competitions`)
        const body = await res.json()
        setCompetitions(body?.data?.data || body?.data || [])
      } catch {
        setCompetitions([])
      } finally {
        setLoading(false)
      }
    }
    fetchCompetitions()
  }, [])

  return (
    <div className="min-h-screen bg-zed-background">
      <div className="container-zed py-16">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black gradient-text mb-4">All Competitions</h1>
          <p className="text-zed-foreground-secondary text-lg max-w-2xl mx-auto">
            Browse open competitions, submit your ideas, and compete for funding and recognition.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="card-zed h-96 animate-pulse opacity-30" />
            ))}
          </div>
        ) : competitions.length === 0 ? (
          <div className="text-center py-24 glass-premium rounded-3xl border border-white/5">
            <Trophy size={64} className="mx-auto text-zed-foreground-secondary mb-6 opacity-20" />
            <h3 className="text-xl font-black text-zed-foreground mb-2">No competitions</h3>
            <p className="text-zed-foreground-secondary">Check back soon for new competitions.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {competitions.map((comp) => {
              const cfg = statusConfig[comp.calculatedStatus] || statusConfig.upcoming
              return (
                <div key={comp.id} className="card-zed group hover:border-zed-primary/30 transition-all flex flex-col">
                  <Link href={`/competitions/${comp.id}`} className="block">
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                      <Image
                        src={comp.thumbnail_url || '/hero_3d_arena_bg_1777051043555.png'}
                        alt={comp.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className={`${cfg.bg} text-[10px] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-zed-foreground mb-2 group-hover:text-zed-primary transition-colors">
                      {comp.title}
                    </h3>
                    <p className="text-sm text-zed-foreground-secondary mb-6 line-clamp-2">
                      {comp.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs font-bold text-zed-foreground-secondary mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-zed-primary" />
                        ${(comp.prize_pool_cents / 100).toLocaleString()} pool
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-yellow-400" />
                        {comp.calculatedStatus === 'upcoming'
                          ? new Date(comp.start_date).toLocaleDateString()
                          : new Date(comp.submission_deadline).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-purple-400" />
                        {comp.entry_fee_cents ? `$${comp.entry_fee_cents / 100} entry` : 'Free entry'}
                      </div>
                    </div>
                  </Link>

                  <div className="mt-auto px-1 pb-1">
                    {comp.calculatedStatus === 'active' && (
                      <div className="mb-4">
                        <CompetitionCountdown deadline={comp.submission_deadline} />
                      </div>
                    )}
                    <Link
                      href={comp.calculatedStatus === 'active' ? `/competitions/${comp.id}` : '#'}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        comp.calculatedStatus === 'active'
                          ? 'btn-primary'
                          : 'btn-secondary cursor-not-allowed opacity-50'
                      }`}
                    >
                      {comp.calculatedStatus === 'active' ? (
                        <>Enter Competition <ArrowRight size={16} /></>
                      ) : comp.calculatedStatus === 'upcoming' ? (
                        'Coming Soon'
                      ) : (
                        'View Results'
                      )}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
