'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, CheckCheck, Loader2, Heart, MessageCircle, MessageSquare, Trophy, User, Megaphone, AlertCircle, X, ArrowUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { notificationSounds } from '@/lib/notificationSounds'
import api from '@/lib/api'

const typeIcons: Record<string, any> = {
  like: Heart,
  comment: MessageCircle,
  chat: MessageSquare,
  broadcast: Megaphone,
  competition: Trophy,
  system: AlertCircle,
  new_idea: Megaphone,
  new_user: User,
  payment: Trophy,
  report: AlertCircle,
  withdrawal: Trophy,
  idea_status: Trophy,
  verification: User,
  engagement: Heart,
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500',
  low: 'bg-amber-400',
}

export function NotificationBell() {
  const { profile } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const prefsRef = useRef<any>(null)
  const lastNotifIdRef = useRef<string | null>(null)

  const loadPrefs = useCallback(async () => {
    if (!profile?.id) return
    try {
      const res: any = await api.get('/notification-preferences')
      prefsRef.current = res.data
      notificationSounds.setEnabled(res.data?.sound_enabled !== false)
      notificationSounds.setVolume(0.7)
    } catch {}
  }, [profile?.id])

  useEffect(() => {
    notificationSounds.preload()
    loadPrefs()
  }, [loadPrefs])

  const fetchNotifications = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    try {
      const res: any = await api.get('/notifications')
      setNotifications(res.data || [])
      setUnread((res.data || []).filter((n: any) => !n.is_read).length)
    } catch {} finally { setLoading(false) }
  }, [profile?.id])

  useEffect(() => {
    if (!profile?.id) return
    fetchNotifications()

    const sub = supabase
      .channel(`notifications-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, (payload) => {
        const notif = payload.new as any
        if (lastNotifIdRef.current !== notif.id) {
          lastNotifIdRef.current = notif.id
          setNotifications(prev => [notif, ...prev].slice(0, 50))
          setUnread(prev => prev + 1)
          setShakeKey(k => k + 1)
          playNotificationSound(notif)
        }
      })
      .subscribe()

    return () => { sub.unsubscribe() }
  }, [profile?.id, fetchNotifications])

  const playNotificationSound = (notif: any) => {
    const cat = notif.category
    const prefs = prefsRef.current
    const soundName = prefs?.sound_name || 'chime'
    const catPrefs = cat && prefs?.categories?.[cat]

    if (prefs?.sound_enabled === false) return
    if (catPrefs?.sound === false) return

    notificationSounds.play(soundName)
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnread(0)
    } catch {}
  }

  const handleClick = (n: any) => {
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  if (!profile) return null

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="btn-icon relative">
        <motion.div
          key={shakeKey}
          animate={{ rotate: [0, 8, -8, 8, -8, 0] }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <Bell size={20} />
        </motion.div>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[8px] font-black flex items-center justify-center text-white shadow-lg">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-3 w-80 glass-premium border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Notifications</h3>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-white/30" /></div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-xs space-y-2">
                  <Bell size={24} className="mx-auto opacity-50" />
                  <p className="font-bold">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const TypeIcon = typeIcons[n.type] || Bell
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-white/[0.04] transition-colors border-b border-white/[0.02] last:border-0 ${!n.is_read ? 'bg-indigo-500/[0.04]' : ''}`}
                    >
                      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${!n.is_read ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/40'}`}>
                        <TypeIcon size={14} />
                        {n.priority === 'high' && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs ${!n.is_read ? 'font-bold text-white' : 'text-white/70'}`}>{n.title}</p>
                        {n.message && <p className="text-[11px] text-white/40 truncate mt-0.5">{n.message}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[9px] text-white/20">
                            {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {n.priority === 'high' && (
                            <span className="text-[8px] font-bold text-red-400 uppercase">High</span>
                          )}
                        </div>
                      </div>
                      {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2" />}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
