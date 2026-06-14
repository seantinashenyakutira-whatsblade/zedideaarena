'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const routes = {
  public: ['/', '/auth/login'],
  authenticated: ['/arena', '/dashboard', '/dashboard/messages'],
}

export function RoutePrefetcher() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      if (conn?.effectiveType === 'slow-2g' || conn?.saveData) return
    }

    const targets = pathname === '/' || pathname?.startsWith('/auth')
      ? routes.authenticated
      : routes.public

    targets.forEach((route) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = route
      link.as = 'document'
      document.head.appendChild(link)
      setTimeout(() => link.remove(), 3000)
    })
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleMouseOver = (e: Event) => {
      const mouseEvent = e as MouseEvent
      const link = (mouseEvent.target as HTMLElement)?.closest('a')
      if (!link?.href || link.href.startsWith('javascript')) return
      if ('connection' in navigator) {
        const conn = (navigator as any).connection
        if (conn?.effectiveType === 'slow-2g' || conn?.saveData) return
      }
      try {
        const l = document.createElement('link')
        l.rel = 'prefetch'
        l.href = link.href
        document.head.appendChild(l)
        setTimeout(() => l.remove(), 3000)
      } catch {}
    }

    document.addEventListener('mouseover', handleMouseOver, { passive: true } as EventListenerOptions)
    return () => document.removeEventListener('mouseover', handleMouseOver, { passive: true } as EventListenerOptions)
  }, [])

  return null
}
