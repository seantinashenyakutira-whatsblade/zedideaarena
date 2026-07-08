import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = [
  '/', '/about', '/how-it-works', '/pricing', '/competitions',
  '/auth', '/pitch',
]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(r =>
    pathname === r || pathname.startsWith(r + '/')
  )
}

function isProtectedRoute(pathname: string): 'dashboard' | 'vote' | 'admin' | 'arena' | null {
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/vote')) return 'vote'
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/arena')) return 'arena'
  return null
}

const PRODUCTION_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'zedideaarena.com'
const HUB_SUBDOMAIN = 'hub'
const isLocalhost = (hostname: string) => hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('[::1]') || hostname.includes('vercel.app')

function getCookieDomain(hostname: string): string | undefined {
  if (isLocalhost(hostname)) return undefined
  if (hostname.endsWith(PRODUCTION_DOMAIN)) return `.${PRODUCTION_DOMAIN}`
  return undefined
}

function isHubDomain(hostname: string): boolean {
  return hostname === `${HUB_SUBDOMAIN}.${PRODUCTION_DOMAIN}`
}

function isMainDomain(hostname: string): boolean {
  return hostname === PRODUCTION_DOMAIN || hostname.startsWith('www.')
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname
  const hostname = request.headers.get('host')?.split(':')[0] || ''
  const cookieDomain = getCookieDomain(hostname)
  const isLocal = isLocalhost(hostname)
  const isHub = isHubDomain(hostname)
  const isMain = isMainDomain(hostname) || (!isHub && !hostname.includes(PRODUCTION_DOMAIN))

  // Always allow static files, API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ── CLEAR STALE SUPABASE COOKIES ON AUTH PAGES ──────
  // Skip /auth/callback — it needs cookies to complete OAuth exchange
  if (pathname.startsWith('/auth/') && pathname !== '/auth/callback') {
    const res = isHub
      ? NextResponse.redirect(new URL(pathname, `https://${PRODUCTION_DOMAIN}`))
      : NextResponse.next()

    const sbCookies = request.cookies.getAll().filter(c => c.name.startsWith('sb-'))
    sbCookies.forEach(c => {
      res.cookies.set(c.name, '', {
        path: '/',
        domain: cookieDomain,
        maxAge: 0,
      })
      res.cookies.set(c.name, '', { path: '/', maxAge: 0 })
    })

    return res
  }

  // ── LOCAL DEV: skip subdomain routing ────────────
  if (isLocal) {
    // On localhost, just enforce auth on protected routes (no subdomain redirects)
    const protectedArea = isProtectedRoute(pathname)
    if (!protectedArea && !isPublicRoute(pathname)) {
      return NextResponse.next()
    }
    // fall through to auth check below
  }

  // ── DOMAIN-BASED ROUTING ──────────────────────────
  // hub.zedideaarena.com → app routes only (no landing, no auth pages)
  if (isHub) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/arena', request.url))
    }
  }

  // zedideaarena.com → public routes, redirect protected to hub
  if (isMain) {
    const protectedArea = isProtectedRoute(pathname)
    if (protectedArea && !pathname.startsWith('/auth/')) {
      return NextResponse.redirect(new URL(pathname, `https://${HUB_SUBDOMAIN}.${PRODUCTION_DOMAIN}`))
    }
  }

  // Public routes — no auth needed
  if (!isLocal && isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const protectedArea = isProtectedRoute(pathname)
  if (!protectedArea) {
    return NextResponse.next()
  }

  // ── AUTH CHECK for protected routes ──────────────────
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, {
              ...options,
              domain: cookieDomain,
              sameSite: 'lax',
              secure: !!cookieDomain,
            })
          })
        },
      },
    }
  )

  let session = null
  let profile = null

  try {
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch (err) {
    console.error('Middleware session error:', err)
  }

  // Not logged in → send to login on main domain
  if (!session) {
    const loginUrl = new URL('/auth/login', isMain ? request.url : `https://${PRODUCTION_DOMAIN}`)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Fetch fresh profile from DB
  try {
    const { data } = await supabase
      .from('users')
      .select('is_admin, is_verified, onboarding_complete, onboarding_skipped, current_mode')
      .eq('id', session.user.id)
      .single()
    profile = data
  } catch (err) {
    console.error('Middleware profile error:', err)
    return NextResponse.next()
  }

  // Onboarding check for dashboard
  const needsOnboarding = profile &&
    !profile.onboarding_complete &&
    !profile.onboarding_skipped

  if (needsOnboarding && protectedArea !== 'admin') {
    const targetHost = isHub ? `https://${HUB_SUBDOMAIN}.${PRODUCTION_DOMAIN}` : request.url
    const onboardUrl = new URL('/onboarding/personal', targetHost)
    return NextResponse.redirect(onboardUrl)
  }

  // Admin route — admin role required
  if (protectedArea === 'admin' && !profile?.is_admin) {
    const targetHost = isHub ? `https://${HUB_SUBDOMAIN}.${PRODUCTION_DOMAIN}` : request.url
    return NextResponse.redirect(new URL('/dashboard', targetHost))
  }

  // Vote route — verification required
  if (protectedArea === 'vote' && !profile?.is_verified) {
    const targetHost = isHub ? `https://${HUB_SUBDOMAIN}.${PRODUCTION_DOMAIN}` : request.url
    return NextResponse.redirect(new URL('/dashboard?msg=verification_required', targetHost))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
}
