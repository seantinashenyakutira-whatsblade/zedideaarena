'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { paymentService } from '@/services/payment'
import { Loader2, ShieldCheck, CreditCard, Smartphone, ArrowLeft, ArrowRight, Trophy, Calendar, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { toast } from 'sonner'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [competition, setCompetition] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsIdea, setNeedsIdea] = useState(false)
  const [methodGroups, setMethodGroups] = useState<any[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState('card')
  const [expandedGroup, setExpandedGroup] = useState<string>('cards')

  const competitionId = searchParams.get('competition') || searchParams.get('competitionId')
  const type = searchParams.get('type')
  const ideaId = searchParams.get('ideaId')

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

    const fetchData = async () => {
      try {
        const [compRes, methodsRes] = await Promise.all([
          api.get(`/competitions/${competitionId}`),
          api.get('/payments/methods'),
        ])
        setCompetition(compRes.data || compRes)
        setMethodGroups(methodsRes.data || [])
      } catch {
        setError('Failed to load payment information. Please go back and try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [competitionId, type])

  const handlePayment = async () => {
    setProcessing(true)
    setError('')
    try {
      let res: any
      if (type === 'contestant') {
        res = await paymentService.enterCompetition(competitionId!, ideaId || undefined, selectedNetwork)
      } else {
        res = await paymentService.registerVoter(competitionId!, selectedNetwork)
      }
      toast.success('Redirecting to secure checkout...')
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl
      } else {
        setError('No checkout URL returned')
        setProcessing(false)
      }
    } catch (err: any) {
      if (err.message?.includes('create an idea')) {
        setNeedsIdea(true)
      } else {
        const errMsg = err.message || 'Failed to initiate payment'
        setError(errMsg)
        toast.error(errMsg)
      }
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

      {methodGroups.length > 0 && (
        <div className="card-zed p-6 mb-6">
          <h3 className="font-black text-sm text-zed-foreground mb-4 uppercase tracking-widest">
            Select Payment Method
          </h3>
          <div className="space-y-3">
            {methodGroups.map((group) => (
              <div key={group.id}>
                <button
                  type="button"
                  onClick={() => setExpandedGroup(expandedGroup === group.id ? '' : group.id)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold text-zed-foreground-secondary uppercase tracking-widest"
                >
                  {group.name}
                  {expandedGroup === group.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expandedGroup === group.id && (
                  <div className="space-y-2 mt-1">
                    {group.methods.map((method: any) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedNetwork === method.id
                            ? 'bg-zed-primary/10 border border-zed-primary/30'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedNetwork === method.id}
                          onChange={() => setSelectedNetwork(method.id)}
                          className="accent-[#4F46E5]"
                        />
                        <div className="w-8 h-8 rounded-lg bg-zed-primary/20 flex items-center justify-center">
                          {method.icon === 'CreditCard' ? (
                            <CreditCard size={16} className="text-zed-primary" />
                          ) : (
                            <Smartphone size={16} className="text-zed-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-bold text-zed-foreground">{method.name}</span>
                          <span className="text-[10px] text-zed-foreground-secondary ml-2 uppercase">
                            via {method.provider === 'stripe' ? 'Stripe' : 'DPO Pay'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-zed border-white/10 p-8 relative overflow-hidden text-center">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold text-center mb-6">
            {error}
          </div>
        )}

        {needsIdea ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-yellow-500" />
            </div>
            <h3 className="text-xl font-black">Idea Required First</h3>
            <p className="text-zed-foreground-secondary text-sm">
              You need to create an idea for this competition before making a payment.
            </p>
            <Link
              href={`/dashboard/ideas/new?competitionId=${competitionId}`}
              className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black"
            >
              Create Your Idea <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <>
            <button
              onClick={handlePayment}
              disabled={processing}
              className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black shadow-xl disabled:opacity-50"
            >
              {processing ? (
                <><Loader2 size={20} className="animate-spin" /> Processing...</>
              ) : (
                <><CreditCard size={20} /> Pay ${((feeCents || 0) / 100).toFixed(2)} Now</>
              )}
            </button>

            <div className="mt-4 text-[11px] text-zed-foreground-secondary">
              {selectedNetwork === 'card' ? (
                <span>Secured by <strong>Stripe</strong></span>
              ) : (
                <span>Processed by <strong>DPO Pay</strong></span>
              )}
            </div>
          </>
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
    <Suspense fallback={<div className="container-zed py-12 max-w-xl mx-auto"><div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-zed-primary" /></div></div>}>
      <PaymentContent />
    </Suspense>
  )
}
