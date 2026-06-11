'use client'

import { ArrowRight, Mail, Lock, User, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { authService } from '@/services/auth'
import { routes } from '@/lib/routes'
import { signupSchema } from '@/lib/validators/signup'

export default function SignupPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    const result = signupSchema.safeParse({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
    })
    if (!result.success) {
      const fields: Record<string, string> = {}
      result.error.errors.forEach(err => { fields[err.path[0] as string] = err.message })
      setFieldErrors(fields)
      return
    }

    setLoading(true)
    try {
      await authService.signup(result.data)
      window.location.replace(`${routes.login}?signup=success`)
    } catch (err: any) {
      setError(err?.message || 'Failed to create account.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      await authService.signInWithGoogle()
    } catch (err: any) {
      setError(err?.message || 'Google Auth failed.')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-6">
          <div className="flex items-center gap-3 justify-center">
            <Image src="/logo-icon.png" alt="ZedIdeaArena" width={36} height={36} className="object-contain" />
            <span className="font-extrabold text-xl gradient-text tracking-tight">ZedIdeaArena</span>
          </div>
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">Join the Arena</h1>
        <p className="text-white/40 text-sm">Start your journey to innovation and funding</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="p-8 rounded-3xl border border-white/10 backdrop-blur-xl"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3.5 top-3.5 text-white/30 group-focus-within:text-zed-primary transition-colors" size={18} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-3 pl-11 rounded-2xl text-sm bg-white/5 border border-white/10 outline-none transition-all focus:border-zed-primary/50 focus:bg-white/[0.07] text-white placeholder-white/20"
                required
              />
              {fieldErrors.fullName && <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.fullName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-3.5 text-white/30 group-focus-within:text-zed-primary transition-colors" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 pl-11 rounded-2xl text-sm bg-white/5 border border-white/10 outline-none transition-all focus:border-zed-primary/50 focus:bg-white/[0.07] text-white placeholder-white/20"
                required
              />
              {fieldErrors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3.5 text-white/30 group-focus-within:text-zed-primary transition-colors" size={18} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 pl-11 rounded-2xl text-sm bg-white/5 border border-white/10 outline-none transition-all focus:border-zed-primary/50 focus:bg-white/[0.07] text-white placeholder-white/20"
                required
              />
              {fieldErrors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.password}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3.5 text-white/30 group-focus-within:text-zed-primary transition-colors" size={18} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 pl-11 rounded-2xl text-sm bg-white/5 border border-white/10 outline-none transition-all focus:border-zed-primary/50 focus:bg-white/[0.07] text-white placeholder-white/20"
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 accent-zed-primary flex-shrink-0" required />
            <label htmlFor="terms" className="text-white/50 leading-relaxed">
              I agree to the <Link href="/docs/terms" className="font-bold hover:underline" style={{ color: '#6366F1' }}>Terms of Service</Link> and <Link href="/docs/privacy" className="font-bold hover:underline" style={{ color: '#6366F1' }}>Privacy Policy</Link>
            </label>
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
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
        <div className="relative flex justify-center text-sm z-10">
          <span className="px-4 text-white/30 font-medium text-[11px] uppercase tracking-widest" style={{ background: '#0A0A0F' }}>Or continue with</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-bold border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-all duration-200 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
      </motion.div>

      <p className="text-center text-sm text-white/40 mt-6">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-bold hover:underline" style={{ color: '#6366F1' }}>Sign In</Link>
      </p>
    </>
  )
}
