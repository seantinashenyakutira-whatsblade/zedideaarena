'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * TEMPORARY REDIRECT TO WAITLIST
 * 
 * From: July 1, 2026
 * To: July 15, 2026 (launch date)
 * 
 * Purpose: Convert homepage to waitlist landing page
 * while we review test data, documentation, functionality, and system.
 * 
 * NOTE: All other routes remain accessible:
 * - /auth/login, /auth/signup, /dashboard, /admin routes work normally
 * - Existing competitions, voting, and all features are active
 * - Only the public homepage (/) redirects to /waitlist
 * 
 * After July 15, 2026:
 * - Restore this file from the original page.tsx backup
 * - Or update the redirect condition
 */

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to waitlist page
    router.push('/waitlist')
  }, [router])

  // Show a brief loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-sm font-medium">Redirecting...</p>
      </div>
    </div>
  )
}
