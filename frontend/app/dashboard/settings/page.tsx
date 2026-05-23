'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth'
import { User, Mail, Shield, LogOut, Save, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function SettingsPage() {
  const { profile, logout, refreshProfile } = useAuth()
  const [loadingRole, setLoadingRole] = useState(false)

  const handleRoleChange = async (newRole: string) => {
    if (profile?.current_mode === newRole) return
    setLoadingRole(true)
    try {
      await api.patch('/user/profile', { current_mode: newRole })
      toast.success(`Mode switched to ${newRole}`)
      refreshProfile()
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || 'Failed to switch mode'
      toast.error(msg)
    } finally {
      setLoadingRole(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-zed-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-8 bg-zed-background-alt">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-black text-zed-foreground mb-12">Account Settings</h1>

              <div className="grid gap-8">
                <section className="card-zed p-8 border-white/5 bg-white/5">
                  <h3 className="text-xl font-black text-zed-foreground mb-8 flex items-center gap-3">
                    <User className="text-zed-primary" size={24} /> Profile Information
                  </h3>

                  <div className="flex flex-col md:flex-row gap-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-32 h-32 rounded-3xl bg-zed-gradient-primary relative group overflow-hidden shadow-2xl">
                        {profile?.picture ? (
                          <img src={profile.picture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <User size={48} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={18} />
                            <input type="text" defaultValue={profile?.full_name || profile?.fullName} className="input-zed pl-10" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={18} />
                            <input type="email" value={profile?.email} disabled className="input-zed pl-10 opacity-50 cursor-not-allowed" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Address</label>
                        <input
                          type="text"
                          defaultValue={profile?.address || ''}
                          onBlur={async (e) => {
                            try {
                              await authService.updateProfile({ address: e.target.value })
                              refreshProfile()
                            } catch { /* silent */ }
                          }}
                          className="input-zed"
                          placeholder="e.g. 123 Independence Ave, Lusaka"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">City / Town</label>
                          <input
                            type="text"
                            defaultValue={profile?.city || ''}
                            onBlur={async (e) => {
                              try {
                                await authService.updateProfile({ city: e.target.value })
                                refreshProfile()
                              } catch { /* silent */ }
                            }}
                            className="input-zed"
                            placeholder="e.g. Lusaka"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Country</label>
                          <select
                            defaultValue={profile?.country || ''}
                            onChange={async (e) => {
                              try {
                                await authService.updateProfile({ country: e.target.value })
                                refreshProfile()
                              } catch { /* silent */ }
                            }}
                            className="input-zed"
                          >
                            <option value="">Select country</option>
                            <option value="Zambia">Zambia</option>
                            <option value="Zimbabwe">Zimbabwe</option>
                            <option value="South Africa">South Africa</option>
                            <option value="Nigeria">Nigeria</option>
                            <option value="Kenya">Kenya</option>
                            <option value="Tanzania">Tanzania</option>
                            <option value="Ghana">Ghana</option>
                            <option value="Ethiopia">Ethiopia</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <button className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 text-xs font-black">
                        <Save size={18} /> Save Changes
                      </button>
                    </div>
                  </div>
                </section>

                <section className="card-zed p-8 border-white/5 bg-white/5">
                  <h3 className="text-xl font-black text-zed-foreground mb-8 flex items-center gap-3">
                    <Shield className="text-zed-accent" size={24} /> Arena Role
                  </h3>

                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 gap-6">
                    <div>
                      <h4 className="text-sm font-black text-zed-foreground mb-1">Active Arena Role</h4>
                      <p className="text-xs text-zed-foreground-secondary mb-4">Switch between pitching your ideas or voting on others.</p>
                      <div className="flex items-center gap-4">
                        <button
                          disabled={loadingRole}
                          onClick={() => handleRoleChange('contestant')}
                          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${profile?.current_mode === 'contestant' ? 'bg-zed-primary text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-zed-foreground-secondary hover:bg-white/10'}`}
                        >
                          {loadingRole && profile?.current_mode !== 'contestant' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                          Contestant
                        </button>
                        <button
                          disabled={loadingRole}
                          onClick={() => handleRoleChange('voter')}
                          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${profile?.current_mode === 'voter' ? 'bg-zed-accent text-white shadow-lg shadow-pink-500/20' : 'bg-white/5 text-zed-foreground-secondary hover:bg-white/10'}`}
                        >
                          {loadingRole && profile?.current_mode !== 'voter' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                          Voter
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="card-zed p-8 border-red-500/10 bg-red-500/5">
                  <h3 className="text-xl font-black text-red-500 mb-8 flex items-center gap-3">
                    <LogOut size={24} /> Session Management
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-zed-foreground mb-1">Exit the Arena</h4>
                      <p className="text-xs text-zed-foreground-secondary">Logging out will clear your active session.</p>
                    </div>
                    <button onClick={logout} className="px-6 py-3 bg-red-500 text-white rounded-xl text-xs font-black shadow-lg shadow-red-500/20">
                      Logout
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
