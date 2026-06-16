'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { notificationSounds } from '@/lib/notificationSounds'

const DISMISS_KEY = 'notif_prompt_dismissed'

export function NotificationPrompt() {
  const { profile, loading: authLoading } = useAuth()
  const [show, setShow] = useState(false)
  const [enabling, setEnabling] = useState(false)

  useEffect(() => {
    if (authLoading || !profile) return

    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed === 'true') return
    if (Notification.permission === 'granted') return
    if (Notification.permission === 'denied') return

    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [profile, authLoading])

  useEffect(() => {
    if (show) notificationSounds.preload()
  }, [show])

  const handleEnable = async () => {
    setEnabling(true)
    try {
      if (!('Notification' in window)) {
        setShow(false)
        return
      }
      const perm = await Notification.requestPermission()
      if (perm === 'granted') {
        localStorage.removeItem(DISMISS_KEY)
      } else {
        localStorage.setItem(DISMISS_KEY, 'true')
      }
    } catch {} finally {
      setEnabling(false)
      setShow(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setShow(false)
  }

  const handleLater = () => {
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 w-80"
        >
          <div className="glass-premium rounded-2xl border border-white/10 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zed-gradient-primary flex items-center justify-center shadow-lg">
                  <Bell size={18} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Stay in the Loop</h4>
                  <p className="text-[10px] text-white/40">Get notified about Arena activity</p>
                </div>
              </div>
              <button onClick={handleDismiss} className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all">
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-white/60 mb-4 leading-relaxed">
              Enable push notifications to receive updates about your ideas, votes, messages, and more — even when the app is closed.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleEnable}
                disabled={enabling}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zed-gradient-primary text-white text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {enabling ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
                {enabling ? 'Enabling...' : 'Enable Notifications'}
              </button>
              <button
                onClick={handleLater}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-xs font-bold hover:bg-white/10 transition-all"
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
