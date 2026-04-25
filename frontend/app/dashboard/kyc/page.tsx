'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ShieldCheck, ArrowRight, Loader2, ExternalLink } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function KYCPage() {
  const [loading, setLoading] = useState(false)

  const handleStartKYC = async () => {
    setLoading(true)
    try {
      const res = await api.post('/kyc/submit')
      if (res.url) {
        // Redirect to Didit.me
        window.location.href = res.url
      } else {
        toast.error('Failed to get verification URL')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate KYC')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-zed-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 flex items-center justify-center p-8 bg-zed-background-alt">
            <div className="max-w-md w-full card-zed p-10 text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-zed-primary/10 rounded-full blur-3xl" />
              
              <div className="w-20 h-20 bg-zed-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_10px_40px_rgba(79,70,229,0.4)]">
                <ShieldCheck size={40} className="text-white" />
              </div>

              <h1 className="text-3xl font-black text-zed-foreground mb-4">Identity Verification</h1>
              <p className="text-zed-foreground-secondary mb-8 font-medium">
                We use **Didit.me** to securely verify your identity. This process only takes a few minutes and requires a valid ID card or Passport.
              </p>

              <div className="space-y-4 text-left bg-white/5 p-6 rounded-2xl mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-zed-primary rounded-full" />
                  <span className="text-xs font-bold text-zed-foreground">Scan your Passport or ID</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-zed-primary rounded-full" />
                  <span className="text-xs font-bold text-zed-foreground">Take a quick selfie</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-zed-primary rounded-full" />
                  <span className="text-xs font-bold text-zed-foreground">Instant verification results</span>
                </div>
              </div>

              <button
                onClick={handleStartKYC}
                disabled={loading}
                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-xl"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Begin Verification <ExternalLink size={18} />
                  </>
                )}
              </button>

              <p className="mt-6 text-[10px] text-zed-foreground-secondary font-bold uppercase tracking-widest opacity-50 flex items-center justify-center gap-2">
                <ShieldCheck size={12} /> Data is encrypted & private
              </p>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
