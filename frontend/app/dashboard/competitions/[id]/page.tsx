'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Trophy, Calendar, Users, ArrowRight, Loader2, FileText, Shield, Info, CheckCircle2 } from 'lucide-react'
import api from '@/lib/api'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function CompetitionDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [competition, setCompetition] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/competitions/${id}`)
        setCompetition(res.data.data)
      } catch (err) {
        console.error('Failed to fetch competition detail:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen bg-zed-background items-center justify-center">
        <Loader2 size={48} className="animate-spin text-zed-primary" />
      </div>
    )
  }

  if (!competition) return null

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-zed-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
             <div className="relative h-80 w-full">
                <img 
                  src={competition.thumbnail_url || 'https://via.placeholder.com/1200x600?text=ZedIdeaArena'} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zed-background via-zed-background/60 to-transparent" />
                <div className="absolute bottom-12 left-0 right-0 container-zed">
                   <h1 className="text-5xl font-black text-white mb-4 drop-shadow-2xl">{competition.title}</h1>
                   <div className="flex items-center gap-6">
                      <span className="flex items-center gap-2 bg-zed-primary/20 backdrop-blur-md px-4 py-2 rounded-xl text-zed-primary font-bold border border-zed-primary/30">
                        <Trophy size={18} /> Grand Prize: $50,000
                      </span>
                      <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold border border-white/20">
                        <Calendar size={18} /> Deadline: {new Date(competition.submission_deadline).toLocaleDateString()}
                      </span>
                   </div>
                </div>
             </div>

             <div className="container-zed py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                   <div className="lg:col-span-2 space-y-12">
                      <section>
                         <h3 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                           <Info size={24} className="text-zed-primary" /> About the Competition
                         </h3>
                         <p className="text-zed-foreground-secondary leading-relaxed text-lg font-medium">
                           {competition.description}
                         </p>
                      </section>

                      <section className="p-8 bg-white/5 rounded-3xl border border-white/10">
                         <h3 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                           <Shield size={24} className="text-zed-accent" /> Official Rules
                         </h3>
                         <ul className="space-y-6">
                            <li className="flex gap-4">
                               <CheckCircle2 className="text-zed-success flex-shrink-0" />
                               <div>
                                  <h4 className="font-bold text-white mb-1">One Entry Per Innovator</h4>
                                  <p className="text-sm text-zed-foreground-secondary">Multiple submissions from the same account will lead to disqualification.</p>
                               </div>
                            </li>
                            <li className="flex gap-4">
                               <CheckCircle2 className="text-zed-success flex-shrink-0" />
                               <div>
                                  <h4 className="font-bold text-white mb-1">Original Vision</h4>
                                  <p className="text-sm text-zed-foreground-secondary">The idea must be original and not violate any existing IP laws.</p>
                               </div>
                            </li>
                            <li className="flex gap-4">
                               <CheckCircle2 className="text-zed-success flex-shrink-0" />
                               <div>
                                  <h4 className="font-bold text-white mb-1">Pitch Video Requirement</h4>
                                  <p className="text-sm text-zed-foreground-secondary">A 2-5 minute video pitch is mandatory for a valid entry.</p>
                               </div>
                            </li>
                         </ul>
                      </section>
                   </div>

                   <div className="space-y-8">
                      <div className="card-zed glass-premium p-8 sticky top-8">
                         <div className="mb-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary mb-1">Entry Fee</p>
                            <p className="text-4xl font-black text-zed-foreground">${competition.entry_fee}.00</p>
                         </div>
                         
                         <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm">
                               <span className="text-zed-foreground-secondary">Participants</span>
                               <span className="font-bold">{competition.participants_count || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                               <span className="text-zed-foreground-secondary">Submissions</span>
                               <span className="font-bold">{competition.ideas_count || 0}</span>
                            </div>
                         </div>

                         {competition.calculatedStatus === 'active' ? (
                           <Link 
                            href={`/dashboard/ideas/new?competitionId=${competition.id}`}
                            className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black"
                           >
                            Enter Arena Now <ArrowRight size={18} />
                           </Link>
                         ) : (
                           <button className="btn-secondary w-full py-4 rounded-2xl cursor-not-allowed opacity-50 grayscale" disabled>
                             Competition {competition.calculatedStatus}
                           </button>
                         )}
                         
                         <p className="mt-6 text-center text-[10px] text-zed-foreground-secondary uppercase font-bold tracking-widest">
                           Secure checkout via Stripe
                         </p>
                      </div>

                      <div className="p-6 bg-zed-primary/5 rounded-3xl border border-zed-primary/10 flex items-center gap-4">
                         <FileText className="text-zed-primary" />
                         <div>
                            <p className="text-xs font-bold">Guidelines.pdf</p>
                            <p className="text-[10px] text-zed-foreground-secondary">Technical requirements</p>
                         </div>
                         <ArrowRight size={16} className="ml-auto opacity-20" />
                      </div>
                   </div>
                </div>
             </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
