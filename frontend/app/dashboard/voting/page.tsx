'use client'

import { useState, useEffect } from 'react'
import { Trophy, Vote, Calendar, Users, ArrowRight, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import Link from 'next/link'

export default function VotingSelectorPage() {
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComps = async () => {
      try {
        const res = await api.get('/competitions')
        const all = res.data || []
        const active = all.filter((c: any) => c.calculatedStatus !== 'upcoming')
        setCompetitions(active)
      } catch (err) {
        console.error('Failed to fetch competitions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchComps()
  }, [])

  return (
          <div className="max-w-6xl mx-auto">
              <div className="mb-12">
                <h1 className="text-4xl font-black text-zed-foreground mb-2 flex items-center gap-3">
                  <Vote className="text-zed-primary" size={32} /> Voting Arena
                </h1>
                <p className="text-zed-foreground-secondary font-medium">Select a competition to cast your votes.</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 size={48} className="animate-spin text-zed-primary" />
                </div>
              ) : competitions.length === 0 ? (
                <div className="text-center py-24 glass-premium rounded-3xl border border-white/5">
                  <Trophy size={64} className="mx-auto text-zed-foreground-secondary mb-6 opacity-20" />
                  <h3 className="text-xl font-black text-zed-foreground mb-2">No competitions available</h3>
                  <p className="text-zed-foreground-secondary">Check back when a competition is active or has closed.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {competitions.map((comp) => (
                    <Link
                      key={comp.id}
                      href={`/vote/${comp.id}`}
                      className="card-zed group relative overflow-hidden hover:border-zed-primary/30 transition-all duration-500"
                    >
                      <div className="relative h-40 rounded-xl overflow-hidden mb-6">
                        <img
                          src={comp.thumbnail_url || '/hero_3d_arena_bg_1777051043555.png'}
                          alt={comp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-4">
                          <span className={`text-[10px] text-white px-2 py-1 rounded-full font-black uppercase tracking-widest ${comp.calculatedStatus === 'active' ? 'bg-zed-success/80' : 'bg-white/20'}`}>
                            {comp.calculatedStatus}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-black text-zed-foreground mb-3 group-hover:text-zed-primary transition-colors">
                        {comp.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-zed-foreground-secondary font-medium mb-6">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {new Date(comp.submission_deadline || comp.end_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy size={14} /> ${(comp.prize_pool_cents / 100).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest">
                          Vote now
                        </span>
                        <ArrowRight size={16} className="text-zed-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
  )
}
