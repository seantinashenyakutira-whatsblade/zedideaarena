'use client'

import Script from 'next/script'
import { adsEnabled, adConfig } from '@/lib/ads/config'

export function AdScript() {
  if (!adsEnabled) return null

  return (
    <Script
      id="adsense-script"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.publisherId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  )
}
