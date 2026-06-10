'use client'

import { SuccessPage } from '@/components/ui/SuccessPage'
import { CheckCircle2 } from 'lucide-react'

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen bg-zed-background flex items-center justify-center px-4">
      <SuccessPage
        icon={<CheckCircle2 size={64} className="text-zed-success" />}
        title="You're officially in the Arena."
        subtitle="Your profile is under review. We'll notify you by email once verified."
        primaryAction={{ label: 'Explore Competitions', href: '/dashboard/competitions' }}
        autoRedirect={{ to: '/dashboard', seconds: 4 }}
      >
        <p className="text-zed-foreground-secondary text-sm">
          While you wait, check out the active competitions and start preparing your pitch.
        </p>
      </SuccessPage>
    </div>
  )
}
