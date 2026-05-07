'use client'

import { ArrowLeft, Shield, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zed-background text-zed-foreground p-8 pb-24">
      <div className="max-w-4xl mx-auto animate-zed-fade-up">
        <Link href="/" className="inline-flex items-center gap-2 text-zed-foreground-secondary hover:text-zed-primary transition-colors mb-12 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-12">
          <img src="/logo-icon.png" alt="ZedIdeaArena" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
          <h1 className="text-5xl font-black gradient-text">Privacy Policy</h1>
        </div>

        <div className="space-y-12">
          <section className="card-zed glass-premium p-8 border-white/5">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Shield className="text-zed-success" /> Data Collection</h2>
            <p className="text-zed-foreground-secondary font-medium leading-relaxed mb-4">
              We collect information necessary to operate the Arena, including your Name, Email, and Identity documents (strictly for KYC purposes).
            </p>
            <p className="text-zed-foreground-secondary font-medium leading-relaxed">
              Your financial data is handled entirely by Stripe. We do not store your credit card numbers on our servers.
            </p>
          </section>

          <section className="card-zed glass-premium p-8 border-white/5">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><EyeOff className="text-zed-primary" /> Data Protection</h2>
            <p className="text-zed-foreground-secondary font-medium leading-relaxed">
              Your personal KYC documents are encrypted and are never exposed publicly. On the public idea pages, only your Full Name, Role, and explicitly provided social links are displayed.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
