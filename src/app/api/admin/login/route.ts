import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    try {
      const body = await request.json()
      // Handle both email and username fields
      const { email, username } = body
      const loginField = email || username // Use email if provided, otherwise username

      console.log('Login attempt with:', loginField)

      // Simple demo authentication - just check if email/username is valid (no password needed)
      const validLogins = [
        'admin',
        'admin@swiftsalon.my',
        'owner',
        'owner@swiftsalon.my',
        'manager',
        'manager@swiftsalon.my'
      ]

      const isValid = validLogins.includes(loginField)

      if (!isValid) {
        return NextResponse.json(
          { message: 'Email atau username tidak betul' },
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
