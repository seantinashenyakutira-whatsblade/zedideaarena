'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, AlertTriangle, BookOpen } from 'lucide-react'
import api from '@/lib/api'

export default function ArenaRulesPage() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/arena/rules').then((res: any) => {
      setRules(res?.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(rules.map(r => r.category))]

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/arena" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Arena
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-zed-primary/10 flex items-center justify-center">
            <Shield size={20} className="text-zed-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Arena Rules</h1>
            <p className="text-sm text-white/50">Guidelines for keeping the community healthy</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-zed-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat} className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
                <BookOpen size={14} /> {cat === 'conduct' ? 'Code of Conduct' : 'Posting Guidelines'}
              </h2>
              <div className="space-y-3">
                {rules.filter(r => r.category === cat).map(rule => (
                  <div key={rule.id} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-sm">{rule.title}</h3>
                      {rule.consequence && rule.consequence !== 'N/A - Reporting is encouraged' && (
                        <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-red-400/80 bg-red-500/10 px-2.5 py-1 rounded-full">
                          <AlertTriangle size={10} /> {rule.consequence}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50 mt-2 leading-relaxed">{rule.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="mt-12 p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
          <p className="text-sm text-white/50">Violating these rules may result in content removal, temporary mute, or permanent ban at the discretion of the moderation team.</p>
        </div>
      </div>
    </div>
  )
}
