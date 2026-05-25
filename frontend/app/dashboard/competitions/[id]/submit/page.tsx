'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import api from '@/lib/api'

export default function SubmitSuccessPage() {
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    const redirectToIdea = async () => {
      try {
        const res = await api.get('/ideas/user')
        const ideas = res.data || []
        const match = ideas.find((idea: any) => idea.competition_id === id)
        if (match?.id) {
          router.replace(`/dashboard/ideas/${match.id}`)
          return
        }
      } catch {}
      router.replace(`/dashboard/ideas/new?competitionId=${id}`)
    }
    const timer = setTimeout(redirectToIdea, 2000)
    return () => clearTimeout(timer)
  }, [id, router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-lg mx-auto p-12">
        <div className="w-24 h-24 bg-zed-success/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={64} className="text-zed-success" />
        </div>
        <h1 className="text-4xl font-black text-zed-foreground mb-4">Payment Successful!</h1>
        <p className="text-zed-foreground-secondary text-lg mb-8">
          Your entry fee has been confirmed. Redirecting to your idea...
        </p>
        <Loader2 size={24} className="text-zed-primary animate-spin mx-auto" />
      </div>
    </div>
  )
}
