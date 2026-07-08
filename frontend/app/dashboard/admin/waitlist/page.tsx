'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle, Loader2, Users, Mail, CheckCircle2, Clock, Download, Search, BarChart3, Globe, Target, Award, TrendingUp, Send, X, Zap } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function AdminWaitlist() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [sendingEmail, setSendingEmail] = useState(false)

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/waitlist/stats')
      if (res?.success) setStats(res.data)
    } catch { }
  }

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await api.get(`/admin/waitlist?${params}`)
      if (res?.success) {
        setUsers(res.data || [])
        setTotal(res.total || 0)
      }
    } catch { }
  }

  useEffect(() => {
    if (!profile?.is_admin && profile?.role !== 'admin') return
    setLoading(true)
    Promise.all([fetchStats(), fetchUsers()]).finally(() => setLoading(false))
  }, [profile])

  useEffect(() => {
    if (profile?.is_admin || profile?.role === 'admin') fetchUsers()
  }, [page, search, statusFilter])

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

  const handleSendEmail = async (type: string) => {
    if (!confirm(`Send ${type.replace(/_/g, ' ')} email to all verified users?`)) return
    setSendingEmail(true)
    try {
      const res = await api.post('/admin/waitlist/send-email', { type })
      if (res?.success) {
        toast.success(`Email sent to ${res.sent} users`)
        fetchStats()
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send email')
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-zed-foreground">Waitlist</h1>
        <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mt-1">
          {total} signups · {stats?.verified || 0} verified · {stats?.verificationRate || 0}% verification rate
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-6">
        <a
          onClick={(e) => { e.preventDefault(); window.open(`${api.defaults.baseURL}/admin/waitlist/export`, '_blank'); }}
          href={`${api.defaults.baseURL}/admin/waitlist/export`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <Download size={12} /> Export CSV
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin opacity-30" /></div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card-zed p-5 border-white/5 bg-white/5">
              <div className="flex items-center gap-3 mb-2">
                <Users size={20} className="text-zed-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Total</span>
              </div>
              <p className="text-3xl font-black">{stats?.total || 0}</p>
            </div>
            <div className="card-zed p-5 border-white/5 bg-white/5">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 size={20} className="text-green-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Verified</span>
              </div>
              <p className="text-3xl font-black text-green-400">{stats?.verified || 0}</p>
            </div>
            <div className="card-zed p-5 border-white/5 bg-white/5">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={20} className="text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Pending</span>
              </div>
              <p className="text-3xl font-black text-yellow-400">{stats?.pending || 0}</p>
            </div>
            <div className="card-zed p-5 border-white/5 bg-white/5">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={20} className="text-zed-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Rate</span>
              </div>
              <p className="text-3xl font-black">{stats?.verificationRate || 0}%</p>
            </div>
          </div>

          {/* Email Stats + Roles */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="card-zed border-white/5">
              <div className="p-5 border-b border-white/5 flex items-center gap-3">
                <Mail size={18} className="text-zed-primary" />
                <h3 className="text-sm font-black uppercase tracking-widest">Email Analytics</h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-white">{stats?.email?.sent || 0}</p>
                    <p className="text-[10px] text-zed-foreground-secondary font-bold uppercase">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-green-400">{stats?.email?.openRate || 0}%</p>
                    <p className="text-[10px] text-zed-foreground-secondary font-bold uppercase">Open Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-zed-accent">{stats?.email?.clickRate || 0}%</p>
                    <p className="text-[10px] text-zed-foreground-secondary font-bold uppercase">Click Rate</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: 'Behind Scenes', type: 'behind_the_scenes' },
                    { label: 'Feature Preview', type: 'feature_preview' },
                    { label: 'Launch Countdown', type: 'launch_countdown' },
                  ].map(btn => (
                    <button
                      key={btn.type}
                      onClick={() => handleSendEmail(btn.type)}
                      disabled={sendingEmail}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      <Send size={11} /> {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-zed border-white/5">
              <div className="p-5 border-b border-white/5 flex items-center gap-3">
                <Users size={18} className="text-zed-accent" />
                <h3 className="text-sm font-black uppercase tracking-widest">Role Distribution</h3>
              </div>
              <div className="p-5">
                {stats?.roles && Object.keys(stats.roles).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(stats.roles)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([role, count]: any) => (
                        <div key={role} className="flex items-center justify-between py-1">
                          <span className="text-xs font-semibold text-white/70">{role}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 sm:w-32 h-2 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-zed-primary to-zed-accent rounded-full" style={{ width: `${(count / Math.max(...Object.values(stats.roles) as number[])) * 100}%` }} />
                            </div>
                            <span className="text-xs font-bold text-white w-6 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-zed-foreground-secondary">No role data</p>
                )}
              </div>
            </div>
          </div>

          {/* Countries + Interests */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="card-zed border-white/5">
              <div className="p-5 border-b border-white/5 flex items-center gap-3">
                <Globe size={18} className="text-zed-success" />
                <h3 className="text-sm font-black uppercase tracking-widest">Top Countries</h3>
              </div>
              <div className="p-5 max-h-64 overflow-y-auto">
                {stats?.countries && Object.keys(stats.countries).length > 0 ? (
                  <div className="space-y-1.5">
                    {Object.entries(stats.countries)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .slice(0, 20)
                      .map(([country, count]: any) => (
                        <div key={country} className="flex items-center justify-between py-1">
                          <span className="text-xs font-semibold text-white/70">{country}</span>
                          <span className="text-xs font-bold text-white">{count}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-zed-foreground-secondary">No country data</p>
                )}
              </div>
            </div>

            <div className="card-zed border-white/5">
              <div className="p-5 border-b border-white/5 flex items-center gap-3">
                <Target size={18} className="text-zed-accent" />
                <h3 className="text-sm font-black uppercase tracking-widest">Top Interests</h3>
              </div>
              <div className="p-5 max-h-64 overflow-y-auto">
                {stats?.interests && Object.keys(stats.interests).length > 0 ? (
                  <div className="space-y-1.5">
                    {Object.entries(stats.interests)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .slice(0, 15)
                      .map(([interest, count]: any) => (
                        <div key={interest} className="flex items-center justify-between py-1">
                          <span className="text-xs font-semibold text-white/70">{interest}</span>
                          <span className="text-xs font-bold text-white">{count}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-zed-foreground-secondary">No interest data</p>
                )}
              </div>
            </div>
          </div>

          {/* Referral Leaderboard */}
          {stats?.referralLeaderboard?.length > 0 && (
            <div className="card-zed border-white/5 mb-8">
              <div className="p-5 border-b border-white/5 flex items-center gap-3">
                <Award size={18} className="text-yellow-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">Referral Leaderboard</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5 text-left text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">
                      <th className="p-4">Name</th>
                      <th className="p-4 text-right">Referrals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats.referralLeaderboard.map((r: any, i: number) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-2">
                          <span className="text-[10px] font-black text-zed-foreground-secondary w-5">{i + 1}.</span>
                          <span className="text-sm font-bold">{r.name}</span>
                        </td>
                        <td className="p-4 text-right text-xs font-bold text-zed-primary">{r.referral_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="card-zed border-white/5">
            <div className="p-5 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Search size={16} className="text-zed-foreground-secondary" />
                <h3 className="text-sm font-black uppercase tracking-widest">All Signups ({total})</h3>
              </div>
              <div className="flex items-center gap-2">
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="text-[10px] font-bold bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white/70 outline-none">
                  <option value="">All</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  className="text-[10px] bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/70 outline-none w-44"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 text-left text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Country</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-center">Verified</th>
                    <th className="p-3 text-center">Referrals</th>
                    <th className="p-3">Email Status</th>
                    <th className="p-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.length === 0 ? (
                    <tr><td colSpan={8} className="p-8 text-center text-zed-foreground-secondary text-sm">No signups found</td></tr>
                  ) : users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-sm font-bold">{u.name}</td>
                      <td className="p-3 text-xs text-zed-foreground-secondary">{u.email}</td>
                      <td className="p-3 text-xs text-zed-foreground-secondary">{u.country || '-'}</td>
                      <td className="p-3 text-xs text-zed-foreground-secondary">{u.role || '-'}</td>
                      <td className="p-3 text-center">
                        {u.email_verified ? <CheckCircle2 size={14} className="text-green-400 inline" /> : <X size={14} className="text-red-400 inline" />}
                      </td>
                      <td className="p-3 text-center text-xs font-bold text-zed-primary">{u.referral_count || 0}</td>
                      <td className="p-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${u.email_status === 'verified' ? 'bg-green-500/10 text-green-400' : u.email_status ? 'bg-blue-500/10 text-blue-400' : 'bg-white/10 text-white/50'}`}>
                          {u.email_status || 'none'}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-zed-foreground-secondary">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
