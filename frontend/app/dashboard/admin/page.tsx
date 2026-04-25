'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { Users, FileText, CheckCircle, XCircle, AlertCircle, Loader2, ArrowRight, Plus, Trophy, Calendar, DollarSign, Settings } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ users: 0, ideas: 0, paidIdeas: 0 })
  const [ideas, setIdeas] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompModal, setShowCompModal] = useState(false)
  const [editingComp, setEditingComp] = useState<any>(null)
  
  const [compForm, setCompForm] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    start_date: '',
    end_date: '',
    submission_deadline: '',
    entry_fee: 5,
    status: 'active'
  })

  useEffect(() => {
    if (profile?.role !== 'admin') return

    const fetchData = async () => {
      try {
        const [statsRes, ideasRes, compsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/ideas'),
          api.get('/competitions')
        ])
        setStats(statsRes.data)
        setIdeas(ideasRes.data)
        setCompetitions(compsRes.data.data || [])
      } catch (err) {
        console.error('Admin fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [profile])

  const handleUpdateStatus = async (ideaId: string, status: string) => {
    try {
      await api.post(`/admin/ideas/${ideaId}/status`, { status })
      toast.success(`Idea status updated to ${status}`)
      const res = await api.get('/admin/ideas')
      setIdeas(res.data)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  const handleSaveCompetition = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingComp) {
        await api.put(`/competitions/${editingComp.id}`, compForm)
        toast.success('Competition updated')
      } else {
        await api.post('/competitions', compForm)
        toast.success('Competition created')
      }
      setShowCompModal(false)
      // Refresh
      const res = await api.get('/competitions')
      setCompetitions(res.data.data || [])
    } catch (err: any) {
      toast.error('Failed to save competition')
    }
  }

  const openEditComp = (comp: any) => {
    setEditingComp(comp)
    setCompForm({
      title: comp.title,
      description: comp.description,
      thumbnail_url: comp.thumbnail_url,
      start_date: comp.start_date.split('T')[0],
      end_date: comp.end_date.split('T')[0],
      submission_deadline: comp.submission_deadline.split('T')[0],
      entry_fee: comp.entry_fee,
      status: comp.status
    })
    setShowCompModal(true)
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-zed-background text-zed-foreground">
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
    <ProtectedRoute>
      <div className="flex h-screen bg-zed-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-8 bg-zed-background-alt">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-12">
                <h1 className="text-4xl font-black text-zed-foreground">Admin Command Center</h1>
                <button 
                  onClick={() => { setEditingComp(null); setCompForm({ title: '', description: '', thumbnail_url: '', start_date: '', end_date: '', submission_deadline: '', entry_fee: 5, status: 'active' }); setShowCompModal(true); }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={20} /> New Competition
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="card-zed p-8 border-white/5 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <Users size={32} className="text-zed-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Total Users</span>
                  </div>
                  <p className="text-4xl font-black">{stats.users}</p>
                </div>
                <div className="card-zed p-8 border-white/5 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <FileText size={32} className="text-zed-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Total Ideas</span>
                  </div>
                  <p className="text-4xl font-black">{stats.ideas}</p>
                </div>
                <div className="card-zed p-8 border-white/5 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <CheckCircle size={32} className="text-zed-success" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Paid Submissions</span>
                  </div>
                  <p className="text-4xl font-black">{stats.paidIdeas}</p>
                </div>
              </div>

              {/* Competitions Section */}
              <div className="mb-12">
                <h3 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Trophy size={20} className="text-zed-primary" /> Manage Competitions
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {competitions.map(comp => (
                     <div key={comp.id} className="card-zed glass-premium p-6 border-white/5 relative group">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditComp(comp)} className="p-2 bg-white/5 rounded-lg text-zed-primary hover:bg-white/10">
                            <Settings size={16} />
                          </button>
                        </div>
                        <h4 className="font-black text-lg mb-2">{comp.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-zed-foreground-secondary mb-4">
                           <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(comp.submission_deadline).toLocaleDateString()}</span>
                           <span className="flex items-center gap-1"><DollarSign size={12}/> ${comp.entry_fee}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          comp.calculatedStatus === 'active' ? 'bg-zed-success/20 text-zed-success' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {comp.calculatedStatus}
                        </span>
                     </div>
                   ))}
                </div>
              </div>

              {/* Recent Submissions */}
              <div className="card-zed overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-lg font-black uppercase tracking-widest">Recent Submissions</h3>
                  <button className="text-xs font-bold text-zed-primary hover:underline">View All</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5 text-left text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">
                        <th className="p-4">Title</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        <tr><td colSpan={5} className="p-12 text-center"><Loader2 size={32} className="animate-spin mx-auto opacity-20" /></td></tr>
                      ) : ideas.map(idea => (
                        <tr key={idea.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-sm">{idea.title}</p>
                            <p className="text-[10px] text-zed-foreground-secondary uppercase">{idea.category}</p>
                          </td>
                          <td className="p-4 text-xs font-medium text-zed-foreground-secondary">{idea.user_id}</td>
                          <td className="p-4">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                              idea.status === 'submitted' ? 'bg-zed-success/10 text-zed-success border-zed-success/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}>
                              {idea.status}
                            </span>
                          </td>
                          <td className="p-4">
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                               idea.payment_status === 'paid' ? 'bg-zed-primary/20 text-zed-primary' : 'bg-red-500/20 text-red-400'
                             }`}>
                               {idea.payment_status || 'unpaid'}
                             </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/dashboard/ideas/${idea.id}`} className="btn-icon w-8 h-8"><ArrowRight size={14} /></Link>
                              <button onClick={() => handleUpdateStatus(idea.id, 'approved')} className="text-zed-success hover:scale-110 transition-transform"><CheckCircle size={18} /></button>
                              <button onClick={() => handleUpdateStatus(idea.id, 'rejected')} className="text-red-500 hover:scale-110 transition-transform"><XCircle size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Competition Modal */}
        {showCompModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCompModal(false)} />
            <div className="relative card-zed glass-premium w-full max-w-xl animate-zed-fade-up border-white/10 shadow-2xl">
               <h3 className="text-2xl font-black mb-8">{editingComp ? 'Edit' : 'Create'} Competition</h3>
               <form onSubmit={handleSaveCompetition} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Title</label>
                    <input type="text" className="input-zed" value={compForm.title} onChange={e => setCompForm({...compForm, title: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Description</label>
                    <textarea className="input-zed" rows={3} value={compForm.description} onChange={e => setCompForm({...compForm, description: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Start Date</label>
                      <input type="date" className="input-zed" value={compForm.start_date} onChange={e => setCompForm({...compForm, start_date: e.target.value})} required />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Deadline</label>
                      <input type="date" className="input-zed" value={compForm.submission_deadline} onChange={e => setCompForm({...compForm, submission_deadline: e.target.value})} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Entry Fee ($)</label>
                      <input type="number" className="input-zed" value={compForm.entry_fee} onChange={e => setCompForm({...compForm, entry_fee: parseInt(e.target.value)})} required />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary block mb-2">Thumbnail URL</label>
                      <input type="text" className="input-zed" value={compForm.thumbnail_url} onChange={e => setCompForm({...compForm, thumbnail_url: e.target.value})} placeholder="/placeholder.jpg" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowCompModal(false)} className="btn-secondary flex-1">Cancel</button>
                    <button type="submit" className="btn-primary flex-1">Save Competition</button>
                  </div>
               </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
