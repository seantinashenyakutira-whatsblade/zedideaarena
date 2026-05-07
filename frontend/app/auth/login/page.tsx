'use client'

import { ArrowRight, Mail, Lock, Github } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { authService } from '@/services/auth'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await authService.login(formData)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Login failed')
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await authService.signInWithGoogle()
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err?.message || 'Google Auth failed.')
      setLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    try {
      setLoading(true)
      await authService.signInWithGithub()
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err?.message || 'GitHub Auth failed.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zed-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-zed-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center gap-3 justify-center floating">
              <img src="/logo-icon.png" alt="ZedIdeaArena" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
              <span className="font-bold text-2xl gradient-text tracking-tighter">ZedIdeaArena</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-zed-foreground mb-2">Welcome Back</h1>
          <p className="text-zed-foreground-secondary">Sign in to your account to continue</p>
        </div>

        {/* Form Card */}
        <div className="card-zed mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zed-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-zed pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-zed-foreground">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-zed-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-zed pl-10"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe" className="text-sm text-zed-foreground-secondary">
                Remember me
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={20} />
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zed-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zed-background text-zed-foreground-secondary">Or continue with</span>
          </div>
        </div>

        {/* Social Auth */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            type="button"
            onClick={handleGithubSignIn}
            disabled={loading}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Github size={20} />
            <span className="hidden sm:inline">GitHub</span>
          </button>
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="hidden sm:inline">Google</span>
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-zed-foreground-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-zed-primary hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
