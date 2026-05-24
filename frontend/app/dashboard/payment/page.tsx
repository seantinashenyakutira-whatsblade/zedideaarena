'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { paymentService } from '@/services/payment'
import { Loader2, ShieldCheck, CreditCard, ArrowLeft, Trophy, Calendar, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [competition, setCompetition] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const competitionId = searchParams.get('competition') || searchParams.get('competitionId')
  const type = searchParams.get('type')

  useEffect(() => {
    if (!competitionId || !type) {
      setError('No competition selected. Please choose a competition first.')
      setLoading(false)
      return
    }

    if (!['contestant', 'voter'].includes(type)) {
      setError('Invalid payment type.')
      setLoading(false)
      return
    }

    const fetchCompetition = async () => {
      try {
        const res: any = await api.get(`/competitions/${competitionId}`)
        setCompetition(res.data || res)
      } catch {
        setError('Competition not found. Please go back and try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchCompetition()
  }, [competitionId, type])

  const handlePayment = async () => {
    setProcessing(true)
    setError('')
    try {
      let res: any
      if (type === 'contestant') {
        res = await paymentService.enterCompetition(competitionId!)
      } else {
        res = await paymentService.registerVoter(competitionId!)
      }
      window.location.href = res.checkoutUrl
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container-zed py-12 max-w-xl mx-auto">
        <div className="flex justify-center py-20">
          <Loader2 size={40} className="animate-spin text-zed-primary" />
        </div>
      </div>
    )
  }

  if (error && !competition) {
    return (
      <div className="container-zed py-12 max-w-xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-zed-foreground mb-4">Checkout Unavailable</h1>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold text-center mb-6">
            {error}
          </div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => router.back()} className="btn-secondary py-3 px-8 rounded-xl text-xs font-black flex items-center gap-2">
              <ArrowLeft size={16} /> Go Back
            </button>
            <Link href="/dashboard/competitions" className="btn-primary py-3 px-8 rounded-xl text-xs font-black">
              Browse Competitions
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const feeCents = type === 'voter' ? competition?.voter_fee_cents : competition?.entry_fee_cents

  return (
    <div className="container-zed py-12 max-w-xl mx-auto">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-zed-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-zed-primary" />
        </div>
        <h1 className="text-3xl font-black text-zed-foreground mb-2">Secure Checkout</h1>
        <p className="text-zed-foreground-secondary italic">
          {type === 'contestant' ? 'Finalize your competition entry' : 'Complete voter registration'}
        </p>
      </div>

      {competition && (
        <div className="card-zed p-6 mb-6 border-zed-primary/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-zed-primary/20 flex items-center justify-center">
              <Trophy size={24} className="text-zed-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zed-foreground">{competition.title}</h3>
              <p className="text-xs text-zed-foreground-secondary flex items-center gap-1 mt-0.5">
                <Calendar size={12} /> Deadline: {new Date(competition.submission_deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-xs text-zed-foreground-secondary font-bold uppercase tracking-widest">
              {type === 'voter' ? 'Voter Registration Fee' : 'Contestant Entry Fee'}
            </span>
            <span className="text-2xl font-black text-zed-primary">
              ${((feeCents || 0) / 100).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="card-zed border-white/10 p-8 relative overflow-hidden text-center">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold text-center mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={processing}
          className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black shadow-xl disabled:opacity-50"
        >
          {processing ? (
            <><Loader2 size={20} className="animate-spin" /> Processing...</>
          ) : (
            <><CreditCard size={20} /> Pay ${((feeCents || 0) / 100).toFixed(2)} with Card</>
          )}
        </button>

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
    <Suspense fallback={<div className="container-zed py-12 max-w-xl mx-auto"><div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-zed-primary" /></div></div>}>
      <PaymentContent />
    </Suspense>
  )
}
