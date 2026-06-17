'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, Trophy, Vote, ArrowRight, XCircle, ShieldCheck, Database, ExternalLink, Smartphone } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refreshProfile } = useAuth()
  const [status, setStatus] = useState<'verifying' | 'verified' | 'error'>('verifying')
  const [countdown, setCountdown] = useState(5)
  const [payment, setPayment] = useState<any>(null)
  const [syncStatus, setSyncStatus] = useState({ gateway: false, database: false })

  const sessionId = searchParams.get('session_id')
  const transactionRef = searchParams.get('transaction_ref')
  const competitionId = searchParams.get('competitionId')
  const ideaId = searchParams.get('ideaId')
  const type = searchParams.get('type')
  const network = searchParams.get('network') || 'stripe'

  const isDpo = network === 'dpo' || !!transactionRef

  useEffect(() => {
    if (!sessionId && !transactionRef) {
      setStatus('error')
      return
    }

    const verifyWithRetry = async (maxAttempts = 10) => {
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const params = new URLSearchParams()
          if (sessionId) params.append('session_id', sessionId)
          if (transactionRef) params.append('transaction_ref', transactionRef)
          if (competitionId) params.append('competition_id', competitionId)
          if (type) params.append('type', type)

          const res: any = await api.get(`/payments/verify?${params}`)
          if (res.verified) {
            setPayment(res.payment)
            setSyncStatus({ gateway: true, database: !!res.payment?.id || !res.pendingDb })
            setStatus('verified')
            await refreshProfile()
            toast.success(type === 'voter' ? 'Voter registration confirmed!' : 'Entry fee payment confirmed!', { duration: 5000 })
            return
          }
          if (res.gateway_status === 'paid') {
            setSyncStatus(prev => ({ ...prev, gateway: true }))
          }
        } catch { /* retry */ }

        if (i < maxAttempts - 1) {
          await new Promise(r => setTimeout(r, 2000))
        }
      }
      setStatus('error')
      toast.error('Payment verification timed out. Please check your payment history.')
    }
    verifyWithRetry()
  }, [sessionId, transactionRef, competitionId, type])

  useEffect(() => {
    if (status !== 'verified') return

    if (countdown <= 0) {
      const target = type === 'voter'
        ? `/vote/${competitionId}`
        : ideaId
        ? `/dashboard/ideas/${ideaId}`
        : `/dashboard`
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
          <p className="text-zed-foreground-secondary text-lg mb-8">Please wait while we confirm your transaction.</p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 rounded-full border-2 border-zed-primary border-t-transparent animate-spin" />
              <span className="text-zed-foreground-secondary">
                Confirming with {isDpo ? 'DPO Pay' : 'Stripe'}...
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    const errorHref = competitionId
      ? `/dashboard/payment/error?type=${type}&competitionId=${competitionId}&reason=failed`
      : '/dashboard/payment/error?reason=failed'
    router.replace(errorHref)
    return null
  }

  const gatewayLabel = isDpo ? 'DPO Pay' : 'Stripe'
  const targetLabel = type === 'voter' ? 'Voting Arena' : ideaId ? 'Your Idea' : 'Dashboard'
  const targetHref = type === 'voter'
    ? `/vote/${competitionId}`
    : ideaId
    ? `/dashboard/ideas/${ideaId}`
    : `/dashboard`

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

        <div className="flex flex-col gap-3 mb-8 max-w-xs mx-auto">
          <div className="flex items-center gap-3 text-sm bg-white/5 rounded-xl px-4 py-3">
            {isDpo ? (
              <Smartphone size={18} className={syncStatus.gateway ? 'text-zed-success' : 'text-zed-foreground-secondary'} />
            ) : (
              <ShieldCheck size={18} className={syncStatus.gateway ? 'text-zed-success' : 'text-zed-foreground-secondary'} />
            )}
            <span className={syncStatus.gateway ? 'text-zed-success font-bold' : 'text-zed-foreground-secondary'}>
              {syncStatus.gateway ? `Confirmed by ${gatewayLabel}` : `Waiting for ${gatewayLabel}...`}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm bg-white/5 rounded-xl px-4 py-3">
            <Database size={18} className={syncStatus.database ? 'text-zed-success' : 'text-zed-foreground-secondary'} />
            <span className={syncStatus.database ? 'text-zed-success font-bold' : 'text-zed-foreground-secondary'}>
              {syncStatus.database ? 'Saved to Database' : 'Saving...'}
            </span>
          </div>
        </div>

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
