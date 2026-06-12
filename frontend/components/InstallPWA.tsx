'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download } from 'lucide-react'

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isInStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsStandalone(isInStandalone)
    if (isInStandalone) return

    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    if (iOS) {
      setVisible(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') {
      setVisible(false)
      setDismissed(true)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
  }

  if (isStandalone || dismissed || !visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 right-4 z-50 max-w-xs sm:bottom-4"
      >
        <div className="relative rounded-xl border border-zed-border bg-zed-card p-4 shadow-2xl backdrop-blur-xl">
          <button
            onClick={handleDismiss}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-zed-muted text-foreground/60 hover:bg-zed-border"
          >
            <X className="h-3 w-3" />
          </button>

          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Install App</p>
              <p className="text-xs text-zed-muted">
                Get the best experience
              </p>
            </div>
          </div>

          {isIOS ? (
            <div className="text-xs text-zed-muted">
              Tap{' '}
              <span className="inline-block rounded bg-zed-muted px-1.5 py-0.5 text-white">
                Share
              </span>{' '}
              →{' '}
              <span className="inline-block rounded bg-zed-muted px-1.5 py-0.5 text-white">
                Add to Home Screen
              </span>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Install Now
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
