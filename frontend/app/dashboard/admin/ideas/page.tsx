'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle, Loader2, CheckCircle, XCircle, Settings, Filter, MessageSquare } from 'lucide-react'
import { adminService } from '@/services/core'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminIdeas() {
  const { profile } = useAuth()
  const [ideas, setIdeas] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterComp, setFilterComp] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [rejectModal, setRejectModal] = useState<{ id: string; open: boolean }>({ id: '', open: false })
  const [rejectNote, setRejectNote] = useState('')

  const fetchIdeas = async () => {
    try {
      const filters: any = {}
      if (filterComp) filters.competition_id = filterComp
      if (filterStatus) filters.status = filterStatus
      const res = await adminService.getAllIdeas(filters)
      setIdeas(res.data || [])
    } catch (err) {
      console.error('Failed to fetch ideas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!profile?.is_admin && profile?.role !== 'admin') return

    const init = async () => {
      try {
        const [compsRes] = await Promise.all([
          adminService.getCompetitions(),
        ])
        setCompetitions(compsRes.data || [])
      } catch (err) {
        console.error('Failed to load filters:', err)
      }
      fetchIdeas()
    }
    init()
  }, [profile])

  useEffect(() => {
    fetchIdeas()
  }, [filterComp, filterStatus])

  const handleApprove = async (ideaId: string) => {
    try {
      await adminService.updateIdeaStatus(ideaId, 'approved')
      toast.success('Idea approved')
      fetchIdeas()
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve')
    }
  }

  const handleReject = async () => {
    if (!rejectModal.id) return
    try {
      await adminService.updateIdeaStatus(rejectModal.id, 'rejected', rejectNote)
      toast.success('Idea rejected')
      setRejectModal({ id: '', open: false })
      setRejectNote('')
      fetchIdeas()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject')
    }
  }

  const openRejectModal = (id: string) => {
    setRejectModal({ id, open: true })
    setRejectNote('')
  }

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

  const statusOptions = ['', 'draft', 'submitted', 'pending', 'approved', 'rejected']

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-zed-foreground">Idea Management</h1>
            <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mt-1">{ideas.length} submissions</p>
          </div>
          <div className="flex gap-3">
            <select
              value={filterComp}
              onChange={e => setFilterComp(e.target.value)}
              className="input-zed text-xs py-2 px-3"
            >
              <option value="">All Competitions</option>
              {competitions.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="input-zed text-xs py-2 px-3"
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>{s || 'All Statuses'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-zed overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 text-left text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">
                  <th className="p-4">Title</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Competition</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Admin Note</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={7} className="p-12 text-center"><Loader2 size={32} className="animate-spin mx-auto opacity-20" /></td></tr>
                ) : ideas.length === 0 ? (
                  <tr><td colSpan={7} className="p-12 text-center text-zed-foreground-secondary text-sm">No ideas found</td></tr>
                ) : ideas.map((idea: any) => (
                  <tr key={idea.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-sm">{idea.title}</p>
                      <p className="text-[10px] text-zed-foreground-secondary uppercase">{idea.category || '—'}</p>
                    </td>
                    <td className="p-4 text-xs font-mono text-zed-foreground-secondary">{idea.user_id?.slice(0, 8)}...</td>
                    <td className="p-4 text-xs text-zed-foreground-secondary">{idea.competition_id?.slice(0, 8)}...</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        idea.status === 'submitted' || idea.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          : idea.status === 'approved'
                          ? 'bg-zed-success/10 text-zed-success border-zed-success/20'
                          : idea.status === 'rejected'
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : 'bg-white/10 text-zed-foreground-secondary border-white/10'
                      }`}>
                        {idea.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${idea.payment_status === 'paid' ? 'bg-zed-primary/20 text-zed-primary' : 'bg-red-500/20 text-red-400'}`}>
                        {idea.payment_status || 'unpaid'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-zed-foreground-secondary max-w-[120px] truncate">{idea.admin_note || '—'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/ideas/${idea.id}`} className="btn-icon w-8 h-8"><Settings size={14} /></Link>
                        <button onClick={() => handleApprove(idea.id)} className="text-zed-success hover:scale-110 transition-transform"><CheckCircle size={18} /></button>
                        <button onClick={() => openRejectModal(idea.id)} className="text-red-500 hover:scale-110 transition-transform"><XCircle size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {rejectModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRejectModal({ id: '', open: false })} />
          <div className="relative card-zed glass-premium w-full max-w-md animate-zed-fade-up border-white/10 shadow-2xl p-6">
            <h3 className="text-xl font-black mb-2">Reject Idea</h3>
            <p className="text-xs text-zed-foreground-secondary mb-6">Provide a note explaining the rejection (optional).</p>
            <textarea
              className="input-zed w-full mb-6"
              rows={4}
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="Reason for rejection..."
            />
            <div className="flex gap-4">
              <button onClick={() => setRejectModal({ id: '', open: false })} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleReject} className="btn-primary flex-1 bg-red-500 hover:bg-red-600">Reject</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
