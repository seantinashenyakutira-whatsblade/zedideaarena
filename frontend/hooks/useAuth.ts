'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AuthContextType {
  user: any
  profile: any
  loading: boolean
  currentRole: string
  login: (credentials: any) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  setCurrentRole: (role: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentRole, setCurrentRole] = useState<string>('contestant')
  const router = useRouter()

  const fetchProfile = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res: any = await authService.getProfile()
      if (res.status === 'success') {
        setProfile(res.data)
        setCurrentRole(res.data.role || 'contestant')
      }
    } catch (err: any) {
      localStorage.removeItem('token')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const login = async (credentials: any) => {
    await authService.login(credentials)
    await fetchProfile()
    router.push('/dashboard')
    toast.success('Welcome back!')
  }

  const logout = async () => {
    try {
      await authService.logout()
      setProfile(null)
      setUser(null)
      router.push('/auth/login')
      toast.info('Logged out.')
    } catch (err) {
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
  }

  const value = {
    user,
    profile,
    loading,
    currentRole,
    setCurrentRole,
    login,
    logout,
    refreshProfile: fetchProfile,
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
