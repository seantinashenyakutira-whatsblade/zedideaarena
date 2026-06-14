import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const isProduction = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  !window.location.hostname.includes('127.0.0.1')

const cookieDomain = isProduction ? '.zedideaarena.com' : undefined

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    get(key) {
      if (typeof document === 'undefined') return undefined
      const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`))
      return match?.[2]
    },
    set(key, value, options) {
      if (typeof document === 'undefined') return
      const parts = [`${key}=${value}`, `path=${options.path || '/'}`]
      if (cookieDomain) parts.push(`domain=${cookieDomain}`)
      if (options.maxAge) parts.push(`max-age=${options.maxAge}`)
      parts.push('SameSite=Lax')
      if (isProduction) parts.push('Secure')
      document.cookie = parts.join('; ')
    },
    remove(key) {
      if (typeof document === 'undefined') return
      const parts = [`${key}=`, 'path=/', 'max-age=0']
      if (cookieDomain) parts.push(`domain=${cookieDomain}`)
      document.cookie = parts.join('; ')
    },
  },
})
