'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, Trophy, Vote, ArrowRight, XCircle } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const { refreshProfile } = useAuth()
  const [status, setStatus] = useState<'verifying' | 'verified' | 'error'>('verifying')
  const [countdown, setCountdown] = useState(5)
  const [payment, setPayment] = useState<any>(null)

  const sessionId = searchParams.get('session_id')
  const competitionId = searchParams.get('competitionId')
  const type = searchParams.get('type')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    const verifyWithRetry = async (maxAttempts = 10) => {
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const params = new URLSearchParams({ session_id: sessionId })
          if (competitionId) params.append('competition_id', competitionId)
          if (type) params.append('type', type)

          const res: any = await api.get(`/payments/verify?${params}`)
          if (res.verified) {
            setPayment(res.payment)
            setStatus('verified')
            refreshProfile()
            return
          }
        } catch { /* retry */ }

        if (i < maxAttempts - 1) {
          await new Promise(r => setTimeout(r, 2000))
        }
      }
      setStatus('error')
    }
    verifyWithRetry()
  }, [sessionId, competitionId, type])

  useEffect(() => {
    if (status !== 'verified') return

    if (countdown <= 0) {
      const target = type === 'voter'
        ? `/vote/${competitionId}`
        : `/dashboard/ideas/new?competitionId=${competitionId}`
      window.location.replace(target)
      return
    }

    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [status, countdown, type, competitionId])

  if (status === 'verifying') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-lg mx-auto p-12">
          <div className="w-24 h-24 bg-zed-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Loader2 size={64} className="text-zed-primary animate-spin" />
          </div>
          <h1 className="text-4xl font-black text-zed-foreground mb-4">Verifying Payment...</h1>
          <p className="text-zed-foreground-secondary text-lg">Please wait while we confirm your transaction.</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-lg mx-auto p-12">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle size={64} className="text-red-500" />
          </div>
          <h1 className="text-4xl font-black text-zed-foreground mb-4">Payment Not Found</h1>
          <p className="text-zed-foreground-secondary text-lg mb-8">
            We couldn&apos;t verify your payment. It may still be processing. Please check your payment history or contact support.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard/payment" className="btn-secondary px-8 py-4 rounded-xl text-xs font-black">
              Try Again
            </Link>
            <Link href="/dashboard/voter" className="btn-primary px-8 py-4 rounded-xl text-xs font-black flex items-center gap-2">
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const targetLabel = type === 'voter' ? 'Voting Arena' : 'Your Idea'
  const targetHref = type === 'voter'
    ? `/vote/${competitionId}`
    : `/dashboard/ideas/new?competitionId=${competitionId}`

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-lg mx-auto p-12">
        <div className="w-24 h-24 bg-zed-success/20 rounded-full flex items-center justify-center mx-auto mb-8">
          {type === 'voter' ? (
            <Vote size={64} className="text-zed-success" />
          ) : (
            <Trophy size={64} className="text-zed-success" />
          )}
        </div>
        <h1 className="text-4xl font-black text-zed-foreground mb-4">Payment Successful!</h1>
        <p className="text-zed-foreground-secondary text-lg mb-4">
          {type === 'voter'
            ? 'You are now registered to vote in this competition.'
            : 'Your entry fee has been confirmed.'}
        </p>
        {payment?.amount_cents && (
          <p className="text-2xl font-black text-zed-primary mb-8">
            ${(payment.amount_cents / 100).toFixed(2)}
          </p>
        )}
        <p className="text-zed-foreground-secondary text-sm mb-8">
          Redirecting to {targetLabel} in {countdown}s...
        </p>
        <Link
          href={targetHref}
          className="btn-primary px-8 py-4 rounded-xl text-xs font-black inline-flex items-center gap-2"
        >
          Go to {targetLabel} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={48} className="animate-spin text-zed-primary" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
