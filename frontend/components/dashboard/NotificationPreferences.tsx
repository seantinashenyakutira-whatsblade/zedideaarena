'use client'

import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

export function NotificationPreferences() {
  const [loading, setLoading] = useState(false)

  if (!ONESIGNAL_APP_ID) return null

  const toggleBrowserNotifications = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      toast.error('Push notifications not supported in this browser')
      return
    }

    if (Notification.permission === 'denied') {
      toast.error('Notifications blocked. Enable them in your browser settings.')
      return
    }

    if (Notification.permission === 'granted') {
      toast.success('Notifications already enabled')
      return
    }

    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast.success('Push notifications enabled!')
      } else {
        toast.error('Notification permission denied')
      }
    } catch {
      toast.error('Failed to enable notifications')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card-zed p-8 border-white/5 bg-white/5">
      <h3 className="text-xl font-black text-zed-foreground mb-8 flex items-center gap-3">
        <Bell className="text-zed-primary" size={24} /> Push Notifications
      </h3>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
          <div>
            <h4 className="text-sm font-black text-zed-foreground mb-1">Browser Push Notifications</h4>
            <p className="text-xs text-zed-foreground-secondary">Get notified about likes, comments, messages, and Arena updates</p>
          </div>
          <button
            onClick={toggleBrowserNotifications}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : Notification?.permission === 'granted' ? (
              <Bell size={14} />
            ) : (
              <BellOff size={14} />
            )}
            {Notification?.permission === 'granted' ? 'Enabled' : 'Enable'}
          </button>
        </div>

        {Notification?.permission === 'granted' && (
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <h4 className="text-sm font-black text-zed-foreground mb-2">You will receive notifications for:</h4>
            <ul className="space-y-1.5 text-xs text-zed-foreground-secondary">
              <li className="flex items-center gap-2">• Likes and comments on your posts</li>
              <li className="flex items-center gap-2">• New chat messages from admin</li>
              <li className="flex items-center gap-2">• Competition updates and new ideas</li>
              <li className="flex items-center gap-2">• Account confirmations and alerts</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
