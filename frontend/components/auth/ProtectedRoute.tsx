'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const res: any = await authService.getProfile()
        const ok = res?.status === 'success' && Boolean(res?.data)

        if (cancelled) return
        if (!ok) throw new Error('Profile not available')
        setAuthorized(true)
      } catch (_) {
        if (cancelled) return
        localStorage.removeItem('token')
        router.push('/auth/login')
      }
    })()

    return () => { cancelled = true }
  }, [router])

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
