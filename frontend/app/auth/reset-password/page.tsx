'use client'

import { ArrowRight, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { authService } from '@/services/auth'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace('#', ''))
      const token = params.get('access_token')
      if (token) {
        setRecoveryToken(token)
        supabase.auth.setSession({
          access_token: token,
          refresh_token: params.get('refresh_token') || '',
        }).then(() => setInitializing(false)).catch(() => setInitializing(false))
        return
      }
    }
    setInitializing(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = passwordSchema.safeParse({ password, confirmPassword })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(password)
      setDone(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (initializing) {
    return (
      <>
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="animate-spin text-zed-primary" size={32} />
        </div>
      </>
    )
  }

  if (!recoveryToken) {
    return (
      <>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Invalid Link</h1>
          <p className="text-white/40 text-sm">This password reset link is invalid or expired.</p>
        </div>
        <p className="text-center text-sm text-white/40 mt-6">
          <Link href="/auth/forgot-password" className="font-bold hover:underline" style={{ color: '#6366F1' }}>
            Request a new reset link
          </Link>
        </p>
      </>
    )
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Set New Password</h1>
        <p className="text-white/40 text-sm">
          {done ? 'Password updated' : 'Enter your new password below'}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="p-8 rounded-3xl border border-white/10 backdrop-blur-xl"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        {done ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white mb-2">Password Updated</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Your password has been reset successfully.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-zed-primary hover:underline"
            >
              <ArrowLeft size={14} /> Sign In with New Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 text-white/30 group-focus-within:text-zed-primary transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 pl-11 pr-11 rounded-2xl text-sm bg-white/5 border border-white/10 outline-none transition-all focus:border-zed-primary/50 focus:bg-white/[0.07] text-white placeholder-white/20"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 text-white/30 group-focus-within:text-zed-primary transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 pl-11 rounded-2xl text-sm bg-white/5 border border-white/10 outline-none transition-all focus:border-zed-primary/50 focus:bg-white/[0.07] text-white placeholder-white/20"
                  required
                  minLength={6}
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
              {loading ? 'Updating...' : 'Reset Password'} <ArrowRight size={18} />
            </button>
          </form>
        )}
      </motion.div>

      <p className="text-center text-sm text-white/40 mt-6">
        <Link href="/auth/login" className="font-bold hover:underline" style={{ color: '#6366F1' }}>
          Back to Sign In
        </Link>
      </p>
    </>
  )
}
