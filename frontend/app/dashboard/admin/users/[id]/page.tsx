'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Loader2, AlertTriangle, User, FileText, Vote, CreditCard, Shield, ShieldOff, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { adminService } from '@/services/core'
import { toast } from 'sonner'
import Link from 'next/link'
import api from '@/lib/api'

export default function AdminUserDetailPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dataView, setDataView] = useState<'profile' | 'contestant' | 'voter'>('profile')

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const res = await api.get(`/admin/users/${id}`)
        setUserData(res.data)
      } catch (err: any) {
        console.error('Failed to fetch user:', err)
        toast.error(err?.message || 'Failed to load user data')
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleVerifyToggle = async () => {
    if (!userData?.profile) return
    const newStatus = !userData.profile.is_verified
    try {
      await adminService.verifyUser(id as string, newStatus)
      setUserData((prev: any) => ({
        ...prev,
        profile: { ...prev.profile, is_verified: newStatus },
      }))
      toast.success(`User ${newStatus ? 'verified' : 'unverified'}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update verification')
    }
  }

  if (!profile?.is_admin && profile?.role !== 'admin') {
    return (
      <div className="text-center py-24">
        <AlertTriangle size={64} className="mx-auto mb-4 text-red-500" />
        <h1 className="text-2xl font-black text-zed-foreground">Access Denied</h1>
        <p className="text-zed-foreground-secondary">You do not have admin privileges.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 size={48} className="animate-spin text-zed-primary" /></div>
  }

  const p = userData?.profile

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/dashboard/admin/users" className="flex items-center gap-2 text-zed-foreground-secondary hover:text-zed-primary font-black text-xs uppercase tracking-widest mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Users
      </Link>

      {!p ? (
        <div className="text-center py-24">
          <AlertTriangle size={64} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-black text-zed-foreground">User Not Found</h2>
        </div>
      ) : (
        <>
          <div className="card-zed p-8 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-zed-gradient-primary overflow-hidden shadow-xl flex-shrink-0">
                {p.picture ? <img src={p.picture} alt="" className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex items-center justify-center text-white/40"><User size={36} /></div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black text-zed-foreground mb-1">{p.full_name || 'Unknown User'}</h1>
                <p className="text-sm text-zed-foreground-secondary mb-2">{p.email}</p>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${p.is_admin ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : p.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-zed-foreground-secondary'}`}>
                    {p.is_admin ? 'Admin' : p.role || 'User'}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${p.is_verified ? 'bg-zed-success/20 text-zed-success' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {p.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleVerifyToggle}
                className={`px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 ${p.is_verified ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30' : 'bg-zed-success/20 text-zed-success border border-zed-success/30 hover:bg-zed-success/30'}`}
              >
                {p.is_verified ? <ShieldOff size={16} /> : <Shield size={16} />}
                {p.is_verified ? 'Revoke Verification' : 'Verify User'}
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-8 bg-white/5 rounded-2xl p-1.5 w-fit border border-white/5">
            {[
              { value: 'profile', label: 'Profile', icon: User },
              { value: 'contestant', label: 'Contestant', icon: FileText },
              { value: 'voter', label: 'Voter', icon: Vote },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.value}
                  onClick={() => setDataView(tab.value as any)}
                  className={`px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${dataView === tab.value ? 'bg-zed-primary text-white shadow-lg' : 'text-zed-foreground-secondary hover:text-zed-foreground'}`}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              )
            })}
          </div>

          {dataView === 'profile' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-zed p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary mb-4">Personal Info</h3>
                <div className="space-y-3">
                  <div><span className="text-[10px] text-zed-foreground-secondary font-bold block">Full Name</span><span className="text-sm font-bold text-zed-foreground">{p.full_name || '—'}</span></div>
                  <div><span className="text-[10px] text-zed-foreground-secondary font-bold block">Email</span><span className="text-sm font-bold text-zed-foreground">{p.email || '—'}</span></div>
                  <div><span className="text-[10px] text-zed-foreground-secondary font-bold block">Country</span><span className="text-sm font-bold text-zed-foreground">{p.country || '—'}</span></div>
                  <div><span className="text-[10px] text-zed-foreground-secondary font-bold block">Role</span><span className="text-sm font-bold text-zed-foreground capitalize">{p.role || '—'}</span></div>
                  <div><span className="text-[10px] text-zed-foreground-secondary font-bold block">Mode</span><span className="text-sm font-bold text-zed-foreground">{p.current_mode || '—'}</span></div>
                </div>
              </div>
              <div className="card-zed p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary mb-4">Verification & Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zed-foreground-secondary font-bold">Verified</span>
                    {p.is_verified ? <CheckCircle size={16} className="text-zed-success" /> : <XCircle size={16} className="text-red-400" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zed-foreground-secondary font-bold">Admin</span>
                    {p.is_admin ? <Shield size={16} className="text-purple-400" /> : <XCircle size={16} className="text-white/20" />}
                  </div>
                  <div><span className="text-[10px] text-zed-foreground-secondary font-bold block">Voter Payment</span><span className={`text-sm font-bold ${p.voter_payment_status === 'paid' ? 'text-zed-success' : 'text-yellow-500'}`}>{p.voter_payment_status || 'unpaid'}</span></div>
                  <div><span className="text-[10px] text-zed-foreground-secondary font-bold block">Joined</span><span className="text-sm font-bold text-zed-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</span></div>
                </div>
              </div>
            </div>
          )}

          {dataView === 'contestant' && (
            <div className="space-y-4">
              <div className="card-zed p-6">
                <h3 className="text-sm font-black text-zed-foreground uppercase tracking-widest mb-4">
                  Ideas ({userData?.ideas?.length || 0})
                </h3>
                {(!userData?.ideas || userData.ideas.length === 0) ? (
                  <p className="text-sm text-zed-foreground-secondary">No ideas submitted.</p>
                ) : (
                  <div className="space-y-3">
                    {userData.ideas.map((idea: any) => (
                      <div key={idea.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div>
                          <p className="font-bold text-zed-foreground text-sm">{idea.title}</p>
                          <p className="text-[10px] text-zed-foreground-secondary font-bold uppercase tracking-widest mt-0.5">
                            {idea.status} • {idea.payment_status} • {idea.votes_count || 0} votes
                          </p>
                        </div>
                        <Link href={`/dashboard/admin/ideas`} className="text-[10px] font-black text-zed-primary uppercase tracking-widest">View</Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-zed p-6">
                <h3 className="text-sm font-black text-zed-foreground uppercase tracking-widest mb-4">
                  Payments ({userData?.payments?.length || 0})
                </h3>
                {(!userData?.payments || userData.payments.length === 0) ? (
                  <p className="text-sm text-zed-foreground-secondary">No payments found.</p>
                ) : (
                  <div className="space-y-3">
                    {userData.payments.map((pmt: any) => (
                      <div key={pmt.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div>
                          <p className="font-bold text-zed-foreground text-sm capitalize">{pmt.type} Payment</p>
                          <p className="text-[10px] text-zed-foreground-secondary font-bold uppercase tracking-widest mt-0.5">
                            ${(pmt.amount_cents / 100).toFixed(2)} • {pmt.status} • {new Date(pmt.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {dataView === 'voter' && (
            <div className="space-y-4">
              <div className="card-zed p-6">
                <h3 className="text-sm font-black text-zed-foreground uppercase tracking-widest mb-4">
                  Votes Cast ({userData?.votes?.length || 0})
                </h3>
                {(!userData?.votes || userData.votes.length === 0) ? (
                  <p className="text-sm text-zed-foreground-secondary">No votes cast.</p>
                ) : (
                  <div className="space-y-3">
                    {userData.votes.map((vote: any) => (
                      <div key={vote.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div>
                          <p className="font-bold text-zed-foreground text-sm">{vote.ideas?.title || 'Idea'}</p>
                          <p className="text-[10px] text-zed-foreground-secondary font-bold uppercase tracking-widest mt-0.5">
                            {new Date(vote.created_at).toLocaleDateString()}
                            {vote.innovation_score && ` • Innovation: ${vote.innovation_score}/10`}
                            {vote.feasibility_score && ` • Feasibility: ${vote.feasibility_score}/10`}
                            {vote.impact_score && ` • Impact: ${vote.impact_score}/10`}
                            {vote.presentation_score && ` • Presentation: ${vote.presentation_score}/10`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
