'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Users, FileText, Trophy, Vote, DollarSign, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import api from '@/lib/api'
import { adminService } from '@/services/core'
import Link from 'next/link'

export default function AdminOverview() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [auditLog, setAuditLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
    { label: 'Total Users', value: stats?.users ?? '—', icon: Users, color: 'text-zed-primary', href: '/admin/users' },
    { label: 'Total Ideas', value: stats?.ideas ?? '—', icon: FileText, color: 'text-zed-accent', href: '/admin/ideas' },
    { label: 'Competitions', value: stats?.competitions ?? '—', icon: Trophy, color: 'text-yellow-500', href: '/admin/competitions' },
    { label: 'Total Votes', value: stats?.votes ?? '—', icon: Vote, color: 'text-green-400', href: '/admin/analytics' },
    { label: 'Prize Pool', value: `$${((stats?.totalPrizePoolCents ?? 0) / 100).toLocaleString()}`, icon: DollarSign, color: 'text-purple-400', href: '/admin/analytics' },
    { label: 'Paid Ideas', value: stats?.paidIdeas ?? '—', icon: ShieldCheck, color: 'text-zed-success', href: '/admin/ideas' },
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
                  <Link href="/admin/analytics" className="btn-primary flex items-center gap-2">
                    Analytics <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin opacity-30" /></div>
              ) : (
                <>
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
