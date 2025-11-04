import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function validateSessionCookie(sessionValue: string): boolean {
  try {
    const sessionData = JSON.parse(sessionValue)

    // Validate required fields
    if (!sessionData.id || !sessionData.email || !sessionData.role) {
      return false
    }

    // Check if session is still valid (24 hours)
    const sessionAge = Date.now() - (sessionData.timestamp || 0)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

    if (sessionAge > maxAge) {
      return false
    }

    // Validate admin role for admin routes
    return sessionData.role === 'ADMIN'
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  // Check if this is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('admin-session')

    // Allow access to login page without session
    if (request.nextUrl.pathname.includes('/login')) {
      return NextResponse.next()
    }

    // Validate session
    if (!sessionCookie || !validateSessionCookie(sessionCookie.value)) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Check if this is an API admin route
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Allow login endpoint without session check
    if (request.nextUrl.pathname === '/api/admin/login') {
      return NextResponse.next()
    }

    const sessionCookie = request.cookies.get('admin-session')

    if (!sessionCookie || !validateSessionCookie(sessionCookie.value)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }
  }

    

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/dashboard/:path*',
    '/api/settings/:path*'
  ]
}
