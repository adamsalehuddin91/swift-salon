import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if this is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For demo purposes, we'll use a simple session check
    // In production, you would use proper authentication
    const session = request.cookies.get('admin-session')

    // Allow access if session exists or if it's the login page
    if (!session && !request.nextUrl.pathname.includes('/login')) {
      // Redirect to login page
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

      const session = request.cookies.get('admin-session')

      if (!session) {
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
