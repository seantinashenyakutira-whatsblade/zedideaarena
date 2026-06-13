'use client'

import { useState, useEffect } from 'react'
import { Flag, Loader2, Check, X, Search, AlertTriangle, Clock, Shield, User } from 'lucide-react'
import api from '@/lib/api'

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-red-500/20 text-red-400' },
  reviewed: { label: 'Reviewed', color: 'bg-amber-500/20 text-amber-400' },
  dismissed: { label: 'Dismissed', color: 'bg-zinc-500/20 text-zinc-400' },
  action_taken: { label: 'Action Taken', color: 'bg-green-500/20 text-green-400' },
}

const TYPE_LABELS: Record<string, string> = {
  post: 'Post',
  comment: 'Comment',
  message: 'Message',
  profile: 'Profile',
}

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => { fetchReports() }, [statusFilter])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await api.get(`/admin/reports?${params}`)
      setReports(res.data || [])
    } catch (e) {
      console.error('Error fetching reports:', e)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    try {
      await api.patch(`/admin/reports/${id}/status`, { status })
      setReports(prev => prev.map(r => r.id === id ? { ...r, status, reviewed_at: new Date().toISOString() } : r))
    } catch (e) {
      console.error('Error updating report:', e)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = reports.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.reason?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q) || r.target_id?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Flag size={20} className="text-red-400" /> Reports</h1>
          <p className="text-sm text-white/40 mt-0.5">Review user reports about content and profiles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-56 bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50 placeholder-white/20"
          />
        </div>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="reviewed">Reviewed</option>
          <option value="dismissed">Dismissed</option>
          <option value="action_taken">Action Taken</option>
        </select>
        <span className="text-xs text-white/30">{filtered.length} report{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-white/30" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30 text-sm space-y-2">
          <Flag size={32} className="mx-auto opacity-30" />
          <p>No reports found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(report => (
            <div key={report.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGES[report.status]?.color || ''}`}>
                      {STATUS_BADGES[report.status]?.label || report.status}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/60 uppercase">
                      {TYPE_LABELS[report.target_type] || report.target_type}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">{report.reason}</p>
                  {report.description && <p className="text-xs text-white/50 mt-0.5">{report.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                    <span className="flex items-center gap-1"><User size={10} /> Reporter: {report.reporter_id?.slice(0, 8)}...</span>
                    <span className="flex items-center gap-1"><Flag size={10} /> Target: {report.target_id?.slice(0, 8)}...</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {report.status === 'open' && (
                    <>
                      <button
                        onClick={() => updateStatus(report.id, 'dismissed')}
                        disabled={updating === report.id}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                      >
                        {updating === report.id ? <Loader2 size={12} className="animate-spin" /> : 'Dismiss'}
                      </button>
                      <button
                        onClick={() => updateStatus(report.id, 'action_taken')}
                        disabled={updating === report.id}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-30"
                      >
                        {updating === report.id ? <Loader2 size={12} className="animate-spin" /> : 'Take Action'}
                      </button>
                    </>
                  )}
                  {report.status === 'reviewed' && (
                    <span className="text-[10px] text-amber-400/60 italic">Reviewed</span>
                  )}
                  {report.status === 'dismissed' && (
                    <button
                      onClick={() => updateStatus(report.id, 'open')}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/5 text-zinc-400 hover:bg-white/10 transition-all"
                    >
                      Reopen
                    </button>
                  )}
                  {report.status === 'action_taken' && (
                    <button
                      onClick={() => updateStatus(report.id, 'open')}
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
