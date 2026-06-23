'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle, Loader2, CreditCard, Search, Download, RotateCcw, DollarSign, Users, TrendingUp, ArrowLeft, ArrowRight, X } from 'lucide-react'
import { adminService } from '@/services/core'
import api from '@/lib/api'
import Link from 'next/link'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-500/10' },
  completed: { label: 'Completed', color: 'text-green-400 bg-green-500/10' },
  succeeded: { label: 'Succeeded', color: 'text-green-400 bg-green-500/10' },
  failed: { label: 'Failed', color: 'text-red-400 bg-red-500/10' },
  canceled: { label: 'Canceled', color: 'text-gray-400 bg-gray-500/10' },
  cancelled: { label: 'Cancelled', color: 'text-gray-400 bg-gray-500/10' },
  expired: { label: 'Expired', color: 'text-orange-400 bg-orange-500/10' },
  refunded: { label: 'Refunded', color: 'text-purple-400 bg-purple-500/10' },
}

const TYPE_LABELS: Record<string, string> = {
  contestant: 'Entry Fee',
  voter: 'Vote',
}

export default function AdminPayments() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<{ status?: string; type?: string; provider?: string; search?: string }>({})
  const [page, setPage] = useState(1)
  const [refunding, setRefunding] = useState<string | null>(null)
  const limit = 30

  const fetchPayments = useCallback(async () => {
    try {
      const res = await adminService.getPayments({ ...filters, page, limit })
      setPayments(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      console.error('Failed to fetch payments:', err)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    if (!profile?.is_admin && profile?.role !== 'admin') return
    fetchPayments()
  }, [fetchPayments, profile])

  const handleRefund = async (payment: any) => {
    if (!confirm(`Refund ${((payment.amount_cents || 0) / 100).toFixed(2)} USD from ${payment.users?.full_name || payment.user_id}?`)) return

    setRefunding(payment.id)
    try {
      const res = await adminService.refundPayment(payment.id, { reason: 'Admin refund' })
      if (res.data.status === 'success') {
        toast.success('Payment refunded')
        fetchPayments()
      } else {
        toast.error(res.data.message || 'Refund failed')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Refund failed')
    } finally {
      setRefunding(null)
    }
  }

  const totalPages = Math.ceil(total / limit)
  const completedCount = payments.filter(p => p.status === 'completed' || p.status === 'succeeded').length
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount_cents || 0), 0)

  if (!profile?.is_admin && profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-black">Access Denied</h1>
          <p className="text-zed-foreground-secondary">You do not have admin privileges.</p>
          <Link href="/dashboard" className="btn-primary mt-6 inline-block">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-zed-foreground">Payments</h1>
        <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mt-1">View and manage all payment transactions</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-6">
        <a
          onClick={(e) => { e.preventDefault(); window.open(`${api.defaults.baseURL}/admin/export/payments`, '_blank'); }}
          href={`${api.defaults.baseURL}/admin/export/payments`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <Download size={12} /> Export CSV
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin opacity-30" /></div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card-zed p-6 border-white/5 bg-white/5">
              <div className="flex justify-between items-start mb-4">
                <CreditCard size={28} className="text-zed-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Total</span>
              </div>
              <p className="text-3xl font-black">{total}</p>
              <p className="text-[10px] text-zed-foreground-secondary mt-1">All transactions</p>
            </div>
            <div className="card-zed p-6 border-white/5 bg-white/5">
              <div className="flex justify-between items-start mb-4">
                <TrendingUp size={28} className="text-zed-success" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Completed</span>
              </div>
              <p className="text-3xl font-black">{completedCount}</p>
              <p className="text-[10px] text-zed-foreground-secondary mt-1">Successful payments</p>
            </div>
            <div className="card-zed p-6 border-white/5 bg-white/5">
              <div className="flex justify-between items-start mb-4">
                <DollarSign size={28} className="text-zed-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Revenue</span>
              </div>
              <p className="text-3xl font-black">${(totalRevenue / 100).toLocaleString()}</p>
              <p className="text-[10px] text-zed-foreground-secondary mt-1">Current page total</p>
            </div>
          </div>

          <div className="card-zed overflow-hidden border-white/5 mb-8">
            <div className="p-4 border-b border-white/5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search size={14} className="text-white/40" />
                <input
                  type="text"
                  placeholder="Search by ref, name, or email..."
                  className="bg-transparent border-0 outline-none text-sm text-white/80 placeholder-white/30 w-full"
                  value={filters.search || ''}
                  onChange={(e) => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1) }}
                />
                {filters.search && (
                  <button onClick={() => { setFilters(f => ({ ...f, search: undefined })); setPage(1) }}>
                    <X size={14} className="text-white/40 hover:text-white" />
                  </button>
                )}
              </div>
              <select
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-white/70"
                value={filters.status || ''}
                onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value || undefined })); setPage(1) }}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="canceled">Canceled</option>
                <option value="expired">Expired</option>
                <option value="refunded">Refunded</option>
              </select>
              <select
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-white/70"
                value={filters.type || ''}
                onChange={(e) => { setFilters(f => ({ ...f, type: e.target.value || undefined })); setPage(1) }}
              >
                <option value="">All types</option>
                <option value="contestant">Entry Fee</option>
                <option value="voter">Vote</option>
              </select>
              <select
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-white/70"
                value={filters.provider || ''}
                onChange={(e) => { setFilters(f => ({ ...f, provider: e.target.value || undefined })); setPage(1) }}
              >
                <option value="">All providers</option>
                <option value="pawapay">PawaPay</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 text-left text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">
                    <th className="p-4">Transaction</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Date</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.length === 0 ? (
                    <tr><td colSpan={8} className="p-12 text-center text-zed-foreground-secondary text-sm">No payments found</td></tr>
                  ) : payments.map((p) => {
                    const statusStyle = STATUS_LABELS[p.status] || { label: p.status, color: 'text-gray-400 bg-gray-500/10' }
                    return (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="text-xs font-bold text-white/80">{p.transaction_ref ? p.transaction_ref.slice(0, 16) + '...' : '—'}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs font-bold">{p.users?.full_name || 'Unknown'}</div>
                          <div className="text-[10px] text-zed-foreground-secondary">{p.users?.email || ''}</div>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zed-foreground-secondary">
                            {TYPE_LABELS[p.type] || p.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] font-bold uppercase text-zed-foreground-secondary">{p.provider || '—'}</span>
                          {p.network_id && <div className="text-[9px] text-zed-foreground-secondary">{p.network_id}</div>}
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-sm font-black">${((p.amount_cents || 0) / 100).toFixed(2)}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${statusStyle.color}`}>
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="p-4 text-right text-[10px] text-zed-foreground-secondary">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-4 text-center">
                          {(p.status === 'completed' || p.status === 'succeeded') && (
                            <button
                              onClick={() => handleRefund(p)}
                              disabled={refunding === p.id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-50"
                            >
                              <RotateCcw size={10} className={refunding === p.id ? 'animate-spin' : ''} />
                              {refunding === p.id ? 'Refunding...' : 'Refund'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-zed-foreground-secondary">
                  Page {page} of {totalPages} ({total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="btn-icon flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                  >
                    <ArrowLeft size={12} /> Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="btn-icon flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                  >
                    Next <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
