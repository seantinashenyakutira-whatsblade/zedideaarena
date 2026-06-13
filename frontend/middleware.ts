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

function isProtectedRoute(pathname: string): 'dashboard' | 'vote' | 'admin' | null {
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/vote')) return 'vote'
  if (pathname.startsWith('/admin')) return 'admin'
  return null
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Always allow static files, API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Landing page — redirect to arena if logged in (skip for PWA)
  if (pathname === '/') {
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
    try {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        return NextResponse.redirect(new URL('/arena', request.url))
      }
    } catch {}
    return res
  }

  // Other public routes — no auth needed
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const protectedArea = isProtectedRoute(pathname)
  if (!protectedArea) {
    // Unknown route — let it through (will 404 naturally)
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

  // Not logged in → send to login
  if (!session) {
    const loginUrl = new URL('/auth/login', request.url)
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
    const onboardUrl = new URL('/onboarding/personal', request.url)
    return NextResponse.redirect(onboardUrl)
  }

  // Admin route — admin role required
  if (protectedArea === 'admin' && !profile?.is_admin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Vote route — verification required
  if (protectedArea === 'vote' && !profile?.is_verified) {
    return NextResponse.redirect(new URL('/dashboard?msg=verification_required', request.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
}
