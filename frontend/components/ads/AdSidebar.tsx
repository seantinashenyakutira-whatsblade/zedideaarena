'use client'

import { useEffect, useRef } from 'react'
import { adsEnabled, adConfig } from '@/lib/ads/config'
import { Megaphone } from 'lucide-react'

interface AdSidebarProps {
  className?: string
  slot?: string
}

export function AdSidebar({ className = '', slot }: AdSidebarProps) {
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

  const adSlot = slot || adConfig.slots.sidebar
  if (!adSlot) return null

  return (
    <div className={`pt-6 border-t border-white/5 ${className}`}>
      <div className="text-[10px] text-zed-foreground-secondary font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
        <Megaphone size={10} /> Sponsored
      </div>
      <div className="bg-white/[0.02] rounded-xl overflow-hidden flex justify-center min-h-[250px] items-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '250px' }}
          data-ad-client={adConfig.publisherId}
          data-ad-slot={adSlot}
          data-ad-format="rectangle"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}
