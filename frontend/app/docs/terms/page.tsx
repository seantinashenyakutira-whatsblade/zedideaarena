'use client'

import { ArrowLeft, BookOpen, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zed-background text-zed-foreground p-8 pb-24">
      <div className="max-w-4xl mx-auto animate-zed-fade-up">
        <Link href="/" className="inline-flex items-center gap-2 text-zed-foreground-secondary hover:text-zed-primary transition-colors mb-12 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-12">
          <img src="/logo-icon.png" alt="ZedIdeaArena" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
          <h1 className="text-5xl font-black gradient-text">Terms of Service</h1>
        </div>

        <div className="space-y-12">
          <section className="card-zed glass-premium p-8 border-white/5">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><BookOpen className="text-zed-primary" /> Agreement to Terms</h2>
            <p className="text-zed-foreground-secondary font-medium leading-relaxed">
              By accessing ZedIdeaArena, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.
            </p>
          </section>

          <section className="card-zed glass-premium p-8 border-white/5">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><AlertTriangle className="text-yellow-500" /> Intellectual Property</h2>
            <p className="text-zed-foreground-secondary font-medium leading-relaxed mb-4">
              You retain all rights to the ideas and content you submit. However, by submitting, you grant ZedIdeaArena a worldwide, non-exclusive license to display and promote your pitch within the context of the competition.
            </p>
            <p className="text-zed-foreground-secondary font-medium leading-relaxed">
              We are not responsible for the independent actions of third-party investors or voters who view your public pitch.
            </p>
          </section>

          <section className="card-zed glass-premium p-8 border-white/5">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><BookOpen className="text-zed-primary" /> Fees and Payments</h2>
            <p className="text-zed-foreground-secondary font-medium leading-relaxed">
              All entry fees (Contestant and Voter) are processed securely via Stripe. These fees are strictly non-refundable once your idea is published or your vote is cast.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
