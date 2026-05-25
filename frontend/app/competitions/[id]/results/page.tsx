'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { Trophy, Medal, Loader2, ArrowLeft, Crown, Star } from 'lucide-react'
import { voteService } from '@/services/core'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import api from '@/lib/api'

const PRIZE_SHARES = [0.30, 0.15, 0.10, 0.075, 0.05, 0.04, 0.035, 0.03, 0.025, 0.02]

function calcPrize(rank: number, prizePoolCents: number): number {
  if (rank <= PRIZE_SHARES.length) {
    return Math.round(prizePoolCents * PRIZE_SHARES[rank - 1])
  }
  return 0
}

function remainingPool(prizePoolCents: number, rankedCount: number): number {
  const awarded = rankedCount > 0 ? Math.min(rankedCount, PRIZE_SHARES.length) : 0
  const distributed = PRIZE_SHARES.slice(0, awarded).reduce((s, p) => s + p, 0)
  return prizePoolCents * (1 - distributed)
}

export default function CompetitionResultsPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [competition, setCompetition] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchResults = async () => {
      try {
        const [compRes, lbRes] = await Promise.all([
          api.get(`/competitions/${id}`),
          voteService.getLeaderboard(id as string),
        ])
        setCompetition(compRes.data)
        setLeaderboard(lbRes.data || [])
      } catch (err) {
        console.error('Failed to fetch results:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [id])

  const prizePoolCents = competition?.prize_pool_cents || 0
  const isClosed = competition?.calculatedStatus === 'closed'

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={20} />
    if (rank === 2) return <Medal className="text-gray-300" size={20} />
    if (rank === 3) return <Medal className="text-amber-600" size={20} />
    return <span className="text-sm font-black text-zed-foreground-secondary w-5 text-center">{rank}</span>
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-zed-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-8 bg-zed-background-alt">
            <div className="max-w-5xl mx-auto">
              <Link
                href={`/dashboard/competitions/${id}`}
                className="text-xs text-zed-foreground-secondary hover:text-zed-primary font-bold uppercase tracking-widest flex items-center gap-2 mb-6"
              >
                <ArrowLeft size={14} /> Back to Competition
              </Link>

              <div className="flex items-center gap-4 mb-8">
                <Trophy className="text-zed-primary" size={32} />
                <div>
                  <h1 className="text-4xl font-black text-zed-foreground">Results</h1>
                  <p className="text-zed-foreground-secondary font-medium">{competition?.title || 'Competition'}</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 size={48} className="animate-spin text-zed-primary" />
                </div>
              ) : !isClosed ? (
                <div className="text-center py-24 glass-premium rounded-3xl border border-white/5">
                  <Trophy size={64} className="mx-auto text-zed-foreground-secondary mb-6 opacity-20" />
                  <h3 className="text-xl font-black text-zed-foreground mb-2">Results not yet available</h3>
                  <p className="text-zed-foreground-secondary">Leaderboard will be published after the competition closes.</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-24 glass-premium rounded-3xl border border-white/5">
                  <Star size={64} className="mx-auto text-zed-foreground-secondary mb-6 opacity-20" />
                  <h3 className="text-xl font-black text-zed-foreground mb-2">No results to display</h3>
                  <p className="text-zed-foreground-secondary">No approved public ideas received votes in this competition.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="glass-premium rounded-3xl overflow-hidden border border-white/5">
                    <div className="p-6 border-b border-white/5">
                      <h2 className="text-lg font-black text-zed-foreground uppercase tracking-widest flex items-center gap-3">
                        <Trophy size={20} className="text-zed-primary" /> Leaderboard
                      </h2>
                    </div>
                    <div className="divide-y divide-white/5">
                      <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">
                        <div className="col-span-1">#</div>
                        <div className="col-span-4">Contestant</div>
                        <div className="col-span-4">Idea</div>
                        <div className="col-span-1 text-right">Votes</div>
                        <div className="col-span-2 text-right">Prize</div>
                      </div>
                      {leaderboard.map((entry: any, index: number) => {
                        const rank = entry.rank || index + 1
                        const prize = calcPrize(rank, prizePoolCents)
                        return (
                          <div
                            key={entry.id}
                            className={`grid grid-cols-12 gap-4 px-6 py-5 items-center transition-colors hover:bg-white/5 ${rank <= 3 ? 'bg-gradient-to-r from-yellow-500/5 via-transparent to-transparent' : ''}`}
                          >
                            <div className="col-span-1 flex items-center">{rankIcon(rank)}</div>
                            <div className="col-span-4">
                              <p className="text-sm font-bold text-zed-foreground truncate">{entry.contestant_name}</p>
                            </div>
                            <div className="col-span-4">
                              <p className="text-sm font-medium text-zed-foreground-secondary truncate">{entry.title}</p>
                            </div>
                            <div className="col-span-1 text-right">
                              <span className="text-sm font-black text-zed-foreground">{entry.vote_count}</span>
                            </div>
                            <div className="col-span-2 text-right">
                              {prize > 0 ? (
                                <span className="text-sm font-black text-zed-success">${(prize / 100).toLocaleString()}</span>
                              ) : (
                                <span className="text-xs text-zed-foreground-secondary">—</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="glass-premium rounded-3xl p-8 border border-white/5">
                    <h2 className="text-lg font-black text-zed-foreground uppercase tracking-widest flex items-center gap-3 mb-6">
                      <Trophy size={20} className="text-zed-primary" /> Prize Pool Distribution
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {PRIZE_SHARES.slice(0, Math.min(leaderboard.length, PRIZE_SHARES.length)).map((share, i) => {
                        const prize = calcPrize(i + 1, prizePoolCents)
                        return (
                          <div key={i} className={`p-4 rounded-2xl border ${i < 3 ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-white/5 bg-white/5'}`}>
                            <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest mb-1">
                              {i === 0 ? '1st Place' : i === 1 ? '2nd Place' : i === 2 ? '3rd Place' : `${i + 1}th Place`}
                            </p>
                            <p className="text-xl font-black text-zed-foreground">${(prize / 100).toLocaleString()}</p>
                            <p className="text-[10px] text-zed-foreground-secondary font-bold">{(share * 100).toFixed(1)}%</p>
                          </div>
                        )
                      })}
                      {leaderboard.length > PRIZE_SHARES.length && (
                        <div className="p-4 rounded-2xl border border-white/5 bg-white/5 col-span-full">
                          <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest mb-1">Remaining Pool</p>
                          <p className="text-xl font-black text-zed-foreground">
                            ${(remainingPool(prizePoolCents, leaderboard.length) / 100).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zed-foreground-secondary font-bold">
                            Split among remaining {leaderboard.length - PRIZE_SHARES.length} contestants
                          </p>
                        </div>
                      )}
                      <div className="p-4 rounded-2xl border border-zed-primary/20 bg-zed-primary/5 col-span-full">
                        <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest mb-1">Total Prize Pool</p>
                        <p className="text-2xl font-black text-zed-primary">${(prizePoolCents / 100).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
