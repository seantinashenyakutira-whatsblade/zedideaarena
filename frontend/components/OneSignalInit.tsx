'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

declare global {
  interface Window {
    OneSignalDeferred?: any
    OneSignal?: any
  }
}

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

export function OneSignalInit() {
  const { profile } = useAuth()

  useEffect(() => {
    if (!APP_ID) return
    if (typeof window === 'undefined') return

    const scriptId = 'onesignal-sdk'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      script.defer = true
      document.head.appendChild(script)
    }

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(function (OneSignal: any) {
      OneSignal.init({
        appId: APP_ID,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
      })

      if (profile?.id) {
        OneSignal.setExternalUserId(profile.id)
      }

      OneSignal.on('notificationClick', function (event: any) {
        const url = event?.notification?.url
        if (url && window.location.origin) {
          window.location.href = url
        }
      })
    })
  }, [profile?.id])

  return null
}
