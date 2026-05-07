import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token') || request.headers.get('Authorization')
  
  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Note: Since localStorage is used on the client for Firebase tokens, 
    // real middleware protection often requires setting a cookie.
    // For now, if no auth header/cookie is present in server side, 
    // we let the client side `ProtectedRoute.tsx` handle it, 
    // but we can add basic cookie checks here if implemented later.
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
