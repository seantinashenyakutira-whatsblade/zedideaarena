'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  return <>{children}</>
}
