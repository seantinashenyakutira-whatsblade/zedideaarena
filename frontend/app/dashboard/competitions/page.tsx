'use client'

import { useState, useEffect } from 'react'
import { Trophy, Calendar, Users, ArrowRight, Loader2, Star, CheckCircle, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'
import Link from 'next/link'
import { CompetitionCountdown } from '@/components/CompetitionCountdown'

type Tab = 'all' | 'joined'

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<any[]>([])
  const [joinedCompetitions, setJoinedCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [joinedLoading, setJoinedLoading] = useState(false)
  const [tab, setTab] = useState<Tab>('all')

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await api.get('/competitions')
        setCompetitions(res.data || [])
      } catch (err) {
        console.error('Failed to fetch competitions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCompetitions()
  }, [])

  useEffect(() => {
    if (tab !== 'joined') return
    const fetchJoined = async () => {
      setJoinedLoading(true)
      try {
        const res = await api.get('/payments/my-competitions')
        setJoinedCompetitions(res.data || [])
      } catch (err) {
        console.error('Failed to fetch joined competitions:', err)
        setJoinedCompetitions([])
      } finally {
        setJoinedLoading(false)
      }
    }
    fetchJoined()
  }, [tab])

  // Real-time: live prize pool and competition status
  useEffect(() => {
    const channel = supabase.channel('dashboard-competitions')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'competitions' },
        (payload: any) => {
          setCompetitions(prev => prev.map(c =>
            c.id === payload.new.id
              ? { ...c, prize_pool_cents: payload.new.prize_pool_cents, calculatedStatus: payload.new.calculatedStatus }
              : c
          ))
          setJoinedCompetitions(prev => prev.map(c =>
            c.id === payload.new.id
              ? { ...c, prize_pool_cents: payload.new.prize_pool_cents, calculatedStatus: payload.new.calculatedStatus }
              : c
          ))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const displayCompetitions = tab === 'joined' ? joinedCompetitions : competitions

  const tabClasses = (t: Tab) =>
    `px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
      tab === t
        ? 'bg-zed-primary text-white shadow-lg shadow-zed-primary/30'
        : 'text-zed-foreground-secondary hover:text-zed-foreground bg-white/5'
    }`

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-zed-foreground mb-2 flex items-center gap-3">
            <Trophy className="text-zed-primary" size={32} /> Arena Competitions
          </h1>
          <p className="text-zed-foreground-secondary font-medium">Join seasonal challenges and win funding for your vision.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-10 bg-white/5 rounded-2xl p-1.5 w-fit border border-white/5">
        <button onClick={() => setTab('all')} className={tabClasses('all')}>
          <Star size={16} /> All Challenges
        </button>
        <button onClick={() => setTab('joined')} className={tabClasses('joined')}>
          <CheckCircle size={16} /> My Challenges
        </button>
      </div>

      {tab === 'all' && loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2].map(i => <div key={i} className="card-zed h-64 animate-pulse opacity-50" />)}
        </div>
      ) : tab === 'joined' && joinedLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={40} className="animate-spin text-zed-primary" />
        </div>
      ) : displayCompetitions.length === 0 ? (
        <div className="text-center py-24 glass-premium rounded-3xl">
          <Trophy size={64} className="mx-auto text-zed-foreground-secondary mb-6 opacity-20" />
          <h3 className="text-xl font-black text-zed-foreground mb-2">
            {tab === 'joined' ? 'No joined competitions' : 'No active competitions'}
          </h3>
          <p className="text-zed-foreground-secondary">
            {tab === 'joined' ? 'Join a competition to see it here.' : 'Check back soon for new challenges!'}
          </p>
          {tab === 'joined' && (
            <button onClick={() => setTab('all')} className="btn-primary mt-6 px-8 py-3 rounded-xl text-xs font-black inline-flex items-center gap-2">
              Browse Challenges <ArrowRight size={16} />
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {displayCompetitions.map((comp: any) => (
            <div key={comp.id} className="card-zed group relative overflow-hidden flex flex-col hover:border-zed-primary/40 transition-all duration-500">
              {/* Banner */}
              <div className="h-56 relative overflow-hidden">
                 <img 
                  src={comp.thumbnail_url || '/hero_3d_arena_bg_1777051043555.png'} 
                  alt={comp.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-zed-background via-zed-background/20 to-transparent" />
                 <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md border ${
                      comp.calculatedStatus === 'active' 
                        ? 'bg-zed-success/20 text-zed-success border-zed-success/40' 
                        : comp.calculatedStatus === 'upcoming'
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-red-500/20 text-red-500 border-red-500/40'
                    }`}>
                      {comp.calculatedStatus}
                    </span>
                    {comp.joined_as?.includes('contestant') && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md border bg-zed-accent/20 text-zed-accent border-zed-accent/40">
                        Contestant
                      </span>
                    )}
                    {comp.joined_as?.includes('voter') && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md border bg-blue-500/20 text-blue-400 border-blue-500/40">
                        Voter
                      </span>
                    )}
                 </div>
                 <h2 className="absolute bottom-6 left-8 text-3xl font-black text-white drop-shadow-2xl">{comp.title}</h2>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <p className="text-zed-foreground-secondary text-sm mb-8 leading-relaxed line-clamp-2">
                  {comp.description}
                </p>

                <div className="grid grid-cols-2 gap-6 mb-8 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zed-primary">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-zed-foreground-secondary font-black uppercase tracking-widest">Deadline</p>
                      <p className="text-sm font-bold">{new Date(comp.submission_deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zed-accent">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-zed-foreground-secondary font-black uppercase tracking-widest">Participants</p>
                      <p className="text-sm font-bold">{comp.participants_count || 0}+ innovators</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zed-foreground-secondary uppercase font-bold tracking-widest">Entry Fee</span>
                    <span className="text-2xl font-black text-zed-foreground">${(comp.entry_fee_cents / 100).toFixed(2)}</span>
                    <CompetitionCountdown deadline={comp.submission_deadline} />
                  </div>
                  <Link 
                    href={`/dashboard/competitions/${comp.id}`}
                    className={`btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-black shadow-xl ${comp.calculatedStatus !== 'active' ? 'opacity-50 pointer-events-none grayscale' : ''}`}
                  >
                    {comp.calculatedStatus === 'closed' ? 'Closed' : comp.joined_as?.length > 0 ? 'Manage' : 'View Details'} <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
