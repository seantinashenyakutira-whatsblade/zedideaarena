'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Loader2, Search, Clock, Shield } from 'lucide-react'
import api from '@/lib/api'

const ACTION_LABELS: Record<string, string> = {
  user_verified: 'User Verified',
  user_unverified: 'User Unverified',
  idea_approved: 'Idea Approved',
  idea_rejected: 'Idea Rejected',
  competition_created: 'Competition Created',
  competition_edited: 'Competition Edited',
  competition_deleted: 'Competition Deleted',
}

const ACTION_COLORS: Record<string, string> = {
  user_verified: 'text-green-400 bg-green-500/10',
  user_unverified: 'text-red-400 bg-red-500/10',
  idea_approved: 'text-emerald-400 bg-emerald-500/10',
  idea_rejected: 'text-rose-400 bg-rose-500/10',
  competition_created: 'text-blue-400 bg-blue-500/10',
  competition_edited: 'text-amber-400 bg-amber-500/10',
  competition_deleted: 'text-red-400 bg-red-500/10',
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const res: any = await api.get('/admin/audit-log')
        setLogs(res.data || [])
      } catch (e) {
        console.error('Error fetching audit log:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const filtered = logs.filter(l => {
    if (!search) return true
    const q = search.toLowerCase()
    return l.action_type?.toLowerCase().includes(q) || l.target_type?.toLowerCase().includes(q) || l.note?.toLowerCase().includes(q) || l.admin_id?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><ClipboardList size={20} className="text-amber-400" /> Audit Log</h1>
          <p className="text-sm text-white/40 mt-0.5">Track all admin actions across the platform</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search actions..."
            className="w-56 bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50 placeholder-white/20"
          />
        </div>
        <span className="text-xs text-white/30">{filtered.length} action{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-white/30" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30 text-sm space-y-2">
          <ClipboardList size={32} className="mx-auto opacity-30" />
          <p>No audit log entries found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => (
            <div key={log.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${ACTION_COLORS[log.action_type] || 'bg-white/5 text-white/40'}`}>
                  <Shield size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action_type] || 'bg-white/5 text-white/60'}`}>
                      {ACTION_LABELS[log.action_type] || log.action_type}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/60 uppercase">
                      {log.target_type}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-1.5">
                    Admin <span className="text-white/70 font-mono">{log.admin_id?.slice(0, 8)}</span>
                    {' → '}
                    {log.target_type} <span className="text-white/70 font-mono">{log.target_id?.slice(0, 8)}</span>
                  </p>
                  {log.note && <p className="text-xs text-white/40 mt-1 italic">{log.note}</p>}
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-white/30">
                    <Clock size={10} /> {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
