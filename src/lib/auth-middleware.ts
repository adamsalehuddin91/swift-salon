// Authentication middleware utility for API routes
import { NextRequest } from 'next/server'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
}

export function validateAdminSession(request: NextRequest): { valid: boolean; user?: any } {
  try {
    const sessionCookie = request.cookies.get('admin-session')

    if (!sessionCookie) {
      return { valid: false }
    }

    const sessionData = JSON.parse(sessionCookie.value)

    // Validate required fields
    if (!sessionData.id || !sessionData.email || !sessionData.role) {
      return { valid: false }
    }

    // Check if session is still valid (24 hours)
    const sessionAge = Date.now() - (sessionData.timestamp || 0)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

    if (sessionAge > maxAge) {
      return { valid: false }
    }

    // Validate admin role
    if (sessionData.role !== 'ADMIN') {
      return { valid: false }
    }

    return {
      valid: true,
      user: {
        id: sessionData.id,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role
      }
    }
  } catch {
    return { valid: false }
  }
}

export function requireAdminAuth(handler: (request: AuthenticatedRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const auth = validateAdminSession(request)

    if (!auth.valid) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = auth.user

    return handler(authenticatedRequest)
  }
}