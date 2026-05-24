'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Trophy, Vote, ChevronRight, CheckCircle2, Wallet, Loader2, DollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

export default function VoterDashboardPage() {
  const { profile } = useAuth()
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await api.get('/competitions')
        const all = res.data.data || []
        setCompetitions(all)
      } catch { /* silent */ }
      setLoading(false)
    }
    fetchCompetitions()
  }, [])

  const paidComps = (profile?.voter_competitions_paid || []) as string[]
  const active = competitions.filter((c: any) => c.calculatedStatus === 'active' || c.calculatedStatus === 'upcoming')

  return (
    <>
      <div className="mb-12 animate-zed-fade-up">
        <div>
          <h1 className="text-4xl font-black gradient-text mb-2 drop-shadow-lg">
            Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-zed-foreground-secondary font-medium">Vote for the ideas you believe in</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="card-zed glass-premium p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-2xl bg-zed-primary/20 text-zed-primary">
              <Trophy size={28} className="drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
            </div>
          </div>
          <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mb-2">Active Competitions</p>
          <p className="text-4xl font-black text-zed-foreground glow-counter">{active.length}</p>
        </div>

        <div className="card-zed glass-premium p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-2xl bg-zed-accent/20 text-zed-accent">
              <Vote size={28} className="drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
            </div>
          </div>
          <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mb-2">My Votes</p>
          <p className="text-4xl font-black text-zed-foreground glow-counter">0</p>
        </div>

        <Link href="/dashboard/earnings" className="card-zed glass-premium p-8 hover:border-zed-success/30 transition-all group">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-2xl bg-zed-success/20 text-zed-success">
              <Wallet size={28} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
          <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mb-2">Earnings</p>
          <p className="text-4xl font-black text-zed-foreground glow-counter">$0.00</p>
        </Link>
      </div>

      {!profile?.is_verified && (
        <div className="card-zed glass-premium border-yellow-500/40 mb-8 p-8 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-yellow-500 mb-1">Verification Pending</h3>
            <p className="text-sm text-zed-foreground-secondary">
              Your account is pending admin verification. You&apos;ll be notified by email once approved.
            </p>
          </div>
        </div>
      )}

      {profile?.is_verified && active.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-black text-zed-foreground mb-6">Competitions</h3>
          <div className="grid gap-6">
            {active.map((comp) => {
              const isPaid = paidComps.includes(comp.id)
              return (
                <div key={comp.id} className={`card-zed p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border ${isPaid ? 'border-zed-success/20' : 'border-white/5'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPaid ? 'bg-zed-success/20' : 'bg-white/5'}`}>
                      {isPaid ? <CheckCircle2 size={24} className="text-zed-success" /> : <Trophy size={24} className="text-zed-primary" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-zed-foreground text-lg">{comp.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zed-foreground-secondary">
                        <span className="flex items-center gap-1">
                          <DollarSign size={12} /> ${(comp.voter_fee_cents / 100).toFixed(2)} fee
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(comp.submission_deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isPaid ? (
                    <Link href={`/vote/${comp.id}`} className="btn-primary px-6 py-3 text-xs font-black flex items-center gap-2 flex-shrink-0">
                      Vote Now <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <Link href={`/dashboard/payment?competition=${comp.id}&type=voter`} className="btn-primary px-6 py-3 text-xs font-black flex items-center gap-2 flex-shrink-0">
                      Register to Vote <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-zed-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-zed-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-zed-foreground">Loading Arena...</p>
          </div>
        </div>
      )}
    </>
  )
}
