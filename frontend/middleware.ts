import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPaths = ['/dashboard', '/contestant', '/voter', '/admin']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const path = request.nextUrl.pathname

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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, is_verified, onboarding_complete')
    .eq('id', session.user.id)
    .single()

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

  if (!profile.onboarding_complete && !path.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding/personal', request.url))
  }

  if (profile.onboarding_complete && path.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/contestant/:path*', '/voter/:path*', '/admin/:path*', '/onboarding/:path*', '/onboarding'],
}
