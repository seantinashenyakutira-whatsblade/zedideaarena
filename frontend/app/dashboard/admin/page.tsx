'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePageChannel } from '@/hooks/usePageChannel'
import { Users, FileText, Trophy, Vote, DollarSign, AlertCircle, Loader2, ArrowRight, ShieldCheck, Medal, Crown, Award, Bell, FileWarning, UserX, FileCheck, CreditCard } from 'lucide-react'
import api from '@/lib/api'
import { adminService } from '@/services/core'
import Link from 'next/link'

export default function AdminOverview() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [auditLog, setAuditLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const refreshStats = useCallback(async () => {
    try {
      const statsRes = await adminService.getStats()
      setStats(statsRes.data)
    } catch {}
  }, [])

  useEffect(() => {
    if (!profile?.is_admin && profile?.role !== 'admin') return

    const fetchData = async () => {
      try {
        const [statsRes, auditRes] = await Promise.all([
          adminService.getStats(),
          adminService.getAuditLog(),
        ])
        setStats(statsRes.data)
        setAuditLog(auditRes.data || [])
      } catch (err) {
        console.error('Admin fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [profile])

  usePageChannel('admin-dashboard', [
    { type: 'pg', event: 'INSERT', table: 'notifications', handler: () => { refreshStats() }},
    { type: 'pg', event: 'UPDATE', table: 'users', handler: () => { refreshStats() }},
    { type: 'pg', event: 'UPDATE', table: 'ideas', handler: () => { refreshStats() }},
    { type: 'pg', event: 'UPDATE', table: 'competitions', handler: () => { refreshStats() }},
    { type: 'pg', event: 'INSERT', table: 'payments', handler: () => { refreshStats() }},
  ], [refreshStats])

  if (!profile?.is_admin && profile?.role !== 'admin') {
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

  const statCards = [
    { label: 'Total Users', value: stats?.users ?? '—', icon: Users, color: 'text-zed-primary', href: '/dashboard/admin/users' },
    { label: 'Total Ideas', value: stats?.ideas ?? '—', icon: FileText, color: 'text-zed-accent', href: '/dashboard/admin/ideas' },
    { label: 'Competitions', value: stats?.competitions ?? '—', icon: Trophy, color: 'text-yellow-500', href: '/dashboard/admin/competitions' },
    { label: 'Total Votes', value: stats?.votes ?? '—', icon: Vote, color: 'text-green-400', href: '/dashboard/admin/analytics' },
    { label: 'Prize Pool', value: `$${((stats?.totalPrizePoolCents ?? 0) / 100).toLocaleString()}`, icon: DollarSign, color: 'text-purple-400', href: '/dashboard/admin/analytics' },
    { label: 'Paid Ideas', value: stats?.paidIdeas ?? '—', icon: ShieldCheck, color: 'text-zed-success', href: '/dashboard/admin/ideas' },
    { label: 'Payments', value: stats?.totalPayments ?? '—', icon: CreditCard, color: 'text-zed-accent', href: '/dashboard/admin/payments' },
    { label: 'Revenue', value: `$${((stats?.totalRevenueCents ?? 0) / 100).toLocaleString()}`, icon: DollarSign, color: 'text-green-400', href: '/dashboard/admin/payments' },
  ]

  const actionTypeLabels: Record<string, { label: string; color: string }> = {
    user_verified: { label: 'User Verified', color: 'text-zed-success' },
    user_unverified: { label: 'User Unverified', color: 'text-red-400' },
    idea_approved: { label: 'Idea Approved', color: 'text-zed-success' },
    idea_rejected: { label: 'Idea Rejected', color: 'text-red-400' },
    competition_created: { label: 'Competition Created', color: 'text-zed-accent' },
    competition_edited: { label: 'Competition Edited', color: 'text-zed-primary' },
    competition_deleted: { label: 'Competition Deleted', color: 'text-red-400' },
  }

  return (
          <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h1 className="text-4xl font-black text-zed-foreground">Admin Overview</h1>
                  <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mt-1">System-wide statistics and control</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/dashboard/admin/analytics" className="btn-primary flex items-center gap-2">
                    Analytics <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin opacity-30" /></div>
              ) : (
                <>
                  {/* Pending Notifications */}
                  {(stats?.pending?.ideas > 0 || stats?.pending?.users > 0 || stats?.pending?.kyc > 0) && (
                    <div className="mb-8 space-y-3">
                      <h3 className="text-sm font-black uppercase tracking-widest text-zed-foreground-secondary flex items-center gap-2">
                        <Bell size={14} /> Pending Review
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        {stats.pending.ideas > 0 && (
                          <Link href="/dashboard/admin/ideas" className="card-zed p-4 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileWarning size={20} className="text-amber-400" />
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Ideas</p>
                                <p className="text-lg font-black text-amber-300">{stats.pending.ideas} pending</p>
                              </div>
                            </div>
                            <ArrowRight size={16} className="text-amber-400/50" />
                          </Link>
                        )}
                        {stats.pending.users > 0 && (
                          <Link href="/dashboard/admin/users" className="card-zed p-4 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <UserX size={20} className="text-blue-400" />
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Unverified Users</p>
                                <p className="text-lg font-black text-blue-300">{stats.pending.users} pending</p>
                              </div>
                            </div>
                            <ArrowRight size={16} className="text-blue-400/50" />
                          </Link>
                        )}
                        {stats.pending.kyc > 0 && (
                          <Link href="/dashboard/admin/users" className="card-zed p-4 border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileCheck size={20} className="text-purple-400" />
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-purple-400">KYC Documents</p>
                                <p className="text-lg font-black text-purple-300">{stats.pending.kyc} awaiting review</p>
                              </div>
                            </div>
                            <ArrowRight size={16} className="text-purple-400/50" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {statCards.map((card) => {
                      const Icon = card.icon
                      return (
                        <Link key={card.label} href={card.href} className="card-zed p-6 border-white/5 bg-white/5 hover:bg-white/[0.07] transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            <Icon size={28} className={card.color} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">{card.label}</span>
                          </div>
                          <p className="text-3xl font-black">{card.value}</p>
                        </Link>
                      )
                    })}
                  </div>

                  {/* Prize Distribution */}
                  {stats?.prizeDistribution && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                      {(stats.prizeDistribution as any[]).map((dist: any, i: number) => {
                        const icons = [Crown, Medal, Award]
                        const Icon = icons[i] || Trophy
                        const colors = ['text-yellow-500', 'text-gray-400', 'text-amber-700']
                        const bgColors = ['bg-yellow-500/10', 'bg-gray-400/10', 'bg-amber-700/10']
                        return (
                          <div key={dist.position} className={`card-zed p-6 border-white/5 ${bgColors[i]} text-center`}>
                            <Icon size={36} className={`${colors[i]} mx-auto mb-3`} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary mb-1">{dist.label}</p>
                            <p className="text-3xl font-black text-zed-foreground">${(dist.amount_cents / 100).toLocaleString()}</p>
                            <p className="text-xs text-zed-foreground-secondary mt-1">{(dist.share * 100)}% of prize pool</p>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="card-zed overflow-hidden border-white/5">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                      <h3 className="text-lg font-black uppercase tracking-widest">Recent Admin Actions</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Audit Trail</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-white/5 text-left text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">
                            <th className="p-4">Action</th>
                            <th className="p-4">Target</th>
                            <th className="p-4">Note</th>
                            <th className="p-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {auditLog.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-zed-foreground-secondary text-sm">No actions recorded yet</td></tr>
                          ) : auditLog.map((action: any) => {
                            const actionInfo = actionTypeLabels[action.action_type] || { label: action.action_type, color: 'text-zed-foreground-secondary' }
                            return (
                              <tr key={action.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${actionInfo.color}`}>{actionInfo.label}</span>
                                </td>
                                <td className="p-4 text-xs font-mono text-zed-foreground-secondary">{action.target_id?.slice(0, 8)}...</td>
                                <td className="p-4 text-xs text-zed-foreground-secondary max-w-[200px] truncate">{action.note || '—'}</td>
                                <td className="p-4 text-xs text-zed-foreground-secondary">{new Date(action.created_at).toLocaleDateString()}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
  )
}
