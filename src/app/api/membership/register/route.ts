import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { name, phone, email, password, membershipType, customerId } = body

    let hashedPassword = null

    // Only require password for non-logged-in customers
    if (!session?.user?.id && !customerId) {
      if (!password || password.length < 6) {
        return NextResponse.json(
          { error: 'Kata laluan mesti sekurang-kurangnya 6 aksara.' },
          { status: 400 }
        )
      }
      hashedPassword = await bcrypt.hash(password, 10)
    } else if (password && password.length >= 6) {
      // Hash password if provided and valid
      hashedPassword = await bcrypt.hash(password, 10)
    }

    let customer
    const targetCustomerId = session?.user?.id || customerId

    if (targetCustomerId) {
      // Existing logged-in customer - upgrade membership
      customer = await prisma.customer.findUnique({
        where: { id: targetCustomerId },
        include: { memberships: true }
      })

      if (!customer) {
        return NextResponse.json(
          { error: 'Pelanggan tidak dijumpai.' },
          { status: 404 }
        )
      }

      // Check if customer already has an active membership of same type
      const existingMembership = customer.memberships.find(
        m => m.type === membershipType && m.isActive
      )

      if (existingMembership) {
        return NextResponse.json(
          { error: 'Anda sudah mempunyai keahlian jenis ini.' },
          { status: 400 }
        )
      }

      // Update customer to mark as member
      customer = await prisma.customer.update({
        where: { id: targetCustomerId },
        data: { isMember: true }
      })
    } else {
      // New customer registration
      // Check if customer already exists by phone or email
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          OR: [
            { phone },
            { email }
          ]
        }
      })

      if (existingCustomer) {
        return NextResponse.json(
          { error: 'No. telefon atau email ini telah didaftarkan. Sila log masuk untuk menaik taraf keahlian.' },
          { status: 400 }
        )
      }

      // Create new customer as member
      customer = await prisma.customer.create({
        data: {
          name,
          phone,
          email,
          password: hashedPassword!,
          isMember: true,
          totalPoints: 0
        }
      })
    }

    // Create membership record
    const membership = await prisma.membership.create({
      data: {
        customerId: customer.id,
        type: membershipType,
        startDate: new Date(),
        endDate: membershipType === 'BASIC' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year for paid memberships
        isActive: true
      }
    })

    // Add welcome bonus points for new members
    const welcomePoints = membershipType === 'BASIC' ? 10 :
                         membershipType === 'SILVER' ? 25 :
                         membershipType === 'GOLD' ? 50 : 100

    if (welcomePoints > 0) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          totalPoints: {
            increment: welcomePoints
          }
        }
      })

      // Create point history for welcome bonus
      await prisma.pointHistory.create({
        data: {
          customerId: customer.id,
          points: welcomePoints,
          type: 'EARNED',
          reason: `Welcome bonus - ${membershipType} membership`,
          expiresAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months
        }
      })
    }

    return NextResponse.json({
      success: true,
      customer,
      membership,
      welcomePoints
    })
  } catch (error) {
    console.error('Error registering membership:', error)

    // Handle duplicate phone number
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'No. telefon ini telah didaftarkan. Sila gunakan no. telefon lain.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Gagal mendaftar keahlian. Sila cuba lagi.' },
      { status: 500 }
    )
  }
}