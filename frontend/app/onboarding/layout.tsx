'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { authService } from '@/services/auth'
import { routes } from '@/lib/routes'
import { Check, User, Map, FileText, ClipboardCheck, RefreshCw } from 'lucide-react'

const steps = [
  { number: 1, path: '/onboarding/personal', label: 'Personal', icon: User },
  { number: 2, path: '/onboarding/location', label: 'Location', icon: Map },
  { number: 3, path: '/onboarding/documents', label: 'Documents', icon: FileText },
  { number: 4, path: '/onboarding/review', label: 'Review', icon: ClipboardCheck },
]

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)

  const currentStepIndex = steps.findIndex(s => pathname.startsWith(s.path))

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoaded(false)
      try {
        const res: any = await authService.getProfile()
        if (cancelled) return
        if (res?.status === 'success' && res?.data) {
          const p = res.data
          if (p.onboarding_complete) {
            window.location.href = routes.hub
            return
          }
          setProfile(p)
          const step = p.onboarding_step || 0
          const stepNum = steps[currentStepIndex]?.number || 0
          if (stepNum > 0 && stepNum > step + 1) {
            router.push(steps[Math.max(0, step)].path)
            return
          }
        }
      } catch {
        if (!cancelled) window.location.href = routes.login
        return
      }
      if (!cancelled) setLoaded(true)
    }
    load()
    return () => { cancelled = true }
  }, [router, pathname])

  if (!loaded) {
    return (
      <div className="min-h-screen bg-zed-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zed-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#050510] to-[#0f0f2a]">
      <div className="container-zed py-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="flex items-center gap-3 justify-center animate-logo-entry">
              <Image src="/logo-icon.png" alt="ZedIdeaArena" width={36} height={36} className="object-contain" />
              <span className="font-bold text-xl gradient-text">ZedIdeaArena</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-zed-foreground mb-2">Complete Your Profile</h1>
          <p className="text-zed-foreground-secondary">Set up your account before entering the Arena</p>
        </div>

        <div className="flex items-center justify-between mb-10 px-2">
          {steps.map((s, idx) => {
            const Icon = s.icon
            const isActive = currentStepIndex >= idx
            const isDone = currentStepIndex > idx
            return (
              <div key={idx} className="flex flex-col items-center gap-2 relative flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 text-sm font-black ${
                    isActive ? 'bg-zed-primary text-white shadow-lg shadow-zed-primary/30' : 'bg-white/5 text-zed-foreground-secondary'
                  }`}
                >
                  {isDone ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest text-center ${isActive ? 'text-zed-primary' : 'text-zed-foreground-secondary'}`}>
                  {s.label}
                </span>
                {idx < steps.length - 1 && (
                  <div className={`absolute top-5 left-[60%] w-[80%] h-[1px] ${currentStepIndex > idx ? 'bg-zed-primary' : 'bg-white/10'}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="card-zed glass-premium p-8 min-h-[400px]">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes logoEntry {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-logo-entry {
          animation: logoEntry 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
