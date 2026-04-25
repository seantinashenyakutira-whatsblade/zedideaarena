'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Shield, LogOut, Camera, Save } from 'lucide-react'

export default function SettingsPage() {
  const { profile, logout } = useAuth()

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
                {/* Profile Section */}
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
                        <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Camera size={24} />
                        </button>
                      </div>
                      <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Change Photo</p>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={18} />
                            <input 
                              type="text" 
                              defaultValue={profile?.fullName} 
                              className="input-zed pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={18} />
                            <input 
                              type="email" 
                              value={profile?.email} 
                              disabled 
                              className="input-zed pl-10 opacity-50 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      <button className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 text-xs font-black">
                        <Save size={18} /> Save Changes
                      </button>
                    </div>
                  </div>
                </section>

                {/* Security Section */}
                <section className="card-zed p-8 border-white/5 bg-white/5">
                  <h3 className="text-xl font-black text-zed-foreground mb-8 flex items-center gap-3">
                    <Shield className="text-zed-accent" size={24} /> Security & Role
                  </h3>
                  
                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                      <h4 className="text-sm font-black text-zed-foreground mb-1">Active Arena Role</h4>
                      <p className="text-xs text-zed-foreground-secondary uppercase tracking-widest font-bold">{profile?.role || 'Contestant'}</p>
                    </div>
                    <div className="px-4 py-2 bg-zed-primary/20 text-zed-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-zed-primary/20">
                      Primary
                    </div>
                  </div>
                </section>

                {/* Danger Zone */}
                <section className="card-zed p-8 border-red-500/10 bg-red-500/5">
                  <h3 className="text-xl font-black text-red-500 mb-8 flex items-center gap-3">
                    <LogOut size={24} /> Session Management
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-zed-foreground mb-1">Exit the Arena</h4>
                      <p className="text-xs text-zed-foreground-secondary">Logging out will clear your active session.</p>
                    </div>
                    <button 
                      onClick={logout}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl text-xs font-black shadow-lg shadow-red-500/20"
                    >
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
