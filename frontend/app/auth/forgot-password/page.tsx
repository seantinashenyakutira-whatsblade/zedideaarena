'use client'

import { ArrowRight, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { authService } from '@/services/auth'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = emailSchema.safeParse({ email })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Reset Password</h1>
        <p className="text-white/40 text-sm">
          {sent ? 'Check your inbox' : "Enter your email and we'll send you a reset link"}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="p-8 rounded-3xl border border-white/10 backdrop-blur-xl"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        {sent ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white mb-2">Email Sent</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                If an account exists for <span className="text-white/80 font-semibold">{email}</span>,
                you'll receive a password reset link shortly.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-zed-primary hover:underline"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3.5 text-white/30 group-focus-within:text-zed-primary transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 pl-11 rounded-2xl text-sm bg-white/5 border border-white/10 outline-none transition-all focus:border-zed-primary/50 focus:bg-white/[0.07] text-white placeholder-white/20"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={18} />
            </button>
          </form>
        )}
      </motion.div>

      <p className="text-center text-sm text-white/40 mt-6">
        Remember your password?{' '}
        <Link href="/auth/login" className="font-bold hover:underline" style={{ color: '#6366F1' }}>Sign In</Link>
      </p>
    </>
  )
}
