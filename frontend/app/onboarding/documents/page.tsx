'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2, Check, Upload, FileText } from 'lucide-react'
import { authService } from '@/services/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function DocumentsPage() {
  const router = useRouter()
  const [identityFile, setIdentityFile] = useState<File | null>(null)
  const [identityPreview, setIdentityPreview] = useState<string | null>(null)
  const [identityType, setIdentityType] = useState<'image' | 'pdf' | null>(null)
  const [identityUploaded, setIdentityUploaded] = useState(false)
  const [identityUrl, setIdentityUrl] = useState<string | null>(null)
  const [identityProgress, setIdentityProgress] = useState(0)

  const [addressFile, setAddressFile] = useState<File | null>(null)
  const [addressPreview, setAddressPreview] = useState<string | null>(null)
  const [addressType, setAddressType] = useState<'image' | 'pdf' | null>(null)
  const [addressUploaded, setAddressUploaded] = useState(false)
  const [addressUrl, setAddressUrl] = useState<string | null>(null)
  const [addressProgress, setAddressProgress] = useState(0)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (file: File, type: 'identity' | 'address') => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('Session expired. Please login again.')
      return
    }
    const userId = session.user.id
    const fileExt = file.name.split('.').pop()
    const fileName = `${type}_${Date.now()}.${fileExt}`
    const filePath = `${userId}/${type}/${fileName}`

    const setProgress = type === 'identity' ? setIdentityProgress : setAddressProgress
    const setUploaded = type === 'identity' ? setIdentityUploaded : setAddressUploaded
    const setUrl = type === 'identity' ? setIdentityUrl : setAddressUrl

    setProgress(10)

    try {
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      setProgress(80)

      const { data: { publicUrl } } = supabase.storage
        .from('user-documents')
        .getPublicUrl(filePath)

      setProgress(100)
      setUploaded(true)
      setUrl(publicUrl)
      toast.success(`${type === 'identity' ? 'Identity' : 'Address'} document uploaded`)
    } catch (err: any) {
      console.error(`[${type} upload error]:`, err)
      toast.error(err?.message || 'Upload failed. Please try again.')
    }
  }

  const handleIdentitySelect = useCallback((file: File) => {
    setIdentityFile(file)
    const isPdf = file.type === 'application/pdf'
    setIdentityType(isPdf ? 'pdf' : 'image')
    if (!isPdf) {
      const url = URL.createObjectURL(file)
      setIdentityPreview(url)
    }
    uploadFile(file, 'identity')
  }, [])

  const handleAddressSelect = useCallback((file: File) => {
    setAddressFile(file)
    const isPdf = file.type === 'application/pdf'
    setAddressType(isPdf ? 'pdf' : 'image')
    if (!isPdf) {
      const url = URL.createObjectURL(file)
      setAddressPreview(url)
    }
    uploadFile(file, 'address')
  }, [])

  useEffect(() => {
    return () => {
      if (identityPreview) URL.revokeObjectURL(identityPreview)
      if (addressPreview) URL.revokeObjectURL(addressPreview)
    }
  }, [identityPreview, addressPreview])

  const handleContinue = async () => {
    if (!identityUploaded) { toast.error('Please upload an identity document'); return }
    if (!addressUploaded) { toast.error('Please upload an address document'); return }
    setSaving(true)
    setError(null)
    try {
      const res: any = await authService.updateProfile({
        identity_document_url: identityUrl,
        address_document_url: addressUrl,
        onboarding_step: 3,
      })
      if (res?.status !== 'success') throw new Error(res?.error || 'Failed to save')
      router.push('/onboarding/review')
    } catch (err: any) {
      const msg = err?.message || err?.error_description || 'Failed to save. Please try again.'
      toast.error(msg)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 animate-zed-fade-up">
      <h2 className="text-xl font-black text-zed-foreground mb-2">Document Upload</h2>
      <p className="text-sm text-zed-foreground-secondary mb-4">
        Upload clear images or PDFs of your documents. Max 10MB per file.
      </p>

      {/* Identity Document */}
      <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
        <label className="text-xs font-black text-zed-foreground uppercase tracking-widest block mb-4">Proof of Identity</label>
        <p className="text-[10px] text-zed-foreground-secondary mb-4">Passport or National ID (JPEG, PNG, PDF)</p>

        {!identityFile ? (
          <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-zed-primary/30 transition-colors">
            <Upload size={24} className="text-zed-foreground-secondary" />
            <span className="text-xs font-bold text-zed-foreground-secondary">Click to upload</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleIdentitySelect(f) }}
              className="hidden"
            />
          </label>
        ) : (
          <div className="mt-3 relative rounded-xl overflow-hidden border border-emerald-500/30 shadow-[0_0_16px_rgba(16,185,129,0.15)]">
            {identityType === 'image' ? (
              <div className="relative">
                <img src={identityPreview!} alt="Identity document" className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <p className="text-white text-xs font-medium truncate">{identityFile.name}</p>
                  <p className="text-white/60 text-xs">{(identityFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-zinc-900/80">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                  <FileText className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{identityFile.name}</p>
                  <p className="text-xs text-zinc-400">PDF &bull; {(identityFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2">
              {identityUploaded ? (
                <div className="bg-emerald-500 rounded-full p-1 shadow-[0_0_8px_rgba(16,185,129,0.6)]">
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="bg-zinc-800/80 rounded-full p-1">
                  <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Address Document */}
      <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
        <label className="text-xs font-black text-zed-foreground uppercase tracking-widest block mb-4">Proof of Address</label>
        <p className="text-[10px] text-zed-foreground-secondary mb-4">Utility bill or bank statement (JPEG, PNG, PDF)</p>

        {!addressFile ? (
          <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-zed-primary/30 transition-colors">
            <Upload size={24} className="text-zed-foreground-secondary" />
            <span className="text-xs font-bold text-zed-foreground-secondary">Click to upload</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleAddressSelect(f) }}
              className="hidden"
            />
          </label>
        ) : (
          <div className="mt-3 relative rounded-xl overflow-hidden border border-emerald-500/30 shadow-[0_0_16px_rgba(16,185,129,0.15)]">
            {addressType === 'image' ? (
              <div className="relative">
                <img src={addressPreview!} alt="Address document" className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <p className="text-white text-xs font-medium truncate">{addressFile.name}</p>
                  <p className="text-white/60 text-xs">{(addressFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-zinc-900/80">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                  <FileText className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{addressFile.name}</p>
                  <p className="text-xs text-zinc-400">PDF &bull; {(addressFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2">
              {addressUploaded ? (
                <div className="bg-emerald-500 rounded-full p-1 shadow-[0_0_8px_rgba(16,185,129,0.6)]">
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="bg-zinc-800/80 rounded-full p-1">
                  <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-600 border-2 border-red-400 rounded-2xl shadow-lg shadow-red-600/30">
          <p className="text-sm font-bold text-white">{error}</p>
        </div>
      )}

      <div className="flex justify-between gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.push('/onboarding/location')}
          className="btn-secondary px-8 h-14 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={saving || !identityUploaded || !addressUploaded}
          className="btn-primary px-10 h-14 flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 size={18} className="animate-spin" /> Saving...</>
          ) : (
            <>Continue <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  )
}
