'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { paymentService } from '@/services/payment'
import { Loader2, ShieldCheck, CreditCard, ArrowLeft } from 'lucide-react'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [processing, setProcessing] = useState(true)
  const [error, setError] = useState('')

  const type = searchParams.get('type')
  const competitionId = searchParams.get('competitionId')

  useEffect(() => {
    const initCheckout = async () => {
      if (!type || !competitionId) {
        setError('Invalid payment request')
        setProcessing(false)
        return
      }

      try {
        let res: any
        if (type === 'contestant') {
          res = await paymentService.enterCompetition(competitionId)
        } else if (type === 'voter') {
          res = await paymentService.registerVoter(competitionId)
        } else {
          setError('Invalid payment type')
          setProcessing(false)
          return
        }
        window.location.href = res.checkoutUrl
      } catch (err: any) {
        setError(err.message || 'Failed to initiate payment')
        setProcessing(false)
      }
    }

    initCheckout()
  }, [type, competitionId])

  return (
    <div className="container-zed py-12 max-w-xl">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-zed-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-zed-primary" />
        </div>
        <h1 className="text-3xl font-black text-zed-foreground mb-2">Secure Checkout</h1>
        <p className="text-zed-foreground-secondary italic">
          {type === 'contestant' ? 'Finalize your competition entry' : 'Complete voter registration'}
        </p>
      </div>

      <div className="card-zed border-white/10 p-8 relative overflow-hidden text-center">
        {processing ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-zed-primary animate-spin" />
            <p className="text-sm text-zed-foreground-secondary font-bold">Redirecting to Stripe Checkout...</p>
          </div>
        ) : error ? (
          <div>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold text-center mb-6">
              {error}
            </div>
            <button onClick={() => router.back()} className="btn-secondary py-3 px-8 rounded-xl text-xs font-black flex items-center gap-2 mx-auto">
              <ArrowLeft size={16} /> Go Back
            </button>
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-center gap-4 text-[10px] text-zed-foreground-secondary font-bold uppercase tracking-widest opacity-50">
          <div className="flex items-center gap-1"><ShieldCheck size={12} /> SSL Secure</div>
          <div className="flex items-center gap-1"><CreditCard size={12} /> PCI Compliant</div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  )
}
