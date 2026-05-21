'use client'

import { Bell, Settings, User, ChevronDown, LogOut, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { toast } from 'sonner'

export function DashboardHeader() {
  const [showDropdown, setShowDropdown] = useState(false)
  const { profile, currentRole, setCurrentRole, logout, refreshProfile } = useAuth()

  const roles = [
    { id: 'contestant', label: 'Contestant', icon: User },
    { id: 'voter', label: 'Voter', icon: ShieldCheck },
  ]

  const handleRoleChange = async (newRole: string) => {
    if (profile?.role === newRole) return
    try {
      await api.post('/user/profile', { role: newRole })
      setCurrentRole(newRole)
      toast.success(`Switched to ${newRole} mode`)
      refreshProfile()
    } catch {
      toast.error('Failed to switch role')
    }
  }

  return (
    <header className="sticky top-0 right-0 h-16 border-b border-white/5 flex items-center justify-between px-6 glass-premium z-40">
      <div className="flex items-center gap-4">
        <div className="hidden md:flex bg-white/5 rounded-full p-1 border border-white/10">
          {roles.map((role) => {
            const Icon = role.icon
            const isActive = currentRole === role.id
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
      </div>

      <div className="flex items-center gap-4">
        <button className="btn-icon relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-zed-success rounded-full" />
        </button>

        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all click-push">
            <div className="w-8 h-8 rounded-lg bg-zed-gradient-primary shadow-[0_0_10px_rgba(79,70,229,0.5)] overflow-hidden">
              {profile?.picture ? <img src={profile.picture} alt="" className="w-full h-full object-cover" /> : null}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-sm font-black tracking-tight">{profile?.full_name || profile?.fullName || 'Arena User'}</span>
              <span className="text-[9px] text-zed-primary uppercase font-bold tracking-widest">{currentRole}</span>
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
                    <div className="text-[10px] text-zed-foreground-secondary uppercase tracking-widest">{profile?.role || 'Member'}</div>
                  </div>
                </div>

                <div className="md:hidden space-y-1 pb-2">
                  <p className="text-[9px] font-bold text-zed-foreground-secondary uppercase px-4 py-1">Switch Role</p>
                  {roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => { handleRoleChange(role.id); setShowDropdown(false) }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold rounded-xl ${currentRole === role.id ? 'bg-zed-primary/20 text-zed-primary' : 'hover:bg-white/5'}`}
                    >
                      {role.label}
                      {currentRole === role.id && <ShieldCheck size={12} />}
                    </button>
                  ))}
                  <div className="border-b border-white/10 my-2" />
                </div>

                <a href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-white/5 rounded-xl transition-all">
                  <Settings size={14} />
                  Arena Preferences
                </a>
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-red-500/10 rounded-xl transition-all text-red-400">
                  <LogOut size={14} />
                  Exit Arena
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
