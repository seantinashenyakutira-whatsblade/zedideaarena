import { useState, useEffect, useCallback } from 'react'
import { Bell, Mic, Speaker, CheckCheck, Loader2, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { notificationSounds, SOUNDS } from '@/lib/notificationSounds'
import type { SoundName } from '@/lib/notificationSounds'

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

const CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
  idea_approved: { label: 'Idea Status', description: 'When your idea is approved, rejected, or updated' },
  verification: { label: 'Verification', description: 'Identity/voter verification status changes' },
  payments: { label: 'Payments', description: 'Payment confirmations and payout notifications' },
  arena_engagement: { label: 'Arena Engagement', description: 'Likes, comments, reposts on your content' },
  reports: { label: 'Reports', description: 'Updates on reports you submitted' },
  new_competitions: { label: 'New Competitions', description: 'When new competitions are announced' },
  messages: { label: 'Messages', description: 'New chat messages from admin and users' },
}

const ADMIN_CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
  admin_new_ideas: { label: 'New Ideas', description: 'When users submit new ideas' },
  admin_arena_engagement: { label: 'Arena Activity', description: 'General arena activity alerts' },
  admin_messages: { label: 'Support Messages', description: 'New user support messages' },
  admin_payments: { label: 'Payments', description: 'Payment received notifications' },
  admin_new_users: { label: 'New Users', description: 'New user registrations' },
  admin_reports: { label: 'Reports', description: 'New reports submitted by users' },
  admin_withdrawals: { label: 'Withdrawals', description: 'New withdrawal requests' },
}

const SOUND_NAMES: SoundName[] = ['chime', 'pop', 'alert', 'bell', 'ping']

export function NotificationPreferences() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [prefs, setPrefs] = useState<any>(null)
  const [testPlaying, setTestPlaying] = useState<string | null>(null)

  useEffect(() => {
    notificationSounds.preload()
  }, [])

  useEffect(() => {
    if (!profile?.id) return
    loadPrefs()
  }, [profile?.id])

  const loadPrefs = async () => {
    setLoading(true)
    try {
      const res: any = await api.get('/notification-preferences')
      setPrefs(res.data)
      if (res.data?.sound_enabled != null) notificationSounds.setEnabled(res.data.sound_enabled)
    } catch {
      setPrefs({
        push_enabled: true,
        sound_enabled: true,
        sound_name: 'chime',
        categories: {},
      })
    } finally {
      setLoading(false)
    }
  }

  const savePrefs = async (updates: any) => {
    setSaving(true)
    try {
      const res: any = await api.put('/notification-preferences', updates)
      setPrefs(res.data)
      if (updates.sound_enabled != null) notificationSounds.setEnabled(updates.sound_enabled)
      if (updates.volume != null) notificationSounds.setVolume(updates.volume)
      toast.success('Preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

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
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast.success('Push notifications enabled!')
      } else {
        toast.error('Notification permission denied')
      }
    } catch {
      toast.error('Failed to enable notifications')
    }
  }

  const toggleCategory = async (cat: string, field: 'push' | 'sound', value: boolean) => {
    const updated = {
      ...prefs.categories,
      [cat]: { ...(prefs.categories[cat] || { push: true, sound: true, priority: 'low' }), [field]: value },
    }
    setPrefs((p: any) => ({ ...p, categories: updated }))
    await savePrefs({ categories: updated })
  }

  const playTestSound = async (name: SoundName) => {
    setTestPlaying(name)
    notificationSounds.play(name)
    setTimeout(() => setTestPlaying(null), 500)
  }

  const isAdmin = profile?.is_admin || profile?.role === 'admin'
  const allCategories = {
    ...CATEGORY_LABELS,
    ...(isAdmin ? ADMIN_CATEGORY_LABELS : {}),
  }

  return (
    <section className="card-zed p-8 border-white/5 bg-white/5">
      <h3 className="text-xl font-black text-zed-foreground mb-8 flex items-center gap-3">
        <Bell className="text-zed-primary" size={24} /> Push Notifications
      </h3>

      <div className="flex flex-col gap-6">
        {/* Browser Permission */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
          <div>
            <h4 className="text-sm font-black text-zed-foreground mb-1">Browser Push Notifications</h4>
            <p className="text-xs text-zed-foreground-secondary">Get notified even when the app is closed</p>
          </div>
          <button
            onClick={toggleBrowserNotifications}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-zed-gradient-primary text-white text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
            {Notification?.permission === 'granted' ? 'Enabled' : Notification?.permission === 'denied' ? 'Blocked' : 'Enable'}
          </button>
        </div>

        {prefs && (
          <>
            {/* Notification Sound */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-zed-foreground mb-1 flex items-center gap-2">
                    <Speaker size={14} className="text-zed-primary" /> Notification Sound
                  </h4>
                  <p className="text-xs text-zed-foreground-secondary">Choose a sound and toggle it on/off</p>
                </div>
                <button
                  onClick={() => savePrefs({ sound_enabled: !prefs.sound_enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs.sound_enabled ? 'bg-zed-primary' : 'bg-white/10'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefs.sound_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {prefs.sound_enabled && (
                <div>
                  <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-2">Sound</label>
                  <div className="flex flex-wrap gap-2">
                    {SOUND_NAMES.map(name => (
                      <button
                        key={name}
                        onClick={() => savePrefs({ sound_name: name })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                          prefs.sound_name === name
                            ? 'bg-zed-primary/20 border-zed-primary/40 text-zed-primary'
                            : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                        }`}
                      >
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => playTestSound(prefs.sound_name || 'chime')}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    {testPlaying === (prefs.sound_name || 'chime') ? (
                      <Volume2 size={12} className="animate-pulse text-zed-primary" />
                    ) : (
                      <Volume2 size={12} />
                    )}
                    Test Sound
                  </button>
                </div>
              )}
            </div>

            {/* Category Toggles */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-zed-foreground mb-3">Notification Categories</h4>
              {Object.entries(allCategories).map(([cat, { label, description }]) => {
                const catPrefs = prefs.categories?.[cat] || { push: true, sound: true, priority: 'low' }
                return (
                  <div key={cat} className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-bold text-zed-foreground">{label}</span>
                        <span className={`ml-2 text-[9px] font-bold uppercase ${catPrefs.priority === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                          {catPrefs.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-[10px] text-white/40 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={catPrefs.push}
                            onChange={e => toggleCategory(cat, 'push', e.target.checked)}
                            className="w-3 h-3 rounded border-white/20 bg-white/5 text-zed-primary focus:ring-zed-primary/30"
                          />
                          Push
                        </label>
                        <label className="flex items-center gap-1.5 text-[10px] text-white/40 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={catPrefs.sound}
                            onChange={e => toggleCategory(cat, 'sound', e.target.checked)}
                            className="w-3 h-3 rounded border-white/20 bg-white/5 text-zed-primary focus:ring-zed-primary/30"
                          />
                          Sound
                        </label>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/30">{description}</p>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-white/30" />
          </div>
        )}
      </div>
    </section>
  )
}
