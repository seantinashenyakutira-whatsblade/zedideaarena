'use client'

import { useEffect, useRef } from 'react'
import { adsEnabled, adConfig } from '@/lib/ads/config'
import { Megaphone } from 'lucide-react'

interface AdCardProps {
  className?: string
  slot?: string
}

export function AdCard({ className = '', slot }: AdCardProps) {
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

  const adSlot = slot || adConfig.slots.infeed
  if (!adSlot) return null

  return (
    <div className={`card-zed group flex flex-col transition-all duration-500 border border-white/5 ${className}`}>
      <div className="relative aspect-video rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-zed-primary/10 via-zed-accent/10 to-zed-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Megaphone size={40} className="text-zed-primary/40 mx-auto mb-2" />
          <p className="text-[10px] text-zed-foreground-secondary font-bold uppercase tracking-widest">Sponsored</p>
        </div>
        <ins
          className="adsbygoogle absolute inset-0"
          style={{ display: 'block' }}
          data-ad-client={adConfig.publisherId}
          data-ad-slot={adSlot}
          data-ad-format="fluid"
          data-ad-layout="image-side"
        />
      </div>
      <div className="flex-1 flex flex-col px-1">
        <div className="h-4 w-3/4 bg-white/5 rounded-full mb-2" />
        <div className="h-3 w-full bg-white/5 rounded-full mb-1" />
        <div className="h-3 w-2/3 bg-white/5 rounded-full mb-6" />
        <div className="mt-auto pt-6 border-t border-white/5">
          <span className="text-[10px] text-zed-foreground-secondary font-bold uppercase tracking-widest">Ad</span>
        </div>
      </div>
    </div>
  )
}

export function shouldShowAd(index: number, frequency: number = adConfig.infeedFrequency): boolean {
  return (index + 1) % frequency === 0
}
