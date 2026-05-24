'use client'

import { Clock } from 'lucide-react'

interface VerificationBannerProps {
  status: string
  isVerified: boolean
}

export const VerificationBanner = ({ status, isVerified }: VerificationBannerProps) => {
  if (isVerified) return null

  if (status === 'pending' || status === 'review') {
    return (
      <div className="card-zed glass-premium border-yellow-500/40 mb-8 flex items-center justify-between animate-zed-fade-up">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-500">
            <Clock size={20} className="drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
          </div>
          <div>
            <h3 className="font-bold text-yellow-500 mb-0.5 text-sm">Account Pending Verification</h3>
            <p className="text-[10px] text-zed-foreground-secondary uppercase tracking-widest font-black">
              Your account is pending admin verification. You&apos;ll be notified by email once approved. Some features are restricted until then.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
