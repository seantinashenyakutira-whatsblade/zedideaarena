import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const pathname = url.pathname

  // Static files — always allow
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') 
  ) {
    return NextResponse.next()
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN 
    || 'zedideaarena.com'

  // Detect subdomain
  const isLocalhost = hostname.includes('localhost')
  
  let subdomain = ''
  if (isLocalhost) {
    // For local dev: hub.localhost:3000 → subdomain = 'hub'
    subdomain = hostname.split('.localhost')[0]
    if (subdomain === 'localhost' || subdomain === '') {
      subdomain = ''
    }
  } else {
    // Production: hub.zedideaarena.com → subdomain = 'hub'
    const parts = hostname.replace(`.${rootDomain}`, '')
    subdomain = parts === rootDomain || parts === `www` ? '' : parts
  }

  // ── MAIN DOMAIN (no subdomain) ────────────────────────
  // Marketing pages — always public
  if (!subdomain || subdomain === 'www') {
    return NextResponse.next()
  }

  // ── LOGIN SUBDOMAIN ───────────────────────────────────
  if (subdomain === 'login') {
    // Rewrite login.zedideaarena.com → /auth pages
    if (pathname === '/' || pathname === '') {
      url.pathname = '/auth/login'
      return NextResponse.rewrite(url)
    }
    // login.zedideaarena.com/signup → /auth/signup
    if (!pathname.startsWith('/auth')) {
      url.pathname = `/auth${pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // ── AUTH CHECK for protected subdomains ──────────────
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
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

  // Build login redirect URL
  const loginUrl = isLocalhost
    ? `http://login.localhost:3000/auth/login?redirect=${subdomain}`
    : `https://login.${rootDomain}/auth/login?redirect=${subdomain}`

  // Not logged in → send to login
  if (!session) {
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
    // On error, allow through rather than locking user out
    return NextResponse.next()
  }

  // Onboarding check
  const needsOnboarding = profile &&
    !profile.onboarding_complete &&
    !profile.onboarding_skipped

  if (needsOnboarding) {
    const onboardUrl = isLocalhost
      ? `http://login.localhost:3000/onboarding/personal`
      : `https://login.${rootDomain}/onboarding/personal`
    return NextResponse.redirect(onboardUrl)
  }

  // ── HUB SUBDOMAIN → contestant dashboard ─────────────
  if (subdomain === 'hub') {
    url.pathname = pathname === '/' 
      ? '/dashboard' 
      : `/dashboard${pathname}`
    return NextResponse.rewrite(url)
  }

  // ── VOTE SUBDOMAIN → voter portal ────────────────────
  if (subdomain === 'vote') {
    if (!profile?.is_verified) {
      const hubUrl = isLocalhost
        ? `http://hub.localhost:3000?msg=verification_required`
        : `https://hub.${rootDomain}?msg=verification_required`
      return NextResponse.redirect(hubUrl)
    }
    url.pathname = pathname === '/' 
      ? '/voter' 
      : `/voter${pathname}`
    return NextResponse.rewrite(url)
  }

  // ── ADMIN SUBDOMAIN ───────────────────────────────────
  if (subdomain === 'admin') {
    if (!profile?.is_admin) {
      const hubUrl = isLocalhost
        ? `http://hub.localhost:3000`
        : `https://hub.${rootDomain}`
      return NextResponse.redirect(hubUrl)
    }
    url.pathname = pathname === '/' 
      ? '/admin' 
      : `/admin${pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
}
