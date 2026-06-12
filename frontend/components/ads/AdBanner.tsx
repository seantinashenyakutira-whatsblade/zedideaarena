'use client'

import { useEffect, useRef } from 'react'
import { adsEnabled, adConfig } from '@/lib/ads/config'

interface AdBannerProps {
  className?: string
  slot?: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
}

export function AdBanner({ className = '', slot, format = 'auto' }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!adsEnabled || initialized.current) return
    try {
      const win = window as any
      if (win.adsbygoogle) {
        win.adsbygoogle.push({})
      }
    } catch { /* silent */ }
    initialized.current = true
  }, [])

  if (!adsEnabled) return null

  const adSlot = slot || adConfig.slots.banner
  if (!adSlot) return null

  return (
    <div className={`flex justify-center ${className}`}>
      <ins
        ref={adRef}
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
