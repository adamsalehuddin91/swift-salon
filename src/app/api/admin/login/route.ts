import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    try {
      const body = await request.json()
      // Handle both email and username fields
      const { email, username, password } = body
      const loginField = email || username // Use email if provided, otherwise username

      console.log('Login attempt with:', loginField, password)

      // Simple demo authentication with email support
      const validCredentials = [
        { login: 'admin', password: 'admin123' },
        { login: 'admin@swiftsalon.my', password: 'admin123' },
        { login: 'owner', password: 'salon123' },
        { login: 'owner@swiftsalon.my', password: 'salon123' },
        { login: 'manager', password: 'manage123' },
        { login: 'manager@swiftsalon.my', password: 'manage123' }
      ]

      const isValid = validCredentials.some(
        cred => cred.login === loginField && cred.password === password
      )

      if (!isValid) {
        return NextResponse.json(
          { message: 'Email atau password tidak betul' },
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
        user: { email: loginField }
      })
    } catch (error) {
      console.error('Login error:', error)
      return NextResponse.json(
        { message: 'Ralat server. Sila cuba lagi.' },
        { status: 500 }
      )
    }
  }
