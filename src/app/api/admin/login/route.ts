import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
    try {
      const body = await request.json()
      const { email, password } = body

      console.log('Login attempt with:', email)

      if (!email || !password) {
        return NextResponse.json(
          { message: 'Email dan password diperlukan' },
          { status: 400 }
        )
      }

      // Find user in database
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return NextResponse.json(
          { message: 'Email atau password tidak betul' },
          { status: 401 }
        )
      }

      // Check if user is admin
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { message: 'Akses ditolak. Admin sahaja.' },
          { status: 403 }
        )
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password!)

      if (!passwordMatch) {
        return NextResponse.json(
          { message: 'Email atau password tidak betul' },
          { status: 401 }
        )
      }

      // Set session cookie
      const cookieStore = await cookies()
      cookieStore.set('admin-session', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
      })

      return NextResponse.json({
        success: true,
        message: 'Login berjaya',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    } catch (error) {
      console.error('Login error:', error)
      return NextResponse.json(
        { message: 'Ralat server. Sila cuba lagi.' },
        { status: 500 }
      )
    }
  }
