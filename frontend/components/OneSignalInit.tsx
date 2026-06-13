'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    OneSignal?: any
  }
}

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

export function OneSignalInit() {
  useEffect(() => {
    if (!APP_ID) return
    if (typeof window === 'undefined') return

    const init = () => {
      if (window.OneSignal) {
        window.OneSignal.init({
          appId: APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
        })
        window.dispatchEvent(new Event('onesignal-loaded'))
      }
    }

    // Load OneSignal SDK if not already loaded
    if (!window.OneSignal) {
      const script = document.createElement('script')
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      script.defer = true
      script.onload = init
      document.head.appendChild(script)
    } else {
      init()
    }
  }, [])

  return null
}
