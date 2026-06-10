'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, Lightbulb, User, Vote, CheckCircle, Wallet, Settings, LogOut, Menu, X, AlertTriangle, Lock, Shield, Users, FileText, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const contestantNav = [
  { href: '/dashboard', icon: Home, label: 'Overview' },
  { href: '/dashboard/competitions', icon: Trophy, label: 'My Competitions' },
  { href: '/dashboard/ideas', icon: Lightbulb, label: 'My Ideas' },
  { href: '/dashboard/settings', icon: User, label: 'My Profile' },
]

const voterNav = [
  { href: '/dashboard/voter', icon: Home, label: 'Overview' },
  { href: '/dashboard/voting', icon: Vote, label: 'Vote' },
  { href: '/dashboard/voter', icon: CheckCircle, label: 'My Votes' },
  { href: '/dashboard/earnings', icon: Wallet, label: 'Earnings' },
  { href: '/dashboard/settings', icon: User, label: 'My Profile' },
]

const adminNav = [
  { href: '/dashboard/admin', icon: Shield, label: 'Overview' },
  { href: '/dashboard/admin/users', icon: Users, label: 'Users' },
  { href: '/dashboard/admin/ideas', icon: FileText, label: 'Ideas' },
  { href: '/dashboard/admin/analytics', icon: BarChart3, label: 'Analytics' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [pendingRole, setPendingRole] = useState<string | null>(null)
  const { profile, currentRole, setCurrentRole, refreshProfile, logout } = useAuth()

  const navItems = profile?.is_admin ? adminNav : (currentRole === 'voter' ? voterNav : contestantNav)

  const handleRoleChange = async (newRole: string) => {
    if (profile?.current_mode === newRole) return

    if (newRole === 'voter' && !profile?.is_verified) {
      setShowVerifyModal(true)
      return
    }

    setPendingRole(newRole)
    setShowPasswordModal(true)
    setPassword('')
    setPasswordError(null)
  }

  const handleConfirmSwitch = async () => {
    if (!pendingRole) return
    if (!password) {
      setPasswordError('Password is required')
      return
    }

    setConfirmLoading(true)
    setPasswordError(null)

    try {
      const email = profile?.email || profile?.fullName
      if (!email) {
        setPasswordError('Could not verify identity. Try logging out and back in.')
        setConfirmLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setPasswordError('Incorrect password. Please try again.')
        setConfirmLoading(false)
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ current_mode: pendingRole }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to switch mode')
      }

      setCurrentRole(pendingRole)
      setShowPasswordModal(false)
      setPassword('')
      toast.success(`Switched to ${pendingRole} mode`)

      window.location.href = '/dashboard'
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong. Please try again.'
      setPasswordError(msg)
      toast.error(msg)
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden btn-icon fixed top-4 left-4 z-50">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`fixed top-0 left-0 h-screen w-64 glass-premium border-r border-white/5 transition-all duration-300 z-40 md:relative md:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0 overflow-auto' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5 mt-12 md:mt-0">
          <img src="/logo-icon.png" alt="ZedIdeaArena Icon" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
          <span className="font-black text-xl gradient-text tracking-tighter uppercase">ZedArena</span>
        </div>

        {!profile?.is_admin && (
          <div className="px-4 py-4 border-b border-white/5">
            <p className="text-[9px] font-bold text-zed-foreground-secondary uppercase tracking-widest mb-2 px-2">Arena Mode</p>
            <div className="flex bg-white/5 rounded-full p-0.5 border border-white/10">
              <button
                onClick={() => handleRoleChange('contestant')}
                className={`flex-1 px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${
                  currentRole === 'contestant' ? 'bg-zed-primary text-white shadow-lg shadow-indigo-500/20' : 'text-zed-foreground-secondary hover:text-zed-foreground'
                }`}
              >
                Contestant
              </button>
              <button
                onClick={() => handleRoleChange('voter')}
                className={`flex-1 px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${
                  currentRole === 'voter' ? 'bg-zed-accent text-white shadow-lg shadow-pink-500/20' : 'text-zed-foreground-secondary hover:text-zed-foreground'
                }`}
              >
                Voter
              </button>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 click-push ${
                  isActive
                    ? 'bg-zed-primary text-white shadow-[0_4px_15px_rgba(79,70,229,0.4)] border border-white/10'
                    : 'text-zed-foreground-secondary hover:bg-white/5 hover:text-zed-foreground'
                }`}
              >
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''} />
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-zed-foreground-secondary hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Exit Arena</span>
          </button>
        </div>
      </aside>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowPasswordModal(false); setPasswordError(null) }}>
          <div className="bg-[#0A0A0F] border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-zed-primary/20 flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-zed-primary" />
            </div>
            <h3 className="text-xl font-black text-zed-foreground mb-2">
              Switch to {pendingRole === 'voter' ? 'Voter' : 'Contestant'} Mode?
            </h3>
            <p className="text-sm text-zed-foreground-secondary mb-6">
              Confirm your password to switch modes.
            </p>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-zed mb-4"
              onKeyDown={e => e.key === 'Enter' && handleConfirmSwitch()}
            />
            {passwordError && (
              <p className="text-red-400 text-sm mb-3">{passwordError}</p>
            )}
            <button
              onClick={handleConfirmSwitch}
              disabled={confirmLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {confirmLoading ? 'Confirming...' : 'Confirm Switch'}
            </button>
            <button
              onClick={() => { setShowPasswordModal(false); setPasswordError(null); setPassword('') }}
              className="w-full mt-2 text-zed-foreground-secondary text-sm font-bold py-2 hover:text-zed-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Verification Required Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowVerifyModal(false)}>
          <div className="bg-zed-surface border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-yellow-500" />
            </div>
            <h3 className="text-xl font-black text-zed-foreground mb-3">Verification Required</h3>
            <p className="text-sm text-zed-foreground-secondary mb-6">
              Voter access requires admin verification. Your account is currently under review. You&apos;ll be notified by email once approved.
            </p>
            <button
              onClick={() => setShowVerifyModal(false)}
              className="btn-primary px-8 py-3 text-xs font-black"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
