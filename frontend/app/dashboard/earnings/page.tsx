'use client'

import { useState, useEffect } from 'react'
import { Wallet, DollarSign, Clock, CheckCircle2, XCircle, Loader2, Copy, ChevronRight, AlertTriangle, Landmark, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

type WithdrawalMethod = 'paypal' | 'crypto' | 'bank' | null

interface Withdrawal {
  id: string
  amount_cents: number
  method: string
  status: string
  created_at: string
  notes?: string
}

interface FormData {
  paypal_email: string
  crypto_wallet_address: string
  crypto_network: string
  bank_account_name: string
  bank_account_number: string
  bank_name: string
  bank_swift_code: string
  bank_country: string
  amount_cents: number
}

const initialForm: FormData = {
  paypal_email: '',
  crypto_wallet_address: '',
  crypto_network: 'BTC',
  bank_account_name: '',
  bank_account_number: '',
  bank_name: '',
  bank_swift_code: '',
  bank_country: '',
  amount_cents: 1000,
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  approved: { label: 'Approved', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  paid: { label: 'Paid', color: 'text-zed-success', bg: 'bg-zed-success/10 border-zed-success/20' },
  rejected: { label: 'Rejected', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
}

export default function EarningsPage() {
  const { profile } = useAuth()
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod>(null)
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [view, setView] = useState<'overview' | 'withdraw' | 'history'>('overview')

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const res: any = await api.get('/withdrawals')
        setWithdrawals(res.data || [])
      } catch { /* silent */ }
      setLoadingHistory(false)
    }
    fetchWithdrawals()
  }, [])

  const pendingTotal = withdrawals
    .filter((w) => w.status === 'pending' || w.status === 'approved')
    .reduce((sum, w) => sum + w.amount_cents, 0)

  const methodCards = [
    {
      id: 'paypal' as const,
      title: 'PayPal',
      subtitle: 'Fast \u2022 1-2 business days',
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 text-2xl font-black shadow-lg shadow-blue-500/10">
          P
        </div>
      ),
      borderColor: 'border-blue-500/30',
      glow: 'shadow-blue-500/10',
    },
    {
      id: 'crypto' as const,
      title: 'Cryptocurrency',
      subtitle: 'BTC \u2022 ETH \u2022 USDT \u2022 Same day',
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 text-2xl font-black shadow-lg shadow-orange-500/10">
          B
        </div>
      ),
      borderColor: 'border-orange-500/30',
      glow: 'shadow-orange-500/10',
    },
    {
      id: 'bank' as const,
      title: 'Bank Transfer',
      subtitle: 'Direct to your account \u2022 3-5 business days',
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 shadow-lg shadow-green-500/10">
          <Landmark size={28} />
        </div>
      ),
      borderColor: 'border-green-500/30',
      glow: 'shadow-green-500/10',
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.amount_cents < 1000) {
      toast.error('Minimum withdrawal is $10.00')
      return
    }

    setSubmitting(true)
    try {
      const payload: any = {
        amount_cents: form.amount_cents,
        method: selectedMethod,
      }

      if (selectedMethod === 'paypal') {
        payload.paypal_email = form.paypal_email
      } else if (selectedMethod === 'crypto') {
        payload.crypto_wallet_address = form.crypto_wallet_address
        payload.crypto_network = form.crypto_network
      } else if (selectedMethod === 'bank') {
        payload.bank_account_name = form.bank_account_name
        payload.bank_account_number = form.bank_account_number
        payload.bank_name = form.bank_name
        payload.bank_swift_code = form.bank_swift_code
        payload.bank_country = form.bank_country
      }

      const res: any = await api.post('/withdrawals', payload)
      toast.success('Withdrawal request submitted. Our team will process it within 3-5 business days.')
      setWithdrawals((prev) => [res.data, ...prev])
      setSelectedMethod(null)
      setForm(initialForm)
      setView('history')
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit withdrawal request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-zed-foreground mb-2">Earnings</h1>
        <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest">Manage your rewards and withdrawals</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="card-zed p-6 border-white/5 bg-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-zed-primary/20 flex items-center justify-center text-zed-primary">
              <Wallet size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Available Balance</span>
          </div>
          <p className="text-3xl font-black text-zed-foreground">$0.00</p>
          <p className="text-[10px] text-zed-foreground-secondary mt-1">Coming soon</p>
        </div>
        <div className="card-zed p-6 border-white/5 bg-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-zed-success/20 flex items-center justify-center text-zed-success">
              <DollarSign size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Total Earned</span>
          </div>
          <p className="text-3xl font-black text-zed-foreground">$0.00</p>
          <p className="text-[10px] text-zed-foreground-secondary mt-1">Coming soon</p>
        </div>
        <div className="card-zed p-6 border-white/5 bg-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Pending Withdrawal</span>
          </div>
          <p className="text-3xl font-black text-zed-foreground">${(pendingTotal / 100).toFixed(2)}</p>
          <p className="text-[10px] text-zed-foreground-secondary mt-1">{withdrawals.filter(w => w.status === 'pending').length} pending requests</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setView('withdraw')}
          disabled
          className="btn-primary px-8 py-4 rounded-2xl text-xs font-black flex items-center gap-2 opacity-50 cursor-not-allowed"
          title="You have no available balance yet"
        >
          <Wallet size={18} /> Withdraw Funds
        </button>
        <button
          onClick={() => setView(view === 'history' ? 'overview' : 'history')}
          className={`btn-secondary px-6 py-4 rounded-2xl text-xs font-black flex items-center gap-2 ${view === 'history' ? 'bg-zed-primary/20 text-zed-primary border-zed-primary/30' : ''}`}
        >
          <Clock size={18} /> {view === 'history' ? 'Hide History' : 'Withdrawal History'}
        </button>
      </div>

      {view === 'history' && (
        <div className="card-zed overflow-hidden border-white/5 mb-10">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-black uppercase tracking-widest">Withdrawal History</h3>
          </div>
          {loadingHistory ? (
            <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin opacity-30" /></div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-16">
              <Wallet size={48} className="mx-auto mb-4 text-zed-foreground-secondary opacity-20" />
              <p className="text-zed-foreground-secondary text-sm">No withdrawal requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 text-left text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">
                    <th className="p-4">Date</th>
                    <th className="p-4">Method</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawals.map((w) => {
                    const cfg = statusConfig[w.status] || statusConfig.pending
                    return (
                      <tr key={w.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-xs text-zed-foreground-secondary">{new Date(w.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-xs font-bold capitalize text-zed-foreground">{w.method}</td>
                        <td className="p-4 text-right text-sm font-black text-zed-foreground">${(w.amount_cents / 100).toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          {w.status === 'rejected' && w.notes && (
                            <p className="text-[10px] text-red-400 mt-1">{w.notes}</p>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === 'withdraw' && (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {methodCards.map((card) => {
              const isSelected = selectedMethod === card.id
              return (
                <button
                  key={card.id}
                  onClick={() => setSelectedMethod(isSelected ? null : card.id)}
                  className={`card-zed p-6 text-left transition-all duration-300 ${
                    isSelected
                      ? `${card.borderColor} ${card.glow} shadow-lg bg-white/[0.07]`
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {card.icon}
                    <div>
                      <h3 className="font-black text-zed-foreground text-lg">{card.title}</h3>
                      <p className="text-[10px] text-zed-foreground-secondary font-bold uppercase tracking-widest">{card.subtitle}</p>
                    </div>
                  </div>
                  <div className={`w-full h-0.5 rounded-full transition-all duration-300 ${isSelected ? card.borderColor : 'bg-white/5'}`} />
                </button>
              )
            })}
          </div>

          {selectedMethod && (
            <form onSubmit={handleSubmit} className="card-zed p-8 border-white/5 animate-zed-fade-up">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-zed-foreground">
                  {selectedMethod === 'paypal' ? 'PayPal Withdrawal' : selectedMethod === 'crypto' ? 'Crypto Withdrawal' : 'Bank Transfer'}
                </h3>
                <button type="button" onClick={() => setSelectedMethod(null)} className="text-xs text-zed-foreground-secondary hover:text-zed-foreground font-black uppercase tracking-widest">
                  Cancel
                </button>
              </div>

              <div className="space-y-6 max-w-lg">
                {selectedMethod === 'paypal' && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">PayPal Email</label>
                    <input
                      type="email"
                      className="input-zed"
                      value={form.paypal_email}
                      onChange={(e) => setForm({ ...form, paypal_email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                )}

                {selectedMethod === 'crypto' && (
                  <>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Network</label>
                      <select
                        className="input-zed"
                        value={form.crypto_network}
                        onChange={(e) => setForm({ ...form, crypto_network: e.target.value })}
                      >
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="USDT-TRC20">USDT (TRC-20 / Tron)</option>
                        <option value="USDT-ERC20">USDT (ERC-20 / Ethereum)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Wallet Address</label>
                      <input
                        type="text"
                        className="input-zed font-mono text-xs"
                        value={form.crypto_wallet_address}
                        onChange={(e) => setForm({ ...form, crypto_wallet_address: e.target.value })}
                        placeholder="0x... or bc1..."
                        required
                      />
                    </div>
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[11px] text-orange-400 font-bold flex items-start gap-3">
                      <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                      <span>Double-check your wallet address. Crypto transfers cannot be reversed.</span>
                    </div>
                  </>
                )}

                {selectedMethod === 'bank' && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Account Holder Name</label>
                        <input
                          type="text"
                          className="input-zed"
                          value={form.bank_account_name}
                          onChange={(e) => setForm({ ...form, bank_account_name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Bank Name</label>
                        <input
                          type="text"
                          className="input-zed"
                          value={form.bank_name}
                          onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                          placeholder="Bank of Zambia"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Account Number</label>
                        <input
                          type="text"
                          className="input-zed"
                          value={form.bank_account_number}
                          onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
                          placeholder="1234567890"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">SWIFT / BIC Code</label>
                        <input
                          type="text"
                          className="input-zed"
                          value={form.bank_swift_code}
                          onChange={(e) => setForm({ ...form, bank_swift_code: e.target.value })}
                          placeholder="ZMBXXXXX"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Country</label>
                      <select
                        className="input-zed"
                        value={form.bank_country}
                        onChange={(e) => setForm({ ...form, bank_country: e.target.value })}
                      >
                        <option value="">Select country</option>
                        <option value="Zambia">Zambia</option>
                        <option value="Zimbabwe">Zimbabwe</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Amount to Withdraw (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zed-foreground-secondary font-black text-lg">$</span>
                    <input
                      type="number"
                      className="input-zed pl-8 text-lg font-black"
                      value={form.amount_cents / 100}
                      onChange={(e) => setForm({ ...form, amount_cents: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                      min={10}
                      step={0.01}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-zed-foreground-secondary mt-1">Minimum withdrawal: $10.00</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? (
                    <><Loader2 size={20} className="animate-spin" /> Processing...</>
                  ) : (
                    <><Wallet size={20} /> Submit Withdrawal Request</>
                  )}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
}
