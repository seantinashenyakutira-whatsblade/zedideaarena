'use client'

import { useEffect, useState, useCallback } from 'react'

export function useOneSignal() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator
    setIsSupported(supported)
    if (supported) {
      setIsSubscribed(Notification.permission === 'granted')
    }
  }, [])

  useEffect(() => {
    const handleChange = () => setIsSubscribed(Notification.permission === 'granted')
    if ('Notification' in window) {
      window.addEventListener('notificationchange', handleChange)
    }
    return () => window.removeEventListener('notificationchange', handleChange)
  }, [])

  const subscribe = useCallback(async () => {
    if (!('Notification' in window)) return false
    try {
      const perm = await Notification.requestPermission()
      setIsSubscribed(perm === 'granted')
      return perm === 'granted'
    } catch {
      return false
    }
  }, [])

  return {
    isSupported,
    isSubscribed,
    subscribe,
  }
}
