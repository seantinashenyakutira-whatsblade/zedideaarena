'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, Trophy, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SubmitSuccessPage() {
  const { id } = useParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(`/dashboard/ideas/new?competitionId=${id}`)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [id, router])

  return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-lg mx-auto p-12">
              <div className="w-24 h-24 bg-zed-success/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={64} className="text-zed-success" />
              </div>
              <h1 className="text-4xl font-black text-zed-foreground mb-4">Payment Successful!</h1>
              <p className="text-zed-foreground-secondary text-lg mb-8">
                Your entry fee has been confirmed. You can now submit your idea to the competition.
              </p>
              <div className="flex flex-col items-center gap-6">
                <Link
                  href={`/dashboard/ideas/new?competitionId=${id}`}
                  className="btn-primary px-10 py-4 rounded-2xl flex items-center gap-3 text-sm font-black shadow-xl"
                >
                  Submit Your Idea <ArrowRight size={20} />
                </Link>
                <p className="text-xs text-zed-foreground-secondary font-bold">
                  Redirecting in {countdown} seconds...
                </p>
                <Loader2 size={20} className="text-zed-primary animate-spin" />
              </div>
            </div>
          </div>
  )
}
