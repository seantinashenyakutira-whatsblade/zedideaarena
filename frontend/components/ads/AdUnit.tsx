'use client'

import { useEffect, useRef, useState } from 'react'
import { adsEnabled, adConfig } from '@/lib/ads/config'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface AdUnitProps {
  slot?: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
}

export function AdUnit({ slot, format = 'rectangle', className = '' }: AdUnitProps) {
  const ref = useRef<HTMLDivElement>(null)
  const visibleStart = useRef<number | null>(null)
  const tracked = useRef(false)
  const [inView, setInView] = useState(false)
  const { profile } = useAuth()
  const adSlot = slot || adConfig.slots.infeed

  useEffect(() => {
    if (!adsEnabled || !ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && !visibleStart.current) {
          visibleStart.current = Date.now()
        } else if (!entry.isIntersecting) {
          visibleStart.current = null
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView || !visibleStart.current || tracked.current || !profile) return

    const timer = setTimeout(async () => {
      const duration = Math.floor((Date.now() - visibleStart.current!) / 1000)
      if (duration >= 3) {
        tracked.current = true
        try {
          await api.post('/ads/impression', {
            ad_unit: adSlot || 'arena-sidebar',
            duration_seconds: duration,
          })
        } catch {}
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [inView, profile, adSlot])

  useEffect(() => {
    if (!adsEnabled || !adSlot) return
    try {
      (window.adsbygoogle || []).push({})
    } catch {}
  }, [adsEnabled, adSlot])

  if (!adsEnabled || !adSlot) return null

  return (
    <div ref={ref} className={`flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adConfig.publisherId}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
