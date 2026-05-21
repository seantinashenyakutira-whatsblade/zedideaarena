'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ShieldCheck, CreditCard, Vote, ChevronRight, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export default function VoterOnboardingPage() {
  const { profile, refreshProfile } = useAuth()
  const [localProfile, setLocalProfile] = useState<any>(null)

  useEffect(() => {
    setLocalProfile(profile)
  }, [profile])

  const steps = [
    {
      title: 'Complete Profile',
      desc: 'Fill in your details for admin review',
      icon: ShieldCheck,
      status: localProfile?.full_name && localProfile?.id_number ? 'completed' : 'todo',
      link: '/dashboard/settings',
    },
    {
      title: 'Admin Verification',
      desc: 'An admin will verify your identity',
      icon: ShieldCheck,
      status: localProfile?.is_verified ? 'completed' : localProfile?.full_name ? 'pending' : 'locked',
      link: '/dashboard/settings',
    },
    {
      title: 'Voter Registration Fee',
      desc: '$15 one-time entry for the season',
      icon: CreditCard,
      status: localProfile?.voter_payment_status === 'paid' ? 'completed' : localProfile?.is_verified ? 'todo' : 'locked',
      link: `/dashboard/payment?type=voter&amount=15`,
    },
    {
      title: 'Cast Your Votes',
      desc: 'Support your favorite visions',
      icon: Vote,
      status: (localProfile?.is_verified && localProfile?.voter_payment_status === 'paid') ? 'todo' : 'locked',
      link: '/dashboard/voting',
    },
  ]

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-zed-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12 text-center md:text-left">
                <h1 className="text-4xl font-black text-zed-foreground mb-4">Voter Onboarding</h1>
                <p className="text-zed-foreground-secondary text-lg max-w-2xl">
                  To ensure the integrity of the Arena, all voters must be verified by an admin and pay a seasonal participation fee.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, i) => {
                  const Icon = step.icon
                  const isLocked = step.status === 'locked'
                  const isCompleted = step.status === 'completed'
                  const isPending = step.status === 'pending'

                  return (
                    <div
                      key={i}
                      className={`card-zed relative p-8 flex flex-col gap-6 transition-all duration-300 ${isLocked ? 'opacity-50 grayscale pointer-events-none' : 'hover:scale-[1.02]'} ${isCompleted ? 'border-zed-success/30' : ''}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCompleted ? 'bg-zed-success/10 text-zed-success' : 'bg-zed-primary/10 text-zed-primary'}`}>
                        <Icon size={24} />
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-zed-foreground mb-1">{step.title}</h3>
                        <p className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest">{step.desc}</p>
                      </div>

                      <div className="mt-auto">
                        {isCompleted ? (
                          <div className="flex items-center gap-2 text-zed-success font-black text-xs uppercase tracking-tighter">
                            <CheckCircle2 size={16} /> Done
                          </div>
                        ) : isPending ? (
                          <div className="flex items-center gap-2 text-yellow-400 font-black text-xs uppercase tracking-tighter">
                            <Clock size={16} /> Pending
                          </div>
                        ) : (
                          <Link href={step.link} className="flex items-center justify-between w-full btn-primary py-3 px-4 text-xs font-black rounded-xl">
                            {step.status === 'todo' ? 'Get Started' : 'Go'} <ChevronRight size={16} />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {(localProfile?.is_verified && localProfile?.voter_payment_status === 'paid') ? (
                <div className="mt-12 p-8 glass-premium rounded-3xl border border-zed-success/20 animate-zed-fade-up">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 bg-zed-success/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={48} className="text-zed-success animate-pulse" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-black text-zed-foreground mb-2">You are officially a Voter!</h2>
                      <p className="text-zed-foreground-secondary font-medium">Your account is fully verified. You can now explore ideas and cast your votes in the Arena.</p>
                    </div>
                    <Link href="/dashboard/voting" className="btn-primary px-8 py-4 rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.4)]">
                      Go to Voting Arena
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-12 p-8 bg-white/5 rounded-3xl border border-white/5 flex items-start gap-6">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <ShieldCheck size={24} className="text-zed-foreground-secondary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-zed-foreground mb-1 uppercase tracking-widest">Why do we require this?</h4>
                    <p className="text-xs text-zed-foreground-secondary leading-relaxed max-w-xl">
                      ZedIdeaArena uses identity verification and a small entry fee to prevent bot manipulation and ensure that every vote comes from a real, committed person. This maintains the fairness of the competition.
                    </p>
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
