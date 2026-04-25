'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { FileText, ShieldCheck } from 'lucide-react'

export default function TermsPage() {
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
                  <FileText size={32} />
                </div>
                <h1 className="text-4xl font-black text-zed-foreground">Terms of Service</h1>
              </div>
              <p className="text-sm text-zed-foreground-secondary font-bold uppercase tracking-widest">
                Last Updated: April 25, 2026
              </p>
            </div>

            <div className="card-zed p-10 border-white/5 bg-white/5 prose prose-invert max-w-none">
              <h2 className="text-2xl font-black text-zed-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-zed-foreground-secondary mb-8">
                By accessing or using ZedIdeaArena, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you do not have permission to use the platform.
              </p>

              <h2 className="text-2xl font-black text-zed-foreground mb-4">2. Description of Service</h2>
              <p className="text-zed-foreground-secondary mb-8">
                ZedIdeaArena provides a platform for innovators to pitch ideas and for community members to vote on them. We facilitate competitions and funding opportunities.
              </p>

              <h2 className="text-2xl font-black text-zed-foreground mb-4">3. User Responsibilities</h2>
              <p className="text-zed-foreground-secondary mb-8">
                You are responsible for maintaining the confidentiality of your account and password. You agree to provide accurate and complete information during registration.
              </p>

              <div className="p-6 bg-zed-primary/10 rounded-2xl border border-zed-primary/20 flex items-start gap-4">
                <ShieldCheck size={24} className="text-zed-primary flex-shrink-0" />
                <p className="text-xs text-zed-foreground-secondary italic">
                  We reserve the right to suspend or terminate accounts that violate these terms or participate in fraudulent activity.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
