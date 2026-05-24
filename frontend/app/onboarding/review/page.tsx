'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, Check, FileText } from 'lucide-react'
import Image from 'next/image'
import { authService } from '@/services/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function ReviewPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res: any = await authService.getProfile()
        if (res?.status === 'success' && res?.data) {
          setProfile(res.data)
        }
      } catch {
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router])

  const handleSubmit = async () => {
    if (!confirmed) { toast.error('Please confirm that all information is accurate'); return }
    setIsSubmitting(true)
    setError(null)

    try {
      const response: any = await authService.updateProfile({
        onboarding_complete: true,
        onboarding_step: 4,
      })

      if (response?.status !== 'success') {
        throw new Error(response?.error || 'Profile update failed')
      }

      await supabase.auth.refreshSession()
      await new Promise(r => setTimeout(r, 600))

      setShowSuccess(true)

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2500)
    } catch (err: any) {
      console.error('Onboarding submission failed:', err)
      const msg = err?.message || 'Something went wrong. Please try again.'
      toast.error(msg)
      setError(msg)
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-zed-primary" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <>
      <div className="space-y-6 animate-zed-fade-up">
        <h2 className="text-xl font-black text-zed-foreground mb-2">Review & Submit</h2>
        <p className="text-sm text-zed-foreground-secondary mb-6">Please confirm all information is accurate before submitting.</p>

        <div className="p-6 bg-zed-primary/5 rounded-3xl border border-zed-primary/20 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Full Name</p>
              <p className="font-bold text-zed-foreground">{profile.full_name || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Date of Birth</p>
              <p className="font-bold text-zed-foreground">{profile.dob || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Nationality</p>
              <p className="font-bold text-zed-foreground">{profile.nationality || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Profession</p>
              <p className="font-bold text-zed-foreground">{profile.profession || '-'}</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Bio</p>
            <p className="text-sm text-zed-foreground-secondary">{profile.bio || '-'}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Country</p>
              <p className="font-bold text-zed-foreground">{profile.country || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">City</p>
              <p className="font-bold text-zed-foreground">{profile.city || '-'}</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Identity Document</p>
            <p className="font-bold text-zed-success flex items-center gap-2 text-sm">
              <Check size={14} /> Uploaded
              {profile.identity_document_url && (
                <span className="text-xs text-zed-foreground-secondary font-normal truncate max-w-[200px] ml-1">
                  ({profile.identity_document_url.split('/').pop()})
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">Address Document</p>
            <p className="font-bold text-zed-success flex items-center gap-2 text-sm">
              <Check size={14} /> Uploaded
              {profile.address_document_url && (
                <span className="text-xs text-zed-foreground-secondary font-normal truncate max-w-[200px] ml-1">
                  ({profile.address_document_url.split('/').pop()})
                </span>
              )}
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer p-4 bg-white/5 rounded-2xl border border-white/10">
          <input type="checkbox" className="mt-1" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
          <span className="text-xs font-bold text-zed-foreground">
            I confirm that all information provided above is accurate and complete.
          </span>
        </label>

        {error && (
          <div className="p-4 bg-red-600 border-2 border-red-400 rounded-2xl shadow-lg shadow-red-600/30">
            <p className="text-sm font-bold text-white">{error}</p>
          </div>
        )}

        <div className="flex justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/onboarding/documents')}
            disabled={isSubmitting}
            className="btn-secondary px-8 h-14 flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-20"
          >
            <ChevronLeft size={18} /> Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !confirmed}
            className="btn-primary px-10 h-14 flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Submitting...</>
            ) : (
              <>Submit <Check size={18} /></>
            )}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => {}}>
          <div className="bg-zed-surface border border-white/10 rounded-3xl p-12 max-w-md w-full mx-4 text-center shadow-2xl shadow-zed-primary/20 animate-electric-pulse">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-zed-primary/20 flex items-center justify-center">
                <Image src="/logo-icon.png" alt="ZedIdeaArena" width={48} height={48} className="object-contain" />
              </div>
              <div className="w-16 h-16 rounded-full bg-zed-success/20 flex items-center justify-center -mt-10 relative">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" className="animate-draw-check" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-black text-zed-foreground mb-3">You&apos;re In.</h2>
            <p className="text-zed-foreground-secondary text-lg">Welcome to ZedIdeaArena. Let the best idea win.</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes electricPulse {
          0% { box-shadow: 0 0 0px rgba(99, 102, 241, 0); opacity: 0; transform: scale(0.8); }
          50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); opacity: 1; transform: scale(1.05); }
          100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); transform: scale(1); }
        }
        @keyframes drawCheck {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-electric-pulse {
          animation: electricPulse 1.2s ease-out forwards;
        }
        .animate-draw-check {
          stroke-dasharray: 100;
          animation: drawCheck 0.6s ease-out 0.3s forwards;
        }
      `}</style>
    </>
  )
}
