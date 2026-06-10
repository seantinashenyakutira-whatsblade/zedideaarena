'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

interface SuccessAction {
  label: string
  href?: string
  onClick?: () => void
  primary?: boolean
}

interface SuccessPageProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  children?: React.ReactNode
  primaryAction?: SuccessAction
  secondaryAction?: SuccessAction
  autoRedirect?: { to: string; seconds: number }
}

export function SuccessPage({
  icon,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  autoRedirect,
}: SuccessPageProps) {
  const [countdown, setCountdown] = useState(autoRedirect?.seconds ?? 0)
  const router = useRouter()

  const doRedirect = useCallback(() => {
    if (autoRedirect?.to) {
      router.replace(autoRedirect.to)
    }
  }, [autoRedirect, router])

  useEffect(() => {
    if (!autoRedirect) return
    if (countdown <= 0) {
      doRedirect()
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, autoRedirect, doRedirect])

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-lg mx-auto p-12">
        <div className="w-24 h-24 bg-zed-success/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-zed-fade-up">
          {icon}
        </div>
        <h1 className="text-4xl font-black text-zed-foreground mb-4">{title}</h1>
        <p className="text-zed-foreground-secondary text-lg mb-8">{subtitle}</p>

        {children}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {primaryAction && (
            <button
              onClick={() => {
                if (primaryAction.href) router.push(primaryAction.href)
                else if (primaryAction.onClick) primaryAction.onClick()
              }}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl text-xs font-black ${
                primaryAction.primary !== false
                  ? 'btn-primary shadow-xl shadow-zed-primary/30'
                  : 'btn-secondary'
              }`}
            >
              {primaryAction.label} {primaryAction.primary !== false && <ArrowRight size={16} />}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={() => {
                if (secondaryAction.href) router.push(secondaryAction.href)
                else if (secondaryAction.onClick) secondaryAction.onClick()
              }}
              className="btn-secondary px-8 py-4 rounded-xl text-xs font-black"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>

        {autoRedirect && countdown > 0 && (
          <p className="text-zed-foreground-secondary text-sm mt-6">
            Redirecting in {countdown}s...
          </p>
        )}
      </div>
    </div>
  )
}
