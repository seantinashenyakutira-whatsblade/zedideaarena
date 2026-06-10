import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const path = request.nextUrl.pathname

  // Bypass middleware on auth callback — session may not be ready
  if (path.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  // If session is loading or errored, let the client page handle it
  if (sessionError || !session) {
    if (path.startsWith('/auth/')) return NextResponse.next()
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  // Skip profile check for auth pages
  if (path.startsWith('/auth/')) return NextResponse.next()

  let profile = null
  let profileError = null

  try {
    const result = await supabase
      .from('users')
      .select('is_admin, is_verified, onboarding_complete, onboarding_skipped, full_name, city')
      .eq('id', session.user.id)
      .single()
    profile = result.data
    profileError = result.error
  } catch (err) {
    console.error('Middleware profile fetch error:', err)
    profileError = err as any
  }

  if (profileError) {
    console.error('Profile query failed in middleware:', (profileError as any)?.message || profileError)
    return NextResponse.next()
  }

  if (!profile) {
    if (!path.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding/personal', request.url))
    }
    return response
  }

  if (path.startsWith('/admin') && !profile.is_admin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (path.startsWith('/voter') && !profile.is_verified) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const hasCompletedOnboarding =
    profile.onboarding_complete === true ||
    profile.onboarding_skipped === true ||
    (profile.full_name && profile.full_name !== 'New Innovator' && profile.city)

  if (!hasCompletedOnboarding && !path.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding/personal', request.url))
  }

  if (hasCompletedOnboarding && path.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/contestant/:path*', '/voter/:path*', '/admin/:path*', '/onboarding/:path*', '/onboarding'],
}
