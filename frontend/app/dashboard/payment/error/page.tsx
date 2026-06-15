'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { XCircle, ArrowRight, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

function PaymentErrorContent() {
  const searchParams = useSearchParams()
  const [reason, setReason] = useState('')

  const competitionId = searchParams.get('competitionId')
  const type = searchParams.get('type')
  const errorReason = searchParams.get('reason')

  useEffect(() => {
    if (errorReason === 'cancelled') {
      setReason('Payment was cancelled.')
    } else if (errorReason === 'failed') {
      setReason('Payment processing failed.')
    } else {
      setReason('An unexpected error occurred during payment.')
    }
  }, [errorReason])

  const retryHref = type === 'voter'
    ? `/dashboard/payment?competition=${competitionId}&type=voter`
    : `/dashboard/payment?type=contestant&competitionId=${competitionId}`

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-lg mx-auto p-12">
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <XCircle size={64} className="text-red-500" />
        </div>
        <h1 className="text-4xl font-black text-zed-foreground mb-4">Payment Error</h1>
        <p className="text-zed-foreground-secondary text-lg mb-8">{reason}</p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href={retryHref}
            className="btn-primary px-8 py-4 rounded-xl text-xs font-black inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Try Again
          </Link>
          <Link
            href="/dashboard"
            className="btn-secondary px-8 py-4 rounded-xl text-xs font-black inline-flex items-center gap-2"
          >
            <Home size={16} /> Dashboard
          </Link>
        </div>
        <p className="text-xs text-zed-foreground-secondary mt-8">
          If the amount was deducted but you&apos;re seeing this page, please contact support.
        </p>
      </div>
    </div>
  )
}

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><span className="text-zed-foreground-secondary">Loading...</span></div>}>
      <PaymentErrorContent />
    </Suspense>
  )
}
