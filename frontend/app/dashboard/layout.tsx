'use client'

import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { VerificationBanner } from '@/components/dashboard/KycBanner'
import { useEffect, useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (loading) return
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.replace('/auth/login')
      return
    }
    if (!profile) {
      window.location.replace('/auth/login')
      return
    }
    if (!profile.onboarding_complete && !profile.onboarding_skipped) {
      window.location.replace('/onboarding/personal')
      return
    }
    setAuthorized(true)
  }, [loading, profile])

  if (!authorized) {
    return (
      <div className="min-h-screen bg-zed-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zed-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-zed-foreground">Loading Arena...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zed-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="container-zed py-8">
            <VerificationBanner
              status={profile?.is_verified ? 'verified' : 'pending'}
              isVerified={profile?.is_verified}
            />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
