'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight, Vote } from 'lucide-react'

function VoteSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  const ideaTitle = searchParams.get('idea') || ''
  const competitionId = searchParams.get('competitionId') || ''
  const votesCount = parseInt(searchParams.get('count') || '0', 10)

  useEffect(() => {
    if (countdown <= 0) {
      if (competitionId) {
        router.replace(`/vote/${competitionId}`)
      } else {
        router.replace('/dashboard/voting')
      }
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, competitionId, router])

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-lg mx-auto p-12">
        <div className="w-24 h-24 bg-zed-success/20 rounded-full flex items-center justify-center mx-auto mb-8 floating">
          <CheckCircle2 size={64} className="text-zed-success drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
        </div>

        <h1 className="text-4xl font-black text-zed-foreground mb-4">Vote Recorded.</h1>
        <p className="text-zed-foreground-secondary text-lg mb-4">
          {ideaTitle ? `You voted for: ${ideaTitle}` : 'Your vote has been cast successfully.'}
        </p>
        <p className="text-zed-foreground-secondary text-sm mb-8">
          Come back when the competition closes to see the results.
        </p>

        {votesCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zed-primary/10 border border-zed-primary/20 text-zed-primary font-bold text-sm mb-8">
            <Vote size={16} />
            You've voted on {votesCount} {votesCount === 1 ? 'idea' : 'ideas'} so far
          </div>
        )}

        <p className="text-zed-foreground-secondary text-sm mb-8">
          Redirecting in {countdown}s...
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => competitionId ? router.push(`/vote/${competitionId}`) : router.push('/dashboard/voting')}
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-xs font-black shadow-xl"
          >
            Keep Voting <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VoteSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zed-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-zed-primary border-t-transparent rounded-full animate-spin" />
    </div>}>
      <VoteSuccessContent />
    </Suspense>
  )
}
