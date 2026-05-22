import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Trophy, Calendar, Clock, DollarSign, ArrowRight } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

async function getCompetition(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const res = await fetch(`${apiUrl}/competitions/${id}`, { next: { revalidate: 60 } })
    const body = await res.json()
    return body?.data?.data || body?.data || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const comp = await getCompetition(id)

  if (!comp) {
    return { title: 'Competition Not Found' }
  }

  return {
    title: comp.title,
    description: comp.description || `Join the ${comp.title} competition on ZedIdeaArena. Submit your idea, compete for funding, and win big.`,
    openGraph: {
      title: comp.title,
      description: comp.description || `Compete in ${comp.title} on ZedIdeaArena.`,
      images: comp.thumbnail_url ? [{ url: comp.thumbnail_url, width: 1200, height: 630 }] : undefined,
      url: `https://zedideaarena.com/competitions/${id}`,
    },
  }
}

export default async function CompetitionDetailPage({ params }: Props) {
  const { id } = await params
  const comp = await getCompetition(id)

  if (!comp) {
    notFound()
  }

  const isOpen = comp.calculatedStatus !== 'closed'

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
              {isOpen && (
                <div className="absolute top-6 right-6">
                  <span className="bg-zed-success text-sm text-white px-4 py-2 rounded-full font-black uppercase tracking-widest">
                    Open for Submissions
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-black text-zed-foreground mb-4">{comp.title}</h1>
            <p className="text-lg text-zed-foreground-secondary leading-relaxed mb-8">
              {comp.description}
            </p>
          </div>

          <div className="space-y-6">
            <div className="card-zed glass-premium p-8">
              <h3 className="text-sm font-black text-zed-foreground uppercase tracking-widest mb-6">Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Trophy size={20} className="text-zed-primary" />
                  <div>
                    <p className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest">Prize Pool</p>
                    <p className="text-2xl font-black text-zed-foreground">${(comp.prize_pool_cents / 100).toLocaleString()}</p>
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
                    <p className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest">Submission Deadline</p>
                    <p className="text-lg font-black text-zed-foreground">{new Date(comp.submission_deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock size={20} className="text-blue-400" />
                  <div>
                    <p className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest">End Date</p>
                    <p className="text-lg font-black text-zed-foreground">{new Date(comp.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {isOpen && (
              <Link
                href={`/auth/signup`}
                className="btn-primary w-full flex items-center justify-center gap-3 py-5 text-lg"
              >
                Enter Competition <ArrowRight size={22} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
