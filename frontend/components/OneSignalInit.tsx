'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    OneSignalDeferred?: any
    OneSignal?: any
  }
}

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

export function OneSignalInit() {
  useEffect(() => {
    if (!APP_ID) return
    if (typeof window === 'undefined') return

    // Load OneSignal SDK
    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    script.defer = true
    document.head.appendChild(script)

    // Initialize using deferred pattern (OneSignal v16+)
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(function (OneSignal: any) {
      OneSignal.init({
        appId: APP_ID,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
      })
    })
  }, [])

  return null
}
