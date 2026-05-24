'use client'

import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { VerificationBanner } from '@/components/dashboard/KycBanner'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (loading) return
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    if (!profile) {
      router.push('/auth/login')
      return
    }
    if (!profile.onboarding_complete) {
      router.push('/onboarding/personal')
      return
    }
    setAuthorized(true)
  }, [loading, profile, router])

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
