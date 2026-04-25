'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { ShieldCheck, Lock } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="flex h-screen bg-zed-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-8 bg-zed-background-alt">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-zed-primary/10 rounded-2xl text-zed-primary">
                  <Lock size={32} />
                </div>
                <h1 className="text-4xl font-black text-zed-foreground">Privacy Policy</h1>
              </div>
              <p className="text-sm text-zed-foreground-secondary font-bold uppercase tracking-widest">
                Your data security is our top priority.
              </p>
            </div>

            <div className="card-zed p-10 border-white/5 bg-white/5 space-y-12">
              <section>
                <h2 className="text-2xl font-black text-zed-foreground mb-4">Information We Collect</h2>
                <p className="text-zed-foreground-secondary leading-relaxed">
                  We collect information you provide directly to us, such as when you create an account, submit an idea, or participate in a competition. This includes your name, email address, and identity verification data (processed via Didit.me).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-zed-foreground mb-4">How We Use Your Information</h2>
                <p className="text-zed-foreground-secondary leading-relaxed">
                  We use the information we collect to operate, maintain, and provide the features of the ZedIdeaArena. We do not sell your personal data to third parties.
                </p>
              </section>

              <div className="p-8 bg-zed-success/5 rounded-3xl border border-zed-success/10 flex items-start gap-6">
                <ShieldCheck size={32} className="text-zed-success" />
                <div>
                  <h4 className="text-lg font-black text-zed-foreground mb-2">GDPR & Data Protection</h4>
                  <p className="text-sm text-zed-foreground-secondary italic">
                    We comply with international data protection standards. You have the right to request access to, correction of, or deletion of your personal data at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
