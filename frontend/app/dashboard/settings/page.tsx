'use client'

import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth'
import { User, Mail, Shield, LogOut, Save, Loader2, Camera, MapPin, Plus, X, Globe, Check, Bell } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { ImageCropper } from '@/components/ImageCropper'
import { NotificationPreferences } from '@/components/dashboard/NotificationPreferences'

const SOCIAL_PLATFORMS = [
  {
    id: 'twitter', label: 'X (Twitter)',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    id: 'instagram', label: 'Instagram',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    color: 'text-pink-400',
  },
  {
    id: 'linkedin', label: 'LinkedIn',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    color: 'text-blue-400',
  },
  {
    id: 'github', label: 'GitHub',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
    color: 'text-white',
  },
  {
    id: 'youtube', label: 'YouTube',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    color: 'text-red-400',
  },
  {
    id: 'tiktok', label: 'TikTok',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
    color: 'text-cyan-300',
  },
  {
    id: 'facebook', label: 'Facebook',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    color: 'text-blue-500',
  },
  {
    id: 'whatsapp', label: 'WhatsApp',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    color: 'text-green-400',
  },
  {
    id: 'discord', label: 'Discord',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>,
    color: 'text-indigo-400',
  },
  {
    id: 'website', label: 'Website',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    color: 'text-emerald-400',
  },
]

interface SocialLink {
  platform: string
  url: string
}

export default function SettingsPage() {
  const { profile, logout, refreshProfile } = useAuth()
  const [loadingRole, setLoadingRole] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [showPlatformPicker, setShowPlatformPicker] = useState(false)
  const [addingPlatform, setAddingPlatform] = useState<string | null>(null)
  const [newUrl, setNewUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile?.full_name || profile?.fullName || '')
      setBio(profile?.bio || '')
      setPhone(profile?.phone || '')
      setCountry(profile?.country || '')
      setCity(profile?.city || '')
      setAddress(profile?.address || '')
      setSocialLinks(profile?.social_links || [])
    }
  }, [profile])

  useEffect(() => {
    if (addingPlatform && urlInputRef.current) {
      urlInputRef.current.focus()
    }
  }, [addingPlatform])

  const availablePlatforms = SOCIAL_PLATFORMS.filter(p => !socialLinks.find(s => s.platform === p.id))

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

  const handlePicturePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB)')
      return
    }
    setCropImage(URL.createObjectURL(file))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCroppedPicture = async (blob: Blob) => {
    setCropImage(null)
    setUploadingPic(true)
    const formData = new FormData()
    formData.append('file', blob, 'profile.jpg')
    try {
      const res: any = await api.post('/media/profile-upload', formData, {
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
    }
  }

  const confirmAddLink = () => {
    if (!addingPlatform || !newUrl.trim()) return
    setSocialLinks(prev => [...prev.filter(s => s.platform !== addingPlatform), { platform: addingPlatform, url: newUrl.trim() }])
    setAddingPlatform(null)
    setNewUrl('')
    setShowPlatformPicker(false)
  }

  const removeSocialLink = (platform: string) => {
    setSocialLinks(prev => prev.filter(s => s.platform !== platform))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await authService.updateProfile({
        fullName, bio, phone, country, city, address,
        social_links: socialLinks.filter(s => s.url.trim()),
      })
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
                className="relative w-32 h-32 rounded-full bg-zed-gradient-primary group overflow-hidden shadow-2xl hover:scale-105 transition-transform disabled:opacity-50"
              >
                {profile?.picture ? (
                  <img src={profile.picture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <User size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  {uploadingPic ? (
                    <Loader2 size={24} className="animate-spin text-white" />
                  ) : (
                    <Camera size={24} className="text-white" />
                  )}
                </div>
              </button>
              <p className="text-[10px] text-zed-foreground-secondary font-bold uppercase tracking-widest">Click to change</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePicturePick} />
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

        {/* Social Links */}
        <section className="card-zed p-8 border-white/5 bg-white/5">
          <h3 className="text-xl font-black text-zed-foreground mb-8 flex items-center gap-3">
            <Globe className="text-zed-accent" size={24} /> Social Links
          </h3>

          {/* Added links */}
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {socialLinks.map(link => {
                const platform = SOCIAL_PLATFORMS.find(p => p.id === link.platform)
                return (
                  <div key={link.platform} className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 ${platform?.color || 'text-white'}`}>
                    <span className="shrink-0">{platform?.icon}</span>
                    <span className="text-xs font-bold text-white/70 truncate max-w-[120px]">{link.url}</span>
                    <button onClick={() => removeSocialLink(link.platform)} className="p-0.5 rounded hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all ml-1">
                      <X size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add section */}
          {addingPlatform ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              {(() => {
                const p = SOCIAL_PLATFORMS.find(x => x.id === addingPlatform)
                return (
                  <div className={`shrink-0 ${p?.color || 'text-white'}`}>{p?.icon}</div>
                )
              })()}
              <input
                ref={urlInputRef}
                type="url"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmAddLink()}
                placeholder="Paste your profile URL..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
              />
              <button
                onClick={confirmAddLink}
                disabled={!newUrl.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zed-primary text-white text-[10px] font-bold hover:bg-zed-primary/80 transition-all disabled:opacity-30"
              >
                <Check size={12} /> Add
              </button>
              <button onClick={() => { setAddingPlatform(null); setNewUrl('') }} className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowPlatformPicker(!showPlatformPicker)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all text-sm w-full"
              >
                <Plus size={16} /> Add Social Link
              </button>

              {showPlatformPicker && (
                <div className="mt-2 p-3 rounded-xl bg-zinc-900 border border-zinc-700 grid grid-cols-2 gap-1">
                  {availablePlatforms.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setAddingPlatform(p.id); setShowPlatformPicker(false) }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold hover:bg-white/5 transition-all ${p.color}`}
                    >
                      <span className="shrink-0">{p.icon}</span>
                      <span className="text-white/70">{p.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {socialLinks.length === 0 && !showPlatformPicker && !addingPlatform && (
            <p className="text-xs text-white/30 py-4 text-center">No social links added yet</p>
          )}
        </section>

        <NotificationPreferences />

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
      {cropImage && (
        <ImageCropper src={cropImage} aspect={1} onCrop={handleCroppedPicture} onCancel={() => { setCropImage(null); URL.revokeObjectURL(cropImage) }} />
      )}
    </div>
  )
}
