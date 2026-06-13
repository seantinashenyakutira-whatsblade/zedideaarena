'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { authService, getToken, clearToken } from '@/services/auth'
import { routes } from '@/lib/routes'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      window.location.href = routes.login
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const res: any = await authService.getProfile()
        const ok = res?.status === 'success' && Boolean(res?.data)

        if (cancelled) return
        if (!ok) throw new Error('Profile not available')

        const profile = res.data

        if (!profile.onboarding_complete && !pathname.startsWith('/onboarding')) {
          window.location.href = routes.onboarding
          return
        }

        setAuthorized(true)
      } catch (_) {
        if (cancelled) return
        clearToken()
        window.location.href = routes.login
      }
    })()

    return () => { cancelled = true }
  }, [pathname])

  if (!authorized) {
    return (
      <div className="min-h-screen bg-zed-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zed-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-zed-foreground">Authenticating...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
