'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Loader2, Check, X, Search, Clock, User, Banknote } from 'lucide-react'
import api from '@/lib/api'

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400' },
  approved: { label: 'Approved', color: 'bg-blue-500/20 text-blue-400' },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
  paid: { label: 'Paid', color: 'bg-green-500/20 text-green-400' },
}

const METHOD_LABELS: Record<string, string> = {
  paypal: 'PayPal',
  crypto: 'Crypto',
  bank: 'Bank Transfer',
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  useEffect(() => { fetchWithdrawals() }, [statusFilter])

  const fetchWithdrawals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res: any = await api.get(`/admin/withdrawals?${params}`)
      setWithdrawals(res.data || [])
      setTotal(res.total || 0)
    } catch (e) {
      console.error('Error fetching withdrawals:', e)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    try {
      await api.patch(`/admin/withdrawals/${id}/status`, { status })
      setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status, updated_at: new Date().toISOString() } : w))
    } catch (e) {
      console.error('Error updating withdrawal:', e)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = withdrawals.filter(w => {
    if (!search) return true
    const q = search.toLowerCase()
    return w.users?.full_name?.toLowerCase().includes(q) || w.users?.email?.toLowerCase().includes(q) || w.method?.toLowerCase().includes(q)
  })

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><DollarSign size={20} className="text-emerald-400" /> Withdrawals</h1>
          <p className="text-sm text-white/40 mt-0.5">Approve, reject, or mark payout requests as paid</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-56 bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50 placeholder-white/20"
          />
        </div>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>
        <span className="text-xs text-white/30">{filtered.length} request{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-white/30" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30 text-sm space-y-2">
          <Banknote size={32} className="mx-auto opacity-30" />
          <p>No withdrawal requests found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(w => (
            <div key={w.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGES[w.status]?.color || ''}`}>
                      {STATUS_BADGES[w.status]?.label || w.status}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/60 uppercase">
                      {METHOD_LABELS[w.method] || w.method}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">{formatCents(w.amount_cents)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/70">
                    <span className="flex items-center gap-1"><User size={11} /> {w.users?.full_name || 'Unknown'}</span>
                    <span className="text-white/30">{w.users?.email || ''}</span>
                  </div>
                  {w.method === 'paypal' && w.paypal_email && (
                    <p className="text-[11px] text-white/40 mt-0.5">PayPal: {w.paypal_email}</p>
                  )}
                  {w.method === 'crypto' && (
                    <p className="text-[11px] text-white/40 mt-0.5">Wallet: {w.crypto_wallet_address} ({w.crypto_network})</p>
                  )}
                  {w.method === 'bank' && (
                    <p className="text-[11px] text-white/40 mt-0.5">
                      {w.bank_account_name} &middot; {w.bank_name} &middot; {w.bank_account_number}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-white/30">
                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(w.created_at).toLocaleDateString()}</span>
                    {w.notes && <span>Notes: {w.notes}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {w.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(w.id, 'approved')}
                        disabled={updating === w.id}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all disabled:opacity-30"
                      >
                        {updating === w.id ? <Loader2 size={12} className="animate-spin" /> : 'Approve'}
                      </button>
                      <button
                        onClick={() => updateStatus(w.id, 'rejected')}
                        disabled={updating === w.id}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-30"
                      >
                        {updating === w.id ? <Loader2 size={12} className="animate-spin" /> : 'Reject'}
                      </button>
                    </>
                  )}
                  {w.status === 'approved' && (
                    <button
                      onClick={() => updateStatus(w.id, 'paid')}
                      disabled={updating === w.id}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-30"
                    >
                      {updating === w.id ? <Loader2 size={12} className="animate-spin" /> : 'Mark Paid'}
                    </button>
                  )}
                  {w.status === 'rejected' && (
                    <button
                      onClick={() => updateStatus(w.id, 'pending')}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/5 text-zinc-400 hover:bg-white/10 transition-all"
                    >
                      Reopen
                    </button>
                  )}
                  {w.status === 'paid' && (
                    <button
                      onClick={() => updateStatus(w.id, 'pending')}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/5 text-zinc-400 hover:bg-white/10 transition-all"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
