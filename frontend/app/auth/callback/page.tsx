'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { routes } from '@/lib/routes'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        setError(error?.message || 'No session found')
        setTimeout(() => window.location.replace(routes.login), 2000)
        return
      }

      localStorage.setItem('token', session.access_token)

      try {
        const { data: { user } } = await supabase.auth.getUser()
        const payload = user?.user_metadata?.full_name
          ? { fullName: user.user_metadata.full_name }
          : {}
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        })
      } catch {
        // backend sync failure is non-blocking for OAuth
      }

      window.location.replace(routes.hub)
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen bg-zed-background flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <p className="text-red-500 font-bold">{error}</p>
            <p className="text-zed-foreground-secondary text-sm">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="animate-spin text-zed-primary mx-auto" size={32} />
            <p className="text-zed-foreground-secondary">Completing sign in...</p>
          </div>
        )}
      </div>
    </div>
  )
}
