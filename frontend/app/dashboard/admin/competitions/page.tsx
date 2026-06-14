'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle, Loader2, Plus, Settings, Trash2, Trophy, Calendar, DollarSign } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { adminService } from '@/services/core'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminCompetitions() {
  const { profile } = useAuth()
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompModal, setShowCompModal] = useState(false)
  const [editingComp, setEditingComp] = useState<any>(null)
  const [compForm, setCompForm] = useState({
    title: '', description: '', thumbnail_url: '',
    start_date: '', end_date: '', submission_deadline: '', entry_fee_dollars: 5,
    voter_fee_dollars: 0, prize_pool_dollars: 0,
  })

  const fetchCompetitions = async () => {
    try {
      const res = await adminService.getCompetitions()
      setCompetitions(res.data || [])
    } catch (err) {
      console.error('Failed to fetch competitions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!profile?.is_admin && profile?.role !== 'admin') return
    fetchCompetitions()
  }, [profile])

  // Real-time: live updates to competition list (for multi-admin environments)
  useEffect(() => {
    if (!profile?.is_admin && profile?.role !== 'admin') return
    const channel = supabase.channel('admin-competitions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'competitions' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setCompetitions(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setCompetitions(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c))
          } else if (payload.eventType === 'DELETE') {
            setCompetitions(prev => prev.filter(c => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile?.is_admin, profile?.role])

  const handleSaveCompetition = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: compForm.title,
      description: compForm.description,
      thumbnail_url: compForm.thumbnail_url,
      start_date: compForm.start_date,
      end_date: compForm.end_date,
      submission_deadline: compForm.submission_deadline,
      entry_fee_cents: Math.round(compForm.entry_fee_dollars * 100),
      voter_fee_cents: Math.round(compForm.voter_fee_dollars * 100),
      prize_pool_cents: Math.round(compForm.prize_pool_dollars * 100),
    }
    try {
      if (editingComp) {
        await adminService.updateCompetition(editingComp.id, payload)
        toast.success('Competition updated')
      } else {
        await adminService.createCompetition(payload)
        toast.success('Competition created')
      }
      setShowCompModal(false)
      fetchCompetitions()
    } catch (err: any) {
      toast.error('Failed to save competition')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This is a soft delete.`)) return
    try {
      await adminService.deleteCompetition(id)
      toast.success('Competition deleted')
      fetchCompetitions()
    } catch (err: any) {
      toast.error('Failed to delete competition')
    }
  }

  const openEditComp = (comp: any) => {
    setEditingComp(comp)
    setCompForm({
      title: comp.title, description: comp.description, thumbnail_url: comp.thumbnail_url || '',
      start_date: comp.start_date?.split('T')[0] || '',
      end_date: comp.end_date?.split('T')[0] || '',
      submission_deadline: comp.submission_deadline?.split('T')[0] || '',
      entry_fee_dollars: (comp.entry_fee_cents || 500) / 100,
      voter_fee_dollars: (comp.voter_fee_cents || 0) / 100,
      prize_pool_dollars: (comp.prize_pool_cents || 0) / 100,
    })
    setShowCompModal(true)
  }

  const openNewComp = () => {
    setEditingComp(null)
    setCompForm({ title: '', description: '', thumbnail_url: '', start_date: '', end_date: '', submission_deadline: '', entry_fee_dollars: 5, voter_fee_dollars: 0, prize_pool_dollars: 0 })
    setShowCompModal(true)
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

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-zed-foreground">Competitions</h1>
            <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mt-1">{competitions.length} competitions</p>
          </div>
          <button onClick={openNewComp} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> New Competition
          </button>
        </div>

        <div className="card-zed overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 text-left text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">
                  <th className="p-4">Title</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Entry Fee</th>
                  <th className="p-4">Prize Pool</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={6} className="p-12 text-center"><Loader2 size={32} className="animate-spin mx-auto opacity-20" /></td></tr>
                ) : competitions.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-zed-foreground-secondary text-sm">No competitions found</td></tr>
                ) : competitions.map((comp: any) => (
                  <tr key={comp.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-sm">{comp.title}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        comp.calculatedStatus === 'active'
                          ? 'bg-zed-success/10 text-zed-success border-zed-success/20'
                          : comp.calculatedStatus === 'upcoming'
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {comp.calculatedStatus}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-zed-foreground-secondary">${(comp.entry_fee_cents / 100).toFixed(2)}</td>
                    <td className="p-4 text-xs text-zed-foreground-secondary">${(comp.prize_pool_cents / 100).toLocaleString()}</td>
                    <td className="p-4 text-xs text-zed-foreground-secondary">{new Date(comp.submission_deadline).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditComp(comp)} className="btn-icon w-8 h-8"><Settings size={14} /></button>
                        <button onClick={() => handleDelete(comp.id, comp.title)} className="btn-icon w-8 h-8 text-red-400 hover:bg-red-500/10"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCompModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCompModal(false)} />
          <div className="relative card-zed glass-premium w-full max-w-xl animate-zed-fade-up border-white/10 shadow-2xl">
            <h3 className="text-2xl font-black mb-8">{editingComp ? 'Edit' : 'Create'} Competition</h3>
            <form onSubmit={handleSaveCompetition} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Title</label>
                <input type="text" className="input-zed" value={compForm.title} onChange={e => setCompForm({ ...compForm, title: e.target.value })} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Description</label>
                <textarea className="input-zed" rows={3} value={compForm.description} onChange={e => setCompForm({ ...compForm, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Start Date</label>
                  <input type="date" className="input-zed" value={compForm.start_date} onChange={e => setCompForm({ ...compForm, start_date: e.target.value })} required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Deadline</label>
                  <input type="date" className="input-zed" value={compForm.submission_deadline} onChange={e => setCompForm({ ...compForm, submission_deadline: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Entry Fee ($)</label>
                  <input type="number" className="input-zed" value={compForm.entry_fee_dollars} onChange={e => setCompForm({ ...compForm, entry_fee_dollars: parseFloat(e.target.value) || 0 })} required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Voter Fee ($)</label>
                  <input type="number" className="input-zed" value={compForm.voter_fee_dollars} onChange={e => setCompForm({ ...compForm, voter_fee_dollars: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Prize Pool ($)</label>
                  <input type="number" className="input-zed" value={compForm.prize_pool_dollars} onChange={e => setCompForm({ ...compForm, prize_pool_dollars: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Thumbnail URL</label>
                <input type="text" className="input-zed" value={compForm.thumbnail_url} onChange={e => setCompForm({ ...compForm, thumbnail_url: e.target.value })} placeholder="/placeholder.jpg" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowCompModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Competition</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
