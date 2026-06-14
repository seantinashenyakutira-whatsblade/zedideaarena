'use client'

import { Settings, User, ChevronDown, LogOut, ShieldCheck, Lock, KeyRound } from 'lucide-react'
import { NotificationBell } from '@/components/NotificationBell'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getToken } from '@/services/auth'
import { supabase } from '@/lib/supabase'
import { routes } from '@/lib/routes'
import { toast } from 'sonner'

export function DashboardHeader() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [pendingRole, setPendingRole] = useState<string | null>(null)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [changePassword, setChangePassword] = useState({ current: '', newPass: '', confirm: '' })
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const { profile, currentRole, setCurrentRole, logout, refreshProfile } = useAuth()

  const roles = [
    { id: 'contestant', label: 'Contestant', icon: User },
    { id: 'voter', label: 'Voter', icon: ShieldCheck },
  ]

  const handleRoleChange = async (newRole: string) => {
    if (profile?.current_mode === newRole) return

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
      const email = profile?.email
      if (!email) {
        setPasswordError('Could not verify identity.')
        setConfirmLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setPasswordError('Incorrect password. Please try again.')
        setConfirmLoading(false)
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ current_mode: pendingRole }),
      })

      if (!res.ok) throw new Error('Failed to switch mode')

      setCurrentRole(pendingRole)
      setShowPasswordModal(false)
      setPassword('')
      setShowDropdown(false)
      toast.success(`Switched to ${pendingRole} mode`)
      window.location.href = pendingRole === 'voter' ? routes.vote : routes.hub
    } catch (err: any) {
      setPasswordError(err?.message || 'Something went wrong.')
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 right-0 h-16 border-b border-white/5 flex items-center justify-between px-6 glass-premium z-40">
        <div className="flex items-center gap-4">
          {!profile?.is_admin && (
            <div className="hidden md:flex bg-white/5 rounded-full p-1 border border-white/10">
              {roles.map((role) => {
                const Icon = role.icon
                const isActive = (profile?.current_mode || currentRole) === role.id
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleChange(role.id)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all ${isActive ? 'bg-zed-primary text-white shadow-[0_2px_10px_rgba(79,70,229,0.4)]' : 'text-zed-foreground-secondary hover:text-zed-foreground'}`}
                  >
                    <Icon size={12} />
                    {role.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />

          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all click-push">
              <div className="w-8 h-8 rounded-lg bg-zed-gradient-primary shadow-[0_0_10px_rgba(79,70,229,0.5)] overflow-hidden">
                {profile?.picture ? <img src={profile.picture} alt="" className="w-full h-full object-cover" /> : null}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-sm font-black tracking-tight">{profile?.full_name || profile?.fullName || 'Arena User'}</span>
                <span className="text-[9px] text-zed-primary uppercase font-bold tracking-widest">{profile?.current_mode || currentRole}</span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute top-full right-0 mt-3 w-56 glass-premium border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 animate-zed-fade-up">
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-lg bg-zed-gradient-primary overflow-hidden">
                      {profile?.picture ? <img src={profile.picture} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <div>
                      <div className="text-sm font-black text-zed-foreground truncate w-32">{profile?.full_name || profile?.fullName || 'Arena User'}</div>
                      <div className="text-[10px] text-zed-foreground-secondary uppercase tracking-widest">{profile?.current_mode || profile?.role || 'Member'}</div>
                    </div>
                  </div>

                  {!profile?.is_admin && (
                    <div className="md:hidden space-y-1 pb-2">
                      <p className="text-[9px] font-bold text-zed-foreground-secondary uppercase px-4 py-1">Switch Role</p>
                      {roles.map(role => (
                        <button
                          key={role.id}
                          onClick={() => { handleRoleChange(role.id) }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold rounded-xl ${(profile?.current_mode || currentRole) === role.id ? 'bg-zed-primary/20 text-zed-primary' : 'hover:bg-white/5'}`}
                        >
                          {role.label}
                          {(profile?.current_mode || currentRole) === role.id && <ShieldCheck size={12} />}
                        </button>
                      ))}
                      <div className="border-b border-white/10 my-2" />
                    </div>
                  )}

                  <a href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-white/5 rounded-xl transition-all">
                    <Settings size={14} />
                    Arena Preferences
                  </a>
                  <button onClick={() => { setShowChangePasswordModal(true); setShowDropdown(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-white/5 rounded-xl transition-all">
                    <KeyRound size={14} />
                    Change Password
                  </button>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-red-500/10 rounded-xl transition-all text-red-400">
                    <LogOut size={14} />
                    {profile?.is_admin ? 'Sign Out' : 'Exit Arena'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowChangePasswordModal(false); setChangePasswordError(null) }}>
          <div className="bg-[#0A0A0F] border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-zed-primary/20 flex items-center justify-center mx-auto mb-4">
              <KeyRound size={32} className="text-zed-primary" />
            </div>
            <h3 className="text-xl font-black text-zed-foreground mb-2 text-center">Change Password</h3>
            <p className="text-sm text-zed-foreground-secondary mb-6 text-center">Enter your current and new password.</p>

            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current password"
                value={changePassword.current}
                onChange={e => setChangePassword(p => ({ ...p, current: e.target.value }))}
                className="input-zed"
              />
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={changePassword.newPass}
                onChange={e => setChangePassword(p => ({ ...p, newPass: e.target.value }))}
                className="input-zed"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={changePassword.confirm}
                onChange={e => setChangePassword(p => ({ ...p, confirm: e.target.value }))}
                className="input-zed"
              />
            </div>

            {changePasswordError && (
              <p className="text-red-400 text-sm mt-4">{changePasswordError}</p>
            )}

            <button
              onClick={async () => {
                setChangePasswordError(null)
                if (!changePassword.current || !changePassword.newPass || !changePassword.confirm) {
                  setChangePasswordError('All fields are required')
                  return
                }
                if (changePassword.newPass.length < 6) {
                  setChangePasswordError('New password must be at least 6 characters')
                  return
                }
                if (changePassword.newPass !== changePassword.confirm) {
                  setChangePasswordError('New passwords do not match')
                  return
                }
                if (changePassword.current === changePassword.newPass) {
                  setChangePasswordError('New password must be different from current')
                  return
                }

                setChangePasswordLoading(true)
                try {
                  const email = profile?.email
                  if (!email) { setChangePasswordError('Could not verify identity.'); setChangePasswordLoading(false); return }

                  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: changePassword.current })
                  if (signInError) { setChangePasswordError('Current password is incorrect'); setChangePasswordLoading(false); return }

                  const { error: updateError } = await supabase.auth.updateUser({ password: changePassword.newPass })
                  if (updateError) { setChangePasswordError(updateError.message); setChangePasswordLoading(false); return }

                  setShowChangePasswordModal(false)
                  setChangePassword({ current: '', newPass: '', confirm: '' })
                  toast.success('Password changed successfully')
                } catch (err: any) {
                  setChangePasswordError(err?.message || 'Something went wrong')
                } finally {
                  setChangePasswordLoading(false)
                }
              }}
              disabled={changePasswordLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {changePasswordLoading ? 'Updating...' : 'Update Password'}
            </button>
            <button
              onClick={() => { setShowChangePasswordModal(false); setChangePasswordError(null); setChangePassword({ current: '', newPass: '', confirm: '' }) }}
              className="w-full mt-2 text-zed-foreground-secondary text-sm font-bold py-2 hover:text-zed-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
    </>
  )
}
