'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle, Loader2, Trophy, Vote, DollarSign, Globe, TrendingUp, Users, Download } from 'lucide-react'
import { adminService } from '@/services/core'
import Link from 'next/link'
import api from '@/lib/api'

export default function AdminAnalytics() {
  const { profile } = useAuth()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.is_admin && profile?.role !== 'admin') return

    const fetchAnalytics = async () => {
      try {
        const res = await adminService.getAnalytics()
        setAnalytics(res.data)
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [profile])

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

  const revenue = ((analytics?.revenueEstimateCents ?? 0) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
          <div className="max-w-7xl mx-auto">
              <div className="mb-12">
                <h1 className="text-4xl font-black text-zed-foreground">Analytics</h1>
                <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mt-1">System-wide metrics and breakdowns</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-6">
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/admin/export/ideas`}
                  onClick={(e) => { e.preventDefault(); window.open(`${api.defaults.baseURL}/admin/export/ideas`, '_blank'); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Download size={12} /> Export Ideas CSV
                </a>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/admin/export/users`}
                  onClick={(e) => { e.preventDefault(); window.open(`${api.defaults.baseURL}/admin/export/users`, '_blank'); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Download size={12} /> Export Users CSV
                </a>
                {analytics?.competitions?.map((comp: any) => (
                  <a
                    key={comp.id}
                    href={`${api.defaults.baseURL}/admin/export/competitions/${comp.id}`}
                    onClick={(e) => { e.preventDefault(); window.open(`${api.defaults.baseURL}/admin/export/competitions/${comp.id}`, '_blank'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Download size={12} /> {comp.title?.slice(0, 20)} Results
                  </a>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin opacity-30" /></div>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="card-zed p-6 border-white/5 bg-white/5">
                      <div className="flex justify-between items-start mb-4">
                        <TrendingUp size={28} className="text-zed-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Revenue Estimate</span>
                      </div>
                      <p className="text-3xl font-black">{revenue}</p>
                      <p className="text-[10px] text-zed-foreground-secondary mt-1">Based on prize pool × {analytics?.totalCompetitions ?? 0} competitions</p>
                    </div>
                    <div className="card-zed p-6 border-white/5 bg-white/5">
                      <div className="flex justify-between items-start mb-4">
                        <Globe size={28} className="text-zed-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Countries</span>
                      </div>
                      <p className="text-3xl font-black">{analytics?.geographicBreakdown?.length ?? 0}</p>
                      <p className="text-[10px] text-zed-foreground-secondary mt-1">Unique countries represented</p>
                    </div>
                    <div className="card-zed p-6 border-white/5 bg-white/5">
                      <div className="flex justify-between items-start mb-4">
                        <Users size={28} className="text-zed-success" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">Competitions</span>
                      </div>
                      <p className="text-3xl font-black">{analytics?.totalCompetitions ?? 0}</p>
                      <p className="text-[10px] text-zed-foreground-secondary mt-1">Active competitions</p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="card-zed overflow-hidden border-white/5">
                      <div className="p-6 border-b border-white/5 flex items-center gap-3">
                        <Trophy size={20} className="text-yellow-500" />
                        <h3 className="text-lg font-black uppercase tracking-widest">Entries & Votes per Competition</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-white/5 text-left text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">
                              <th className="p-4">Competition</th>
                              <th className="p-4 text-center">Entries</th>
                              <th className="p-4 text-center">Votes</th>
                              <th className="p-4 text-right">Prize Pool</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {analytics?.competitions?.length === 0 ? (
                              <tr><td colSpan={4} className="p-8 text-center text-zed-foreground-secondary text-sm">No competition data</td></tr>
                            ) : analytics?.competitions?.map((comp: any) => (
                              <tr key={comp.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-sm">{comp.title}</td>
                                <td className="p-4 text-center">
                                  <span className="text-xs font-bold text-zed-accent">{comp.entries}</span>
                                </td>
                                <td className="p-4 text-center">
                                  <span className="text-xs font-bold text-green-400">{comp.votes}</span>
                                </td>
                                <td className="p-4 text-right text-xs text-zed-foreground-secondary">
                                  ${(comp.prize_pool_cents / 100).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="card-zed overflow-hidden border-white/5">
                      <div className="p-6 border-b border-white/5 flex items-center gap-3">
                        <Globe size={20} className="text-zed-accent" />
                        <h3 className="text-lg font-black uppercase tracking-widest">Geographic Breakdown</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-white/5 text-left text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">
                              <th className="p-4">Country</th>
                              <th className="p-4 text-right">Users</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {analytics?.geographicBreakdown?.length === 0 ? (
                              <tr><td colSpan={2} className="p-8 text-center text-zed-foreground-secondary text-sm">No geographic data</td></tr>
                            ) : analytics?.geographicBreakdown?.map((item: any) => (
                              <tr key={item.country} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-sm">{item.country}</td>
                                <td className="p-4 text-right text-xs font-bold text-zed-primary">{item.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
  )
}
