'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Settings, BarChart3, Loader2, AlertTriangle, Star, Eye, Target, Users, Share2, ThumbsUp } from 'lucide-react'
import { ideaService } from '@/services/core'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ManageIdeaPage() {
  const { id } = useParams()
  const router = useRouter()
  const [idea, setIdea] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [collaborators, setCollaborators] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<'insights' | 'settings'>('insights')

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const ideaRes = await ideaService.getIdeaById(id as string)
        setIdea(ideaRes.data)
        try {
          const insightsRes = await ideaService.getIdeaInsights(id as string)
          if (insightsRes.data) {
            setInsights(insightsRes.data)
            setCollaborators(insightsRes.data.idea?.collaborators || '')
          }
        } catch { /* insights may not be available yet */ }
      } catch (err) {
        console.error('Failed to fetch idea data:', err)
        toast.error('Failed to load idea data')
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this idea? This action cannot be undone.')) return
    setDeleting(true)
    try {
      await ideaService.deleteIdea(id as string)
      toast.success('Idea deleted successfully')
      router.push('/dashboard/ideas')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete idea')
    }
    setDeleting(false)
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      await ideaService.updateIdeaSettings(id as string, { collaborators })
      toast.success('Settings saved')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save settings')
    }
    setSavingSettings(false)
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/pitch/${id}`
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => toast.success('Pitch link copied!')).catch(() => fallbackCopy(url))
    } else {
      fallbackCopy(url)
    }
  }

  const fallbackCopy = (text: string) => {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    toast.success('Pitch link copied!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={48} className="animate-spin text-zed-primary" />
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="text-center py-24">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-400" />
        <h2 className="text-2xl font-black text-zed-foreground">Idea Not Found</h2>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link href={`/dashboard/ideas/${id}`} className="flex items-center gap-2 text-zed-foreground-secondary hover:text-zed-primary font-black text-xs uppercase tracking-widest mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Idea
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-zed-foreground mb-2">Manage Idea</h1>
          <p className="text-zed-foreground-secondary font-medium">{idea.title}</p>
        </div>
        <button onClick={handleCopyLink} className="btn-secondary px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2">
          <Share2 size={16} /> Share Pitch
        </button>
      </div>

      <div className="flex gap-2 mb-8 bg-white/5 rounded-2xl p-1.5 w-fit border border-white/5">
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'insights' ? 'bg-zed-primary text-white shadow-lg' : 'text-zed-foreground-secondary hover:text-zed-foreground'}`}
        >
          <BarChart3 size={16} className="inline mr-2" />Insights
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'settings' ? 'bg-zed-primary text-white shadow-lg' : 'text-zed-foreground-secondary hover:text-zed-foreground'}`}
        >
          <Settings size={16} className="inline mr-2" />Settings
        </button>
      </div>

      {activeTab === 'insights' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-zed p-6 text-center">
              <ThumbsUp size={24} className="text-zed-primary mx-auto mb-3" />
              <p className="text-3xl font-black text-zed-foreground">{insights?.votes_count || 0}</p>
              <p className="text-[10px] text-zed-foreground-secondary font-black uppercase tracking-widest mt-1">Total Votes</p>
            </div>
            <div className="card-zed p-6 text-center">
              <Star size={24} className="text-yellow-500 mx-auto mb-3" />
              <p className="text-3xl font-black text-zed-foreground">{insights?.avg_total || '—'}</p>
              <p className="text-[10px] text-zed-foreground-secondary font-black uppercase tracking-widest mt-1">Avg Rating</p>
            </div>
            <div className="card-zed p-6 text-center">
              <Eye size={24} className="text-zed-success mx-auto mb-3" />
              <p className="text-3xl font-black text-zed-foreground">{insights?.avg_feasibility_rating || '—'}</p>
              <p className="text-[10px] text-zed-foreground-secondary font-black uppercase tracking-widest mt-1">Feasibility</p>
            </div>
            <div className="card-zed p-6 text-center">
              <Target size={24} className="text-zed-accent mx-auto mb-3" />
              <p className="text-3xl font-black text-zed-foreground">{insights?.avg_impact_rating || '—'}</p>
              <p className="text-[10px] text-zed-foreground-secondary font-black uppercase tracking-widest mt-1">Impact</p>
            </div>
          </div>

          {insights && (
            <div className="card-zed p-8">
              <h3 className="text-sm font-black text-zed-foreground uppercase tracking-widest mb-6">Rating Breakdown</h3>
              <div className="space-y-6">
                {[
                  { label: 'Innovation', value: insights.avg_innovation_rating, color: 'bg-zed-primary' },
                  { label: 'Impact', value: insights.avg_impact_rating, color: 'bg-zed-accent' },
                  { label: 'Feasibility', value: insights.avg_feasibility_rating, color: 'bg-zed-success' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-zed-foreground">{item.label}</span>
                      <span className="text-xs font-black text-zed-foreground">{item.value || '—'} / 5</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${item.color}`} style={{ width: `${((item.value || 0) / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card-zed p-6 flex items-center justify-between border border-white/5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary mb-1">Idea Status</p>
              <p className="text-lg font-black text-zed-foreground capitalize">{idea.status}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary mb-1">Payment</p>
              <p className={`text-lg font-black ${idea.payment_status === 'paid' ? 'text-zed-success' : 'text-yellow-500'}`}>
                {idea.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8 max-w-lg">
          <div className="card-zed p-8">
            <h3 className="text-sm font-black text-zed-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
              <Users size={16} /> Collaborators
            </h3>
            <p className="text-xs text-zed-foreground-secondary mb-4">
              List the names of collaborators working on this idea with you (comma-separated).
            </p>
            <input
              type="text"
              value={collaborators}
              onChange={(e) => setCollaborators(e.target.value)}
              placeholder="e.g. John Doe, Jane Smith"
              className="input-zed mb-4"
            />
            <button onClick={handleSaveSettings} disabled={savingSettings} className="btn-primary px-6 py-3 rounded-xl text-xs font-black">
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          <div className="card-zed p-8 border-red-500/20">
            <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Trash2 size={16} /> Danger Zone
            </h3>
            <p className="text-xs text-zed-foreground-secondary mb-6">
              Deleting your idea will hide it from public view. This action cannot be undone.
            </p>
            <button onClick={handleDelete} disabled={deleting} className="px-6 py-3 rounded-xl text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">
              {deleting ? 'Deleting...' : 'Delete Idea'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
