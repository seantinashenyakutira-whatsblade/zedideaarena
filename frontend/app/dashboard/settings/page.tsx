'use client'

import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth'
import { User, Mail, Shield, LogOut, Save, Loader2, Camera, MapPin } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function SettingsPage() {
  const { profile, logout, refreshProfile } = useAuth()
  const [loadingRole, setLoadingRole] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile?.full_name || profile?.fullName || '')
      setBio(profile?.bio || '')
      setPhone(profile?.phone || '')
      setCountry(profile?.country || '')
      setCity(profile?.city || '')
      setAddress(profile?.address || '')
    }
  }, [profile])

  const handleRoleChange = async (newRole: string) => {
    if (profile?.current_mode === newRole) return
    setLoadingRole(true)
    try {
      await api.patch('/user/profile', { current_mode: newRole })
      toast.success(`Mode switched to ${newRole}`)
      refreshProfile()
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || 'Failed to switch mode')
    } finally {
      setLoadingRole(false)
    }
  }

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB)')
      return
    }
    setUploadingPic(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res: any = await api.post('/media/arena-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res?.url) {
        await authService.updateProfile({ picture: res.url })
        refreshProfile()
        toast.success('Profile picture updated')
      }
    } catch {
      toast.error('Failed to upload picture')
    } finally {
      setUploadingPic(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await authService.updateProfile({ fullName, bio, phone, country, city, address })
      refreshProfile()
      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-black text-zed-foreground mb-12">Account Settings</h1>

      <div className="grid gap-8">
        <section className="card-zed p-8 border-white/5 bg-white/5">
          <h3 className="text-xl font-black text-zed-foreground mb-8 flex items-center gap-3">
            <User className="text-zed-primary" size={24} /> Profile Information
          </h3>

          <div className="flex flex-col md:flex-row gap-12">
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPic}
                className="relative w-32 h-32 rounded-3xl bg-zed-gradient-primary group overflow-hidden shadow-2xl hover:scale-105 transition-transform disabled:opacity-50"
              >
                {profile?.picture ? (
                  <img src={profile.picture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <User size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingPic ? (
                    <Loader2 size={24} className="animate-spin text-white" />
                  ) : (
                    <Camera size={24} className="text-white" />
                  )}
                </div>
              </button>
              <p className="text-[10px] text-zed-foreground-secondary font-bold uppercase tracking-widest">Click to change</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} />
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={18} />
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-zed pl-10" />
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

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  maxLength={300}
                  className="input-zed resize-none"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-[10px] text-zed-foreground-secondary text-right">{bio.length}/300</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Phone</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={18} />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-zed pl-10" placeholder="+260 97 000 0000" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="input-zed" placeholder="e.g. 123 Independence Ave, Lusaka" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">City / Town</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} className="input-zed" placeholder="e.g. Lusaka" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-3">Country</label>
                  <select value={country} onChange={e => setCountry(e.target.value)} className="input-zed">
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

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 text-xs font-black disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Changes'}
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
  )
}
