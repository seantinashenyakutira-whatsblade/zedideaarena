'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

export default function UnsubscribePage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await api.post('/waitlist/unsubscribe', { email: email.trim() })
      setDone(true)
    } catch { } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <Link href="/" className="inline-flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zed-primary to-zed-accent flex items-center justify-center text-[10px] font-black">Z</div>
          <span className="font-extrabold text-lg tracking-tight gradient-text">ZedIdeaArena</span>
        </Link>

        {!done ? (
          <form onSubmit={handleSubmit} className="card-zed p-8 space-y-4">
            <h1 className="text-lg font-black text-white">Unsubscribe</h1>
            <p className="text-xs text-white/50">Enter your email to stop receiving updates from ZedIdeaArena.</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-zed"
              placeholder="your@email.com"
              required
            />
            <button type="submit" disabled={loading} className="btn-primary w-full text-xs font-black uppercase tracking-widest disabled:opacity-50">
              {loading ? <><Loader2 size={14} className="animate-spin inline" /> Processing...</> : 'Unsubscribe'}
            </button>
          </form>
        ) : (
          <div className="card-zed p-8 space-y-4">
            <CheckCircle2 size={40} className="text-green-400 mx-auto" />
            <h1 className="text-lg font-black text-white">Unsubscribed</h1>
            <p className="text-xs text-white/50">You've been removed from our mailing list. You can rejoin anytime.</p>
            <Link href="/" className="btn-secondary inline-flex text-xs font-black uppercase tracking-widest">Back to Home</Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
