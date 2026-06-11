import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const pathname = url.pathname

  // ── DETERMINE SUBDOMAIN ───────────────────────────────
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'zedideaarena.com'

  // hostname examples:
  //   zedideaarena.com
  //   www.zedideaarena.com
  //   hub.zedideaarena.com
  //   vote.zedideaarena.com
  //   localhost:3000
  //   hub.localhost:3000
  const cleanHost = hostname.replace(/:3000$|:3001$/, '')
  const isMainDomain =
    cleanHost === rootDomain ||
    cleanHost === `www.${rootDomain}` ||
    cleanHost === 'localhost' ||
    cleanHost === 'zedideaarena.vercel.app'

  const subdomain = isMainDomain
    ? ''
    : cleanHost.replace(`.${rootDomain}`, '').replace('.localhost', '')

  // ── API ROUTES: never intercept ───────────────────────
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // ── MAIN DOMAIN: public marketing site ────────────────
  if (isMainDomain) {
    const publicPaths = [
      '/', '/about', '/how-it-works', '/pricing',
      '/docs', '/competitions',
      '/auth', '/_next', '/favicon',
    ]
    const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
    if (isPublic) return NextResponse.next()

    // Anything else on main domain → 404
    url.pathname = '/404'
    return NextResponse.rewrite(url)
  }

  // ── LOGIN SUBDOMAIN ───────────────────────────────────
  if (subdomain === 'login') {
    // login.zedideaarena.com/xxx → /auth/xxx
    url.pathname = pathname === '/' ? '/auth/login' : `/auth${pathname}`
    return NextResponse.rewrite(url)
  }

  // ── ALL PROTECTED SUBDOMAINS: check auth ─────────────
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    const loginUrl = new URL(`https://login.${rootDomain}/login`)
    loginUrl.searchParams.set('redirect', subdomain)
    return NextResponse.redirect(loginUrl)
  }

  // Fetch profile for role/onboarding checks
  let profile = null
  try {
    const { data } = await supabase
      .from('users')
      .select('is_admin, is_verified, onboarding_complete, onboarding_skipped, full_name, current_mode')
      .eq('id', session.user.id)
      .single()
    profile = data
  } catch {
    // Allow through if profile fetch fails — client will handle
    return NextResponse.next()
  }

  if (!profile) {
    const onboardUrl = new URL(`https://login.${rootDomain}/onboarding/personal`)
    return NextResponse.redirect(onboardUrl)
  }

  const needsOnboarding =
    !profile.onboarding_complete &&
    !profile.onboarding_skipped

  if (needsOnboarding && pathname !== '/onboarding/personal') {
    const onboardUrl = new URL(`https://login.${rootDomain}/onboarding/personal`)
    return NextResponse.redirect(onboardUrl)
  }

  // ── HUB SUBDOMAIN: contestant dashboard ──────────────
  if (subdomain === 'hub') {
    // hub.zedideaarena.com/xxx → /dashboard/xxx
    url.pathname = pathname === '/' ? '/dashboard' : `/dashboard${pathname}`
    return NextResponse.rewrite(url)
  }

  // ── VOTE SUBDOMAIN: voter portal ─────────────────────
  if (subdomain === 'vote') {
    if (!profile.is_verified) {
      const hubUrl = new URL(`https://hub.${rootDomain}?msg=verification_required`)
      return NextResponse.redirect(hubUrl)
    }
    // vote.zedideaarena.com/xxx → /voter/xxx
    url.pathname = pathname === '/' ? '/voter' : `/voter${pathname}`
    return NextResponse.rewrite(url)
  }

  // ── ADMIN SUBDOMAIN ───────────────────────────────────
  if (subdomain === 'admin') {
    if (!profile.is_admin) {
      const hubUrl = new URL(`https://hub.${rootDomain}`)
      return NextResponse.redirect(hubUrl)
    }
    // admin.zedideaarena.com/xxx → /admin/xxx
    url.pathname = pathname === '/' ? '/admin' : `/admin${pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)',
  ],
}
