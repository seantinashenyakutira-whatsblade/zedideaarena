'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Mail, Users, Share2, Copy, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      setMessage('Missing verification link. Check the link you received via email.')
      return
    }

    const verify = async () => {
      try {
        const res: any = await api.get(`/waitlist/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
        if (res?.verified) {
          setStatus('success')
          setMessage(res.message || 'Email verified!')
          if (res.referralCode) setReferralCode(res.referralCode)
        } else {
          setStatus('error')
          setMessage(res.message || 'Verification failed')
        }
      } catch (err: any) {
        setStatus('error')
        setMessage(err?.message || 'Verification failed. The link may have expired.')
      }
    }
    verify()
  }, [token, email])

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center px-4">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zed-primary to-zed-accent flex items-center justify-center text-[10px] font-black">Z</div>
        <span className="font-extrabold text-lg tracking-tight gradient-text">ZedIdeaArena</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center space-y-6"
      >
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 size={48} className="animate-spin text-zed-primary mx-auto" />
            <h1 className="text-xl font-black text-white">Verifying your email...</h1>
          </div>
        )}

        {status === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/30 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white">You're on the list!</h1>
              <p className="text-sm text-white/50">{message}</p>
            </div>

            {referralCode && (
              <div className="card-zed p-6 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Users size={16} className="text-zed-primary" />
                  <span className="text-sm font-bold text-white">Your Referral Code</span>
                </div>
                <div className="text-3xl font-black tracking-[0.2em] text-zed-primary">{referralCode}</div>
                <p className="text-xs text-white/50">Share this code with friends to move up the waitlist.</p>
                <button
                  type="button"
                  onClick={() => {
                    const url = `https://zedideaarena.com/waitlist?ref=${referralCode}`
                    navigator.clipboard.writeText(url)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                    toast.success('Link copied!')
                  }}
                  className="btn-secondary flex items-center gap-2 text-xs font-black uppercase tracking-widest mx-auto"
                >
                  <Copy size={14} /> {copied ? 'Copied!' : 'Copy Referral Link'}
                </button>
              </div>
            )}

            <Link href="/" className="btn-primary inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              Back to Home <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 border border-red-500/30 flex items-center justify-center">
                <XCircle size={40} className="text-red-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white">Verification failed</h1>
              <p className="text-sm text-white/50">{message}</p>
            </div>

            <div className="card-zed p-6 space-y-3">
              <p className="text-xs text-white/50">Try requesting a new verification email.</p>
              {email && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.post('/waitlist/resend-verification', { email })
                      toast.success('Verification email resent!')
                    } catch (err: any) {
                      toast.error(err?.message || 'Failed to resend')
                    }
                  }}
                  className="btn-secondary flex items-center gap-2 text-xs font-black uppercase tracking-widest mx-auto"
                >
                  <Mail size={14} /> Resend Verification
                </button>
              )}
            </div>

            <Link href="/waitlist" className="btn-primary inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              Join the Waitlist <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
