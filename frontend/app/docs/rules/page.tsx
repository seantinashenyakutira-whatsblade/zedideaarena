'use client'

import { ArrowLeft, ShieldCheck, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-zed-background text-zed-foreground p-8 pb-24">
      <div className="max-w-4xl mx-auto animate-zed-fade-up">
        <Link href="/" className="inline-flex items-center gap-2 text-zed-foreground-secondary hover:text-zed-primary transition-colors mb-12 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-12">
          <img src="/logo-icon.png" alt="ZedIdeaArena" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
          <h1 className="text-5xl font-black gradient-text">Competition Rules</h1>
        </div>

        <div className="space-y-12">
          <section className="card-zed glass-premium p-8 border-white/5">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><ShieldCheck className="text-zed-primary" /> 1. Eligibility</h2>
            <ul className="space-y-4 text-zed-foreground-secondary font-medium leading-relaxed">
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-zed-success shrink-0 mt-1" /> Participants must be at least 18 years of age.</li>
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-zed-success shrink-0 mt-1" /> All ideas must be strictly original and not infringe on existing IP.</li>
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-zed-success shrink-0 mt-1" /> Contestants must complete Identity Verification (KYC) before receiving any prize pools.</li>
            </ul>
          </section>

          <section className="card-zed glass-premium p-8 border-white/5">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><FileText className="text-zed-primary" /> 2. Submission Guidelines</h2>
            <ul className="space-y-4 text-zed-foreground-secondary font-medium leading-relaxed">
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-zed-success shrink-0 mt-1" /> Submissions require a non-refundable entry fee of $5.00 to ensure high-quality participation.</li>
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-zed-success shrink-0 mt-1" /> Pitch videos must be between 2 to 5 minutes in length.</li>
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-zed-success shrink-0 mt-1" /> The problem statement and proposed solution must be clearly articulated.</li>
            </ul>
          </section>

          <section className="card-zed glass-premium p-8 border-white/5">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><ShieldCheck className="text-zed-primary" /> 3. Voting & Conduct</h2>
            <ul className="space-y-4 text-zed-foreground-secondary font-medium leading-relaxed">
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-zed-success shrink-0 mt-1" /> Voters must pay a one-time $15.00 voter registration fee and pass KYC to ensure authentic votes.</li>
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-zed-success shrink-0 mt-1" /> Self-voting or use of bot farms will result in immediate disqualification and a permanent ban.</li>
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-zed-success shrink-0 mt-1" /> Respectful engagement is required in all community interactions.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
