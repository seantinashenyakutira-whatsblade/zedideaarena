'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Trophy, Vote, ChevronRight, CheckCircle2, Wallet, Loader2 } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

export default function VoterDashboardPage() {
  const { profile } = useAuth()
  const [activeCompetitions, setActiveCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await api.get('/competitions')
        const all = res.data.data || []
        const active = all.filter((c: any) => c.calculatedStatus === 'active' || c.calculatedStatus === 'upcoming')
        setActiveCompetitions(active)
      } catch { /* silent */ }
      setLoading(false)
    }
    fetchCompetitions()
  }, [])

  const paidComps = (profile?.voter_competitions_paid || []) as string[]
  const hasPaidAnyComp = paidComps.length > 0

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
          <p className="text-4xl font-black text-zed-foreground glow-counter">{activeCompetitions.length}</p>
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

        <div className="card-zed glass-premium p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-2xl bg-zed-success/20 text-zed-success">
              <Wallet size={28} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
          <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mb-2">Earnings</p>
          <p className="text-4xl font-black text-zed-foreground glow-counter">$0.00</p>
        </div>
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

      {profile?.is_verified && !hasPaidAnyComp && (
        <div className="card-zed glass-premium border-zed-primary/40 mb-8 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black text-zed-foreground mb-1">Register to Vote</h3>
            <p className="text-sm text-zed-foreground-secondary">
              Pay the seasonal voter registration fee to start casting your votes.
            </p>
          </div>
          <Link href="/dashboard/payment" className="btn-primary px-8 py-3 text-xs font-black flex items-center gap-2">
            Register Now <ChevronRight size={16} />
          </Link>
        </div>
      )}

      {profile?.is_verified && hasPaidAnyComp && (
        <div className="card-zed glass-premium border-zed-success/20 mb-8 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zed-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 size={24} className="text-zed-success" />
            </div>
            <div>
              <h3 className="text-lg font-black text-zed-foreground mb-1">Ready to Vote!</h3>
              <p className="text-sm text-zed-foreground-secondary">Browse ideas and cast your votes in active competitions.</p>
            </div>
          </div>
          <Link href="/dashboard/voting" className="btn-primary px-8 py-3 text-xs font-black flex items-center gap-2">
            Go to Voting Arena <ChevronRight size={16} />
          </Link>
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
