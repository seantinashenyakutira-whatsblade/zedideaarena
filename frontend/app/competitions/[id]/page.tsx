'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Trophy, Calendar, Clock, DollarSign, ArrowRight, Loader2, Users } from 'lucide-react'
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

interface Idea {
  id: string
  title: string
  problem_statement: string
  industry: string
  image_url: string
  votes_count: number
  users: { full_name: string }
}

const statusConfig: Record<string, { label: string; bg: string }> = {
  upcoming: { label: 'UPCOMING', bg: 'bg-blue-500/80' },
  active: { label: 'ACTIVE', bg: 'bg-zed-success/80' },
  closed: { label: 'CLOSED', bg: 'bg-gray-500/60' },
}

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [comp, setComp] = useState<Competition | null>(null)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://zedideaarena.onrender.com/api'

        const [compRes, ideasRes] = await Promise.all([
          fetch(`${baseUrl}/competitions/${id}`).then(r => r.json()),
          fetch(`${baseUrl}/ideas/public`).then(r => r.json()),
        ])

        const competition = compRes?.data?.data || compRes?.data || null
        setComp(competition)

        if (competition) {
          const allIdeas = ideasRes?.data || []
          const filtered = allIdeas
            .filter((idea: any) =>
              idea.competition_id === id &&
              idea.is_public === true
            )
            .slice(0, 20)
          setIdeas(filtered)
        }
      } catch {
        setComp(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleEnterCompetition = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push(`/auth/login?redirect=/competitions/${id}`)
      return
    }
    router.push(`/dashboard/ideas/new?competitionId=${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zed-background flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-zed-primary" />
      </div>
    )
  }

  if (!comp) {
    return (
      <div className="min-h-screen bg-zed-background flex items-center justify-center">
        <div className="text-center">
          <Trophy size={64} className="mx-auto text-zed-foreground-secondary mb-4 opacity-20" />
          <h1 className="text-3xl font-black text-zed-foreground mb-2">Competition Not Found</h1>
          <Link href="/competitions" className="text-zed-primary hover:underline">Back to competitions</Link>
        </div>
      </div>
    )
  }

  const cfg = statusConfig[comp.calculatedStatus] || statusConfig.upcoming
  const isActive = comp.calculatedStatus === 'active'

  return (
    <div className="min-h-screen bg-zed-background">
      <div className="container-zed py-16">
        <Link href="/competitions" className="text-xs text-zed-foreground-secondary hover:text-zed-primary font-bold uppercase tracking-widest flex items-center gap-2 mb-8">
          <ArrowRight size={14} className="rotate-180" /> Back to Competitions
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="relative aspect-video rounded-3xl overflow-hidden mb-8">
              <Image
                src={comp.thumbnail_url || '/hero_3d_arena_bg_1777051043555.png'}
                alt={comp.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute top-6 right-6">
                <span className={`${cfg.bg} text-sm text-white px-4 py-2 rounded-full font-black uppercase tracking-widest`}>
                  {cfg.label}
                </span>
              </div>
            </div>

            <h1 className="text-4xl font-black text-zed-foreground mb-4">{comp.title}</h1>
            <p className="text-lg text-zed-foreground-secondary leading-relaxed mb-12">
              {comp.description}
            </p>

            {ideas.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-zed-foreground mb-6 flex items-center gap-3">
                  <Users size={24} className="text-zed-primary" /> Submitted Ideas
                </h2>
                <div className="grid gap-4">
                  {ideas.map((idea) => (
                    <div key={idea.id} className="card-zed p-6 flex items-center gap-6 hover:border-zed-primary/30 transition-all">
                      <div className="w-16 h-16 rounded-2xl bg-zed-primary/10 flex items-center justify-center text-zed-primary font-black text-lg flex-shrink-0">
                        {idea.votes_count || 0}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-zed-foreground mb-1 truncate">{idea.title}</h3>
                        <p className="text-xs text-zed-foreground-secondary truncate">
                          by {idea.users?.full_name || 'Unknown'} &middot; {idea.industry || 'General'}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/ideas/${idea.id}`}
                        className="btn-secondary text-xs px-4 py-2 rounded-xl font-black"
                      >
                        View <ArrowRight size={14} className="inline ml-1" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6 sticky top-6">
            <div className="card-zed glass-premium p-8">
              <h3 className="text-sm font-black text-zed-foreground uppercase tracking-widest mb-6">Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Trophy size={20} className="text-zed-primary" />
                  <div>
                    <p className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest">Prize Pool</p>
                    <p className="text-2xl font-black text-zed-foreground">${(comp.prize_pool_cents / 100).toLocaleString()}</p>
                    <p className="text-xs text-zed-foreground-secondary mt-1">Grows with every entry</p>
                  </div>
                </div>
                {comp.entry_fee_cents > 0 && (
                  <div className="flex items-center gap-4">
                    <DollarSign size={20} className="text-yellow-400" />
                    <div>
                      <p className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest">Entry Fee</p>
                      <p className="text-lg font-black text-zed-foreground">${(comp.entry_fee_cents / 100).toFixed(2)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Calendar size={20} className="text-purple-400" />
                  <div>
                    <p className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest">Start Date</p>
                    <p className="text-lg font-black text-zed-foreground">{new Date(comp.start_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Calendar size={20} className="text-blue-400" />
                  <div>
                    <p className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest">Submission Deadline</p>
                    <p className="text-lg font-black text-zed-foreground">{new Date(comp.submission_deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock size={20} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest">End Date</p>
                    <p className="text-lg font-black text-zed-foreground">{new Date(comp.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {comp.calculatedStatus === 'active' && (
              <div className="card-zed glass-premium p-6">
                <p className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest mb-3">Time Remaining</p>
                <CompetitionCountdown deadline={comp.submission_deadline} />
              </div>
            )}

            {comp.calculatedStatus === 'upcoming' && (
              <div className="card-zed glass-premium p-6">
                <p className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest mb-3">Starts In</p>
                <CompetitionCountdown deadline={comp.start_date} />
              </div>
            )}

            {isActive ? (
              <button
                onClick={handleEnterCompetition}
                className="btn-primary w-full flex items-center justify-center gap-3 py-5 text-lg"
              >
                Enter Competition <ArrowRight size={22} />
              </button>
            ) : (
              <button
                disabled
                className="btn-secondary w-full flex items-center justify-center gap-3 py-5 text-lg cursor-not-allowed opacity-50"
              >
                {comp.calculatedStatus === 'upcoming' ? 'Coming Soon' : 'Competition Closed'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
