import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Simple demo authentication
    // In production, use proper password hashing and user management
    const validCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'owner', password: 'salon123' },
      { username: 'manager', password: 'manage123' }
    ]

    const isValid = validCredentials.some(
      cred => cred.username === username && cred.password === password
    )

    if (!isValid) {
      return NextResponse.json(
        { message: 'Username atau password tidak betul' },
        { status: 401 }
      )
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('admin-session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return NextResponse.json({
      success: true,
      message: 'Login berjaya',
      user: { username }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Ralat server. Sila cuba lagi.' },
      { status: 500 }
    )
  }
}