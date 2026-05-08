'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
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
        location: 'frontend/app/auth/layout.tsx:useEffect',
        message: 'Auth layout token check',
        data: { hasToken: Boolean(token) },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  return <>{children}</>
}
