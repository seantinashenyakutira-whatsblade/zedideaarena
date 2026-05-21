'use client'

import { ArrowRight, Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { authService } from '@/services/auth'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await authService.signup(formData)
      router.push('/auth/login?signup=success')
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
    <div className="min-h-screen bg-zed-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-zed-fade-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center gap-3 justify-center floating">
              <img src="/logo-icon.png" alt="ZedIdeaArena" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
              <span className="font-bold text-2xl gradient-text tracking-tighter">ZedIdeaArena</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-zed-foreground mb-2">Join the Arena</h1>
          <p className="text-zed-foreground-secondary">Start your journey to innovation and funding</p>
        </div>

        <div className="card-zed mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zed-foreground mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={20} />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Your full name" className="input-zed pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zed-foreground mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={20} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="input-zed pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zed-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={20} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" className="input-zed pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zed-foreground mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={20} />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" className="input-zed pl-10" required />
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <input type="checkbox" id="terms" className="mt-1" required />
              <label htmlFor="terms" className="text-zed-foreground-secondary">
                I agree to the <Link href="/docs/terms" className="text-zed-primary hover:underline">Terms of Service</Link> and <Link href="/docs/privacy" className="text-zed-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-6 click-push glow-primary">
              {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={20} />
            </button>
          </form>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zed-border" /></div>
          <div className="relative flex justify-center text-sm z-10">
            <span className="px-4 bg-zed-background text-zed-foreground-secondary font-bold uppercase tracking-wider text-[10px]">Or continue with</span>
          </div>
        </div>

        <div className="mb-6 relative z-10">
          <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="btn-secondary w-full flex items-center justify-center gap-3 click-push glass-premium hover:bg-white/5 border border-white/5 py-3">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-bold">Google</span>
          </button>
        </div>

        <p className="text-center text-zed-foreground-secondary">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-zed-primary hover:underline font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
