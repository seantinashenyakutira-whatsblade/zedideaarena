'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, ExternalLink, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface ContestantProfileCardProps {
  userId: string
  className?: string
}

export function ContestantProfileCard({ userId, className = '' }: ContestantProfileCardProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const fetchUser = async () => {
      try {
        const res = await api.get(`/user/profile/${userId}`)
        setUser(res.data)
      } catch { /* ignore */ }
      setLoading(false)
    }
    fetchUser()
  }, [userId])

  if (loading) {
    return (
      <div className={`flex items-center gap-3 p-4 ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-white/5 rounded animate-pulse mb-1" />
          <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <Link
      href={`/dashboard/contestant/${userId}`}
      className={`flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-zed-gradient-primary overflow-hidden shadow-lg flex-shrink-0">
        {user.picture ? (
          <img src={user.picture} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40">
            <Users size={24} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-black text-zed-foreground text-sm truncate group-hover:text-zed-primary transition-colors">
          {user.full_name || 'Arena Innovator'}
        </h4>
        <p className="text-[10px] text-zed-primary font-black uppercase tracking-widest">
          {user.role || 'Contestant'}
        </p>
      </div>
      <ExternalLink size={14} className="text-white/20 group-hover:text-zed-primary transition-colors flex-shrink-0" />
    </Link>
  )
}
