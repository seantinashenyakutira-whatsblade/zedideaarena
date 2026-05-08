'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    // #region agent log
    fetch('http://127.0.0.1:7293/ingest/65e1436f-7699-44c3-bae9-afb4840cd4a5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'ce949e',
      },
      body: JSON.stringify({
        sessionId: 'ce949e',
        runId: 'pre-fix-guard',
        hypothesisId: 'H11',
        location: 'frontend/components/auth/ProtectedRoute.tsx:useEffect',
        message: 'ProtectedRoute token check',
        data: { hasToken: Boolean(token) },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    if (!token) {
      router.push('/auth/login')
    } else {
      setAuthorized(true)
    }
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
