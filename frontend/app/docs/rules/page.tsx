'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Gavel, CheckCircle2, ShieldAlert } from 'lucide-react'

export default function RulesPage() {
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
                  <Gavel size={32} />
                </div>
                <h1 className="text-4xl font-black text-zed-foreground">Arena Rules</h1>
              </div>
              <p className="text-lg text-zed-foreground-secondary font-medium">
                The rules of the ZedIdeaArena ensure a fair, transparent, and competitive environment for all participants.
              </p>
            </div>

            <div className="space-y-8">
              <section className="card-zed p-8 border-white/5">
                <h3 className="text-xl font-black text-zed-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-zed-success" size={20} /> 1. Eligibility
                </h3>
                <ul className="space-y-3 text-zed-foreground-secondary text-sm">
                  <li>• Participants must be at least 18 years of age.</li>
                  <li>• One account per individual. Multiple accounts will lead to immediate disqualification.</li>
                  <li>• Ideas must be original. Plagiarism is strictly prohibited.</li>
                </ul>
              </section>

              <section className="card-zed p-8 border-white/5">
                <h3 className="text-xl font-black text-zed-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-zed-success" size={20} /> 2. Submission Standards
                </h3>
                <ul className="space-y-3 text-zed-foreground-secondary text-sm">
                  <li>• All submissions must include a clear problem statement and solution.</li>
                  <li>• Pitch videos must follow the [Video Guidelines](/docs/video-guidelines).</li>
                  <li>• Information provided must be accurate and verifiable.</li>
                </ul>
              </section>

              <section className="card-zed p-8 border-white/5 bg-red-500/5 border-red-500/10">
                <h3 className="text-xl font-black text-red-400 mb-4 flex items-center gap-2">
                  <ShieldAlert size={20} /> 3. Prohibited Conduct
                </h3>
                <ul className="space-y-3 text-zed-foreground-secondary text-sm">
                  <li>• Vote manipulation or use of bots.</li>
                  <li>• Harassment of other community members.</li>
                  <li>• Submitting offensive or inappropriate content.</li>
                </ul>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
