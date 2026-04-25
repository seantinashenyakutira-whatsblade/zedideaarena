'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { StripePaymentForm } from '@/components/payment/StripePaymentForm'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import api from '@/lib/api'
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const type = searchParams.get('type') // 'contestant' or 'voter'
  const ideaId = searchParams.get('ideaId')
  const amount = searchParams.get('amount')

  useEffect(() => {
    const initPayment = async () => {
      try {
        const res = await api.post('/payment/create-payment-intent', {
          type,
          ideaId,
          amount
        })
        setClientSecret(res.clientSecret)
      } catch (err: any) {
        setError(err.message || 'Failed to initialize payment')
      } finally {
        setLoading(false)
      }
    }

    if (type && amount) {
      initPayment()
    } else {
      setError('Invalid payment request')
      setLoading(false)
    }
  }, [type, ideaId, amount])

  const handleSuccess = async (paymentIntent: any) => {
    // Backend should handle the logic via webhook, 
    // but we can also trigger a sync or just redirect
    router.push('/dashboard?payment=success')
  }

  return (
    <div className="container-zed py-12 max-w-xl">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-zed-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-zed-primary" />
        </div>
        <h1 className="text-3xl font-black text-zed-foreground mb-2">Secure Payment</h1>
        <p className="text-zed-foreground-secondary italic">
          Finalize your entry to the {type === 'contestant' ? 'Contestant' : 'Voter'} Arena
        </p>
      </div>

      <div className="card-zed border-white/10 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck size={120} />
        </div>

        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
          <span className="text-sm font-bold text-zed-foreground-secondary uppercase tracking-widest">Amount Due</span>
          <span className="text-3xl font-black text-zed-primary">${amount}.00</span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-zed-primary animate-spin" />
            <p className="text-sm text-zed-foreground-secondary font-bold">Initializing Secure Checkout...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold text-center">
            {error}
          </div>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm clientSecret={clientSecret} onSuccess={handleSuccess} />
          </Elements>
        )}

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
    <ProtectedRoute>
      <div className="flex h-screen bg-zed-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto bg-zed-background-alt">
            <Suspense fallback={<div>Loading...</div>}>
              <PaymentContent />
            </Suspense>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
