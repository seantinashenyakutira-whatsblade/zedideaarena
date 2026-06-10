'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Trophy, Medal, ArrowLeft, Loader2, Crown } from 'lucide-react'
import api from '@/lib/api'

const medalColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600']

export default function LeaderboardPage() {
  const { id } = useParams()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [competition, setCompetition] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbRes, compRes] = await Promise.all([
          api.get(`/votes/${id}/leaderboard`),
          api.get(`/competitions/${id}`),
        ])
        setLeaderboard(lbRes.data || [])
        setCompetition(compRes.data)
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen bg-zed-background items-center justify-center">
        <Loader2 size={48} className="animate-spin text-zed-primary" />
      </div>
    )
  }

  return (
    <main className="container-zed py-8">
      <button
        onClick={() => router.back()}
        className="btn-secondary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black mb-8"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="text-center mb-12">
        <Crown size={48} className="text-yellow-400 mx-auto mb-4" />
        <h1 className="text-5xl font-black text-zed-foreground mb-2">Leaderboard</h1>
        <p className="text-zed-foreground-secondary">
          {competition?.title || 'Competition'} — Live rankings
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="card-zed p-24 text-center">
          <Trophy size={64} className="mx-auto mb-6 text-zed-foreground-secondary opacity-30" />
          <h3 className="text-xl font-bold mb-2">No rankings yet</h3>
          <p className="text-zed-foreground-secondary">Votes will appear here once voting begins.</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {leaderboard.map((entry: any, index: number) => (
            <div
              key={entry.id || entry.idea_id || index}
              className={`card-zed glass-premium p-6 flex items-center gap-6 transition-all duration-500 ${
                index < 3 ? 'border-zed-primary/30 bg-zed-primary/5' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0">
                {index < 3 ? (
                  <Medal size={24} className={medalColors[index]} />
                ) : (
                  <span className="text-xl font-black text-zed-foreground-secondary">
                    {index + 1}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-black text-zed-foreground truncate">
                  {entry.title || entry.idea_title || `Idea #${index + 1}`}
                </h3>
                {entry.users?.full_name && (
                  <p className="text-sm text-zed-foreground-secondary truncate">
                    by {entry.users.full_name}
                  </p>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-black text-zed-primary">{entry.votes_count || entry.votes || 0}</p>
                <p className="text-[10px] text-zed-foreground-secondary uppercase tracking-widest font-bold">
                  votes
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
