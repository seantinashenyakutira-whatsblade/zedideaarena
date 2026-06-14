'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService, getToken, clearToken, getHubUrl, getMainUrl } from '@/services/auth'
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

  const fetchProfile = useCallback(async () => {
    const token = typeof window !== 'undefined' ? getToken() : null
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res: any = await authService.getProfile()
      if (res.status === 'success') {
        setProfile(res.data)
        setCurrentRole(res.data.current_mode || res.data.role || 'contestant')
      }
    } catch (err: any) {
      clearToken()
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
    window.location.replace(getHubUrl('/arena'))
  }

  const logout = async () => {
    try {
      await authService.logout()
      setProfile(null)
      setUser(null)
      window.location.replace(getMainUrl('/auth/login'))
      toast.info('Logged out.')
    } catch (err) {
      clearToken()
      window.location.replace(getMainUrl('/auth/login'))
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
