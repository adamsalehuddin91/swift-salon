import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, membershipType } = body

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone }
    })

    let customer

    if (existingCustomer) {
      // Update existing customer to be a member
      customer = await prisma.customer.update({
        where: { phone },
        data: {
          name,
          email,
          isMember: true
        }
      })
    } else {
      // Create new customer as member
      customer = await prisma.customer.create({
        data: {
          name,
          phone,
          email,
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