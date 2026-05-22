import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Clock, DollarSign, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Active Competitions',
  description: 'Browse active idea competitions on ZedIdeaArena. Pitch your ideas, compete with innovators worldwide, and win funding.',
  openGraph: {
    title: 'Active Competitions | ZedIdeaArena',
    description: 'Browse active idea competitions. Pitch your ideas, compete globally, and win funding.',
    url: 'https://zedideaarena.com/competitions',
  },
}

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

async function getCompetitions(): Promise<Competition[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const res = await fetch(`${apiUrl}/competitions`, { next: { revalidate: 60 } })
    const body = await res.json()
    return body?.data?.data || body?.data || []
  } catch {
    return []
  }
}

export default async function CompetitionsPage() {
  const competitions = await getCompetitions()
  const active = competitions.filter((c) => c.calculatedStatus !== 'closed' && !('is_deleted' in c && c.is_deleted))

  return (
    <div className="min-h-screen bg-zed-background">
      <div className="container-zed py-16">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black gradient-text mb-4">Active Competitions</h1>
          <p className="text-zed-foreground-secondary text-lg max-w-2xl mx-auto">
            Browse open competitions, submit your ideas, and compete for funding and recognition.
          </p>
        </div>

        {active.length === 0 ? (
          <div className="text-center py-24 glass-premium rounded-3xl border border-white/5">
            <Trophy size={64} className="mx-auto text-zed-foreground-secondary mb-6 opacity-20" />
            <h3 className="text-xl font-black text-zed-foreground mb-2">No active competitions</h3>
            <p className="text-zed-foreground-secondary">Check back soon for new competitions.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {active.map((comp) => (
              <Link key={comp.id} href={`/competitions/${comp.id}`} className="card-zed group block hover:border-zed-primary/30 transition-all">
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
                    <span className="bg-zed-success/80 text-[10px] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">
                      Open
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-zed-foreground mb-2 group-hover:text-zed-primary transition-colors">
                  {comp.title}
                </h3>
                <p className="text-sm text-zed-foreground-secondary mb-6 line-clamp-2">
                  {comp.description}
                </p>

                <div className="flex flex-wrap gap-4 text-xs font-bold text-zed-foreground-secondary">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-zed-primary" />
                    ${(comp.prize_pool_cents / 100).toLocaleString()} pool
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-yellow-400" />
                    {new Date(comp.submission_deadline).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-purple-400" />
                    {comp.entry_fee_cents ? `$${comp.entry_fee_cents / 100} entry` : 'Free entry'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
